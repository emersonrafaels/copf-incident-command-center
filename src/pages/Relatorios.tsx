import { COPFLayout } from "@/components/copf/COPFLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BarChart3, PieChart, TrendingUp, Download, Calendar, Clock, Target, Zap, CheckCircle, AlertCircle, Activity } from "lucide-react";
import { MetricCard } from "@/components/copf/MetricCard";

const Relatorios = () => {
  return (
    <COPFLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Relatórios</h1>
            <p className="text-muted-foreground">Análises e métricas detalhadas do sistema</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Calendar className="mr-2 h-4 w-4" />
              Período
            </Button>
            <Button variant="premium">
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </Button>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="trends">Tendências</TabsTrigger>
            <TabsTrigger value="sla">SLA</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                title="Ocorrências Totais"
                value="1,234"
                change="+12%"
                changeType="positive"
                icon={<BarChart3 className="h-4 w-4" />}
              />
              <MetricCard
                title="Taxa de Resolução"
                value="87.5%"
                change="+5.2%"
                changeType="positive"
                icon={<TrendingUp className="h-4 w-4" />}
              />
              <MetricCard
                title="MTTR Médio"
                value="4.2h"
                change="-15%"
                changeType="positive"
                icon={<BarChart3 className="h-4 w-4" />}
              />
              <MetricCard
                title="Satisfação"
                value="94%"
                change="+8%"
                changeType="positive"
                icon={<PieChart className="h-4 w-4" />}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Ocorrências por Equipamento</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">ATMs</span>
                      <span className="text-sm font-medium">45%</span>
                    </div>
                    <div className="w-full bg-muted h-2 rounded-full">
                      <div className="bg-primary h-2 rounded-full" style={{ width: '45%' }}></div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Climatização</span>
                      <span className="text-sm font-medium">28%</span>
                    </div>
                    <div className="w-full bg-muted h-2 rounded-full">
                      <div className="bg-secondary h-2 rounded-full" style={{ width: '28%' }}></div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Conectividade</span>
                      <span className="text-sm font-medium">27%</span>
                    </div>
                    <div className="w-full bg-muted h-2 rounded-full">
                      <div className="bg-accent h-2 rounded-full" style={{ width: '27%' }}></div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Severidade das Ocorrências</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Crítica</span>
                      <span className="text-sm font-medium">15%</span>
                    </div>
                    <div className="w-full bg-muted h-2 rounded-full">
                      <div className="bg-destructive h-2 rounded-full" style={{ width: '15%' }}></div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Alta</span>
                      <span className="text-sm font-medium">35%</span>
                    </div>
                    <div className="w-full bg-muted h-2 rounded-full">
                      <div className="bg-warning h-2 rounded-full" style={{ width: '35%' }}></div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Média</span>
                      <span className="text-sm font-medium">50%</span>
                    </div>
                    <div className="w-full bg-muted h-2 rounded-full">
                      <div className="bg-success h-2 rounded-full" style={{ width: '50%' }}></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                title="MTTR Médio"
                value="2.4h"
                change="-12%"
                changeType="positive"
                icon={<Clock className="h-4 w-4" />}
              />
              <MetricCard
                title="Taxa de Resolução"
                value="94.2%"
                change="+5.8%"
                changeType="positive"
                icon={<CheckCircle className="h-4 w-4" />}
              />
              <MetricCard
                title="Tempo de Resposta"
                value="15min"
                change="-8%"
                changeType="positive"
                icon={<Zap className="h-4 w-4" />}
              />
              <MetricCard
                title="Disponibilidade"
                value="99.8%"
                change="+0.3%"
                changeType="positive"
                icon={<Activity className="h-4 w-4" />}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Performance por Fornecedor</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[300px]">
                    <div className="space-y-4">
                      {[
                        { name: "TechServ Solutions", mttr: "1.8h", resolucao: "97%", status: "excellent" },
                        { name: "GlobalFix Corp", mttr: "2.1h", resolucao: "95%", status: "good" },
                        { name: "QuickResponse Ltd", mttr: "2.8h", resolucao: "92%", status: "good" },
                        { name: "ServicePro Inc", mttr: "3.2h", resolucao: "89%", status: "warning" },
                        { name: "FastFix Technologies", mttr: "4.1h", resolucao: "85%", status: "poor" }
                      ].map((vendor, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <Badge 
                              variant={
                                vendor.status === "excellent" ? "default" :
                                vendor.status === "good" ? "secondary" :
                                vendor.status === "warning" ? "outline" : "destructive"
                              }
                            >
                              {vendor.status === "excellent" ? "Excelente" :
                               vendor.status === "good" ? "Bom" :
                               vendor.status === "warning" ? "Regular" : "Ruim"}
                            </Badge>
                            <span className="font-medium">{vendor.name}</span>
                          </div>
                          <div className="text-right text-sm">
                            <div>MTTR: {vendor.mttr}</div>
                            <div>Resolução: {vendor.resolucao}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Eficiência por Tipo de Equipamento</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { equip: "ATMs", eficiencia: 94, cor: "bg-primary" },
                      { equip: "Climatização", eficiencia: 87, cor: "bg-secondary" },
                      { equip: "Conectividade", eficiencia: 91, cor: "bg-accent" },
                      { equip: "Segurança", eficiencia: 96, cor: "bg-success" }
                    ].map((item, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">{item.equip}</span>
                          <span className="text-sm">{item.eficiencia}%</span>
                        </div>
                        <Progress value={item.eficiencia} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Tendência de Ocorrências (Últimos 6 meses)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { mes: "Janeiro", ocorrencias: 245, variacao: "+5%" },
                      { mes: "Fevereiro", ocorrencias: 238, variacao: "-3%" },
                      { mes: "Março", ocorrencias: 267, variacao: "+12%" },
                      { mes: "Abril", ocorrencias: 223, variacao: "-16%" },
                      { mes: "Maio", ocorrencias: 251, variacao: "+13%" },
                      { mes: "Junho", ocorrencias: 234, variacao: "-7%" }
                    ].map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded">
                        <span className="font-medium">{item.mes}</span>
                        <div className="flex items-center gap-2">
                          <span>{item.ocorrencias}</span>
                          <Badge variant={item.variacao.startsWith('+') ? "destructive" : "default"}>
                            {item.variacao}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Previsão de Demanda</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-muted rounded-lg">
                      <h4 className="font-medium mb-2">Próximos 30 dias</h4>
                      <div className="text-2xl font-bold text-primary">~198 ocorrências</div>
                      <p className="text-sm text-muted-foreground">Baseado em padrões históricos</p>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm">Críticas esperadas</span>
                        <span className="text-sm font-medium">12-15</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Alta prioridade</span>
                        <span className="text-sm font-medium">45-52</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Média prioridade</span>
                        <span className="text-sm font-medium">98-112</span>
                      </div>
                    </div>

                    <div className="mt-4 p-3 bg-warning/10 border border-warning/20 rounded">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-warning" />
                        <span className="text-sm font-medium">Alerta de Tendência</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Aumento de 15% em falhas de ATM nas últimas 3 semanas
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Análise Sazonal</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded">
                    <h4 className="font-medium">Pico de Verão</h4>
                    <div className="text-2xl font-bold text-destructive">+28%</div>
                    <p className="text-sm text-muted-foreground">Falhas em climatização</p>
                  </div>
                  <div className="text-center p-4 border rounded">
                    <h4 className="font-medium">Final de Ano</h4>
                    <div className="text-2xl font-bold text-warning">+15%</div>
                    <p className="text-sm text-muted-foreground">Sobrecarga de ATMs</p>
                  </div>
                  <div className="text-center p-4 border rounded">
                    <h4 className="font-medium">Período Estável</h4>
                    <div className="text-2xl font-bold text-success">-5%</div>
                    <p className="text-sm text-muted-foreground">Março-Maio</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sla" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                title="SLA Geral"
                value="96.5%"
                change="+2.1%"
                changeType="positive"
                icon={<Target className="h-4 w-4" />}
              />
              <MetricCard
                title="SLA Crítico"
                value="98.2%"
                change="+1.5%"
                changeType="positive"
                icon={<AlertCircle className="h-4 w-4" />}
              />
              <MetricCard
                title="Tempo Médio"
                value="3.2h"
                change="-18%"
                changeType="positive"
                icon={<Clock className="h-4 w-4" />}
              />
              <MetricCard
                title="Conformidade"
                value="94.7%"
                change="+3.2%"
                changeType="positive"
                icon={<CheckCircle className="h-4 w-4" />}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>SLA por Tipo de Severidade</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { tipo: "Crítica", meta: "2h", atual: "1.8h", percentual: 98, status: "success" },
                      { tipo: "Alta", meta: "4h", atual: "3.2h", percentual: 95, status: "success" },
                      { tipo: "Média", meta: "8h", atual: "6.5h", percentual: 92, status: "warning" },
                      { tipo: "Baixa", meta: "24h", atual: "18h", percentual: 89, status: "warning" }
                    ].map((item, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{item.tipo}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">Meta: {item.meta}</span>
                            <Badge 
                              variant={item.status === "success" ? "default" : "secondary"}
                            >
                              {item.percentual}%
                            </Badge>
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Tempo atual: {item.atual}
                        </div>
                        <Progress value={item.percentual} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Histórico de Descumprimento</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[300px]">
                    <div className="space-y-3">
                      {[
                        { data: "2024-01-15", ocorrencia: "OCR-2024-0123", motivo: "Peça indisponível", impacto: "Alto" },
                        { data: "2024-01-12", ocorrencia: "OCR-2024-0118", motivo: "Fornecedor ausente", impacto: "Médio" },
                        { data: "2024-01-08", ocorrencia: "OCR-2024-0098", motivo: "Complexidade técnica", impacto: "Alto" },
                        { data: "2024-01-05", ocorrencia: "OCR-2024-0087", motivo: "Acesso restrito", impacto: "Baixo" }
                      ].map((item, index) => (
                        <div key={index} className="p-3 border rounded">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-medium text-sm">{item.ocorrencia}</div>
                              <div className="text-sm text-muted-foreground">{item.data}</div>
                              <div className="text-sm mt-1">{item.motivo}</div>
                            </div>
                            <Badge 
                              variant={
                                item.impacto === "Alto" ? "destructive" :
                                item.impacto === "Médio" ? "secondary" : "outline"
                              }
                            >
                              {item.impacto}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Relatórios Executivos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border rounded hover:bg-muted/50 transition-colors cursor-pointer">
                    <h4 className="font-medium">Relatório Mensal</h4>
                    <p className="text-sm text-muted-foreground">Resumo completo do mês</p>
                    <Button variant="outline" size="sm" className="mt-2">
                      <Download className="h-4 w-4 mr-2" />
                      Baixar PDF
                    </Button>
                  </div>
                  <div className="p-4 border rounded hover:bg-muted/50 transition-colors cursor-pointer">
                    <h4 className="font-medium">Dashboard Executivo</h4>
                    <p className="text-sm text-muted-foreground">KPIs principais</p>
                    <Button variant="outline" size="sm" className="mt-2">
                      <Download className="h-4 w-4 mr-2" />
                      Baixar Excel
                    </Button>
                  </div>
                  <div className="p-4 border rounded hover:bg-muted/50 transition-colors cursor-pointer">
                    <h4 className="font-medium">Análise de Tendências</h4>
                    <p className="text-sm text-muted-foreground">Projeções e insights</p>
                    <Button variant="outline" size="sm" className="mt-2">
                      <Download className="h-4 w-4 mr-2" />
                      Baixar PowerBI
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </COPFLayout>
  );
};

export default Relatorios;