import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { useFilters } from '@/contexts/FiltersContext';
import { useToast } from '@/hooks/use-toast';

interface OccurrenceData {
  id: string;
  vendor: string;
  status: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  createdAt: string;
  dataPrevisaoEncerramento?: string;
  dataLimiteSla?: string;
  fornecedor?: string;
}

interface VendorSLAChartProps {
  occurrences: OccurrenceData[];
  filteredOccurrences?: OccurrenceData[];
}

interface ChartDataItem {
  vendor: string;
  total: number;
  semPrevisao: number;
  previsaoMaiorSla: number;
  slaVencido: number;
  percentualSemPrevisao: number;
  percentualPrevisaoMaiorSla: number;
  percentualSlaVencido: number;
}

const VendorSLAChart: React.FC<VendorSLAChartProps> = ({ occurrences, filteredOccurrences }) => {
  const navigate = useNavigate();
  const { updateFilter } = useFilters();
  const { toast } = useToast();

  // Processar dados dos fornecedores
  const chartData = React.useMemo(() => {
    const dataToUse = filteredOccurrences || occurrences || [];
    
    if (!dataToUse || dataToUse.length === 0) {
      return [];
    }

    // Agrupar ocorrências por fornecedor com métricas SLA
    const vendorData = new Map<string, {
      total: number;
      semPrevisao: number;
      previsaoMaiorSla: number;
      slaVencido: number;
    }>();
    
    const now = new Date();
    
    dataToUse.forEach((occ) => {
      const vendor = occ.fornecedor || occ.vendor || 'Sem Fornecedor';
      
      if (!vendorData.has(vendor)) {
        vendorData.set(vendor, {
          total: 0,
          semPrevisao: 0,
          previsaoMaiorSla: 0,
          slaVencido: 0
        });
      }
      
      const data = vendorData.get(vendor)!;
      data.total++;
      
      // Logic should be mutually exclusive - check in priority order
      
      // First check if SLA is expired (highest priority)
      if (occ.dataLimiteSla && (occ.status === 'pendente' || occ.status === 'em_andamento' || occ.status === 'com_impedimentos')) {
        const slaLimit = new Date(occ.dataLimiteSla);
        if (now > slaLimit) {
          data.slaVencido++;
          return; // Exit early - this occurrence is categorized
        }
      }
      
      // Then check if forecast is beyond SLA
      if (occ.dataPrevisaoEncerramento && occ.dataLimiteSla) {
        const previsao = new Date(occ.dataPrevisaoEncerramento);
        const slaLimit = new Date(occ.dataLimiteSla);
        if (previsao > slaLimit) {
          data.previsaoMaiorSla++;
          return; // Exit early - this occurrence is categorized
        }
      }
      
      // Finally, if no forecast date, count as sem previsao
      if (!occ.dataPrevisaoEncerramento) {
        data.semPrevisao++;
      }
    });

    // Converter para array com percentuais e ordenar
    const result: ChartDataItem[] = Array.from(vendorData.entries())
      .map(([vendor, data]) => ({
        vendor,
        total: data.total,
        semPrevisao: data.semPrevisao,
        previsaoMaiorSla: data.previsaoMaiorSla,
        slaVencido: data.slaVencido,
        percentualSemPrevisao: data.total > 0 ? (data.semPrevisao / data.total) * 100 : 0,
        percentualPrevisaoMaiorSla: data.total > 0 ? (data.previsaoMaiorSla / data.total) * 100 : 0,
        percentualSlaVencido: data.total > 0 ? (data.slaVencido / data.total) * 100 : 0,
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 8); // Top 8 fornecedores

    return result;
  }, [occurrences, filteredOccurrences]);

  const handleBarClick = (data: ChartDataItem, segment?: string) => {
    // Atualizar filtro por fornecedor
    updateFilter('vendorFilterMulti', [data.vendor]);
    
    // Aplicar filtros específicos baseados no segmento clicado
    if (segment === 'slaVencido') {
      updateFilter('previsaoSlaFilter', ['sla_vencido']);
    } else if (segment === 'previsaoMaiorSla') {
      updateFilter('previsaoSlaFilter', ['previsao_maior_sla']);
    } else if (segment === 'semPrevisao') {
      updateFilter('previsaoSlaFilter', ['sem_previsao']);
    } else {
      // Limpar filtro se não for um segmento específico
      updateFilter('previsaoSlaFilter', []);
    }
    
    // Navegar para página de ocorrências
    navigate('/ocorrencias');
    
    // Mostrar toast de confirmação
    const segmentLabels = {
      slaVencido: 'SLA Vencido',
      previsaoMaiorSla: 'Previsão > SLA',
      semPrevisao: 'Sem Previsão'
    };
    
    const segmentText = segment ? ` - ${segmentLabels[segment as keyof typeof segmentLabels]}` : '';
    
    toast({
      title: "Filtros aplicados",
      description: `Exibindo ocorrências do fornecedor: ${data.vendor}${segmentText}`,
    });
  };

  if (chartData.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Total de Ocorrências por Fornecedor (Visão SLA e Previsão de Atendimento)</CardTitle>
          <CardDescription>Distribuição de ocorrências entre fornecedores</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            <p>Nenhum dado de fornecedor disponível</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Total de Ocorrências por Fornecedor (Visão SLA e Previsão de Atendimento)</CardTitle>
        <CardDescription>Distribuição de ocorrências entre fornecedores</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 60,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="vendor" 
                angle={-45}
                textAnchor="end"
                height={80}
                interval={0}
              />
              <YAxis />
              <Tooltip 
                formatter={(value: number, name: string) => {
                  const labels = {
                    semPrevisao: 'Sem Previsão',
                    previsaoMaiorSla: 'Previsão > SLA',
                    slaVencido: 'SLA Vencido'
                  };
                  return [value, labels[name as keyof typeof labels] || name];
                }}
              />
              <Legend 
                formatter={(value: string) => {
                  const labels = {
                    semPrevisao: 'Sem Previsão',
                    previsaoMaiorSla: 'Previsão > SLA',
                    slaVencido: 'SLA Vencido'
                  };
                  return labels[value as keyof typeof labels] || value;
                }}
              />
              <Bar 
                dataKey="semPrevisao" 
                stackId="a" 
                fill="#94a3b8" 
                onClick={(data) => handleBarClick(data, 'semPrevisao')}
                style={{ cursor: 'pointer' }}
              />
              <Bar 
                dataKey="previsaoMaiorSla" 
                stackId="a" 
                fill="#f59e0b" 
                onClick={(data) => handleBarClick(data, 'previsaoMaiorSla')}
                style={{ cursor: 'pointer' }}
              />
              <Bar 
                dataKey="slaVencido" 
                stackId="a" 
                fill="#ef4444" 
                onClick={(data) => handleBarClick(data, 'slaVencido')}
                style={{ cursor: 'pointer' }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default VendorSLAChart;