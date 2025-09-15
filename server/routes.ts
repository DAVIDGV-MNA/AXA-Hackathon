import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import { insertDocumentSchema, insertChatSessionSchema, insertChatMessageSchema, insertUserSchema } from "@shared/schema";
import { ZodError } from "zod";
import { generateEmbedding, generateChatResponse } from "./openai";

// Configure multer for file uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Error handling utilities
const handleError = (error: unknown, res: any, operation: string) => {
  console.error(`Error in ${operation}:`, error);
  
  if (error instanceof ZodError) {
    const messages = error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
    return res.status(400).json({ 
      error: "Validation failed", 
      details: messages 
    });
  }
  
  if (error instanceof Error) {
    // Check for common database constraint errors
    if (error.message.includes('duplicate key') || error.message.includes('unique constraint')) {
      return res.status(409).json({ error: "Resource already exists" });
    }
    if (error.message.includes('foreign key') || error.message.includes('not found')) {
      return res.status(404).json({ error: "Referenced resource not found" });
    }
  }
  
  return res.status(500).json({ error: `Failed to ${operation}` });
};

export async function registerRoutes(app: Express): Promise<Server> {
  // User authentication routes
  app.post("/api/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      // Don't return password in response
      const { password, ...userResponse } = user;
      res.status(201).json(userResponse);
    } catch (error) {
      return handleError(error, res, "register user");
    }
  });

  app.post("/api/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required" });
      }
      
      const user = await storage.authenticateUser(username, password);
      if (!user) {
        return res.status(401).json({ error: "Invalid username or password" });
      }
      
      // Don't return password in response
      const { password: _, ...userResponse } = user;
      res.json(userResponse);
    } catch (error) {
      return handleError(error, res, "authenticate user");
    }
  });

  // Document routes
  app.get("/api/documents", async (req, res) => {
    try {
      const documents = await storage.getDocuments();
      res.json(documents);
    } catch (error) {
      return handleError(error, res, "fetch documents");
    }
  });

  app.post("/api/documents/upload", upload.single("file"), async (req, res) => {
    try {
      const file = req.file;
      const { type } = req.body;

      if (!file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      if (!type || !["politics", "operations", "manual"].includes(type)) {
        return res.status(400).json({ error: "Invalid document type" });
      }

      let content = "";
      
      // Extract text based on file type
      if (file.mimetype === "text/plain") {
        content = file.buffer.toString("utf-8");
      } else if (file.mimetype === "application/pdf") {
        // For now, just return an error for PDFs - we'll add PDF support later
        return res.status(400).json({ error: "PDF support coming soon. Please upload TXT files for now." });
      } else {
        return res.status(400).json({ error: "Unsupported file type. Please upload TXT files." });
      }

      // Validate and create document
      const documentData = insertDocumentSchema.parse({
        title: file.originalname.replace(/\.[^/.]+$/, ""), // Remove file extension
        content,
        type,
        fileName: file.originalname,
      });

      const document = await storage.createDocument(documentData);

      // Create chunks for the document (simple text splitting)
      const chunkSize = 1000;
      const overlap = 200;
      const chunks = [];
      
      for (let i = 0; i < content.length; i += chunkSize - overlap) {
        const chunkContent = content.slice(i, i + chunkSize);
        if (chunkContent.trim()) {
          chunks.push({
            documentId: document.id,
            content: chunkContent,
            chunkIndex: Math.floor(i / (chunkSize - overlap)),
          });
        }
      }

      // Store chunks with embeddings
      const createdChunks = await storage.createDocumentChunksWithEmbeddings(chunks);

      res.json({ document, chunksCreated: createdChunks.length });
    } catch (error) {
      console.error("Error uploading document:", error);
      res.status(500).json({ error: "Failed to upload document" });
    }
  });

  app.delete("/api/documents/:id", async (req, res) => {
    try {
      await storage.deleteDocument(req.params.id);
      res.json({ success: true });
    } catch (error) {
      return handleError(error, res, "delete document");
    }
  });

  // Chat session routes
  app.get("/api/chat-sessions", async (req, res) => {
    try {
      const sessions = await storage.getChatSessions();
      res.json(sessions);
    } catch (error) {
      return handleError(error, res, "fetch chat sessions");
    }
  });

  app.post("/api/chat-sessions", async (req, res) => {
    try {
      const sessionData = insertChatSessionSchema.parse(req.body);
      const session = await storage.createChatSession(sessionData);
      res.status(201).json(session);
    } catch (error) {
      return handleError(error, res, "create chat session");
    }
  });

  app.get("/api/chat-sessions/:id/messages", async (req, res) => {
    try {
      const messages = await storage.getChatMessages(req.params.id);
      res.json(messages);
    } catch (error) {
      return handleError(error, res, "fetch messages");
    }
  });

  app.post("/api/chat-sessions/:id/messages", async (req, res) => {
    try {
      const messageData = insertChatMessageSchema.parse({
        ...req.body,
        sessionId: req.params.id,
      });
      const message = await storage.createChatMessage(messageData);
      res.status(201).json(message);
    } catch (error) {
      return handleError(error, res, "create message");
    }
  });

  // === PENDING: AI-powered search ===
  // TODO: Implement vector similarity search
  app.post("/api/search", async (req, res) => {
    try {
      const { query } = req.body;
      if (!query || typeof query !== 'string' || query.trim().length === 0) {
        return res.status(400).json({ error: "Valid query string is required" });
      }

      let results = [];
      
      try {
        // Generate embedding for the query and use vector search
        const queryEmbedding = await generateEmbedding(query.trim());
        const chunks = await storage.searchDocumentChunksByVector(queryEmbedding.embedding, 5);
        
        // Vector search returns document info included
        results = chunks.map((chunk) => ({
          chunk: {
            id: chunk.id,
            documentId: chunk.documentId,
            content: chunk.content,
            chunkIndex: chunk.chunkIndex,
            embedding: chunk.embedding
          },
          document: chunk.document,
        }));
      } catch (error) {
        console.warn("Vector search failed, falling back to text search:", error);
        
        // Fallback to text search if embedding generation fails
        const chunks = await storage.searchDocumentChunks(query.trim(), 5);
        
        // For text search fallback, need to fetch document details
        results = await Promise.all(
          chunks.map(async (chunk) => {
            const document = await storage.getDocument(chunk.documentId);
            return {
              chunk,
              document,
            };
          })
        );
      }

      res.json(results);
    } catch (error) {
      return handleError(error, res, "search documents");
    }
  });

  // === PENDING: AI response generation ===
  // TODO: Implement OpenAI chat completion
  app.post("/api/generate", async (req, res) => {
    try {
      const { prompt, context, agentType } = req.body;
      
      if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
        return res.status(400).json({ error: "Valid prompt is required" });
      }
      
      if (!agentType || !['document-search', 'document-creator'].includes(agentType)) {
        return res.status(400).json({ error: "Valid agentType is required (document-search or document-creator)" });
      }
      
      // Build context string from search results
      let contextString = "";
      if (context && Array.isArray(context) && context.length > 0) {
        contextString = context.map((item: any) => 
          `Document: ${item.document?.title || 'Unknown'} (${item.document?.type})\nContent: ${item.chunk.content}`
        ).join('\n\n---\n\n');
      }
      
      // Generate AI response using OpenAI
      const response = await generateChatResponse(prompt, contextString, agentType);

      res.json({ response });
    } catch (error) {
      return handleError(error, res, "generate response");
    }
  });

  // Save generated document
  app.post("/api/documents/save", async (req, res) => {
    try {
      const { title, content, type } = req.body;
      
      if (!title || typeof title !== 'string' || title.trim().length === 0) {
        return res.status(400).json({ error: "Valid title is required" });
      }
      
      if (!content || typeof content !== 'string' || content.trim().length === 0) {
        return res.status(400).json({ error: "Valid content is required" });
      }
      
      if (!type || !["politics", "operations", "manual"].includes(type)) {
        return res.status(400).json({ error: "Valid document type is required (politics, operations, or manual)" });
      }

      // Validate and create document
      const documentData = insertDocumentSchema.parse({
        title: title.trim(),
        content: content.trim(),
        type,
        fileName: `${title.trim().replace(/[^a-zA-Z0-9]/g, '_')}.md`, // Generate filename from title
      });

      const document = await storage.createDocument(documentData);

      // Create chunks for the generated document for future searching
      const chunkSize = 1000;
      const overlap = 200;
      const chunks = [];
      
      for (let i = 0; i < content.length; i += chunkSize - overlap) {
        const chunkContent = content.slice(i, i + chunkSize);
        if (chunkContent.trim()) {
          chunks.push({
            documentId: document.id,
            content: chunkContent,
            chunkIndex: Math.floor(i / (chunkSize - overlap)),
          });
        }
      }

      // Store chunks with embeddings for future search
      let createdChunks = [];
      if (chunks.length > 0) {
        createdChunks = await storage.createDocumentChunksWithEmbeddings(chunks);
      }

      res.json({ 
        document, 
        chunksCreated: createdChunks.length,
        message: "Document saved successfully and is now searchable"
      });
    } catch (error) {
      return handleError(error, res, "save generated document");
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
