import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { AgentSelector } from '../AgentSelector'

export default function AgentSelectorExample() {
  const [showSelector, setShowSelector] = useState(false)
  const [selectedAgent, setSelectedAgent] = useState("")

  const handleAgentSelect = (agentId: string) => {
    console.log("Agent selected:", agentId)
    setSelectedAgent(agentId)
    setShowSelector(false)
  }

  return (
    <div className="p-4 space-y-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Agent Selector Demo</h2>
        <p className="text-muted-foreground mb-4">
          {selectedAgent ? `Selected Agent: ${selectedAgent}` : "No agent selected"}
        </p>
        <Button onClick={() => setShowSelector(true)}>
          {selectedAgent ? "Switch Agent" : "Select Agent"}
        </Button>
      </div>

      <AgentSelector
        open={showSelector}
        onClose={() => setShowSelector(false)}
        onAgentSelect={handleAgentSelect}
        selectedAgentId={selectedAgent}
      />
    </div>
  )
}