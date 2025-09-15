import OpenAI from "openai";
import { createDocumentCreatorPrompt } from "./documentTemplates";

// === PENDING: AI/OpenAI Integration ===
// TODO: Implement OpenAI API integration
// All functions below are marked as pending implementation

// Use stable, supported models for better reliability
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

// Move API key validation to request-time to prevent server startup failures
function validateOpenAIKey() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY environment variable is required");
  }
}

// Retry utility with exponential backoff
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error = new Error('Max retries exceeded');
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      // Don't retry on certain errors
      if (error instanceof Error) {
        const message = error.message.toLowerCase();
        if (message.includes('invalid api key') || 
            message.includes('authentication') ||
            message.includes('text too long') ||
            message.includes('maximum') ||
            message.includes('validation')) {
          throw error; // Don't retry these errors
        }
      }
      
      if (attempt === maxRetries) break;
      
      const delay = baseDelay * Math.pow(2, attempt);
      console.warn(`OpenAI API attempt ${attempt + 1} failed, retrying in ${delay}ms:`, error);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
}

export interface EmbeddingResult {
  embedding: number[];
  tokenCount: number;
}

export interface SearchResult {
  content: string;
  similarity: number;
  metadata?: any;
}

/**
 * PENDING: Generate embeddings for text using OpenAI's text-embedding-3-small model
 * TODO: Implement OpenAI embedding generation
 */
export async function generateEmbedding(text: string): Promise<EmbeddingResult> {
  validateOpenAIKey();
  
  // Add token limits to prevent API failures
  const trimmedText = text.trim();
  if (trimmedText.length > 8000) { // Conservative limit for embeddings
    throw new Error("Text too long for embedding generation. Maximum 8000 characters allowed.");
  }
  
  try {
    const response = await retryWithBackoff(() => 
      openai.embeddings.create({
        model: "text-embedding-3-small",
        input: trimmedText,
      })
    );

    const embedding = response.data[0].embedding;
    const tokenCount = response.usage?.total_tokens || 0;

    return {
      embedding,
      tokenCount
    };
  } catch (error) {
    console.error("Error generating embedding:", error);
    throw new Error(`Failed to generate embedding: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * PENDING: Generate batch embeddings for multiple texts
 * TODO: Implement OpenAI batch embedding generation
 */
export async function generateBatchEmbeddings(texts: string[]): Promise<EmbeddingResult[]> {
  if (texts.length === 0) return [];
  validateOpenAIKey();
  
  // Validate batch size and text lengths
  if (texts.length > 100) { // OpenAI batch limit
    throw new Error("Too many texts for batch embedding. Maximum 100 texts allowed.");
  }
  
  const trimmedTexts = texts.map(text => {
    const trimmed = text.trim();
    if (trimmed.length > 8000) {
      throw new Error("Text too long for embedding generation. Maximum 8000 characters per text.");
    }
    return trimmed;
  });
  
  try {
    const response = await retryWithBackoff(() =>
      openai.embeddings.create({
        model: "text-embedding-3-small",
        input: trimmedTexts,
      })
    );

    return response.data.map(item => ({
      embedding: item.embedding,
      tokenCount: response.usage?.total_tokens || 0
    }));
  } catch (error) {
    console.error("Error generating batch embeddings:", error);
    throw new Error(`Failed to generate batch embeddings: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * PENDING: Generate AI response using chat completion
 * TODO: Implement OpenAI chat completion
 */
export async function generateChatResponse(
  message: string, 
  context: string = "", 
  agentType: "document-search" | "document-creator" = "document-search"
): Promise<string> {
  validateOpenAIKey();
  
  // Add token/length guardrails
  const trimmedMessage = message.trim();
  if (trimmedMessage.length > 4000) {
    throw new Error("Message too long. Maximum 4000 characters allowed.");
  }
  
  if (context.length > 15000) {
    // Truncate context if too long, keeping the most recent parts
    context = context.substring(context.length - 15000);
  }
  
  try {
    let systemPrompt = "";
    
    if (agentType === "document-search") {
      systemPrompt = `You are a helpful Document Search Agent specialized in finding and retrieving information from uploaded documents. 
      
Your role is to:
- Analyze user queries and search through document collections
- Provide accurate, relevant information based on document content
- Reference specific documents when providing answers
- Explain when information is not available in the uploaded documents

When context from documents is provided, use it to give detailed, accurate responses. Always cite your sources when referencing document content.`;
    } else if (agentType === "document-creator") {
      // Use enhanced prompt from templates for better document generation
      const enhancedPrompt = createDocumentCreatorPrompt(trimmedMessage);
      systemPrompt = `You are a Document Creator Agent specialized in generating comprehensive, well-structured documents.

Your role is to:
- Create detailed policy documents, procedures, and guidelines
- Structure content with clear headings, sections, and formatting
- Ensure documents are comprehensive and professional
- Adapt writing style to the document type (policy, manual, guide, etc.)
- Use professional markdown formatting for structure and readability

Generate content that is practical, actionable, and professionally formatted. Always include clear headings, bullet points where appropriate, and ensure the document could be saved and used as a reference.`;
      
      // Replace user message with enhanced template prompt
      message = enhancedPrompt;
    }

    const messages: Array<{ role: "system" | "user"; content: string }> = [
      { role: "system", content: systemPrompt }
    ];

    if (context) {
      messages.push({
        role: "system", 
        content: `Here is relevant context from documents:\n\n${context}`
      });
    }

    messages.push({ role: "user", content: message });

    const response = await retryWithBackoff(() =>
      openai.chat.completions.create({
        model: "gpt-4o-mini", // Use stable, supported model for better reliability
        messages,
        max_tokens: agentType === "document-creator" ? 3000 : 1500, // Allow longer responses for document creation
        temperature: agentType === "document-creator" ? 0.8 : 0.7, // Slightly more creative for document generation
      })
    );

    return response.choices[0].message.content || "I apologize, but I couldn't generate a response. Please try again.";
  } catch (error) {
    console.error("Error generating chat response:", error);
    throw new Error(`Failed to generate response: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export { openai };