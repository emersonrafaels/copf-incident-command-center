import React, { memo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import type { ChartData, TimelineData, MTTRData, OccurrenceData } from '@/hooks/useDashboardData'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  AreaChart,
  Area,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  Cell
} from 'recharts'

interface OptimizedInteractiveChartsProps {
  severityData: ChartData[]
  timelineData: TimelineData[]
  mttrData: MTTRData[]
  equipmentData: ChartData[]
  occurrences: OccurrenceData[]
}

// Componente de fallback para carregamento
const ChartSkeleton = memo(() => (
  <div className="h-[300px] w-full">
    <Skeleton className="h-full w-full" />
  </div>
))

ChartSkeleton.displayName = 'ChartSkeleton'

// Configuração memoizada dos gráficos
const chartConfig = {
  critico: { label: "Crítico", color: "hsl(var(--destructive))" },
  alto: { label: "Alto", color: "hsl(var(--warning))" },
  medio: { label: "Médio", color: "hsl(var(--primary))" },
  baixo: { label: "Baixo", color: "hsl(var(--muted-foreground))" },
  ocorrencias: { label: "Ocorrências", color: "hsl(var(--primary))" },
  resolvidas: { label: "Resolvidas", color: "hsl(var(--success))" },
  mttr: { label: "MTTR (horas)", color: "hsl(var(--primary))" },
  segmentoAA: { label: "Segmento AA", color: "hsl(var(--primary))" },
  segmentoAB: { label: "Segmento AB", color: "hsl(var(--warning))" },
}

// Componente individual de gráfico memoizado
const SeverityChart = memo(({ data }: { data: ChartData[] }) => {
  if (!data || data.length === 0) {
    return (
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>Distribuição por Severidade</CardTitle>
          <CardDescription>Classificação das ocorrências por nível de severidade</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartSkeleton />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Distribuição por Severidade</CardTitle>
        <CardDescription>Classificação das ocorrências por nível de severidade</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="value">
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
})

SeverityChart.displayName = 'SeverityChart'

// Timeline chart memoizado
const TimelineChart = memo(({ data }: { data: TimelineData[] }) => {
  if (!data || data.length === 0) {
    return (
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>Histórico de Ocorrências</CardTitle>
          <CardDescription>Evolução das ocorrências e resoluções</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartSkeleton />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Histórico de Ocorrências</CardTitle>
        <CardDescription>Evolução das ocorrências e resoluções</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line 
                type="monotone" 
                dataKey="ocorrencias" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                dot={{ r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="resolvidas" 
                stroke="hsl(var(--success))" 
                strokeWidth={2}
                dot={{ r: 4 }}
              />
              <Legend />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
})

TimelineChart.displayName = 'TimelineChart'

// Equipment distribution chart memoizado
const EquipmentChart = memo(({ 
  data, 
  viewMode, 
  onViewModeChange 
}: { 
  data: ChartData[]
  viewMode: 'segment' | 'equipment'
  onViewModeChange: (mode: 'segment' | 'equipment') => void
}) => {
  if (!data || data.length === 0) {
    return (
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>Distribuição de Ocorrências</CardTitle>
          <CardDescription>
            Análise por {viewMode === 'segment' ? 'segmento' : 'equipamento'}
          </CardDescription>
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'segment' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onViewModeChange('segment')}
            >
              Por Segmento
            </Button>
            <Button
              variant={viewMode === 'equipment' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onViewModeChange('equipment')}
            >
              Por Equipamento
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ChartSkeleton />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Distribuição de Ocorrências</CardTitle>
        <CardDescription>
          Análise por {viewMode === 'segment' ? 'segmento' : 'equipamento'}
        </CardDescription>
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'segment' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onViewModeChange('segment')}
          >
            Por Segmento
          </Button>
          <Button
            variant={viewMode === 'equipment' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onViewModeChange('equipment')}
          >
            Por Equipamento
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
})

EquipmentChart.displayName = 'EquipmentChart'

// MTTR chart memoizado
const MTTRChart = memo(({ data }: { data: MTTRData[] }) => {
  if (!data || data.length === 0) {
    return (
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>Histórico MTTR</CardTitle>
          <CardDescription>Tempo médio de resolução ao longo dos meses</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartSkeleton />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Histórico MTTR</CardTitle>
        <CardDescription>Tempo médio de resolução ao longo dos meses</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area 
                type="monotone" 
                dataKey="mttr" 
                stroke="hsl(var(--primary))" 
                fill="hsl(var(--primary))"
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
})

MTTRChart.displayName = 'MTTRChart'

// Componente principal otimizado
const OptimizedInteractiveChartsComponent = memo<OptimizedInteractiveChartsProps>(({
  severityData,
  timelineData,
  mttrData,
  equipmentData,
  occurrences
}) => {
  const [viewMode, setViewMode] = React.useState<'segment' | 'equipment'>('segment')

  // Dados de equipamento processados com memoização
  const processedEquipmentData = React.useMemo(() => {
    if (viewMode === 'segment') {
      return equipmentData
    }
    
    // Para modo equipamento, pegar top 6 equipamentos
    const equipmentCount = occurrences.reduce((acc, occurrence) => {
      acc[occurrence.equipment] = (acc[occurrence.equipment] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return Object.entries(equipmentCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 6)
      .map(([equipment, count], index) => ({
        name: equipment,
        value: count,
        fill: `hsl(${index * 60}, 70%, 50%)`
      }))
  }, [viewMode, equipmentData, occurrences])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <SeverityChart data={severityData} />
      <TimelineChart data={timelineData} />
      <EquipmentChart 
        data={processedEquipmentData}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />
      <MTTRChart data={mttrData} />
    </div>
  )
})

OptimizedInteractiveChartsComponent.displayName = 'OptimizedInteractiveChartsComponent'

export { OptimizedInteractiveChartsComponent as OptimizedInteractiveCharts }