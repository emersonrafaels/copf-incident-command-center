import React, { memo, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, ReferenceLine, Cell, LabelList } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { OperationalNarrativeCard } from './OperationalNarrativeCard';
import { BarChart3, Clock, AlertTriangle, ArrowRight, TrendingUp, Info, BookOpen, Target, Zap, Users, Settings, CheckCircle2, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
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
  const [showMethodologyModal, setShowMethodologyModal] = useState(false);
  const [isAnalysisCollapsed, setIsAnalysisCollapsed] = useState(false);
  const [isGuideCollapsed, setIsGuideCollapsed] = useState(true);
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
      // Navegar com filtro específico para aging > 120 horas (5 dias)
      navigate('/ocorrencias?aging_min=120');
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
    <div className="space-y-8 animate-fade-in">
      {/* Seção Header */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <div className="p-2 rounded-lg bg-gradient-primary">
            <TrendingUp className="h-5 w-5 text-white" />
          </div>
          Análise Long Tail - Aging
        </h2>
        <p className="text-muted-foreground">Análise detalhada da distribuição temporal de ocorrências em aberto</p>
      </div>

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
        
        <CardContent className="p-4">
          <ChartContainer config={chartConfig} className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={timeRangeAnalysis.data} margin={{
                top: 30,
                right: 20,
                left: 40,
                bottom: 50
              }}>
                <defs>
                  <linearGradient id="barGradient1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22c55e" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#22c55e" stopOpacity={0.6} />
                  </linearGradient>
                  <linearGradient id="barGradient2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f97316" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#f97316" stopOpacity={0.6} />
                  </linearGradient>
                  <linearGradient id="barGradient3" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#ef4444" stopOpacity={0.6} />
                  </linearGradient>
                </defs>
                
                <CartesianGrid strokeDasharray="2 2" stroke="hsl(var(--border))" opacity={0.3} />
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
                  height={80} 
                  interval={0}
                  axisLine={{
                    stroke: 'hsl(var(--border))',
                    strokeWidth: 1
                  }}
                  tickLine={{
                    stroke: 'hsl(var(--border))',
                    strokeWidth: 1
                  }}
                  label={{ 
                    value: 'Faixas de Tempo de Aging', 
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
                  axisLine={{
                    stroke: 'hsl(var(--border))',
                    strokeWidth: 1
                  }}
                  tickLine={{
                    stroke: 'hsl(var(--border))',
                    strokeWidth: 1
                  }}
                  label={{ 
                    value: 'Quantidade de Ocorrências', 
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
                  formatter={(value, name, props) => {
                    const data = props.payload;
                    const percentage = ((Number(value) / timeRangeAnalysis.metrics.total) * 100).toFixed(1);
                    const rangeLabel = data?.rangeLabel || '';
                    const category = data?.category || '';
                    
                    // Texto explicativo baseado na categoria
                    let categoryText = '';
                    let statusColor = '';
                    let actionText = '';
                    
                    if (category === 'within_target') {
                      categoryText = 'Performance Excelente';
                      statusColor = 'text-green-600';
                      actionText = 'Dentro da meta de excelência - manter padrão atual';
                    } else if (category === 'above_target') {
                      categoryText = 'Necessita Atenção';
                      statusColor = 'text-orange-600';
                      actionText = 'Acima da meta - revisar processos de resolução';
                    } else if (category === 'critical') {
                      categoryText = 'Aging Crítico';
                      statusColor = 'text-red-600';
                      actionText = 'Ação imediata necessária - escalar para gestão';
                    }
                    
                    return [
                      <div key="tooltip-content" className="space-y-3 min-w-[280px]">
                        <div className="border-b border-border pb-2">
                          <div className="font-bold text-base">{value} ocorrências</div>
                          <div className="text-sm text-muted-foreground">
                            {percentage}% do total em aberto ({timeRangeAnalysis.metrics.total})
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div>
                            <div className="text-sm font-medium text-foreground">Faixa de Tempo:</div>
                            <div className="text-sm text-muted-foreground">{rangeLabel}</div>
                          </div>
                          
                          <div>
                            <div className="text-sm font-medium text-foreground">Status:</div>
                            <div className={`text-sm font-medium ${statusColor}`}>{categoryText}</div>
                          </div>
                          
                          <div>
                            <div className="text-sm font-medium text-foreground">Recomendação:</div>
                            <div className="text-xs text-muted-foreground leading-relaxed">{actionText}</div>
                          </div>
                        </div>
                        
                        <div className="border-t border-border pt-2">
                          <div className="flex items-center gap-1 text-xs font-medium text-primary">
                            <span>💡</span>
                            <span>Clique para filtrar estas ocorrências na tabela</span>
                          </div>
                        </div>
                      </div>, 
                      ''
                    ];
                  }} 
                  labelFormatter={() => ''} 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '12px',
                    boxShadow: '0 12px 32px -8px hsl(var(--primary) / 0.25)',
                    padding: '16px',
                    maxWidth: '350px'
                  }}
                  itemStyle={{
                    color: 'hsl(var(--foreground))',
                    fontWeight: 500,
                    padding: 0
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
                      stroke="hsl(var(--border))"
                      strokeWidth={1}
                      className="transition-all duration-200 hover:opacity-80"
                    />
                  ))}
                  
                  {/* Números nas barras */}
                  <LabelList 
                    dataKey="count" 
                    position="top" 
                    style={{ 
                      fill: 'hsl(var(--foreground))', 
                      fontSize: '12px', 
                      fontWeight: 700,
                      textAnchor: 'middle',
                      textShadow: '0 1px 2px hsl(var(--background))'
                    }}
                    offset={8}
                    formatter={(value) => value > 0 ? String(value) : ''}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
          
          {/* Dica de interatividade e estatísticas condensadas */}
          <div className="mt-4 space-y-4">
            {/* Dica de interatividade compacta */}
            <div className="flex items-center justify-center gap-2 p-2 bg-gradient-to-r from-primary/8 to-primary/4 rounded-lg border border-primary/15">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div>
              <span className="text-xs font-medium text-foreground">Clique nas barras para filtrar as ocorrências</span>
            </div>
            
            {/* Estatísticas resumidas em grid compacto */}
            <div className="grid grid-cols-3 gap-3 p-3 bg-muted/20 rounded-lg">
              <div className="text-center">
                <div className="text-xl font-bold text-green-600">{Math.round((timeRangeAnalysis.metrics.percentualExcelencia / 100) * timeRangeAnalysis.metrics.total)}</div>
                <div className="text-xs text-muted-foreground font-medium">Excelência</div>
                <div className="text-xs text-muted-foreground">≤ {formatHours(timeRangeAnalysis.metrics.metaExcelencia)}</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-orange-600">{Math.round(((timeRangeAnalysis.metrics.percentualSLA - timeRangeAnalysis.metrics.percentualExcelencia) / 100) * timeRangeAnalysis.metrics.total)}</div>
                <div className="text-xs text-muted-foreground font-medium">Atenção</div>
                <div className="text-xs text-muted-foreground">{formatHours(timeRangeAnalysis.metrics.metaExcelencia)} - 5d</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-red-600">{timeRangeAnalysis.metrics.agingCritico}</div>
                <div className="text-xs text-muted-foreground font-medium">Crítico</div>
                <div className="text-xs text-muted-foreground">{">"} 5 dias</div>
              </div>
            </div>
            
            {/* Legendas das cores compactas */}
            <div className="flex items-center justify-center gap-4 p-3 bg-card/30 rounded-lg border border-border/30">
              <div className="flex items-center gap-1.5 text-xs">
                <div className="w-3 h-3 rounded bg-gradient-to-b from-green-500 to-green-600"></div>
                <span className="text-foreground font-medium">Excelência</span>
                <span className="text-muted-foreground">≤ {formatHours(timeRangeAnalysis.metrics.metaExcelencia)}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                <div className="w-3 h-3 rounded bg-gradient-to-b from-orange-500 to-orange-600"></div>
                <span className="text-foreground font-medium">Atenção</span>
                <span className="text-muted-foreground">{formatHours(timeRangeAnalysis.metrics.metaExcelencia)} - 5d</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                <div className="w-3 h-3 rounded bg-gradient-to-b from-red-500 to-red-600"></div>
                <span className="text-foreground font-medium">Crítico</span>
                <span className="text-muted-foreground">{">"} 5 dias</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cards de Análise em Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Card de Análise Operacional e Resumo Executivo - colapsável */}
        <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <Collapsible open={!isAnalysisCollapsed} onOpenChange={setIsAnalysisCollapsed}>
            <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <CollapsibleTrigger asChild>
                <CardHeader className="pb-3 cursor-pointer hover:bg-primary/5 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-primary/10">
                        <Clock className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg font-semibold">Análise de Performance</CardTitle>
                        <p className="text-sm text-muted-foreground">Resumo executivo e insights detalhados</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      {isAnalysisCollapsed ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronUp className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              
              <CollapsibleContent className="animate-accordion-down">
                <CardContent className="space-y-4 pt-0">
                  {/* Resumo Executivo expandido */}
                  <div className="p-4 bg-primary/8 rounded-xl border border-primary/15">
                    <div className="flex items-start gap-3">
                      <TrendingUp className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div className="space-y-3">
                        <h4 className="font-bold text-foreground">Resumo Executivo</h4>
                        <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
                          <p>
                            <span className="font-medium text-foreground">{timeRangeAnalysis.metrics.total}</span> ocorrências em aberto com tempo mediano de{" "}
                            <span className="font-medium text-foreground">{formatHours(timeRangeAnalysis.metrics.tempoMediano)}</span>, indicando que 50% das ocorrências são resolvidas em até esse tempo.
                          </p>
                          <p>
                            <span className="font-medium text-success">{timeRangeAnalysis.metrics.percentualExcelencia}%</span> das ocorrências estão dentro da meta de excelência (≤ {formatHours(timeRangeAnalysis.metrics.metaExcelencia)}), demonstrando {timeRangeAnalysis.metrics.percentualExcelencia >= 70 ? 'boa' : 'baixa'} performance operacional.
                          </p>
                          {timeRangeAnalysis.metrics.agingCritico > 0 && (
                            <p className="text-destructive font-medium">
                              ⚠️ Atenção: <span className="font-bold">{timeRangeAnalysis.metrics.agingCritico}</span> ocorrências ({timeRangeAnalysis.metrics.percentualCritico}%) com aging crítico ({">"} 5 dias) requerem ação imediata.
                            </p>
                          )}
                        </div>
                        
                        {/* Botão para metodologia */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowMethodologyModal(true);
                          }}
                          className="flex items-center gap-2 text-primary border-primary/20 hover:bg-primary/5"
                        >
                          <BookOpen className="h-4 w-4" />
                          Metodologia Completa
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        </div>

        {/* Como usar esta análise - colapsável */}
        <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <Collapsible open={!isGuideCollapsed} onOpenChange={setIsGuideCollapsed}>
            <Card className="bg-gradient-to-r from-info/5 to-info/10 border-info/20">
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-info/5 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-start gap-3">
                      <div className="p-2.5 rounded-xl bg-info/10">
                        <Info className="h-5 w-5 text-info flex-shrink-0" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-foreground mb-1 flex items-center gap-2">
                          Guia de Interpretação
                          <Badge variant="outline" className="text-xs">Interativo</Badge>
                        </h4>
                        <p className="text-sm text-muted-foreground">Como entender e usar os insights</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      {isGuideCollapsed ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronUp className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              
              <CollapsibleContent className="animate-accordion-down">
                <CardContent className="pt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-start gap-3 p-3 bg-card/50 rounded-lg hover:bg-card/70 transition-colors">
                        <div className="w-3 h-3 rounded-full bg-muted-foreground mt-1.5 flex-shrink-0"></div>
                        <div>
                          <p className="font-medium text-sm text-foreground">Aging de Ocorrências</p>
                          <p className="text-xs text-muted-foreground">Tempo em aberto desde criação</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3 p-3 bg-card/50 rounded-lg hover:bg-card/70 transition-colors">
                        <div className="w-3 h-3 rounded-full bg-success mt-1.5 flex-shrink-0"></div>
                        <div>
                          <p className="font-medium text-sm text-foreground">Meta de Excelência</p>
                          <p className="text-xs text-muted-foreground">Resolver em até 12h</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-start gap-3 p-3 bg-card/50 rounded-lg hover:bg-card/70 transition-colors">
                        <div className="w-3 h-3 rounded-full bg-orange-500 mt-1.5 flex-shrink-0"></div>
                        <div>
                          <p className="font-medium text-sm text-foreground">Análise Long Tail</p>
                          <p className="text-xs text-muted-foreground">Distribuição por faixas temporais</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3 p-3 bg-card/50 rounded-lg hover:bg-card/70 transition-colors">
                        <div className="w-3 h-3 rounded-full bg-destructive mt-1.5 flex-shrink-0"></div>
                        <div>
                          <p className="font-medium text-sm text-foreground">Aging Crítico</p>
                          <p className="text-xs text-muted-foreground">{">"} 5 dias - ação imediata</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        </div>
      </div>

      {/* Modal de Metodologia e Recomendações */}
      <Dialog open={showMethodologyModal} onOpenChange={setShowMethodologyModal}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              Metodologia Long Tail - Recomendações Estratégicas
            </DialogTitle>
          </DialogHeader>
          
          <ScrollArea className="max-h-[70vh] pr-4">
            <div className="space-y-6">
              
              {/* Seção: Conceito da Análise */}
              <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Info className="h-5 w-5 text-primary" />
                  Conceito da Análise Long Tail
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  A análise Long Tail identifica a distribuição de ocorrências por faixas de tempo de abertura (aging), 
                  revelando padrões de concentração e outliers que requerem intervenção estratégica. 
                  Esta metodologia permite identificar gargalos operacionais e priorizar ações de melhoria.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div className="text-center p-3 bg-card/50 rounded-lg">
                    <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="text-sm font-medium text-foreground">Eficiência</div>
                    <div className="text-xs text-muted-foreground">≤ 12h</div>
                  </div>
                  <div className="text-center p-3 bg-card/50 rounded-lg">
                    <div className="w-8 h-8 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Clock className="h-4 w-4 text-orange-600" />
                    </div>
                    <div className="text-sm font-medium text-foreground">Atenção</div>
                    <div className="text-xs text-muted-foreground">12h - 5d</div>
                  </div>
                  <div className="text-center p-3 bg-card/50 rounded-lg">
                    <div className="w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                    </div>
                    <div className="text-sm font-medium text-foreground">Crítico</div>
                    <div className="text-xs text-muted-foreground">{">"}5 dias</div>
                  </div>
                </div>
              </div>

              {/* Seção: Recomendações Estratégicas */}
              <div>
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Recomendações Estratégicas por Cenário
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Cenário: Performance Excelente */}
                  <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <h4 className="font-medium text-green-800 dark:text-green-300">Performance Excelente ({">"}70% Meta)</h4>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p className="text-green-700 dark:text-green-400">
                        <strong>Ação:</strong> Manter padrão atual e documentar boas práticas
                      </p>
                      <ul className="list-disc list-inside text-xs text-green-600 dark:text-green-500 ml-2 space-y-1">
                        <li>Redução contínua do tempo médio de resolução</li>
                        <li>Maior satisfação do cliente interno</li>
                        <li>Modelo para replicação em outras áreas</li>
                      </ul>
                    </div>
                  </div>

                  {/* Cenário: Performance Moderada */}
                  <div className="p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                      <h4 className="font-medium text-orange-800 dark:text-orange-300">Performance Moderada (40-70% Meta)</h4>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p className="text-orange-700 dark:text-orange-400">
                        <strong>Ação:</strong> Revisar processos e identificar gargalos específicos
                      </p>
                      <ul className="list-disc list-inside text-xs text-orange-600 dark:text-orange-500 ml-2 space-y-1">
                        <li>Otimização de fluxos de comunicação</li>
                        <li>Redução de retrabalho em 20%</li>
                        <li>Melhoria no SLA de fornecedores</li>
                      </ul>
                    </div>
                  </div>

                  {/* Cenário: Performance Crítica */}
                  <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <h4 className="font-medium text-red-800 dark:text-red-300">Performance Crítica ({"<"}40% Meta)</h4>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p className="text-red-700 dark:text-red-400">
                        <strong>Ação:</strong> Intervenção imediata e reestruturação operacional
                      </p>
                      <ul className="list-disc list-inside text-xs text-red-600 dark:text-red-500 ml-2 space-y-1">
                        <li>Escalação imediata de ocorrências antigas</li>
                        <li>Revisão completa com fornecedores</li>
                        <li>Implementação de monitoramento em tempo real</li>
                      </ul>
                    </div>
                  </div>

                  {/* Cenário: Aging Crítico Alto */}
                  <div className="p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                      <h4 className="font-medium text-purple-800 dark:text-purple-300">Aging Crítico Elevado ({">"}10 ocorrências)</h4>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p className="text-purple-700 dark:text-purple-400">
                        <strong>Ação:</strong> Força-tarefa dedicada e revisão de contratos
                      </p>
                      <ul className="list-disc list-inside text-xs text-purple-600 dark:text-purple-500 ml-2 space-y-1">
                        <li>Redução imediata de 80% das ocorrências antigas</li>
                        <li>Prevenção de novos casos críticos</li>
                        <li>Fortalecimento da governança</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Seção: Impactos e ROI */}
              <div className="p-4 bg-muted/30 rounded-lg">
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  Impactos e ROI das Recomendações
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">25-40%</div>
                    <div className="text-sm text-muted-foreground">Redução no tempo médio de resolução</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-success">15-30%</div>
                    <div className="text-sm text-muted-foreground">Economia operacional anual</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-info">80%</div>
                    <div className="text-sm text-muted-foreground">Melhoria na satisfação interna</div>
                  </div>
                </div>
              </div>

              {/* Ação Recomendada Atual */}
              {timeRangeAnalysis.actionSuggestion && (
                <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                  <div className="flex items-center gap-2 mb-2">
                    <ArrowRight className="h-5 w-5 text-primary" />
                    <h4 className="font-semibold text-primary">Recomendação para sua Situação Atual</h4>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{timeRangeAnalysis.actionSuggestion}</p>
                  
                  <div className="bg-card/50 p-3 rounded border">
                    <h5 className="text-sm font-medium text-foreground mb-2">Próximos Passos Sugeridos:</h5>
                    <ul className="list-disc list-inside text-xs text-muted-foreground space-y-1">
                      <li>Clique nas barras críticas (vermelhas) para filtrar e analisar casos específicos</li>
                      <li>Identifique padrões comuns entre fornecedores ou tipos de equipamento</li>
                      <li>Defina plano de ação com prazos específicos para cada faixa de aging</li>
                      <li>Monitore semanalmente a evolução dos indicadores</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
});