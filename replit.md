# RAG Chatbot Application

## Overview

This is a modern, AI-powered document management and chat interface called "DocuChat" that implements Retrieval-Augmented Generation (RAG) technology. The application allows users to upload documents, interact with their document collection through conversational AI, and generate new documents using AI assistance. It features a dual-agent system with specialized agents for document search/retrieval and document creation, providing a comprehensive document management workflow.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript and Vite for fast development and building
- **UI Library**: Radix UI components with shadcn/ui design system for consistent, accessible interface components
- **Styling**: Tailwind CSS with custom CSS variables for theming, supporting both light and dark modes
- **State Management**: TanStack React Query for server state management and caching
- **Component Structure**: Modular component architecture with reusable UI components and feature-specific components

### Backend Architecture
- **Runtime**: Node.js with Express.js server framework
- **Language**: TypeScript with ES modules for type safety and modern JavaScript features
- **API Design**: RESTful API endpoints with structured error handling and request logging
- **File Processing**: Multer for handling multipart file uploads with memory storage and size limits
- **Authentication**: bcryptjs for password hashing and user authentication

### Database & Storage
- **Database**: PostgreSQL with Neon serverless hosting
- **ORM**: Drizzle ORM for type-safe database operations and schema management
- **Vector Storage**: pgvector extension for storing and querying document embeddings
- **Schema Design**: Normalized tables for users, documents, document chunks, chat sessions, and messages

### AI & Machine Learning
- **LLM Provider**: OpenAI API integration with GPT models for chat responses and document generation
- **Embeddings**: OpenAI text-embedding-ada-002 model for converting text to vector representations
- **RAG Implementation**: Document chunking strategy with vector similarity search for contextual retrieval
- **Agent System**: Dual-agent architecture supporting both document search and document creation modes

### Design System
- **Design Approach**: Reference-based design inspired by Linear, Notion, Claude.ai, and ChatGPT
- **Color Palette**: Professional neutral color scheme with semantic color tokens
- **Typography**: Inter font family for UI text, JetBrains Mono for code elements
- **Component Library**: Comprehensive UI component system with consistent spacing, sizing, and interaction patterns

## External Dependencies

- **AI Services**: OpenAI API for embeddings generation and chat completions
- **Database**: Neon PostgreSQL with pgvector extension for vector operations
- **File Storage**: In-memory file processing with potential for cloud storage integration
- **UI Components**: Radix UI primitives for accessible, unstyled component foundations
- **Development Tools**: Replit-specific plugins for development environment integration
- **Build Tools**: Vite for frontend bundling, esbuild for backend compilation