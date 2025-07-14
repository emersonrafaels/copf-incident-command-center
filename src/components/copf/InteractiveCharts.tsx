import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart'
import { Button } from '@/components/ui/button'
import { TrendingUp, BarChart3, PieChart as PieChartIcon, Activity } from 'lucide-react'
import { useState } from 'react'

interface InteractiveChartsProps {
  severityData: Array<{ name: string; value: number; fill: string }>
  timelineData: Array<{ date: string; ocorrencias: number; resolvidas: number }>
  mttrData: Array<{ mes: string; mttr: number }>
  equipmentData: Array<{ name: string; value: number; fill: string }>
  occurrences: Array<{ equipment: string; segment: string }>
}

const chartConfig = {
  ocorrencias: {
    label: "Ocorrências",
    color: "hsl(var(--primary))"
  },
  resolvidas: {
    label: "Resolvidas", 
    color: "hsl(var(--success))"
  },
  mttr: {
    label: "MTTR (horas)",
    color: "hsl(var(--warning))"
  }
}

export function InteractiveCharts({ severityData, timelineData, mttrData, equipmentData, occurrences }: InteractiveChartsProps) {
  const [viewMode, setViewMode] = useState<'segment' | 'equipment'>('segment')

  const segmentData = [
    { name: 'AA', value: equipmentData.find(e => e.name.includes('AA'))?.value || 0, fill: 'hsl(var(--primary))' },
    { name: 'AB', value: equipmentData.find(e => e.name.includes('AB'))?.value || 0, fill: 'hsl(var(--warning))' }
  ]

  // Calcular distribuição real de equipamentos baseada nas ocorrências
  const equipmentCounts = occurrences.reduce((acc: any, occurrence: any) => {
    if (occurrence.equipment) {
      acc[occurrence.equipment] = (acc[occurrence.equipment] || 0) + 1;
    }
    return acc;
  }, {});

  // Converter para formato do gráfico
  const equipmentTypeData = Object.entries(equipmentCounts).map(([equipment, count], index) => ({
    name: equipment,
    value: count as number,
    fill: [
      'hsl(var(--primary))',
      'hsl(var(--warning))', 
      'hsl(var(--success))',
      'hsl(var(--destructive))',
      'hsl(var(--muted-foreground))',
      'hsl(var(--accent))'
    ][index % 6]
  })).sort((a, b) => b.value - a.value).slice(0, 6); // Top 6 equipamentos

  const currentData = viewMode === 'segment' ? segmentData : equipmentTypeData

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Distribuição por Severidade - Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Distribuição por Severidade
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={severityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="name" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <Tooltip 
                  content={<ChartTooltipContent />}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 'var(--radius)'
                  }}
                />
                <Bar dataKey="value" radius={4} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Timeline de Ocorrências - Line Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Tendência Semanal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="date" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <Tooltip 
                  content={<ChartTooltipContent />}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 'var(--radius)'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="ocorrencias" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--primary))' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="resolvidas" 
                  stroke="hsl(var(--success))" 
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--success))' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Distribuição de Ocorrências - Pie Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PieChartIcon className="h-5 w-5" />
              Distribuição de Ocorrências
            </div>
            <div className="flex gap-2">
              <Button 
                variant={viewMode === 'segment' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('segment')}
              >
                Segmento
              </Button>
              <Button 
                variant={viewMode === 'equipment' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('equipment')}
              >
                Equipamento
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={currentData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {currentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip 
                  content={<ChartTooltipContent />}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 'var(--radius)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* MTTR Histórico - Area Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            MTTR Histórico
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mttrData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="mes" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <Tooltip 
                  content={<ChartTooltipContent />}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 'var(--radius)'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="mttr" 
                  stroke="hsl(var(--warning))" 
                  fill="hsl(var(--warning) / 0.2)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}