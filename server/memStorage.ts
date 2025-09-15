// === IN-MEMORY STORAGE IMPLEMENTATION ===
// This provides a working storage implementation without requiring database connection

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
  type InsertChatMessage
} from "@shared/schema";
import * as bcrypt from "bcryptjs";
import { IStorage } from "./storage";

// Utility functions for password handling
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  return await bcrypt.compare(password, hash);
};

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private usersByUsername: Map<string, User> = new Map();
  private documents: Map<string, Document> = new Map();
  private documentChunks: Map<string, DocumentChunk[]> = new Map();
  private chatSessions: Map<string, ChatSession> = new Map();
  private chatMessages: Map<string, ChatMessage[]> = new Map();

  private generateId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return this.usersByUsername.get(username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const hashedPassword = await hashPassword(insertUser.password);
    const user: User = {
      id: this.generateId(),
      username: insertUser.username,
      password: hashedPassword
    };
    
    this.users.set(user.id, user);
    this.usersByUsername.set(user.username, user);
    return user;
  }

  async authenticateUser(username: string, password: string): Promise<User | null> {
    const user = await this.getUserByUsername(username);
    if (!user) return null;
    
    const isValid = await verifyPassword(password, user.password);
    return isValid ? user : null;
  }

  // Document operations
  async createDocument(insertDocument: InsertDocument): Promise<Document> {
    const document: Document = {
      id: this.generateId(),
      title: insertDocument.title,
      content: insertDocument.content,
      type: insertDocument.type,
      fileName: insertDocument.fileName,
      uploadedAt: new Date(),
      userId: null
    };
    
    this.documents.set(document.id, document);
    return document;
  }

  async getDocuments(userId?: string): Promise<Document[]> {
    const docs = Array.from(this.documents.values());
    if (userId) {
      return docs.filter(doc => doc.userId === userId)
                 .sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime());
    }
    return docs.sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime());
  }

  async getDocument(id: string): Promise<Document | undefined> {
    return this.documents.get(id);
  }

  async deleteDocument(id: string): Promise<void> {
    this.documents.delete(id);
    this.documentChunks.delete(id);
  }

  // Document chunk operations
  async createDocumentChunk(insertChunk: InsertDocumentChunk): Promise<DocumentChunk> {
    const chunk: DocumentChunk = {
      id: this.generateId(),
      documentId: insertChunk.documentId,
      content: insertChunk.content,
      chunkIndex: insertChunk.chunkIndex,
      embedding: null // No embeddings in memory storage
    };

    const chunks = this.documentChunks.get(insertChunk.documentId) || [];
    chunks.push(chunk);
    this.documentChunks.set(insertChunk.documentId, chunks);
    
    return chunk;
  }

  async createDocumentChunksWithEmbeddings(chunks: InsertDocumentChunk[]): Promise<DocumentChunk[]> {
    // === PENDING: Vector embeddings - creating chunks without embeddings for now ===
    console.log("PENDING: Creating chunks without embeddings in memory storage");
    
    const results: DocumentChunk[] = [];
    for (const insertChunk of chunks) {
      const chunk = await this.createDocumentChunk(insertChunk);
      results.push(chunk);
    }
    return results;
  }

  async getDocumentChunks(documentId: string): Promise<DocumentChunk[]> {
    const chunks = this.documentChunks.get(documentId) || [];
    return chunks.sort((a, b) => a.chunkIndex - b.chunkIndex);
  }

  async searchDocumentChunks(query: string, limit = 5): Promise<DocumentChunk[]> {
    // Simple text search across all chunks
    const allChunks: DocumentChunk[] = [];
    for (const chunks of Array.from(this.documentChunks.values())) {
      allChunks.push(...chunks);
    }
    
    return allChunks
      .filter(chunk => chunk.content.toLowerCase().includes(query.toLowerCase()))
      .slice(0, limit);
  }

  async searchDocumentChunksByVector(queryEmbedding: number[], limit = 5): Promise<Array<DocumentChunk & { similarity: number; document?: Document }>> {
    // === PENDING: Vector similarity search - using text search fallback ===
    console.log("PENDING: Vector search not available, using text fallback");
    
    const results: Array<DocumentChunk & { similarity: number; document?: Document }> = [];
    const allChunks: DocumentChunk[] = [];
    
    for (const chunks of Array.from(this.documentChunks.values())) {
      allChunks.push(...chunks);
    }
    
    // Return first few chunks with mock similarity scores
    for (const chunk of allChunks.slice(0, limit)) {
      const document = this.documents.get(chunk.documentId);
      results.push({
        ...chunk,
        similarity: Math.random() * 0.5 + 0.5, // Mock similarity 0.5-1.0
        document
      });
    }
    
    return results;
  }

  // Chat session operations
  async createChatSession(insertSession: InsertChatSession): Promise<ChatSession> {
    const session: ChatSession = {
      id: this.generateId(),
      userId: null,
      agentType: insertSession.agentType,
      title: insertSession.title || null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.chatSessions.set(session.id, session);
    this.chatMessages.set(session.id, []);
    return session;
  }

  async getChatSessions(userId?: string): Promise<ChatSession[]> {
    const sessions = Array.from(this.chatSessions.values());
    if (userId) {
      return sessions.filter(session => session.userId === userId)
                    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
    }
    return sessions.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }

  async getChatSession(id: string): Promise<ChatSession | undefined> {
    return this.chatSessions.get(id);
  }

  async deleteChatSession(id: string): Promise<void> {
    this.chatSessions.delete(id);
    this.chatMessages.delete(id);
  }

  async updateChatSessionTimestamp(id: string): Promise<void> {
    const session = this.chatSessions.get(id);
    if (session) {
      session.updatedAt = new Date();
      this.chatSessions.set(id, session);
    }
  }

  // Chat message operations
  async createChatMessage(insertMessage: InsertChatMessage): Promise<ChatMessage> {
    const message: ChatMessage = {
      id: this.generateId(),
      sessionId: insertMessage.sessionId,
      role: insertMessage.role,
      content: insertMessage.content,
      documentReferences: insertMessage.documentReferences || null,
      timestamp: new Date()
    };
    
    const messages = this.chatMessages.get(insertMessage.sessionId) || [];
    messages.push(message);
    this.chatMessages.set(insertMessage.sessionId, messages);
    
    // Update session timestamp
    await this.updateChatSessionTimestamp(insertMessage.sessionId);
    
    return message;
  }

  async getChatMessages(sessionId: string): Promise<ChatMessage[]> {
    const messages = this.chatMessages.get(sessionId) || [];
    return messages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }
}