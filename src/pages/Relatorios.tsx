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
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from "recharts";
import { useState, useMemo } from "react";

const Relatorios = () => {
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

        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList className="grid w-full grid-cols-5 h-12 bg-muted/50 p-1">
            <TabsTrigger value="overview" className="transition-all duration-200">Visão Geral</TabsTrigger>
            <TabsTrigger value="performance" className="transition-all duration-200">Performance</TabsTrigger>
            <TabsTrigger value="trends" className="transition-all duration-200">Tendências</TabsTrigger>
            <TabsTrigger value="sla" className="transition-all duration-200">SLA</TabsTrigger>
            <TabsTrigger value="longtail" className="transition-all duration-200">Long Tail</TabsTrigger>
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
                  <Select value={segmentoFilter} onValueChange={setSegmentoFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Segmento" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os Segmentos</SelectItem>
                      <SelectItem value="aa">Segmento AA</SelectItem>
                      <SelectItem value="ab">Segmento AB</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={equipamentoFilter} onValueChange={setEquipamentoFilter}>
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
                  
                  <Select value={ufFilter} onValueChange={setUfFilter}>
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
                    {/* Gráfico Long Tail com UI/UX melhorado */}
                    <div className="relative">
                      {/* Header com métricas resumidas */}
                      <div className="mb-6 p-4 bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5 rounded-lg border">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-primary">{filteredData.length}</div>
                            <div className="text-sm text-muted-foreground">Total de Ocorrências</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-secondary">{metrics.p50.toFixed(1)}h</div>
                            <div className="text-sm text-muted-foreground">Mediana (P50)</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-warning">{metrics.p90.toFixed(1)}h</div>
                            <div className="text-sm text-muted-foreground">P90 (Meta)</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-destructive">{filteredData.filter(d => d.tempo > metrics.p95).length}</div>
                            <div className="text-sm text-muted-foreground">Outliers (&gt;P95)</div>
                          </div>
                        </div>
                      </div>

                      {/* Gráfico melhorado */}
                      <div className="h-[500px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={filteredData.map((item, index) => ({
                              index: index + 1,
                              tempo: parseFloat(item.tempo.toFixed(1)),
                              isOutlier: item.tempo > metrics.p95,
                              isNormal: item.tempo <= metrics.p90,
                              ocorrencia: `OC${item.id + 1000}`,
                              segmento: item.segmento.toUpperCase(),
                              equipamento: item.equipamento,
                              uf: item.uf.toUpperCase()
                            }))}
                            margin={{ top: 30, right: 30, left: 50, bottom: 60 }}
                          >
                            <CartesianGrid 
                              strokeDasharray="2 4" 
                              stroke="hsl(var(--muted-foreground) / 0.15)" 
                              horizontal={true}
                              vertical={false}
                            />
                            <XAxis 
                              dataKey="index" 
                              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                              axisLine={{ stroke: "hsl(var(--border))" }}
                              tickLine={{ stroke: "hsl(var(--border))" }}
                              label={{ 
                                value: 'Ocorrências ordenadas por tempo de resolução (menor → maior)', 
                                position: 'insideBottom', 
                                offset: -5,
                                style: { 
                                  textAnchor: 'middle', 
                                  fontSize: '12px',
                                  fill: 'hsl(var(--foreground))',
                                  fontWeight: '500'
                                }
                              }}
                            />
                            <YAxis 
                              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                              axisLine={{ stroke: "hsl(var(--border))" }}
                              tickLine={{ stroke: "hsl(var(--border))" }}
                              label={{ 
                                value: 'Tempo de Resolução (horas)', 
                                angle: -90, 
                                position: 'insideLeft', 
                                style: { 
                                  textAnchor: 'middle',
                                  fontSize: '12px',
                                  fill: 'hsl(var(--foreground))',
                                  fontWeight: '500'
                                }
                              }}
                            />
                            <Tooltip 
                              cursor={{ fill: "hsl(var(--muted) / 0.3)" }}
                              content={({ active, payload, label }) => {
                                if (active && payload && payload.length) {
                                  const data = payload[0].payload;
                                  return (
                                    <div className="bg-background/95 backdrop-blur-sm border border-border rounded-lg p-4 shadow-xl">
                                      <div className="flex items-center gap-2 mb-2">
                                        <div className={`w-3 h-3 rounded-full ${
                                          data.isOutlier ? 'bg-destructive' : 
                                          data.tempo > metrics.p90 ? 'bg-warning' : 'bg-primary'
                                        }`}></div>
                                        <p className="font-semibold text-foreground">{data.ocorrencia}</p>
                                      </div>
                                      <div className="space-y-1 text-sm">
                                        <p><span className="text-muted-foreground">Tempo:</span> <span className="font-medium">{data.tempo}h</span></p>
                                        <p><span className="text-muted-foreground">Posição:</span> <span className="font-medium">#{data.index}</span></p>
                                        <p><span className="text-muted-foreground">Segmento:</span> <span className="font-medium">{data.segmento}</span></p>
                                        <p><span className="text-muted-foreground">Equipamento:</span> <span className="font-medium capitalize">{data.equipamento}</span></p>
                                        <p><span className="text-muted-foreground">UF:</span> <span className="font-medium">{data.uf}</span></p>
                                      </div>
                                      {data.isOutlier && (
                                        <div className="mt-2 p-2 bg-destructive/10 border border-destructive/20 rounded text-xs">
                                          <span className="text-destructive font-medium">⚠️ Outlier - Investigação necessária</span>
                                        </div>
                                      )}
                                    </div>
                                  );
                                }
                                return null;
                              }}
                            />
                            
                            {/* Linhas de referência melhoradas */}
                            <ReferenceLine 
                              y={metrics.p90} 
                              stroke="hsl(var(--warning))" 
                              strokeDasharray="6 4" 
                              strokeWidth={2}
                              label={{ 
                                value: `Meta P90: ${metrics.p90.toFixed(1)}h`, 
                                position: "insideTopLeft",
                                style: { 
                                  fontSize: '11px', 
                                  fill: 'hsl(var(--warning))',
                                  fontWeight: '600'
                                }
                              }}
                            />
                            
                            <ReferenceLine 
                              y={metrics.p95} 
                              stroke="hsl(var(--destructive))" 
                              strokeDasharray="6 4" 
                              strokeWidth={2}
                              label={{ 
                                value: `Limite P95: ${metrics.p95.toFixed(1)}h`, 
                                position: "insideTopRight",
                                style: { 
                                  fontSize: '11px', 
                                  fill: 'hsl(var(--destructive))',
                                  fontWeight: '600'
                                }
                              }}
                            />
                            
                            <Bar 
                              dataKey="tempo" 
                              radius={[2, 2, 0, 0]} 
                              strokeWidth={1}
                            >
                              {filteredData.map((item, index) => (
                                <Cell 
                                  key={`cell-${index}`} 
                                  fill={
                                    item.tempo > metrics.p95 
                                      ? "hsl(var(--destructive))" 
                                      : item.tempo > metrics.p90 
                                      ? "hsl(var(--warning))" 
                                      : "hsl(var(--primary))"
                                  }
                                  stroke={
                                    item.tempo > metrics.p95 
                                      ? "hsl(var(--destructive))" 
                                      : item.tempo > metrics.p90 
                                      ? "hsl(var(--warning))" 
                                      : "hsl(var(--primary))"
                                  }
                                />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Legenda melhorada */}
                      <div className="mt-6 p-4 bg-muted/30 rounded-lg">
                        <div className="flex flex-wrap justify-center gap-6 text-sm">
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded bg-primary shadow-sm"></div>
                            <span className="font-medium">Dentro do padrão</span>
                            <span className="text-muted-foreground">(&le; {metrics.p90.toFixed(1)}h)</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded bg-warning shadow-sm"></div>
                            <span className="font-medium">Acima da meta</span>
                            <span className="text-muted-foreground">({metrics.p90.toFixed(1)}h - {metrics.p95.toFixed(1)}h)</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded bg-destructive shadow-sm"></div>
                            <span className="font-medium">Outliers críticos</span>
                            <span className="text-muted-foreground">(&gt; {metrics.p95.toFixed(1)}h)</span>
                          </div>
                        </div>
                        <div className="mt-3 text-center text-xs text-muted-foreground">
                          Distribuição Long Tail: {Math.round((filteredData.filter(d => d.tempo <= metrics.p90).length / filteredData.length) * 100)}% das ocorrências são resolvidas dentro da meta
                        </div>
                      </div>
                    </div>

                   {/* Explicação sobre P90 e P95 */}
                   <div className="mb-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                     <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                       <Target className="h-4 w-4" />
                       Entendendo as Métricas
                     </h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                       <div>
                         <div className="font-medium text-warning mb-1">Meta P90</div>
                         <p className="text-muted-foreground">
                           90% das ocorrências devem ser resolvidas em até {metrics.p90.toFixed(1)}h. 
                           Esta é nossa meta operacional padrão.
                         </p>
                       </div>
                       <div>
                         <div className="font-medium text-destructive mb-1">Limite P95</div>
                         <p className="text-muted-foreground">
                           Apenas 5% das ocorrências podem ultrapassar {metrics.p95.toFixed(1)}h. 
                           Casos acima deste limite são considerados outliers críticos.
                         </p>
                       </div>
                     </div>
                   </div>

                   {/* Estatísticas do Long Tail */}
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                     <Card>
                       <CardContent className="p-4 text-center">
                         <div className="text-2xl font-bold text-primary">{metrics.p50.toFixed(1)}h</div>
                         <div className="text-sm text-muted-foreground">Mediana (P50)</div>
                       </CardContent>
                     </Card>
                     <Card>
                       <CardContent className="p-4 text-center">
                         <div className="text-2xl font-bold text-foreground">{metrics.p90.toFixed(1)}h</div>
                         <div className="text-sm text-muted-foreground">P90 (90%)</div>
                       </CardContent>
                     </Card>
                     <Card>
                       <CardContent className="p-4 text-center">
                         <div className="text-2xl font-bold text-warning">{metrics.p95.toFixed(1)}h</div>
                         <div className="text-sm text-muted-foreground">P95 (95%)</div>
                       </CardContent>
                     </Card>
                     <Card>
                       <CardContent className="p-4 text-center">
                         <div className="text-2xl font-bold text-destructive">{metrics.p99.toFixed(1)}h</div>
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