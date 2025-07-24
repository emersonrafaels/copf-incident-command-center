import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AlertTriangle, Clock, RotateCcw, TrendingUp, Info, Calculator, ArrowUp, ArrowDown, Minus, Activity } from "lucide-react";

interface CriticalityData {
  equipment: string;
  segment: string;
  criticalityScore: number;
  aging: number;
  agingBaseline: number;
  agingVariation: number;
  slaBreached: boolean;
  slaBreach: number;
  slaStatus: 'above' | 'below' | 'normal';
  slaDifference: number;
  reincidencia: number;
  volumeAtipico: boolean;
  occurrenceCount: number;
  agenciesWithSLABreach: number;
  percentualVolumeBaseline: number;
  reincidenciaPercentual: number;
}

interface CriticalityHeatmapProps {
  occurrences: any[];
}

// Baselines por tipo de equipamento (em dias)
const EQUIPMENT_BASELINES = {
  'ATM': { aging: 7, volume: 2, sla: 10 },
  'POS': { aging: 5, volume: 3, sla: 15 },
  'Servidor': { aging: 3, volume: 1, sla: 5 },
  'Impressora': { aging: 10, volume: 4, sla: 20 },
  'Rede': { aging: 2, volume: 2, sla: 8 },
  'default': { aging: 7, volume: 3, sla: 15 }
};

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
      
      // Obter baseline específico para o tipo de equipamento
      const baseline = EQUIPMENT_BASELINES[equipment as keyof typeof EQUIPMENT_BASELINES] || EQUIPMENT_BASELINES.default;
      
      // Calcular aging médio (em dias)
      const avgAging = occs.reduce((sum: number, occ: any) => {
        const daysDiff = Math.floor((Date.now() - new Date(occ.createdAt).getTime()) / (1000 * 60 * 60 * 24));
        return sum + daysDiff;
      }, 0) / occs.length;

      // Calcular variação do aging em relação ao baseline
      const agingVariation = Math.round(((avgAging - baseline.aging) / baseline.aging) * 100);

      // Verificar se há SLA quebrado e calcular percentual de ocorrências com SLA vencido
      let slaBreachedCount = 0;
      const slaBreached = occs.some((occ: any) => {
        const hours = (Date.now() - new Date(occ.createdAt).getTime()) / (1000 * 60 * 60);
        const slaLimit = (occ.severity === 'critical' || occ.severity === 'high') ? 24 : 72;
        const isBreached = hours > slaLimit && occ.status !== 'encerrada';
        if (isBreached) {
          slaBreachedCount++;
        }
        return isBreached;
      });

      // Calcular percentual de SLA vencido
      const slaBreachPercentage = occs.length > 0 ? Math.round((slaBreachedCount / occs.length) * 100) : 0;

      // Definir percentual normal de SLA baseado no baseline do equipamento
      const normalSLAPercentage = baseline.sla;
      const slaDifference = slaBreachPercentage - normalSLAPercentage;
      const slaStatus = slaDifference > 5 ? 'above' : slaDifference < -5 ? 'below' : 'normal';

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

      const reincidenciaPercentual = recentOccurrences.length > 0 ? Math.round((reincidentOccurrences / recentOccurrences.length) * 100) : 0;

      // Calcular % de volume em relação ao baseline específico do equipamento
      const percentualVolumeBaseline = baseline.volume > 0 ? Math.round((reincidencia / baseline.volume) * 100) : 0;
      const volumeAtipico = percentualVolumeBaseline > 200; // 200% do baseline

      // Calcular score de criticidade (0-100) baseado nos 4 fatores com pesos ajustados
      let criticalityScore = 0;
      
      // Peso por variação do aging vs baseline (máximo 25 pontos)
      const agingScore = Math.max(0, Math.min(agingVariation * 0.25, 25));
      criticalityScore += agingScore;
      
      // Peso por volume vs baseline (máximo 25 pontos)
      const volumeScore = Math.max(0, Math.min((percentualVolumeBaseline - 100) * 0.1, 25));
      criticalityScore += volumeScore;
      
      // Peso por percentual de reincidência (máximo 25 pontos)
      criticalityScore += Math.min(reincidenciaPercentual * 0.25, 25);
      
      // Peso por SLA vs baseline (máximo 25 pontos)
      const slaScore = Math.max(0, Math.min(slaDifference * 0.5, 25));
      criticalityScore += slaScore;

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
        agingBaseline: baseline.aging,
        agingVariation,
        slaBreached,
        slaBreach: slaBreachPercentage,
        slaStatus,
        slaDifference: Math.abs(slaDifference),
        reincidencia,
        volumeAtipico,
        occurrenceCount: totalCount,
        agenciesWithSLABreach: equipmentAgenciesWithSLA,
        percentualVolumeBaseline,
        reincidenciaPercentual
      });
    });

    return criticalityData.sort((a, b) => b.criticalityScore - a.criticalityScore);
  }, [occurrences]);

  const getCriticalityColor = (score: number) => {
    if (score >= 80) return 'bg-gradient-to-br from-red-600/90 via-red-700/95 to-red-800/95 border-red-500/30 shadow-xl shadow-red-500/20';
    if (score >= 60) return 'bg-gradient-to-br from-orange-500/90 via-orange-600/95 to-orange-700/95 border-orange-400/30 shadow-xl shadow-orange-500/20';
    if (score >= 40) return 'bg-gradient-to-br from-amber-500/90 via-yellow-600/95 to-yellow-700/95 border-yellow-400/30 shadow-xl shadow-yellow-500/20';
    if (score >= 20) return 'bg-gradient-to-br from-blue-500/90 via-blue-600/95 to-blue-700/95 border-blue-400/30 shadow-xl shadow-blue-500/20';
    return 'bg-gradient-to-br from-emerald-500/90 via-emerald-600/95 to-emerald-700/95 border-emerald-400/30 shadow-xl shadow-emerald-500/20';
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
        <Button variant="outline" size="sm" className="gap-2">
          <Calculator className="h-4 w-4" />
          Metodologia
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Metodologia de Cálculo de Criticidade
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="bg-muted/30 p-4 rounded-lg border">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <Info className="h-4 w-4 text-primary" />
              Fórmula de Criticidade (0-100 pontos)
            </h4>
            <p className="text-sm text-muted-foreground mb-3">
              Score = Variação Aging vs Baseline (25 pts) + Variação Volume vs Baseline (25 pts) + % Reincidência (25 pts) + Variação SLA vs Baseline (25 pts)
            </p>
            <div className="text-xs text-muted-foreground bg-background/50 p-2 rounded">
              <strong>Novidade:</strong> Todos os cálculos agora são baseados em baselines específicos por tipo de equipamento, 
              oferecendo uma análise mais precisa e contextualizada.
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="border rounded-lg p-4 bg-card">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="h-4 w-4 text-primary" />
                  <h5 className="font-medium">Variação do Aging (0-25 pontos)</h5>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  Compara o aging médio atual com o baseline específico do equipamento.
                </p>
                <div className="text-xs bg-muted/50 p-2 rounded">
                  <strong>Baselines por equipamento:</strong><br/>
                  • ATM: 7 dias | POS: 5 dias | Servidor: 3 dias<br/>
                  • Impressora: 10 dias | Rede: 2 dias
                </div>
              </div>
              
              <div className="border rounded-lg p-4 bg-card">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="h-4 w-4 text-accent" />
                  <h5 className="font-medium">Variação do Volume (0-25 pontos)</h5>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  Compara o volume de ocorrências com o baseline esperado para o tipo de equipamento.
                </p>
                <div className="text-xs bg-muted/50 p-2 rounded">
                  Score aumenta quando volume &gt; 200% do baseline
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="border rounded-lg p-4 bg-card">
                <div className="flex items-center gap-2 mb-3">
                  <RotateCcw className="h-4 w-4 text-destructive" />
                  <h5 className="font-medium">% Reincidência (0-25 pontos)</h5>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  Percentual de ocorrências que se repetem (mesmo tipo) no equipamento.
                </p>
                <div className="text-xs bg-muted/50 p-2 rounded">
                  Alta reincidência indica problemas estruturais
                </div>
              </div>
              
              <div className="border rounded-lg p-4 bg-card">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="h-4 w-4 text-warning" />
                  <h5 className="font-medium">Variação SLA (0-25 pontos)</h5>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  Compara o percentual de SLA estourado com o baseline aceitável do equipamento.
                </p>
                <div className="text-xs bg-muted/50 p-2 rounded">
                  Considera tolerância específica por tipo de equipamento
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t pt-4">
            <h4 className="font-semibold mb-3">Níveis de Criticidade</h4>
            <div className="grid grid-cols-5 gap-3 text-xs">
              {[
                { level: 'Crítico', range: '80-100', color: 'bg-destructive' },
                { level: 'Alto', range: '60-79', color: 'bg-warning' },
                { level: 'Médio', range: '40-59', color: 'bg-yellow-500' },
                { level: 'Baixo', range: '20-39', color: 'bg-blue-500' },
                { level: 'Mínimo', range: '0-19', color: 'bg-success' }
              ].map((item) => (
                <div key={item.level} className="text-center space-y-2">
                  <div className={`w-full h-4 ${item.color} rounded-md shadow-sm`}></div>
                  <div>
                    <div className="font-medium">{item.level}</div>
                    <div className="text-muted-foreground">{item.range}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <Card className="animate-fade-in border-border/50 bg-gradient-to-br from-card to-muted/10">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20">
              <AlertTriangle className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-semibold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                Mapa de Criticidade por Equipamento
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Análise baseada em baselines específicos por tipo de equipamento
              </p>
            </div>
          </div>
          <CriticalityExplanationModal />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Legenda Renovada */}
        <div className="bg-gradient-to-r from-muted/20 to-muted/30 p-4 rounded-xl border border-border/30">
          <h4 className="font-semibold mb-4 text-sm flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            Escala de Criticidade
          </h4>
          <div className="grid grid-cols-5 gap-4">
            {[
              { level: 'Crítico', range: '80-100', color: 'bg-destructive', textColor: 'text-destructive' },
              { level: 'Alto', range: '60-79', color: 'bg-warning', textColor: 'text-warning' },
              { level: 'Médio', range: '40-59', color: 'bg-yellow-500', textColor: 'text-yellow-600' },
              { level: 'Baixo', range: '20-39', color: 'bg-blue-500', textColor: 'text-blue-600' },
              { level: 'Mínimo', range: '0-19', color: 'bg-success', textColor: 'text-success' }
            ].map((item) => (
              <div key={item.level} className="text-center space-y-2">
                <div className={`w-full h-4 ${item.color} rounded-lg shadow-sm border border-border/20`}></div>
                <div>
                  <div className={`font-semibold text-sm ${item.textColor}`}>{item.level}</div>
                  <div className="text-xs text-muted-foreground">{item.range}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Grade de Equipamentos Melhorada */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {criticalityData.slice(0, 16).map((item, index) => (
            <TooltipProvider key={`${item.equipment}-${item.segment}`}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div 
                    className={`group relative p-5 rounded-2xl border-2 cursor-pointer transition-all duration-500 hover:scale-[1.02] hover:shadow-xl animate-fade-in ${getCriticalityColor(item.criticalityScore)} text-white overflow-hidden backdrop-blur-sm`}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {/* Background patterns */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/10"></div>
                    <div className="absolute top-0 right-0 w-20 h-20 bg-white/5 rounded-full -translate-y-10 translate-x-10"></div>
                    
                    <div className="relative space-y-4">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-base truncate mb-2" title={item.equipment}>
                            {item.equipment}
                          </h4>
                          <Badge variant="secondary" className="text-xs bg-white/15 text-white border-white/25 backdrop-blur-sm px-3 py-1">
                            {item.segment}
                          </Badge>
                        </div>
                        <div className="text-right flex-shrink-0 ml-3">
                          <div className="text-3xl font-bold leading-none mb-1">
                            {Math.round(item.criticalityScore)}
                          </div>
                          <div className="text-xs font-semibold opacity-90 tracking-wide">
                            {getCriticalityLabel(item.criticalityScore)}
                          </div>
                        </div>
                      </div>

                      {/* Principais métricas */}
                      <div className="space-y-3">
                        <div className="text-sm opacity-90 font-medium flex items-center gap-2">
                          <Activity className="h-3 w-3" />
                          {item.occurrenceCount} ocorrências
                        </div>
                        
                        {/* Métricas principais em grid 2x2 */}
                        <div className="grid grid-cols-2 gap-3">
                          {/* Aging Médio */}
                          <div className="p-3 rounded-xl border border-white/20 bg-white/5">
                            <div className="flex items-center gap-1 mb-2">
                              <Clock className="h-3 w-3" />
                              <span className="text-xs opacity-80">AGING</span>
                            </div>
                            <div className="text-sm font-bold">
                              {item.aging}d
                            </div>
                            <div className="text-xs opacity-70">média atual</div>
                          </div>

                          {/* Volume vs Baseline */}
                          <div className="p-3 rounded-xl border border-white/20 bg-white/5">
                            <div className="flex items-center gap-1 mb-2">
                              <TrendingUp className="h-3 w-3" />
                              <span className="text-xs opacity-80">VOLUME</span>
                            </div>
                            <div className="text-sm font-bold">{item.percentualVolumeBaseline}%</div>
                            <div className="text-xs opacity-70">do baseline</div>
                          </div>

                          {/* SLA Status */}
                          <div className="p-3 rounded-xl border border-white/20 bg-white/5">
                            <div className="flex items-center gap-1 mb-2">
                              {item.slaStatus === 'above' ? (
                                <ArrowUp className="h-3 w-3" />
                              ) : item.slaStatus === 'below' ? (
                                <ArrowDown className="h-3 w-3" />
                              ) : (
                                <Minus className="h-3 w-3" />
                              )}
                              <span className="text-xs opacity-80">SLA</span>
                            </div>
                            <div className="text-sm font-bold">
                              {item.slaStatus === 'above' ? `+${item.slaDifference}%` : 
                               item.slaStatus === 'below' ? `-${item.slaDifference}%` : 
                               'Normal'}
                            </div>
                            <div className="text-xs opacity-70">vs baseline</div>
                          </div>

                          {/* Reincidência */}
                          <div className="p-3 rounded-xl border border-white/20 bg-white/5">
                            <div className="flex items-center gap-1 mb-2">
                              <RotateCcw className="h-3 w-3" />
                              <span className="text-xs opacity-80">REIN</span>
                            </div>
                            <div className="text-sm font-bold">{item.reincidenciaPercentual}%</div>
                            <div className="text-xs opacity-70">reincidência</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Hover glow effect */}
                    <div className="absolute inset-0 border-2 border-white/0 rounded-2xl transition-all duration-300 group-hover:border-white/20 group-hover:shadow-[0_0_30px_rgba(255,255,255,0.1)]"></div>
                  </div>
                </TooltipTrigger>
                <TooltipContent className="max-w-sm bg-background/95 backdrop-blur-sm border border-border/80 p-4">
                  <div className="space-y-3">
                    <div className="font-semibold text-base">{item.equipment} ({item.segment})</div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Criticidade:</span>
                        <span className="font-semibold capitalize">{getCriticalityLabel(item.criticalityScore)} ({Math.round(item.criticalityScore)})</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Aging atual:</span>
                        <span className="font-semibold">{item.aging}d (baseline: {item.agingBaseline}d)</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Variação aging:</span>
                        <span className={`font-semibold ${item.agingVariation > 0 ? 'text-destructive' : 'text-success'}`}>
                          {item.agingVariation > 0 ? '+' : ''}{item.agingVariation}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Reincidência:</span>
                        <span className="font-semibold">{item.reincidencia} ocorrências ({item.reincidenciaPercentual}%)</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Volume vs baseline:</span>
                        <span className={`font-semibold ${item.volumeAtipico ? 'text-warning' : 'text-success'}`}>
                          {item.percentualVolumeBaseline}% <span className="mx-1">({item.volumeAtipico ? 'Atípico' : 'Normal'})</span>
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Agências SLA vencido:</span>
                        <span className="font-semibold text-destructive">
                          {item.agenciesWithSLABreach}
                        </span>
                      </div>
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>

        {criticalityData.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted/30 flex items-center justify-center">
              <AlertTriangle className="h-10 w-10 opacity-50" />
            </div>
            <h4 className="font-semibold mb-2 text-lg">Sem dados suficientes</h4>
            <p className="text-sm max-w-md mx-auto">
              Aguardando dados de ocorrências para gerar a análise de criticidade por equipamento
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}