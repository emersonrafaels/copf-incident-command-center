import React, { memo, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
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
import { Badge } from '@/components/ui/badge'
import { 
  BarChart3, 
  PieChart as PieChartIcon, 
  Activity, 
  Clock, 
  AlertTriangle, 
  Building2,
  Gauge,
  RotateCcw,
  Zap
} from 'lucide-react'
import { useFilters } from '@/contexts/FiltersContext'
import { toast } from 'sonner'

interface ClickableChartsProps {
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

interface ChartClickData {
  filterType: string
  filterValue: string | string[]
  label: string
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

const ClickableChartsComponent = memo(function ClickableCharts({ occurrences }: ClickableChartsProps) {
  const navigate = useNavigate()
  const { updateFilter, clearAllFilters } = useFilters()

  // Handler para cliques nos gráficos
  const handleChartClick = (data: ChartClickData) => {
    // Limpar filtros anteriores primeiro
    clearAllFilters()
    
    // Aplicar novo filtro baseado no clique
    setTimeout(() => {
      switch (data.filterType) {
        case 'status':
          updateFilter('statusFilterMulti', Array.isArray(data.filterValue) ? data.filterValue : [data.filterValue])
          break
        case 'severity':
          updateFilter('statusFilter', data.filterValue as string)
          break
        case 'equipment':
          updateFilter('equipmentFilterMulti', Array.isArray(data.filterValue) ? data.filterValue : [data.filterValue])
          break
        case 'vendor':
          updateFilter('vendorFilterMulti', Array.isArray(data.filterValue) ? data.filterValue : [data.filterValue])
          break
        case 'agency':
          updateFilter('agenciaFilter', Array.isArray(data.filterValue) ? data.filterValue : [data.filterValue])
          break
        case 'uf':
          updateFilter('ufFilter', Array.isArray(data.filterValue) ? data.filterValue : [data.filterValue])
          break
        case 'reincident':
          updateFilter('reincidentFilter', true)
          break
      }
      
      // Navegar para página de ocorrências
      navigate('/ocorrencias')
      
      // Mostrar toast de confirmação
      toast.success(`Filtro aplicado: ${data.label}`, {
        description: "Redirecionando para lista de ocorrências..."
      })
    }, 100)
  }

  // 1. Status das Ocorrências (Donut Chart)
  const statusData = useMemo(() => {
    console.log('ClickableCharts - Input occurrences:', occurrences.length)
    
    const statusMap = {
      'a_iniciar': 'A Iniciar',
      'em_atuacao': 'Em Atuação', 
      'encerrada': 'Encerrada',
      'cancelada': 'Cancelada'
    }
    
    const statusCounts = occurrences.reduce((acc, occ) => {
      const status = statusMap[occ.status as keyof typeof statusMap] || occ.status
      acc[status] = (acc[status] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const colors = {
      'A Iniciar': 'hsl(var(--warning))',
      'Em Atuação': 'hsl(var(--primary))',
      'Encerrada': 'hsl(var(--success))',
      'Cancelada': 'hsl(var(--muted-foreground))'
    }

    const result = Object.entries(statusCounts).map(([status, count]) => ({
      name: status,
      value: count,
      fill: colors[status as keyof typeof colors] || 'hsl(var(--muted-foreground))',
      originalStatus: Object.keys(statusMap).find(key => statusMap[key as keyof typeof statusMap] === status) || status
    }))
    
    console.log('StatusData result:', result)
    return result
  }, [occurrences])

  // 2. Top 5 Equipamentos com Mais Falhas (Bar Chart)
  const topEquipmentData = useMemo(() => {
    const equipmentCounts = occurrences.reduce((acc, occ) => {
      acc[occ.equipment] = (acc[occ.equipment] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const result = Object.entries(equipmentCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([equipment, count]) => ({
        name: equipment,
        value: count,
        fill: 'hsl(var(--primary))'
      }))
      
    console.log('TopEquipmentData result:', result)
    return result
  }, [occurrences])

  // 3. Timeline dos Últimos 7 Dias (Area Chart)
  const timelineData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (6 - i))
      return {
        date: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        fullDate: date.toISOString().split('T')[0]
      }
    })

    const result = last7Days.map(({ date, fullDate }) => {
      const dayOccurrences = occurrences.filter(occ => {
        const occDate = new Date(occ.createdAt)
        const targetDate = new Date(fullDate)
        return occDate.toDateString() === targetDate.toDateString()
      })
      
      const total = dayOccurrences.length || 0
      const critical = dayOccurrences.filter(o => o.severity === 'critical').length || 0
      const high = dayOccurrences.filter(o => o.severity === 'high').length || 0
      
      return {
        date,
        total: isNaN(total) ? 0 : total,
        critical: isNaN(critical) ? 0 : critical,
        high: isNaN(high) ? 0 : high
      }
    })
    
    console.log('TimelineData result:', result)
    return result
  }, [occurrences])

  // 4. Top 5 Agências com Mais Ocorrências (Bar Chart)
  const topAgenciesData = useMemo(() => {
    const agencyCounts = occurrences.reduce((acc, occ) => {
      acc[occ.agency] = (acc[occ.agency] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const result = Object.entries(agencyCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([agency, count]) => ({
        name: agency,
        value: count,
        fill: 'hsl(var(--warning))'
      }))
      
    console.log('TopAgenciesData result:', result)
    return result
  }, [occurrences])

  // 5. Performance por Fornecedor (Gauge-style Bar Chart)
  const vendorPerformanceData = useMemo(() => {
    const vendorData = occurrences.reduce((acc, occ) => {
      if (!acc[occ.vendor]) {
        acc[occ.vendor] = { total: 0, resolved: 0 }
      }
      acc[occ.vendor].total++
      if (occ.status === 'encerrada') {
        acc[occ.vendor].resolved++
      }
      return acc
    }, {} as Record<string, { total: number, resolved: number }>)

    const result = Object.entries(vendorData)
      .filter(([, data]) => data.total > 0) // Filtrar vendors sem ocorrências
      .map(([vendor, data]) => {
        const performance = data.total > 0 ? Math.round((data.resolved / data.total) * 100) : 0
        return {
          name: vendor,
          performance: isNaN(performance) ? 0 : performance,
          total: data.total,
          fill: performance > 80 ? 'hsl(var(--success))' : 
                performance > 60 ? 'hsl(var(--warning))' : 'hsl(var(--destructive))'
        }
      })
      .sort((a, b) => b.performance - a.performance)
      .slice(0, 5)
    
    console.log('VendorPerformanceData result:', result)
    return result
  }, [occurrences])

  // 6. Reincidência por Equipamento (Scatter Plot)
  const reincidenceData = useMemo(() => {
    const equipmentData = occurrences.reduce((acc, occ) => {
      if (!acc[occ.equipment]) {
        acc[occ.equipment] = { total: 0, reincident: 0 }
      }
      acc[occ.equipment].total++
      if (occ.isReincident) {
        acc[occ.equipment].reincident++
      }
      return acc
    }, {} as Record<string, { total: number, reincident: number }>)

    const result = Object.entries(equipmentData)
      .filter(([, data]) => data.total >= 3) // Apenas equipamentos com 3+ ocorrências
      .map(([equipment, data]) => {
        const reincidenceRate = data.total > 0 ? Math.round((data.reincident / data.total) * 100) : 0
        return {
          equipment,
          total: data.total,
          reincidenceRate: isNaN(reincidenceRate) ? 0 : reincidenceRate,
          fill: reincidenceRate > 30 ? 'hsl(var(--destructive))' : 
                reincidenceRate > 10 ? 'hsl(var(--warning))' : 'hsl(var(--success))'
        }
      })
      .filter(item => item.total > 0 && item.reincidenceRate >= 0) // Filtrar dados inválidos
    
    console.log('ReincidenceData result:', result)
    return result
  }, [occurrences])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      
      {/* 1. Status das Ocorrências - Donut */}
      <Card className="cursor-pointer hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChartIcon className="h-5 w-5" />
            Status das Ocorrências
            <Badge variant="secondary" className="ml-auto">{occurrences.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  onClick={(data) => handleChartClick({
                    filterType: 'status',
                    filterValue: data.originalStatus,
                    label: `Status: ${data.name}`
                  })}
                  className="cursor-pointer"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* 2. Top 5 Equipamentos - Bar Chart */}
      <Card className="cursor-pointer hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Top 5 Equipamentos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topEquipmentData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis type="category" dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} width={100} />
                <Tooltip content={<ChartTooltipContent />} />
                <Bar 
                  dataKey="value" 
                  radius={4}
                  onClick={(data) => handleChartClick({
                    filterType: 'equipment',
                    filterValue: data.name,
                    label: `Equipamento: ${data.name}`
                  })}
                  className="cursor-pointer"
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* 3. Timeline Últimos 7 Dias - Area Chart */}
      <Card className="cursor-pointer hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Timeline 7 Dias
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip content={<ChartTooltipContent />} />
                <Area 
                  type="monotone" 
                  dataKey="total" 
                  stroke="hsl(var(--primary))" 
                  fill="hsl(var(--primary) / 0.3)"
                  strokeWidth={2}
                  onClick={() => handleChartClick({
                    filterType: 'period',
                    filterValue: '7-days',
                    label: 'Últimos 7 dias'
                  })}
                  className="cursor-pointer"
                />
                <Area 
                  type="monotone" 
                  dataKey="critical" 
                  stroke="hsl(var(--destructive))" 
                  fill="hsl(var(--destructive) / 0.2)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* 4. Top 5 Agências - Bar Chart */}
      <Card className="cursor-pointer hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Top 5 Agências
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topAgenciesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip content={<ChartTooltipContent />} />
                <Bar 
                  dataKey="value" 
                  radius={4}
                  onClick={(data) => handleChartClick({
                    filterType: 'agency',
                    filterValue: data.name,
                    label: `Agência: ${data.name}`
                  })}
                  className="cursor-pointer"
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* 5. Performance por Fornecedor - Gauge */}
      <Card className="cursor-pointer hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gauge className="h-5 w-5" />
            Performance Fornecedores
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={vendorPerformanceData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" domain={[0, 100]} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis type="category" dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} width={80} />
                <Tooltip 
                  content={<ChartTooltipContent />}
                  formatter={(value) => [`${value}%`, 'Taxa de Resolução']}
                />
                <Bar 
                  dataKey="performance" 
                  radius={4}
                  onClick={(data) => handleChartClick({
                    filterType: 'vendor',
                    filterValue: data.name,
                    label: `Fornecedor: ${data.name}`
                  })}
                  className="cursor-pointer"
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* 6. Reincidência por Equipamento - Scatter */}
      <Card className="cursor-pointer hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RotateCcw className="h-5 w-5" />
            Reincidência por Equipamento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart data={reincidenceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="total" 
                  stroke="hsl(var(--muted-foreground))" 
                  fontSize={12}
                  name="Total de Ocorrências"
                />
                <YAxis 
                  dataKey="reincidenceRate" 
                  stroke="hsl(var(--muted-foreground))" 
                  fontSize={12}
                  name="% Reincidência"
                />
                <Tooltip 
                  content={<ChartTooltipContent />}
                  formatter={(value, name) => [
                    name === 'reincidenceRate' ? `${value}%` : value,
                    name === 'reincidenceRate' ? 'Taxa de Reincidência' : 'Total de Ocorrências'
                  ]}
                />
                <Scatter 
                  dataKey="reincidenceRate"
                  onClick={(data) => handleChartClick({
                    filterType: 'reincident',
                    filterValue: 'true',
                    label: `Reincidências: ${data.equipment}`
                  })}
                  className="cursor-pointer"
                />
              </ScatterChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

    </div>
  )
})

export { ClickableChartsComponent as ClickableCharts }