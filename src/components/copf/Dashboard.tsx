import { useState } from "react";
import { MetricCard } from "./MetricCard";
import { StatusBadge } from "./StatusBadge";
import { InteractiveCharts } from "./InteractiveCharts";
import { OccurrenceModal } from "./OccurrenceModal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle, CheckCircle2, Clock, TrendingUp, MapPin, Users, Calendar, Download, RefreshCw, Filter } from "lucide-react";
export function Dashboard() {
  const {
    occurrences,
    isLoading,
    severityData,
    timelineData,
    mttrData,
    equipmentData,
    metrics,
    refreshData
  } = useDashboardData();
  const {
    toast
  } = useToast();
  const [selectedOccurrence, setSelectedOccurrence] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [filterPeriod, setFilterPeriod] = useState('30-days');
  const handleExport = () => {
    toast({
      title: "Exportação iniciada",
      description: "Os dados estão sendo preparados para download..."
    });

    // Simular exportação
    setTimeout(() => {
      toast({
        title: "Download concluído",
        description: "Relatório COPF exportado com sucesso!"
      });
    }, 2000);
  };
  const handleOccurrenceClick = (occurrence: any) => {
    setSelectedOccurrence(occurrence);
    setModalOpen(true);
  };
  const handleRefresh = () => {
    refreshData();
    toast({
      title: "Dados atualizados",
      description: "Dashboard atualizado com as informações mais recentes."
    });
  };
  return <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-responsive-3xl font-bold text-foreground">Ferramenta de Acompanhamento - COPF</h1>
          <p className="text-responsive-base text-muted-foreground">Itaú Unibanco | Gestão de Ocorrências
        </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => setFilterPeriod(filterPeriod === '30-days' ? '90-days' : '30-days')}>
            <Calendar className="h-4 w-4 mr-2" />
            {filterPeriod === '30-days' ? 'Últimos 30 dias' : 'Últimos 90 dias'}
          </Button>
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Button variant="corporate" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      {isLoading ? <div className="responsive-grid responsive-grid-4">
          {Array.from({
        length: 4
      }).map((_, i) => <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-20 mb-2" />
                <Skeleton className="h-3 w-28" />
              </CardContent>
            </Card>)}
        </div> : <div className="responsive-grid responsive-grid-4">
          <MetricCard title="Total de Ocorrências" value={metrics.totalOccurrences} change="+12% vs mês anterior" changeType="negative" icon={<AlertTriangle className="h-5 w-5" />} description={`${filterPeriod === '30-days' ? 'Últimos 30 dias' : 'Últimos 90 dias'}`} />
          <MetricCard title="Ocorrências Resolvidas" value={metrics.resolvedOccurrences} change="+8% vs mês anterior" changeType="positive" icon={<CheckCircle2 className="h-5 w-5" />} description={`${metrics.resolutionRate}% taxa de resolução`} />
          <MetricCard title="MTTR Médio" value={metrics.avgMTTR} change="-15min vs mês anterior" changeType="positive" icon={<Clock className="h-5 w-5" />} description="Tempo médio de resolução" />
          <MetricCard title="Agências Afetadas" value={metrics.affectedAgencies} change="2 novas esta semana" changeType="neutral" icon={<MapPin className="h-5 w-5" />} description="De 234 totais" />
        </div>}

      {/* Interactive Charts */}
      {isLoading ? <div className="responsive-grid responsive-grid-2">
          {Array.from({
        length: 4
      }).map((_, i) => <Card key={i} className="animate-pulse">
              <CardHeader>
                <Skeleton className="h-6 w-40" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-[300px] w-full" />
              </CardContent>
            </Card>)}
        </div> : <InteractiveCharts severityData={severityData} timelineData={timelineData} mttrData={mttrData} equipmentData={equipmentData} />}

      {/* Recent Occurrences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Ocorrências Recentes
            </div>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? <div className="space-y-4">
              {Array.from({
            length: 3
          }).map((_, i) => <div key={i} className="flex items-center gap-4 p-4 border rounded-lg animate-pulse">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                    <Skeleton className="h-3 w-40" />
                  </div>
                </div>)}
            </div> : <div className="space-y-4">
              {occurrences.slice(0, 5).map(occurrence => <div key={occurrence.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer group" onClick={() => handleOccurrenceClick(occurrence)}>
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col gap-1">
                      <StatusBadge status={occurrence.severity} />
                      <StatusBadge status={occurrence.status} />
                    </div>
                    <div>
                      <p className="font-medium text-foreground group-hover:text-primary">
                        {occurrence.id}
                      </p>
                      <p className="text-sm text-muted-foreground">{occurrence.agency}</p>
                      <p className="text-sm">{occurrence.equipment}</p>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {occurrence.description}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{occurrence.assignedTo}</p>
                    <p className="text-xs text-muted-foreground">{occurrence.vendor}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(occurrence.createdAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>)}
            </div>}
          <div className="mt-4 pt-4 border-t">
            <Button variant="outline" className="w-full">
              Ver Todas as Ocorrências ({occurrences.length})
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Modal de Detalhes */}
      <OccurrenceModal occurrence={selectedOccurrence} open={modalOpen} onOpenChange={setModalOpen} onAssign={id => {
      toast({
        title: "Ocorrência reatribuída",
        description: `Ocorrência ${id} foi reatribuída com sucesso.`
      });
      setModalOpen(false);
    }} onComment={id => {
      toast({
        title: "Comentário adicionado",
        description: `Comentário adicionado à ocorrência ${id}.`
      });
      setModalOpen(false);
    }} />
    </div>;
}