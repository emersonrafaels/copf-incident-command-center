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
      occ.status === 'a_iniciar' || occ.status === 'em_atuacao'
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

    // Calcular percentis para definir metas
    const sortedDurations = durations.map(d => d.durationHours).sort((a, b) => a - b);
    const tempoMediano = sortedDurations[Math.floor(sortedDurations.length * 0.5)] || 0; // P50 = Tempo Mediano
    const metaExcelencia = sortedDurations[Math.floor(sortedDurations.length * 0.85)] || 12.8; // P85 = Meta de Excelência

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
      } else if (range.minHours >= metaExcelencia) {
        // Acima da Meta de Excelência (P85)
        category = 'above_target';
        color = '#f59e0b'; // Laranja - acima da meta
      } else if (range.minHours >= 12) {
        // Entre 12h e Meta de Excelência
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

    // Gerar insight operacional
    let insight = `${durations.length} ocorrências em aberto | Tempo Mediano: ${tempoMediano.toFixed(1)}h | Meta de Excelência: ${metaExcelencia.toFixed(1)}h`;
    let priority: 'high' | 'medium' | 'low' = 'medium';
    let actionSuggestion = "";
    if (agingPercentage > 5) {
      insight += ` | ${agingCritico} acima do aging esperado (${agingPercentage}%)`;
      priority = 'high';
      actionSuggestion = "Alto número de ocorrências com aging crítico. Priorizar resolução imediata.";
    } else if (agingCritico > 0) {
      insight += ` | ${agingCritico} acima do aging esperado`;
      actionSuggestion = "Investigar causas das ocorrências que excedem 5 dias em aberto.";
    } else {
      insight += " | Aging dentro do esperado";
      priority = 'low';
      actionSuggestion = "Performance de aging saudável. Manter monitoramento atual.";
    }
    return {
      data: timeRangeData,
      metrics: {
        total: durations.length,
        tempoMediano: Number(tempoMediano.toFixed(1)),
        metaExcelencia: Number(metaExcelencia.toFixed(1)),
        agingCritico
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
      updateFilter('statusFilterMulti', ['a_iniciar', 'em_atuacao']);
      updateFilter('overrideFilter', true); // Filtrar apenas vencidas (aging > SLA)
      navigate('/ocorrencias');
      toast.success('Mostrando ocorrências acima do aging esperado (5 dias)');
    }, 100);
  };

  // Handler para clique nas barras do gráfico
  const handleBarClick = (data: TimeRangeData) => {
    clearAllFilters();
    setTimeout(() => {
      updateFilter('statusFilterMulti', ['a_iniciar', 'em_atuacao']);
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
                    <span className="text-lg font-bold text-success">{timeRangeAnalysis.metrics.tempoMediano}h</span>
                    <Info className="h-3 w-3 text-muted-foreground" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>50% das ocorrências estão em aberto há até {timeRangeAnalysis.metrics.tempoMediano}h</p>
                </TooltipContent>
              </Tooltip>
              
              <div className="w-px h-6 bg-border"></div>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-2 cursor-help">
                    <div className="w-2 h-2 rounded-full bg-warning"></div>
                    <span className="text-sm text-muted-foreground">Meta de Excelência:</span>
                    <span className="text-lg font-bold text-warning">{timeRangeAnalysis.metrics.metaExcelencia}h</span>
                    <Info className="h-3 w-3 text-muted-foreground" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>85% das ocorrências devem ser resolvidas em até {timeRangeAnalysis.metrics.metaExcelencia}h</p>
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
              top: 20,
              right: 20,
              left: 30,
              bottom: 80
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
                <XAxis dataKey="rangeLabel" stroke="hsl(var(--muted-foreground))" tick={{
                fill: 'hsl(var(--muted-foreground))',
                fontSize: 12
              }} angle={-45} textAnchor="end" height={80} interval={0} />
                <YAxis stroke="hsl(var(--muted-foreground))" tick={{
                fill: 'hsl(var(--muted-foreground))',
                fontSize: 12
              }} />
                
                <ChartTooltipContent formatter={(value, name) => [`${value} ocorrências`, 'Quantidade']} labelFormatter={label => `Faixa: ${label}`} contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                boxShadow: 'var(--shadow-elegant)'
              }} />
                
                <Bar 
                  dataKey="count" 
                  radius={[6, 6, 0, 0]} 
                  className="cursor-pointer transition-all duration-200 hover:opacity-80"
                  onClick={(data) => handleBarClick(data.payload)}
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