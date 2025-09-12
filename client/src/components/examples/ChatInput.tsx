import { useState } from 'react'
import { ChatInput } from '../ChatInput'

export default function ChatInputExample() {
  const [mode, setMode] = useState<"retrieve" | "create">("retrieve")

  const handleSendMessage = (message: string, files?: File[]) => {
    console.log("Message sent:", message)
    if (files && files.length > 0) {
      console.log("Files attached:", files.map(f => f.name))
    }
  }

  return (
    <div className="p-4 max-w-2xl">
      <ChatInput
        onSendMessage={handleSendMessage}
        mode={mode}
        onModeChange={setMode}
        placeholder="Ask about your documents or request document creation..."
      />
    </div>
  )
}