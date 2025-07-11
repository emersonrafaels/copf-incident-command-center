import { COPFLayout } from "@/components/copf/COPFLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BarChart3, PieChart, TrendingUp, Download, Calendar, Clock, Target, Zap, CheckCircle, AlertCircle, Activity, Filter } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MetricCard } from "@/components/copf/MetricCard";

const Relatorios = () => {
  return (
    <COPFLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Relatórios</h1>
            <p className="text-muted-foreground">Análises e métricas detalhadas do sistema (2.360 agências)</p>
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
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="trends">Tendências</TabsTrigger>
            <TabsTrigger value="sla">SLA</TabsTrigger>
            <TabsTrigger value="longtail">Long Tail</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                title="Ocorrências Totais"
                value="3,847"
                change="+8%"
                changeType="positive"
                icon={<BarChart3 className="h-4 w-4" />}
              />
              <MetricCard
                title="Taxa de Resolução"
                value="94.2%"
                change="+3.1%"
                changeType="positive"
                icon={<TrendingUp className="h-4 w-4" />}
              />
              <MetricCard
                title="MTTR Médio"
                value="2.8h"
                change="-25%"
                changeType="positive"
                icon={<BarChart3 className="h-4 w-4" />}
              />
              <MetricCard
                title="Agências Ativas"
                value="2.360"
                change="+12"
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
                      <span className="text-sm font-medium">42%</span>
                    </div>
                    <div className="w-full bg-muted h-2 rounded-full">
                      <div className="bg-primary h-2 rounded-full" style={{ width: '42%' }}></div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Climatização</span>
                      <span className="text-sm font-medium">31%</span>
                    </div>
                    <div className="w-full bg-muted h-2 rounded-full">
                      <div className="bg-secondary h-2 rounded-full" style={{ width: '31%' }}></div>
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
                  <CardTitle>Distribuição por Região</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Sudeste</span>
                      <span className="text-sm font-medium">45% (1.062 agências)</span>
                    </div>
                    <div className="w-full bg-muted h-2 rounded-full">
                      <div className="bg-primary h-2 rounded-full" style={{ width: '45%' }}></div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Nordeste</span>
                      <span className="text-sm font-medium">25% (590 agências)</span>
                    </div>
                    <div className="w-full bg-muted h-2 rounded-full">
                      <div className="bg-secondary h-2 rounded-full" style={{ width: '25%' }}></div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Sul</span>
                      <span className="text-sm font-medium">18% (425 agências)</span>
                    </div>
                    <div className="w-full bg-muted h-2 rounded-full">
                      <div className="bg-accent h-2 rounded-full" style={{ width: '18%' }}></div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Centro-Oeste</span>
                      <span className="text-sm font-medium">12% (283 agências)</span>
                    </div>
                    <div className="w-full bg-muted h-2 rounded-full">
                      <div className="bg-warning h-2 rounded-full" style={{ width: '12%' }}></div>
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
                value="2.1h"
                change="-18%"
                changeType="positive"
                icon={<Clock className="h-4 w-4" />}
              />
              <MetricCard
                title="Taxa de Resolução"
                value="96.8%"
                change="+4.2%"
                changeType="positive"
                icon={<CheckCircle className="h-4 w-4" />}
              />
              <MetricCard
                title="Tempo de Resposta"
                value="12min"
                change="-15%"
                changeType="positive"
                icon={<Zap className="h-4 w-4" />}
              />
              <MetricCard
                title="Disponibilidade"
                value="99.4%"
                change="+0.8%"
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
                        { name: "TechServ Solutions", mttr: "1.5h", resolucao: "98%", status: "excellent" },
                        { name: "GlobalFix Corp", mttr: "1.8h", resolucao: "96%", status: "excellent" },
                        { name: "QuickResponse Ltd", mttr: "2.2h", resolucao: "95%", status: "good" },
                        { name: "ServicePro Inc", mttr: "2.8h", resolucao: "93%", status: "good" },
                        { name: "FastFix Technologies", mttr: "3.1h", resolucao: "89%", status: "warning" }
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
                      { equip: "ATMs", eficiencia: 96, cor: "bg-primary" },
                      { equip: "Climatização", eficiencia: 89, cor: "bg-secondary" },
                      { equip: "Conectividade", eficiencia: 93, cor: "bg-accent" },
                      { equip: "Segurança", eficiencia: 98, cor: "bg-success" }
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
                      { mes: "Janeiro", ocorrencias: 612, variacao: "+3%" },
                      { mes: "Fevereiro", ocorrencias: 587, variacao: "-4%" },
                      { mes: "Março", ocorrencias: 634, variacao: "+8%" },
                      { mes: "Abril", ocorrencias: 568, variacao: "-10%" },
                      { mes: "Maio", ocorrencias: 641, variacao: "+13%" },
                      { mes: "Junho", ocorrencias: 605, variacao: "-6%" }
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
                      <div className="text-2xl font-bold text-primary">~595 ocorrências</div>
                      <p className="text-sm text-muted-foreground">Baseado em padrões históricos</p>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm">Críticas esperadas</span>
                        <span className="text-sm font-medium">35-42</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Alta prioridade</span>
                        <span className="text-sm font-medium">125-148</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Média prioridade</span>
                        <span className="text-sm font-medium">280-315</span>
                      </div>
                    </div>

                    <div className="mt-4 p-3 bg-warning/10 border border-warning/20 rounded">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-warning" />
                        <span className="text-sm font-medium">Alerta de Tendência</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Aumento de 12% em falhas de climatização devido ao período de verão
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
                value="97.8%"
                change="+1.3%"
                changeType="positive"
                icon={<Target className="h-4 w-4" />}
              />
              <MetricCard
                title="SLA Crítico"
                value="98.9%"
                change="+0.7%"
                changeType="positive"
                icon={<AlertCircle className="h-4 w-4" />}
              />
              <MetricCard
                title="Tempo Médio"
                value="2.1h"
                change="-22%"
                changeType="positive"
                icon={<Clock className="h-4 w-4" />}
              />
              <MetricCard
                title="Conformidade"
                value="96.3%"
                change="+2.6%"
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
                      { tipo: "Crítica", meta: "1h", atual: "45min", percentual: 99, status: "success" },
                      { tipo: "Alta", meta: "2h", atual: "1h 35min", percentual: 97, status: "success" },
                      { tipo: "Média", meta: "4h", atual: "3h 15min", percentual: 95, status: "success" },
                      { tipo: "Baixa", meta: "6h", atual: "4h 30min", percentual: 93, status: "warning" }
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
                        <div className="flex justify-between text-sm">
                          <span>Tempo atual: {item.atual}</span>
                        </div>
                        <Progress value={item.percentual} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Cumprimento de SLA por Fornecedor</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { fornecedor: "TechServ Solutions", sla: 99.2, trend: "+0.3%" },
                      { fornecedor: "GlobalFix Corp", sla: 98.5, trend: "+1.2%" },
                      { fornecedor: "QuickResponse Ltd", sla: 96.8, trend: "-0.5%" },
                      { fornecedor: "ServicePro Inc", sla: 94.2, trend: "+2.1%" },
                      { fornecedor: "FastFix Technologies", sla: 91.7, trend: "-1.8%" }
                    ].map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded">
                        <span className="font-medium">{item.fornecedor}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold">{item.sla}%</span>
                          <Badge variant={item.trend.startsWith('+') ? "default" : "destructive"}>
                            {item.trend}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Nova aba Long Tail */}
          <TabsContent value="longtail" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Análise Long Tail - Tempos de Resolução
                </CardTitle>
                <div className="flex gap-2 mt-4">
                  <Select defaultValue="all">
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Segmento" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os Segmentos</SelectItem>
                      <SelectItem value="aa">Segmento AA</SelectItem>
                      <SelectItem value="ab">Segmento AB</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select defaultValue="all">
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Equipamento" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os Equipamentos</SelectItem>
                      <SelectItem value="atm">ATM</SelectItem>
                      <SelectItem value="clima">Climatização</SelectItem>
                      <SelectItem value="conectividade">Conectividade</SelectItem>
                      <SelectItem value="seguranca">Segurança</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select defaultValue="all">
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="UF" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as UFs</SelectItem>
                      <SelectItem value="sp">São Paulo</SelectItem>
                      <SelectItem value="rj">Rio de Janeiro</SelectItem>
                      <SelectItem value="mg">Minas Gerais</SelectItem>
                      <SelectItem value="ba">Bahia</SelectItem>
                      <SelectItem value="pr">Paraná</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button variant="outline">
                    <Filter className="mr-2 h-4 w-4" />
                    Aplicar Filtros
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Gráfico Long Tail simulado */}
                  <div className="h-80 bg-muted/30 rounded-lg border-2 border-dashed border-muted flex items-center justify-center relative overflow-hidden">
                    {/* Simulação de barras do long tail */}
                    <div className="absolute bottom-0 left-0 right-0 flex items-end justify-center gap-1 p-4">
                      {Array.from({ length: 50 }, (_, i) => {
                        const height = Math.max(10, 300 - (i * 8) - Math.random() * 20);
                        const isOutlier = i > 40;
                        return (
                          <div 
                            key={i}
                            className={`w-3 ${isOutlier ? 'bg-destructive' : 'bg-primary'} transition-all hover:opacity-80 cursor-pointer`}
                            style={{ height: `${(height/300) * 280}px` }}
                            title={`Tempo: ${(height/10).toFixed(1)}h`}
                          />
                        );
                      })}
                    </div>
                    <div className="text-center text-muted-foreground">
                      <BarChart3 className="h-8 w-8 mx-auto mb-2" />
                      <p className="text-sm">Gráfico Long Tail - Tempos de Resolução</p>
                      <p className="text-xs">Ocorrências ordenadas por tempo crescente</p>
                    </div>
                  </div>

                  {/* Estatísticas do Long Tail */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-primary">2.1h</div>
                        <div className="text-sm text-muted-foreground">Mediana</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-secondary">3.8h</div>
                        <div className="text-sm text-muted-foreground">P90 (90%)</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-warning">7.2h</div>
                        <div className="text-sm text-muted-foreground">P95 (95%)</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-destructive">15.6h</div>
                        <div className="text-sm text-muted-foreground">P99 (99%)</div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Análise dos Outliers */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Outliers (Top 5% - Maior Tempo)</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {[
                            { id: "OC2847", tempo: "15.6h", motivo: "Peça sem estoque", agencia: "AG0234 - Brasília/DF" },
                            { id: "OC2831", tempo: "12.3h", motivo: "Acesso restrito", agencia: "AG1456 - Fortaleza/CE" },
                            { id: "OC2756", tempo: "11.8h", motivo: "Técnico indisponível", agencia: "AG0789 - Curitiba/PR" },
                            { id: "OC2692", tempo: "10.4h", motivo: "Problema complexo", agencia: "AG0134 - Rio de Janeiro/RJ" },
                            { id: "OC2634", tempo: "9.7h", motivo: "Aguardando aprovação", agencia: "AG0456 - Belo Horizonte/MG" }
                          ].map((item, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-destructive/5 border border-destructive/20 rounded">
                              <div>
                                <span className="font-medium text-sm">{item.id}</span>
                                <p className="text-xs text-muted-foreground">{item.agencia}</p>
                                <p className="text-xs text-muted-foreground">{item.motivo}</p>
                              </div>
                              <Badge variant="destructive">{item.tempo}</Badge>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Distribuição por Faixas de Tempo</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {[
                            { faixa: "< 1h", count: 1247, percent: 32, color: "bg-success" },
                            { faixa: "1h - 2h", count: 1156, percent: 30, color: "bg-primary" },
                            { faixa: "2h - 4h", count: 925, percent: 24, color: "bg-secondary" },
                            { faixa: "4h - 6h", count: 356, percent: 9, color: "bg-warning" },
                            { faixa: "6h - 12h", count: 134, percent: 3, color: "bg-destructive" },
                            { faixa: "> 12h", count: 29, percent: 1, color: "bg-destructive" }
                          ].map((item, index) => (
                            <div key={index} className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="font-medium">{item.faixa}</span>
                                <span>{item.count} ocorrências ({item.percent}%)</span>
                              </div>
                              <div className="w-full bg-muted h-2 rounded-full">
                                <div 
                                  className={`${item.color} h-2 rounded-full transition-all`}
                                  style={{ width: `${item.percent}%` }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
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