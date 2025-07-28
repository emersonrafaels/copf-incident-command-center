import { ReactNode, useState, useEffect } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { COPFSidebar } from "./COPFSidebar";
import { NotificationPanel } from "./NotificationPanel";
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
  const [showNotifications, setShowNotifications] = useState(false);

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
        
        <div className="flex-1 flex flex-col min-w-0 pl-2">
          {/* Header */}
          <header className="h-14 sm:h-16 border-b bg-gradient-to-r from-card/80 via-card/90 to-card/80 backdrop-blur-md sticky top-0 z-50 shadow-elegant">
            <div className="flex items-center justify-between h-full px-responsive">
              <div className="flex items-center gap-responsive-sm min-w-0 flex-1">
                <SidebarTrigger className="hover:bg-primary/10 transition-colors shrink-0" />
                <div className="hidden sm:block min-w-0 flex-1">
                  <div className="flex items-center gap-responsive-sm">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-primary flex items-center justify-center shrink-0">
                      <span className="text-white font-bold text-responsive-sm">C</span>
                    </div>
                    <div className="min-w-0">
                      <h1 className="text-responsive-base sm:text-responsive-lg font-bold text-foreground truncate bg-gradient-primary bg-clip-text text-transparent">
                        COPF Dashboard
                      </h1>
                      <p className="text-responsive-xs sm:text-responsive-sm text-muted-foreground truncate">
                        Centro de Operações | Itaú Unibanco
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                {/* Last Update Indicator */}
                <div className="hidden lg:flex items-center gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-muted/30 border border-muted/20">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-primary animate-pulse shrink-0"></div>
                  <span className="text-responsive-xs font-medium text-muted-foreground whitespace-nowrap">
                    Atualizado: {format(lastUpdate, 'dd/MM HH:mm')}
                  </span>
                </div>

                {/* Notifications */}
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="relative hover:bg-primary/10 transition-all duration-200 h-8 w-8 sm:h-10 sm:w-10"
                  onClick={() => setShowNotifications(!showNotifications)}
                >
                  <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="absolute -top-0.5 -right-0.5 h-4 w-4 sm:h-5 sm:w-5 bg-gradient-primary text-white rounded-full text-responsive-xs flex items-center justify-center font-bold shadow-lg">
                    2
                  </span>
                </Button>

                {/* Dark Mode Toggle */}
                <Button variant="ghost" size="icon" onClick={toggleDarkMode} title="Alternar modo escuro" className="hover:bg-primary/10 transition-all duration-200 h-8 w-8 sm:h-10 sm:w-10">
                  {isDarkMode ? <Sun className="h-4 w-4 sm:h-5 sm:w-5 text-warning" /> : <Moon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />}
                </Button>

                {/* User Profile */}
                <Button variant="ghost" size="icon" className="hover:bg-primary/10 transition-all duration-200 h-8 w-8 sm:h-10 sm:w-10">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gradient-primary flex items-center justify-center">
                    <User className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                  </div>
                </Button>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-responsive-sm sm:p-responsive bg-gradient-subtle main-content-responsive relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0" style={{
                backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--primary)) 1px, transparent 0)`,
                backgroundSize: 'clamp(15px, 3vw, 20px) clamp(15px, 3vw, 20px)'
              }}></div>
            </div>
            <div className="relative z-10 w-full min-w-0">
              {children}
            </div>
          </main>

          {/* Footer */}
          <footer className="border-t bg-gradient-to-r from-card/80 via-card/90 to-card/80 backdrop-blur-md ml-2">
            <div className="px-responsive py-responsive-sm">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-responsive-sm">
                <div className="flex items-center gap-responsive-sm">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded bg-gradient-primary flex items-center justify-center shrink-0">
                    <span className="text-white font-bold text-responsive-xs">I</span>
                  </div>
                  <div className="text-center sm:text-left">
                    <p className="text-responsive-sm font-medium text-foreground">Itaú Unibanco S.A.</p>
                    <p className="text-responsive-xs text-muted-foreground">Centro de Operações - COPF</p>
                  </div>
                </div>
                
                <div className="text-center sm:text-right">
                  <p className="text-responsive-xs text-muted-foreground">
                    © {new Date().getFullYear()} Itaú Unibanco. Todos os direitos reservados.
                  </p>
                  <p className="text-responsive-xs text-muted-foreground">
                    Ambiente interno - Uso restrito
                  </p>
                </div>
              </div>
            </div>
          </footer>
        </div>
        
        {/* Notification Panel */}
        <NotificationPanel 
          isOpen={showNotifications} 
          onClose={() => setShowNotifications(false)} 
        />
      </div>
    </SidebarProvider>;
}