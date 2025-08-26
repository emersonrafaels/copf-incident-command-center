import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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
        <div className="w-full" style={{ height: '400px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="horizontal"
              data={chartData}
              margin={{
                top: 20,
                right: 30,
                left: 80,
                bottom: 20,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis 
                type="number"
                tick={{ fontSize: 12 }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
              />
              <YAxis 
                type="category"
                dataKey="vendor"
                width={70}
                tick={{ fontSize: 11 }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
              />
              <Tooltip 
                formatter={(value: number) => [`${value}`, "Ocorrências"]}
                labelFormatter={(label: string) => `Fornecedor: ${label}`}
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px'
                }}
              />
              <Bar 
                dataKey="total" 
                fill="hsl(var(--primary))"
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default VendorSLAChart;