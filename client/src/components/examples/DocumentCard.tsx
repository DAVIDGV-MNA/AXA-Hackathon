import { DocumentCard } from '../DocumentCard'

export default function DocumentCardExample() {
  const mockDocuments = [
    {
      id: "doc-1",
      title: "Employee Handbook 2024",
      type: "manual" as const,
      size: "2.3 MB",
      uploadDate: new Date(2024, 0, 15),
      description: "Comprehensive guide covering company policies, procedures, and employee benefits for the 2024 fiscal year."
    },
    {
      id: "doc-2",
      title: "Data Privacy Policy",
      type: "politics" as const,
      size: "1.8 MB",
      uploadDate: new Date(2024, 2, 10),
      description: "Updated privacy policy outlining data collection, usage, and protection procedures in compliance with GDPR."
    },
    {
      id: "doc-3",
      title: "Software Deployment Guide",
      type: "operations" as const,
      size: "4.1 MB",
      uploadDate: new Date(2024, 1, 28),
      description: "Step-by-step deployment procedures for production environment including rollback strategies."
    }
  ]

  const handleView = (document: any) => {
    console.log("View document:", document.title)
  }

  const handleDownload = (document: any) => {
    console.log("Download document:", document.title)
  }

  const handleDelete = (document: any) => {
    console.log("Delete document:", document.title)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {mockDocuments.map((doc) => (
        <DocumentCard
          key={doc.id}
          document={doc}
          onView={handleView}
          onDownload={handleDownload}
          onDelete={handleDelete}
        />
      ))}
    </div>
  )
}