import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface OccurrenceData {
  id: string;
  vendor: string;
  status: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  createdAt: string;
  data_previsao_encerramento?: string | null;
  data_limite_sla?: string | null;
  fornecedor?: string;
}

interface VendorSLAChartProps {
  occurrences: OccurrenceData[];
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

const VendorSLAChart: React.FC<VendorSLAChartProps> = ({ occurrences }) => {
  // Processar dados dos fornecedores
  const chartData = React.useMemo(() => {
    if (!occurrences || occurrences.length === 0) {
      console.log('VendorSLAChart: No occurrences data');
      return [];
    }

    console.log(`VendorSLAChart: Processing ${occurrences.length} occurrences`);

    // Agrupar ocorrências por fornecedor com métricas SLA
    const vendorData = new Map<string, {
      total: number;
      semPrevisao: number;
      previsaoMaiorSla: number;
      slaVencido: number;
    }>();
    
    const now = new Date();
    
    occurrences.forEach(occ => {
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
      
      // Sem previsão
      if (!occ.data_previsao_encerramento) {
        data.semPrevisao++;
      }
      
      // Previsão > SLA
      if (occ.data_previsao_encerramento && occ.data_limite_sla) {
        const previsao = new Date(occ.data_previsao_encerramento);
        const slaLimit = new Date(occ.data_limite_sla);
        if (previsao > slaLimit) {
          data.previsaoMaiorSla++;
        }
      }
      
      // SLA Vencido
      if (occ.data_limite_sla && occ.status !== 'resolvido' && occ.status !== 'fechado') {
        const slaLimit = new Date(occ.data_limite_sla);
        if (now > slaLimit) {
          data.slaVencido++;
        }
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

    console.log('VendorSLAChart: Chart data processed:', result);
    return result;
  }, [occurrences]);

  if (chartData.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Total de Ocorrências por Fornecedor</CardTitle>
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
        <CardTitle>Total de Ocorrências por Fornecedor</CardTitle>
        <CardDescription>Distribuição de ocorrências entre fornecedores</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fornecedor</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Sem Previsão</TableHead>
                <TableHead className="text-right">% Sem Previsão</TableHead>
                <TableHead className="text-right">Previsão &gt; SLA</TableHead>
                <TableHead className="text-right">% Previsão &gt; SLA</TableHead>
                <TableHead className="text-right">SLA Vencido</TableHead>
                <TableHead className="text-right">% SLA Vencido</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {chartData.map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{item.vendor}</TableCell>
                  <TableCell className="text-right">{item.total}</TableCell>
                  <TableCell className="text-right">{item.semPrevisao}</TableCell>
                  <TableCell className="text-right">{item.percentualSemPrevisao.toFixed(1)}%</TableCell>
                  <TableCell className="text-right">{item.previsaoMaiorSla}</TableCell>
                  <TableCell className="text-right">{item.percentualPrevisaoMaiorSla.toFixed(1)}%</TableCell>
                  <TableCell className="text-right">{item.slaVencido}</TableCell>
                  <TableCell className="text-right">{item.percentualSlaVencido.toFixed(1)}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default VendorSLAChart;