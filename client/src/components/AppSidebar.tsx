import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar"
import { 
  MessageSquare, 
  FileText, 
  Upload, 
  Search,
  Filter,
  Plus,
  Settings,
  HelpCircle
} from "lucide-react"
import { cn } from "@/lib/utils"

export interface SidebarProps {
  activeView: "chat" | "documents" | "upload"
  onViewChange: (view: "chat" | "documents" | "upload") => void
  chatHistory: Array<{
    id: string
    title: string
    timestamp: Date
    messageCount: number
  }>
  onNewChat: () => void
  onChatSelect: (chatId: string) => void
  activeChatId?: string
}

const navigationItems = [
  {
    id: "chat",
    title: "Chat",
    icon: MessageSquare,
    description: "Conversation history"
  },
  {
    id: "documents",
    title: "Documents",
    icon: FileText,
    description: "Manage documents"
  },
  {
    id: "upload",
    title: "Upload",
    icon: Upload,
    description: "Add new documents"
  }
] as const

export function AppSidebar({ 
  activeView, 
  onViewChange, 
  chatHistory,
  onNewChat,
  onChatSelect,
  activeChatId
}: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredChatHistory = chatHistory.filter(chat =>
    chat.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleNavigation = (view: "chat" | "documents" | "upload") => {
    console.log(`Navigation to ${view} triggered`)
    onViewChange(view)
  }

  const handleChatSelect = (chatId: string) => {
    console.log(`Chat selected: ${chatId}`)
    onChatSelect(chatId)
  }

  const handleNewChat = () => {
    console.log("New chat triggered")
    onNewChat()
  }

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-primary p-2">
            <MessageSquare className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">DocuChat</h1>
            <p className="text-xs text-muted-foreground">AI Document Assistant</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => handleNavigation(item.id)}
                    className={cn(
                      "w-full justify-start",
                      activeView === item.id && "bg-sidebar-accent text-sidebar-accent-foreground"
                    )}
                    data-testid={`nav-${item.id}`}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Chat History */}
        {activeView === "chat" && (
          <SidebarGroup>
            <SidebarGroupLabel className="flex items-center justify-between">
              <span>Conversations</span>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6"
                onClick={handleNewChat}
                data-testid="button-new-chat"
              >
                <Plus className="h-3 w-3" />
              </Button>
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <div className="space-y-2 px-2">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-3 w-3 text-muted-foreground" />
                  <Input
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-7 h-8 text-xs"
                    data-testid="input-search-chats"
                  />
                </div>
                
                <div className="space-y-1 max-h-96 overflow-y-auto">
                  {filteredChatHistory.map((chat) => (
                    <Button
                      key={chat.id}
                      variant="ghost"
                      className={cn(
                        "w-full justify-start h-auto p-2 text-left",
                        activeChatId === chat.id && "bg-sidebar-accent text-sidebar-accent-foreground"
                      )}
                      onClick={() => handleChatSelect(chat.id)}
                      data-testid={`chat-${chat.id}`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium truncate">
                            {chat.title}
                          </span>
                          <Badge variant="secondary" className="text-xs">
                            {chat.messageCount}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {chat.timestamp.toLocaleDateString()}
                        </p>
                      </div>
                    </Button>
                  ))}
                  
                  {filteredChatHistory.length === 0 && (
                    <div className="text-center py-4">
                      <p className="text-xs text-muted-foreground">
                        {searchQuery ? "No conversations found" : "No conversations yet"}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Document Filters */}
        {activeView === "documents" && (
          <SidebarGroup>
            <SidebarGroupLabel>Filters</SidebarGroupLabel>
            <SidebarGroupContent>
              <div className="space-y-2 px-2">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-3 w-3 text-muted-foreground" />
                  <Input
                    placeholder="Search documents..."
                    className="pl-7 h-8 text-xs"
                    data-testid="input-search-documents"
                  />
                </div>
                
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Filter className="h-3 w-3 mr-2" />
                  <span className="text-xs">All Types</span>
                </Button>
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="p-4">
        <div className="space-y-2">
          <Button variant="ghost" size="sm" className="w-full justify-start">
            <Settings className="h-4 w-4 mr-2" />
            <span className="text-sm">Settings</span>
          </Button>
          <Button variant="ghost" size="sm" className="w-full justify-start">
            <HelpCircle className="h-4 w-4 mr-2" />
            <span className="text-sm">Help</span>
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}