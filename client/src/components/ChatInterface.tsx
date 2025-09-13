import { useState, useRef, useEffect } from "react"
import { ChatMessage, ChatMessageProps } from "./ChatMessage"
import { ChatInput } from "./ChatInput"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { FileText, Sparkles, Bot } from "lucide-react"
import { apiClient } from "@/lib/api"

export interface ChatInterfaceProps {
  chatId?: string
  selectedAgent?: string
  onNewMessage?: (message: string, files?: File[]) => void
}

export function ChatInterface({ chatId, selectedAgent, onNewMessage }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessageProps[]>([])
  // Set mode based on selected agent
  const getInitialMode = () => {
    if (selectedAgent === "document-creator") return "create"
    return "retrieve"
  }
  const [mode, setMode] = useState<"retrieve" | "create">(getInitialMode())
  
  // Update mode when agent changes
  useEffect(() => {
    const newMode = selectedAgent === "document-creator" ? "create" : "retrieve"
    setMode(newMode)
  }, [selectedAgent])
  const [isTyping, setIsTyping] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  // Mock initial messages for demo based on selected agent
  useEffect(() => {
    const getInitialMessage = () => {
      switch (selectedAgent) {
        case "document-search":
          return "Hello! I'm your Document Search Agent. I can help you find information from your uploaded documents. Ask me anything about your policies, procedures, or guidelines!"
        case "document-creator":
          return "Hello! I'm your Document Creator Agent. I can help you generate new policy documents, procedures, and operational guidelines based on your requirements. What kind of document would you like me to create?"
        default:
          return "Hello! Please select an agent to get started with document assistance."
      }
    }

    if (selectedAgent) {
      const initialMessages: ChatMessageProps[] = [
        {
          id: "1",
          content: getInitialMessage(),
          role: "assistant",
          timestamp: new Date(Date.now() - 60000),
        }
      ]
      setMessages(initialMessages)
    } else {
      setMessages([])
    }
  }, [chatId, selectedAgent])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]')
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }, [messages, isTyping])

  const handleSendMessage = async (content: string, files?: File[]) => {
    if (!content.trim() && (!files || files.length === 0)) return

    console.log("Sending message:", content, files?.map(f => f.name))

    // Add user message
    const userMessage: ChatMessageProps = {
      id: `msg-${Date.now()}`,
      content,
      role: "user",
      timestamp: new Date()
    }
    setMessages(prev => [...prev, userMessage])

    // Show typing indicator
    setIsTyping(true)

    try {
      // For document search agent, search documents first
      if (selectedAgent === "document-search") {
        // Search for relevant documents
        const searchResults = await apiClient.searchDocuments(content)
        
        // Generate AI response with context
        const response = await apiClient.generateResponse(content, searchResults, "document-search")
        
        // Create document references from search results
        const documentReferences = searchResults.map(result => ({
          id: result.document.id,
          title: result.document.title,
          type: result.document.type as "politics" | "operations" | "manual",
          excerpt: result.chunk.content.substring(0, 150) + "..."
        }))

        const aiMessage: ChatMessageProps = {
          id: `msg-${Date.now()}-ai`,
          content: response.response,
          role: "assistant",
          timestamp: new Date(),
          documentReferences: documentReferences.length > 0 ? documentReferences : undefined
        }

        setIsTyping(false)
        setMessages(prev => [...prev, aiMessage])
      } else if (selectedAgent === "document-creator") {
        // For document creator, generate response directly
        const response = await apiClient.generateResponse(content, [], "document-creator")
        
        const aiMessage: ChatMessageProps = {
          id: `msg-${Date.now()}-ai`,
          content: response.response,
          role: "assistant",
          timestamp: new Date()
        }

        setIsTyping(false)
        setMessages(prev => [...prev, aiMessage])
      } else {
        // Fallback for no agent selected
        const aiMessage: ChatMessageProps = {
          id: `msg-${Date.now()}-ai`,
          content: "Please select an agent to get started. Use the 'Switch Agent' button in the header.",
          role: "assistant",
          timestamp: new Date()
        }

        setIsTyping(false)
        setMessages(prev => [...prev, aiMessage])
      }
    } catch (error) {
      console.error("Error generating response:", error)
      
      const errorMessage: ChatMessageProps = {
        id: `msg-${Date.now()}-error`,
        content: "Sorry, I encountered an error while processing your request. Please try again.",
        role: "assistant",
        timestamp: new Date()
      }

      setIsTyping(false)
      setMessages(prev => [...prev, errorMessage])
    }

    onNewMessage?.(content, files)
  }

  const isEmpty = messages.length <= 1

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-primary/10 p-2">
            {mode === "retrieve" ? (
              <FileText className="h-4 w-4 text-primary" />
            ) : (
              <Sparkles className="h-4 w-4 text-primary" />
            )}
          </div>
          <div>
            <h2 className="font-semibold">
              {selectedAgent === "document-search" ? "Document Search Agent" :
               selectedAgent === "document-creator" ? "Document Creator Agent" :
               mode === "retrieve" ? "Document Retrieval" : "Document Creation"}
            </h2>
            <p className="text-xs text-muted-foreground">
              {selectedAgent === "document-search" ? "Ask questions about your documents" :
               selectedAgent === "document-creator" ? "Generate new documents and policies" :
               mode === "retrieve" ? "Ask questions about your documents" : "Generate new policy documents"
              }
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
        <div className="space-y-4">
          {isEmpty && selectedAgent && (
            <div className="text-center py-12">
              <div className="rounded-full bg-muted/50 p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                {selectedAgent === "document-search" ? (
                  <FileText className="h-8 w-8 text-muted-foreground" />
                ) : (
                  <Sparkles className="h-8 w-8 text-muted-foreground" />
                )}
              </div>
              <h3 className="text-lg font-medium mb-2">
                {selectedAgent === "document-search" ? "Ask About Your Documents" : "Create New Documents"}
              </h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                {selectedAgent === "document-search"
                  ? "I specialize in searching through your uploaded documents. Ask me anything about policies, procedures, or guidelines and I'll find the relevant information."
                  : "I specialize in creating new documents from scratch. Tell me what kind of policy, procedure, or manual you need and I'll help you generate it."
                }
              </p>
            </div>
          )}
          
          {isEmpty && !selectedAgent && (
            <div className="text-center py-12">
              <div className="rounded-full bg-muted/50 p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Bot className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">Select an Agent</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Choose an AI agent to get started with document assistance.
              </p>
            </div>
          )}

          {messages.map((message) => (
            <ChatMessage key={message.id} {...message} />
          ))}

          {isTyping && (
            <ChatMessage
              id="typing"
              content=""
              role="assistant"
              timestamp={new Date()}
              isTyping={true}
            />
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t">
        <ChatInput
          onSendMessage={handleSendMessage}
          disabled={isTyping || !selectedAgent}
          mode={mode}
          onModeChange={setMode}
          placeholder={
            selectedAgent === "document-search" 
              ? "Ask about your documents..." 
              : selectedAgent === "document-creator"
              ? "Describe the document you'd like me to create..."
              : "Select an agent to start chatting..."
          }
        />
      </div>
    </div>
  )
}