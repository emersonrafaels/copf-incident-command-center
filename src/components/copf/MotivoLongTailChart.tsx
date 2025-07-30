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

const MotivoLongTailChart = memo(function MotivoLongTailChart({
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
    // Aplicar filtros específicos do gráfico (sem limpar filtros existentes)
    updateFilter('motivoFilter', [data.motivoCompleto]);
    
    // Navegar para a página de ocorrências
    navigate('/ocorrencias');
    
    // Mostrar toast de confirmação
    toast.success(`Filtro aplicado: ${data.motivoCompleto}`, {
      description: `${data.count} ocorrências encontradas (${data.percentage}% do total)`
    });
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
      <CardContent className="space-y-6">
        {/* Métricas resumo aprimoradas */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/30 dark:to-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-red-500 shadow-sm"></div>
              <div>
                <p className="text-xs text-red-700 dark:text-red-300 font-medium">Top 3 Motivos</p>
                <p className="text-lg font-bold text-red-800 dark:text-red-200">
                  {motivoData.slice(0, 3).reduce((sum, item) => sum + item.percentage, 0)}%
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/30 dark:to-orange-900/20 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-orange-500 shadow-sm"></div>
              <div>
                <p className="text-xs text-orange-700 dark:text-orange-300 font-medium">Total de Motivos</p>
                <p className="text-lg font-bold text-orange-800 dark:text-orange-200">{motivoData.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-blue-500 shadow-sm"></div>
              <div>
                <p className="text-xs text-blue-700 dark:text-blue-300 font-medium">Total Ocorrências</p>
                <p className="text-lg font-bold text-blue-800 dark:text-blue-200">
                  {motivoData.reduce((sum, item) => sum + item.count, 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Gráfico Composto com melhor layout */}
        <div className="bg-gradient-to-br from-background to-muted/20 p-4 rounded-lg border">
          <div className="h-[600px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={motivoData}
                margin={{ top: 40, right: 80, left: 60, bottom: 140 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
                
                {/* Eixo X com melhor formatação */}
                <XAxis 
                  dataKey="motivo"
                  tick={{ 
                    fontSize: 10, 
                    fill: 'hsl(var(--muted-foreground))',
                    fontWeight: 600
                  }}
                  angle={-35}
                  textAnchor="end"
                  height={140}
                  interval={0}
                  tickLine={{ stroke: 'hsl(var(--border))', strokeWidth: 1 }}
                  axisLine={{ stroke: 'hsl(var(--border))', strokeWidth: 1 }}
                />
                
                {/* Eixo Y Esquerdo - Contagem */}
                <YAxis 
                  yAxisId="count"
                  orientation="left"
                  tick={{ 
                    fontSize: 11, 
                    fill: 'hsl(var(--muted-foreground))',
                    fontWeight: 600
                  }}
                  label={{ 
                    value: 'Nº de Ocorrências', 
                    angle: -90, 
                    position: 'insideLeft',
                    style: { textAnchor: 'middle', fill: 'hsl(var(--foreground))', fontSize: '12px', fontWeight: 600 }
                  }}
                  tickLine={{ stroke: 'hsl(var(--border))', strokeWidth: 1 }}
                  axisLine={{ stroke: 'hsl(var(--border))', strokeWidth: 1 }}
                />
                
                {/* Eixo Y Direito - Percentual Acumulado */}
                <YAxis 
                  yAxisId="percentage"
                  orientation="right"
                  domain={[0, 100]}
                  tick={{ 
                    fontSize: 11, 
                    fill: 'hsl(var(--primary))',
                    fontWeight: 600
                  }}
                  label={{ 
                    value: '% Acumulado', 
                    angle: 90, 
                    position: 'insideRight',
                    style: { textAnchor: 'middle', fill: 'hsl(var(--primary))', fontSize: '12px', fontWeight: 600 }
                  }}
                  tickLine={{ stroke: 'hsl(var(--primary))', strokeWidth: 1 }}
                  axisLine={{ stroke: 'hsl(var(--primary))', strokeWidth: 1 }}
                />
                
                <RechartsTooltip content={<CustomTooltip />} />
                
                {/* Barras de Ocorrências com melhor estilo */}
                <Bar 
                  yAxisId="count"
                  dataKey="count"
                  radius={[8, 8, 0, 0]}
                  className="cursor-pointer hover:opacity-75 transition-all duration-200"
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
                      fontSize: '10px', 
                      fontWeight: 'bold'
                    }} 
                  />
                </Bar>
                
                {/* Linha de Percentual Acumulado aprimorada */}
                <Line
                  yAxisId="percentage"
                  type="monotone"
                  dataKey="cumulativePercentage"
                  stroke="hsl(var(--primary))"
                  strokeWidth={4}
                  dot={{ 
                    fill: 'hsl(var(--primary))', 
                    strokeWidth: 3, 
                    r: 5,
                    stroke: 'hsl(var(--background))'
                  }}
                  activeDot={{ 
                    r: 8, 
                    fill: 'hsl(var(--primary))',
                    stroke: 'hsl(var(--background))',
                    strokeWidth: 3,
                    className: "drop-shadow-lg"
                  }}
                />
                
                {/* Linha de referência 80% melhorada */}
                <ReferenceLine 
                  yAxisId="percentage" 
                  y={80} 
                  stroke="hsl(var(--destructive))" 
                  strokeDasharray="8 4" 
                  strokeWidth={2}
                  label={{ 
                    value: "Linha 80%", 
                    position: "top",
                    style: { 
                      fill: 'hsl(var(--destructive))', 
                      fontSize: '11px',
                      fontWeight: 'bold'
                    }
                  }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Legenda aprimorada */}
        <div className="bg-muted/30 p-4 rounded-lg">
          <h4 className="text-sm font-semibold mb-3 text-foreground">Categorias de Motivos</h4>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="flex items-center gap-2 p-2 bg-background rounded border">
              <div className="w-4 h-4 bg-red-500 rounded border shadow-sm"></div>
              <div>
                <span className="text-xs font-medium">Top 3 Críticos</span>
                <p className="text-xs text-muted-foreground">Maior impacto</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-2 bg-background rounded border">
              <div className="w-4 h-4 bg-orange-500 rounded border shadow-sm"></div>
              <div>
                <span className="text-xs font-medium">Frequentes</span>
                <p className="text-xs text-muted-foreground">Alta ocorrência</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-2 bg-background rounded border">
              <div className="w-4 h-4 bg-blue-500 rounded border shadow-sm"></div>
              <div>
                <span className="text-xs font-medium">Moderados</span>
                <p className="text-xs text-muted-foreground">Média ocorrência</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-2 bg-background rounded border">
              <div className="w-4 h-4 bg-green-500 rounded border shadow-sm"></div>
              <div>
                <span className="text-xs font-medium">Esporádicos</span>
                <p className="text-xs text-muted-foreground">Baixa ocorrência</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

export default MotivoLongTailChart;