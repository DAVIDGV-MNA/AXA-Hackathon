import { useState } from 'react'
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from '../AppSidebar'

export default function AppSidebarExample() {
  const [activeView, setActiveView] = useState<"chat" | "documents" | "upload">("chat")
  const [activeChatId, setActiveChatId] = useState<string>("chat-1")

  const mockChatHistory = [
    {
      id: "chat-1",
      title: "Remote Work Policy Questions",
      timestamp: new Date(2024, 8, 10),
      messageCount: 8
    },
    {
      id: "chat-2", 
      title: "Data Privacy Compliance",
      timestamp: new Date(2024, 8, 9),
      messageCount: 12
    },
    {
      id: "chat-3",
      title: "Employee Benefits Overview",
      timestamp: new Date(2024, 8, 8),
      messageCount: 5
    },
    {
      id: "chat-4",
      title: "Deployment Procedures",
      timestamp: new Date(2024, 8, 7),
      messageCount: 15
    }
  ]

  const handleNewChat = () => {
    console.log("New chat created")
    const newChatId = `chat-${Date.now()}`
    setActiveChatId(newChatId)
  }

  const handleChatSelect = (chatId: string) => {
    console.log("Chat selected:", chatId)
    setActiveChatId(chatId)
  }

  const style = {
    "--sidebar-width": "20rem",
    "--sidebar-width-icon": "4rem",
  }

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar
          activeView={activeView}
          onViewChange={setActiveView}
          chatHistory={mockChatHistory}
          onNewChat={handleNewChat}
          onChatSelect={handleChatSelect}
          activeChatId={activeChatId}
        />
        <div className="flex-1 p-8 bg-background">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Active View: {activeView}</h2>
            <p className="text-muted-foreground">
              This is where the main content would be displayed based on the selected view.
            </p>
            {activeView === "chat" && activeChatId && (
              <p className="text-sm text-muted-foreground mt-2">
                Active Chat: {activeChatId}
              </p>
            )}
          </div>
        </div>
      </div>
    </SidebarProvider>
  )
}