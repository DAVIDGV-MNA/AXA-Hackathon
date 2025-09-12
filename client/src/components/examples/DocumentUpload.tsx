import { useState } from 'react'
import { DocumentUpload, UploadFile } from '../DocumentUpload'

export default function DocumentUploadExample() {
  const [uploadingFiles, setUploadingFiles] = useState<UploadFile[]>([])

  const handleFileUpload = (files: File[]) => {
    console.log("Files uploaded:", files.map(f => f.name))
    
    // Simulate upload process
    const newUploads: UploadFile[] = files.map((file, index) => ({
      id: `upload-${Date.now()}-${index}`,
      file,
      progress: 0,
      status: "uploading" as const,
      type: index % 3 === 0 ? "politics" : index % 3 === 1 ? "operations" : "manual"
    }))

    setUploadingFiles(prev => [...prev, ...newUploads])

    // Simulate progress
    newUploads.forEach((upload, index) => {
      let progress = 0
      const interval = setInterval(() => {
        progress += Math.random() * 30
        if (progress >= 100) {
          progress = 100
          setUploadingFiles(prev => 
            prev.map(u => u.id === upload.id ? { ...u, progress, status: "completed" } : u)
          )
          clearInterval(interval)
        } else {
          setUploadingFiles(prev => 
            prev.map(u => u.id === upload.id ? { ...u, progress } : u)
          )
        }
      }, 200 + index * 100)
    })
  }

  const handleFileRemove = (fileId: string) => {
    console.log("File removed:", fileId)
    setUploadingFiles(prev => prev.filter(f => f.id !== fileId))
  }

  return (
    <div className="p-4 max-w-2xl">
      <DocumentUpload
        onFileUpload={handleFileUpload}
        onFileRemove={handleFileRemove}
        uploadingFiles={uploadingFiles}
      />
    </div>
  )
}