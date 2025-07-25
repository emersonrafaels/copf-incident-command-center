import { ReactNode, useState, useEffect } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { COPFSidebar } from "./COPFSidebar";
import { Button } from "@/components/ui/button";
import { Bell, Moon, Sun, User } from "lucide-react";
import { format } from "date-fns";
interface COPFLayoutProps {
  children: ReactNode;
}

export function COPFLayout({
  children
}: COPFLayoutProps) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    // Atualizar a data quando o layout for montado
    setLastUpdate(new Date());
    
    // Escutar eventos de refresh do dashboard
    const handleRefresh = () => {
      setLastUpdate(new Date());
    };
    
    window.addEventListener('dashboard-refresh', handleRefresh);
    
    return () => {
      window.removeEventListener('dashboard-refresh', handleRefresh);
    };
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle("dark");
  };
  return <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <COPFSidebar />
        
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="h-16 sm:h-18 border-b bg-gradient-to-r from-card/80 via-card/90 to-card/80 backdrop-blur-md sticky top-0 z-50 shadow-elegant">
            <div className="flex items-center justify-between h-full px-responsive">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="hover:bg-primary/10 transition-colors" />
                <div className="hidden sm:block min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
                      <span className="text-white font-bold text-sm">C</span>
                    </div>
                    <div>
                      <h1 className="text-responsive-lg font-bold text-foreground truncate bg-gradient-primary bg-clip-text text-transparent">
                        COPF Dashboard
                      </h1>
                      <p className="text-responsive-sm text-muted-foreground truncate">
                        Centro de Operações | Itaú Unibanco
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Last Update Indicator */}
                <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/30 border border-muted/20">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                  <span className="text-xs font-medium text-muted-foreground">
                    Atualizado: {format(lastUpdate, 'dd/MM HH:mm')}
                  </span>
                </div>

                {/* Notifications */}
                <Button variant="ghost" size="icon" className="relative hover:bg-primary/10 transition-all duration-200">
                  <Bell className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-gradient-primary text-white rounded-full text-xs flex items-center justify-center font-bold shadow-lg">
                    3
                  </span>
                </Button>

                {/* Dark Mode Toggle */}
                <Button variant="ghost" size="icon" onClick={toggleDarkMode} title="Alternar modo escuro" className="hover:bg-primary/10 transition-all duration-200">
                  {isDarkMode ? <Sun className="h-5 w-5 text-warning" /> : <Moon className="h-5 w-5 text-primary" />}
                </Button>

                {/* User Profile */}
                <Button variant="ghost" size="icon" className="hover:bg-primary/10 transition-all duration-200">
                  <div className="w-6 h-6 rounded-full bg-gradient-primary flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                </Button>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-responsive bg-gradient-subtle main-content relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0" style={{
                backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--primary)) 1px, transparent 0)`,
                backgroundSize: '20px 20px'
              }}></div>
            </div>
            <div className="relative z-10">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>;
}