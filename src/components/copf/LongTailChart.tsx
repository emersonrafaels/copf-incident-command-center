import React, { memo, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer,
  ReferenceLine
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

interface DurationData {
  id: string
  durationHours: number
  equipment: string
  agency: string
  severity: string
  rank: number
  percentile: 'within_target' | 'attention' | 'critical'
  color: string
}

const chartConfig = {
  duration: {
    label: "Duração (horas)",
    color: "hsl(var(--primary))"
  }
}

export const LongTailChart = memo(function LongTailChart({ 
  occurrences 
}: LongTailChartProps) {
  const navigate = useNavigate()
  const { updateFilter, clearAllFilters } = useFilters()

  // Processar dados de duração com percentis
  const durationAnalysis = useMemo(() => {
    // Filtrar apenas ocorrências resolvidas
    const resolvedOccurrences = occurrences.filter(occ => 
      occ.status === 'encerrada' && occ.resolvedAt && occ.createdAt
    )

    if (resolvedOccurrences.length === 0) {
      return { 
        data: [], 
        metrics: { total: 0, p50: 0, p90: 0, p95: 0, outliers: 0 },
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

    // Ordenar por duração (menor para maior)
    durations.sort((a, b) => a.durationHours - b.durationHours)

    // Calcular percentis
    const sortedDurations = durations.map(d => d.durationHours).sort((a, b) => a - b)
    const p50 = sortedDurations[Math.floor(sortedDurations.length * 0.5)]
    const p90 = sortedDurations[Math.floor(sortedDurations.length * 0.9)]
    const p95 = sortedDurations[Math.floor(sortedDurations.length * 0.95)]

    // Preparar dados para visualização (Top 50 mais demoradas)
    const top50 = durations.slice(-50).reverse()
    
    const data: DurationData[] = top50.map((item, index) => {
      let percentile: 'within_target' | 'attention' | 'critical' = 'within_target'
      let color = 'hsl(var(--success))'

      if (item.durationHours > p95) {
        percentile = 'critical'
        color = 'hsl(var(--destructive))'
      } else if (item.durationHours > p90) {
        percentile = 'attention'
        color = 'hsl(var(--warning))'
      }

      return {
        id: item.id,
        durationHours: Number(item.durationHours.toFixed(1)),
        equipment: item.equipment,
        agency: item.agency,
        severity: item.severity,
        rank: top50.length - index,
        percentile,
        color
      }
    })

    // Contar outliers (acima de 5 dias = 120h)
    const outliers = durations.filter(d => d.durationHours > 120).length
    const outliersPercentage = Math.round((outliers / durations.length) * 100)

    // Gerar insight operacional
    let insight = `P50: ${p50.toFixed(1)}h | P90: ${p90.toFixed(1)}h | P95: ${p95.toFixed(1)}h`
    let priority: 'high' | 'medium' | 'low' = 'medium'
    let actionSuggestion = ""

    if (outliersPercentage > 5) {
      insight += ` | ${outliers} ocorrências acima de 5 dias (${outliersPercentage}% - crítico)`
      priority = 'high'
      actionSuggestion = "Revisar urgentemente os processos operacionais. Concentração alta de outliers detectada."
    } else if (outliers > 0) {
      insight += ` | ${outliers} ocorrências acima de 5 dias (long tail identificado)`
      actionSuggestion = "Investigar causas específicas dos casos outliers para evitar reincidência."
    } else {
      insight += " | Performance dentro do esperado"
      priority = 'low'
      actionSuggestion = "Manter monitoramento atual e documentar boas práticas."
    }

    return {
      data,
      metrics: {
        total: durations.length,
        p50: Number(p50.toFixed(1)),
        p90: Number(p90.toFixed(1)), 
        p95: Number(p95.toFixed(1)),
        outliers
      },
      insight,
      priority,
      actionSuggestion
    }
  }, [occurrences])

  // Handler para cliques nas barras
  const handleBarClick = (data: any) => {
    if (data && data.id) {
      toast.info(`Navegando para detalhes da ocorrência ${data.id}`)
      // Aqui seria implementada a navegação para o modal ou página de detalhes
    }
  }

  // Handler para filtrar outliers
  const handleFilterOutliers = () => {
    clearAllFilters()
    
    setTimeout(() => {
      updateFilter('statusFilterMulti', ['encerrada'])
      navigate('/ocorrencias')
      toast.success('Filtrando ocorrências resolvidas > 5 dias')
    }, 100)
  }

  // Renderização condicional
  if (durationAnalysis.data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Long Tail - Duração de Resolução
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            Aguardando ocorrências resolvidas para análise Long Tail...
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Seção A: Long Tail Chart Principal */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold text-foreground">Long Tail - Análise de Duração</h2>
          <div className="h-px bg-border flex-1 ml-4" />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart Principal */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Top 50 - Maiores Tempos de Resolução
                </CardTitle>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleFilterOutliers}
                    className="flex items-center gap-1"
                  >
                    <AlertTriangle className="h-3 w-3" />
                    Ver Outliers
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={durationAnalysis.data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis 
                        dataKey="rank"
                        stroke="hsl(var(--muted-foreground))"
                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                        label={{ value: 'Ranking (piores casos)', position: 'insideBottom', offset: -5 }}
                      />
                      <YAxis 
                        stroke="hsl(var(--muted-foreground))"
                        tick={{ fill: 'hsl(var(--muted-foreground))' }}
                        label={{ value: 'Duração (horas)', angle: -90, position: 'insideLeft' }}
                      />
                      
                      {/* Linhas de referência para percentis */}
                      <ReferenceLine 
                        y={durationAnalysis.metrics.p90} 
                        stroke="hsl(var(--warning))" 
                        strokeDasharray="5 5"
                        label={`P90: ${durationAnalysis.metrics.p90}h`}
                      />
                      <ReferenceLine 
                        y={durationAnalysis.metrics.p95} 
                        stroke="hsl(var(--destructive))" 
                        strokeDasharray="5 5"
                        label={`P95: ${durationAnalysis.metrics.p95}h`}
                      />
                      <ReferenceLine 
                        y={120} 
                        stroke="hsl(var(--destructive))" 
                        strokeWidth={2}
                        label="5 dias (120h)"
                      />
                      
                      <ChartTooltipContent 
                        formatter={(value, name, props) => [
                          `${value}h`, 
                          `${props.payload?.equipment} - ${props.payload?.agency}`
                        ]}
                      />
                      <Bar 
                        dataKey="durationHours" 
                        fill="hsl(var(--primary))"
                        onClick={handleBarClick}
                        className="cursor-pointer"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
          
          {/* Métricas e Narrativa */}
          <div className="space-y-4">
            {/* Métricas Principais */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Métricas Operacionais
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center">
                    <div className="text-lg font-bold text-primary">{durationAnalysis.metrics.p50}h</div>
                    <div className="text-xs text-muted-foreground">P50 (Mediana)</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-warning">{durationAnalysis.metrics.p90}h</div>
                    <div className="text-xs text-muted-foreground">P90 (Meta)</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-destructive">{durationAnalysis.metrics.p95}h</div>
                    <div className="text-xs text-muted-foreground">P95 (Crítico)</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-destructive">{durationAnalysis.metrics.outliers}</div>
                    <div className="text-xs text-muted-foreground">Outliers &gt;5d</div>
                  </div>
                </div>
                
                <div className="pt-2 border-t">
                  <div className="text-center">
                    <div className="text-sm font-medium">{durationAnalysis.metrics.total} ocorrências resolvidas</div>
                    <div className="text-xs text-muted-foreground">Base para análise</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Narrativa Operacional */}
            <OperationalNarrativeCard
              title="Análise Long Tail"
              insight={durationAnalysis.insight}
              priority={durationAnalysis.priority}
              actionSuggestion={durationAnalysis.actionSuggestion}
              metric={{ 
                value: `${durationAnalysis.metrics.outliers}`, 
                label: "Outliers Críticos" 
              }}
            />
          </div>
        </div>
      </div>

      {/* Seção B: Legenda e Interpretação */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Como Interpretar o Long Tail</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-success"></div>
              <span><strong>Verde:</strong> Até P90 (dentro da meta operacional)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-warning"></div>
              <span><strong>Amarelo:</strong> P90-P95 (atenção - investigar)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-destructive"></div>
              <span><strong>Vermelho:</strong> &gt;P95 (outliers críticos)</span>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground">
              <strong>Long Tail Operacional:</strong> A maioria das ocorrências deve ser resolvida rapidamente (zona verde), 
              mas alguns casos complexos podem demorar mais. Casos &gt; 5 dias (120h) requerem atenção especial e 
              revisão dos processos operacionais.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
})