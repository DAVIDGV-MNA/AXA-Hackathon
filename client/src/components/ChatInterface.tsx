import { useState, useRef, useEffect } from "react"
import { ChatMessage, ChatMessageProps } from "./ChatMessage"
import { ChatInput } from "./ChatInput"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { FileText, Sparkles } from "lucide-react"

export interface ChatInterfaceProps {
  chatId?: string
  onNewMessage?: (message: string, files?: File[]) => void
}

export function ChatInterface({ chatId, onNewMessage }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessageProps[]>([])
  const [mode, setMode] = useState<"retrieve" | "create">("retrieve")
  const [isTyping, setIsTyping] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  // Mock initial messages for demo
  useEffect(() => {
    const initialMessages: ChatMessageProps[] = [
      {
        id: "1",
        content: "Hello! I'm your AI document assistant. I can help you retrieve information from your uploaded documents or generate new policy documents. How can I assist you today?",
        role: "assistant",
        timestamp: new Date(Date.now() - 60000),
      }
    ]
    setMessages(initialMessages)
  }, [chatId])

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

      if (mode === "retrieve") {
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
      } else {
        // Create mode
        if (content.toLowerCase().includes("policy") || content.toLowerCase().includes("create")) {
          aiResponse = `I'll help you create a new policy document. Based on your request, I suggest creating a structured policy with these sections:\n\n**1. Purpose & Scope**\n• Define the policy's objective\n• Specify who it applies to\n\n**2. Guidelines & Procedures**\n• Clear step-by-step instructions\n• Roles and responsibilities\n\n**3. Compliance & Enforcement**\n• Monitoring procedures\n• Consequences for non-compliance\n\n**4. Review & Updates**\n• Regular review schedule\n• Update procedures\n\nWould you like me to draft a specific policy? Please provide more details about what type of policy you need.`
        } else {
          aiResponse = `I'm in document creation mode. I can help you generate new policies, procedures, or operational documents based on:\n\n• Existing document templates\n• Best practice guidelines\n• Regulatory requirements\n• Your specific business needs\n\nWhat type of document would you like me to create?`
        }
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
              {mode === "retrieve" ? "Document Retrieval" : "Document Creation"}
            </h2>
            <p className="text-xs text-muted-foreground">
              {mode === "retrieve" 
                ? "Ask questions about your documents" 
                : "Generate new policy documents"
              }
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
        <div className="space-y-4">
          {isEmpty && (
            <div className="text-center py-12">
              <div className="rounded-full bg-muted/50 p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                {mode === "retrieve" ? (
                  <FileText className="h-8 w-8 text-muted-foreground" />
                ) : (
                  <Sparkles className="h-8 w-8 text-muted-foreground" />
                )}
              </div>
              <h3 className="text-lg font-medium mb-2">
                {mode === "retrieve" ? "Ask About Your Documents" : "Create New Documents"}
              </h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                {mode === "retrieve" 
                  ? "I can help you find information from your uploaded documents. Ask me anything about policies, procedures, or guidelines."
                  : "I can help you generate new policy documents, procedures, and guidelines based on your requirements and best practices."
                }
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
          disabled={isTyping}
          mode={mode}
          onModeChange={setMode}
          placeholder={
            mode === "retrieve" 
              ? "Ask about your documents..." 
              : "Describe the document you'd like me to create..."
          }
        />
      </div>
    </div>
  )
}