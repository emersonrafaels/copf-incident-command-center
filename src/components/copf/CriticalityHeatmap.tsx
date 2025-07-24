import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AlertTriangle, Clock, RotateCcw, TrendingUp, Info, Calculator } from "lucide-react";

interface CriticalityData {
  equipment: string;
  segment: string;
  criticalityScore: number;
  aging: number;
  slaBreached: boolean;
  reincidencia: number;
  volumeAtipico: boolean;
  occurrenceCount: number;
  agenciesWithSLABreach: number;
}

interface CriticalityHeatmapProps {
  occurrences: any[];
}

export function CriticalityHeatmap({ occurrences }: CriticalityHeatmapProps) {
  // Calcular dados de criticidade por equipamento - Memoizado para performance
  const criticalityData = useMemo((): CriticalityData[] => {
    const equipmentMap = new Map<string, any>();
    const agencyMap = new Map<string, any>();

    // Agrupar por equipamento e por agência
    occurrences.forEach(occ => {
      const equipmentKey = `${occ.equipment}-${occ.segment}`;
      const agencyKey = occ.agency;
      
      // Equipamentos
      if (!equipmentMap.has(equipmentKey)) {
        equipmentMap.set(equipmentKey, {
          equipment: occ.equipment,
          segment: occ.segment,
          occurrences: [],
          totalCount: 0
        });
      }
      
      const equipmentData = equipmentMap.get(equipmentKey);
      equipmentData.occurrences.push(occ);
      equipmentData.totalCount++;

      // Agências
      if (!agencyMap.has(agencyKey)) {
        agencyMap.set(agencyKey, {
          agency: agencyKey,
          occurrences: []
        });
      }
      
      const agencyData = agencyMap.get(agencyKey);
      agencyData.occurrences.push(occ);
    });

    // Calcular percentual de agências com SLA estourado
    let agenciesWithSLABreach = 0;
    agencyMap.forEach((agencyData) => {
      const hasSLABreach = agencyData.occurrences.some((occ: any) => {
        const hours = (Date.now() - new Date(occ.createdAt).getTime()) / (1000 * 60 * 60);
        const slaLimit = (occ.severity === 'critical' || occ.severity === 'high') ? 24 : 72;
        return hours > slaLimit && occ.status !== 'encerrada';
      });
      if (hasSLABreach) agenciesWithSLABreach++;
    });

    const percentualAgenciasSLA = agencyMap.size > 0 ? (agenciesWithSLABreach / agencyMap.size) * 100 : 0;

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
        return hours > slaLimit && occ.status !== 'encerrada';
      });

      // Calcular reincidência (ocorrências do mesmo equipamento nos últimos 30 dias)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const recentOccurrences = occs.filter((occ: any) => new Date(occ.createdAt) >= thirtyDaysAgo);
      const reincidencia = recentOccurrences.length;

      // Calcular percentual de ocorrências reincidentes (ocorrências que se repetem no mesmo equipamento)
      const occurrencesByTypeCount = new Map<string, number>();
      recentOccurrences.forEach((occ: any) => {
        const type = occ.type || 'unknown';
        occurrencesByTypeCount.set(type, (occurrencesByTypeCount.get(type) || 0) + 1);
      });
      
      let reincidentOccurrences = 0;
      occurrencesByTypeCount.forEach(count => {
        if (count > 1) reincidentOccurrences += count;
      });

      const percentualReincidencia = recentOccurrences.length > 0 ? (reincidentOccurrences / recentOccurrences.length) * 100 : 0;

      // Volume atípico (mais que 5 ocorrências no período)
      const volumeAtipico = reincidencia > 5;

      // Calcular score de criticidade (0-100) baseado nos 4 fatores
      let criticalityScore = 0;
      
      // Peso por aging (máximo 20 pontos)
      criticalityScore += Math.min(avgAging * 1.5, 20);
      
      // Peso por volume de ocorrências (máximo 20 pontos)
      criticalityScore += Math.min(reincidencia * 2, 20);
      
      // Peso por percentual de reincidência (máximo 30 pontos)
      criticalityScore += Math.min(percentualReincidencia * 0.3, 30);
      
      // Peso por percentual de agências com SLA estourado (máximo 30 pontos)
      criticalityScore += Math.min(percentualAgenciasSLA * 0.3, 30);

      // Calcular agências com SLA estourado para este equipamento específico
      const equipmentAgencies = new Set(occs.map((occ: any) => occ.agency));
      let equipmentAgenciesWithSLA = 0;
      
      equipmentAgencies.forEach(agency => {
        const agencyOccs = occs.filter((occ: any) => occ.agency === agency);
        const hasSLABreach = agencyOccs.some((occ: any) => {
          const hours = (Date.now() - new Date(occ.createdAt).getTime()) / (1000 * 60 * 60);
          const slaLimit = (occ.severity === 'critical' || occ.severity === 'high') ? 24 : 72;
          return hours > slaLimit && occ.status !== 'encerrada';
        });
        if (hasSLABreach) equipmentAgenciesWithSLA++;
      });

      criticalityData.push({
        equipment,
        segment,
        criticalityScore: Math.min(criticalityScore, 100),
        aging: Math.round(avgAging),
        slaBreached,
        reincidencia,
        volumeAtipico,
        occurrenceCount: totalCount,
        agenciesWithSLABreach: equipmentAgenciesWithSLA
      });
    });

    return criticalityData.sort((a, b) => b.criticalityScore - a.criticalityScore);
  }, [occurrences]);

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

  // Componente do Modal Explicativo
  const CriticalityExplanationModal = () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="ml-auto">
          <Calculator className="h-4 w-4 mr-2" />
          Como é calculado?
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Info className="h-5 w-5 text-primary" />
            Cálculo de Criticidade por Equipamento
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Fórmula de Criticidade</h4>
            <p className="text-sm text-muted-foreground">
              Score = Aging (max 20) + Volume (max 20) + % Reincidência (max 30) + % Agências SLA Estourado (max 30)
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="border rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <h5 className="font-medium">Aging (0-20 pontos)</h5>
                </div>
                <p className="text-sm text-muted-foreground">
                  Média de dias desde a criação das ocorrências abertas. Máximo de 20 pontos ({'>'}=13.3 dias).
                </p>
              </div>
              
              <div className="border rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-accent" />
                  <h5 className="font-medium">Volume de Ocorrências (0-20 pontos)</h5>
                </div>
                <p className="text-sm text-muted-foreground">
                  Número de ocorrências nos últimos 30 dias × 2. Máximo de 20 pontos ({'>'}=10 ocorrências).
                </p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="border rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <RotateCcw className="h-4 w-4 text-destructive" />
                  <h5 className="font-medium">% Reincidência (0-30 pontos)</h5>
                </div>
                <p className="text-sm text-muted-foreground">
                  Percentual de ocorrências reincidentes (mesmo tipo) × 0.3. Máximo de 30 pontos (100% reincidência).
                </p>
              </div>
              
              <div className="border rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-warning" />
                  <h5 className="font-medium">% Agências SLA Estourado (0-30 pontos)</h5>
                </div>
                <p className="text-sm text-muted-foreground">
                  Percentual de agências com SLA estourado × 0.3. Máximo de 30 pontos (100% das agências).
                </p>
              </div>
            </div>
          </div>
          
          <div className="border-t pt-4">
            <h4 className="font-semibold mb-2">Níveis de Criticidade</h4>
            <div className="grid grid-cols-5 gap-2 text-xs">
              <div className="text-center">
                <div className="w-full h-3 bg-destructive rounded mb-1"></div>
                <span className="font-medium">Crítico</span>
                <div className="text-muted-foreground">80-100</div>
              </div>
              <div className="text-center">
                <div className="w-full h-3 bg-warning rounded mb-1"></div>
                <span className="font-medium">Alto</span>
                <div className="text-muted-foreground">60-79</div>
              </div>
              <div className="text-center">
                <div className="w-full h-3 bg-yellow-500 rounded mb-1"></div>
                <span className="font-medium">Médio</span>
                <div className="text-muted-foreground">40-59</div>
              </div>
              <div className="text-center">
                <div className="w-full h-3 bg-blue-500 rounded mb-1"></div>
                <span className="font-medium">Baixo</span>
                <div className="text-muted-foreground">20-39</div>
              </div>
              <div className="text-center">
                <div className="w-full h-3 bg-success rounded mb-1"></div>
                <span className="font-medium">Mínimo</span>
                <div className="text-muted-foreground">0-19</div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <Card className="animate-fade-in border-border/50 bg-gradient-to-br from-card to-muted/20">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-warning/10">
              <AlertTriangle className="h-5 w-5 text-warning" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Mapa de Criticidade por Equipamento</h3>
              <p className="text-sm text-muted-foreground">
                Análise baseada em aging, volume, percentual de reincidência e percentual de agências com SLA estourado
              </p>
            </div>
          </div>
          <CriticalityExplanationModal />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Legenda Melhorada */}
          <div className="bg-muted/30 p-4 rounded-lg border border-border/50">
            <h4 className="font-medium mb-3 text-sm">Níveis de Criticidade</h4>
            <div className="grid grid-cols-5 gap-3 text-xs">
              <div className="text-center space-y-2">
                <div className="w-full h-4 bg-destructive rounded-md shadow-sm"></div>
                <div>
                  <div className="font-semibold text-destructive">Crítico</div>
                  <div className="text-muted-foreground">80-100</div>
                </div>
              </div>
              <div className="text-center space-y-2">
                <div className="w-full h-4 bg-warning rounded-md shadow-sm"></div>
                <div>
                  <div className="font-semibold text-warning">Alto</div>
                  <div className="text-muted-foreground">60-79</div>
                </div>
              </div>
              <div className="text-center space-y-2">
                <div className="w-full h-4 bg-yellow-500 rounded-md shadow-sm"></div>
                <div>
                  <div className="font-semibold text-yellow-600">Médio</div>
                  <div className="text-muted-foreground">40-59</div>
                </div>
              </div>
              <div className="text-center space-y-2">
                <div className="w-full h-4 bg-blue-500 rounded-md shadow-sm"></div>
                <div>
                  <div className="font-semibold text-blue-600">Baixo</div>
                  <div className="text-muted-foreground">20-39</div>
                </div>
              </div>
              <div className="text-center space-y-2">
                <div className="w-full h-4 bg-success rounded-md shadow-sm"></div>
                <div>
                  <div className="font-semibold text-success">Mínimo</div>
                  <div className="text-muted-foreground">0-19</div>
                </div>
              </div>
            </div>
          </div>

          {/* Grade de Heatmap Melhorada */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {criticalityData.slice(0, 16).map((item, index) => (
              <TooltipProvider key={`${item.equipment}-${item.segment}`}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div 
                      className={`group relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg animate-fade-in ${getCriticalityColor(item.criticalityScore)} text-white overflow-hidden`}
                      style={{ animationDelay: `${index * 75}ms` }}
                    >
                      {/* Background gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-50"></div>
                      
                      <div className="relative space-y-3">
                        <div className="flex items-center justify-between">
                          <Badge variant="secondary" className="text-xs bg-white/20 text-white border-white/30 backdrop-blur-sm">
                            {item.segment}
                          </Badge>
                          <div className="text-right">
                            <div className="text-lg font-bold leading-none">
                              {Math.round(item.criticalityScore)}
                            </div>
                            <div className="text-xs opacity-75">
                              {getCriticalityLabel(item.criticalityScore)}
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold text-sm truncate mb-1" title={item.equipment}>
                            {item.equipment}
                          </h4>
                          <p className="text-xs opacity-90">
                            {Math.round(item.occurrenceCount)} ocorrência{item.occurrenceCount !== 1 ? 's' : ''}
                          </p>
                        </div>

                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="flex items-center gap-1.5 bg-white/10 rounded-md px-2 py-1">
                              <Clock className="h-3 w-3" />
                              <span>{Math.round(item.aging)}d</span>
                            </div>
                            {item.reincidencia > 1 && (
                              <div className="flex items-center gap-1.5 bg-white/10 rounded-md px-2 py-1">
                                <RotateCcw className="h-3 w-3" />
                                <span>{Math.round(item.reincidencia)}x</span>
                              </div>
                            )}
                          {item.slaBreached && (
                            <div className="flex items-center gap-1.5 bg-white/10 rounded-md px-2 py-1">
                              <AlertTriangle className="h-3 w-3" />
                              <span>SLA</span>
                            </div>
                          )}
                          {item.volumeAtipico && (
                            <div className="flex items-center gap-1.5 bg-white/10 rounded-md px-2 py-1">
                              <TrendingUp className="h-3 w-3" />
                              <span>Vol</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Hover indicator */}
                      <div className="absolute inset-0 border-2 border-white/0 rounded-xl transition-all duration-300 group-hover:border-white/30"></div>
                    </div>
                  </TooltipTrigger>
                   <TooltipContent className="max-w-xs bg-background/95 backdrop-blur-sm border border-border/80">
                     <div className="space-y-2">
                       <div className="font-semibold">{item.equipment} ({item.segment})</div>
                       <div className="space-y-1 text-sm">
                         <div>Criticidade: <span className="font-semibold">{getCriticalityLabel(item.criticalityScore)} ({item.criticalityScore})</span></div>
                         <div>Aging médio: <span className="font-semibold">{item.aging} dias</span></div>
                         <div>Reincidência: <span className="font-semibold">{item.reincidencia} ocorrências ({Math.round((item.reincidencia / item.occurrenceCount) * 100)}%)</span></div>
                         <div>Quantidade de Agências com SLA Vencido: <span className="font-semibold text-destructive">
                           {item.agenciesWithSLABreach} ({(() => {
                             const totalAgencies = new Set(occurrences.filter(occ => occ.equipment === item.equipment && occ.segment === item.segment).map(occ => occ.agency)).size;
                             return totalAgencies > 0 ? Math.round((item.agenciesWithSLABreach / totalAgencies) * 100) : 0;
                           })()}%)
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
            <div className="text-center py-12 text-muted-foreground">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
                <AlertTriangle className="h-8 w-8 opacity-50" />
              </div>
              <h4 className="font-medium mb-2">Sem dados suficientes</h4>
              <p className="text-sm">Nenhum equipamento com dados suficientes para análise de criticidade</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}