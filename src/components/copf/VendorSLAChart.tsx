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
  console.log('VendorSLAChart - Received occurrences:', occurrences?.length || 0);
  
  const chartData = useMemo(() => {
    if (!occurrences || occurrences.length === 0) {
      console.log('VendorSLAChart - No occurrences data available');
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

      // Contar TODAS as ocorrências para o total
      vendorStats[vendor].total++;

      // Analisar SLA apenas para ocorrências NÃO ENCERRADAS
      if (occurrence.status !== 'encerrado' && !occurrence.resolvedAt) {
        const now = new Date();
        const dataPrevisao = occurrence.dataPrevisaoEncerramento ? new Date(occurrence.dataPrevisaoEncerramento) : null;
        const createdDate = new Date(occurrence.createdAt);
        
        // Definir SLA baseado na severidade (24h para críticas/altas, 72h para médias/baixas)
        const slaLimit = occurrence.severity === 'critical' || occurrence.severity === 'high' ? 24 : 72;
        const slaDeadline = new Date(createdDate.getTime() + (slaLimit * 60 * 60 * 1000));

        // Categorizar SLA - cada ocorrência só pode estar em UMA categoria
        if (now > slaDeadline) {
          // Prioridade 1: SLA já vencido (independente de ter previsão ou não)
          vendorStats[vendor].slaVencido++;
        } else if (!dataPrevisao) {
          // Prioridade 2: Sem previsão (mas SLA ainda não venceu)
          vendorStats[vendor].semPrevisao++;
        } else if (dataPrevisao > slaDeadline) {
          // Prioridade 3: Com previsão, mas a previsão está além do SLA
          vendorStats[vendor].previsaoMaiorSLA++;
        }
        // Caso contrário: ocorrência está dentro do SLA com previsão válida (não contamos aqui)
      }
    });

    // Converter para array, filtrar e ordenar por total
    const result = Object.values(vendorStats)
      .filter(vendor => vendor.total > 0)
      .sort((a, b) => b.total - a.total)
      .slice(0, 8); // Limitar a 8 fornecedores principais
      
    console.log('VendorSLAChart - Final result:', result);
    console.log('VendorSLAChart - Total occurrences processed:', occurrences.length);
    
    return result;
  }, [occurrences]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const totalSLAIssues = data.semPrevisao + data.previsaoMaiorSLA + data.slaVencido;
      const okCount = data.total - totalSLAIssues;
      
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-semibold text-foreground">{label}</p>
          <p className="text-sm text-muted-foreground mb-2">
            Total: {data.total} ocorrências
          </p>
          <div className="space-y-1">
            {okCount > 0 && (
              <p className="flex items-center gap-2">
                <span className="w-3 h-3 rounded" style={{ backgroundColor: "hsl(var(--success))" }}></span>
                <span className="text-sm">Dentro do SLA: {okCount}</span>
              </p>
            )}
            {data.semPrevisao > 0 && (
              <p className="flex items-center gap-2">
                <span className="w-3 h-3 rounded" style={{ backgroundColor: "hsl(var(--warning))" }}></span>
                <span className="text-sm">Sem previsão: {data.semPrevisao}</span>
              </p>
            )}
            {data.previsaoMaiorSLA > 0 && (
              <p className="flex items-center gap-2">
                <span className="w-3 h-3 rounded" style={{ backgroundColor: "hsl(43 96% 45%)" }}></span>
                <span className="text-sm">Previsão &gt; SLA: {data.previsaoMaiorSLA}</span>
              </p>
            )}
            {data.slaVencido > 0 && (
              <p className="flex items-center gap-2">
                <span className="w-3 h-3 rounded" style={{ backgroundColor: "hsl(var(--destructive))" }}></span>
                <span className="text-sm">SLA vencido: {data.slaVencido}</span>
              </p>
            )}
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
        <div className="h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="horizontal"
              data={chartData}
              margin={{
                top: 20,
                right: 30,
                left: 10,
                bottom: 20,
              }}
            >
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="hsl(var(--muted-foreground))" 
                opacity={0.2}
              />
              <XAxis 
                type="number" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                domain={[0, 'dataMax + 2']}
              />
              <YAxis 
                dataKey="vendor"
                type="category"
                width={120}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: "hsl(var(--foreground))" }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="bottom"
                height={36}
                iconType="rect"
                wrapperStyle={{ 
                  paddingTop: '10px',
                  fontSize: '11px'
                }}
              />
              <Bar 
                dataKey="semPrevisao" 
                name="Sem previsão" 
                fill="hsl(var(--warning))"
                stackId="stack"
              />
              <Bar 
                dataKey="previsaoMaiorSLA" 
                name="Previsão > SLA" 
                fill="hsl(43 96% 45%)"
                stackId="stack"
              />
              <Bar 
                dataKey="slaVencido" 
                name="SLA vencido" 
                fill="hsl(var(--destructive))"
                stackId="stack"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default VendorSLAChart;