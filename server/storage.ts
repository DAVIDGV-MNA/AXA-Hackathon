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

// Environment variable validation
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL environment variable is required");
}

// Initialize database connection
const client = neon(databaseUrl);
const db = drizzle(client);

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
  getDocumentChunks(documentId: string): Promise<DocumentChunk[]>;
  searchDocumentChunks(query: string, limit?: number): Promise<DocumentChunk[]>;
  
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

export const storage = new DatabaseStorage();
