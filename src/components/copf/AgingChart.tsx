import React, { memo, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip as RechartsTooltip, LabelList } from 'recharts';
import { Button } from '@/components/ui/button';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { AlertTriangle, Clock, Info } from 'lucide-react';
import { useFilters } from '@/contexts/FiltersContext';
import { toast } from 'sonner';
import { OccurrenceData } from '@/hooks/useDashboardData';


interface AgingChartProps {
  occurrences: OccurrenceData[];
  filteredOccurrences?: OccurrenceData[];
}

interface TimeRangeData {
  range: string;
  rangeLabel: string;
  count: number;
  dentroPrazo: number;
  previsaoMaiorSla: number;
  semPrevisao: number;
  minHours: number;
  maxHours: number;
}

// Faixas de tempo otimizadas
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

export const AgingChart = memo(function AgingChart({
  occurrences,
  filteredOccurrences
}: AgingChartProps) {
  const navigate = useNavigate();
  const { updateFilter } = useFilters();

  // Processar dados por faixas de tempo
  const timeRangeAnalysis = useMemo(() => {
    const sourceOccurrences = filteredOccurrences || occurrences;
    const activeOccurrences = sourceOccurrences.filter(occ => occ.status === 'a_iniciar' || occ.status === 'em_andamento');
    
    if (activeOccurrences.length === 0) {
      return {
        data: [],
        metrics: {
          total: 0,
          tempoMediano: 0,
          agingCritico: 0,
          percentualExcelencia: 0,
          percentualCritico: 0
        }
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

    // Calcular tempo mediano
    const sortedDurations = durations.map(d => d.durationHours).sort((a, b) => a - b);
    const tempoMediano = sortedDurations[Math.floor(sortedDurations.length * 0.5)] || 0;

    // Agrupar por faixas de tempo
    const timeRangeData: TimeRangeData[] = TIME_RANGES.map(range => {
      // Ocorrências dentro da faixa
      const items = durations.filter(d => {
        if (range.maxHours === Infinity) return d.durationHours >= range.minHours;
        return d.durationHours >= range.minHours && d.durationHours < range.maxHours;
      });

      // Contagens por categoria de previsão vs SLA
      let dentroPrazo = 0;
      let previsaoMaiorSla = 0;
      let semPrevisao = 0;

      items.forEach(d => {
        const createdDate = new Date(d.createdAt);
        const slaLimitHours = d.severity === 'critical' || d.severity === 'high' ? 24 : 72;
        const slaDeadline = new Date(createdDate.getTime() + slaLimitHours * 60 * 60 * 1000);

        if (!d.dataPrevisaoEncerramento) {
          semPrevisao++;
        } else {
          const previsaoDate = new Date(d.dataPrevisaoEncerramento);
          if (previsaoDate > slaDeadline) previsaoMaiorSla++;
          else dentroPrazo++;
        }
      });

      const count = dentroPrazo + previsaoMaiorSla + semPrevisao;

      return {
        range: range.range,
        rangeLabel: range.label,
        count,
        dentroPrazo,
        previsaoMaiorSla,
        semPrevisao,
        minHours: range.minHours,
        maxHours: range.maxHours
      };
    }).filter(item => item.count > 0);

    // Calcular métricas
    const excelencia = durations.filter(d => d.durationHours <= 1).length;
    const aceitavel = durations.filter(d => d.durationHours > 1 && d.durationHours <= 8).length;
    const agingCritico = durations.filter(d => d.durationHours > 72).length;
    
    const percentualExcelencia = Math.round((excelencia + aceitavel) / durations.length * 100);
    const percentualCritico = Math.round(agingCritico / durations.length * 100);

    return {
      data: timeRangeData,
      metrics: {
        total: durations.length,
        tempoMediano: Number(tempoMediano.toFixed(1)),
        agingCritico,
        percentualExcelencia,
        percentualCritico
      }
    };
  }, [occurrences, filteredOccurrences]);

  // Handler para clique nas barras
  const handleBarClick = (data: TimeRangeData, category?: 'dentroPrazo' | 'previsaoMaiorSla' | 'semPrevisao') => {
    updateFilter('statusFilterMulti', ['a_iniciar', 'em_andamento']);

    if (category) {
      const map: Record<'dentroPrazo' | 'previsaoMaiorSla' | 'semPrevisao', string> = {
        dentroPrazo: 'com_previsao_dentro_sla',
        previsaoMaiorSla: 'previsao_alem_sla',
        semPrevisao: 'sem_previsao',
      };
      updateFilter('previsaoSlaFilter', [map[category]]);
    }

    navigate(`/ocorrencias?aging_min=${data.minHours}&aging_max=${data.maxHours === Infinity ? 999999 : data.maxHours}`);

    const categoryLabel = category === 'dentroPrazo' ? 'com previsão' : category === 'previsaoMaiorSla' ? 'previsão > SLA' : category === 'semPrevisao' ? 'sem previsão' : 'todas as categorias';
    toast.success(`Filtrando ocorrências ${category ? categoryLabel : ''} entre ${data.rangeLabel}`);
  };

  // Handler para aging crítico
  const handleFilterAgingCritico = () => {
    // Aplicar filtros específicos do gráfico (sem limpar filtros existentes)
    updateFilter('statusFilterMulti', ['a_iniciar', 'em_andamento']);
    navigate('/ocorrencias?aging_min=72');
    toast.success('Mostrando ocorrências na zona crítica (>3 dias)');
  };

  // Custom Tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background/95 backdrop-blur-sm border border-border/80 rounded-lg p-3 shadow-lg">
          <p className="font-medium text-foreground">{data.rangeLabel}</p>
          <div className="space-y-1 mt-2">
            <p className="text-sm">
              <span className="inline-block w-3 h-3 rounded-sm mr-2" style={{ backgroundColor: '#ef4444' }}></span>
              Previsão &gt; SLA: {data.previsaoMaiorSla}
            </p>
            <p className="text-sm">
              <span className="inline-block w-3 h-3 rounded-sm mr-2" style={{ backgroundColor: '#6b7280' }}></span>
              Sem previsão: {data.semPrevisao}
            </p>
            <p className="text-sm">
              <span className="inline-block w-3 h-3 rounded-sm mr-2" style={{ backgroundColor: '#f59e0b' }}></span>
              Com previsão: {data.dentroPrazo}
            </p>
            <p className="text-xs text-muted-foreground">Clique em um segmento para filtrar</p>
          </div>
        </div>
      );
    }
    return null;
  };

  if (timeRangeAnalysis.data.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <Clock className="w-12 h-12 mx-auto text-muted-foreground/30 mb-2" />
          <p className="text-sm">Nenhuma ocorrência em aberto para análise de aging</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Métricas principais */}
      <div className="flex flex-wrap items-center gap-4 p-4 bg-muted/30 rounded-lg">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary"></div>
          <span className="text-sm text-muted-foreground">Total em Aberto:</span>
          <span className="font-semibold text-foreground">{timeRangeAnalysis.metrics.total}</span>
        </div>
        <div className="w-px h-4 bg-border"></div>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-2 cursor-help">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-sm text-muted-foreground">Excelência:</span>
                <span className="font-semibold text-green-600">{timeRangeAnalysis.metrics.percentualExcelencia}%</span>
                <Info className="h-3 w-3 text-muted-foreground" />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Percentual de ocorrências resolvidas em até 8 horas</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {timeRangeAnalysis.metrics.agingCritico > 0 && (
          <>
            <div className="w-px h-4 bg-border"></div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500"></div>
              <span className="text-sm text-muted-foreground">Zona Crítica:</span>
              <span className="font-semibold text-red-600">{timeRangeAnalysis.metrics.agingCritico}</span>
              <Button variant="outline" size="sm" onClick={handleFilterAgingCritico} className="ml-2">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Ver
              </Button>
            </div>
          </>
        )}
      </div>

      {/* Gráfico */}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={timeRangeAnalysis.data}
            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis 
              dataKey="rangeLabel"
              tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
              angle={-45}
              textAnchor="end"
              height={80}
              interval={0}
            />
            <YAxis 
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
              label={{ value: 'Nº de Ocorrências', angle: -90, position: 'insideLeft' }}
            />
            <RechartsTooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="previsaoMaiorSla"
              stackId="a"
              className="cursor-pointer hover:opacity-80 transition-opacity"
              fill="#ef4444"
              onClick={(data, index) => handleBarClick(timeRangeAnalysis.data[index], 'previsaoMaiorSla')}
            />
            <Bar 
              dataKey="semPrevisao"
              stackId="a"
              className="cursor-pointer hover:opacity-80 transition-opacity"
              fill="#6b7280"
              onClick={(data, index) => handleBarClick(timeRangeAnalysis.data[index], 'semPrevisao')}
            />
            <Bar 
              dataKey="dentroPrazo"
              stackId="a"
              radius={[4, 4, 0, 0]}
              className="cursor-pointer hover:opacity-80 transition-opacity"
              fill="#f59e0b"
              onClick={(data, index) => handleBarClick(timeRangeAnalysis.data[index], 'dentroPrazo')}
            >
              <LabelList 
                dataKey="count" 
                position="top" 
                style={{ 
                  fill: 'hsl(var(--foreground))', 
                  fontSize: '12px', 
                  fontWeight: 'bold',
                  textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                }} 
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legenda */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#ef4444' }}></div>
          <span>Previsão &gt; SLA</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#6b7280' }}></div>
          <span>Sem previsão</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#f59e0b' }}></div>
          <span>Com previsão</span>
        </div>
      </div>
    </div>
  );
});