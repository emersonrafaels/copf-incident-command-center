import React, { memo, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer,
  ReferenceLine,
  Cell
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { OperationalNarrativeCard } from './OperationalNarrativeCard'
import { 
  BarChart3, 
  Clock, 
  AlertTriangle, 
  ArrowRight,
  TrendingUp
} from 'lucide-react'
import { useFilters } from '@/contexts/FiltersContext'
import { toast } from 'sonner'
import { OccurrenceData } from '@/hooks/useDashboardData'

interface LongTailChartProps {
  occurrences: OccurrenceData[]
}

interface TimeRangeData {
  range: string
  rangeLabel: string
  count: number
  color: string
  category: 'within_target' | 'above_target' | 'critical'
  minHours: number
  maxHours: number
}

const chartConfig = {
  count: {
    label: "Quantidade de Ocorrências",
    color: "hsl(var(--primary))"
  }
}

// Definir faixas de tempo em horas
const TIME_RANGES = [
  { range: '0-0.5', minHours: 0, maxHours: 0.5, label: '0 - 0,5h' },
  { range: '0.5-1', minHours: 0.5, maxHours: 1, label: '0,5 - 1h' },
  { range: '1-2', minHours: 1, maxHours: 2, label: '1 - 2h' },
  { range: '2-4', minHours: 2, maxHours: 4, label: '2 - 4h' },
  { range: '4-8', minHours: 4, maxHours: 8, label: '4 - 8h' },
  { range: '8-12', minHours: 8, maxHours: 12, label: '8 - 12h' },
  { range: '12-24', minHours: 12, maxHours: 24, label: '12 - 24h' },
  { range: '24-48', minHours: 24, maxHours: 48, label: '1 - 2 dias' },
  { range: '48-72', minHours: 48, maxHours: 72, label: '2 - 3 dias' },
  { range: '72-120', minHours: 72, maxHours: 120, label: '3 - 5 dias' },
  { range: '120+', minHours: 120, maxHours: Infinity, label: '> 5 dias' }
]

export const LongTailChart = memo(function LongTailChart({ 
  occurrences 
}: LongTailChartProps) {
  const navigate = useNavigate()
  const { updateFilter, clearAllFilters } = useFilters()

  // Processar dados por faixas de tempo
  const timeRangeAnalysis = useMemo(() => {
    // Filtrar apenas ocorrências resolvidas
    const resolvedOccurrences = occurrences.filter(occ => 
      occ.status === 'encerrada' && occ.resolvedAt && occ.createdAt
    )

    if (resolvedOccurrences.length === 0) {
      return { 
        data: [], 
        metrics: { total: 0, p50: 0, p90: 0, outliers: 0 },
        insight: "Aguardando ocorrências resolvidas para análise...",
        priority: 'medium' as const
      }
    }

    // Calcular durações em horas
    const durations = resolvedOccurrences.map(occ => {
      const created = new Date(occ.createdAt)
      const resolved = new Date(occ.resolvedAt!)
      const durationHours = (resolved.getTime() - created.getTime()) / (1000 * 60 * 60)
      return { ...occ, durationHours }
    })

    // Calcular percentis para definir metas
    const sortedDurations = durations.map(d => d.durationHours).sort((a, b) => a - b)
    const p50 = sortedDurations[Math.floor(sortedDurations.length * 0.5)] || 0
    const p90 = sortedDurations[Math.floor(sortedDurations.length * 0.9)] || 12.8

    // Agrupar por faixas de tempo
    const timeRangeData: TimeRangeData[] = TIME_RANGES.map(range => {
      const count = durations.filter(d => {
        if (range.maxHours === Infinity) {
          return d.durationHours >= range.minHours
        }
        return d.durationHours >= range.minHours && d.durationHours < range.maxHours
      }).length

      // Definir categoria e cor baseado na faixa
      let category: 'within_target' | 'above_target' | 'critical' = 'within_target'
      let color = '#22c55e' // Verde - dentro do padrão

      if (range.minHours >= 120) { // > 5 dias
        category = 'critical'
        color = '#ef4444' // Vermelho - outliers críticos
      } else if (range.minHours >= p90) { // Acima do P90
        category = 'above_target'
        color = '#f59e0b' // Laranja - acima da meta
      } else if (range.minHours >= 12) { // Entre 12h e P90
        category = 'above_target'
        color = '#f97316' // Laranja mais escuro
      }

      return {
        range: range.range,
        rangeLabel: range.label,
        count,
        color,
        category,
        minHours: range.minHours,
        maxHours: range.maxHours
      }
    }).filter(item => item.count > 0) // Filtrar faixas vazias

    // Contar outliers (> 5 dias)
    const outliers = durations.filter(d => d.durationHours > 120).length
    const outliersPercentage = Math.round((outliers / durations.length) * 100)

    // Gerar insight operacional
    let insight = `${durations.length} ocorrências analisadas | P50: ${p50.toFixed(1)}h | P90: ${p90.toFixed(1)}h`
    let priority: 'high' | 'medium' | 'low' = 'medium'
    let actionSuggestion = ""

    if (outliersPercentage > 5) {
      insight += ` | ${outliers} outliers críticos (${outliersPercentage}%)`
      priority = 'high'
      actionSuggestion = "Alto número de outliers detectado. Revisar processos operacionais urgentemente."
    } else if (outliers > 0) {
      insight += ` | ${outliers} outliers identificados`
      actionSuggestion = "Investigar causas específicas dos casos que excedem 5 dias de resolução."
    } else {
      insight += " | Distribuição saudável"
      priority = 'low'
      actionSuggestion = "Performance dentro do esperado. Manter monitoramento atual."
    }

    return {
      data: timeRangeData,
      metrics: {
        total: durations.length,
        p50: Number(p50.toFixed(1)),
        p90: Number(p90.toFixed(1)),
        outliers
      },
      insight,
      priority,
      actionSuggestion
    }
  }, [occurrences])

  // Handler para filtrar outliers
  const handleFilterOutliers = () => {
    clearAllFilters()
    
    setTimeout(() => {
      updateFilter('statusFilterMulti', ['encerrada'])
      navigate('/ocorrencias')
      toast.success('Filtrando ocorrências com outliers críticos')
    }, 100)
  }

  // Renderização condicional
  if (timeRangeAnalysis.data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Análise Long Tail - Tempos de Resolução
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            Aguardando ocorrências resolvidas para análise...
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header com título */}
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold text-foreground">Análise Long Tail - Tempos de Resolução</h2>
        <div className="h-px bg-border flex-1 ml-4" />
      </div>

      {/* Métricas principais no topo */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{timeRangeAnalysis.metrics.total}</div>
            <div className="text-sm text-muted-foreground">Total de Ocorrências</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-success">{timeRangeAnalysis.metrics.p50}h</div>
            <div className="text-sm text-muted-foreground">Mediana (P50)</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-warning">{timeRangeAnalysis.metrics.p90}h</div>
            <div className="text-sm text-muted-foreground">P90 (Meta)</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-destructive">{timeRangeAnalysis.metrics.outliers}</div>
            <div className="text-sm text-muted-foreground">Outliers (&gt;P90)</div>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico principal */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Distribuição por Faixas de Tempo Aberto
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleFilterOutliers}
            className="flex items-center gap-1"
          >
            <AlertTriangle className="h-3 w-3" />
            Aplicar Filtros
            <ArrowRight className="h-3 w-3" />
          </Button>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={timeRangeAnalysis.data} 
                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="rangeLabel"
                  stroke="hsl(var(--muted-foreground))"
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  interval={0}
                  label={{ 
                    value: 'Faixas de tempo aberto (horas)', 
                    position: 'insideBottom', 
                    offset: -10,
                    style: { textAnchor: 'middle' }
                  }}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  label={{ 
                    value: 'Quantidade de ocorrências', 
                    angle: -90, 
                    position: 'insideLeft',
                    style: { textAnchor: 'middle' }
                  }}
                />
                
                {/* Linha de referência para meta P90 */}
                <ReferenceLine 
                  y={0} 
                  stroke="hsl(var(--warning))" 
                  strokeDasharray="5 5"
                  label={`Meta P90: ${timeRangeAnalysis.metrics.p90}h`}
                />
                
                <ChartTooltipContent 
                  formatter={(value, name) => [
                    `${value} ocorrências`, 
                    'Quantidade'
                  ]}
                  labelFormatter={(label) => `Faixa: ${label}`}
                />
                
                <Bar 
                  dataKey="count" 
                  radius={[4, 4, 0, 0]}
                  className="cursor-pointer"
                >
                  {timeRangeAnalysis.data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Legenda e narrativa */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Legenda explicativa */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Entendendo as Métricas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: '#22c55e' }}></div>
                <div>
                  <div className="text-sm font-medium">Dentro do padrão</div>
                  <div className="text-xs text-muted-foreground">≤ {timeRangeAnalysis.metrics.p90}h</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: '#f97316' }}></div>
                <div>
                  <div className="text-sm font-medium">Acima da meta</div>
                  <div className="text-xs text-muted-foreground">{timeRangeAnalysis.metrics.p90}h - 5 dias</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: '#ef4444' }}></div>
                <div>
                  <div className="text-sm font-medium">Outliers críticos</div>
                  <div className="text-xs text-muted-foreground">&gt; 5 dias</div>
                </div>
              </div>
            </div>
            
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground">
                <strong>Distribuição Long Tail:</strong> A maioria das ocorrências deve ser resolvida 
                dentro da meta operacional. Faixas que excedem 5 dias (outliers críticos) requerem 
                atenção especial e revisão dos processos.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Narrativa operacional */}
        <OperationalNarrativeCard
          title="Análise Operacional"
          insight={timeRangeAnalysis.insight}
          priority={timeRangeAnalysis.priority}
          actionSuggestion={timeRangeAnalysis.actionSuggestion}
          metric={{ 
            value: `${timeRangeAnalysis.metrics.outliers}`, 
            label: "Outliers Críticos" 
          }}
        />
      </div>
    </div>
  )
})