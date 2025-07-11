import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { BarChart3, MapPin, FileText, MessageSquare, Users, Settings, Home, Building2 } from "lucide-react";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
const navigation = [{
  title: "Dashboard",
  url: "/",
  icon: Home,
  description: "Visão geral e KPIs"
}, {
  title: "Ocorrências",
  url: "/ocorrencias",
  icon: FileText,
  description: "Lista detalhada de ocorrências"
}, {
  title: "Mapa de Calor",
  url: "/mapa",
  icon: MapPin,
  description: "Visualização geográfica"
}, {
  title: "Relatórios",
  url: "/relatorios",
  icon: BarChart3,
  description: "Análises e métricas"
}, {
  title: "Comunicação",
  url: "/comunicacao",
  icon: MessageSquare,
  description: "Gestão de fornecedores"
}, {
  title: "Visão do Fornecedor",
  url: "/visao-fornecedor",
  icon: Building2,
  description: "Dashboard para fornecedores"
}];
const adminNavigation = [{
  title: "Equipes",
  url: "/equipes",
  icon: Users,
  description: "Gestão de usuários",
  hidden: true // Oculto por padrão
}, {
  title: "Configurações",
  url: "/configuracoes",
  icon: Settings,
  description: "Configurações do sistema"
}];
export function COPFSidebar() {
  const {
    state
  } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const collapsed = state === "collapsed";
  const [showTeams, setShowTeams] = useState(false); // Controlado por configuração
  const [showCommunication, setShowCommunication] = useState(false); // Controlado por configuração
  const isActive = (path: string) => {
    if (path === "/" && currentPath === "/") return true;
    if (path !== "/" && currentPath.startsWith(path)) return true;
    return false;
  };
  const getNavCls = (path: string) => {
    const active = isActive(path);
    return active ? "bg-primary/10 text-primary border-r-2 border-primary font-medium hover:bg-primary/15" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground";
  };
  return <Sidebar className={collapsed ? "w-14 sm:w-16" : "w-56 sm:w-64"} collapsible="icon">
      <SidebarContent className="bg-gradient-subtle sidebar-content">
        {/* Header */}
        <div className="p-responsive border-b">
          <div className="flex items-center space-responsive-sm">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-responsive-sm">ER</span>
            </div>
            {!collapsed && <div className="min-w-0">
                <h2 className="font-semibold text-responsive-base text-foreground truncate">COPF</h2>
                <p className="text-responsive-sm text-muted-foreground truncate">Itaú Unibanco</p>
              </div>}
          </div>
        </div>

        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Navegação Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.filter(item => {
                if (item.title === "Comunicação") return showCommunication;
                return true;
              }).map(item => <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavCls(item.url)} title={collapsed ? item.description : undefined}>
                      <item.icon className="h-5 w-5" />
                       {!collapsed && <div className="flex flex-col min-w-0">
                          <span className="text-responsive-sm font-medium truncate">{item.title}</span>
                          <span className="text-responsive-sm text-muted-foreground truncate">{item.description}</span>
                        </div>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Admin Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Administração</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminNavigation.filter(item => !item.hidden || (item.title === "Equipes" && showTeams)).map(item => <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavCls(item.url)} title={collapsed ? item.description : undefined}>
                      <item.icon className="h-5 w-5" />
                       {!collapsed && <div className="flex flex-col min-w-0">
                          <span className="text-responsive-sm font-medium truncate">{item.title}</span>
                          <span className="text-responsive-sm text-muted-foreground truncate">{item.description}</span>
                        </div>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>;
}