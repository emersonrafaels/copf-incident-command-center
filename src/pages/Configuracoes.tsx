import { COPFLayout } from "@/components/copf/COPFLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Bell, Palette, Database, LayoutDashboard } from "lucide-react";
import { ComingSoonOverlay } from "@/components/copf/ComingSoonOverlay";
import { ComingSoonBadge } from "@/components/copf/ComingSoonBadge";
import { PopulateOccurrencesButton } from "@/components/copf/PopulateOccurrencesButton";
import { DashboardOrderConfig } from "@/components/copf/DashboardOrderConfig";

const Configuracoes = () => {
  return (
    <COPFLayout>
      <ComingSoonOverlay
        title="Configurações Avançadas"
        description="Painel completo de configurações e personalização do sistema"
        version="Versão Futura (após MVP)"
        releaseDate="Q2 2024"
        features={[
          "Configurações de perfis e permissões",
          "Personalização avançada da interface",
          "Configuração de integrações externas",
          "Gestão de notificações personalizáveis",
          "Configurações de backup e segurança",
          "Logs de auditoria e compliance"
        ]}
      >
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Configurações</h1>
              <p className="text-muted-foreground">Configurações do sistema e preferências</p>
            </div>
            <ComingSoonBadge size="lg" />
          </div>

          <Tabs defaultValue="geral" className="space-y-6">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="geral">Geral</TabsTrigger>
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="notificacoes">Notificações</TabsTrigger>
              <TabsTrigger value="funcionalidades">Funcionalidades</TabsTrigger>
              <TabsTrigger value="aparencia">Aparência</TabsTrigger>
              <TabsTrigger value="edge-functions">Edge Functions</TabsTrigger>
            </TabsList>

            <TabsContent value="geral" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Configurações Gerais
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Nome do Sistema</label>
                      <Input defaultValue="Sistema COPF - Itaú" />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Timezone</label>
                      <Input defaultValue="America/Sao_Paulo" />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Idioma Padrão</label>
                      <Input defaultValue="Português (BR)" />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Refresh Rate (segundos)</label>
                      <Input defaultValue="30" type="number" />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Auto-refresh Dashboard</p>
                        <p className="text-sm text-muted-foreground">Atualizar automaticamente os dados do dashboard</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Modo Compacto</p>
                        <p className="text-sm text-muted-foreground">Reduzir espaçamento entre elementos</p>
                      </div>
                      <Switch />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="dashboard" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LayoutDashboard className="h-5 w-5" />
                    Personalização do Dashboard
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <DashboardOrderConfig />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notificacoes" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Configurações de Notificações
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Notificações Push</p>
                        <p className="text-sm text-muted-foreground">Receber notificações no navegador</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Email - Ocorrências Críticas</p>
                        <p className="text-sm text-muted-foreground">Notificar por email sobre ocorrências críticas</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Relatórios Semanais</p>
                        <p className="text-sm text-muted-foreground">Receber resumo semanal por email</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="funcionalidades" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Funcionalidades do Sistema
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Mostrar Aba Equipes</p>
                        <p className="text-sm text-muted-foreground">Exibir a seção de gestão de equipes no menu</p>
                      </div>
                      <Switch />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Mostrar Aba Comunicação</p>
                        <p className="text-sm text-muted-foreground">Exibir a seção de comunicação no menu</p>
                      </div>
                      <Switch />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="aparencia" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="h-5 w-5" />
                    Aparência e Tema
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Modo Escuro Automático</p>
                        <p className="text-sm text-muted-foreground">Alternar baseado no horário do sistema</p>
                      </div>
                      <Switch />
                    </div>
                  </div>
                  
                  <div className="space-y-4 pt-4 border-t">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Tamanho de Fonte</label>
                      <Input defaultValue="14" type="number" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="edge-functions" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    Funções Backend
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-semibold">Popular Ocorrências de Teste</p>
                        <p className="text-sm text-muted-foreground">
                          Adiciona 50 ocorrências de exemplo com dados variados para teste do sistema
                        </p>
                      </div>
                      <PopulateOccurrencesButton />
                    </div>
                    
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        <strong>Aviso:</strong> Esta função é destinada apenas para ambiente de desenvolvimento e testes. 
                        Use com cuidado em produção.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Salvar Configurações</p>
                  <p className="text-sm text-muted-foreground">As alterações serão aplicadas imediatamente</p>
                </div>
                <Button variant="premium">
                  Salvar Alterações
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </ComingSoonOverlay>
    </COPFLayout>
  );
};

export default Configuracoes;