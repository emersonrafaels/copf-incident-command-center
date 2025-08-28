import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Badge } from "@/components/ui/badge";
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { OccurrenceData } from '@/hooks/useDashboardData';
import { useFilters } from '@/contexts/FiltersContext';
import { useToast } from '@/hooks/use-toast';
import { Building2, AlertTriangle, Info } from 'lucide-react';

interface TopAgenciesChartProps {
  occurrences: OccurrenceData[];
  filteredOccurrences?: OccurrenceData[];
}

export function TopAgenciesChart({ occurrences, filteredOccurrences }: TopAgenciesChartProps) {
  const navigate = useNavigate();
  const { clearAllFilters, updateFilter } = useFilters();
  const { toast } = useToast();

  const chartData = useMemo(() => {
    const dataToUse = filteredOccurrences || occurrences || [];
    
    // Early return if no data
    if (!dataToUse || dataToUse.length === 0) {
      return [];
    }
    
    // Agrupar por agência
    const agencyGroups = dataToUse.reduce((acc, occurrence) => {
      const agencyKey = occurrence.agency;
      if (!acc[agencyKey]) {
        acc[agencyKey] = {
          agency: agencyKey,
          total: 0
        };
      }
      
      acc[agencyKey].total++;
      
      return acc;
    }, {} as Record<string, any>);

    // Converter para array e pegar top 10
    const topAgencies = Object.values(agencyGroups)
      .sort((a: any, b: any) => b.total - a.total)
      .slice(0, 10)
      .map((agency: any) => {
        // Adicionar marcador VIP ao nome do ponto
        const isVip = (() => {
          const number = agency.agency.match(/\d+/)?.[0] || '0';
          return number.endsWith('0') || number.endsWith('5');
        })();
        
        const agencyDisplayName = isVip ? `👑 ${agency.agency}` : agency.agency;
        
        return {
          agency: agencyDisplayName,
          originalAgency: agency.agency,
          total: agency.total,
          agencyNumber: agency.agency.match(/\d+/)?.[0] || '0',
          isVip
        };
      });

    return topAgencies;
  }, [occurrences, filteredOccurrences]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const isVip = data.isVip;
      
      return (
        <div className="bg-background/95 backdrop-blur-sm border border-border/80 rounded-lg p-4 shadow-lg min-w-[200px]">
          <div className="flex items-center gap-2 mb-2">
            <Building2 className="h-4 w-4 text-primary" />
            <p className="font-semibold text-foreground">{data.originalAgency}</p>
            {isVip && (
              <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
                VIP
              </Badge>
            )}
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Total de Ocorrências:</span>
            <span className="font-medium text-foreground">{data.total}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  const handleBarClick = (data: any) => {
    // Garantir número da agência consistente com filtros
    const agencyNumber = data.agencyNumber || (data.originalAgency?.match(/\d+/)?.[0] || '');

    // Aplicar filtros específicos do gráfico (sem limpar filtros existentes)
    updateFilter('agenciaFilter', [agencyNumber]);
    
    // Navegar para ocorrências com query param para garantir aplicação do filtro na chegada
    const params = new URLSearchParams();
    if (agencyNumber) params.set('agency', agencyNumber);
    navigate(`/ocorrencias?${params.toString()}`);
    
    // Mostrar toast de confirmação
    toast({
      title: "Filtros aplicados",
      description: `Visualizando ocorrências do ponto ${agencyNumber}`,
    });
  };

  return (
    <Card className="animate-fade-in border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="w-2 h-6 bg-gradient-to-b from-primary to-primary/60 rounded-sm"></div>
          Top 10 Pontos por Volume de Ocorrências
          <TooltipProvider>
            <UITooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Este gráfico representa os top 10 pontos com mais ocorrências. Clique nas barras para filtrar por ponto.</p>
              </TooltipContent>
            </UITooltip>
          </TooltipProvider>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Pontos com maior número de ocorrências no período
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
              
              <Bar 
                dataKey="total" 
                fill="hsl(var(--primary))"
                radius={[4, 4, 0, 0]}
                className="cursor-pointer hover:opacity-80 transition-opacity"
                onClick={handleBarClick}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Resumo dos pontos VIP */}
        {chartData && chartData.length > 0 && chartData.some((agency: any) => agency.isVip) && (
          <div className="mt-6 p-4 bg-yellow-500/5 border border-yellow-500/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-800">Pontos VIP Identificados</span>
            </div>
            <p className="text-xs text-yellow-700">
              Pontos VIP são marcados com um símbolo de 👑
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}