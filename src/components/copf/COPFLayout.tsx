import { ReactNode } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { COPFSidebar } from "./COPFSidebar";
import { Button } from "@/components/ui/button";
import { Bell, Moon, Sun, User } from "lucide-react";
import { useState } from "react";
interface COPFLayoutProps {
  children: ReactNode;
}
export function COPFLayout({
  children
}: COPFLayoutProps) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle("dark");
  };
  return <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <COPFSidebar />
        
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="h-14 sm:h-16 border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
            <div className="flex items-center justify-between h-full px-responsive">
              <div className="flex items-center space-responsive-sm">
                <SidebarTrigger />
                <div className="hidden sm:block min-w-0">
                  <h1 className="text-responsive-lg font-semibold text-foreground truncate">Ferramenta de Acompanhamento - COPF</h1>
                  <p className="text-responsive-sm text-muted-foreground truncate">Itaú Unibanco | Centro de Operações de Pontos Físicos</p>
                </div>
              </div>

              <div className="flex items-center space-responsive-sm">
                {/* Notifications */}
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-destructive text-destructive-foreground rounded-full text-xs flex items-center justify-center">
                    3
                  </span>
                </Button>

                {/* Dark Mode Toggle */}
                <Button variant="ghost" size="icon" onClick={toggleDarkMode} title="Alternar modo escuro">
                  {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </Button>

                {/* User Profile */}
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-responsive bg-gradient-subtle main-content">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>;
}