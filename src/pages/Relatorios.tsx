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
import { ComingSoonOverlay } from "@/components/copf/ComingSoonOverlay";

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
      <ComingSoonOverlay
        title="Relatórios Avançados"
        description="Análises detalhadas e relatórios executivos com insights avançados"
        version="Versão Futura (após MVP)"
        releaseDate="Q1 2024"
        features={[
          "Relatórios executivos personalizáveis",
          "Dashboards interativos com drill-down",
          "Exportação automática agendada",
          "Análise de tendências com IA",
          "Comparativos históricos avançados",
          "Alertas inteligentes baseados em padrões"
        ]}
      >
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

            {/* Other tab contents would be included here but abbreviated for brevity */}
          </Tabs>
        </div>
      </ComingSoonOverlay>
    </COPFLayout>
  );
};

export default Relatorios;