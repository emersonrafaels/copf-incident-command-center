import { useState, useEffect } from "react";
import { MetricCard } from "./MetricCard";
import { StatusBadge } from "./StatusBadge";
import { InteractiveCharts } from "./InteractiveCharts";
import { OccurrenceModal } from "./OccurrenceModal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle, CheckCircle2, Clock, TrendingUp, MapPin, Users, Calendar, Download, RefreshCw, Filter, CalendarDays } from "lucide-react";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { format } from "date-fns";
import { cn } from "@/lib/utils";
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
  const [customDateRange, setCustomDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [segmentFilter, setSegmentFilter] = useState<string>('all');
  const [equipmentFilter, setEquipmentFilter] = useState<string>('all');
  const [serialNumberFilter, setSerialNumberFilter] = useState<string>('');
  const [showAllOccurrences, setShowAllOccurrences] = useState<boolean>(false);
  const handleExport = async () => {
    toast({
      title: "Exportação iniciada",
      description: "Gerando PDF da dashboard..."
    });

    try {
      // Capturar a dashboard como imagem
      const dashboardElement = document.getElementById('dashboard-content');
      if (!dashboardElement) return;

      const canvas = await html2canvas(dashboardElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('l', 'mm', 'a4'); // landscape orientation
      
      const imgWidth = 297; // A4 width in mm (landscape)
      const pageHeight = 210; // A4 height in mm (landscape)
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      // Add title
      pdf.setFontSize(16);
      pdf.text('Dashboard COPF - ' + new Date().toLocaleDateString('pt-BR'), 20, 20);
      
      position = 30;
      
      pdf.addImage(imgData, 'PNG', 10, position, imgWidth - 20, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight + 30;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth - 20, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`dashboard-copf-${new Date().toISOString().split('T')[0]}.pdf`);
      
      toast({
        title: "Download concluído",
        description: "Dashboard exportada em PDF com sucesso!"
      });
    } catch (error) {
      toast({
        title: "Erro na exportação",
        description: "Não foi possível gerar o PDF. Tente novamente.",
        variant: "destructive"
      });
    }
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

  // Filtrar ocorrências
  const filteredOccurrences = occurrences.filter(occurrence => {
    if (segmentFilter !== 'all' && occurrence.segment !== segmentFilter) return false;
    if (equipmentFilter !== 'all' && occurrence.equipment !== equipmentFilter) return false;
    if (serialNumberFilter && !occurrence.serialNumber.toLowerCase().includes(serialNumberFilter.toLowerCase())) return false;
    return true;
  });

  // Mapeamento de equipamentos por segmento
  const equipmentsBySegment = {
    AA: ['ATM Saque', 'ATM Depósito', 'Cassete'],
    AB: ['Notebook', 'Desktop', 'Leitor de Cheques/documentos', 'Leitor biométrico', 'PIN PAD', 'Scanner de Cheque', 'Impressora', 'Impressora térmica', 'Impressora multifuncional', 'Monitor LCD/LED', 'Teclado', 'Servidor', 'Televisão', 'Senheiro', 'TCR', 'Classificadora', 'Fragmentadora de Papel']
  };

  // Obter equipamentos únicos baseado no segmento selecionado
  const getFilteredEquipments = () => {
    if (segmentFilter === 'all') {
      return Array.from(new Set(occurrences.map(o => o.equipment))).sort();
    } else {
      const segmentEquipments = equipmentsBySegment[segmentFilter as 'AA' | 'AB'] || [];
      return occurrences
        .filter(o => o.segment === segmentFilter && segmentEquipments.includes(o.equipment))
        .map(o => o.equipment)
        .filter((equipment, index, arr) => arr.indexOf(equipment) === index)
        .sort();
    }
  };

  const uniqueEquipments = getFilteredEquipments();

  // Resetar filtro de equipamento quando segmento mudar
  useEffect(() => {
    if (segmentFilter !== 'all') {
      setEquipmentFilter('all');
    }
  }, [segmentFilter]);
  return <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-responsive-3xl font-bold text-foreground">Ferramenta de Acompanhamento - COPF</h1>
          <p className="text-responsive-base text-muted-foreground">Itaú Unibanco | Gestão de Ocorrências
        </p>
        </div>
        <div className="flex flex-wrap gap-3">
          {/* Filtro de Período */}
          <Select value={filterPeriod} onValueChange={setFilterPeriod}>
            <SelectTrigger className="w-auto min-w-[180px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30-days">Últimos 30 dias</SelectItem>
              <SelectItem value="60-days">Últimos 60 dias</SelectItem>
              <SelectItem value="90-days">Últimos 90 dias</SelectItem>
              <SelectItem value="custom">Período personalizado</SelectItem>
            </SelectContent>
          </Select>

          {/* Seletor de data personalizado */}
          {filterPeriod === 'custom' && (
            <Popover open={showDatePicker} onOpenChange={setShowDatePicker}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    "w-auto justify-start text-left font-normal",
                    !customDateRange.from && "text-muted-foreground"
                  )}
                >
                  <CalendarDays className="h-4 w-4 mr-2" />
                  {customDateRange.from ? (
                    customDateRange.to ? (
                      <>
                        {format(customDateRange.from, "dd/MM/yyyy")} -{" "}
                        {format(customDateRange.to, "dd/MM/yyyy")}
                      </>
                    ) : (
                      format(customDateRange.from, "dd/MM/yyyy")
                    )
                  ) : (
                    <span>Selecionar período</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  initialFocus
                  mode="range"
                  defaultMonth={customDateRange.from}
                  selected={{
                    from: customDateRange.from,
                    to: customDateRange.to
                  }}
                  onSelect={(range) => {
                    setCustomDateRange(range || {});
                    if (range?.from && range?.to) {
                      setShowDatePicker(false);
                    }
                  }}
                  numberOfMonths={2}
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          )}

          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Button variant="corporate" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Exportar PDF
          </Button>
        </div>
      </div>

      {/* Dashboard Content Wrapper for PDF Export */}
      <div id="dashboard-content">

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
        </div> : <div className="responsive-grid responsive-grid-4 mb-6">
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
        </div> : <InteractiveCharts severityData={severityData} timelineData={timelineData} mttrData={mttrData} equipmentData={equipmentData} occurrences={occurrences} />}

      {/* Recent Occurrences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Ocorrências Recentes
            </div>
            <div className="flex gap-4 items-end">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-muted-foreground">Segmento</label>
                <Select value={segmentFilter} onValueChange={setSegmentFilter}>
                  <SelectTrigger className="w-24">
                    <SelectValue placeholder="Segmento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="AA">AA</SelectItem>
                    <SelectItem value="AB">AB</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-muted-foreground">Equipamento</label>
                <Select value={equipmentFilter} onValueChange={setEquipmentFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Equipamento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {uniqueEquipments.map(equipment => (
                      <SelectItem key={equipment} value={equipment}>{equipment}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-muted-foreground">Número de Série</label>
                <Input
                  type="text"
                  placeholder="Nº Série"
                  value={serialNumberFilter}
                  onChange={(e) => setSerialNumberFilter(e.target.value)}
                  className="w-32"
                />
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-start gap-6 p-5 border rounded-2xl animate-pulse bg-muted/20">
                  <div className="flex flex-col gap-3">
                    <Skeleton className="h-6 w-20 rounded-full" />
                    <Skeleton className="h-6 w-24 rounded-full" />
                  </div>
                  <div className="space-y-3 flex-1">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-4 w-56" />
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-64" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredOccurrences.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="rounded-full bg-muted/50 p-6 mb-6">
                <AlertTriangle className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Nenhuma ocorrência encontrada</h3>
              <p className="text-sm text-muted-foreground max-w-md leading-relaxed">
                Não há ocorrências que correspondam aos filtros aplicados. Tente ajustar os critérios de busca.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredOccurrences
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .slice(0, showAllOccurrences ? undefined : 5)
                .map((occurrence, index) => (
                  <div 
                    key={occurrence.id} 
                    className="group relative p-3 border rounded-lg hover:border-primary/30 hover:bg-accent/30 transition-all duration-200 cursor-pointer animate-fade-in"
                    style={{ animationDelay: `${index * 30}ms` }}
                    onClick={() => handleOccurrenceClick(occurrence)}
                  >
                    {/* Indicador de prioridade lateral */}
                    <div className={`absolute left-0 top-2 bottom-2 w-1 rounded-r-full ${
                      occurrence.severity === 'critical' ? 'bg-destructive' :
                      occurrence.severity === 'high' ? 'bg-warning' :
                      occurrence.severity === 'medium' ? 'bg-primary' : 'bg-muted-foreground'
                    }`} />
                    
                    {/* Conteúdo principal compacto */}
                    <div className="flex items-start gap-3 pl-2">
                      {/* Badges de status */}
                      <div className="flex flex-col gap-1">
                        <StatusBadge status={occurrence.severity} />
                        <StatusBadge status={occurrence.status} />
                      </div>
                      
                      {/* Informações principais */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-1">
                          <div>
                            <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors text-sm">
                              {occurrence.id}
                            </h4>
                            <p className="text-xs text-muted-foreground">{occurrence.agency}</p>
                          </div>
                          <div className="text-right flex-shrink-0 ml-3">
                            <div className="mb-1">
                              <span className="text-xs text-muted-foreground">Fornecedor:</span>
                              <p className="text-xs font-medium text-foreground">{occurrence.vendor}</p>
                            </div>
                            <div>
                              <span className="text-xs text-muted-foreground">Data da Ocorrência:</span>
                              <div className="text-xs font-medium text-foreground">
                                {new Date(occurrence.createdAt).toLocaleDateString('pt-BR')} {new Date(occurrence.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Equipamento em uma linha */}
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="secondary" className="text-xs px-2 py-0">
                            {occurrence.segment}
                          </Badge>
                          <span className="text-sm font-medium text-foreground">{occurrence.equipment}</span>
                          <span className="text-xs text-muted-foreground">
                            Série: <span className="font-mono">{occurrence.serialNumber}</span>
                          </span>
                        </div>
                        
                        {/* Descrição compacta */}
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {occurrence.description}
                        </p>
                      </div>
                      
                      {/* Indicador de clique pequeno */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
          
          {/* Botão para ver mais */}
          {filteredOccurrences.length > 0 && (
            <div className="mt-4 pt-3 border-t">
              <Button 
                variant="outline" 
                className="w-full group hover:bg-primary hover:text-primary-foreground transition-all duration-200"
                onClick={() => setShowAllOccurrences(!showAllOccurrences)}
              >
                <span className="mr-2 text-sm">
                  {showAllOccurrences 
                    ? `Mostrar Apenas Recentes (${Math.min(5, filteredOccurrences.length)} de ${filteredOccurrences.length})`
                    : `Ver Todas as Ocorrências (${filteredOccurrences.length} de ${occurrences.length})`
                  }
                </span>
                <svg 
                  className={`w-4 h-4 transition-transform duration-200 ${showAllOccurrences ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Detalhes */}
      <OccurrenceModal occurrence={selectedOccurrence} open={modalOpen} onOpenChange={setModalOpen} mode="view" onAssign={id => {
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
      </div>
    </div>;
}