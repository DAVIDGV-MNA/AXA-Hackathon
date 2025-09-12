import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Send, Paperclip, X } from "lucide-react"
import { cn } from "@/lib/utils"

export interface ChatInputProps {
  onSendMessage: (message: string, files?: File[]) => void
  disabled?: boolean
  placeholder?: string
  mode: "retrieve" | "create"
  onModeChange: (mode: "retrieve" | "create") => void
}

export function ChatInput({ 
  onSendMessage, 
  disabled = false,
  placeholder = "Ask about your documents or request document creation...",
  mode,
  onModeChange
}: ChatInputProps) {
  const [message, setMessage] = useState("")
  const [files, setFiles] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim() || files.length > 0) {
      onSendMessage(message.trim(), files)
      setMessage("")
      setFiles([])
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e as any)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    setFiles(prev => [...prev, ...selectedFiles])
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const getModeDescription = () => {
    switch (mode) {
      case "retrieve":
        return "Ask questions about uploaded documents"
      case "create":
        return "Generate new policy documents from conversation"
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Mode Selection */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Mode:</span>
        <div className="flex gap-2">
          <Badge 
            variant={mode === "retrieve" ? "default" : "secondary"}
            className="cursor-pointer hover-elevate"
            onClick={() => onModeChange("retrieve")}
            data-testid="mode-retrieve"
          >
            Retrieve
          </Badge>
          <Badge 
            variant={mode === "create" ? "default" : "secondary"}
            className="cursor-pointer hover-elevate"
            onClick={() => onModeChange("create")}
            data-testid="mode-create"
          >
            Create
          </Badge>
        </div>
        <span className="text-xs text-muted-foreground">
          {getModeDescription()}
        </span>
      </div>

      {/* File Attachments */}
      {files.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {files.map((file, index) => (
            <Badge key={index} variant="outline" className="gap-2">
              <span className="text-xs truncate max-w-32">{file.name}</span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                onClick={() => removeFile(index)}
                data-testid={`remove-file-${index}`}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}

      {/* Input Area */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={placeholder}
            disabled={disabled}
            className="min-h-[44px] max-h-32 resize-none pr-12"
            data-testid="input-message"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1 h-8 w-8"
            onClick={() => fileInputRef.current?.click()}
            data-testid="button-attach"
          >
            <Paperclip className="h-4 w-4" />
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleFileSelect}
            accept=".pdf,.doc,.docx,.txt"
          />
        </div>
        <Button 
          type="submit" 
          disabled={disabled || (!message.trim() && files.length === 0)}
          data-testid="button-send"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </form>
  )
}