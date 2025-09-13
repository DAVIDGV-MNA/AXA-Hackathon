// API client for RAG chatbot backend

export interface Document {
  id: string;
  title: string;
  content: string;
  type: "politics" | "operations" | "manual";
  fileName: string;
  uploadedAt: string;
  userId?: string;
}

export interface DocumentChunk {
  id: string;
  documentId: string;
  content: string;
  chunkIndex: number;
}

export interface ChatSession {
  id: string;
  userId?: string;
  agentType: "document-search" | "document-creator";
  title?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  role: "user" | "assistant";
  content: string;
  documentReferences?: string;
  timestamp: string;
}

export interface SearchResult {
  chunk: DocumentChunk;
  document: Document;
}

class ApiClient {
  private baseUrl = "/api";

  // Document operations
  async uploadDocument(file: File, type: "politics" | "operations" | "manual"): Promise<{ document: Document; chunksCreated: number }> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);

    const response = await fetch(`${this.baseUrl}/documents/upload`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to upload document");
    }

    return response.json();
  }

  async getDocuments(): Promise<Document[]> {
    const response = await fetch(`${this.baseUrl}/documents`);
    if (!response.ok) {
      throw new Error("Failed to fetch documents");
    }
    return response.json();
  }

  async deleteDocument(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/documents/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Failed to delete document");
    }
  }

  // Chat session operations
  async createChatSession(agentType: "document-search" | "document-creator", title?: string): Promise<ChatSession> {
    const response = await fetch(`${this.baseUrl}/chat-sessions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ agentType, title }),
    });

    if (!response.ok) {
      throw new Error("Failed to create chat session");
    }

    return response.json();
  }

  async getChatSessions(): Promise<ChatSession[]> {
    const response = await fetch(`${this.baseUrl}/chat-sessions`);
    if (!response.ok) {
      throw new Error("Failed to fetch chat sessions");
    }
    return response.json();
  }

  async getChatMessages(sessionId: string): Promise<ChatMessage[]> {
    const response = await fetch(`${this.baseUrl}/chat-sessions/${sessionId}/messages`);
    if (!response.ok) {
      throw new Error("Failed to fetch chat messages");
    }
    return response.json();
  }

  async sendMessage(sessionId: string, content: string, role: "user" | "assistant" = "user", documentReferences?: string): Promise<ChatMessage> {
    const response = await fetch(`${this.baseUrl}/chat-sessions/${sessionId}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content, role, documentReferences }),
    });

    if (!response.ok) {
      throw new Error("Failed to send message");
    }

    return response.json();
  }

  // Search operations
  async searchDocuments(query: string): Promise<SearchResult[]> {
    const response = await fetch(`${this.baseUrl}/search`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      throw new Error("Failed to search documents");
    }

    return response.json();
  }

  // AI generation
  async generateResponse(prompt: string, context: SearchResult[], agentType: "document-search" | "document-creator"): Promise<{ response: string }> {
    const response = await fetch(`${this.baseUrl}/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt, context, agentType }),
    });

    if (!response.ok) {
      throw new Error("Failed to generate response");
    }

    return response.json();
  }
}

export const apiClient = new ApiClient();