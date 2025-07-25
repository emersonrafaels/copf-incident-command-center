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
  Area,
  ComposedChart
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart'
import { Button } from '@/components/ui/button'
import { TrendingUp, BarChart3, PieChart as PieChartIcon, Activity, Clock, AlertTriangle, Building2, Zap } from 'lucide-react'
import React, { useState, memo, useMemo } from 'react'

interface EnhancedInteractiveChartsProps {
  severityData: Array<{ name: string; value: number; fill: string }>
  timelineData: Array<{ date: string; ocorrencias: number; resolvidas: number }>
  mttrData: Array<{ mes: string; mttr: number }>
  equipmentData: Array<{ name: string; value: number; fill: string }>
  occurrences: Array<{ 
    equipment: string; 
    segment: string; 
    agency: string; 
    createdAt: string; 
    status: string;
    severity: string;
  }>
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
  },
  sla: {
    label: "% Cumprimento SLA",
    color: "hsl(var(--success))"
  },
  reincidencia: {
    label: "% Reincidência",
    color: "hsl(var(--destructive))"
  }
}

const EnhancedInteractiveChartsComponent = memo(function EnhancedInteractiveCharts({ 
  severityData, 
  timelineData, 
  mttrData, 
  equipmentData, 
  occurrences 
}: EnhancedInteractiveChartsProps) {
  
  // Gerar dados históricos de volume por segmento/equipamento
  const generateSegmentEquipmentVolume = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return {
        date: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        fullDate: date.toISOString().split('T')[0]
      };
    });

    return last7Days.map(({ date, fullDate }) => {
      const dayOccurrences = occurrences.filter(occ => 
        new Date(occ.createdAt).toDateString() === new Date(fullDate).toDateString()
      );
      
      const aaCount = dayOccurrences.filter(occ => occ.segment === 'AA').length;
      const abCount = dayOccurrences.filter(occ => occ.segment === 'AB').length;
      
      return {
        date,
        'Segmento AA': aaCount || Math.floor(Math.random() * 15) + 5,
        'Segmento AB': abCount || Math.floor(Math.random() * 10) + 3,
      };
    });
  }, [occurrences]);

  // Gerar dados históricos de volume por agência
  const generateAgencyVolume = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return {
        date: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        fullDate: date.toISOString().split('T')[0]
      };
    });

    // Agrupar agências mais comuns
    const agencyCounts = occurrences.reduce((acc: any, occ) => {
      const agencyNumber = occ.agency.match(/\d+/)?.[0] || '';
      acc[agencyNumber] = (acc[agencyNumber] || 0) + 1;
      return acc;
    }, {});

    const topAgencies = Object.entries(agencyCounts)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 5)
      .map(([agencyNumber]) => `AG${agencyNumber.padStart(4, '0')}`);

    return last7Days.map(({ date }) => {
      const dayData: any = { date };
      
      topAgencies.forEach(agency => {
        dayData[agency] = Math.floor(Math.random() * 8) + 1;
      });
      
      return dayData;
    });
  }, [occurrences]);

  // Gerar dados de cumprimento de SLA por segmento/equipamento
  const generateSLACompliance = useMemo(() => {
    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (5 - i));
      return date.toLocaleDateString('pt-BR', { month: 'short' });
    });

    return last6Months.map(month => ({
      mes: month,
      'Segmento AA': Math.floor(Math.random() * 20) + 75, // 75-95%
      'Segmento AB': Math.floor(Math.random() * 25) + 70, // 70-95%
    }));
  }, []);

  // Gerar dados de reincidência por segmento/equipamento
  const generateReincidenceData = useMemo(() => {
    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (5 - i));
      return date.toLocaleDateString('pt-BR', { month: 'short' });
    });

    return last6Months.map(month => ({
      mes: month,
      'Segmento AA': Math.floor(Math.random() * 15) + 5, // 5-20%
      'Segmento AB': Math.floor(Math.random() * 12) + 8, // 8-20%
    }));
  }, []);

  const colors = ['hsl(var(--primary))', 'hsl(var(--warning))', 'hsl(var(--success))', 'hsl(var(--destructive))', 'hsl(var(--muted-foreground))'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 1. Distribuição por Severidade */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Distribuição por Criticidade
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

      {/* 2. Histórico de Volume por Segmento/Equipamento */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Volume por Segmento - Histórico 7 dias
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Comparativo de ocorrências entre segmentos AA e AB
          </p>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={generateSegmentEquipmentVolume}>
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
                <Bar dataKey="Segmento AA" fill="hsl(var(--primary))" radius={2} />
                <Bar dataKey="Segmento AB" fill="hsl(var(--warning))" radius={2} />
              </ComposedChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* 3. Histórico de Volume por Agência */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Volume por Agência - Histórico 7 dias
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Top 5 agências com mais ocorrências
          </p>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={generateAgencyVolume}>
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
                {generateAgencyVolume[0] && Object.keys(generateAgencyVolume[0])
                  .filter(key => key !== 'date')
                  .map((agency, index) => (
                    <Line 
                      key={agency}
                      type="monotone" 
                      dataKey={agency} 
                      stroke={colors[index % colors.length]} 
                      strokeWidth={2}
                      dot={{ fill: colors[index % colors.length], r: 4 }}
                    />
                  ))}
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* 4. Histórico de Cumprimento de SLA por Segmento */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Cumprimento de SLA por Segmento
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Percentual de cumprimento de SLA nos últimos 6 meses
          </p>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={generateSLACompliance}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="mes" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  domain={[60, 100]}
                />
                <Tooltip 
                  content={<ChartTooltipContent />}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 'var(--radius)'
                  }}
                  formatter={(value) => [`${value}%`, '']}
                />
                <Area 
                  type="monotone" 
                  dataKey="Segmento AA" 
                  stackId="1"
                  stroke="hsl(var(--primary))" 
                  fill="hsl(var(--primary) / 0.3)"
                  strokeWidth={2}
                />
                <Area 
                  type="monotone" 
                  dataKey="Segmento AB" 
                  stackId="2"
                  stroke="hsl(var(--warning))" 
                  fill="hsl(var(--warning) / 0.3)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* 5. Histórico de Reincidência por Segmento */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Reincidência por Segmento
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Percentual de reincidência nos últimos 6 meses
          </p>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={generateReincidenceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="mes" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  domain={[0, 25]}
                />
                <Tooltip 
                  content={<ChartTooltipContent />}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 'var(--radius)'
                  }}
                  formatter={(value) => [`${value}%`, '']}
                />
                <Line 
                  type="monotone" 
                  dataKey="Segmento AA" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={3}
                  dot={{ fill: 'hsl(var(--primary))', r: 5 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="Segmento AB" 
                  stroke="hsl(var(--warning))" 
                  strokeWidth={3}
                  dot={{ fill: 'hsl(var(--warning))', r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* MTTR Histórico - Area Chart (mantido) */}
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
})

export { EnhancedInteractiveChartsComponent as EnhancedInteractiveCharts }