import { 
  type User, 
  type InsertUser, 
  type Document, 
  type InsertDocument,
  type DocumentChunk,
  type InsertDocumentChunk,
  type ChatSession,
  type InsertChatSession,
  type ChatMessage,
  type InsertChatMessage,
  users,
  documents,
  documentChunks,
  chatSessions,
  chatMessages
} from "@shared/schema";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { eq, desc, sql } from "drizzle-orm";
import * as bcrypt from "bcryptjs";
// === PENDING: Vector Database Operations ===  
// TODO: Implement vector database functionality
import { generateEmbedding, generateBatchEmbeddings } from "./openai";

// === PENDING: Database Operations ===
// Using in-memory storage for now to avoid DATABASE_URL requirement
// TODO: Enable database connection when ready

// Conditional database initialization
let db: any = null;
let useDatabaseStorage = false;

try {
  const databaseUrl = process.env.DATABASE_URL;
  if (databaseUrl) {
    const client = neon(databaseUrl);
    db = drizzle(client);
    useDatabaseStorage = true;
    console.log("Database connection available, using DatabaseStorage");
  } else {
    console.log("No DATABASE_URL provided, will use MemStorage as fallback");
  }
} catch (error) {
  console.log("Database connection failed, will use MemStorage as fallback:", error);
}

// Utility functions for password handling
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  return await bcrypt.compare(password, hash);
};

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  authenticateUser(username: string, password: string): Promise<User | null>;
  
  // Document operations
  createDocument(document: InsertDocument): Promise<Document>;
  getDocuments(userId?: string): Promise<Document[]>;
  getDocument(id: string): Promise<Document | undefined>;
  deleteDocument(id: string): Promise<void>;
  
  // Document chunk operations
  createDocumentChunk(chunk: InsertDocumentChunk): Promise<DocumentChunk>;
  createDocumentChunksWithEmbeddings(chunks: InsertDocumentChunk[]): Promise<DocumentChunk[]>;
  getDocumentChunks(documentId: string): Promise<DocumentChunk[]>;
  searchDocumentChunks(query: string, limit?: number): Promise<DocumentChunk[]>;
  searchDocumentChunksByVector(queryEmbedding: number[], limit?: number): Promise<Array<DocumentChunk & { similarity: number; document?: Document }>>;
  
  // Chat session operations
  createChatSession(session: InsertChatSession): Promise<ChatSession>;
  getChatSessions(userId?: string): Promise<ChatSession[]>;
  getChatSession(id: string): Promise<ChatSession | undefined>;
  deleteChatSession(id: string): Promise<void>;
  updateChatSessionTimestamp(id: string): Promise<void>;
  
  // Chat message operations
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  getChatMessages(sessionId: string): Promise<ChatMessage[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    // Hash the password before storing
    const hashedPassword = await hashPassword(insertUser.password);
    const result = await db.insert(users).values({
      ...insertUser,
      password: hashedPassword
    }).returning();
    return result[0];
  }

  async authenticateUser(username: string, password: string): Promise<User | null> {
    const user = await this.getUserByUsername(username);
    if (!user) {
      return null;
    }
    
    const isValid = await verifyPassword(password, user.password);
    return isValid ? user : null;
  }

  // Document operations
  async createDocument(insertDocument: InsertDocument): Promise<Document> {
    const result = await db.insert(documents).values(insertDocument).returning();
    return result[0];
  }

  async getDocuments(userId?: string): Promise<Document[]> {
    if (userId) {
      return await db.select().from(documents).where(eq(documents.userId, userId)).orderBy(desc(documents.uploadedAt));
    }
    return await db.select().from(documents).orderBy(desc(documents.uploadedAt));
  }

  async getDocument(id: string): Promise<Document | undefined> {
    const result = await db.select().from(documents).where(eq(documents.id, id)).limit(1);
    return result[0];
  }

  async deleteDocument(id: string): Promise<void> {
    // Delete chunks first due to foreign key constraint
    await db.delete(documentChunks).where(eq(documentChunks.documentId, id));
    await db.delete(documents).where(eq(documents.id, id));
  }

  // Document chunk operations
  async createDocumentChunk(insertChunk: InsertDocumentChunk): Promise<DocumentChunk> {
    const result = await db.insert(documentChunks).values(insertChunk).returning();
    return result[0];
  }

  // PENDING: Vector database operation - embeddings generation
  async createDocumentChunksWithEmbeddings(chunks: InsertDocumentChunk[]): Promise<DocumentChunk[]> {
    if (chunks.length === 0) return [];

    // Extract texts for embedding generation
    const texts = chunks.map(chunk => chunk.content);
    
    try {
      // Generate embeddings for all chunks
      const embeddings = await generateBatchEmbeddings(texts);
      
      // Combine chunks with their embeddings
      const chunksWithEmbeddings = chunks.map((chunk, index) => ({
        ...chunk,
        embedding: embeddings[index].embedding
      }));

      // Insert all chunks with embeddings
      const result = await db.insert(documentChunks).values(chunksWithEmbeddings).returning();
      return result;
    } catch (error) {
      console.error("Error creating chunks with embeddings:", error);
      // Fallback: create chunks without embeddings
      const result = await db.insert(documentChunks).values(chunks).returning();
      return result;
    }
  }

  async getDocumentChunks(documentId: string): Promise<DocumentChunk[]> {
    return await db.select().from(documentChunks)
      .where(eq(documentChunks.documentId, documentId))
      .orderBy(documentChunks.chunkIndex);
  }

  async searchDocumentChunks(query: string, limit = 5): Promise<DocumentChunk[]> {
    // For now, use simple text search. In production, you'd use vector similarity
    return await db.select().from(documentChunks)
      .where(sql`${documentChunks.content} ILIKE ${`%${query}%`}`)
      .limit(limit);
  }

  // PENDING: Vector database operation - similarity search
  async searchDocumentChunksByVector(queryEmbedding: number[], limit = 5): Promise<Array<DocumentChunk & { similarity: number; document?: Document }>> {
    try {
      // Use pgvector's cosine similarity for semantic search with JOIN to avoid N+1 queries
      const result = await db.execute(sql`
        SELECT 
          dc.id,
          dc.document_id,
          dc.content,
          dc.chunk_index,
          dc.embedding,
          1 - (dc.embedding <=> ${JSON.stringify(queryEmbedding)}::vector) as similarity,
          d.title as document_title,
          d.type as document_type,
          d.file_name as document_file_name,
          d.uploaded_at as document_uploaded_at,
          d.user_id as document_user_id
        FROM document_chunks dc
        INNER JOIN documents d ON dc.document_id = d.id
        WHERE dc.embedding IS NOT NULL
        ORDER BY dc.embedding <=> ${JSON.stringify(queryEmbedding)}::vector
        LIMIT ${limit}
      `);

      return result.rows.map((row: any) => ({
        id: row.id,
        documentId: row.document_id,
        content: row.content,
        chunkIndex: row.chunk_index,
        embedding: row.embedding,
        similarity: parseFloat(row.similarity),
        document: {
          id: row.document_id,
          title: row.document_title,
          type: row.document_type,
          fileName: row.document_file_name,
          uploadedAt: row.document_uploaded_at,
          userId: row.document_user_id,
          content: "" // Not needed for search results
        }
      }));
    } catch (error) {
      console.error("Vector search error:", error);
      // Fallback to text search with document info
      const chunks = await this.searchDocumentChunks(queryEmbedding.toString(), limit);
      const results = await Promise.all(
        chunks.map(async (chunk) => {
          const document = await this.getDocument(chunk.documentId);
          return {
            ...chunk,
            similarity: 0.5, // Default similarity score
            document
          };
        })
      );
      return results;
    }
  }

  // Chat session operations
  async createChatSession(insertSession: InsertChatSession): Promise<ChatSession> {
    const result = await db.insert(chatSessions).values(insertSession).returning();
    return result[0];
  }

  async getChatSessions(userId?: string): Promise<ChatSession[]> {
    if (userId) {
      return await db.select().from(chatSessions)
        .where(eq(chatSessions.userId, userId))
        .orderBy(desc(chatSessions.updatedAt));
    }
    return await db.select().from(chatSessions).orderBy(desc(chatSessions.updatedAt));
  }

  async getChatSession(id: string): Promise<ChatSession | undefined> {
    const result = await db.select().from(chatSessions).where(eq(chatSessions.id, id)).limit(1);
    return result[0];
  }

  async deleteChatSession(id: string): Promise<void> {
    // Delete messages first due to foreign key constraint
    await db.delete(chatMessages).where(eq(chatMessages.sessionId, id));
    await db.delete(chatSessions).where(eq(chatSessions.id, id));
  }

  async updateChatSessionTimestamp(id: string): Promise<void> {
    await db.update(chatSessions)
      .set({ updatedAt: sql`now()` })
      .where(eq(chatSessions.id, id));
  }

  // Chat message operations
  async createChatMessage(insertMessage: InsertChatMessage): Promise<ChatMessage> {
    // Create the message and update session timestamp in a transaction
    const result = await db.transaction(async (tx) => {
      const message = await tx.insert(chatMessages).values(insertMessage).returning();
      await tx.update(chatSessions)
        .set({ updatedAt: sql`now()` })
        .where(eq(chatSessions.id, insertMessage.sessionId));
      return message[0];
    });
    return result;
  }

  async getChatMessages(sessionId: string): Promise<ChatMessage[]> {
    return await db.select().from(chatMessages)
      .where(eq(chatMessages.sessionId, sessionId))
      .orderBy(chatMessages.timestamp);
  }
}

// === CONDITIONAL STORAGE SELECTION ===
// Import memory storage as fallback
import { MemStorage } from "./memStorage";

// Use appropriate storage based on availability
export const storage = useDatabaseStorage && db ? new DatabaseStorage() : new MemStorage();

console.log("Using storage:", storage.constructor.name);
