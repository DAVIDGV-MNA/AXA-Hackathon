import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Bot, User, FileText, File } from "lucide-react"
import { cn } from "@/lib/utils"

export interface DocumentReference {
  id: string
  title: string
  type: "politics" | "operations" | "manual"
  excerpt: string
}

export interface ChatMessageProps {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: Date
  documentReferences?: DocumentReference[]
  isTyping?: boolean
}

const typeColors = {
  politics: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  operations: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  manual: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
}

export function ChatMessage({ 
  content, 
  role, 
  timestamp, 
  documentReferences,
  isTyping = false 
}: ChatMessageProps) {
  const isUser = role === "user"

  return (
    <div 
      className={cn(
        "flex gap-3 p-4 hover-elevate rounded-lg",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
      data-testid={`message-${role}`}
    >
      <Avatar className="h-8 w-8 flex-shrink-0">
        <AvatarFallback className={cn(
          isUser ? "bg-primary text-primary-foreground" : "bg-muted"
        )}>
          {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
        </AvatarFallback>
      </Avatar>

      <div className={cn(
        "flex-1 space-y-2",
        isUser ? "items-end" : "items-start"
      )}>
        <div className={cn(
          "max-w-[80%] space-y-2",
          isUser ? "ml-auto" : "mr-auto"
        )}>
          {isTyping ? (
            <Card className="p-3">
              <div className="flex items-center gap-2">
                <div className="flex space-x-1">
                  <div className="h-2 w-2 rounded-full bg-muted-foreground animate-pulse"></div>
                  <div className="h-2 w-2 rounded-full bg-muted-foreground animate-pulse delay-75"></div>
                  <div className="h-2 w-2 rounded-full bg-muted-foreground animate-pulse delay-150"></div>
                </div>
                <span className="text-sm text-muted-foreground">AI is typing...</span>
              </div>
            </Card>
          ) : (
            <Card className={cn(
              "p-3",
              isUser ? "bg-primary text-primary-foreground" : "bg-card"
            )}>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{content}</p>
            </Card>
          )}

          {documentReferences && documentReferences.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <FileText className="h-3 w-3" />
                <span>Referenced documents:</span>
              </div>
              <div className="space-y-2">
                {documentReferences.map((doc) => (
                  <Card key={doc.id} className="p-3 hover-elevate cursor-pointer" data-testid={`document-reference-${doc.id}`}>
                    <div className="flex items-start gap-2">
                      <File className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-sm font-medium truncate">{doc.title}</h4>
                          <Badge variant="secondary" className={cn("text-xs", typeColors[doc.type])}>
                            {doc.type}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">{doc.excerpt}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className={cn(
          "text-xs text-muted-foreground px-1",
          isUser ? "text-right" : "text-left"
        )}>
          {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  )
}