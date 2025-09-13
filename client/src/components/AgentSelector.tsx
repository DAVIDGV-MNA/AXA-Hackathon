import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Search, FileText, Sparkles, Bot, X } from "lucide-react"
import { cn } from "@/lib/utils"

export interface Agent {
  id: string
  name: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  capabilities: string[]
  version?: string
  isRecommended?: boolean
}

export interface AgentSelectorProps {
  open: boolean
  onClose: () => void
  onAgentSelect: (agentId: string) => void
  selectedAgentId?: string
}

const agents: Agent[] = [
  {
    id: "document-search",
    name: "Document Search Agent",
    description: "Ask questions and retrieve information from your uploaded documents using advanced RAG technology.",
    icon: FileText,
    capabilities: ["Document Retrieval", "Q&A", "Context Search"],
    version: "RAG",
    isRecommended: true
  },
  {
    id: "document-creator",
    name: "Document Creator Agent", 
    description: "Generate new policies, procedures, and operational documents based on your requirements and best practices.",
    icon: Sparkles,
    capabilities: ["Document Generation", "Policy Creation", "Template Building"],
    version: "GPT-4"
  }
]

export function AgentSelector({ open, onClose, onAgentSelect, selectedAgentId }: AgentSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedAgent, setSelectedAgent] = useState<string>(selectedAgentId || "")

  const filteredAgents = agents.filter(agent =>
    agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agent.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleAgentSelect = (agentId: string) => {
    console.log("Agent selected:", agentId)
    setSelectedAgent(agentId)
    onAgentSelect(agentId)
    onClose()
  }

  const getCapabilityColor = (capability: string) => {
    switch (capability) {
      case "Document Retrieval":
      case "Q&A": 
      case "Context Search":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "Document Generation":
      case "Policy Creation":
      case "Template Building":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <Bot className="h-5 w-5 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-xl">Select an agent for conversation</DialogTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Choose the AI assistant that best fits your needs
                </p>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search agents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            data-testid="input-search-agents"
          />
        </div>

        {/* Agent Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[50vh] overflow-y-auto">
          {filteredAgents.map((agent) => {
            const IconComponent = agent.icon
            const isSelected = selectedAgent === agent.id
            
            return (
              <Card 
                key={agent.id}
                className={cn(
                  "cursor-pointer transition-all hover-elevate",
                  isSelected ? "ring-2 ring-primary ring-offset-2" : ""
                )}
                onClick={() => handleAgentSelect(agent.id)}
                data-testid={`agent-card-${agent.id}`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="rounded-xl bg-primary/10 p-3 flex-shrink-0">
                      <IconComponent className="h-8 w-8 text-primary" />
                    </div>
                    <div className="flex-1 space-y-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{agent.name}</h3>
                          {agent.version && (
                            <Badge variant="secondary" className="text-xs">
                              {agent.version}
                            </Badge>
                          )}
                          {agent.isRecommended && (
                            <Badge className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                              Recommended
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {agent.description}
                        </p>
                      </div>
                      
                      <div className="flex flex-wrap gap-1">
                        {agent.capabilities.map((capability) => (
                          <Badge 
                            key={capability}
                            variant="outline"
                            className={cn("text-xs", getCapabilityColor(capability))}
                          >
                            {capability}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* No Results */}
        {filteredAgents.length === 0 && (
          <div className="text-center py-8">
            <Bot className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No agents found</h3>
            <p className="text-sm text-muted-foreground">
              Try adjusting your search criteria
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-between items-center pt-4 border-t">
          <p className="text-xs text-muted-foreground">
            You can change agents anytime during your conversation
          </p>
          <Button variant="outline" onClick={onClose} data-testid="button-close-agent-selector">
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}