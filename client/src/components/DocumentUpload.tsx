import { useState, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Upload, File, X, CheckCircle, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

export interface UploadFile {
  id: string
  file: File
  progress: number
  status: "uploading" | "completed" | "error"
  type?: "politics" | "operations" | "manual"
}

export interface DocumentUploadProps {
  onFileUpload: (files: File[]) => void
  onFileRemove: (fileId: string) => void
  uploadingFiles: UploadFile[]
  disabled?: boolean
}

export function DocumentUpload({ 
  onFileUpload, 
  onFileRemove, 
  uploadingFiles,
  disabled = false 
}: DocumentUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    if (!disabled) {
      setIsDragOver(true)
    }
  }, [disabled])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    if (disabled) return

    const files = Array.from(e.dataTransfer.files).filter(file => 
      file.type === "application/pdf" || 
      file.type === "text/plain" ||
      file.type === "application/msword" ||
      file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    )
    
    if (files.length > 0) {
      onFileUpload(files)
      console.log("Files dropped:", files.map(f => f.name))
    }
  }, [onFileUpload, disabled])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      onFileUpload(files)
      console.log("Files selected:", files.map(f => f.name))
    }
    e.target.value = ""
  }

  const getStatusIcon = (status: UploadFile["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <File className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getTypeColor = (type?: string) => {
    switch (type) {
      case "politics":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "operations":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "manual":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  return (
    <div className="space-y-4">
      {/* Upload Zone */}
      <Card 
        className={cn(
          "border-2 border-dashed transition-all duration-200",
          isDragOver && !disabled ? "border-primary bg-primary/5" : "border-muted-foreground/25",
          disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover-elevate"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        data-testid="upload-zone"
      >
        <CardContent className="p-8 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className={cn(
              "rounded-full p-4",
              isDragOver && !disabled ? "bg-primary/10" : "bg-muted/50"
            )}>
              <Upload className={cn(
                "h-8 w-8",
                isDragOver && !disabled ? "text-primary" : "text-muted-foreground"
              )} />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-medium">
                {isDragOver && !disabled ? "Drop files here" : "Upload Documents"}
              </h3>
              <p className="text-sm text-muted-foreground">
                Drag and drop files here, or click to browse
              </p>
              <p className="text-xs text-muted-foreground">
                Supports PDF, DOC, DOCX, and TXT files
              </p>
            </div>

            <Button 
              variant="outline" 
              onClick={() => document.getElementById("file-input")?.click()}
              disabled={disabled}
              data-testid="button-browse"
            >
              Browse Files
            </Button>
            
            <input
              id="file-input"
              type="file"
              multiple
              className="hidden"
              accept=".pdf,.doc,.docx,.txt"
              onChange={handleFileSelect}
              disabled={disabled}
            />
          </div>
        </CardContent>
      </Card>

      {/* Upload Progress */}
      {uploadingFiles.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Uploading Files</h4>
          {uploadingFiles.map((uploadFile) => (
            <Card key={uploadFile.id} className="p-4" data-testid={`upload-progress-${uploadFile.id}`}>
              <div className="flex items-center gap-3">
                {getStatusIcon(uploadFile.status)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium truncate">
                      {uploadFile.file.name}
                    </span>
                    <div className="flex items-center gap-2">
                      {uploadFile.type && (
                        <Badge variant="secondary" className={cn("text-xs", getTypeColor(uploadFile.type))}>
                          {uploadFile.type}
                        </Badge>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => onFileRemove(uploadFile.id)}
                        data-testid={`remove-upload-${uploadFile.id}`}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  {uploadFile.status === "uploading" && (
                    <Progress value={uploadFile.progress} className="h-2" />
                  )}
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>{(uploadFile.file.size / 1024 / 1024).toFixed(2)} MB</span>
                    <span>
                      {uploadFile.status === "completed" ? "Complete" : 
                       uploadFile.status === "error" ? "Error" : 
                       `${uploadFile.progress}%`}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}