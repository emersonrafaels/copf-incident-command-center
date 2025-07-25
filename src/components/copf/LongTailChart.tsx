import React, { memo, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, ReferenceLine, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { OperationalNarrativeCard } from './OperationalNarrativeCard';
import { BarChart3, Clock, AlertTriangle, ArrowRight, TrendingUp, Info } from 'lucide-react';
import { useFilters } from '@/contexts/FiltersContext';
import { toast } from 'sonner';
import { OccurrenceData } from '@/hooks/useDashboardData';
import { formatHours } from '@/lib/timeUtils';
interface LongTailChartProps {
  occurrences: OccurrenceData[];
  filteredOccurrences?: OccurrenceData[];
}
interface TimeRangeData {
  range: string;
  rangeLabel: string;
  count: number;
  color: string;
  category: 'within_target' | 'above_target' | 'critical';
  minHours: number;
  maxHours: number;
}
const chartConfig = {
  count: {
    label: "Quantidade de Ocorrências",
    color: "hsl(var(--primary))"
  }
};

// Definir faixas de tempo em horas
const TIME_RANGES = [{
  range: '0-0.5',
  minHours: 0,
  maxHours: 0.5,
  label: '0 - 0,5h'
}, {
  range: '0.5-1',
  minHours: 0.5,
  maxHours: 1,
  label: '0,5 - 1h'
}, {
  range: '1-2',
  minHours: 1,
  maxHours: 2,
  label: '1 - 2h'
}, {
  range: '2-4',
  minHours: 2,
  maxHours: 4,
  label: '2 - 4h'
}, {
  range: '4-8',
  minHours: 4,
  maxHours: 8,
  label: '4 - 8h'
}, {
  range: '8-12',
  minHours: 8,
  maxHours: 12,
  label: '8 - 12h'
}, {
  range: '12-24',
  minHours: 12,
  maxHours: 24,
  label: '12 - 24h'
}, {
  range: '24-48',
  minHours: 24,
  maxHours: 48,
  label: '1 - 2 dias'
}, {
  range: '48-72',
  minHours: 48,
  maxHours: 72,
  label: '2 - 3 dias'
}, {
  range: '72-120',
  minHours: 72,
  maxHours: 120,
  label: '3 - 5 dias'
}, {
  range: '120+',
  minHours: 120,
  maxHours: Infinity,
  label: '> 5 dias'
}];
export const LongTailChart = memo(function LongTailChart({
  occurrences,
  filteredOccurrences
}: LongTailChartProps) {
  const navigate = useNavigate();
  const {
    updateFilter,
    clearAllFilters
  } = useFilters();

  // Processar dados por faixas de tempo
  const timeRangeAnalysis = useMemo(() => {
    // Usar ocorrências filtradas se disponível, senão usar todas
    const sourceOccurrences = filteredOccurrences || occurrences;
    
    // Por padrão, analisar apenas ocorrências em aberto (não canceladas/encerradas)
    const activeOccurrences = sourceOccurrences.filter(occ => 
      occ.status === 'a_iniciar' || occ.status === 'em_andamento'
    );
    if (activeOccurrences.length === 0) {
      return {
        data: [],
        metrics: {
          total: 0,
          tempoMediano: 0,
          metaExcelencia: 12, // Meta fixa
          slaPadrao: 24, // SLA fixo
          agingCritico: 0,
          percentualExcelencia: 0,
          percentualSLA: 0,
          percentualCritico: 0
        },
        insight: "Nenhuma ocorrência em aberto para análise...",
        priority: 'low' as const
      };
    }

    // Calcular tempo em aberto em horas (aging)
    const durations = activeOccurrences.map(occ => {
      const created = new Date(occ.createdAt);
      const now = new Date();
      const agingHours = (now.getTime() - created.getTime()) / (1000 * 60 * 60);
      return {
        ...occ,
        durationHours: agingHours
      };
    });

    // Metas fixas de negócio (em horas)
    const META_EXCELENCIA = 12; // 12 horas - meta de alta performance
    const SLA_PADRAO = 24; // 24 horas (1 dia) - SLA padrão
    const AGING_CRITICO_THRESHOLD = 120; // 120 horas (5 dias) - aging crítico

    // Calcular tempo mediano real (apenas para comparação)
    const sortedDurations = durations.map(d => d.durationHours).sort((a, b) => a - b);
    const tempoMediano = sortedDurations[Math.floor(sortedDurations.length * 0.5)] || 0;

    // Agrupar por faixas de tempo
    const timeRangeData: TimeRangeData[] = TIME_RANGES.map(range => {
      const count = durations.filter(d => {
        if (range.maxHours === Infinity) {
          return d.durationHours >= range.minHours;
        }
        return d.durationHours >= range.minHours && d.durationHours < range.maxHours;
      }).length;

      // Definir categoria e cor baseado na faixa
      let category: 'within_target' | 'above_target' | 'critical' = 'within_target';
      let color = '#22c55e'; // Verde - dentro do padrão

      if (range.minHours >= 120) {
        // > 5 dias
        category = 'critical';
        color = '#ef4444'; // Vermelho - aging crítico
      } else if (range.minHours >= META_EXCELENCIA) {
        // Acima da Meta de Excelência (12h)
        category = 'above_target';
        color = '#f59e0b'; // Laranja - acima da meta
      } else if (range.minHours >= 8) {
        // Entre 8h e Meta de Excelência
        category = 'above_target';
        color = '#f97316'; // Laranja mais escuro
      }
      return {
        range: range.range,
        rangeLabel: range.label,
        count,
        color,
        category,
        minHours: range.minHours,
        maxHours: range.maxHours
      };
    }).filter(item => item.count > 0); // Filtrar faixas vazias

    // Contar ocorrências acima do aging esperado (> 5 dias)
    const agingCritico = durations.filter(d => d.durationHours > 120).length;
    const agingPercentage = Math.round(agingCritico / durations.length * 100);

    // Calcular percentuais de performance
    const dentroMetaExcelencia = durations.filter(d => d.durationHours <= META_EXCELENCIA).length;
    const dentroSLA = durations.filter(d => d.durationHours <= SLA_PADRAO).length;
    const percentualExcelencia = Math.round((dentroMetaExcelencia / durations.length) * 100);
    const percentualSLA = Math.round((dentroSLA / durations.length) * 100);
    const percentualCritico = Math.round((agingCritico / durations.length) * 100);

    // Gerar insight operacional
    let insight = `${durations.length} ocorrências em aberto | Tempo Mediano: ${formatHours(tempoMediano)} | Meta Excelência: ${formatHours(META_EXCELENCIA)} (${percentualExcelencia}% dentro)`;
    let priority: 'high' | 'medium' | 'low' = 'medium';
    let actionSuggestion = "";
    
    if (percentualCritico > 25) {
      insight += ` | CRÍTICO: ${agingCritico} acima de 5 dias (${percentualCritico}%)`;
      priority = 'high';
      actionSuggestion = "Situação crítica: alto número de ocorrências com aging > 5 dias. Ação imediata necessária.";
    } else if (percentualExcelencia < 70) {
      insight += ` | ${agingCritico} aging crítico (${percentualCritico}%)`;
      priority = 'high';
      actionSuggestion = "Performance abaixo da meta de excelência. Revisar processos de resolução.";
    } else if (agingCritico > 0) {
      insight += ` | ${agingCritico} aging crítico`;
      actionSuggestion = "Investigar causas das ocorrências que excedem 5 dias em aberto.";
    } else {
      insight += " | Performance dentro das metas";
      priority = 'low';
      actionSuggestion = "Performance saudável. Manter monitoramento atual.";
    }
    
    return {
      data: timeRangeData,
      metrics: {
        total: durations.length,
        tempoMediano: Number(tempoMediano.toFixed(1)),
        metaExcelencia: META_EXCELENCIA,
        slaPadrao: SLA_PADRAO,
        agingCritico,
        percentualExcelencia,
        percentualSLA,
        percentualCritico
      },
      insight,
      priority,
      actionSuggestion
    };
  }, [occurrences, filteredOccurrences]);

  // Handler para navegar para ocorrências com aging crítico
  const handleFilterAgingCritico = () => {
    clearAllFilters();
    setTimeout(() => {
      updateFilter('statusFilterMulti', ['a_iniciar', 'em_andamento']);
      updateFilter('overrideFilter', true); // Filtrar apenas vencidas (aging > SLA)
      navigate('/ocorrencias');
      toast.success('Mostrando ocorrências acima do aging esperado (5 dias)');
    }, 100);
  };

  // Handler para clique nas barras do gráfico
  const handleBarClick = (data: TimeRangeData) => {
    clearAllFilters();
    setTimeout(() => {
      updateFilter('statusFilterMulti', ['a_iniciar', 'em_andamento']);
      // Adicionar filtro customizado por range de horas
      navigate(`/ocorrencias?aging_min=${data.minHours}&aging_max=${data.maxHours === Infinity ? 999999 : data.maxHours}`);
      toast.success(`Filtrando ocorrências entre ${data.rangeLabel}`);
    }, 100);
  };

  // Renderização condicional
  if (timeRangeAnalysis.data.length === 0) {
    return <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Análise Long Tail - Aging de Ocorrências
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            Nenhuma ocorrência em aberto para análise...
          </div>
        </CardContent>
      </Card>;
  }
  return (
    <div className="space-y-6">
      {/* Card principal com design aprimorado */}
      <Card className="bg-gradient-subtle border-0 shadow-elegant">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-primary">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl font-semibold text-foreground">
                  Análise Long Tail - Aging de Ocorrências
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Distribuição de ocorrências em aberto por tempo de aging
                </p>
              </div>
            </div>
            <Button variant="premium" size="sm" onClick={handleFilterAgingCritico} className="flex items-center gap-2 shadow-card-hover">
              <AlertTriangle className="h-4 w-4" />
              Ver Aging Crítico ({">"}5 dias)
            </Button>
          </div>

          {/* Métricas didáticas com tooltips explicativos */}
          <div className="flex flex-wrap items-center gap-3 mt-6 p-4 bg-card/50 rounded-lg border border-border/50">
            <TooltipProvider>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary"></div>
                <span className="text-sm text-muted-foreground">Total em Aberto:</span>
                <span className="text-lg font-bold text-foreground">{timeRangeAnalysis.metrics.total}</span>
              </div>
              <div className="w-px h-6 bg-border"></div>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-2 cursor-help">
                    <div className="w-2 h-2 rounded-full bg-muted-foreground"></div>
                    <span className="text-sm text-muted-foreground">Tempo Mediano:</span>
                    <span className="text-lg font-bold text-muted-foreground">{formatHours(timeRangeAnalysis.metrics.tempoMediano)}</span>
                    <Info className="h-3 w-3 text-muted-foreground" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>50% das ocorrências estão em aberto há até {formatHours(timeRangeAnalysis.metrics.tempoMediano)}</p>
                </TooltipContent>
              </Tooltip>
              
              <div className="w-px h-6 bg-border"></div>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-2 cursor-help">
                    <div className="w-2 h-2 rounded-full bg-success"></div>
                    <span className="text-sm text-muted-foreground">Meta de Excelência:</span>
                    <span className="text-lg font-bold text-success">{formatHours(timeRangeAnalysis.metrics.metaExcelencia)}</span>
                    <Info className="h-3 w-3 text-muted-foreground" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Meta fixa: resolver em até {formatHours(timeRangeAnalysis.metrics.metaExcelencia)}. Atualmente {timeRangeAnalysis.metrics.percentualExcelencia}% dentro da meta.</p>
                </TooltipContent>
              </Tooltip>
              
              <div className="w-px h-6 bg-border"></div>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-2 cursor-help">
                    <div className="w-2 h-2 rounded-full bg-destructive"></div>
                    <span className="text-sm text-muted-foreground">Aging Crítico ({">"}5 dias):</span>
                    <span className="text-lg font-bold text-destructive">{timeRangeAnalysis.metrics.agingCritico}</span>
                    <Info className="h-3 w-3 text-muted-foreground" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Ocorrências em aberto há mais de 5 dias (120 horas)</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardHeader>
        
        <CardContent className="p-6">
          <ChartContainer config={chartConfig} className="h-[420px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={timeRangeAnalysis.data} margin={{
                top: 30,
                right: 30,
                left: 40,
                bottom: 100
              }}>
                <defs>
                  <linearGradient id="barGradient1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22c55e" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="#22c55e" stopOpacity={0.4} />
                  </linearGradient>
                  <linearGradient id="barGradient2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f97316" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="#f97316" stopOpacity={0.4} />
                  </linearGradient>
                  <linearGradient id="barGradient3" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="#ef4444" stopOpacity={0.4} />
                  </linearGradient>
                </defs>
                
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis 
                  dataKey="rangeLabel" 
                  stroke="hsl(var(--muted-foreground))" 
                  tick={{
                    fill: 'hsl(var(--muted-foreground))',
                    fontSize: 11,
                    fontWeight: 500
                  }} 
                  angle={-45} 
                  textAnchor="end" 
                  height={100} 
                  interval={0}
                  label={{ 
                    value: 'Faixas de Tempo de Abertura', 
                    position: 'insideBottom', 
                    offset: -5,
                    style: { 
                      textAnchor: 'middle',
                      fill: 'hsl(var(--foreground))',
                      fontSize: '12px',
                      fontWeight: 600
                    }
                  }}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))" 
                  tick={{
                    fill: 'hsl(var(--muted-foreground))',
                    fontSize: 11,
                    fontWeight: 500
                  }}
                  label={{ 
                    value: 'Número de Ocorrências', 
                    angle: -90, 
                    position: 'insideLeft',
                    style: { 
                      textAnchor: 'middle',
                      fill: 'hsl(var(--foreground))',
                      fontSize: '12px',
                      fontWeight: 600
                    }
                  }}
                />
                
                <ChartTooltipContent 
                  formatter={(value, name) => [
                    `${value} ocorrências`, 
                    'Quantidade'
                  ]} 
                  labelFormatter={label => `Faixa: ${label}`} 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    boxShadow: 'var(--shadow-elegant)'
                  }}
                  itemStyle={{
                    color: 'hsl(var(--foreground))',
                    fontWeight: 500
                  }}
                />
                
                <Bar 
                  dataKey="count" 
                  radius={[6, 6, 0, 0]}
                  cursor="pointer"
                  onClick={(data, index) => {
                    if (data) {
                      handleBarClick(data);
                    }
                  }}
                >
                  {timeRangeAnalysis.data.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color}
                      stroke="none"
                      className="transition-all duration-200 hover:opacity-80"
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
          
          {/* Indicadores visuais abaixo do gráfico */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-6 p-3 bg-muted/20 rounded-lg">
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 rounded bg-green-500"></div>
              <span className="text-muted-foreground">Meta de Excelência: ≤ {formatHours(timeRangeAnalysis.metrics.metaExcelencia)}</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 rounded bg-orange-500"></div>
              <span className="text-muted-foreground">Atenção: {formatHours(timeRangeAnalysis.metrics.metaExcelencia)} - 5d</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 rounded bg-red-500"></div>
              <span className="text-muted-foreground">Crítico: {">"}5 dias</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Card de Análise Operacional aprimorado */}
      <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold">Análise de Performance - Aging</CardTitle>
              <p className="text-sm text-muted-foreground">Insights detalhados sobre tempo de resolução</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Métricas principais em grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-card rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-muted-foreground"></div>
                <span className="text-sm font-medium text-muted-foreground">Tempo Mediano</span>
              </div>
              <div className="text-2xl font-bold text-foreground">{formatHours(timeRangeAnalysis.metrics.tempoMediano)}</div>
              <p className="text-xs text-muted-foreground mt-1">50% das ocorrências resolvidas em até este tempo</p>
            </div>
            
            <div className="p-4 bg-card rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-success"></div>
                <span className="text-sm font-medium text-success">Meta de Excelência</span>
              </div>
              <div className="text-2xl font-bold text-success">{timeRangeAnalysis.metrics.percentualExcelencia}%</div>
              <p className="text-xs text-muted-foreground mt-1">Resolvidas em até {formatHours(timeRangeAnalysis.metrics.metaExcelencia)}</p>
            </div>
            
            <div className="p-4 bg-card rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-destructive"></div>
                <span className="text-sm font-medium text-destructive">Aging Crítico</span>
              </div>
              <div className="text-2xl font-bold text-destructive">{timeRangeAnalysis.metrics.agingCritico}</div>
              <p className="text-xs text-muted-foreground mt-1">{timeRangeAnalysis.metrics.percentualCritico}% acima de 5 dias</p>
            </div>
          </div>
          
          {/* Insight textual */}
          <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
            <div className="flex items-start gap-3">
              <TrendingUp className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-foreground mb-2">Resumo Executivo</h4>
                <div className="space-y-2 text-sm text-muted-foreground leading-relaxed">
                  <p>
                    <span className="font-medium text-foreground">{timeRangeAnalysis.metrics.total}</span> ocorrências em aberto com tempo mediano de{" "}
                    <span className="font-medium text-foreground">{formatHours(timeRangeAnalysis.metrics.tempoMediano)}</span>.
                  </p>
                  <p>
                    <span className="font-medium text-success">{timeRangeAnalysis.metrics.percentualExcelencia}%</span> das ocorrências estão dentro da meta de excelência.
                  </p>
                  {timeRangeAnalysis.metrics.agingCritico > 0 && (
                    <p className="text-destructive font-medium">
                      ⚠️ Atenção: <span className="font-bold">{timeRangeAnalysis.metrics.agingCritico}</span> ocorrências com aging crítico requerem ação imediata.
                    </p>
                  )}
                </div>
                {timeRangeAnalysis.actionSuggestion && (
                  <div className="mt-3 p-3 bg-primary/10 rounded border border-primary/20">
                    <div className="flex items-center gap-2 mb-1">
                      <ArrowRight className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium text-primary">Ação Recomendada</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{timeRangeAnalysis.actionSuggestion}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Como usar esta análise - Redesenhado */}
      <Card className="bg-gradient-to-r from-info/5 to-info/10 border-info/20">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-lg bg-info/10">
              <Info className="h-6 w-6 text-info flex-shrink-0" />
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                Como interpretar esta análise
                <Badge variant="outline" className="text-xs">Guia Interativo</Badge>
              </h4>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-card/50 rounded-lg">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                    <div>
                      <p className="font-medium text-sm text-foreground">Interatividade</p>
                      <p className="text-xs text-muted-foreground">Clique nas barras para filtrar ocorrências por faixa de tempo específica</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 bg-card/50 rounded-lg">
                    <div className="w-2 h-2 rounded-full bg-muted-foreground mt-2 flex-shrink-0"></div>
                    <div>
                      <p className="font-medium text-sm text-foreground">Aging de Ocorrências</p>
                      <p className="text-xs text-muted-foreground">Tempo que uma ocorrência permanece em aberto desde sua criação</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 bg-card/50 rounded-lg">
                    <div className="w-2 h-2 rounded-full bg-success mt-2 flex-shrink-0"></div>
                    <div>
                      <p className="font-medium text-sm text-foreground">Meta de Excelência</p>
                      <p className="text-xs text-muted-foreground">Objetivo de alta performance - resolver ocorrências em até 12h</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-card/50 rounded-lg">
                    <div className="w-2 h-2 rounded-full bg-orange-500 mt-2 flex-shrink-0"></div>
                    <div>
                      <p className="font-medium text-sm text-foreground">Análise Long Tail</p>
                      <p className="text-xs text-muted-foreground">Identifica concentração e distribuição de ocorrências por faixas de tempo</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 bg-card/50 rounded-lg">
                    <div className="w-2 h-2 rounded-full bg-destructive mt-2 flex-shrink-0"></div>
                    <div>
                      <p className="font-medium text-sm text-foreground">Aging Crítico</p>
                      <p className="text-xs text-muted-foreground">Ocorrências que excedem 5 dias em aberto requerem ação imediata</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 bg-card/50 rounded-lg">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                    <div>
                      <p className="font-medium text-sm text-foreground">Interpretação Visual</p>
                      <p className="text-xs text-muted-foreground">Verde (meta), Laranja (atenção), Vermelho (crítico)</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});