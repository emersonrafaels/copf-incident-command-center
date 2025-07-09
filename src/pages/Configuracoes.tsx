import { COPFLayout } from "@/components/copf/COPFLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Bell, Shield, Database, Palette, Globe } from "lucide-react";

const Configuracoes = () => {
  return (
    <COPFLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Configurações</h1>
          <p className="text-muted-foreground">Configurações do sistema e preferências</p>
        </div>

        <Tabs defaultValue="geral" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="geral">Geral</TabsTrigger>
            <TabsTrigger value="notificacoes">Notificações</TabsTrigger>
            <TabsTrigger value="seguranca">Segurança</TabsTrigger>
            <TabsTrigger value="integracao">Integração</TabsTrigger>
            <TabsTrigger value="aparencia">Aparência</TabsTrigger>
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
                      <p className="font-medium">SMS - Emergências</p>
                      <p className="text-sm text-muted-foreground">Notificar por SMS em situações de emergência</p>
                    </div>
                    <Switch />
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

          <TabsContent value="seguranca" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Configurações de Segurança
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Autenticação de Dois Fatores</p>
                      <p className="text-sm text-muted-foreground">Adicionar camada extra de segurança</p>
                    </div>
                    <Switch />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Logout Automático</p>
                      <p className="text-sm text-muted-foreground">Fazer logout após inatividade</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Log de Auditoria</p>
                      <p className="text-sm text-muted-foreground">Registrar todas as ações do usuário</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
                
                <div className="space-y-4 pt-4 border-t">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Tempo de Sessão (minutos)</label>
                    <Input defaultValue="480" type="number" />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Máximo de Tentativas de Login</label>
                    <Input defaultValue="3" type="number" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="integracao" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Integrações Externas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">API ServiceNow</p>
                      <p className="text-sm text-muted-foreground">Integração com sistema de tickets</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Monitoramento Zabbix</p>
                      <p className="text-sm text-muted-foreground">Recebe alertas do sistema de monitoramento</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Google Maps API</p>
                      <p className="text-sm text-muted-foreground">Para visualização geográfica</p>
                    </div>
                    <Switch />
                  </div>
                </div>
                
                <div className="space-y-4 pt-4 border-t">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">URL API ServiceNow</label>
                    <Input placeholder="https://instance.service-now.com/api" />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Chave API Maps</label>
                    <Input placeholder="AIzaSy..." type="password" />
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
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Animações Reduzidas</p>
                      <p className="text-sm text-muted-foreground">Reduzir animações para melhor performance</p>
                    </div>
                    <Switch />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Sidebar Sempre Visível</p>
                      <p className="text-sm text-muted-foreground">Manter sidebar expandida por padrão</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Mostrar Aba Equipes</p>
                      <p className="text-sm text-muted-foreground">Exibir a seção de gestão de equipes no menu</p>
                    </div>
                    <Switch />
                  </div>
                </div>
                
                <div className="space-y-4 pt-4 border-t">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Tamanho de Fonte</label>
                    <Input defaultValue="14" type="number" />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Densidade de Informações</label>
                    <Input defaultValue="Confortável" />
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
    </COPFLayout>
  );
};

export default Configuracoes;