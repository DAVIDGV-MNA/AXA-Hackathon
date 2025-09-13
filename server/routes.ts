import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import { insertDocumentSchema, insertChatSessionSchema, insertChatMessageSchema, insertUserSchema } from "@shared/schema";
import { ZodError } from "zod";

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

      // Store chunks
      for (const chunk of chunks) {
        await storage.createDocumentChunk(chunk);
      }

      res.json({ document, chunksCreated: chunks.length });
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

  // Search documents
  app.post("/api/search", async (req, res) => {
    try {
      const { query } = req.body;
      if (!query || typeof query !== 'string' || query.trim().length === 0) {
        return res.status(400).json({ error: "Valid query string is required" });
      }

      const chunks = await storage.searchDocumentChunks(query.trim(), 5);
      
      // Get document details for each chunk
      const results = await Promise.all(
        chunks.map(async (chunk) => {
          const document = await storage.getDocument(chunk.documentId);
          return {
            chunk,
            document,
          };
        })
      );

      res.json(results);
    } catch (error) {
      return handleError(error, res, "search documents");
    }
  });

  // Generate response (mock for now - would integrate with actual AI service)
  app.post("/api/generate", async (req, res) => {
    try {
      const { prompt, context, agentType } = req.body;
      
      if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
        return res.status(400).json({ error: "Valid prompt is required" });
      }
      
      if (!agentType || !['document-search', 'document-creator'].includes(agentType)) {
        return res.status(400).json({ error: "Valid agentType is required (document-search or document-creator)" });
      }
      
      // Mock AI response based on agent type
      let response = "";
      if (agentType === "document-search") {
        response = `Based on your documents, here's what I found regarding "${prompt}":\n\n`;
        if (context && Array.isArray(context) && context.length > 0) {
          response += context.map((item: any, index: number) => 
            `**${item.document?.title || 'Document'}** (${item.document?.type})\n${item.chunk.content.substring(0, 200)}...`
          ).join('\n\n');
        } else {
          response += "I couldn't find specific information about this topic in your uploaded documents. Please try a different search term or upload more relevant documents.";
        }
      } else if (agentType === "document-creator") {
        response = `I'll help you create a document about "${prompt}". Here's a draft structure:\n\n**Document Title:** ${prompt}\n\n**1. Overview**\n[Introduction and purpose]\n\n**2. Key Points**\n[Main content sections]\n\n**3. Guidelines**\n[Specific requirements or procedures]\n\n**4. Implementation**\n[Action items and next steps]\n\nWould you like me to expand on any particular section?`;
      }

      res.json({ response });
    } catch (error) {
      return handleError(error, res, "generate response");
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
