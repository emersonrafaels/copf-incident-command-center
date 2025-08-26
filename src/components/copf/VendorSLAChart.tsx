import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

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

interface VendorSLAData {
  vendor: string;
  semPrevisao: number;
  previsaoMaiorSLA: number;
  slaVencido: number;
  total: number;
}

const VendorSLAChart: React.FC<VendorSLAChartProps> = ({ occurrences }) => {
  const chartData = useMemo(() => {
    if (!occurrences || occurrences.length === 0) {
      return [];
    }

    const vendorStats: Record<string, VendorSLAData> = {};

    occurrences.forEach(occurrence => {
      const vendor = occurrence.vendor || 'Não informado';
      
      if (!vendorStats[vendor]) {
        vendorStats[vendor] = {
          vendor: vendor,
          semPrevisao: 0,
          previsaoMaiorSLA: 0,
          slaVencido: 0,
          total: 0
        };
      }

      vendorStats[vendor].total++;

      // Só analisar SLA para ocorrências não encerradas
      if (occurrence.status !== 'encerrado' && !occurrence.resolvedAt) {
        const now = new Date();
        const dataPrevisao = occurrence.dataPrevisaoEncerramento ? new Date(occurrence.dataPrevisaoEncerramento) : null;
        const createdDate = new Date(occurrence.createdAt);
        
        // Definir SLA baseado na severidade
        const slaLimit = occurrence.severity === 'critical' || occurrence.severity === 'high' ? 24 : 72;
        const slaDeadline = new Date(createdDate.getTime() + (slaLimit * 60 * 60 * 1000));

        // Verificações de SLA
        if (!dataPrevisao) {
          vendorStats[vendor].semPrevisao++;
        } else if (dataPrevisao > slaDeadline) {
          vendorStats[vendor].previsaoMaiorSLA++;
        }

        if (now > slaDeadline) {
          vendorStats[vendor].slaVencido++;
        }
      }
    });

    // Converter para array e ordenar por total
    return Object.values(vendorStats)
      .filter(vendor => vendor.total > 0)
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);
  }, [occurrences]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-semibold text-foreground">{label}</p>
          <p className="text-sm text-muted-foreground">Total de ocorrências: {data.total}</p>
          <div className="space-y-1 mt-2">
            <p className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-primary"></span>
              <span className="text-sm">Sem previsão: {data.semPrevisao}</span>
            </p>
            <p className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-yellow-500"></span>
              <span className="text-sm">Previsão &gt; SLA: {data.previsaoMaiorSLA}</span>
            </p>
            <p className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-destructive"></span>
              <span className="text-sm">SLA vencido: {data.slaVencido}</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  if (!chartData.length) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Análise de SLA por Fornecedor</CardTitle>
          <CardDescription>
            Distribuição de ocorrências por fornecedor e status de SLA
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-64 text-muted-foreground space-y-2">
            <div>Nenhum dado disponível para exibir</div>
            <div className="text-xs">
              {occurrences?.length > 0 
                ? `${occurrences.length} ocorrências recebidas, mas nenhum fornecedor válido encontrado`
                : 'Nenhuma ocorrência recebida'
              }
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Análise de SLA por Fornecedor</CardTitle>
        <CardDescription>
          Distribuição de ocorrências por fornecedor: sem previsão, previsão &gt; SLA e SLA vencido
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="horizontal"
              data={chartData}
              margin={{
                top: 20,
                right: 30,
                left: 60,
                bottom: 20,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis type="number" className="text-xs" />
              <YAxis 
                dataKey="vendor"
                type="category"
                width={150}
                className="text-xs"
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar 
                dataKey="semPrevisao" 
                name="Sem previsão" 
                fill="hsl(var(--primary))"
                stackId="sla"
              />
              <Bar 
                dataKey="previsaoMaiorSLA" 
                name="Previsão &gt; SLA" 
                fill="hsl(var(--warning))"
                stackId="sla"
              />
              <Bar 
                dataKey="slaVencido" 
                name="SLA vencido" 
                fill="hsl(var(--destructive))"
                stackId="sla"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default VendorSLAChart;