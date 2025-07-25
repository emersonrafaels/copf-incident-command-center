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
    <div className="space-y-8">
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
                  Análise Long Tail - Tempos de Resolução
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Distribuição de ocorrências por faixas de tempo aberto
                </p>
              </div>
            </div>
            <Button 
              variant="premium" 
              size="sm"
              onClick={handleFilterOutliers}
              className="flex items-center gap-2 shadow-card-hover"
            >
              <AlertTriangle className="h-4 w-4" />
              Ver Outliers Críticos
            </Button>
          </div>

          {/* Métricas em linha horizontal */}
          <div className="flex flex-wrap items-center gap-3 mt-6 p-4 bg-card/50 rounded-lg border border-border/50">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary"></div>
              <span className="text-sm text-muted-foreground">Total:</span>
              <span className="text-lg font-bold text-foreground">{timeRangeAnalysis.metrics.total}</span>
            </div>
            <div className="w-px h-6 bg-border"></div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-success"></div>
              <span className="text-sm text-muted-foreground">P50:</span>
              <span className="text-lg font-bold text-success">{timeRangeAnalysis.metrics.p50}h</span>
            </div>
            <div className="w-px h-6 bg-border"></div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-warning"></div>
              <span className="text-sm text-muted-foreground">Meta P90:</span>
              <span className="text-lg font-bold text-warning">{timeRangeAnalysis.metrics.p90}h</span>
            </div>
            <div className="w-px h-6 bg-border"></div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-destructive"></div>
              <span className="text-sm text-muted-foreground">Outliers:</span>
              <span className="text-lg font-bold text-destructive">{timeRangeAnalysis.metrics.outliers}</span>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <ChartContainer config={chartConfig} className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={timeRangeAnalysis.data} 
                margin={{ top: 20, right: 30, left: 40, bottom: 80 }}
              >
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
                
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke="hsl(var(--border))" 
                  opacity={0.3}
                />
                <XAxis 
                  dataKey="rangeLabel"
                  stroke="hsl(var(--muted-foreground))"
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  interval={0}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                />
                
                <ChartTooltipContent 
                  formatter={(value, name) => [
                    `${value} ocorrências`, 
                    'Quantidade'
                  ]}
                  labelFormatter={(label) => `Faixa: ${label}`}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    boxShadow: 'var(--shadow-elegant)'
                  }}
                />
                
                <Bar 
                  dataKey="count" 
                  radius={[6, 6, 0, 0]}
                  className="cursor-pointer transition-all duration-200"
                >
                  {timeRangeAnalysis.data.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.category === 'within_target' ? 'url(#barGradient1)' : 
                            entry.category === 'above_target' ? 'url(#barGradient2)' : 
                            'url(#barGradient3)'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Insights e legendas - Layout aprimorado */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Legenda com design moderno */}
        <Card className="border-border/50 shadow-card-default">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              Legenda das Categorias
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-success/5 border border-success/20">
                <div className="w-3 h-3 rounded-full bg-gradient-to-br from-success to-success/70"></div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-success-foreground">Dentro do padrão</div>
                  <div className="text-xs text-muted-foreground">≤ {timeRangeAnalysis.metrics.p90}h - Performance ideal</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-warning/5 border border-warning/20">
                <div className="w-3 h-3 rounded-full bg-gradient-to-br from-warning to-warning/70"></div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-warning-foreground">Acima da meta</div>
                  <div className="text-xs text-muted-foreground">{timeRangeAnalysis.metrics.p90}h - 5 dias - Atenção necessária</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-destructive/5 border border-destructive/20">
                <div className="w-3 h-3 rounded-full bg-gradient-to-br from-destructive to-destructive/70"></div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-destructive-foreground">Outliers críticos</div>
                  <div className="text-xs text-muted-foreground">&gt; 5 dias - Revisão urgente</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Narrativa operacional com destaque */}
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