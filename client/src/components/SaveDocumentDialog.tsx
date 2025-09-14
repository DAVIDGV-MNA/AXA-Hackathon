import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export interface SaveDocumentDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  content: string
  onSave: (title: string, type: "politics" | "operations" | "manual") => void
  isLoading?: boolean
}

const typeColors = {
  politics: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  operations: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  manual: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
}

const typeDescriptions = {
  politics: "Policy documents, compliance guidelines, and governance procedures",
  operations: "Operational procedures, workflows, and process documentation",
  manual: "User manuals, guides, and instructional content"
}

export function SaveDocumentDialog({
  isOpen,
  onOpenChange,
  content,
  onSave,
  isLoading = false
}: SaveDocumentDialogProps) {
  const [title, setTitle] = useState("")
  const [type, setType] = useState<"politics" | "operations" | "manual" | "">("")

  const handleSave = () => {
    if (title.trim() && type) {
      onSave(title.trim(), type as "politics" | "operations" | "manual")
      setTitle("")
      setType("")
    }
  }

  const handleOpenChange = (open: boolean) => {
    if (!open && !isLoading) {
      setTitle("")
      setType("")
    }
    onOpenChange(open)
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl" aria-describedby="save-document-description">
        <DialogHeader>
          <DialogTitle>Save Document</DialogTitle>
          <DialogDescription id="save-document-description">
            Save the AI-generated content as a new document in your knowledge base.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title" className="text-sm font-medium">
              Document Title
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a descriptive title for this document..."
              disabled={isLoading}
              data-testid="input-document-title"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="type" className="text-sm font-medium">
              Document Type
            </Label>
            <Select value={type} onValueChange={(value: string) => setType(value as "" | "politics" | "operations" | "manual")} disabled={isLoading}>
              <SelectTrigger data-testid="select-document-type">
                <SelectValue placeholder="Select document type..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="politics">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className={cn("text-xs", typeColors.politics)}>
                      Politics
                    </Badge>
                    <span className="text-sm">Policy Documents</span>
                  </div>
                </SelectItem>
                <SelectItem value="operations">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className={cn("text-xs", typeColors.operations)}>
                      Operations
                    </Badge>
                    <span className="text-sm">Operational Procedures</span>
                  </div>
                </SelectItem>
                <SelectItem value="manual">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className={cn("text-xs", typeColors.manual)}>
                      Manual
                    </Badge>
                    <span className="text-sm">User Manuals</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            {type && (
              <p className="text-xs text-muted-foreground mt-1">
                {typeDescriptions[type as keyof typeof typeDescriptions]}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label className="text-sm font-medium">Content Preview</Label>
            <div className="max-h-40 overflow-y-auto border rounded-md p-3 bg-muted/50">
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {content.substring(0, 300)}
                {content.length > 300 && "..."}
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              Content length: {content.length} characters
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => handleOpenChange(false)}
            disabled={isLoading}
            data-testid="button-cancel-save"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            disabled={!title.trim() || !type || isLoading}
            data-testid="button-confirm-save"
          >
            {isLoading ? "Saving..." : "Save Document"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}