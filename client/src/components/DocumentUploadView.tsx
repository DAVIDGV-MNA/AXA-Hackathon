import { useState } from "react"
import { DocumentUpload, UploadFile } from "./DocumentUpload"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Upload, FileText, CheckCircle2, AlertTriangle } from "lucide-react"

export interface DocumentUploadViewProps {
  onBackToDocuments?: () => void
}

export function DocumentUploadView({ onBackToDocuments }: DocumentUploadViewProps) {
  const [uploadingFiles, setUploadingFiles] = useState<UploadFile[]>([])
  const [completedUploads, setCompletedUploads] = useState<UploadFile[]>([])

  const handleFileUpload = (files: File[]) => {
    console.log("Files selected for upload:", files.map(f => f.name))
    
    // Create upload entries
    const newUploads: UploadFile[] = files.map((file, index) => ({
      id: `upload-${Date.now()}-${index}`,
      file,
      progress: 0,
      status: "uploading" as const,
      // todo: remove mock functionality - implement real type detection
      type: index % 3 === 0 ? "politics" : index % 3 === 1 ? "operations" : "manual"
    }))

    setUploadingFiles(prev => [...prev, ...newUploads])

    // Simulate upload process
    newUploads.forEach((upload, index) => {
      let progress = 0
      const interval = setInterval(() => {
        progress += Math.random() * 25 + 5
        if (progress >= 100) {
          progress = 100
          setUploadingFiles(prev => prev.filter(u => u.id !== upload.id))
          setCompletedUploads(prev => [...prev, { ...upload, progress, status: "completed" }])
          clearInterval(interval)
        } else {
          setUploadingFiles(prev => 
            prev.map(u => u.id === upload.id ? { ...u, progress } : u)
          )
        }
      }, 200 + index * 150)
    })
  }

  const handleFileRemove = (fileId: string) => {
    console.log("File upload cancelled:", fileId)
    setUploadingFiles(prev => prev.filter(f => f.id !== fileId))
  }

  const handleCompletedRemove = (fileId: string) => {
    console.log("Completed upload removed:", fileId)
    setCompletedUploads(prev => prev.filter(f => f.id !== fileId))
  }

  const totalFiles = uploadingFiles.length + completedUploads.length
  const hasUploads = totalFiles > 0

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-primary/10 p-2">
            <Upload className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold">Upload Documents</h2>
            <p className="text-xs text-muted-foreground">
              Add new documents to your knowledge base
            </p>
          </div>
        </div>
        {hasUploads && (
          <Button variant="outline" onClick={onBackToDocuments} data-testid="button-back-to-documents">
            <FileText className="h-4 w-4 mr-2" />
            View All Documents
          </Button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 space-y-6">
        {/* Upload Zone */}
        <DocumentUpload
          onFileUpload={handleFileUpload}
          onFileRemove={handleFileRemove}
          uploadingFiles={uploadingFiles}
        />

        {/* Upload Tips */}
        {!hasUploads && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                Upload Tips
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <div className="space-y-2">
                <h4 className="font-medium text-foreground">Supported File Types:</h4>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">PDF</Badge>
                  <Badge variant="outline">DOC</Badge>
                  <Badge variant="outline">DOCX</Badge>
                  <Badge variant="outline">TXT</Badge>
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium text-foreground">Document Categories:</h4>
                <ul className="space-y-1 text-xs">
                  <li><span className="inline-block w-2 h-2 rounded-full bg-blue-500 mr-2"></span><strong>Politics:</strong> Policies, regulations, governance documents</li>
                  <li><span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2"></span><strong>Operations:</strong> Procedures, workflows, operational guides</li>
                  <li><span className="inline-block w-2 h-2 rounded-full bg-purple-500 mr-2"></span><strong>Manual:</strong> Handbooks, tutorials, reference materials</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-foreground">Best Practices:</h4>
                <ul className="space-y-1 text-xs">
                  <li>• Use descriptive filenames</li>
                  <li>• Ensure documents are text-searchable</li>
                  <li>• Group related documents by type</li>
                  <li>• Keep file sizes under 10MB for optimal performance</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Completed Uploads */}
        {completedUploads.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                Successfully Uploaded ({completedUploads.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {completedUploads.map((upload) => (
                <div 
                  key={upload.id} 
                  className="flex items-center justify-between p-3 rounded-lg border hover-elevate"
                  data-testid={`completed-upload-${upload.id}`}
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{upload.file.name}</p>
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-muted-foreground">
                          {(upload.file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                        {upload.type && (
                          <Badge 
                            variant="secondary" 
                            className={`text-xs ${
                              upload.type === "politics" ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300" :
                              upload.type === "operations" ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" :
                              "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
                            }`}
                          >
                            {upload.type}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCompletedRemove(upload.id)}
                    className="text-muted-foreground hover:text-foreground"
                    data-testid={`remove-completed-${upload.id}`}
                  >
                    Dismiss
                  </Button>
                </div>
              ))}
              
              <div className="flex gap-2 pt-2">
                <Button onClick={onBackToDocuments} data-testid="button-view-documents">
                  <FileText className="h-4 w-4 mr-2" />
                  View All Documents
                </Button>
                <Button variant="outline" data-testid="button-upload-more">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload More
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}