import { useState } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeProvider } from "./components/ThemeProvider";
import { ThemeToggle } from "./components/ThemeToggle";
import { AppSidebar } from "./components/AppSidebar";
import { ChatInterface } from "./components/ChatInterface";
import { DocumentManagement } from "./components/DocumentManagement";
import { DocumentUploadView } from "./components/DocumentUploadView";

// Mock chat history - todo: remove mock functionality
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
];

function App() {
  const [activeView, setActiveView] = useState<"chat" | "documents" | "upload">("chat");
  const [activeChatId, setActiveChatId] = useState<string>("chat-1");
  const [chatHistory] = useState(mockChatHistory); // todo: remove mock functionality

  const handleNewChat = () => {
    const newChatId = `chat-${Date.now()}`;
    console.log("New chat created:", newChatId);
    setActiveChatId(newChatId);
    setActiveView("chat");
  };

  const handleChatSelect = (chatId: string) => {
    console.log("Chat selected:", chatId);
    setActiveChatId(chatId);
    setActiveView("chat");
  };

  const handleViewChange = (view: "chat" | "documents" | "upload") => {
    console.log("View changed to:", view);
    setActiveView(view);
  };

  const handleUploadClick = () => {
    setActiveView("upload");
  };

  const handleBackToDocuments = () => {
    setActiveView("documents");
  };

  const renderMainContent = () => {
    switch (activeView) {
      case "chat":
        return <ChatInterface chatId={activeChatId} />;
      case "documents":
        return <DocumentManagement onUploadClick={handleUploadClick} />;
      case "upload":
        return <DocumentUploadView onBackToDocuments={handleBackToDocuments} />;
      default:
        return <ChatInterface chatId={activeChatId} />;
    }
  };

  // Custom sidebar width for better content layout
  const sidebarStyle = {
    "--sidebar-width": "20rem",       // 320px for better content
    "--sidebar-width-icon": "4rem",   // default icon width
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeProvider>
          <SidebarProvider style={sidebarStyle as React.CSSProperties}>
            <div className="flex h-screen w-full">
              <AppSidebar
                activeView={activeView}
                onViewChange={handleViewChange}
                chatHistory={chatHistory}
                onNewChat={handleNewChat}
                onChatSelect={handleChatSelect}
                activeChatId={activeChatId}
              />
              <div className="flex flex-col flex-1">
                <header className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                  <div className="flex items-center gap-2">
                    <SidebarTrigger data-testid="button-sidebar-toggle" />
                    <div className="text-sm text-muted-foreground">
                      {activeView === "chat" && "AI Assistant"}
                      {activeView === "documents" && "Document Library"}
                      {activeView === "upload" && "Upload Center"}
                    </div>
                  </div>
                  <ThemeToggle />
                </header>
                <main className="flex-1 overflow-hidden">
                  {renderMainContent()}
                </main>
              </div>
            </div>
          </SidebarProvider>
          <Toaster />
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
