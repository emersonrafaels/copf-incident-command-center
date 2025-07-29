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
      
      // Contar equipamentos por agência
      if (!acc[agencyKey].equipments[occurrence.equipment]) {
        acc[agencyKey].equipments[occurrence.equipment] = 0;
      }
      acc[agencyKey].equipments[occurrence.equipment]++;
      
      return acc;
    }, {} as Record<string, any>);

    // Converter para array e pegar top 10
    const topAgencies = Object.values(agencyGroups)
      .sort((a: any, b: any) => b.total - a.total)
      .slice(0, 10)
      .map((agency: any) => {
        // Pegar os top 3 equipamentos da agência
        const topEquipments = Object.entries(agency.equipments)
          .sort(([,a], [,b]) => (b as number) - (a as number))
          .slice(0, 3)
          .map(([equipment, count]) => ({ equipment, count }));

        return {
          ...agency,
          topEquipments,
          agencyNumber: agency.agency.match(/\d+/)?.[0] || '0',
          isVip: (() => {
            const number = agency.agency.match(/\d+/)?.[0] || '0';
            return number.endsWith('0') || number.endsWith('5');
          })()
        };
      });

    return topAgencies;
  }, [occurrences, filteredOccurrences]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background/95 backdrop-blur-sm border border-border/80 rounded-lg p-4 shadow-lg min-w-[280px]">
          <div className="flex items-center gap-2 mb-3">
            <Building2 className="h-4 w-4 text-primary" />
            <p className="font-semibold text-foreground">{label}</p>
            {data.isVip && (
              <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
                VIP
              </Badge>
            )}
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-border/50 pb-2">
              <span className="text-sm text-muted-foreground">Total de Ocorrências:</span>
              <span className="font-medium text-foreground">{data.total}</span>
            </div>
            
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Principais Equipamentos:</p>
              <div className="space-y-1">
                {data.topEquipments.map((eq: any, index: number) => (
                  <div key={eq.equipment} className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <div className={`w-2 h-2 rounded-full ${
                        index === 0 ? 'bg-destructive' : 
                        index === 1 ? 'bg-orange-500' : 'bg-yellow-500'
                      }`} />
                      {eq.equipment}
                    </span>
                    <span className="text-xs font-medium">{eq.count}</span>
                  </div>
                ))}
              </div>
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
              data={chartData}
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
              <Bar dataKey="total" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.isVip ? 'hsl(var(--warning))' : 'hsl(var(--primary))'} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Detalhamento das agências */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-foreground border-b border-border/50 pb-2">
            Detalhamento dos Equipamentos Problemáticos
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {chartData.slice(0, 6).map((agency, index) => (
              <div key={agency.agency} className="bg-muted/20 rounded-lg p-3 border border-border/30">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">
                      {index + 1}º - {agency.agency}
                    </span>
                    {agency.isVip && (
                      <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20 text-xs">
                        VIP
                      </Badge>
                    )}
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {agency.total} ocorrências
                  </Badge>
                </div>
                
                <div className="space-y-1">
                  {agency.topEquipments.map((eq: any, eqIndex: number) => (
                    <div key={eq.equipment} className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <div className={`w-1.5 h-1.5 rounded-full ${
                          eqIndex === 0 ? 'bg-destructive' : 
                          eqIndex === 1 ? 'bg-orange-500' : 'bg-yellow-500'
                        }`} />
                        {eq.equipment}
                      </span>
                      <span className="font-medium">{eq.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t border-border/50">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-primary rounded-sm"></div>
            <span className="text-sm text-muted-foreground">Agência Convencional</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-warning rounded-sm"></div>
            <span className="text-sm text-muted-foreground">Agência VIP</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}