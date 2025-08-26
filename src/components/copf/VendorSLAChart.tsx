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
          semPrevisao: 0,
          previsaoMaiorSLA: 0,
          slaVencido: 0,
          total: 0
        };
      }

      vendorMap[vendor].total++;

      // Apenas para ocorrências não encerradas
      if (occ.status !== 'encerrado' && !occ.resolvedAt) {
        const now = new Date();
        const created = new Date(occ.createdAt);
        const slaHours = (occ.severity === 'critical' || occ.severity === 'high') ? 24 : 72;
        const slaDeadline = new Date(created.getTime() + (slaHours * 60 * 60 * 1000));
        
        if (now > slaDeadline) {
          vendorMap[vendor].slaVencido++;
        } else if (!occ.dataPrevisaoEncerramento) {
          vendorMap[vendor].semPrevisao++;
        } else {
          const previsao = new Date(occ.dataPrevisaoEncerramento);
          if (previsao > slaDeadline) {
            vendorMap[vendor].previsaoMaiorSLA++;
          }
        }
      }
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
          <CardTitle>Análise de SLA por Fornecedor</CardTitle>
          <CardDescription>Barras horizontais empilhadas por status de SLA</CardDescription>
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
        <CardTitle>Análise de SLA por Fornecedor</CardTitle>
        <CardDescription>Barras horizontais empilhadas por status de SLA</CardDescription>
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
                formatter={(value: any, name: string) => [value, name]}
                labelFormatter={(label: string) => `Fornecedor: ${label}`}
              />
              <Bar dataKey="slaVencido" stackId="a" fill="#ef4444" name="SLA Vencido" />
              <Bar dataKey="previsaoMaiorSLA" stackId="a" fill="#f59e0b" name="Previsão > SLA" />  
              <Bar dataKey="semPrevisao" stackId="a" fill="#eab308" name="Sem Previsão" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default VendorSLAChart;