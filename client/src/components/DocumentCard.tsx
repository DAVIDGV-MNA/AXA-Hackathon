import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileText, Calendar, MoreVertical, Eye, Download, Trash2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

export interface Document {
  id: string
  title: string
  type: "politics" | "operations" | "manual"
  size: string
  uploadDate: Date
  description?: string
}

export interface DocumentCardProps {
  document: Document
  onView?: (document: Document) => void
  onDownload?: (document: Document) => void
  onDelete?: (document: Document) => void
}

const typeConfig = {
  politics: {
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    label: "Politics"
  },
  operations: {
    color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    label: "Operations"
  },
  manual: {
    color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
    label: "Manual"
  }
}

export function DocumentCard({ document, onView, onDownload, onDelete }: DocumentCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const config = typeConfig[document.type]

  const handleAction = (action: string, e: React.MouseEvent) => {
    e.stopPropagation()
    console.log(`${action} triggered for document:`, document.title)
    
    switch (action) {
      case "view":
        onView?.(document)
        break
      case "download":
        onDownload?.(document)
        break
      case "delete":
        onDelete?.(document)
        break
    }
  }

  return (
    <Card 
      className="hover-elevate cursor-pointer transition-all duration-200"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onView?.(document)}
      data-testid={`document-card-${document.id}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <h3 className="font-medium text-sm truncate">{document.title}</h3>
          </div>
          <div className="flex items-center gap-1">
            <Badge variant="secondary" className={cn("text-xs", config.color)}>
              {config.label}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6"
                  onClick={(e) => e.stopPropagation()}
                  data-testid={`document-menu-${document.id}`}
                >
                  <MoreVertical className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={(e) => handleAction("view", e)}>
                  <Eye className="h-4 w-4 mr-2" />
                  View
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => handleAction("download", e)}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={(e) => handleAction("delete", e)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 space-y-3">
        {document.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {document.description}
          </p>
        )}
        
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>{document.uploadDate.toLocaleDateString()}</span>
          </div>
          <span>{document.size}</span>
        </div>
      </CardContent>
    </Card>
  )
}