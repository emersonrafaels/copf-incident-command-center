import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from './StatusBadge';
import { Clock, AlertTriangle, TrendingUp, ArrowRight, Calendar, Timer, AlertCircle } from 'lucide-react';
import { OccurrenceData } from '@/hooks/useDashboardData';
import { useFilters } from '@/contexts/FiltersContext';
import { format, differenceInHours, isToday, startOfDay, endOfDay } from 'date-fns';
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
    const todayStart = startOfDay(today);
    const todayEnd = endOfDay(today);

    // Ocorrências que entraram hoje
    const enteredToday = occurrences.filter(occ => {
      const createdDate = new Date(occ.createdAt);
      return createdDate >= todayStart && createdDate <= todayEnd;
    }).slice(0, 3); // Limitar a 3 cards

    // Ocorrências que vencem hoje
    const dueToday = occurrences.filter(occ => {
      if (occ.status === 'encerrada') return false;
      const sla = calculateSLA(occ);
      return isToday(sla.endDate);
    }).slice(0, 3); // Limitar a 3 cards

    // Ocorrências críticas vencendo (próximas 4 horas ou vencidas)
    const criticalDue = occurrences.filter(occ => {
      if (occ.status === 'encerrada') return false;
      if (occ.severity !== 'critical' && occ.severity !== 'high') return false;
      const sla = calculateSLA(occ);
      return sla.hoursRemaining <= 4; // Vence em 4h ou já venceu
    }).sort((a, b) => {
      const slaA = calculateSLA(a);
      const slaB = calculateSLA(b);
      return slaA.hoursRemaining - slaB.hoursRemaining;
    }).slice(0, 5); // Mostrar até 5 mais urgentes

    return {
      enteredToday,
      dueToday,
      criticalDue
    };
  }, [occurrences]);
  const handleViewAll = (type: 'entered' | 'due' | 'critical') => {
    clearAllFilters();
    setTimeout(() => {
      if (type === 'entered') {
        // Filtrar por data de criação = hoje
        navigate('/ocorrencias');
      } else if (type === 'due') {
        // Filtrar por status não resolvido
        updateFilter('statusFilterMulti', ['a_iniciar', 'em_atuacao']);
        navigate('/ocorrencias');
      } else if (type === 'critical') {
        // Filtrar por severidade crítica/alta e status não resolvido
        updateFilter('statusFilterMulti', ['a_iniciar', 'em_atuacao']);
        navigate('/ocorrencias');
      }
    }, 100);
  };
  const renderTimeRemaining = (occurrence: OccurrenceData) => {
    const sla = calculateSLA(occurrence);
    if (sla.isExpired) {
      return <Badge variant="destructive" className="text-xs">
          <AlertCircle className="w-3 h-3 mr-1" />
          Vencido {Math.abs(sla.hoursRemaining)}h
        </Badge>;
    } else if (sla.isExpiringSoon) {
      return <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-800 border-orange-200">
          <Timer className="w-3 h-3 mr-1" />
          {sla.hoursRemaining}h restantes
        </Badge>;
    } else {
      return <Badge variant="outline" className="text-xs">
          <Clock className="w-3 h-3 mr-1" />
          {sla.hoursRemaining}h para vencer
        </Badge>;
    }
  };
  return <div className="space-y-8">
      {/* Header moderno */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-primary">
            <TrendingUp className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">Highlights Operacionais</h2>
            <p className="text-sm text-muted-foreground">Visão em tempo real das ocorrências prioritárias</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/30 px-3 py-1 rounded-full">
          <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
          Atualizado agora
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Entraram Hoje */}
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                  <Calendar className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-base font-semibold">Entraram Hoje</span>
                  <Badge variant="secondary" className="ml-2">
                    {highlights.enteredToday.length}
                  </Badge>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => handleViewAll('entered')} className="text-blue-600 hover:text-blue-700">
                Ver todas
                <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {highlights.enteredToday.length === 0 ? <p className="text-sm text-muted-foreground py-4 text-center">
                Nenhuma ocorrência registrada hoje
              </p> : highlights.enteredToday.map(occ => <div key={occ.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => onOccurrenceClick(occ)}>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium">{occ.equipment}</span>
                      <StatusBadge status={occ.status} />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {occ.agency} • {format(new Date(occ.createdAt), 'HH:mm')}
                    </p>
                  </div>
                  <Badge variant={occ.severity === 'critical' ? 'destructive' : occ.severity === 'high' ? 'secondary' : 'outline'} className="text-xs">
                    {occ.severity}
                  </Badge>
                </div>)}
          </CardContent>
        </Card>

        {/* Vencem Hoje */}
        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-orange-100 text-orange-600">
                  <Clock className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-base font-semibold">Vencem Hoje</span>
                  <Badge variant="secondary" className="ml-2">
                    {highlights.dueToday.length}
                  </Badge>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => handleViewAll('due')} className="text-orange-600 hover:text-orange-700">
                Ver todas
                <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {highlights.dueToday.length === 0 ? <p className="text-sm text-muted-foreground py-4 text-center">
                Nenhuma ocorrência vence hoje
              </p> : highlights.dueToday.map(occ => <div key={occ.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => onOccurrenceClick(occ)}>
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
                </div>)}
          </CardContent>
        </Card>
      </div>

      {/* Críticas Vencendo - Linha completa */}
      <Card className="border-l-4 border-l-red-500">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-red-100 text-red-600">
                <AlertTriangle className="h-4 w-4" />
              </div>
              <div>
                <span className="text-base font-semibold">Críticas Vencidas</span>
                <Badge variant="destructive" className="ml-2">
                  {highlights.criticalDue.length}
                </Badge>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => handleViewAll('critical')} className="text-red-600 hover:text-red-700">
              Ver todas
              <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {highlights.criticalDue.length === 0 ? <p className="text-sm text-muted-foreground py-4 text-center">
              Nenhuma ocorrência crítica próxima do vencimento
            </p> : <div className="space-y-3">
              {highlights.criticalDue.map(occ => {
            const sla = calculateSLA(occ);
            return <div key={occ.id} className="flex items-center justify-between p-3 bg-red-50/50 border border-red-100 rounded-lg cursor-pointer hover:bg-red-50 transition-colors" onClick={() => onOccurrenceClick(occ)}>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium">{occ.equipment}</span>
                        <StatusBadge status={occ.status} />
                        <Badge variant="destructive" className="text-xs">
                          {occ.severity}
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
                  </div>;
          })}
            </div>}
        </CardContent>
      </Card>
    </div>;
}