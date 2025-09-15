// API Base URL - use same origin as the page
const API_BASE = location.origin;

// DOM Elements
const fileInput = document.getElementById('fileInput');
const uploadArea = document.getElementById('uploadArea');
const uploadStatus = document.getElementById('uploadStatus');
const documentsList = document.getElementById('documentsList');
const docCount = document.getElementById('docCount');
const chatMessages = document.getElementById('chatMessages');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const chatStatus = document.getElementById('chatStatus');

// Global state
let documents = [];
let isLoading = false;

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    loadDocuments();
});

// Event Listeners
function setupEventListeners() {
    // File upload
    fileInput.addEventListener('change', handleFileUpload);
    
    // Drag and drop
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleDrop);
    uploadArea.addEventListener('click', () => fileInput.click());
    
    // Chat
    messageInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    sendBtn.addEventListener('click', sendMessage);
}

// File Upload Functions
function handleDragOver(e) {
    e.preventDefault();
    uploadArea.classList.add('dragover');
}

function handleDragLeave(e) {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
}

function handleDrop(e) {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    const files = Array.from(e.dataTransfer.files);
    uploadFiles(files);
}

function handleFileUpload(e) {
    const files = Array.from(e.target.files);
    uploadFiles(files);
}

async function uploadFiles(files) {
    if (files.length === 0) return;
    
    // Filter for .txt files only
    const txtFiles = files.filter(file => file.name.endsWith('.txt'));
    
    if (txtFiles.length === 0) {
        showUploadStatus('Please select .txt files only', 'error');
        return;
    }
    
    if (txtFiles.length !== files.length) {
        showUploadStatus(`Only ${txtFiles.length} of ${files.length} files selected (only .txt files supported)`, 'error');
    }
    
    // Upload each file
    for (const file of txtFiles) {
        await uploadSingleFile(file);
    }
    
    // Refresh documents list
    await loadDocuments();
    
    // Clear file input
    fileInput.value = '';
}

async function uploadSingleFile(file) {
    const formData = new FormData();
    formData.append('file', file);
    
    try {
        showUploadStatus(`Uploading ${file.name}...`, 'loading');
        
        const response = await fetch(`${API_BASE}/api/upload`, {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            showUploadStatus(`${file.name} uploaded successfully!`, 'success');
        } else {
            throw new Error(result.detail || 'Upload failed');
        }
        
    } catch (error) {
        console.error('Upload error:', error);
        showUploadStatus(`Failed to upload ${file.name}: ${error.message}`, 'error');
    }
}

function showUploadStatus(message, type) {
    uploadStatus.textContent = message;
    uploadStatus.className = `upload-status ${type}`;
    uploadStatus.style.display = 'block';
    
    // Auto-hide after 5 seconds for success messages
    if (type === 'success') {
        setTimeout(() => {
            uploadStatus.style.display = 'none';
        }, 5000);
    }
}

// Documents Functions
async function loadDocuments() {
    try {
        const response = await fetch(`${API_BASE}/api/documents`);
        const result = await response.json();
        
        documents = result.documents || [];
        renderDocuments();
        
    } catch (error) {
        console.error('Error loading documents:', error);
        showUploadStatus('Failed to load documents', 'error');
    }
}

function renderDocuments() {
    docCount.textContent = documents.length;
    
    if (documents.length === 0) {
        documentsList.innerHTML = '<p class="empty-state">No documents uploaded yet.</p>';
        return;
    }
    
    const documentsHTML = documents.map(doc => `
        <div class="document-item">
            <div class="document-info">
                <div class="document-name">${escapeHtml(doc.filename)}</div>
                <div class="document-meta">${formatFileSize(doc.size)} • ${formatDate(doc.uploaded_at)}</div>
            </div>
        </div>
    `).join('');
    
    documentsList.innerHTML = documentsHTML;
}

// Chat Functions
async function sendMessage() {
    const message = messageInput.value.trim();
    if (!message || isLoading) return;
    
    const agentType = document.querySelector('input[name="agentType"]:checked').value;
    
    // Add user message to chat
    addMessageToChat(message, 'user');
    
    // Clear input and disable while processing
    messageInput.value = '';
    setLoading(true);
    
    try {
        showChatStatus('Thinking...', 'loading');
        
        const response = await fetch(`${API_BASE}/api/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: message,
                agent_type: agentType
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Add assistant response to chat
            addMessageToChat(result.response, 'assistant');
            hideChatStatus();
        } else {
            throw new Error(result.detail || 'Chat request failed');
        }
        
    } catch (error) {
        console.error('Chat error:', error);
        showChatStatus(`Error: ${error.message}`, 'error');
        addMessageToChat('Sorry, I encountered an error. Please try again.', 'assistant');
    } finally {
        setLoading(false);
    }
}

function addMessageToChat(content, role) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}-message`;
    
    if (role === 'user') {
        messageDiv.textContent = content;
    } else {
        // For assistant messages, preserve formatting (markdown-like)
        messageDiv.innerHTML = formatAssistantMessage(content);
    }
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function formatAssistantMessage(content) {
    // Simple formatting for assistant messages
    return escapeHtml(content)
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')  // Bold
        .replace(/\*(.*?)\*/g, '<em>$1</em>')               // Italic
        .replace(/\n/g, '<br>');                            // Line breaks
}

function setLoading(loading) {
    isLoading = loading;
    sendBtn.disabled = loading;
    sendBtn.textContent = loading ? 'Sending...' : 'Send';
    messageInput.disabled = loading;
}

function showChatStatus(message, type) {
    chatStatus.textContent = message;
    chatStatus.className = `chat-status ${type}`;
    chatStatus.style.display = 'block';
}

function hideChatStatus() {
    chatStatus.style.display = 'none';
}

// Utility Functions
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function formatDate(dateString) {
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    } catch {
        return 'Unknown date';
    }
}