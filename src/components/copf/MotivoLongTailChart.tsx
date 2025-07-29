import React, { memo, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip as RechartsTooltip, Cell, LabelList, ComposedChart, Line, ReferenceLine } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { AlertTriangle, TrendingDown, Info } from 'lucide-react';
import { useFilters } from '@/contexts/FiltersContext';
import { toast } from 'sonner';
import { OccurrenceData } from '@/hooks/useDashboardData';

interface MotivoLongTailChartProps {
  occurrences: OccurrenceData[];
  filteredOccurrences?: OccurrenceData[];
}

interface MotivoData {
  motivo: string;
  motivoCompleto: string;
  motivoDisplay: string; // Versão melhor formatada para exibição
  count: number;
  percentage: number;
  cumulativePercentage: number;
  color: string;
}

export const MotivoLongTailChart = memo(function MotivoLongTailChart({
  occurrences,
  filteredOccurrences
}: MotivoLongTailChartProps) {
  const navigate = useNavigate();
  const { updateFilter, clearAllFilters } = useFilters();

  // Processar dados por motivo de ocorrência
  const motivoData = useMemo(() => {
    const sourceOccurrences = filteredOccurrences || occurrences;
    
    if (sourceOccurrences.length === 0) {
      return [];
    }

    // Contar ocorrências por motivo
    const motivoCounts = new Map<string, number>();
    sourceOccurrences.forEach(occurrence => {
      const motivo = occurrence.motivoOcorrencia || 'Não informado';
      motivoCounts.set(motivo, (motivoCounts.get(motivo) || 0) + 1);
    });

    // Converter para array e ordenar por quantidade (desc)
    const sortedMotivos = Array.from(motivoCounts.entries())
      .map(([motivo, count]) => ({
        motivoCompleto: motivo,
        count,
        percentage: Math.round((count / sourceOccurrences.length) * 100)
      }))
      .sort((a, b) => b.count - a.count);

    // Calcular percentual acumulado e formatação de display
    let cumulativeSum = 0;
    const data: MotivoData[] = sortedMotivos.map((item, index) => {
      cumulativeSum += item.percentage;
      
      // Melhor formatação do texto para exibição
      const motivoDisplay = item.motivoCompleto.length > 25 
        ? item.motivoCompleto.substring(0, 25) + '...' 
        : item.motivoCompleto;
      
      // Cores baseadas na posição (Long Tail)
      let color = '#10b981'; // Verde para os menos comuns
      
      if (index < 3) {
        color = '#ef4444'; // Vermelho para os top 3 (mais problemáticos)
      } else if (index < 8) {
        color = '#f59e0b'; // Amarelo para os próximos 5
      } else if (index < 15) {
        color = '#3b82f6'; // Azul para os próximos 7
      }

      return {
        motivo: motivoDisplay, // Para exibição no eixo X
        motivoCompleto: item.motivoCompleto,
        motivoDisplay: motivoDisplay,
        count: item.count,
        percentage: item.percentage,
        cumulativePercentage: cumulativeSum,
        color
      };
    });

    return data.slice(0, 20); // Mostrar apenas top 20 para melhor visualização
  }, [occurrences, filteredOccurrences]);

  // Handler para clique nas barras
  const handleBarClick = (data: MotivoData) => {
    clearAllFilters();
    setTimeout(() => {
      // Aplicar filtro por motivo
      updateFilter('motivoFilter', [data.motivoCompleto]);
      
      // Navegar para a página de ocorrências
      navigate('/ocorrencias');
    }, 100);
  };

  // Custom Tooltip melhorado
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background/95 backdrop-blur-sm border border-border/80 rounded-lg p-4 shadow-lg max-w-xs">
          <p className="font-medium text-foreground text-sm mb-2">{data.motivoCompleto}</p>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm flex items-center gap-2">
                <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: data.color }}></span>
                Ocorrências:
              </span>
              <span className="font-medium">{data.count}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Percentual:</span>
              <span className="font-medium">{data.percentage}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">% Acumulado:</span>
              <span className="font-medium text-primary">{data.cumulativePercentage}%</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2 pt-2 border-t border-border">
              Clique para visualizar ocorrências
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  if (motivoData.length === 0) {
    return (
      <Card className="border-l-4 border-l-orange-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-orange-500" />
            Long Tail - Motivos de Ocorrência
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <AlertTriangle className="w-12 h-12 mx-auto text-muted-foreground/30 mb-2" />
              <p className="text-sm">Nenhuma ocorrência para análise de motivos</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-l-4 border-l-orange-500">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingDown className="h-5 w-5 text-orange-500" />
          Long Tail - Motivos de Ocorrência
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">
                  Análise Long Tail dos motivos de ocorrência seguindo o princípio 80/20. As barras vermelhas representam os poucos motivos que causam a maioria dos problemas. A linha azul mostra o percentual acumulado, ajudando a identificar onde concentrar esforços de melhoria. Clique nas barras para filtrar por motivo específico.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Métricas resumo */}
        <div className="flex flex-wrap items-center gap-4 p-4 bg-muted/30 rounded-lg mb-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500"></div>
            <span className="text-sm text-muted-foreground">Top 3 Motivos:</span>
            <span className="font-semibold text-foreground">
              {motivoData.slice(0, 3).reduce((sum, item) => sum + item.percentage, 0)}%
            </span>
          </div>
          <div className="w-px h-4 bg-border"></div>
          
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-orange-500"></div>
            <span className="text-sm text-muted-foreground">Motivos Diversos:</span>
            <span className="font-semibold text-orange-600">{motivoData.length}</span>
          </div>
        </div>

        {/* Gráfico Composto com Eixo Duplo */}
        <div className="h-[500px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={motivoData}
              margin={{ top: 30, right: 50, left: 30, bottom: 120 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              
              {/* Eixo X com textos melhorados */}
              <XAxis 
                dataKey="motivo"
                tick={{ 
                  fontSize: 11, 
                  fill: 'hsl(var(--muted-foreground))',
                  fontWeight: 500
                }}
                angle={-45}
                textAnchor="end"
                height={120}
                interval={0}
                tickLine={{ stroke: 'hsl(var(--border))' }}
              />
              
              {/* Eixo Y Esquerdo - Contagem */}
              <YAxis 
                yAxisId="count"
                orientation="left"
                tick={{ 
                  fontSize: 12, 
                  fill: 'hsl(var(--muted-foreground))',
                  fontWeight: 500
                }}
                label={{ 
                  value: 'Nº de Ocorrências', 
                  angle: -90, 
                  position: 'insideLeft',
                  style: { textAnchor: 'middle', fill: 'hsl(var(--foreground))' }
                }}
                tickLine={{ stroke: 'hsl(var(--border))' }}
              />
              
              {/* Eixo Y Direito - Percentual Acumulado */}
              <YAxis 
                yAxisId="percentage"
                orientation="right"
                domain={[0, 100]}
                tick={{ 
                  fontSize: 12, 
                  fill: 'hsl(var(--primary))',
                  fontWeight: 500
                }}
                label={{ 
                  value: '% Acumulado', 
                  angle: 90, 
                  position: 'insideRight',
                  style: { textAnchor: 'middle', fill: 'hsl(var(--primary))' }
                }}
                tickLine={{ stroke: 'hsl(var(--primary))' }}
              />
              
              <RechartsTooltip content={<CustomTooltip />} />
              
              {/* Barras de Ocorrências */}
              <Bar 
                yAxisId="count"
                dataKey="count"
                radius={[6, 6, 0, 0]}
                className="cursor-pointer hover:opacity-80 transition-opacity"
                onClick={(data, index) => handleBarClick(motivoData[index])}
              >
                {motivoData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
                <LabelList 
                  dataKey="count" 
                  position="top" 
                  style={{ 
                    fill: 'hsl(var(--foreground))', 
                    fontSize: '11px', 
                    fontWeight: 'bold'
                  }} 
                />
              </Bar>
              
              {/* Linha de Percentual Acumulado */}
              <Line
                yAxisId="percentage"
                type="monotone"
                dataKey="cumulativePercentage"
                stroke="hsl(var(--primary))"
                strokeWidth={3}
                dot={{ 
                  fill: 'hsl(var(--primary))', 
                  strokeWidth: 2, 
                  r: 4,
                  stroke: 'hsl(var(--background))'
                }}
                activeDot={{ 
                  r: 6, 
                  fill: 'hsl(var(--primary))',
                  stroke: 'hsl(var(--background))',
                  strokeWidth: 2
                }}
              />
              
              {/* Linha de referência 80% */}
              <ReferenceLine 
                yAxisId="percentage" 
                y={80} 
                stroke="hsl(var(--destructive))" 
                strokeDasharray="5 5" 
                label={{ 
                  value: "80% Rule", 
                  position: "top",
                  style: { fill: 'hsl(var(--destructive))', fontSize: '12px' }
                }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Legenda */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs mt-4">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-500 rounded-sm"></div>
            <span>Top 3 (Críticos)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-orange-500 rounded-sm"></div>
            <span>Frequentes</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-blue-500 rounded-sm"></div>
            <span>Moderados</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
            <span>Esporádicos</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});