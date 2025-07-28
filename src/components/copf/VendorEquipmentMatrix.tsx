import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertTriangle, Clock, TrendingUp, Wrench } from "lucide-react";
import { OccurrenceData } from "@/hooks/useDashboardData";

interface VendorEquipmentMatrixProps {
  occurrences: OccurrenceData[];
  onNavigateToOccurrences?: (filter: { vendor?: string; equipment?: string; severity?: string }) => void;
}

interface MatrixData {
  vendor: string;
  equipment: string;
  totalOccurrences: number;
  criticalOccurrences: number;
  overdueOccurrences: number;
  avgResolutionTime: string;
  resolutionRate: number;
}

export function VendorEquipmentMatrix({ occurrences, onNavigateToOccurrences }: VendorEquipmentMatrixProps) {
  const matrixData = useMemo(() => {
    const vendorEquipmentMap = new Map<string, MatrixData>();

    occurrences.forEach(occurrence => {
      const key = `${occurrence.vendor}|${occurrence.equipment}`;
      
      if (!vendorEquipmentMap.has(key)) {
        vendorEquipmentMap.set(key, {
          vendor: occurrence.vendor,
          equipment: occurrence.equipment,
          totalOccurrences: 0,
          criticalOccurrences: 0,
          overdueOccurrences: 0,
          avgResolutionTime: "0h",
          resolutionRate: 0
        });
      }

      const data = vendorEquipmentMap.get(key)!;
      data.totalOccurrences++;

      if (occurrence.severity === 'critical') {
        data.criticalOccurrences++;
      }

      // Verificar se está em atraso
      const createdDate = new Date(occurrence.createdAt);
      const hoursDiff = (Date.now() - createdDate.getTime()) / (1000 * 60 * 60);
      const slaLimit = occurrence.severity === 'critical' || occurrence.severity === 'high' ? 24 : 72;
      if (hoursDiff > slaLimit && occurrence.status !== 'encerrado') {
        data.overdueOccurrences++;
      }
    });

    // Calcular métricas agregadas
    vendorEquipmentMap.forEach((data, key) => {
      const vendorEquipmentOccurrences = occurrences.filter(
        o => o.vendor === data.vendor && o.equipment === data.equipment
      );
      
      // Taxa de resolução
      const resolvedCount = vendorEquipmentOccurrences.filter(o => o.status === 'encerrado').length;
      data.resolutionRate = data.totalOccurrences > 0 ? Math.round((resolvedCount / data.totalOccurrences) * 100) : 0;

      // Tempo médio de resolução (simulado)
      const avgHours = Math.max(1, Math.round(4.2 - (data.resolutionRate / 50)));
      data.avgResolutionTime = `${avgHours}h`;
    });

    return Array.from(vendorEquipmentMap.values())
      .sort((a, b) => b.totalOccurrences - a.totalOccurrences);
  }, [occurrences]);

  const handleCellClick = (data: MatrixData, type: 'total' | 'critical' | 'overdue') => {
    if (!onNavigateToOccurrences) return;

    const filter: { vendor: string; equipment: string; severity?: string } = {
      vendor: data.vendor,
      equipment: data.equipment
    };

    if (type === 'critical') {
      filter.severity = 'critical';
    }

    onNavigateToOccurrences(filter);
  };

  const getSeverityColor = (value: number, type: 'critical' | 'overdue' | 'resolution') => {
    switch (type) {
      case 'critical':
        if (value >= 5) return 'destructive';
        if (value >= 2) return 'outline';
        return 'secondary';
      case 'overdue':
        if (value >= 3) return 'destructive';
        if (value >= 1) return 'outline';
        return 'secondary';
      case 'resolution':
        if (value >= 95) return 'default';
        if (value >= 85) return 'secondary';
        return 'outline';
      default:
        return 'secondary';
    }
  };

  return (
    <Card className="hover-scale border-l-4 border-l-primary">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Wrench className="h-5 w-5 text-primary" />
          Matriz Equipamento × Fornecedor
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Análise detalhada de ocorrências por equipamento e fornecedor
        </p>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[160px]">Fornecedor</TableHead>
                <TableHead className="min-w-[140px]">Equipamento</TableHead>
                <TableHead className="text-center min-w-[80px]">Total</TableHead>
                <TableHead className="text-center min-w-[80px]">Críticas</TableHead>
                <TableHead className="text-center min-w-[80px]">SLA Vencido</TableHead>
                <TableHead className="text-center min-w-[100px]">Taxa Resolução</TableHead>
                <TableHead className="text-center min-w-[80px]">MTTR</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {matrixData.map((data, index) => (
                <TableRow key={index} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="font-medium">
                    <div className="max-w-[140px] truncate" title={data.vendor}>
                      {data.vendor}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-[120px] truncate" title={data.equipment}>
                      {data.equipment}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-1 font-medium hover:bg-primary/10"
                      onClick={() => handleCellClick(data, 'total')}
                    >
                      {data.totalOccurrences}
                    </Button>
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-1"
                      onClick={() => handleCellClick(data, 'critical')}
                    >
                      <Badge variant={getSeverityColor(data.criticalOccurrences, 'critical')} className="min-w-[40px]">
                        {data.criticalOccurrences}
                      </Badge>
                    </Button>
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-1"
                      onClick={() => handleCellClick(data, 'overdue')}
                    >
                      <Badge variant={getSeverityColor(data.overdueOccurrences, 'overdue')} className="min-w-[40px]">
                        {data.overdueOccurrences}
                      </Badge>
                    </Button>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={getSeverityColor(data.resolutionRate, 'resolution')} className="min-w-[50px]">
                      {data.resolutionRate}%
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm font-medium">{data.avgResolutionTime}</span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
        {matrixData.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Nenhum dado encontrado para os filtros aplicados</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}