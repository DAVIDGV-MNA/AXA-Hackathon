import { ChatMessage } from '../ChatMessage'

export default function ChatMessageExample() {
  const mockDocumentReferences = [
    {
      id: "doc-1",
      title: "Employee Handbook 2024",
      type: "manual" as const,
      excerpt: "Section 3.2 outlines the remote work policy including eligibility criteria and equipment provisions for employees working from home."
    },
    {
      id: "doc-2", 
      title: "Data Privacy Policy",
      type: "politics" as const,
      excerpt: "Personal data collection guidelines and GDPR compliance requirements for customer information handling."
    }
  ]

  return (
    <div className="space-y-4 p-4 max-w-4xl">
      <ChatMessage
        id="1"
        content="Hello! I'd like to know about our remote work policy. What are the requirements for working from home?"
        role="user"
        timestamp={new Date()}
      />
      
      <ChatMessage
        id="2"
        content="Based on your Employee Handbook, here are the key requirements for remote work eligibility:\n\n1. **Employee Status**: Must be a full-time employee for at least 6 months\n2. **Performance**: Satisfactory performance reviews in the last 12 months\n3. **Role Suitability**: Position must be suitable for remote work\n4. **Equipment**: Company will provide necessary equipment including laptop and monitor\n\nWould you like me to provide more details about any specific aspect?"
        role="assistant"
        timestamp={new Date()}
        documentReferences={mockDocumentReferences}
      />

      <ChatMessage
        id="3"
        content=""
        role="assistant"
        timestamp={new Date()}
        isTyping={true}
      />
    </div>
  )
}