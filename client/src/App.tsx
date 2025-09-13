import { useState, useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeProvider } from "./components/ThemeProvider";
import { ThemeToggle } from "./components/ThemeToggle";
import { AppSidebar } from "./components/AppSidebar";
import { ChatInterface } from "./components/ChatInterface";
import { DocumentManagement } from "./components/DocumentManagement";
import { DocumentUploadView } from "./components/DocumentUploadView";
import { AgentSelector } from "./components/AgentSelector";
import { Bot, Sparkles, FileText } from "lucide-react";

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
  const [showAgentSelector, setShowAgentSelector] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<string>("");

  // Show agent selector on first load
  useEffect(() => {
    if (!selectedAgent) {
      setShowAgentSelector(true);
    }
  }, [selectedAgent]);

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

  const handleAgentSelect = (agentId: string) => {
    console.log("Agent selected:", agentId);
    setSelectedAgent(agentId);
    setShowAgentSelector(false);
    // Switch to appropriate view based on agent
    if (agentId === "document-search") {
      setActiveView("chat");
    } else if (agentId === "document-creator") {
      setActiveView("chat");
    }
  };

  const handleSwitchAgent = () => {
    setShowAgentSelector(true);
  };

  const getAgentInfo = (agentId: string) => {
    switch (agentId) {
      case "document-search":
        return {
          name: "Document Search",
          icon: FileText,
          description: "Ask questions about documents",
          color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
        };
      case "document-creator":
        return {
          name: "Document Creator", 
          icon: Sparkles,
          description: "Generate new documents",
          color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
        };
      default:
        return {
          name: "AI Assistant",
          icon: Bot,
          description: "Select an agent",
          color: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
        };
    }
  };

  const renderMainContent = () => {
    switch (activeView) {
      case "chat":
        return <ChatInterface chatId={activeChatId} selectedAgent={selectedAgent} />;
      case "documents":
        return <DocumentManagement onUploadClick={handleUploadClick} />;
      case "upload":
        return <DocumentUploadView onBackToDocuments={handleBackToDocuments} />;
      default:
        return <ChatInterface chatId={activeChatId} selectedAgent={selectedAgent} />;
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
                  <div className="flex items-center gap-4">
                    <SidebarTrigger data-testid="button-sidebar-toggle" />
                    
                    {/* Current Agent Info */}
                    {selectedAgent && activeView === "chat" && (() => {
                      const agentInfo = getAgentInfo(selectedAgent);
                      const IconComponent = agentInfo.icon;
                      return (
                        <div className="flex items-center gap-2">
                          <div className="rounded-lg bg-primary/10 p-1.5">
                            <IconComponent className="h-4 w-4 text-primary" />
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{agentInfo.name}</span>
                            <Badge variant="secondary" className={`text-xs ${agentInfo.color}`}>
                              Active
                            </Badge>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={handleSwitchAgent}
                            className="text-xs h-7 px-2"
                            data-testid="button-switch-agent"
                          >
                            Switch Agent
                          </Button>
                        </div>
                      );
                    })()}
                    
                    {/* View Label */}
                    {activeView !== "chat" && (
                      <div className="text-sm text-muted-foreground">
                        {activeView === "documents" && "Document Library"}
                        {activeView === "upload" && "Upload Center"}
                      </div>
                    )}
                  </div>
                  <ThemeToggle />
                </header>
                <main className="flex-1 overflow-hidden">
                  {renderMainContent()}
                </main>
                
                {/* Agent Selector */}
                <AgentSelector
                  open={showAgentSelector}
                  onClose={() => setShowAgentSelector(false)}
                  onAgentSelect={handleAgentSelect}
                  selectedAgentId={selectedAgent}
                />
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
