import { useState } from "react"
import { NavLink, useLocation } from "react-router-dom"
import { 
  BarChart3, 
  MapPin, 
  FileText, 
  MessageSquare, 
  Users, 
  Settings,
  Home
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"

const navigation = [
  { 
    title: "Dashboard", 
    url: "/", 
    icon: Home,
    description: "Visão geral e KPIs"
  },
  { 
    title: "Ocorrências", 
    url: "/ocorrencias", 
    icon: FileText,
    description: "Lista detalhada de ocorrências"
  },
  { 
    title: "Mapa de Calor", 
    url: "/mapa", 
    icon: MapPin,
    description: "Visualização geográfica"
  },
  { 
    title: "Relatórios", 
    url: "/relatorios", 
    icon: BarChart3,
    description: "Análises e métricas"
  },
  { 
    title: "Comunicação", 
    url: "/comunicacao", 
    icon: MessageSquare,
    description: "Gestão de fornecedores"
  },
  { 
    title: "Equipes", 
    url: "/equipes", 
    icon: Users,
    description: "Gestão de usuários"
  }
]

const adminNavigation = [
  { 
    title: "Configurações", 
    url: "/configuracoes", 
    icon: Settings,
    description: "Configurações do sistema"
  }
]

export function COPFSidebar() {
  const { state } = useSidebar()
  const location = useLocation()
  const currentPath = location.pathname
  const collapsed = state === "collapsed"

  const isActive = (path: string) => {
    if (path === "/" && currentPath === "/") return true
    if (path !== "/" && currentPath.startsWith(path)) return true
    return false
  }

  const getNavCls = (path: string) => {
    const active = isActive(path)
    return active 
      ? "bg-primary/10 text-primary border-r-2 border-primary font-medium hover:bg-primary/15" 
      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
  }

  return (
    <Sidebar
      className={collapsed ? "w-16" : "w-64"}
      collapsible="icon"
    >
      <SidebarContent className="bg-gradient-subtle">
        {/* Header */}
        <div className="p-4 border-b">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">IT</span>
            </div>
            {!collapsed && (
              <div>
                <h2 className="font-semibold text-foreground">COPF</h2>
                <p className="text-xs text-muted-foreground">Gestão de Ocorrências</p>
              </div>
            )}
          </div>
        </div>

        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Navegação Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      className={getNavCls(item.url)}
                      title={collapsed ? item.description : undefined}
                    >
                      <item.icon className="h-5 w-5" />
                      {!collapsed && (
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">{item.title}</span>
                          <span className="text-xs text-muted-foreground">{item.description}</span>
                        </div>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Admin Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Administração</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminNavigation.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      className={getNavCls(item.url)}
                      title={collapsed ? item.description : undefined}
                    >
                      <item.icon className="h-5 w-5" />
                      {!collapsed && (
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">{item.title}</span>
                          <span className="text-xs text-muted-foreground">{item.description}</span>
                        </div>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}