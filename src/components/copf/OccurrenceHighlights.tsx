
import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from './StatusBadge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Clock, AlertTriangle, TrendingUp, ArrowRight, Calendar, Timer, AlertCircle } from 'lucide-react';
import { OccurrenceData } from '@/hooks/useDashboardData';
import { useFilters } from '@/contexts/FiltersContext';
import { format, differenceInHours, isToday, startOfDay, endOfDay, isSameDay } from 'date-fns';

interface OccurrenceHighlightsProps {
  occurrences: OccurrenceData[];
  onOccurrenceClick: (occurrence: OccurrenceData) => void;
}

export function OccurrenceHighlights({
  occurrences,
  onOccurrenceClick
}: OccurrenceHighlightsProps) {
  const navigate = useNavigate();
  const {
    clearAllFilters,
    updateFilter
  } = useFilters();

  // Função para obter a variante correta do badge de severidade
  const getSeverityVariant = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'critical';
      case 'high':
        return 'high';
      case 'medium':
        return 'medium';
      case 'low':
        return 'low';
      default:
        return 'outline';
    }
  };

  // Função para obter o label traduzido da severidade
  const getSeverityLabel = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'Crítica';
      case 'high':
        return 'Alta';
      case 'medium':
        return 'Média';
      case 'low':
        return 'Baixa';
      default:
        return severity;
    }
  };

  // Calcular SLA baseado na severidade
  const calculateSLA = (occurrence: OccurrenceData) => {
    const createdDate = new Date(occurrence.createdAt);
    const slaHours = occurrence.severity === 'critical' || occurrence.severity === 'high' ? 24 : 72;
    const slaEndDate = new Date(createdDate.getTime() + slaHours * 60 * 60 * 1000);
    const hoursRemaining = differenceInHours(slaEndDate, new Date());
    return {
      endDate: slaEndDate,
      hoursRemaining,
      isExpired: hoursRemaining < 0,
      isExpiringSoon: hoursRemaining <= 4 && hoursRemaining > 0
    };
  };

  const highlights = useMemo(() => {
    const today = new Date();

    // Ocorrências que entraram hoje - usando isSameDay para comparação precisa
    const enteredToday = occurrences.filter(occ => {
      const createdDate = new Date(occ.createdAt);
      return isSameDay(createdDate, today);
    });

    // Ocorrências que vencem hoje (em andamento e que ainda não venceram)
    const dueToday = occurrences.filter(occ => {
      if (occ.status === 'encerrado' || occ.status === 'cancelado') return false;
      const sla = calculateSLA(occ);
      return isSameDay(sla.endDate, today) && !sla.isExpired;
    });

    // Ocorrências vencidas (todas não encerradas que estão vencidas)
    const overdueOccurrences = occurrences.filter(occ => {
      if (occ.status === 'encerrado' || occ.status === 'cancelado') return false;
      const sla = calculateSLA(occ);
      return sla.isExpired;
    }).sort((a, b) => {
      const slaA = calculateSLA(a);
      const slaB = calculateSLA(b);
      return slaA.hoursRemaining - slaB.hoursRemaining; // Mais vencidas primeiro
    });

    return {
      enteredToday,
      dueToday,
      overdueOccurrences,
      counts: {
        enteredToday: enteredToday.length,
        dueToday: dueToday.length,
        overdueOccurrences: overdueOccurrences.length
      }
    };
  }, [occurrences]);

  const handleViewAll = (type: 'entered' | 'due' | 'overdue') => {
    clearAllFilters();
    setTimeout(() => {
      if (type === 'entered') {
        // Para entrada hoje, filtrar status ativos
        updateFilter('statusFilterMulti', ['a_iniciar', 'em_andamento', 'com_impedimentos']);
      } else if (type === 'due') {
        // Para vence hoje, filtrar por status ativos e usar filtro específico
        updateFilter('statusFilterMulti', ['a_iniciar', 'em_andamento', 'com_impedimentos']);
        updateFilter('statusSlaFilter', ['vence_hoje']);
      } else if (type === 'overdue') {
        // Para vencidas, usar filtro de override
        updateFilter('statusFilterMulti', ['a_iniciar', 'em_andamento', 'com_impedimentos']);
        updateFilter('overrideFilter', true);
      }
      navigate('/ocorrencias');
    }, 100);
  };

  const renderTimeRemaining = (occurrence: OccurrenceData) => {
    const sla = calculateSLA(occurrence);
    if (sla.isExpired) {
      return (
        <Badge variant="destructive" className="text-xs">
          <AlertCircle className="w-3 h-3 mr-1" />
          Vencido {Math.abs(sla.hoursRemaining)}h
        </Badge>
      );
    } else if (sla.isExpiringSoon) {
      return (
        <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-800 border-orange-200">
          <Timer className="w-3 h-3 mr-1" />
          {sla.hoursRemaining}h restantes
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline" className="text-xs">
          <Clock className="w-3 h-3 mr-1" />
          {sla.hoursRemaining}h para vencer
        </Badge>
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header aprimorado */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg">
            <TrendingUp className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Highlights Operacionais</h2>
            <p className="text-muted-foreground">Monitoramento em tempo real de ocorrências prioritárias</p>
          </div>
        </div>
      </div>

      {/* Grid de cards principal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Entraram Hoje */}
        <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-all duration-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-lg font-semibold">Entraram Hoje</span>
                  <p className="text-sm text-muted-foreground">Ocorrências criadas no dia atual</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-lg font-semibold px-3 py-1">
                  {highlights.counts.enteredToday}
                </Badge>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleViewAll('entered')} 
                  className="text-blue-600 hover:text-blue-700"
                >
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ScrollArea className="h-[240px] w-full">
              <div className="space-y-3 pr-3">
                {highlights.enteredToday.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 mx-auto text-muted-foreground/30 mb-2" />
                    <p className="text-sm text-muted-foreground">Nenhuma ocorrência registrada hoje</p>
                  </div>
                ) : (
                  highlights.enteredToday.map(occ => (
                    <div 
                      key={occ.id} 
                      className="flex items-center justify-between p-3 bg-muted/40 rounded-lg cursor-pointer hover:bg-muted/60 transition-colors border" 
                      onClick={() => onOccurrenceClick(occ)}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium">{occ.equipment}</span>
                          <StatusBadge status={occ.status} />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {occ.agency} • {format(new Date(occ.createdAt), 'HH:mm')}
                        </p>
                      </div>
                      <Badge variant={getSeverityVariant(occ.severity)} className="text-xs">
                        {getSeverityLabel(occ.severity)}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Vencem Hoje */}
        <Card className="border-l-4 border-l-orange-500 hover:shadow-lg transition-all duration-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-orange-100 text-orange-600">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-lg font-semibold">Vencem Hoje</span>
                  <p className="text-sm text-muted-foreground">Em andamento - SLA vence hoje</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-lg font-semibold px-3 py-1">
                  {highlights.counts.dueToday}
                </Badge>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleViewAll('due')} 
                  className="text-orange-600 hover:text-orange-700"
                >
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ScrollArea className="h-[240px] w-full">
              <div className="space-y-3 pr-3">
                {highlights.dueToday.length === 0 ? (
                  <div className="text-center py-8">
                    <Clock className="w-12 h-12 mx-auto text-muted-foreground/30 mb-2" />
                    <p className="text-sm text-muted-foreground">Nenhuma ocorrência vence hoje</p>
                  </div>
                ) : (
                  highlights.dueToday.map(occ => (
                    <div 
                      key={occ.id} 
                      className="flex items-center justify-between p-3 bg-muted/40 rounded-lg cursor-pointer hover:bg-muted/60 transition-colors border" 
                      onClick={() => onOccurrenceClick(occ)}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium">{occ.equipment}</span>
                          <StatusBadge status={occ.status} />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {occ.agency} • SLA vence hoje
                        </p>
                      </div>
                      {renderTimeRemaining(occ)}
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Ocorrências Vencidas */}
        <Card className="border-l-4 border-l-red-500 hover:shadow-lg transition-all duration-200 lg:col-span-2 xl:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-100 text-red-600">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-lg font-semibold">Ocorrências em Atraso</span>
                  <p className="text-sm text-muted-foreground">Não encerradas - SLA expirado</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="destructive" className="text-lg font-semibold px-3 py-1">
                  {highlights.counts.overdueOccurrences}
                </Badge>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleViewAll('overdue')} 
                  className="text-red-600 hover:text-red-700"
                >
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ScrollArea className="h-[240px] w-full">
              <div className="space-y-3 pr-3">
                {highlights.overdueOccurrences.length === 0 ? (
                  <div className="text-center py-8">
                    <AlertTriangle className="w-12 h-12 mx-auto text-muted-foreground/30 mb-2" />
                    <p className="text-sm text-muted-foreground">Nenhuma ocorrência vencida no momento</p>
                  </div>
                ) : (
                  highlights.overdueOccurrences.map(occ => {
                    const sla = calculateSLA(occ);
                    return (
                      <div 
                        key={occ.id} 
                        className="flex items-center justify-between p-3 bg-red-50/50 border border-red-100 rounded-lg cursor-pointer hover:bg-red-50 transition-colors" 
                        onClick={() => onOccurrenceClick(occ)}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium">{occ.equipment}</span>
                            <StatusBadge status={occ.status} />
                            <Badge variant={getSeverityVariant(occ.severity)} className="text-xs">
                              {getSeverityLabel(occ.severity)}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {occ.agency} • Criada em {format(new Date(occ.createdAt), 'dd/MM HH:mm')}
                          </p>
                        </div>
                        <div className="text-right">
                          {renderTimeRemaining(occ)}
                          <p className="text-xs text-muted-foreground mt-1">
                            SLA: {format(sla.endDate, 'dd/MM HH:mm')}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
