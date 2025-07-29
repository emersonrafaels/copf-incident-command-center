import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  AlertTriangle, 
  Clock, 
  TrendingUp, 
  Building2, 
  BarChart3,
  Activity,
  Timer,
  CheckCircle2
} from "lucide-react";
import { OccurrenceData } from "@/hooks/useDashboardData";

interface VendorMetricsMatrixProps {
  occurrences: OccurrenceData[];
  onNavigateToOccurrences?: (filter: { vendor?: string; severity?: string; slaStatus?: string }) => void;
}

interface VendorMetrics {
  vendor: string;
  totalOccurrences: number;
  criticalOccurrences: number;
  prioritizedOccurrences: number; // critical + high
  dueTodayOccurrences: number;
  resolvedOccurrences: number;
  resolutionRate: number;
  avgResolutionTime: string;
  slaCompliance: number;
}

interface HeatmapCell {
  vendor: string;
  equipment: string;
  value: number;
  type: 'total' | 'critical' | 'prioritized' | 'dueToday';
}

export function VendorMetricsMatrix({ occurrences, onNavigateToOccurrences }: VendorMetricsMatrixProps) {
  const vendorMetrics = useMemo(() => {
    const vendorMap = new Map<string, VendorMetrics>();

    occurrences.forEach(occurrence => {
      if (!vendorMap.has(occurrence.vendor)) {
        vendorMap.set(occurrence.vendor, {
          vendor: occurrence.vendor,
          totalOccurrences: 0,
          criticalOccurrences: 0,
          prioritizedOccurrences: 0,
          dueTodayOccurrences: 0,
          resolvedOccurrences: 0,
          resolutionRate: 0,
          avgResolutionTime: "0h",
          slaCompliance: 0
        });
      }

      const metrics = vendorMap.get(occurrence.vendor)!;
      metrics.totalOccurrences++;

      // Ocorrências críticas
      if (occurrence.severity === 'critical') {
        metrics.criticalOccurrences++;
      }

      // Ocorrências priorizadas (critical + high)
      if (occurrence.severity === 'critical' || occurrence.severity === 'high') {
        metrics.prioritizedOccurrences++;
      }

      // Ocorrências que vencem hoje (baseado em SLA)
      const createdDate = new Date(occurrence.createdAt);
      const hoursDiff = (Date.now() - createdDate.getTime()) / (1000 * 60 * 60);
      const slaLimit = occurrence.severity === 'critical' || occurrence.severity === 'high' ? 24 : 72;
      const hoursRemaining = slaLimit - hoursDiff;
      
      if (hoursRemaining <= 24 && hoursRemaining > 0 && occurrence.status !== 'encerrado') {
        metrics.dueTodayOccurrences++;
      }

      // Ocorrências resolvidas
      if (occurrence.status === 'encerrado') {
        metrics.resolvedOccurrences++;
      }
    });

    // Calcular métricas finais
    vendorMap.forEach((metrics) => {
      metrics.resolutionRate = metrics.totalOccurrences > 0 
        ? Math.round((metrics.resolvedOccurrences / metrics.totalOccurrences) * 100) 
        : 0;
      
      // SLA Compliance (simulado - baseado na taxa de resolução e ocorrências em atraso)
      const overdueCount = occurrences.filter(o => {
        if (o.vendor !== metrics.vendor || o.status === 'encerrado') return false;
        const createdDate = new Date(o.createdAt);
        const hoursDiff = (Date.now() - createdDate.getTime()) / (1000 * 60 * 60);
        const slaLimit = o.severity === 'critical' || o.severity === 'high' ? 24 : 72;
        return hoursDiff > slaLimit;
      }).length;
      
      metrics.slaCompliance = metrics.totalOccurrences > 0 
        ? Math.round(((metrics.totalOccurrences - overdueCount) / metrics.totalOccurrences) * 100)
        : 100;

      // Tempo médio de resolução (simulado)
      const avgHours = Math.max(1, Math.round(6 - (metrics.resolutionRate / 25)));
      metrics.avgResolutionTime = `${avgHours}h`;
    });

    return Array.from(vendorMap.values())
      .sort((a, b) => b.totalOccurrences - a.totalOccurrences);
  }, [occurrences]);

  const heatmapData = useMemo(() => {
    // Mapeamento de equipamentos por segmento
    const equipmentsBySegment = {
      AA: ['ATM Saque', 'ATM Depósito', 'Cassete'],
      AB: ['Notebook', 'Desktop', 'Leitor de Cheques/documentos', 'Leitor biométrico', 'PIN PAD', 'Scanner de Cheque', 'Impressora', 'Impressora térmica', 'Impressora multifuncional', 'Monitor LCD/LED', 'Teclado', 'Servidor', 'Televisão', 'Senheiro', 'TCR', 'Classificadora', 'Fragmentadora de Papel']
    };

    // Calcular volume total por equipamento e adicionar prefixo do segmento
    const equipmentVolumes = new Map<string, number>();
    occurrences.forEach(o => {
      const currentCount = equipmentVolumes.get(o.equipment) || 0;
      equipmentVolumes.set(o.equipment, currentCount + 1);
    });

    // Criar lista de equipamentos com prefixos e ordenar por volume
    const equipmentsWithPrefix = Array.from(equipmentVolumes.entries())
      .map(([equipment, count]) => {
        // Determinar segmento
        let segment = '';
        if (equipmentsBySegment.AA.includes(equipment)) {
          segment = 'AA';
        } else if (equipmentsBySegment.AB.includes(equipment)) {
          segment = 'AB';
        }
        
        return {
          originalName: equipment,
          displayName: segment ? `${segment} - ${equipment}` : equipment,
          volume: count
        };
      })
      .sort((a, b) => b.volume - a.volume); // Ordenar por volume decrescente

    const equipments = equipmentsWithPrefix.map(e => e.originalName);
    const equipmentsDisplay = equipmentsWithPrefix.map(e => e.displayName);
    const vendors = vendorMetrics.slice(0, 8).map(v => v.vendor); // Top 8 fornecedores

    const heatmap: HeatmapCell[] = [];

    vendors.forEach(vendor => {
      equipments.forEach(equipment => {
        const relevantOccurrences = occurrences.filter(o => o.vendor === vendor && o.equipment === equipment);
        
        heatmap.push({
          vendor,
          equipment,
          value: relevantOccurrences.length,
          type: 'total'
        });
      });
    });

    return { heatmap, vendors, equipments, equipmentsDisplay };
  }, [occurrences, vendorMetrics]);

  const handleCardClick = (vendor: string, type: 'critical' | 'prioritized' | 'dueToday') => {
    if (!onNavigateToOccurrences) return;

    const filter: { vendor: string; severity?: string; slaStatus?: string } = { vendor };

    switch (type) {
      case 'critical':
        filter.severity = 'critical';
        break;
      case 'prioritized':
        filter.severity = 'high,critical';
        break;
      case 'dueToday':
        filter.slaStatus = 'critico';
        break;
    }

    onNavigateToOccurrences(filter);
  };

  const getHeatmapColor = (value: number, maxValue: number) => {
    if (maxValue === 0) return 'hsl(var(--muted))';
    const intensity = value / maxValue;
    
    if (intensity === 0) return 'hsl(var(--muted))';
    if (intensity <= 0.2) return 'hsl(var(--primary) / 0.1)';
    if (intensity <= 0.4) return 'hsl(var(--primary) / 0.3)';
    if (intensity <= 0.6) return 'hsl(var(--primary) / 0.5)';
    if (intensity <= 0.8) return 'hsl(var(--primary) / 0.7)';
    return 'hsl(var(--primary) / 0.9)';
  };

  const getMetricColor = (value: number, type: 'critical' | 'prioritized' | 'dueToday' | 'resolution') => {
    switch (type) {
      case 'critical':
        if (value >= 10) return 'destructive';
        if (value >= 5) return 'outline';
        return 'secondary';
      case 'prioritized':
        if (value >= 15) return 'destructive';
        if (value >= 8) return 'outline';
        return 'secondary';
      case 'dueToday':
        if (value >= 5) return 'destructive';
        if (value >= 2) return 'outline';
        return 'secondary';
      case 'resolution':
        if (value >= 95) return 'default';
        if (value >= 80) return 'secondary';
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const maxHeatmapValue = Math.max(...heatmapData.heatmap.map(cell => cell.value));

  return (
    <div className="space-y-6">
      {/* Cards de Métricas por Fornecedor */}
      <Card className="border-l-4 border-l-primary">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Métricas por Fornecedor
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Resumo executivo de ocorrências por fornecedor
          </p>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            <div className="grid gap-4">
              {vendorMetrics.map((vendor) => (
                <Card key={vendor.vendor} className="hover-scale transition-all duration-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-lg truncate max-w-[200px]" title={vendor.vendor}>
                        {vendor.vendor}
                      </h4>
                      <Badge variant="outline" className="ml-2">
                        {vendor.totalOccurrences} total
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <Button
                        variant="ghost"
                        className="h-auto p-3 flex flex-col items-center gap-2 hover:bg-destructive/10"
                        onClick={() => handleCardClick(vendor.vendor, 'critical')}
                      >
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                        <div className="text-center">
                          <Badge variant={getMetricColor(vendor.criticalOccurrences, 'critical')}>
                            {vendor.criticalOccurrences}
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">Críticas</p>
                        </div>
                      </Button>

                      <Button
                        variant="ghost"
                        className="h-auto p-3 flex flex-col items-center gap-2 hover:bg-orange-500/10"
                        onClick={() => handleCardClick(vendor.vendor, 'prioritized')}
                      >
                        <TrendingUp className="h-4 w-4 text-orange-500" />
                        <div className="text-center">
                          <Badge variant={getMetricColor(vendor.prioritizedOccurrences, 'prioritized')}>
                            {vendor.prioritizedOccurrences}
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">Priorizadas</p>
                        </div>
                      </Button>

                      <Button
                        variant="ghost"
                        className="h-auto p-3 flex flex-col items-center gap-2 hover:bg-yellow-500/10"
                        onClick={() => handleCardClick(vendor.vendor, 'dueToday')}
                      >
                        <Timer className="h-4 w-4 text-yellow-600" />
                        <div className="text-center">
                          <Badge variant={getMetricColor(vendor.dueTodayOccurrences, 'dueToday')}>
                            {vendor.dueTodayOccurrences}
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">Vencem Hoje</p>
                        </div>
                      </Button>

                      <div className="flex flex-col items-center gap-2 p-3">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <div className="text-center">
                          <Badge variant={getMetricColor(vendor.resolutionRate, 'resolution')}>
                            {vendor.resolutionRate}%
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">Resolução</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center mt-3 pt-3 border-t border-border">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>MTTR: {vendor.avgResolutionTime}</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Activity className="h-3 w-3" />
                        <span>SLA: {vendor.slaCompliance}%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Heatmap Fornecedor x Equipamento */}
      <Card className="border-l-4 border-l-secondary">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Heatmap: Fornecedor × Equipamento
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Concentração de ocorrências por fornecedor e tipo de equipamento
          </p>
        </CardHeader>
        <CardContent>
          <div className="h-[500px] overflow-auto">
            <div className="min-w-fit overflow-x-auto" style={{ width: `${200 + (heatmapData.equipments.length * 120)}px` }}>
              {/* Header da tabela */}
              <div className="grid gap-1 mb-2" style={{ gridTemplateColumns: `200px repeat(${heatmapData.equipments.length}, 120px)` }}>
                <div className="p-2 font-medium text-sm">Fornecedor</div>
                {heatmapData.equipmentsDisplay.map((equipmentDisplay, index) => (
                  <div key={heatmapData.equipments[index]} className="p-2 text-xs font-medium text-center" title={equipmentDisplay}>
                    <div className="truncate">{equipmentDisplay}</div>
                  </div>
                ))}
              </div>

              {/* Linhas do heatmap */}
              {heatmapData.vendors.map(vendor => (
                <div key={vendor} className="grid gap-1 mb-1" style={{ gridTemplateColumns: `200px repeat(${heatmapData.equipments.length}, 120px)` }}>
                  <div className="p-2 text-sm font-medium truncate" title={vendor}>
                    {vendor}
                  </div>
                  {heatmapData.equipments.map(equipment => {
                    const cell = heatmapData.heatmap.find(c => c.vendor === vendor && c.equipment === equipment);
                    const value = cell?.value || 0;
                    
                    return (
                      <div
                        key={equipment}
                        className="aspect-square flex items-center justify-center text-xs font-medium rounded cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all"
                        style={{ backgroundColor: getHeatmapColor(value, maxHeatmapValue) }}
                        title={`${vendor} - ${equipment}: ${value} ocorrências`}
                        onClick={() => onNavigateToOccurrences?.({ vendor })}
                      >
                        {value > 0 ? value : ''}
                      </div>
                    );
                  })}
                </div>
              ))}

              {/* Legenda */}
              <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border">
                <span className="text-sm font-medium">Intensidade:</span>
                <div className="flex items-center gap-2">
                  {[0, 0.2, 0.4, 0.6, 0.8, 1].map((intensity, index) => (
                    <div key={index} className="flex items-center gap-1">
                      <div 
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: getHeatmapColor(intensity * maxHeatmapValue, maxHeatmapValue) }}
                      />
                      {index === 0 && <span className="text-xs text-muted-foreground">Baixa</span>}
                      {index === 5 && <span className="text-xs text-muted-foreground">Alta</span>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}