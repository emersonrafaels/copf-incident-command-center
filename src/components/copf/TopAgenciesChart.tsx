import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Badge } from "@/components/ui/badge";
import { OccurrenceData } from '@/hooks/useDashboardData';
import { Building2, AlertTriangle } from 'lucide-react';

interface TopAgenciesChartProps {
  occurrences: OccurrenceData[];
  filteredOccurrences?: OccurrenceData[];
}

export function TopAgenciesChart({ occurrences, filteredOccurrences }: TopAgenciesChartProps) {
  // Mapeamento de equipamentos para segmentos
  const getEquipmentSegment = (equipment: string): 'AA' | 'AB' => {
    const aaEquipments = ['ATM Saque', 'ATM Depósito', 'Cassete'];
    return aaEquipments.includes(equipment) ? 'AA' : 'AB';
  };
  const chartData = useMemo(() => {
    const dataToUse = filteredOccurrences || occurrences;
    
    // Agrupar por agência
    const agencyGroups = dataToUse.reduce((acc, occurrence) => {
      const agencyKey = occurrence.agency;
      if (!acc[agencyKey]) {
        acc[agencyKey] = {
          agency: agencyKey,
          total: 0,
          equipments: {} as Record<string, number>
        };
      }
      
      acc[agencyKey].total++;
      
      // Contar equipamentos por agência (com segmento)
      const equipmentWithSegment = `${getEquipmentSegment(occurrence.equipment)} - ${occurrence.equipment}`;
      if (!acc[agencyKey].equipments[equipmentWithSegment]) {
        acc[agencyKey].equipments[equipmentWithSegment] = 0;
      }
      acc[agencyKey].equipments[equipmentWithSegment]++;
      
      return acc;
    }, {} as Record<string, any>);

    // Pegar todos os equipamentos únicos (com segmento)
    const allEquipments = new Set<string>();
    Object.values(agencyGroups).forEach((agency: any) => {
      Object.keys(agency.equipments).forEach(eq => allEquipments.add(eq));
    });

    // Converter para array e pegar top 10
    const topAgencies = Object.values(agencyGroups)
      .sort((a: any, b: any) => b.total - a.total)
      .slice(0, 10)
      .map((agency: any) => {
        // Adicionar marcador VIP ao nome da agência
        const isVip = (() => {
          const number = agency.agency.match(/\d+/)?.[0] || '0';
          return number.endsWith('0') || number.endsWith('5');
        })();
        
        const agencyDisplayName = isVip ? `🏆 ${agency.agency}` : agency.agency;
        
        const result: any = {
          agency: agencyDisplayName,
          originalAgency: agency.agency,
          total: agency.total,
          agencyNumber: agency.agency.match(/\d+/)?.[0] || '0',
          isVip
        };

        // Adicionar cada equipamento como propriedade
        Array.from(allEquipments).forEach(equipment => {
          result[equipment] = agency.equipments[equipment] || 0;
        });

        return result;
      });

    return { chartData: topAgencies, allEquipments: Array.from(allEquipments) };
  }, [occurrences, filteredOccurrences]);

  // Cores para os equipamentos
  const equipmentColors = [
    'hsl(var(--primary))',
    'hsl(var(--destructive))', 
    'hsl(var(--warning))',
    'hsl(142 76% 36%)', // verde
    'hsl(262 83% 58%)', // roxo
    'hsl(217 91% 60%)', // azul
    'hsl(27 96% 61%)',  // laranja
    'hsl(173 58% 39%)', // teal
    'hsl(43 74% 66%)',  // amarelo
    'hsl(348 83% 47%)'  // rosa
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const isVip = data.isVip;
      
      return (
        <div className="bg-background/95 backdrop-blur-sm border border-border/80 rounded-lg p-4 shadow-lg min-w-[280px]">
          <div className="flex items-center gap-2 mb-3">
            <Building2 className="h-4 w-4 text-primary" />
            <p className="font-semibold text-foreground">{data.originalAgency}</p>
            {isVip && (
              <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
                VIP
              </Badge>
            )}
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between border-b border-border/50 pb-2">
              <span className="text-sm text-muted-foreground">Total de Ocorrências:</span>
              <span className="font-medium text-foreground">{data.total}</span>
            </div>
            
            <div className="space-y-1">
              {payload
                .filter((entry: any) => entry.value > 0)
                .sort((a: any, b: any) => b.value - a.value)
                .map((entry: any, index: number) => (
                <div key={entry.dataKey} className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground flex items-center gap-2">
                    <div 
                      className="w-2 h-2 rounded-full" 
                      style={{ backgroundColor: entry.color }}
                    />
                    {entry.dataKey}
                  </span>
                  <span className="text-xs font-medium">{entry.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="animate-fade-in border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="w-2 h-6 bg-gradient-to-b from-primary to-primary/60 rounded-sm"></div>
          Top 10 Agências por Volume de Ocorrências
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Agências com maior número de ocorrências e seus principais equipamentos problemáticos
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-96 mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData.chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis 
                dataKey="agency"
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                angle={-45}
                textAnchor="end"
                height={100}
                interval={0}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                label={{ value: 'Nº de Ocorrências', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip content={<CustomTooltip />} />
              
              {chartData.allEquipments.map((equipment, index) => (
                <Bar 
                  key={equipment}
                  dataKey={equipment} 
                  stackId="a"
                  fill={equipmentColors[index % equipmentColors.length]}
                  radius={index === chartData.allEquipments.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Legenda dos equipamentos */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-foreground border-b border-border/50 pb-2">
            Legenda dos Equipamentos
          </h4>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {chartData.allEquipments.map((equipment, index) => (
              <div key={equipment} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-sm" 
                  style={{ backgroundColor: equipmentColors[index % equipmentColors.length] }}
                />
                <span className="text-xs text-muted-foreground">{equipment}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Resumo das agências VIP */}
        {chartData.chartData.some((agency: any) => agency.isVip) && (
          <div className="mt-6 p-4 bg-yellow-500/5 border border-yellow-500/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-800">Agências VIP Identificadas</span>
            </div>
            <p className="text-xs text-yellow-700">
              As agências marcadas como VIP requerem atenção prioritária devido ao seu status estratégico.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}