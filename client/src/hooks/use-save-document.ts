import { useMutation, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

export function useSaveDocument() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async ({ title, content, type }: { 
      title: string; 
      content: string; 
      type: "politics" | "operations" | "manual" 
    }) => {
      return apiClient.saveDocument(title, content, type)
    },
    onSuccess: (data) => {
      // Invalidate and refetch documents list
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] })
      
      // Show success toast
      toast({
        title: "Document Saved",
        description: `"${data.document.title}" has been saved successfully and is now searchable.`,
      })
    },
    onError: (error) => {
      // Show error toast
      toast({
        title: "Failed to Save Document", 
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      })
    },
  })
}