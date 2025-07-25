import { useState, useEffect, useMemo } from "react";
import { MetricCard } from "./MetricCard";
import { StatusBadge } from "./StatusBadge";
import { LongTailChart } from "./LongTailChart";
import { OccurrenceModal } from "./OccurrenceModal";
import { CriticalityHeatmap } from "./CriticalityHeatmap";
import { FilterSection } from "./FilterSection";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Check } from "lucide-react";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useToast } from "@/hooks/use-toast";
import { useFilters } from "@/contexts/FiltersContext";
import { AlertTriangle, CheckCircle2, Clock, TrendingUp, MapPin, Users, Calendar, Download, RefreshCw, Filter, CalendarDays, Truck } from "lucide-react";
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
  const { toast } = useToast();
  const [selectedOccurrence, setSelectedOccurrence] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [filterPeriod, setFilterPeriod] = useState('30-days');
  const [customDateRange, setCustomDateRange] = useState<{
    from?: Date;
    to?: Date;
  }>({});
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [occurrenceFilter, setOccurrenceFilter] = useState('all'); // all, today, slaToday

  // Usar filtros do contexto
  const filters = useFilters();
  const {
    agenciaFilter,
    ufFilter,
    tipoAgenciaFilter,
    pontoVipFilter,
    segmentFilterMulti,
    equipmentFilterMulti,
    statusFilterMulti,
    vendorFilterMulti,
    transportadoraFilterMulti,
    serialNumberFilter,
    overrideFilter,
    vendorPriorityFilter,
    hasActiveFilters
  } = filters;
  const handleExport = async () => {
    toast({
      title: "Exportação iniciada",
      description: "Gerando PDF da dashboard..."
    });
    try {
      const dashboardElement = document.getElementById('dashboard-content');
      if (!dashboardElement) return;
      const canvas = await html2canvas(dashboardElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('l', 'mm', 'a4');
      const imgWidth = 297;
      const pageHeight = 210;
      const imgHeight = canvas.height * imgWidth / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;
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

  // Filtrar ocorrências - Memoizado para performance
  const filteredOccurrences = useMemo(() => {
    let filtered = occurrences.filter(occurrence => {
    // Filtros multiselect
    if (segmentFilterMulti.length > 0 && !segmentFilterMulti.includes(occurrence.segment)) return false;
    if (equipmentFilterMulti.length > 0 && !equipmentFilterMulti.includes(occurrence.equipment)) return false;
    if (statusFilterMulti.length > 0 && !statusFilterMulti.includes(occurrence.status)) return false;
    if (vendorFilterMulti.length > 0 && !vendorFilterMulti.includes(occurrence.vendor)) return false;
    if (transportadoraFilterMulti.length > 0) {
      const transportadora = occurrence.vendor.includes('Express') ? 'Express Logística' : 
                           occurrence.vendor.includes('Tech') ? 'TechTransporte' : 'LogiCorp';
      if (!transportadoraFilterMulti.includes(transportadora)) return false;
    }

    // Filtro de série
    if (serialNumberFilter && !occurrence.serialNumber.toLowerCase().includes(serialNumberFilter.toLowerCase())) return false;

    // Filtro de agência por número
    if (agenciaFilter.length > 0) {
      const agencyNumber = occurrence.agency.match(/\d+/)?.[0] || '';
      if (!agenciaFilter.includes(agencyNumber)) return false;
    }

    // Filtro de UF
    if (ufFilter.length > 0) {
      const agencyUF = occurrence.agency.split(' - ')[1] || 'SP';
      if (!ufFilter.includes(agencyUF)) return false;
    }

    // Simular tipo de agência baseado na agência
    const tipoAgencia = occurrence.agency.includes('Terceirizada') ? 'terceirizada' : 'convencional';
    if (tipoAgenciaFilter.length > 0 && !tipoAgenciaFilter.includes(tipoAgencia)) return false;

    // Simular ponto VIP (agências com número terminado em 0, 5 são VIP)
    const agencyNumber = occurrence.agency.match(/\d+/)?.[0] || '0';
    const isVip = agencyNumber.endsWith('0') || agencyNumber.endsWith('5');
    const pontoVipStatus = isVip ? 'sim' : 'nao';
    if (pontoVipFilter.length > 0 && !pontoVipFilter.includes(pontoVipStatus)) return false;

    // Filtro de ocorrências vencidas
    if (overrideFilter) {
      const createdDate = new Date(occurrence.createdAt);
      const hoursDiff = (Date.now() - createdDate.getTime()) / (1000 * 60 * 60);
      const slaLimit = occurrence.severity === 'critical' || occurrence.severity === 'high' ? 24 : 72;
      const isOverdue = hoursDiff > slaLimit && occurrence.status !== 'encerrada';
      if (!isOverdue) return false;
    }

    // Filtro de priorizadas com fornecedor
    if (vendorPriorityFilter) {
      const isHighPriority = occurrence.severity === 'critical' || occurrence.severity === 'high';
      if (!isHighPriority) return false;
    }

    return true;
    });

    // Aplicar filtros específicos da tabela de ocorrências
    if (occurrenceFilter === 'today') {
      const today = new Date().toDateString();
      filtered = filtered.filter(occ => 
        new Date(occ.createdAt).toDateString() === today
      );
    } else if (occurrenceFilter === 'slaToday') {
      const today = new Date();
      filtered = filtered.filter(occ => {
        const createdDate = new Date(occ.createdAt);
        const hoursDiff = (Date.now() - createdDate.getTime()) / (1000 * 60 * 60);
        const slaLimit = occ.severity === 'critical' || occ.severity === 'high' ? 24 : 72;
        const slaExpiryDate = new Date(createdDate.getTime() + (slaLimit * 60 * 60 * 1000));
        return slaExpiryDate.toDateString() === today.toDateString() && occ.status !== 'encerrada';
      });
    }

    return filtered;
  }, [occurrences, segmentFilterMulti, equipmentFilterMulti, statusFilterMulti, vendorFilterMulti, transportadoraFilterMulti, serialNumberFilter, agenciaFilter, ufFilter, tipoAgenciaFilter, pontoVipFilter, overrideFilter, vendorPriorityFilter, occurrenceFilter]);

  // Mapeamento de equipamentos por segmento
  const equipmentsBySegment = {
    AA: ['ATM Saque', 'ATM Depósito', 'Cassete'],
    AB: ['Notebook', 'Desktop', 'Leitor de Cheques/documentos', 'Leitor biométrico', 'PIN PAD', 'Scanner de Cheque', 'Impressora', 'Impressora térmica', 'Impressora multifuncional', 'Monitor LCD/LED', 'Teclado', 'Servidor', 'Televisão', 'Senheiro', 'TCR', 'Classificadora', 'Fragmentadora de Papel']
  };

  // Obter equipamentos únicos baseado no segmento selecionado
  const getFilteredEquipments = () => {
    if (segmentFilterMulti.length === 0) {
      return Array.from(new Set(occurrences.map(o => o.equipment))).sort();
    } else {
      const segmentEquipments = segmentFilterMulti.flatMap(segment => equipmentsBySegment[segment as 'AA' | 'AB'] || []);
      return Array.from(new Set(segmentEquipments)).sort();
    }
  };
  const uniqueEquipments = getFilteredEquipments();
  const uniqueVendors = Array.from(new Set(occurrences.map(o => o.vendor))).sort();

  // Dados de transportadoras e seus fornecedores
  const transportadoraFornecedores = {
    'Express Logística': ['Fornecedor A', 'Fornecedor B', 'Fornecedor C'],
    'TechTransporte': ['Fornecedor D', 'Fornecedor E'],
    'LogiCorp': ['Fornecedor F', 'Fornecedor G', 'Fornecedor H']
  };
  const uniqueTransportadoras = Object.keys(transportadoraFornecedores);

  // Filtrar fornecedores baseado na transportadora selecionada
  const getFilteredVendors = () => {
    if (!tipoAgenciaFilter.includes('terceirizada')) return uniqueVendors;
    if (transportadoraFilterMulti.length === 0) return uniqueVendors;
    const filteredVendors = transportadoraFilterMulti.flatMap(t => transportadoraFornecedores[t] || []);
    return filteredVendors.length > 0 ? filteredVendors : uniqueVendors;
  };
  const availableVendors = getFilteredVendors();

  // Gerar agências únicas baseadas nas ocorrências
  const uniqueAgencies = Array.from(new Set(occurrences.map(o => o.agency.match(/\d+/)?.[0] || ''))).filter(Boolean).sort();

  // Estados brasileiros
  const estadosBrasil = ['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'];

  // Filtrar UFs baseadas nas agências selecionadas
  const availableUFs = agenciaFilter.length === 0 ? estadosBrasil : Array.from(new Set(agenciaFilter.map(agencyNumber => {
    // Lógica simplificada: agências 0-999 = SP, 1000-1999 = RJ, etc.
    const num = parseInt(agencyNumber);
    if (num <= 999) return 'SP';
    if (num <= 1999) return 'RJ';
    if (num <= 2999) return 'MG';
    if (num <= 3999) return 'RS';
    return 'PR';
  })));

  // Verificar tipo de agência atual (para mostrar filtros condicionais)
  const tipoAgenciaAtual = tipoAgenciaFilter.includes('terceirizada') ? 'terceirizada' : tipoAgenciaFilter.includes('convencional') ? 'convencional' : 'all';

  return <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-responsive-3xl font-bold text-foreground">Ferramenta de Acompanhamento - COPF</h1>
          <p className="text-responsive-base text-muted-foreground">
            Itaú Unibanco | {hasActiveFilters ? 'Visão Filtrada' : 'Visão Geral do Parque'}
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
          {filterPeriod === 'custom' && <Popover open={showDatePicker} onOpenChange={setShowDatePicker}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className={cn("w-auto justify-start text-left font-normal", !customDateRange.from && "text-muted-foreground")}>
                  <CalendarDays className="h-4 w-4 mr-2" />
                  {customDateRange.from ? customDateRange.to ? <>
                        {format(customDateRange.from, "dd/MM/yyyy")} -{" "}
                        {format(customDateRange.to, "dd/MM/yyyy")}
                      </> : format(customDateRange.from, "dd/MM/yyyy") : <span>Selecionar período</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent initialFocus mode="range" defaultMonth={customDateRange.from} selected={{
              from: customDateRange.from,
              to: customDateRange.to
            }} onSelect={range => {
              setCustomDateRange(range || {});
              if (range?.from && range?.to) {
                setShowDatePicker(false);
              }
            }} numberOfMonths={2} className="pointer-events-auto" />
              </PopoverContent>
            </Popover>}

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

      {/* Filtros */}
      <FilterSection />

      {/* Métricas principais */}
      <div className="responsive-grid responsive-grid-4">
        <MetricCard
          title="Total de Ocorrências"
          value={filteredOccurrences.length.toString()}
          icon={<AlertTriangle className="h-4 w-4" />}
          change={`+${Math.round((filteredOccurrences.length / occurrences.length) * 100)}% do total`}
          changeType="neutral"
        />
        <MetricCard
          title="Ocorrências Críticas"
          value={filteredOccurrences.filter(o => o.severity === 'critical').length.toString()}
          icon={<CheckCircle2 className="h-4 w-4" />}
          change={`${Math.round((filteredOccurrences.filter(o => o.severity === 'critical').length / filteredOccurrences.length) * 100)}% do filtrado`}
          changeType="negative"
        />
        <MetricCard
          title="Em Andamento"
          value={filteredOccurrences.filter(o => o.status === 'a_iniciar' || o.status === 'em_atuacao').length.toString()}
          icon={<Clock className="h-4 w-4" />}
          change={`${Math.round((filteredOccurrences.filter(o => o.status === 'a_iniciar' || o.status === 'em_atuacao').length / filteredOccurrences.length) * 100)}% do filtrado`}
          changeType="neutral"
        />
        <MetricCard
          title="Resolvidas"
          value={filteredOccurrences.filter(o => o.status === 'encerrada').length.toString()}
          icon={<TrendingUp className="h-4 w-4" />}
          change={`${Math.round((filteredOccurrences.filter(o => o.status === 'encerrada').length / filteredOccurrences.length) * 100)}% do filtrado`}
          changeType="positive"
        />
      </div>

      {/* Long Tail Analysis */}
      <LongTailChart occurrences={filteredOccurrences} />

      {/* Mapa de Criticidade */}
      <div className="space-y-6">
        <h2 className="text-responsive-2xl font-bold text-foreground">Mapa de Criticidade por Equipamento</h2>
        <CriticalityHeatmap occurrences={filteredOccurrences} />
      </div>


      {/* Lista de Ocorrências Recentes */}
      <Card className="animate-fade-in">
        <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <MapPin className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Ocorrências Recentes</h3>
              <p className="text-sm text-muted-foreground">
                {filteredOccurrences.length} ocorrência{filteredOccurrences.length !== 1 ? 's' : ''} encontrada{filteredOccurrences.length !== 1 ? 's' : ''}
              </p>
            </div>
          </CardTitle>
          <div className="flex gap-2">
            <Select value={occurrenceFilter} onValueChange={setOccurrenceFilter}>
              <SelectTrigger className="w-auto min-w-[200px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as ocorrências</SelectItem>
                <SelectItem value="today">Entraram hoje</SelectItem>
                <SelectItem value="slaToday">SLA vence hoje</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4 p-4 border border-border/50 rounded-lg">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredOccurrences.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Nenhuma ocorrência encontrada</h3>
              <p className="text-muted-foreground mb-4">
                {hasActiveFilters 
                  ? "Tente ajustar os filtros para encontrar mais ocorrências" 
                  : "Não há ocorrências registradas no momento"}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredOccurrences.slice(0, 10).map((occurrence) => (
                <div
                  key={occurrence.id}
                  className="group flex items-center justify-between p-4 border border-border/50 rounded-lg hover:bg-accent/5 hover:border-primary/30 transition-all duration-200 cursor-pointer"
                  onClick={() => handleOccurrenceClick(occurrence)}
                >
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="relative">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        occurrence.severity === 'critical' ? 'bg-destructive/10' :
                        occurrence.severity === 'high' ? 'bg-warning/10' :
                        occurrence.severity === 'medium' ? 'bg-primary/10' : 'bg-muted'
                      }`}>
                        <AlertTriangle className={`h-6 w-6 ${
                          occurrence.severity === 'critical' ? 'text-destructive' :
                          occurrence.severity === 'high' ? 'text-warning' :
                          occurrence.severity === 'medium' ? 'text-primary' : 'text-muted-foreground'
                        }`} />
                      </div>
                       <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-background ${
                        occurrence.status === 'encerrada' ? 'bg-success' :
                        occurrence.status === 'em_atuacao' ? 'bg-warning' :
                        occurrence.status === 'a_iniciar' ? 'bg-muted' : 'bg-destructive'
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-medium text-foreground group-hover:text-primary transition-colors">
                          {occurrence.id}
                        </span>
                        <StatusBadge status={occurrence.status} />
                        <Badge 
                          variant={
                            occurrence.severity === 'critical' ? 'destructive' :
                            occurrence.severity === 'high' ? 'default' :
                            occurrence.severity === 'medium' ? 'secondary' : 'outline'
                          }
                          className="text-xs px-2 py-0.5"
                        >
                          {occurrence.severity === 'critical' ? 'Crítica' :
                           occurrence.severity === 'high' ? 'Alta' :
                           occurrence.severity === 'medium' ? 'Média' : 'Baixa'}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground mb-1">
                        <span className="font-medium">{occurrence.agency}</span> - {occurrence.equipment}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {occurrence.description.length > 80 
                          ? `${occurrence.description.substring(0, 80)}...` 
                          : occurrence.description}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 ml-4">
                    <div className="text-right">
                      <div className="text-sm font-medium text-foreground">
                        {occurrence.vendor}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(occurrence.createdAt).toLocaleString('pt-BR')}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOccurrenceClick(occurrence);
                      }}
                    >
                      Ver detalhes
                    </Button>
                  </div>
                </div>
              ))}
              {filteredOccurrences.length > 10 && (
                <div className="text-center pt-4">
                  <p className="text-sm text-muted-foreground">
                    Mostrando 10 de {filteredOccurrences.length} ocorrências.
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

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
            <MetricCard title="Agências Afetadas" value={20} change="2 novas esta semana" changeType="neutral" icon={<MapPin className="h-5 w-5" />} description="De 2360 totais" />
          </div>}

      </div>

      {/* Occurrence Details Modal */}
      <OccurrenceModal open={modalOpen} onOpenChange={setModalOpen} occurrence={selectedOccurrence} mode="view" />
    </div>;
}