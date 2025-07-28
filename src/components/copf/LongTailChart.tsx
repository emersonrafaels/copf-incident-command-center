import React, { memo, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, ReferenceLine, Cell, LabelList, Tooltip as RechartsTooltip } from 'recharts';
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
  category: 'excellent' | 'acceptable' | 'near_limit' | 'within_sla' | 'above_sla' | 'needs_attention' | 'critical';
  minHours: number;
  maxHours: number;
}

const chartConfig = {
  count: {
    label: "Quantidade de Ocorrências",
    color: "hsl(var(--primary))"
  }
};

// Faixas de tempo otimizadas conforme especificado
const TIME_RANGES = [
  {
    range: '0-0.5',
    minHours: 0,
    maxHours: 0.5,
    label: '0 - 0,5h',
    category: 'excellent' as const
  },
  {
    range: '0.5-1',
    minHours: 0.5,
    maxHours: 1,
    label: '0,5 - 1h',
    category: 'excellent' as const
  },
  {
    range: '1-2',
    minHours: 1,
    maxHours: 2,
    label: '1 - 2h',
    category: 'acceptable' as const
  },
  {
    range: '2-4',
    minHours: 2,
    maxHours: 4,
    label: '2 - 4h',
    category: 'acceptable' as const
  },
  {
    range: '4-8',
    minHours: 4,
    maxHours: 8,
    label: '4 - 8h',
    category: 'acceptable' as const
  },
  {
    range: '8-12',
    minHours: 8,
    maxHours: 12,
    label: '8 - 12h',
    category: 'near_limit' as const
  },
  {
    range: '12-24',
    minHours: 12,
    maxHours: 24,
    label: '12 - 24h',
    category: 'within_sla' as const
  },
  {
    range: '24-48',
    minHours: 24,
    maxHours: 48,
    label: '1 - 2 dias',
    category: 'above_sla' as const
  },
  {
    range: '48-72',
    minHours: 48,
    maxHours: 72,
    label: '2 - 3 dias',
    category: 'needs_attention' as const
  },
  {
    range: '72-120',
    minHours: 72,
    maxHours: 120,
    label: '3 - 5 dias',
    category: 'critical' as const
  },
  {
    range: '120+',
    minHours: 120,
    maxHours: Infinity,
    label: '> 5 dias',
    category: 'critical' as const
  }
];

export const LongTailChart = memo(function LongTailChart({
  occurrences,
  filteredOccurrences
}: LongTailChartProps) {
  const navigate = useNavigate();
  const [showMethodologyModal, setShowMethodologyModal] = useState(false);
  const [isAnalysisCollapsed, setIsAnalysisCollapsed] = useState(true);
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
    const activeOccurrences = sourceOccurrences.filter(occ => occ.status === 'a_iniciar' || occ.status === 'em_andamento');
    if (activeOccurrences.length === 0) {
      return {
        data: [],
        metrics: {
          total: 0,
          tempoMediano: 0,
          metaExcelencia: 12,
          slaPadrao: 24,
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

    // Metas de negócio otimizadas
    const META_EXCELENCIA = 12; // 12 horas - meta de alta performance
    const SLA_PADRAO = 24; // 24 horas (1 dia) - SLA padrão
    const AGING_CRITICO_THRESHOLD = 72; // 72 horas (3 dias) - aging crítico

    // Calcular tempo mediano real
    const sortedDurations = durations.map(d => d.durationHours).sort((a, b) => a - b);
    const tempoMediano = sortedDurations[Math.floor(sortedDurations.length * 0.5)] || 0;

    // Agrupar por faixas de tempo com nova categorização
    const timeRangeData: TimeRangeData[] = TIME_RANGES.map(range => {
      const count = durations.filter(d => {
        if (range.maxHours === Infinity) {
          return d.durationHours >= range.minHours;
        }
        return d.durationHours >= range.minHours && d.durationHours < range.maxHours;
      }).length;

      // Definir cor baseada na categoria
      let color = '#10b981'; // Verde padrão
      switch (range.category) {
        case 'excellent':
          color = '#10b981'; // Verde - excelência
          break;
        case 'acceptable':
          color = '#22c55e'; // Verde claro - aceitável
          break;
        case 'near_limit':
          color = '#eab308'; // Amarelo - próximo ao limite
          break;
        case 'within_sla':
          color = '#f59e0b'; // Laranja claro - dentro do SLA
          break;
        case 'above_sla':
          color = '#f97316'; // Laranja - acima do SLA básico
          break;
        case 'needs_attention':
          color = '#ea580c'; // Laranja escuro - necessita atenção
          break;
        case 'critical':
          color = '#ef4444'; // Vermelho - zona crítica
          break;
      }

      return {
        range: range.range,
        rangeLabel: range.label,
        count,
        color,
        category: range.category,
        minHours: range.minHours,
        maxHours: range.maxHours
      };
    }).filter(item => item.count > 0); // Filtrar faixas vazias

    // Calcular métricas baseadas nas novas faixas
    const excelencia = durations.filter(d => d.durationHours <= 1).length; // 0-1h
    const aceitavel = durations.filter(d => d.durationHours > 1 && d.durationHours <= 8).length; // 1-8h
    const proximoLimite = durations.filter(d => d.durationHours > 8 && d.durationHours <= 12).length; // 8-12h
    const dentroSLA = durations.filter(d => d.durationHours > 12 && d.durationHours <= 24).length; // 12-24h
    const acimaSLA = durations.filter(d => d.durationHours > 24 && d.durationHours <= 48).length; // 24-48h
    const necessitaAtencao = durations.filter(d => d.durationHours > 48 && d.durationHours <= 72).length; // 48-72h
    const agingCritico = durations.filter(d => d.durationHours > 72).length; // >72h

    const percentualExcelencia = Math.round((excelencia + aceitavel) / durations.length * 100);
    const percentualSLA = Math.round((excelencia + aceitavel + proximoLimite + dentroSLA) / durations.length * 100);
    const percentualCritico = Math.round(agingCritico / durations.length * 100);

    // Gerar insight operacional aprimorado
    let insight = `${durations.length} ocorrências em aberto | Tempo Mediano: ${formatHours(tempoMediano)} | Excelência: ${percentualExcelencia}% (≤8h)`;
    let priority: 'high' | 'medium' | 'low' = 'medium';
    let actionSuggestion = "";

    if (percentualCritico > 20) {
      insight += ` | CRÍTICO: ${agingCritico} na zona crítica (${percentualCritico}%)`;
      priority = 'high';
      actionSuggestion = "Situação crítica: alto número de ocorrências na zona crítica (>3 dias). Ação imediata necessária.";
    } else if (percentualExcelencia < 60) {
      insight += ` | ${agingCritico} zona crítica (${percentualCritico}%)`;
      priority = 'high';
      actionSuggestion = "Performance abaixo da excelência. Revisar processos para melhorar resolução rápida.";
    } else if (agingCritico > 0) {
      insight += ` | ${agingCritico} zona crítica`;
      actionSuggestion = "Investigar causas das ocorrências que excedem 3 dias em aberto.";
    } else {
      insight += " | Performance excelente";
      priority = 'low';
      actionSuggestion = "Performance saudável. Manter padrão atual de excelência.";
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

  // Processar dados para gráfico de agências top 10 com equipamentos
  const agenciesStackedData = useMemo(() => {
    const sourceOccurrences = filteredOccurrences || occurrences;
    
    if (sourceOccurrences.length === 0) return [];
    
    // Agrupar por agência
    const agencyGroups = sourceOccurrences.reduce((groups, occ) => {
      const agencyName = occ.agency || 'Não informado';
      if (!groups[agencyName]) {
        groups[agencyName] = [];
      }
      groups[agencyName].push(occ);
      return groups;
    }, {} as Record<string, OccurrenceData[]>);

    // Obter top 10 agências por quantidade total
    const agenciesWithCount = Object.entries(agencyGroups)
      .map(([agencia, occs]) => ({
        agencia,
        total: occs.length,
        occurrences: occs
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);

    // Obter equipamentos mais relevantes (top 5)
    const allEquipmentCounts = sourceOccurrences.reduce((counts, occ) => {
      const equipment = occ.equipment || 'Não informado';
      counts[equipment] = (counts[equipment] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);

    const topEquipments = Object.entries(allEquipmentCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([equipment]) => equipment);

    // Processar dados para stacked chart
    const chartData = agenciesWithCount.map(({ agencia, total, occurrences }) => {
      // Agrupar por equipamento
      const equipmentCounts = occurrences.reduce((counts, occ) => {
        const equipment = occ.equipment || 'Não informado';
        if (topEquipments.includes(equipment)) {
          counts[equipment] = (counts[equipment] || 0) + 1;
        } else {
          counts['Outros'] = (counts['Outros'] || 0) + 1;
        }
        return counts;
      }, {} as Record<string, number>);

      // Criar objeto com todos os equipamentos (mesmo se zero)
      const equipmentData: Record<string, number> = {};
      [...topEquipments, 'Outros'].forEach((equipment) => {
        equipmentData[equipment] = equipmentCounts[equipment] || 0;
      });

      return {
        agencia: agencia.length > 20 ? agencia.substring(0, 17) + '...' : agencia,
        agenciaCompleta: agencia,
        total,
        ...equipmentData
      };
    });

    console.log('Agencies Stacked Data:', chartData);
    return chartData;
  }, [occurrences, filteredOccurrences]);

  // Obter equipamentos únicos para o gráfico stacked (top 5 + outros)
  const stackedEquipments = useMemo(() => {
    const sourceOccurrences = filteredOccurrences || occurrences;
    
    // Contar equipamentos
    const allEquipmentCounts = sourceOccurrences.reduce((counts, occ) => {
      const equipment = occ.equipment || 'Não informado';
      counts[equipment] = (counts[equipment] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);

    // Obter top 5 equipamentos
    const topEquipments = Object.entries(allEquipmentCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([equipment]) => equipment);
    
    return [...topEquipments, 'Outros'];
  }, [occurrences, filteredOccurrences]);

  // Cores para equipamentos do gráfico stacked
  const stackedEquipmentColors = useMemo(() => {
    const colors = [
      '#3b82f6', // blue
      '#10b981', // emerald
      '#f59e0b', // amber
      '#ef4444', // red
      '#8b5cf6', // violet
      '#6b7280', // gray para "Outros"
    ];
    
    const colorMap: Record<string, string> = {};
    stackedEquipments.forEach((equipment, index) => {
      colorMap[equipment] = colors[index % colors.length];
    });
    return colorMap;
  }, [stackedEquipments]);

  // Handler para navegar para ocorrências com aging crítico
  const handleFilterAgingCritico = () => {
    clearAllFilters();
    setTimeout(() => {
      updateFilter('statusFilterMulti', ['a_iniciar', 'em_andamento']);
      navigate('/ocorrencias?aging_min=72');
      toast.success('Mostrando ocorrências na zona crítica (>3 dias)');
    }, 100);
  };

  // Handler para clique nas barras do gráfico
  const handleBarClick = (data: TimeRangeData) => {
    clearAllFilters();
    setTimeout(() => {
      updateFilter('statusFilterMulti', ['a_iniciar', 'em_andamento']);
      navigate(`/ocorrencias?aging_min=${data.minHours}&aging_max=${data.maxHours === Infinity ? 999999 : data.maxHours}`);
      toast.success(`Filtrando ocorrências entre ${data.rangeLabel}`);
    }, 100);
  };

  // Renderização condicional
  if (timeRangeAnalysis.data.length === 0) {
    return (
      <Card>
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
      </Card>
    );
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
              Ver Zona Crítica (&gt;3 dias)
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
                    <span className="text-sm text-muted-foreground">Excelência:</span>
                    <span className="text-lg font-bold text-success">{timeRangeAnalysis.metrics.percentualExcelencia}%</span>
                    <Info className="h-3 w-3 text-muted-foreground" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Percentual de ocorrências resolvidas rapidamente (≤8h)</p>
                </TooltipContent>
              </Tooltip>
              
              <div className="w-px h-6 bg-border"></div>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-2 cursor-help">
                    <div className="w-2 h-2 rounded-full bg-destructive"></div>
                    <span className="text-sm text-muted-foreground">Zona Crítica (&gt;3 dias):</span>
                    <span className="text-lg font-bold text-destructive">{timeRangeAnalysis.metrics.agingCritico}</span>
                    <Info className="h-3 w-3 text-muted-foreground" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Ocorrências em aberto há mais de 3 dias (72 horas)</p>
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
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0.6} />
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
                    const percentage = (Number(value) / timeRangeAnalysis.metrics.total * 100).toFixed(1);
                    const rangeLabel = data?.rangeLabel || '';
                    const category = data?.category || '';

                    // Texto explicativo baseado na nova categorização
                    let categoryText = '';
                    let statusColor = '';
                    let actionText = '';
                    
                    switch (category) {
                      case 'excellent':
                        categoryText = 'Excelência Operacional';
                        statusColor = 'text-green-600';
                        actionText = 'Resoluções ultra-rápidas - manter este padrão excepcional';
                        break;
                      case 'acceptable':
                        categoryText = 'Padrão Aceitável';
                        statusColor = 'text-green-600';
                        actionText = 'Dentro dos padrões aceitáveis - performance saudável';
                        break;
                      case 'near_limit':
                        categoryText = 'Próximo ao Limite';
                        statusColor = 'text-yellow-600';
                        actionText = 'Próximo ao limite da meta de excelência - monitorar';
                        break;
                      case 'within_sla':
                        categoryText = 'Dentro do SLA';
                        statusColor = 'text-orange-600';
                        actionText = 'Dentro do SLA padrão (1 dia) - acelerar quando possível';
                        break;
                      case 'above_sla':
                        categoryText = 'Acima do SLA Básico';
                        statusColor = 'text-orange-600';
                        actionText = 'Acima do SLA básico - necessita priorização';
                        break;
                      case 'needs_attention':
                        categoryText = 'Necessita Atenção';
                        statusColor = 'text-red-600';
                        actionText = 'Necessita atenção imediata - revisar processos';
                        break;
                      case 'critical':
                        categoryText = 'Zona Crítica';
                        statusColor = 'text-red-600';
                        actionText = 'Zona crítica - escalação imediata necessária';
                        break;
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
                            <div className="text-sm font-medium text-foreground">Categoria:</div>
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
                
                <Bar dataKey="count" radius={[6, 6, 0, 0]} cursor="pointer" onClick={(data, index) => {
                  if (data) {
                    handleBarClick(data);
                  }
                }}>
                  {timeRangeAnalysis.data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="hsl(var(--border))" strokeWidth={1} className="transition-all duration-200 hover:opacity-80" />
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
                    formatter={(value: any) => value > 0 ? String(value) : ''} 
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
            
            {/* Estatísticas resumidas em grid com nova categorização */}
            <div className="grid grid-cols-4 gap-2 p-3 bg-muted/20 rounded-lg">
              <div className="text-center">
                <div className="text-lg font-bold text-green-600">
                  {timeRangeAnalysis.data.filter(d => d.category === 'excellent' || d.category === 'acceptable').reduce((acc, d) => acc + d.count, 0)}
                </div>
                <div className="text-xs text-muted-foreground font-medium">Excelência</div>
                <div className="text-xs text-muted-foreground">≤ 8h</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-yellow-600">
                  {timeRangeAnalysis.data.filter(d => d.category === 'near_limit' || d.category === 'within_sla').reduce((acc, d) => acc + d.count, 0)}
                </div>
                <div className="text-xs text-muted-foreground font-medium">SLA</div>
                <div className="text-xs text-muted-foreground">8h - 1d</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-orange-600">
                  {timeRangeAnalysis.data.filter(d => d.category === 'above_sla' || d.category === 'needs_attention').reduce((acc, d) => acc + d.count, 0)}
                </div>
                <div className="text-xs text-muted-foreground font-medium">Atenção</div>
                <div className="text-xs text-muted-foreground">1d - 3d</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-red-600">{timeRangeAnalysis.metrics.agingCritico}</div>
                <div className="text-xs text-muted-foreground font-medium">Crítico</div>
                <div className="text-xs text-muted-foreground">&gt; 3 dias</div>
              </div>
            </div>
            
            {/* Legendas das cores aprimoradas */}
            <div className="flex items-center justify-center gap-3 p-3 bg-card/30 rounded-lg border border-border/30 flex-wrap">
              <div className="flex items-center gap-1.5 text-xs">
                <div className="w-3 h-3 rounded bg-gradient-to-b from-green-500 to-green-600"></div>
                <span className="text-foreground font-medium">Excelência</span>
                <span className="text-muted-foreground">0-8h</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                <div className="w-3 h-3 rounded bg-gradient-to-b from-yellow-500 to-yellow-600"></div>
                <span className="text-foreground font-medium">SLA</span>
                <span className="text-muted-foreground">8h-1d</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                <div className="w-3 h-3 rounded bg-gradient-to-b from-orange-500 to-orange-600"></div>
                <span className="text-foreground font-medium">Atenção</span>
                <span className="text-muted-foreground">1d-3d</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                <div className="w-3 h-3 rounded bg-gradient-to-b from-red-500 to-red-600"></div>
                <span className="text-foreground font-medium">Crítico</span>
                <span className="text-muted-foreground">&gt; 3d</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

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
                  Nova Estrutura de Faixas de Tempo
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  A análise foi otimizada com faixas mais granulares para melhor identificação de padrões 
                  e oportunidades de melhoria operacional.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="space-y-3">
                    <h4 className="font-medium text-green-700">Excelência (0-8h)</h4>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span>0-0.5h:</span>
                        <span className="text-green-600">Resolução ultra-rápida</span>
                      </div>
                      <div className="flex justify-between">
                        <span>0.5-1h:</span>
                        <span className="text-green-600">Excelência operacional</span>
                      </div>
                      <div className="flex justify-between">
                        <span>1-8h:</span>
                        <span className="text-green-600">Padrão aceitável</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-medium text-red-700">Atenção e Crítico (1d+)</h4>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span>1-2 dias:</span>
                        <span className="text-orange-600">Acima do SLA básico</span>
                      </div>
                      <div className="flex justify-between">
                        <span>2-3 dias:</span>
                        <span className="text-red-600">Necessita atenção</span>
                      </div>
                      <div className="flex justify-between">
                        <span>3+ dias:</span>
                        <span className="text-red-600">Zona crítica</span>
                      </div>
                    </div>
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
                    <h5 className="text-sm font-medium text-foreground mb-2">Próximos Passos com Nova Estrutura:</h5>
                    <ul className="list-disc list-inside text-xs text-muted-foreground space-y-1">
                      <li>Foque na melhoria das faixas de excelência (0-8h) para aumentar performance</li>
                      <li>Monitore especialmente a zona crítica (&gt;3 dias) para evitar impactos</li>
                      <li>Use as faixas intermediárias para identificar gargalos específicos</li>
                      <li>Estabeleça metas progressivas por faixa de tempo</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Gráfico de Agências Top 10 com Equipamentos */}
      {agenciesStackedData.length > 0 && (
        <Card className="bg-gradient-subtle border-0 shadow-elegant">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-primary">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl font-semibold text-foreground">
                  Top 10 Agências por Volume de Ocorrências
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Distribuição por tipo de equipamento
                </p>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-4">
            <div className="mb-4 text-sm text-muted-foreground">
              {agenciesStackedData.length > 0 ? 
                `Mostrando ${agenciesStackedData.length} agências` : 
                'Nenhum dado encontrado'
              }
            </div>

            <ChartContainer config={chartConfig} className="h-[500px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={agenciesStackedData} 
                  layout="horizontal"
                  margin={{
                    top: 20,
                    right: 30,
                    left: 120,
                    bottom: 50
                  }}
                >
                  <CartesianGrid strokeDasharray="2 2" stroke="hsl(var(--border))" opacity={0.3} />
                  <XAxis 
                    type="number"
                    stroke="hsl(var(--muted-foreground))" 
                    tick={{
                      fill: 'hsl(var(--muted-foreground))',
                      fontSize: 11,
                      fontWeight: 500
                    }}
                    label={{
                      value: 'Quantidade de Ocorrências',
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
                    type="category"
                    dataKey="agencia"
                    stroke="hsl(var(--muted-foreground))" 
                    tick={{
                      fill: 'hsl(var(--muted-foreground))',
                      fontSize: 10,
                      fontWeight: 500
                    }}
                    width={110}
                  />
                  
                  <RechartsTooltip
                    content={({ active, payload, label }) => {
                      if (!active || !payload || payload.length === 0) return null;
                      
                      const data = payload[0]?.payload;
                      return (
                        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
                          <p className="font-semibold text-foreground mb-2">
                            {data?.agenciaCompleta || label}
                          </p>
                          <p className="text-sm text-muted-foreground mb-2">
                            Total: {data?.total} ocorrências
                          </p>
                          {payload
                            .filter(entry => Number(entry.value) > 0)
                            .map((entry, index) => (
                            <div key={index} className="flex items-center gap-2 text-sm">
                              <div 
                                className="w-3 h-3 rounded-sm" 
                                style={{ backgroundColor: entry.color }}
                              />
                              <span>{entry.dataKey}: {entry.value}</span>
                            </div>
                          ))}
                        </div>
                      );
                    }}
                  />
                  
                  {stackedEquipments && stackedEquipments.length > 0 && stackedEquipments.map((equipment, index) => (
                    <Bar
                      key={equipment}
                      dataKey={equipment}
                      stackId="equipment"
                      fill={stackedEquipmentColors[equipment] || '#8b5cf6'}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
            
            {/* Legenda dos equipamentos */}
            <div className="mt-4 p-3 bg-card/30 rounded-lg border border-border/30">
              <div className="flex flex-wrap items-center justify-center gap-3">
                 {stackedEquipments.map((equipment) => (
                   <div key={equipment} className="flex items-center gap-2 text-xs">
                     <div 
                       className="w-3 h-3 rounded" 
                       style={{ backgroundColor: stackedEquipmentColors[equipment] }}
                     ></div>
                     <span className="text-foreground font-medium">{equipment}</span>
                   </div>
                 ))}
              </div>
            </div>
            
            {/* Estatísticas resumidas */}
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 p-3 bg-muted/20 rounded-lg">
              <div className="text-center">
                <div className="text-lg font-bold text-primary">
                  {agenciesStackedData.reduce((acc, agency) => acc + agency.total, 0)}
                </div>
                <div className="text-xs text-muted-foreground font-medium">Total Geral</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-muted-foreground">
                  {agenciesStackedData.length}
                </div>
                <div className="text-xs text-muted-foreground font-medium">Agências</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-muted-foreground">
                  {Math.round(agenciesStackedData.reduce((acc, agency) => acc + agency.total, 0) / agenciesStackedData.length)}
                </div>
                <div className="text-xs text-muted-foreground font-medium">Média/Agência</div>
              </div>
              <div className="text-center">
                 <div className="text-lg font-bold text-muted-foreground">
                   {stackedEquipments.length}
                 </div>
                <div className="text-xs text-muted-foreground font-medium">Tipos Equip.</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
});
