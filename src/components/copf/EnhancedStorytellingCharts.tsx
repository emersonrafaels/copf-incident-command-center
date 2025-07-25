import React, { memo, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  ScatterChart,
  Scatter
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart'
import { OperationalNarrativeCard } from './OperationalNarrativeCard'
import { 
  BarChart3, 
  PieChart as PieChartIcon, 
  Activity, 
  Clock, 
  AlertTriangle, 
  Building2,
  Gauge,
  RotateCcw,
  Zap,
  Target,
  Timer
} from 'lucide-react'
import { useFilters } from '@/contexts/FiltersContext'
import { toast } from 'sonner'

interface EnhancedStorytellingChartsProps {
  occurrences: Array<{ 
    id: string
    equipment: string
    segment: string
    agency: string
    vendor: string
    createdAt: string
    status: string
    severity: string
    serialNumber: string
    description: string
    isReincident?: boolean
  }>
}

const chartConfig = {
  occurrences: {
    label: "Ocorrências",
    color: "hsl(var(--primary))"
  },
  critical: {
    label: "Crítico",
    color: "hsl(var(--destructive))"
  },
  high: {
    label: "Alto", 
    color: "hsl(var(--warning))"
  },
  medium: {
    label: "Médio",
    color: "hsl(var(--primary))"
  },
  low: {
    label: "Baixo",
    color: "hsl(var(--muted-foreground))"
  }
}

export const EnhancedStorytellingCharts = memo(function EnhancedStorytellingCharts({ 
  occurrences 
}: EnhancedStorytellingChartsProps) {
  const navigate = useNavigate()
  const { updateFilter, clearAllFilters } = useFilters()

  // Handler para cliques nos gráficos
  const handleChartClick = (filterType: string, filterValue: string | string[], label: string) => {
    clearAllFilters()
    
    setTimeout(() => {
      switch (filterType) {
        case 'status':
          updateFilter('statusFilterMulti', Array.isArray(filterValue) ? filterValue : [filterValue])
          break
        case 'equipment':
          updateFilter('equipmentFilterMulti', Array.isArray(filterValue) ? filterValue : [filterValue])
          break
        case 'agency':
          updateFilter('agenciaFilter', Array.isArray(filterValue) ? filterValue : [filterValue])
          break
      }
      
      navigate('/ocorrencias')
      toast.success(`Filtrando por: ${label}`)
    }, 100)
  }

  // Processamento dos dados com insights narrativos
  const statusData = useMemo(() => {
    if (!Array.isArray(occurrences) || occurrences.length === 0) {
      return { data: [], insight: "Aguardando dados para análise..." }
    }
    
    const statusMap = {
      'a_iniciar': 'A Iniciar',
      'em_andamento': 'Em Andamento', 
      'encerrado': 'Encerrado',
      'com_impedimentos': 'Com Impedimentos',
      'cancelado': 'Cancelado'
    }
    
    const statusCounts = occurrences.reduce((acc, occ) => {
      const status = statusMap[occ?.status as keyof typeof statusMap] || 'Outros'
      acc[status] = (acc[status] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const colors = {
      'A Iniciar': 'hsl(var(--warning))',
      'Em Andamento': 'hsl(var(--primary))',
      'Encerrado': 'hsl(var(--success))',
      'Com Impedimentos': 'hsl(var(--amber-500))',
      'Cancelado': 'hsl(var(--muted-foreground))',
      'Outros': 'hsl(var(--muted))'
    }

    const data = Object.entries(statusCounts).map(([status, count]) => ({
      name: status,
      value: Math.max(count || 0, 0),
      fill: colors[status as keyof typeof colors] || 'hsl(var(--muted))',
      originalStatus: Object.keys(statusMap).find(key => statusMap[key as keyof typeof statusMap] === status) || status
    }))
    
    // Gerar insight inteligente
    const total = data.reduce((sum, item) => sum + item.value, 0)
    const pending = (statusCounts['A Iniciar'] || 0) + (statusCounts['Em Andamento'] || 0)
    const resolved = statusCounts['Encerrado'] || 0
    const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0
    
    let insight = `${resolutionRate}% das ocorrências foram resolvidas. `
    let priority: 'high' | 'medium' | 'low' = 'medium'
    let actionSuggestion = ""
    
    if (resolutionRate < 70) {
      insight += `Taxa de resolução abaixo do esperado (${pending} pendentes).`
      priority = 'high'
      actionSuggestion = "Priorizar resolução das ocorrências pendentes e revisar processos operacionais."
    } else if (resolutionRate > 85) {
      insight += "Excelente performance operacional!"
      priority = 'low'
      actionSuggestion = "Manter práticas atuais e documentar casos de sucesso."
    } else {
      insight += "Performance dentro do esperado."
      actionSuggestion = "Monitorar tendências e otimizar processos gradualmente."
    }
    
    return { 
      data, 
      insight, 
      priority, 
      actionSuggestion,
      metric: { value: `${resolutionRate}%`, label: "Taxa de Resolução" }
    }
  }, [occurrences])

  const equipmentData = useMemo(() => {
    if (!Array.isArray(occurrences) || occurrences.length === 0) {
      return { data: [], insight: "Aguardando dados para análise..." }
    }
    
    const equipmentCounts = occurrences.reduce((acc, occ) => {
      const equipment = occ?.equipment || 'Desconhecido'
      acc[equipment] = (acc[equipment] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const data = Object.entries(equipmentCounts)
      .sort(([, a], [, b]) => (b || 0) - (a || 0))
      .slice(0, 5)
      .map(([equipment, count]) => ({
        name: equipment,
        value: Math.max(count || 0, 0),
        fill: 'hsl(var(--primary))'
      }))
      
    // Gerar insight inteligente
    const topEquipment = data[0]
    const totalOccurrences = Object.values(equipmentCounts).reduce((sum, count) => sum + count, 0)
    const topPercentage = topEquipment ? Math.round((topEquipment.value / totalOccurrences) * 100) : 0
    
    let insight = `${topEquipment?.name || 'N/A'} lidera com ${topPercentage}% das ocorrências.`
    let priority: 'high' | 'medium' | 'low' = 'medium'
    let actionSuggestion = ""
    
    if (topPercentage > 40) {
      insight += " Concentração crítica de falhas."
      priority = 'high'
      actionSuggestion = "Investigar causa raiz e implementar manutenção preventiva urgente."
    } else if (topPercentage < 25) {
      insight += " Distribuição equilibrada de ocorrências."
      priority = 'low'
      actionSuggestion = "Manter monitoramento preventivo atual."
    } else {
      actionSuggestion = "Implementar plano de manutenção focado nos equipamentos críticos."
    }
    
    return { 
      data, 
      insight, 
      priority, 
      actionSuggestion,
      metric: { value: topPercentage + "%", label: "Concentração no Topo" }
    }
  }, [occurrences])

  const timelineData = useMemo(() => {
    const today = new Date()
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      return date.toISOString().split('T')[0]
    }).reverse()

    const data = last7Days.map(date => {
      const dayOccurrences = occurrences.filter(occ => 
        occ.createdAt.startsWith(date)
      )
      
      return {
        date: new Date(date).toLocaleDateString('pt-BR', { 
          day: '2-digit', 
          month: '2-digit' 
        }),
        total: dayOccurrences.length,
        critical: dayOccurrences.filter(occ => occ.severity === 'critical').length,
        high: dayOccurrences.filter(occ => occ.severity === 'high').length
      }
    })

    // Gerar insight de tendência
    const todayCount = data[data.length - 1]?.total || 0
    const yesterdayCount = data[data.length - 2]?.total || 0
    const avgLast7Days = data.reduce((sum, day) => sum + day.total, 0) / 7
    
    let insight = `Média de ${avgLast7Days.toFixed(1)} ocorrências/dia nos últimos 7 dias.`
    let trend: 'up' | 'down' | 'stable' = 'stable'
    let priority: 'high' | 'medium' | 'low' = 'medium'
    
    if (todayCount > yesterdayCount * 1.2) {
      insight += " Tendência de crescimento detectada."
      trend = 'up'
      priority = 'high'
    } else if (todayCount < yesterdayCount * 0.8) {
      insight += " Tendência de redução positiva."
      trend = 'down'
      priority = 'low'
    } else {
      insight += " Volume estável."
    }
    
    return { 
      data, 
      insight, 
      trend, 
      priority,
      metric: { value: avgLast7Days.toFixed(1), label: "Média Diária (7d)" }
    }
  }, [occurrences])

  // Renderização condicional
  if (!Array.isArray(occurrences) || occurrences.length === 0) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Aguardando Dados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] flex items-center justify-center text-muted-foreground">
              Carregando dados para análise operacional...
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Seção A: Situação Atual */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Target className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold text-foreground">Situação Atual</h2>
          <div className="h-px bg-border flex-1 ml-4" />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Status Overview */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  <PieChartIcon className="h-4 w-4" />
                  Status das Ocorrências
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusData.data}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={120}
                        paddingAngle={2}
                        dataKey="value"
                        onClick={(data) => handleChartClick('status', data.originalStatus, data.name)}
                        className="cursor-pointer"
                      >
                        {statusData.data.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <ChartTooltipContent />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
          
          {/* Status Narrative */}
          <OperationalNarrativeCard
            title="Análise de Status"
            insight={statusData.insight}
            priority={statusData.priority}
            actionSuggestion={statusData.actionSuggestion}
            metric={statusData.metric}
          />
        </div>
      </div>

      {/* Seção B: Análise de Tendências */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold text-foreground">Análise de Tendências</h2>
          <div className="h-px bg-border flex-1 ml-4" />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Timeline */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  <Timer className="h-4 w-4" />
                  Evolução Temporal (7 dias)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={timelineData.data}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis 
                        dataKey="date" 
                        stroke="hsl(var(--muted-foreground))"
                        tick={{ fill: 'hsl(var(--muted-foreground))' }}
                      />
                      <YAxis 
                        stroke="hsl(var(--muted-foreground))"
                        tick={{ fill: 'hsl(var(--muted-foreground))' }}
                      />
                      <ChartTooltipContent />
                      <Area
                        type="monotone"
                        dataKey="critical"
                        stackId="1"
                        stroke="hsl(var(--destructive))"
                        fill="hsl(var(--destructive))"
                        fillOpacity={0.8}
                      />
                      <Area
                        type="monotone"
                        dataKey="high"
                        stackId="1"
                        stroke="hsl(var(--warning))"
                        fill="hsl(var(--warning))"
                        fillOpacity={0.8}
                      />
                      <Area
                        type="monotone"
                        dataKey="total"
                        stroke="hsl(var(--primary))"
                        fill="hsl(var(--primary))"
                        fillOpacity={0.3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
          
          {/* Timeline Narrative */}
          <OperationalNarrativeCard
            title="Tendência Temporal"
            insight={timelineData.insight}
            trend={timelineData.trend}
            priority={timelineData.priority}
            metric={timelineData.metric}
          />
        </div>
      </div>

      {/* Seção C: Análise de Equipamentos */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold text-foreground">Equipamentos Críticos</h2>
          <div className="h-px bg-border flex-1 ml-4" />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Equipment Chart */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Top 5 Equipamentos com Mais Falhas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={equipmentData.data}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis 
                        dataKey="name" 
                        stroke="hsl(var(--muted-foreground))"
                        tick={{ fill: 'hsl(var(--muted-foreground))' }}
                      />
                      <YAxis 
                        stroke="hsl(var(--muted-foreground))"
                        tick={{ fill: 'hsl(var(--muted-foreground))' }}
                      />
                      <ChartTooltipContent />
                      <Bar 
                        dataKey="value" 
                        fill="hsl(var(--primary))"
                        onClick={(data) => handleChartClick('equipment', data.name, `Equipamento: ${data.name}`)}
                        className="cursor-pointer"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
          
          {/* Equipment Narrative */}
          <OperationalNarrativeCard
            title="Análise de Equipamentos"
            insight={equipmentData.insight}
            priority={equipmentData.priority}
            actionSuggestion={equipmentData.actionSuggestion}
            metric={equipmentData.metric}
          />
        </div>
      </div>
    </div>
  )
})