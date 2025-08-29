import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from 'lucide-react';
import { OccurrenceData } from '@/hooks/useDashboardData';
import { useFilters } from '@/contexts/FiltersContext';
import { useToast } from '@/hooks/use-toast';

interface EquipmentStatusChartProps {
  occurrences: OccurrenceData[];
}

export function EquipmentStatusChart({ occurrences }: EquipmentStatusChartProps) {
  const navigate = useNavigate();
  const { clearAllFilters, updateFilter } = useFilters();
  const { toast } = useToast();
  const chartData = useMemo(() => {
    // Agrupar por segmento e equipamento
    const grouped = occurrences.reduce((acc, occurrence) => {
      const key = `${occurrence.segment}-${occurrence.equipment}`;
      if (!acc[key]) {
        acc[key] = {
          segmento: occurrence.segment,
          equipamento: occurrence.equipment,
          operante: 0,
          inoperante: 0
        };
      }
      
      if (occurrence.statusEquipamento === 'operante') {
        acc[key].operante++;
      } else {
        acc[key].inoperante++;
      }
      
      return acc;
    }, {} as Record<string, any>);

    // Converter para array e ordenar por volume total (decrescente)
    return Object.values(grouped)
      .map((item: any) => ({
        ...item,
        name: `${item.segmento} - ${item.equipamento}`,
        total: item.operante + item.inoperante
      }))
      .sort((a: any, b: any) => b.total - a.total) // Ordenar do maior para o menor volume total
      .slice(0, 10); // Mostrar apenas os 10 principais
  }, [occurrences]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background/95 backdrop-blur-sm border border-border/80 rounded-lg p-3 shadow-lg">
          <p className="font-medium text-foreground">{label}</p>
          <div className="space-y-1 mt-2">
            <p className="text-sm">
              <span className="inline-block w-3 h-3 bg-emerald-500 rounded-sm mr-2"></span>
              Operante: {data.operante}
            </p>
            <p className="text-sm">
              <span className="inline-block w-3 h-3 bg-destructive rounded-sm mr-2"></span>
              Inoperante: {data.inoperante}
            </p>
            <p className="text-sm font-medium border-t border-border/50 pt-1 mt-2">
              Total: {data.total}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  const handleBarClick = (data: any, stackId: string) => {
    const [segment, equipment] = data.name.split(' - ');
    
    // Aplicar filtros específicos do gráfico e navegar após aplicação
    setTimeout(() => {
      updateFilter('segmentFilterMulti', [segment]);
      updateFilter('equipmentFilterMulti', [equipment]);
      
      // Se clicar na parte operante ou inoperante, filtrar por status também
      let equipStatusParam = '';
      if (stackId === 'operante') {
        updateFilter('statusEquipamentoFilterMulti', ['operante']);
        equipStatusParam = 'operante';
      } else if (stackId === 'inoperante') {
        updateFilter('statusEquipamentoFilterMulti', ['inoperante']);
        equipStatusParam = 'inoperante';
      }
      
      // Navegar para ocorrências com parâmetros para garantir aplicação
      const params = new URLSearchParams({ segment, equipment });
      if (equipStatusParam) params.set('equip_status', equipStatusParam);
      navigate(`/ocorrencias?${params.toString()}`);
      
      // Mostrar toast de confirmação
      toast({
        title: "Filtros aplicados",
        description: `Visualizando ocorrências de ${equipment} do segmento ${segment}${equipStatusParam ? ` - ${equipStatusParam}` : ''}`,
      });
    }, 100);
  };

  return (
    <Card className="animate-fade-in border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="w-2 h-6 bg-gradient-to-b from-emerald-500 to-destructive rounded-sm"></div>
          Status dos Equipamentos por Segmento
          <TooltipProvider>
            <UITooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Clique nas barras para filtrar ocorrências por segmento e equipamento</p>
              </TooltipContent>
            </UITooltip>
          </TooltipProvider>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis 
                dataKey="name"
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                angle={-45}
                textAnchor="end"
                height={100}
                interval={0}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="operante" 
                stackId="a" 
                fill="hsl(142 76% 36%)"
                radius={[0, 0, 0, 0]}
                name="Operante"
                className="cursor-pointer hover:opacity-80 transition-opacity"
                onClick={(data) => handleBarClick(data, 'operante')}
              />
              <Bar 
                dataKey="inoperante" 
                stackId="a" 
                fill="hsl(var(--destructive))"
                radius={[4, 4, 0, 0]}
                name="Inoperante"
                className="cursor-pointer hover:opacity-80 transition-opacity"
                onClick={(data) => handleBarClick(data, 'inoperante')}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-border/50">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-emerald-500 rounded-sm"></div>
            <span className="text-sm text-muted-foreground">Equipamento Operante</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-destructive rounded-sm"></div>
            <span className="text-sm text-muted-foreground">Equipamento Inoperante</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}