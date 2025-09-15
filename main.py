from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
import os
from typing import List, Dict, Any
import json

app = FastAPI(title="DocuChat HTML", version="1.0.0")

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage for this simple version
documents: List[Dict[str, Any]] = []
chat_history: List[Dict[str, Any]] = []

@app.get("/api/health")
async def health():
    return {"message": "DocuChat HTML API", "docs": "/docs"}

@app.post("/api/upload")
async def upload_document(file: UploadFile = File(...)):
    """Upload and process text documents"""
    
    # Validate file type
    if not file.filename or not file.filename.endswith('.txt'):
        raise HTTPException(status_code=400, detail="Only .txt files are supported")
    
    # Read file content
    try:
        content = await file.read()
        text_content = content.decode('utf-8')
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error reading file: {str(e)}")
    
    # Store document
    document = {
        "id": len(documents) + 1,
        "filename": file.filename,
        "content": text_content,
        "size": len(text_content),
        "uploaded_at": "2024-01-01T00:00:00Z"  # Simplified timestamp
    }
    
    documents.append(document)
    
    return {
        "success": True,
        "message": f"Document '{file.filename}' uploaded successfully",
        "document": {
            "id": document["id"],
            "filename": document["filename"],
            "size": document["size"]
        }
    }

@app.post("/api/chat")
async def chat_endpoint(request: Dict[str, Any]):
    """Chat endpoint for RAG conversations"""
    
    message = request.get("message", "")
    agent_type = request.get("agent_type", "document-search")
    
    if not message:
        raise HTTPException(status_code=400, detail="Message is required")
    
    # Store user message
    chat_history.append({
        "role": "user",
        "content": message,
        "timestamp": "2024-01-01T00:00:00Z"
    })
    
    # === PENDING: RAG Implementation ===
    # This is where RAG functionality will be added later
    
    if agent_type == "document-search":
        # Mock document search response
        response = f"🔍 **Document Search Agent** (PENDING)\n\nI searched through {len(documents)} uploaded documents for: '{message}'\n\n*This is a placeholder response. RAG functionality will be implemented later with proper document embedding and similarity search.*"
    else:
        # Mock document creator response  
        response = f"📝 **Document Creator Agent** (PENDING)\n\nI would create a document about: '{message}'\n\n*This is a placeholder response. Document generation functionality will be implemented later with AI assistance.*"
    
    # Store assistant response
    chat_history.append({
        "role": "assistant", 
        "content": response,
        "timestamp": "2024-01-01T00:00:00Z"
    })
    
    return {
        "success": True,
        "response": response,
        "agent_type": agent_type,
        "documents_available": len(documents)
    }

@app.get("/api/documents")
async def get_documents():
    """Get list of uploaded documents"""
    return {
        "documents": [
            {
                "id": doc["id"],
                "filename": doc["filename"], 
                "size": doc["size"],
                "uploaded_at": doc["uploaded_at"]
            }
            for doc in documents
        ]
    }

@app.get("/api/chat/history")
async def get_chat_history():
    """Get chat conversation history"""
    return {
        "history": chat_history
    }

# Serve static files (HTML, CSS, JS) at root
app.mount("/", StaticFiles(directory="static", html=True), name="static")

if __name__ == "__main__":
    import uvicorn
    import os
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", 5000)), log_level="info")