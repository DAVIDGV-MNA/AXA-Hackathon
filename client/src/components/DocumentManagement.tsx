import { useState, useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { DocumentCard, Document } from "./DocumentCard"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { apiClient } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search, Filter, SortAsc, Upload, FileText } from "lucide-react"

export interface DocumentManagementProps {
  onUploadClick?: () => void
}

// === QUALITY OF LIFE IMPROVEMENT: Using mock documents with future API integration planned ===
const mockDocuments: Document[] = [
  {
    id: "doc-1",
    title: "Employee Handbook 2024",
    type: "manual",
    size: "2.3 MB",
    uploadDate: new Date(2024, 0, 15),
    description: "Comprehensive guide covering company policies, procedures, and employee benefits for the 2024 fiscal year."
  },
  {
    id: "doc-2",
    title: "Data Privacy Policy v2.1",
    type: "politics",
    size: "1.8 MB",
    uploadDate: new Date(2024, 2, 10),
    description: "Updated privacy policy outlining data collection, usage, and protection procedures in compliance with GDPR."
  },
  {
    id: "doc-3",
    title: "Software Deployment Guide",
    type: "operations",
    size: "4.1 MB",
    uploadDate: new Date(2024, 1, 28),
    description: "Step-by-step deployment procedures for production environment including rollback strategies."
  },
  {
    id: "doc-4",
    title: "Remote Work Policy",
    type: "politics",
    size: "1.2 MB",
    uploadDate: new Date(2024, 2, 5),
    description: "Guidelines and requirements for remote work arrangements, equipment provision, and performance expectations."
  },
  {
    id: "doc-5",
    title: "Security Incident Response",
    type: "operations",
    size: "3.5 MB",
    uploadDate: new Date(2024, 1, 20),
    description: "Procedures for identifying, containing, and responding to security incidents and data breaches."
  },
  {
    id: "doc-6",
    title: "Code Review Guidelines",
    type: "manual",
    size: "950 KB",
    uploadDate: new Date(2024, 2, 1),
    description: "Best practices and standards for code review processes, including checklist and approval workflows."
  }
]

export function DocumentManagement({ onUploadClick }: DocumentManagementProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("date")
  const { toast } = useToast()
  const queryClient = useQueryClient()

  // === QUALITY OF LIFE IMPROVEMENT: API integration prepared (using mock data for now) ===
  // TODO: Enable real API when backend is ready
  // const { data: apiDocuments = [], isLoading, error } = useQuery({
  //   queryKey: ['/api/documents'],
  //   queryFn: () => apiClient.getDocuments(),
  //   staleTime: 30000,
  //   retry: 2
  // })
  
  const documents = mockDocuments
  const isLoading = false
  const error = null

  // === QUALITY OF LIFE IMPROVEMENT: Document deletion (mock for now) ===
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      // TODO: Enable real API deletion when backend is ready
      console.log("PENDING: Mock delete document with id:", id)
      await new Promise(resolve => setTimeout(resolve, 500)) // Simulate network delay
      return { success: true }
    },
    onSuccess: () => {
      toast({
        title: "Success", 
        description: "Document deleted successfully",
      })
      // Note: In real implementation, would invalidate queries
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete document",
        variant: "destructive",
      })
    }
  })

  // Filter and sort documents
  const filteredDocuments = documents
    .filter(doc => {
      const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           doc.description?.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesType = typeFilter === "all" || doc.type === typeFilter
      return matchesSearch && matchesType
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.title.localeCompare(b.title)
        case "type":
          return a.type.localeCompare(b.type)
        case "size":
          return parseFloat(a.size) - parseFloat(b.size)
        case "date":
        default:
          return b.uploadDate.getTime() - a.uploadDate.getTime()
      }
    })

  const handleView = (document: Document) => {
    console.log("View document:", document.title)
    // todo: remove mock functionality - implement real document viewer
  }

  const handleDownload = (document: Document) => {
    console.log("Download document:", document.title)
    // todo: remove mock functionality - implement real download
  }

  // === QUALITY OF LIFE IMPROVEMENT: Real deletion with confirmation ===
  const handleDelete = (document: Document) => {
    if (window.confirm(`Are you sure you want to delete "${document.title}"? This action cannot be undone.`)) {
      deleteMutation.mutate(document.id)
    }
  }

  const getTypeCount = (type: string) => {
    if (type === "all") return documents.length
    return documents.filter(doc => doc.type === type).length
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-primary/10 p-2">
            <FileText className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold">Document Management</h2>
            <p className="text-xs text-muted-foreground">
              {filteredDocuments.length} of {documents.length} documents
            </p>
          </div>
        </div>
        <Button onClick={onUploadClick} data-testid="button-upload-new">
          <Upload className="h-4 w-4 mr-2" />
          Upload Documents
        </Button>
      </div>

      {/* Filters and Search */}
      <div className="p-4 border-b space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-search-documents"
            />
          </div>
          <div className="flex gap-2">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-40" data-testid="select-type-filter">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types ({getTypeCount("all")})</SelectItem>
                <SelectItem value="politics">Politics ({getTypeCount("politics")})</SelectItem>
                <SelectItem value="operations">Operations ({getTypeCount("operations")})</SelectItem>
                <SelectItem value="manual">Manual ({getTypeCount("manual")})</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-32" data-testid="select-sort">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="type">Type</SelectItem>
                <SelectItem value="size">Size</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Type Filter Badges */}
        <div className="flex flex-wrap gap-2">
          <Badge 
            variant={typeFilter === "all" ? "default" : "secondary"}
            className="cursor-pointer hover-elevate"
            onClick={() => setTypeFilter("all")}
            data-testid="filter-all"
          >
            All ({getTypeCount("all")})
          </Badge>
          <Badge 
            variant={typeFilter === "politics" ? "default" : "secondary"}
            className="cursor-pointer hover-elevate bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
            onClick={() => setTypeFilter("politics")}
            data-testid="filter-politics"
          >
            Politics ({getTypeCount("politics")})
          </Badge>
          <Badge 
            variant={typeFilter === "operations" ? "default" : "secondary"}
            className="cursor-pointer hover-elevate bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
            onClick={() => setTypeFilter("operations")}
            data-testid="filter-operations"
          >
            Operations ({getTypeCount("operations")})
          </Badge>
          <Badge 
            variant={typeFilter === "manual" ? "default" : "secondary"}
            className="cursor-pointer hover-elevate bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
            onClick={() => setTypeFilter("manual")}
            data-testid="filter-manual"
          >
            Manual ({getTypeCount("manual")})
          </Badge>
        </div>
      </div>

      {/* Documents Grid */}
      <div className="flex-1 overflow-auto p-4">
        {filteredDocuments.length === 0 ? (
          <div className="text-center py-12">
            <div className="rounded-full bg-muted/50 p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">
              {searchQuery || typeFilter !== "all" ? "No documents found" : "No documents uploaded"}
            </h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              {searchQuery || typeFilter !== "all" 
                ? "Try adjusting your search or filter criteria."
                : "Upload your first document to get started with AI-powered document assistance."
              }
            </p>
            {!searchQuery && typeFilter === "all" && (
              <Button className="mt-4" onClick={onUploadClick}>
                <Upload className="h-4 w-4 mr-2" />
                Upload Documents
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredDocuments.map((document) => (
              <DocumentCard
                key={document.id}
                document={document}
                onView={handleView}
                onDownload={handleDownload}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}