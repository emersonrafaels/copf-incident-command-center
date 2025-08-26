import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface OccurrenceData {
  id: string;
  vendor: string;
  dataPrevisaoEncerramento?: string | null;
  status: string;
  resolvedAt?: string | null;
  severity: 'critical' | 'high' | 'medium' | 'low';
  createdAt: string;
}

interface VendorSLAChartProps {
  occurrences: OccurrenceData[];
}

const VendorSLAChart: React.FC<VendorSLAChartProps> = ({ occurrences }) => {
  console.log('VendorSLAChart - Received:', occurrences?.length || 0, 'occurrences');
  
  // Processar dados de forma simples
  const processData = () => {
    if (!occurrences || occurrences.length === 0) return [];

    const vendorMap: Record<string, any> = {};

    occurrences.forEach(occ => {
      const vendor = occ.vendor || 'Não informado';
      
      if (!vendorMap[vendor]) {
        vendorMap[vendor] = {
          name: vendor,
          total: 0
        };
      }

      vendorMap[vendor].total++;
    });

    const result = Object.values(vendorMap)
      .filter((v: any) => v.total > 0)
      .sort((a: any, b: any) => b.total - a.total)
      .slice(0, 8);
    
    console.log('Processed data:', result);
    return result;
  };

  const chartData = processData();

  if (chartData.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Total de Ocorrências por Fornecedor</CardTitle>
          <CardDescription>Barras horizontais por fornecedor</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            <p>Nenhum dado disponível</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Total de Ocorrências por Fornecedor</CardTitle>
        <CardDescription>Barras horizontais por fornecedor</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="w-full h-96">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="horizontal"
              data={chartData}
              margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis 
                dataKey="name" 
                type="category" 
                width={90} 
                tick={{ fontSize: 12 }}
              />
              <Tooltip 
                formatter={(value: any) => [value, "Total de Ocorrências"]}
                labelFormatter={(label: string) => `Fornecedor: ${label}`}
              />
              <Bar dataKey="total" fill="hsl(var(--primary))" name="Total de Ocorrências" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default VendorSLAChart;