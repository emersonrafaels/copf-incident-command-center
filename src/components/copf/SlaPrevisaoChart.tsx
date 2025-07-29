import React, { memo, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Clock, CheckCircle2 } from 'lucide-react';
import { useFilters } from '@/contexts/FiltersContext';
import { toast } from 'sonner';
import { OccurrenceData } from '@/hooks/useDashboardData';

interface SlaPrevisaoChartProps {
  occurrences: OccurrenceData[];
  filteredOccurrences?: OccurrenceData[];
}

interface SlaPrevisaoData {
  category: string;
  count: number;
  percentage: number;
  color: string;
  description: string;
}

export const SlaPrevisaoChart = memo(function SlaPrevisaoChart({
  occurrences,
  filteredOccurrences
}: SlaPrevisaoChartProps) {
  const navigate = useNavigate();
  const { updateFilter, clearAllFilters } = useFilters();

  // Processar dados de SLA vs Previsão
  const slaPrevisaoData = useMemo(() => {
    const sourceOccurrences = filteredOccurrences || occurrences;
    
    // Filtrar apenas ocorrências não encerradas e não canceladas
    const activeOccurrences = sourceOccurrences.filter(occurrence => 
      occurrence.status !== 'encerrado' && occurrence.status !== 'cancelado'
    );
    
    if (activeOccurrences.length === 0) {
      return [];
    }

    let previsaoMaiorSla = 0;
    let comPrevisao = 0;
    let semPrevisao = 0;

    activeOccurrences.forEach(occurrence => {
      const now = new Date();
      const createdDate = new Date(occurrence.createdAt);
      const hoursSinceCreated = (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60);
      
      // Calcular SLA limite baseado na severidade
      const slaLimitHours = occurrence.severity === 'critical' || occurrence.severity === 'high' ? 24 : 72;
      const slaDeadline = new Date(createdDate.getTime() + (slaLimitHours * 60 * 60 * 1000));

      if (occurrence.dataPrevisaoEncerramento) {
        const previsaoDate = new Date(occurrence.dataPrevisaoEncerramento);
        
        // Verificar se previsão é maior que SLA
        if (previsaoDate > slaDeadline) {
          previsaoMaiorSla++;
        } else {
          comPrevisao++;
        }
      } else {
        semPrevisao++;
      }
    });

    const total = activeOccurrences.length;
    
    const data: SlaPrevisaoData[] = [
      {
        category: 'Previsão > SLA',
        count: previsaoMaiorSla,
        percentage: Math.round((previsaoMaiorSla / total) * 100),
        color: '#ef4444',
        description: 'Ocorrências com previsão além do prazo SLA'
      },
      {
        category: 'Com Previsão',
        count: comPrevisao,
        percentage: Math.round((comPrevisao / total) * 100),
        color: '#f59e0b',
        description: 'Ocorrências com previsão dentro do SLA'
      },
      {
        category: 'Sem Previsão',
        count: semPrevisao,
        percentage: Math.round((semPrevisao / total) * 100),
        color: '#6b7280',
        description: 'Ocorrências sem previsão de encerramento'
      }
    ].filter(item => item.count > 0); // Remover categorias vazias

    return data;
  }, [occurrences, filteredOccurrences]);

  // Handler para clique nos segmentos
  const handleSegmentClick = (data: SlaPrevisaoData) => {
    clearAllFilters();
    setTimeout(() => {
      // Aplicar filtros para ocorrências não encerradas
      updateFilter('statusFilterMulti', ['a_iniciar', 'em_andamento', 'com_impedimentos']);
      
      navigate('/ocorrencias');
      toast.success(`Filtrando: ${data.category}`, {
        description: `${data.count} ocorrências (${data.percentage}% do total)`
      });
    }, 100);
  };

  // Custom Tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background/95 backdrop-blur-sm border border-border/80 rounded-lg p-3 shadow-lg">
          <p className="font-medium text-foreground text-sm">{data.category}</p>
          <div className="space-y-1 mt-2">
            <p className="text-sm">
              <span className="inline-block w-3 h-3 rounded-sm mr-2" style={{ backgroundColor: data.color }}></span>
              {data.count} ocorrências ({data.percentage}%)
            </p>
            <p className="text-xs text-muted-foreground">{data.description}</p>
            <p className="text-xs text-muted-foreground">Clique para filtrar</p>
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom Label
  const renderLabel = (entry: any) => {
    return `${entry.percentage}%`;
  };

  if (slaPrevisaoData.length === 0) {
    return (
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-500" />
            Status de Previsão vs SLA
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <CheckCircle2 className="w-12 h-12 mx-auto text-muted-foreground/30 mb-2" />
              <p className="text-sm">Nenhuma ocorrência ativa para análise</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-blue-500" />
          Status de Previsão vs SLA
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Análise de previsões de encerramento em relação aos prazos SLA (apenas ocorrências ativas)
        </p>
      </CardHeader>
      <CardContent>
        {/* Métricas resumo */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {slaPrevisaoData.map((item) => (
            <div 
              key={item.category}
              className="p-4 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => handleSegmentClick(item)}
            >
              <div className="flex items-center gap-2 mb-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm font-medium">{item.category}</span>
              </div>
              <div className="text-2xl font-bold">{item.count}</div>
              <div className="text-sm text-muted-foreground">{item.percentage}% do total</div>
            </div>
          ))}
        </div>

        {/* Gráfico de Pizza */}
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={slaPrevisaoData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderLabel}
                outerRadius={100}
                fill="#8884d8"
                dataKey="count"
                onClick={handleSegmentClick}
                className="cursor-pointer"
              >
                {slaPrevisaoData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <RechartsTooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                formatter={(value, entry: any) => (
                  <span style={{ color: entry.color }}>{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Indicadores de status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs mt-4">
          <div className="flex items-center gap-2 p-2 rounded bg-red-50 dark:bg-red-950/20">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <div>
              <div className="font-medium text-red-700 dark:text-red-300">Atenção</div>
              <div className="text-red-600 dark:text-red-400">Previsões além do SLA</div>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 rounded bg-orange-50 dark:bg-orange-950/20">
            <Clock className="h-4 w-4 text-orange-500" />
            <div>
              <div className="font-medium text-orange-700 dark:text-orange-300">Monitorar</div>
              <div className="text-orange-600 dark:text-orange-400">Com previsão no prazo</div>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 rounded bg-gray-50 dark:bg-gray-950/20">
            <CheckCircle2 className="h-4 w-4 text-gray-500" />
            <div>
              <div className="font-medium text-gray-700 dark:text-gray-300">Aguardar</div>
              <div className="text-gray-600 dark:text-gray-400">Sem previsão informada</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});