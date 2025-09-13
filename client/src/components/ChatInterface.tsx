import { useState, useRef, useEffect } from "react"
import { ChatMessage, ChatMessageProps } from "./ChatMessage"
import { ChatInput } from "./ChatInput"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { FileText, Sparkles, Bot } from "lucide-react"

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

    // Simulate AI response with mock data
    setTimeout(() => {
      let aiResponse = ""
      let documentReferences = undefined

      // Customize responses based on selected agent
      const isSearchAgent = selectedAgent === "document-search"
      const isCreatorAgent = selectedAgent === "document-creator"

      if (mode === "retrieve" && isSearchAgent) {
        if (content.toLowerCase().includes("remote work") || content.toLowerCase().includes("work from home")) {
          aiResponse = `Based on your Employee Handbook, here are the key requirements for remote work:\n\n**Eligibility Criteria:**\n• Must be a full-time employee for at least 6 months\n• Satisfactory performance reviews in the last 12 months\n• Role must be suitable for remote work\n\n**Equipment & Support:**\n• Company provides laptop, monitor, and necessary software\n• Monthly internet allowance of $50\n• Ergonomic home office setup budget up to $500\n\n**Requirements:**\n• Must maintain regular communication with team\n• Attend all required meetings via video conference\n• Available during core business hours (9 AM - 3 PM)`
          
          documentReferences = [
            {
              id: "doc-handbook",
              title: "Employee Handbook 2024",
              type: "manual" as const,
              excerpt: "Section 3.2 outlines the remote work policy including eligibility criteria and equipment provisions."
            }
          ]
        } else if (content.toLowerCase().includes("privacy") || content.toLowerCase().includes("data")) {
          aiResponse = `Here's what I found about data privacy in your policies:\n\n**Data Collection:**\n• Only collect data necessary for business operations\n• Obtain explicit consent for personal data collection\n• Provide clear privacy notices\n\n**Data Protection:**\n• Encrypt sensitive data both in transit and at rest\n• Regular security audits and penetration testing\n• Access controls based on principle of least privilege\n\n**Compliance:**\n• GDPR compliant data processing procedures\n• Data retention policies with automatic deletion\n• Regular staff training on privacy practices`
          
          documentReferences = [
            {
              id: "doc-privacy",
              title: "Data Privacy Policy v2.1",
              type: "politics" as const,
              excerpt: "Comprehensive data protection guidelines covering GDPR compliance and security measures."
            }
          ]
        } else {
          aiResponse = `I can help you find information from your uploaded documents. Try asking about:\n\n• Remote work policies\n• Data privacy guidelines\n• Employee benefits\n• Operational procedures\n• Compliance requirements\n\nOr upload new documents for me to analyze!`
        }
      } else if (mode === "create" && isCreatorAgent) {
        // Create mode for document creator agent
        if (content.toLowerCase().includes("policy") || content.toLowerCase().includes("create")) {
          aiResponse = `I'll help you create a new policy document. Based on your request, I suggest creating a structured policy with these sections:\n\n**1. Purpose & Scope**\n• Define the policy's objective\n• Specify who it applies to\n\n**2. Guidelines & Procedures**\n• Clear step-by-step instructions\n• Roles and responsibilities\n\n**3. Compliance & Enforcement**\n• Monitoring procedures\n• Consequences for non-compliance\n\n**4. Review & Updates**\n• Regular review schedule\n• Update procedures\n\nWould you like me to draft a specific policy? Please provide more details about what type of policy you need.`
        } else {
          aiResponse = `I'm your Document Creator Agent, specialized in generating comprehensive documents. I can help you create:\n\n• **Policy Documents:** Company policies, guidelines, and procedures\n• **Operational Manuals:** Step-by-step guides and workflows\n• **Compliance Documents:** Regulatory and compliance materials\n• **Training Materials:** Employee handbooks and guides\n\nWhat type of document would you like me to create? Please provide details about the purpose, scope, and any specific requirements.`
        }
      } else {
        // Default response for unrecognized modes or agents
        aiResponse = `I'm here to help! Please let me know what you'd like to do - search for information in documents or create new ones.`
      }

      const aiMessage: ChatMessageProps = {
        id: `msg-${Date.now()}-ai`,
        content: aiResponse,
        role: "assistant",
        timestamp: new Date(),
        documentReferences
      }

      setIsTyping(false)
      setMessages(prev => [...prev, aiMessage])
    }, 1500 + Math.random() * 1000)

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