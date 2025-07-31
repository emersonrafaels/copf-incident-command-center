import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { BarChart3, MapPin, FileText, MessageSquare, Users, Settings, Home, Building2 } from "lucide-react";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { ComingSoonBadge } from "@/components/copf/ComingSoonBadge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
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
  title: "Visão do Fornecedor",
  url: "/visao-fornecedor",
  icon: Building2,
  description: "Dashboard para fornecedores"
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
  return <Sidebar className={cn("sidebar-responsive transition-all duration-300 border-r bg-sidebar text-sidebar-foreground", { "w-14": collapsed, "w-64": !collapsed })} collapsible="icon">
      <SidebarContent className="bg-gradient-subtle sidebar-content">
        {/* Header */}
        <div className="p-responsive-sm border-b border-sidebar-border">
          <div className="flex items-center space-responsive-sm">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-responsive-sm">C</span>
            </div>
            {!collapsed && <div className="min-w-0">
                <h2 className="font-semibold text-responsive-base text-foreground truncate">COPF</h2>
                <p className="text-responsive-xs text-muted-foreground truncate">Centro de Operações</p>
              </div>}
          </div>
        </div>

        {/* Main Navigation */}
        <SidebarGroup className="px-responsive-xs">
          <SidebarGroupLabel className="text-responsive-xs font-semibold text-sidebar-foreground/80 px-2 mb-2">Navegação Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-responsive-xs">
              {navigation.filter(item => {
                if (item.title === "Comunicação") return showCommunication;
                return true;
              }).map(item => {
                const isComingSoon = ["Mapa de Calor", "Relatórios"].includes(item.title);
                const comingSoonTooltip = item.title === "Mapa de Calor" ? "Disponível no MVP 2.0 - Q2 2024" : 
                                         item.title === "Relatórios" ? "Disponível no MVP 1.5 - Q1 2024" : "";
                
                const content = (
                  <SidebarMenuButton asChild className="h-10 sm:h-11 px-3 rounded-lg transition-all duration-200 hover:bg-sidebar-accent data-[active=true]:bg-sidebar-accent data-[active=true]:font-semibold">
                    <NavLink to={item.url} className={getNavCls(item.url)} title={collapsed ? item.description : undefined}>
                      <div className="flex items-center gap-responsive-sm w-full">
                        <item.icon className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
                        {!collapsed && <div className="flex flex-col min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-responsive-sm font-medium truncate">{item.title}</span>
                              {isComingSoon && <ComingSoonBadge size="sm" />}
                            </div>
                            <span className="text-responsive-xs text-muted-foreground truncate">{item.description}</span>
                          </div>}
                        {collapsed && isComingSoon && <ComingSoonBadge size="sm" className="absolute -top-1 -right-2 z-20" />}
                      </div>
                    </NavLink>
                  </SidebarMenuButton>
                );

                return (
                  <SidebarMenuItem key={item.title} className="relative">
                    {isComingSoon && collapsed ? (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            {content}
                          </TooltipTrigger>
                          <TooltipContent side="right">
                            <p>{comingSoonTooltip}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : content}
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Admin Navigation */}
        <SidebarGroup className="px-responsive-xs">
          <SidebarGroupLabel className="text-responsive-xs font-semibold text-sidebar-foreground/80 px-2 mb-2">Administração</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-responsive-xs">
              {adminNavigation.filter(item => !item.hidden || (item.title === "Equipes" && showTeams)).map(item => {
                const isComingSoon = item.title === "Configurações";
                const comingSoonTooltip = item.title === "Configurações" ? "Disponível em Versão Futura (após MVP)" : "";
                
                const content = (
                  <SidebarMenuButton asChild className="h-10 sm:h-11 px-3 rounded-lg transition-all duration-200 hover:bg-sidebar-accent data-[active=true]:bg-sidebar-accent data-[active=true]:font-semibold">
                    <NavLink to={item.url} className={getNavCls(item.url)} title={collapsed ? item.description : undefined}>
                      <div className="flex items-center gap-responsive-sm w-full">
                        <item.icon className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
                        {!collapsed && <div className="flex flex-col min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-responsive-sm font-medium truncate">{item.title}</span>
                              {isComingSoon && <ComingSoonBadge size="sm" />}
                            </div>
                            <span className="text-responsive-xs text-muted-foreground truncate">{item.description}</span>
                          </div>}
                        {collapsed && isComingSoon && <ComingSoonBadge size="sm" className="absolute -top-1 -right-2 z-20" />}
                      </div>
                    </NavLink>
                  </SidebarMenuButton>
                );

                return (
                  <SidebarMenuItem key={item.title} className="relative">
                    {isComingSoon && collapsed ? (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            {content}
                          </TooltipTrigger>
                          <TooltipContent side="right">
                            <p>{comingSoonTooltip}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : content}
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>;
}