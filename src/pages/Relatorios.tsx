import { COPFLayout } from "@/components/copf/COPFLayout";
import { FilterSection } from "@/components/copf/FilterSection";
import { CriticalityHeatmap } from "@/components/copf/CriticalityHeatmap";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BarChart3, PieChart, TrendingUp, Download, Calendar, Clock, Target, Zap, CheckCircle, AlertCircle, Activity, Filter, MapPin } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MetricCard } from "@/components/copf/MetricCard";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from "recharts";
import { useState, useMemo } from "react";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useFilters } from "@/contexts/FiltersContext";

const Relatorios = () => {
  // Importar dados das ocorrências do hook
  const { occurrences } = useDashboardData();
  const { segmentFilterMulti } = useFilters();
  const [segmentoFilter, setSegmentoFilter] = useState("all");
  const [equipamentoFilter, setEquipamentoFilter] = useState("all");
  const [ufFilter, setUfFilter] = useState("all");

  // Dados base que serão filtrados
  const baseData = useMemo(() => {
    const data = [];
    for (let i = 0; i < 50; i++) {
      const segmentos = ["aa", "ab"];
      const equipamentos = ["atm", "clima", "conectividade", "seguranca"];
      const ufs = ["sp", "rj", "mg", "ba", "pr"];
      
      data.push({
        id: i,
        tempo: Math.max(0.5, 15 - (i * 0.3) - Math.random() * 2),
        segmento: segmentos[Math.floor(Math.random() * segmentos.length)],
        equipamento: equipamentos[Math.floor(Math.random() * equipamentos.length)],
        uf: ufs[Math.floor(Math.random() * ufs.length)]
      });
    }
    return data.sort((a, b) => a.tempo - b.tempo);
  }, []);

  // Dados filtrados
  const filteredData = useMemo(() => {
    return baseData.filter(item => {
      return (segmentoFilter === "all" || item.segmento === segmentoFilter) &&
             (equipamentoFilter === "all" || item.equipamento === equipamentoFilter) &&
             (ufFilter === "all" || item.uf === ufFilter);
    });
  }, [baseData, segmentoFilter, equipamentoFilter, ufFilter]);

  // Métricas calculadas
  const metrics = useMemo(() => {
    if (filteredData.length === 0) return { p50: 0, p90: 0, p95: 0, p99: 0 };
    
    const sortedTimes = filteredData.map(d => d.tempo).sort((a, b) => a - b);
    const p50 = sortedTimes[Math.floor(sortedTimes.length * 0.5)];
    const p90 = sortedTimes[Math.floor(sortedTimes.length * 0.9)];
    const p95 = sortedTimes[Math.floor(sortedTimes.length * 0.95)];
    const p99 = sortedTimes[Math.floor(sortedTimes.length * 0.99)];
    
    return { p50, p90, p95, p99 };
  }, [filteredData]);
  return (
    <COPFLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Header melhorado */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5 rounded-xl border">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground tracking-tight">Relatórios</h1>
            <p className="text-muted-foreground flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Análises e métricas detalhadas do sistema • 2.360 agências monitoradas
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="hover-scale">
              <Calendar className="mr-2 h-4 w-4" />
              Período
            </Button>
            <Button variant="premium" className="hover-scale">
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </Button>
          </div>
        </div>

        {/* Filtros */}
        <FilterSection />

        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList className="grid w-full grid-cols-5 h-12 bg-muted/50 p-1">
            <TabsTrigger value="overview" className="transition-all duration-200">Visão Geral</TabsTrigger>
            <TabsTrigger value="performance" className="transition-all duration-200">Performance</TabsTrigger>
            <TabsTrigger value="aa-ab" className="transition-all duration-200">Criticidade AA/AB</TabsTrigger>
            <TabsTrigger value="trends" className="transition-all duration-200">Tendências</TabsTrigger>
            <TabsTrigger value="sla" className="transition-all duration-200">SLA</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="hover-scale border-l-4 border-l-primary">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    Ocorrências por Equipamento
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {[
                      { name: "ATMs", percent: 42, color: "primary" },
                      { name: "Climatização", percent: 31, color: "secondary" },
                      { name: "Conectividade", percent: 27, color: "accent" }
                    ].map((item, index) => (
                      <div key={index} className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{item.name}</span>
                          <span className="text-sm font-bold text-foreground">{item.percent}%</span>
                        </div>
                        <div className="relative w-full bg-muted h-3 rounded-full overflow-hidden">
                          <div 
                            className={`bg-${item.color} h-3 rounded-full transition-all duration-700 ease-out shadow-sm`}
                            style={{ width: `${item.percent}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="hover-scale border-l-4 border-l-secondary">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <PieChart className="h-5 w-5 text-secondary" />
                    Distribuição por Região
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {[
                      { name: "Sudeste", percent: 45, count: "1.062", color: "primary" },
                      { name: "Nordeste", percent: 25, count: "590", color: "secondary" },
                      { name: "Sul", percent: 18, count: "425", color: "accent" },
                      { name: "Centro-Oeste", percent: 12, count: "283", color: "warning" }
                    ].map((item, index) => (
                      <div key={index} className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{item.name}</span>
                          <div className="text-right">
                            <span className="text-sm font-bold text-foreground">{item.percent}%</span>
                            <p className="text-xs text-muted-foreground">{item.count} agências</p>
                          </div>
                        </div>
                        <div className="relative w-full bg-muted h-3 rounded-full overflow-hidden">
                          <div 
                            className={`bg-${item.color} h-3 rounded-full transition-all duration-700 ease-out shadow-sm`}
                            style={{ width: `${item.percent}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-8 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="hover-scale border-l-4 border-l-accent">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Target className="h-5 w-5 text-accent" />
                    Performance por Fornecedor
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[320px]">
                    <div className="space-y-4">
                      {[
                        { name: "TechServ Solutions", mttr: "1.5h", resolucao: "98%", status: "excellent" },
                        { name: "GlobalFix Corp", mttr: "1.8h", resolucao: "96%", status: "excellent" },
                        { name: "QuickResponse Ltd", mttr: "2.2h", resolucao: "95%", status: "good" },
                        { name: "ServicePro Inc", mttr: "2.8h", resolucao: "93%", status: "good" },
                        { name: "FastFix Technologies", mttr: "3.1h", resolucao: "89%", status: "warning" }
                      ].map((vendor, index) => (
                        <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors">
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
                            <div className="font-medium">MTTR: {vendor.mttr}</div>
                            <div className="text-muted-foreground">Resolução: {vendor.resolucao}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              <Card className="hover-scale border-l-4 border-l-success">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Activity className="h-5 w-5 text-success" />
                    Eficiência por Equipamento
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {[
                      { equip: "ATMs", eficiencia: 96, cor: "primary" },
                      { equip: "Climatização", eficiencia: 89, cor: "secondary" },
                      { equip: "Conectividade", eficiencia: 93, cor: "accent" },
                      { equip: "Segurança", eficiencia: 98, cor: "success" }
                    ].map((item, index) => (
                      <div key={index} className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">{item.equip}</span>
                          <span className="text-sm font-bold text-foreground">{item.eficiencia}%</span>
                        </div>
                        <div className="relative">
                          <Progress value={item.eficiencia} className="h-3" />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-xs font-medium text-white drop-shadow">
                              {item.eficiencia}%
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="aa-ab" className="space-y-8 animate-fade-in">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-gradient-primary">
                      <MapPin className="h-5 w-5 text-white" />
                    </div>
                    Mapa de Criticidade por Equipamento
                  </h2>
                  <p className="text-muted-foreground mt-1">Análise detalhada de criticidade por segmento AA e AB</p>
                </div>
              </div>

              <Tabs defaultValue="all" className="space-y-6">
                <TabsList className="grid w-full grid-cols-3 max-w-md">
                  <TabsTrigger value="all">Todos</TabsTrigger>
                  <TabsTrigger value="aa">Segmento AA</TabsTrigger>
                  <TabsTrigger value="ab">Segmento AB</TabsTrigger>
                </TabsList>

                <TabsContent value="all">
                  <Card className="border-l-4 border-l-primary">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5 text-primary" />
                        Criticidade - Todos os Segmentos
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CriticalityHeatmap occurrences={occurrences} />
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="aa">
                  <Card className="border-l-4 border-l-secondary">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5 text-secondary" />
                        Criticidade - Segmento AA
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CriticalityHeatmap 
                        occurrences={occurrences.filter(o => o.segment === 'AA')} 
                      />
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="ab">
                  <Card className="border-l-4 border-l-accent">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5 text-accent" />
                        Criticidade - Segmento AB
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CriticalityHeatmap 
                        occurrences={occurrences.filter(o => o.segment === 'AB')} 
                      />
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
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
                  <CardTitle>SLA por Tipo de Criticidade</CardTitle>
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
        </Tabs>
      </div>
    </COPFLayout>
  );
};

export default Relatorios;