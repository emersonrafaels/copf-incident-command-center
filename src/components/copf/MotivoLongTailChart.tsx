import React, { memo, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip as RechartsTooltip, Cell, LabelList } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, TrendingDown } from 'lucide-react';
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
  count: number;
  percentage: number;
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
        motivo: motivo.length > 30 ? motivo.substring(0, 30) + '...' : motivo,
        motivoCompleto: motivo,
        count,
        percentage: Math.round((count / sourceOccurrences.length) * 100)
      }))
      .sort((a, b) => b.count - a.count);

    // Aplicar cores baseadas na posição (Long Tail)
    const data: MotivoData[] = sortedMotivos.map((item, index) => {
      let color = '#10b981'; // Verde para os mais comuns
      
      if (index < 3) {
        color = '#ef4444'; // Vermelho para os top 3 (mais problemáticos)
      } else if (index < 8) {
        color = '#f59e0b'; // Amarelo para os próximos 5
      } else if (index < 15) {
        color = '#3b82f6'; // Azul para os próximos 7
      }
      // Demais ficam verde (menos comuns)

      return {
        motivo: item.motivo,
        motivoCompleto: item.motivoCompleto,
        count: item.count,
        percentage: item.percentage,
        color
      };
    });

    return data.slice(0, 20); // Mostrar apenas top 20 para melhor visualização
  }, [occurrences, filteredOccurrences]);

  // Handler para clique nas barras
  const handleBarClick = (data: MotivoData) => {
    clearAllFilters();
    setTimeout(() => {
      // Filtro por motivo não está implementado no contexto, então mostramos todas as ocorrências
      // com uma mensagem informativa sobre o motivo selecionado
      navigate('/ocorrencias');
      toast.success(`Motivo selecionado: ${data.motivoCompleto}`, {
        description: `Este motivo representa ${data.count} ocorrências (${data.percentage}% do total). Filtro específico por motivo será implementado em breve.`
      });
    }, 100);
  };

  // Custom Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background/95 backdrop-blur-sm border border-border/80 rounded-lg p-3 shadow-lg">
          <p className="font-medium text-foreground text-sm">{data.motivoCompleto}</p>
          <div className="space-y-1 mt-2">
            <p className="text-sm">
              <span className="inline-block w-3 h-3 rounded-sm mr-2" style={{ backgroundColor: data.color }}></span>
              Ocorrências: {data.count}
            </p>
            <p className="text-xs text-muted-foreground">
              Representa {data.percentage}% do total
            </p>
            <p className="text-xs text-muted-foreground">Clique para visualizar</p>
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
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Distribuição dos motivos mais frequentes de ocorrências técnicas
        </p>
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

        {/* Gráfico */}
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={motivoData}
              margin={{ top: 20, right: 30, left: 20, bottom: 100 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis 
                dataKey="motivo"
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                angle={-45}
                textAnchor="end"
                height={120}
                interval={0}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                label={{ value: 'Nº de Ocorrências', angle: -90, position: 'insideLeft' }}
              />
              <RechartsTooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="count"
                radius={[4, 4, 0, 0]}
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
                    fontSize: '10px', 
                    fontWeight: 'bold'
                  }} 
                />
              </Bar>
            </BarChart>
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