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
          metaExcelencia: 0,
          agingCritico: 0
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
  return <div className="space-y-8">
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
                    <div className="w-2 h-2 rounded-full bg-success"></div>
                    <span className="text-sm text-muted-foreground">Tempo Mediano:</span>
                    <span className="text-lg font-bold text-success">{formatHours(timeRangeAnalysis.metrics.tempoMediano)}</span>
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
                    <span className="text-lg font-bold text-success">{formatHours(timeRangeAnalysis.metrics.metaExcelencia)} ({timeRangeAnalysis.metrics.percentualExcelencia}%)</span>
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
                    <div className="w-2 h-2 rounded-full bg-warning"></div>
                    <span className="text-sm text-muted-foreground">SLA Padrão:</span>
                    <span className="text-lg font-bold text-warning">{formatHours(timeRangeAnalysis.metrics.slaPadrao)} ({timeRangeAnalysis.metrics.percentualSLA}%)</span>
                    <Info className="h-3 w-3 text-muted-foreground" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>SLA máximo: resolver em até {formatHours(timeRangeAnalysis.metrics.slaPadrao)}. Atualmente {timeRangeAnalysis.metrics.percentualSLA}% dentro do SLA.</p>
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
        
        <CardContent className="p-3">
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
                
                {/* Linha de referência para Meta de Excelência (12h) */}
                <ReferenceLine 
                  x={timeRangeAnalysis.metrics.metaExcelencia} 
                  stroke="hsl(var(--success))" 
                  strokeDasharray="8 4" 
                  strokeWidth={2}
                  label={{ 
                    value: `Meta Excelência: ${formatHours(timeRangeAnalysis.metrics.metaExcelencia)}`, 
                    position: "insideTopLeft",
                    style: {
                      fill: 'hsl(var(--success))',
                      fontSize: '11px',
                      fontWeight: 600
                    }
                  }}
                />
                
                {/* Linha de referência para SLA Padrão (24h) */}
                <ReferenceLine 
                  x={timeRangeAnalysis.metrics.slaPadrao} 
                  stroke="hsl(var(--warning))" 
                  strokeDasharray="5 5" 
                  strokeWidth={2}
                  label={{ 
                    value: `SLA: ${formatHours(timeRangeAnalysis.metrics.slaPadrao)}`, 
                    position: "insideTopRight",
                    style: {
                      fill: 'hsl(var(--warning))',
                      fontSize: '11px',
                      fontWeight: 600
                    }
                  }}
                />
                
                {/* Linha de referência para Aging Crítico (120h) */}
                <ReferenceLine 
                  x={120} 
                  stroke="hsl(var(--destructive))" 
                  strokeDasharray="3 3" 
                  strokeWidth={2}
                  label={{ 
                    value: `Crítico: 5d`, 
                    position: "insideBottomRight",
                    style: {
                      fill: 'hsl(var(--destructive))',
                      fontSize: '11px',
                      fontWeight: 600
                    }
                  }}
                />
                
                <Bar 
                  dataKey="count" 
                  radius={[6, 6, 0, 0]} 
                  className="cursor-pointer transition-all duration-200 hover:opacity-80"
                  onClick={(data) => handleBarClick(data.payload)}
                  label={{ 
                    position: 'top',
                    fill: 'hsl(var(--foreground))',
                    fontSize: 10,
                    fontWeight: 600,
                    formatter: (value: number) => value > 0 ? value : ''
                  }}
                >
                  {timeRangeAnalysis.data.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.category === 'within_target' ? 'url(#barGradient1)' : entry.category === 'above_target' ? 'url(#barGradient2)' : 'url(#barGradient3)'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Card de Insights Operacionais */}
      <OperationalNarrativeCard
        title="Análise de Aging"
        insight={timeRangeAnalysis.insight}
        priority={timeRangeAnalysis.priority}
        actionSuggestion={timeRangeAnalysis.actionSuggestion}
        trend={timeRangeAnalysis.metrics.agingCritico > 0 ? 'up' : 'stable'}
        metric={{
          value: timeRangeAnalysis.metrics.agingCritico,
          label: "Ocorrências Críticas"
        }}
      />

      {/* Legendas e Instruções */}
      <Card className="bg-muted/30 border-muted/50">
        <CardContent className="p-4">
          <div className="space-y-3">
            <h4 className="font-semibold text-sm text-foreground">Como usar esta análise:</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-green-500"></div>
                <span>Dentro do Padrão: Aging normal</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-orange-500"></div>
                <span>Atenção: Próximo ao vencimento</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-red-500"></div>
                <span>Crítico: Aging acima de 5 dias</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              💡 Clique nas barras do gráfico para filtrar ocorrências por faixa de tempo
            </p>
          </div>
        </CardContent>
      </Card>
      
    </div>;
});