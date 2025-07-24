import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AlertTriangle, Clock, RotateCcw, TrendingUp } from "lucide-react";

interface CriticalityData {
  equipment: string;
  segment: string;
  criticalityScore: number;
  aging: number;
  slaBreached: boolean;
  reincidencia: number;
  volumeAtipico: boolean;
  occurrenceCount: number;
}

interface CriticalityHeatmapProps {
  occurrences: any[];
}

export function CriticalityHeatmap({ occurrences }: CriticalityHeatmapProps) {
  // Calcular dados de criticidade por equipamento
  const calculateCriticalityData = (): CriticalityData[] => {
    const equipmentMap = new Map<string, any>();

    occurrences.forEach(occ => {
      const key = `${occ.equipment}-${occ.segment}`;
      
      if (!equipmentMap.has(key)) {
        equipmentMap.set(key, {
          equipment: occ.equipment,
          segment: occ.segment,
          occurrences: [],
          totalCount: 0
        });
      }
      
      const data = equipmentMap.get(key);
      data.occurrences.push(occ);
      data.totalCount++;
    });

    const criticalityData: CriticalityData[] = [];

    equipmentMap.forEach((data, key) => {
      const { occurrences: occs, equipment, segment, totalCount } = data;
      
      // Calcular aging médio (em dias)
      const avgAging = occs.reduce((sum: number, occ: any) => {
        const daysDiff = Math.floor((Date.now() - new Date(occ.createdAt).getTime()) / (1000 * 60 * 60 * 24));
        return sum + daysDiff;
      }, 0) / occs.length;

      // Verificar se há SLA quebrado (mais de 24h para critical/high, 72h para medium/low)
      const slaBreached = occs.some((occ: any) => {
        const hours = (Date.now() - new Date(occ.createdAt).getTime()) / (1000 * 60 * 60);
        const slaLimit = (occ.severity === 'critical' || occ.severity === 'high') ? 24 : 72;
        return hours > slaLimit && occ.status !== 'resolved';
      });

      // Calcular reincidência (ocorrências do mesmo equipamento nos últimos 30 dias)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const recentOccurrences = occs.filter((occ: any) => new Date(occ.createdAt) >= thirtyDaysAgo);
      const reincidencia = recentOccurrences.length;

      // Volume atípico (mais que 5 ocorrências no período)
      const volumeAtipico = reincidencia > 5;

      // Calcular score de criticidade (0-100)
      let criticalityScore = 0;
      
      // Peso por aging (máximo 25 pontos)
      criticalityScore += Math.min(avgAging * 2, 25);
      
      // Peso por SLA (25 pontos se quebrado)
      if (slaBreached) criticalityScore += 25;
      
      // Peso por reincidência (máximo 25 pontos)
      criticalityScore += Math.min(reincidencia * 3, 25);
      
      // Peso por volume atípico (25 pontos)
      if (volumeAtipico) criticalityScore += 25;

      criticalityData.push({
        equipment,
        segment,
        criticalityScore: Math.min(criticalityScore, 100),
        aging: Math.round(avgAging),
        slaBreached,
        reincidencia,
        volumeAtipico,
        occurrenceCount: totalCount
      });
    });

    return criticalityData.sort((a, b) => b.criticalityScore - a.criticalityScore);
  };

  const criticalityData = calculateCriticalityData();

  const getCriticalityColor = (score: number) => {
    if (score >= 80) return 'bg-destructive';
    if (score >= 60) return 'bg-warning';
    if (score >= 40) return 'bg-yellow-500';
    if (score >= 20) return 'bg-blue-500';
    return 'bg-success';
  };

  const getCriticalityLabel = (score: number) => {
    if (score >= 80) return 'Crítico';
    if (score >= 60) return 'Alto';
    if (score >= 40) return 'Médio';
    if (score >= 20) return 'Baixo';
    return 'Mínimo';
  };

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-warning" />
          Mapa de Criticidade por Equipamento
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Baseado em aging, SLA, reincidência e volume atípico
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Legenda */}
          <div className="flex flex-wrap gap-2 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-destructive rounded"></div>
              <span>Crítico (80-100)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-warning rounded"></div>
              <span>Alto (60-79)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-yellow-500 rounded"></div>
              <span>Médio (40-59)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span>Baixo (20-39)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-success rounded"></div>
              <span>Mínimo (0-19)</span>
            </div>
          </div>

          {/* Grade de Heatmap */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {criticalityData.slice(0, 16).map((item, index) => (
              <TooltipProvider key={`${item.equipment}-${item.segment}`}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div 
                      className={`p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg animate-fade-in ${getCriticalityColor(item.criticalityScore)} text-white`}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Badge variant="secondary" className="text-xs bg-white/20 text-white border-white/30">
                            {item.segment}
                          </Badge>
                          <span className="text-xs font-bold">
                            {item.criticalityScore}
                          </span>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold text-sm truncate" title={item.equipment}>
                            {item.equipment}
                          </h4>
                          <p className="text-xs opacity-90">
                            {item.occurrenceCount} ocorrência{item.occurrenceCount !== 1 ? 's' : ''}
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-1 text-xs">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{item.aging}d</span>
                          </div>
                          {item.reincidencia > 1 && (
                            <div className="flex items-center gap-1">
                              <RotateCcw className="h-3 w-3" />
                              <span>{item.reincidencia}x</span>
                            </div>
                          )}
                          {item.slaBreached && (
                            <div className="flex items-center gap-1">
                              <AlertTriangle className="h-3 w-3" />
                              <span>SLA</span>
                            </div>
                          )}
                          {item.volumeAtipico && (
                            <div className="flex items-center gap-1">
                              <TrendingUp className="h-3 w-3" />
                              <span>Vol</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <div className="space-y-2">
                      <div className="font-semibold">{item.equipment} ({item.segment})</div>
                      <div className="space-y-1 text-sm">
                        <div>Criticidade: <span className="font-semibold">{getCriticalityLabel(item.criticalityScore)} ({item.criticalityScore})</span></div>
                        <div>Aging médio: <span className="font-semibold">{item.aging} dias</span></div>
                        <div>Reincidência: <span className="font-semibold">{item.reincidencia} ocorrências</span></div>
                        <div>SLA: <span className={`font-semibold ${item.slaBreached ? 'text-destructive' : 'text-success'}`}>
                          {item.slaBreached ? 'Quebrado' : 'Dentro do prazo'}
                        </span></div>
                        <div>Volume: <span className={`font-semibold ${item.volumeAtipico ? 'text-warning' : 'text-success'}`}>
                          {item.volumeAtipico ? 'Atípico' : 'Normal'}
                        </span></div>
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>

          {criticalityData.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum equipamento com dados suficientes para análise de criticidade</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}