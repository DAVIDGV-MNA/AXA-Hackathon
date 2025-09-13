import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, vector } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const documents = pgTable("documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  content: text("content").notNull(),
  type: text("type").notNull(), // "politics", "operations", "manual"
  fileName: text("file_name").notNull(),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
  userId: varchar("user_id").references(() => users.id),
});

export const documentChunks = pgTable("document_chunks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  documentId: varchar("document_id").references(() => documents.id).notNull(),
  content: text("content").notNull(),
  chunkIndex: integer("chunk_index").notNull(),
  embedding: vector("embedding", { dimensions: 384 }), // For sentence-transformers
});

export const chatSessions = pgTable("chat_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  agentType: text("agent_type").notNull(), // "document-search" or "document-creator"
  title: text("title"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const chatMessages = pgTable("chat_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").references(() => chatSessions.id).notNull(),
  role: text("role").notNull(), // "user" or "assistant"
  content: text("content").notNull(),
  documentReferences: text("document_references"), // JSON array of document references
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
}).extend({
  password: z.string().min(8, "Password must be at least 8 characters").max(100, "Password too long"),
  username: z.string().min(3, "Username must be at least 3 characters").max(30, "Username too long").regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores")
});

export const insertDocumentSchema = createInsertSchema(documents).pick({
  title: true,
  content: true,
  type: true,
  fileName: true,
}).extend({
  type: z.enum(["politics", "operations", "manual"], {
    errorMap: () => ({ message: "Type must be one of: politics, operations, manual" })
  })
});

export const insertDocumentChunkSchema = createInsertSchema(documentChunks).pick({
  documentId: true,
  content: true,
  chunkIndex: true,
});

export const insertChatSessionSchema = createInsertSchema(chatSessions).pick({
  agentType: true,
  title: true,
}).extend({
  agentType: z.enum(["document-search", "document-creator"], {
    errorMap: () => ({ message: "Agent type must be either 'document-search' or 'document-creator'" })
  })
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).pick({
  sessionId: true,
  role: true,
  content: true,
  documentReferences: true,
}).extend({
  role: z.enum(["user", "assistant"], {
    errorMap: () => ({ message: "Role must be either 'user' or 'assistant'" })
  }),
  content: z.string().min(1, "Message content cannot be empty").max(50000, "Message content too long")
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Document = typeof documents.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type DocumentChunk = typeof documentChunks.$inferSelect;
export type InsertDocumentChunk = z.infer<typeof insertDocumentChunkSchema>;
export type ChatSession = typeof chatSessions.$inferSelect;
export type InsertChatSession = z.infer<typeof insertChatSessionSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
