import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface OccurrenceData {
  id: string;
  vendor: string;
  status: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  createdAt: string;
}

interface VendorSLAChartProps {
  occurrences: OccurrenceData[];
}

interface ChartDataItem {
  vendor: string;
  total: number;
}

const VendorSLAChart: React.FC<VendorSLAChartProps> = ({ occurrences }) => {
  // Processar dados dos fornecedores
  const chartData = React.useMemo(() => {
    if (!occurrences || occurrences.length === 0) {
      console.log('VendorSLAChart: No occurrences data');
      return [];
    }

    console.log(`VendorSLAChart: Processing ${occurrences.length} occurrences`);

    // Contar ocorrências por fornecedor
    const vendorCounts = new Map<string, number>();
    
    occurrences.forEach(occ => {
      const vendor = occ.vendor || 'Sem Fornecedor';
      const currentCount = vendorCounts.get(vendor) || 0;
      vendorCounts.set(vendor, currentCount + 1);
    });

    // Converter para array e ordenar
    const result: ChartDataItem[] = Array.from(vendorCounts.entries())
      .map(([vendor, total]) => ({ vendor, total }))
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
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fornecedor</TableHead>
              <TableHead className="text-right">Total de Ocorrências</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {chartData.map((item, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{item.vendor}</TableCell>
                <TableCell className="text-right">{item.total}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default VendorSLAChart;