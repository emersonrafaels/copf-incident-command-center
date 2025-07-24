import { useState, useEffect } from "react";
import { MetricCard } from "./MetricCard";
import { StatusBadge } from "./StatusBadge";
import { InteractiveCharts } from "./InteractiveCharts";
import { OccurrenceModal } from "./OccurrenceModal";
import { CriticalityHeatmap } from "./CriticalityHeatmap";
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
import { useDashboardData } from "@/hooks/useDashboardData";
import { useToast } from "@/hooks/use-toast";
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
  const [customDateRange, setCustomDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [segmentFilter, setSegmentFilter] = useState<string>('all');
  const [equipmentFilter, setEquipmentFilter] = useState<string>('all');
  const [serialNumberFilter, setSerialNumberFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [overrideFilter, setOverrideFilter] = useState<boolean>(false);
  const [vendorFilter, setVendorFilter] = useState<string>('all');
  const [transportadoraFilter, setTransportadoraFilter] = useState<string>('all');
  const [agenciaFilter, setAgenciaFilter] = useState<string[]>([]);
  const [ufFilter, setUfFilter] = useState<string[]>([]);
  const [tipoAgenciaFilter, setTipoAgenciaFilter] = useState<string>('all');
  const [pontoVipFilter, setPontoVipFilter] = useState<string>('all');

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
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
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

  // Filtrar ocorrências
  const filteredOccurrences = occurrences.filter(occurrence => {
    if (segmentFilter !== 'all' && occurrence.segment !== segmentFilter) return false;
    if (equipmentFilter !== 'all' && occurrence.equipment !== equipmentFilter) return false;
    if (serialNumberFilter && !occurrence.serialNumber.toLowerCase().includes(serialNumberFilter.toLowerCase())) return false;
    if (statusFilter !== 'all' && occurrence.status !== statusFilter) return false;
    if (vendorFilter !== 'all' && occurrence.vendor !== vendorFilter) return false;
    
    // Filtro de agência por número
    if (agenciaFilter.length > 0) {
      const agencyNumber = occurrence.agency.match(/\d+/)?.[0] || '';
      if (!agenciaFilter.includes(agencyNumber)) return false;
    }
    
    // Filtro de UF
    if (ufFilter.length > 0) {
      const agencyUF = occurrence.agency.split(' - ')[1] || 'SP'; // Simular UF baseado na agência
      if (!ufFilter.includes(agencyUF)) return false;
    }
    
    // Simular tipo de agência baseado na agência
    const tipoAgencia = occurrence.agency.includes('Terceirizada') ? 'terceirizada' : 'convencional';
    if (tipoAgenciaFilter !== 'all' && tipoAgencia !== tipoAgenciaFilter) return false;
    
    // Simular ponto VIP (agências com número terminado em 0, 5 são VIP)
    const agencyNumber = occurrence.agency.match(/\d+/)?.[0] || '0';
    const isVip = agencyNumber.endsWith('0') || agencyNumber.endsWith('5');
    if (pontoVipFilter !== 'all') {
      const expectedVip = pontoVipFilter === 'sim';
      if (isVip !== expectedVip) return false;
    }
    
    // Filtro de transportadora apenas para terceirizadas
    if (transportadoraFilter !== 'all' && tipoAgencia === 'terceirizada') {
      const transportadora = occurrence.vendor.includes('Express') ? 'Express Logística' : 
                           occurrence.vendor.includes('Tech') ? 'TechTransporte' : 'LogiCorp';
      if (transportadora !== transportadoraFilter) return false;
    }
    
    // Filtro de ocorrências vencidas
    if (overrideFilter) {
      const createdDate = new Date(occurrence.createdAt);
      const hoursDiff = (Date.now() - createdDate.getTime()) / (1000 * 60 * 60);
      const slaLimit = (occurrence.severity === 'critical' || occurrence.severity === 'high') ? 24 : 72;
      const isOverdue = hoursDiff > slaLimit && occurrence.status !== 'resolved';
      if (!isOverdue) return false;
    }
    
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
  const uniqueVendors = Array.from(new Set(occurrences.map(o => o.vendor))).sort();
  const uniqueTransportadoras = ['Express Logística', 'TechTransporte', 'LogiCorp'];
  
  // Estados brasileiros
  const estadosBrasil = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 
    'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 
    'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ];

  // Verificar tipo de agência atual (para mostrar filtros condicionais)
  const tipoAgenciaAtual = tipoAgenciaFilter === 'terceirizada' ? 'terceirizada' : 
                           tipoAgenciaFilter === 'convencional' ? 'convencional' : 'all';

  // Resetar filtro de equipamento quando segmento mudar
  useEffect(() => {
    if (segmentFilter !== 'all') {
      setEquipmentFilter('all');
    }
  }, [segmentFilter]);

  // Verificar se há filtros ativos
  const hasActiveFilters = segmentFilter !== 'all' || equipmentFilter !== 'all' || 
    serialNumberFilter || statusFilter !== 'all' || overrideFilter || 
    vendorFilter !== 'all' || transportadoraFilter !== 'all' || agenciaFilter ||
    ufFilter.length > 0 || tipoAgenciaFilter !== 'all' || pontoVipFilter !== 'all';

  // Limpar todos os filtros
  const clearAllFilters = () => {
    setSegmentFilter('all');
    setEquipmentFilter('all');
    setSerialNumberFilter('');
    setStatusFilter('all');
    setOverrideFilter(false);
    setVendorFilter('all');
    setTransportadoraFilter('all');
    setAgenciaFilter('');
    setUfFilter([]);
    setTipoAgenciaFilter('all');
    setPontoVipFilter('all');
  };

  return (
    <div className="space-y-8">
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

      {/* Filtros */}
      <Card className="animate-fade-in">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-2">
                  {filteredOccurrences.length} ocorrências filtradas
                </Badge>
              )}
            </div>
            {hasActiveFilters && (
              <Button variant="outline" size="sm" onClick={clearAllFilters}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Limpar Filtros
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Filtros de Localização */}
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-3">Localização</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex flex-col gap-2">
                  <Label className="text-sm font-medium text-muted-foreground">Agência</Label>
                  <Input
                    type="text"
                    placeholder="0 a 9999"
                    value={agenciaFilter}
                    onChange={(e) => setAgenciaFilter(e.target.value)}
                    className="h-9"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label className="text-sm font-medium text-muted-foreground">UF</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full h-9 justify-between"
                      >
                        {ufFilter.length > 0 
                          ? `${ufFilter.length} estado${ufFilter.length > 1 ? 's' : ''} selecionado${ufFilter.length > 1 ? 's' : ''}`
                          : "Todos os estados"
                        }
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-60 p-0 bg-background border border-border z-50" align="start">
                      <div className="p-3">
                        <div className="space-y-1">
                          {estadosBrasil.map((uf) => (
                            <div key={uf} className="flex items-center space-x-2">
                              <Checkbox
                                id={`uf-${uf}`}
                                checked={ufFilter.includes(uf)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setUfFilter([...ufFilter, uf]);
                                  } else {
                                    setUfFilter(ufFilter.filter(u => u !== uf));
                                  }
                                }}
                              />
                              <Label
                                htmlFor={`uf-${uf}`}
                                className="text-sm cursor-pointer"
                              >
                                {uf}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="flex flex-col gap-2">
                  <Label className="text-sm font-medium text-muted-foreground">Tipo da Agência</Label>
                  <Select value={tipoAgenciaFilter} onValueChange={setTipoAgenciaFilter}>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Todos os tipos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="convencional">Convencional</SelectItem>
                      <SelectItem value="terceirizada">Ponto Terceirizado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-2">
                  <Label className="text-sm font-medium text-muted-foreground">Ponto VIP</Label>
                  <Select value={pontoVipFilter} onValueChange={setPontoVipFilter}>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="sim">Sim</SelectItem>
                      <SelectItem value="nao">Não</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Filtros de Equipamento */}
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-3">Equipamento</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex flex-col gap-2">
                  <Label className="text-sm font-medium text-muted-foreground">Segmento</Label>
                  <Select value={segmentFilter} onValueChange={setSegmentFilter}>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Todos os segmentos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="AA">AA</SelectItem>
                      <SelectItem value="AB">AB</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex flex-col gap-2">
                  <Label className="text-sm font-medium text-muted-foreground">Equipamento</Label>
                  <Select value={equipmentFilter} onValueChange={setEquipmentFilter}>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Todos os equipamentos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      {uniqueEquipments.map(equipment => (
                        <SelectItem key={equipment} value={equipment}>{equipment}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex flex-col gap-2">
                  <Label className="text-sm font-medium text-muted-foreground">Nº Série</Label>
                  <Input
                    type="text"
                    placeholder="Buscar por série..."
                    value={serialNumberFilter}
                    onChange={(e) => setSerialNumberFilter(e.target.value)}
                    className="h-9"
                  />
                </div>
                
                <div className="flex flex-col gap-2">
                  <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Todos os status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="open">Aberta</SelectItem>
                      <SelectItem value="in-progress">Em Andamento</SelectItem>
                      <SelectItem value="pending">Pendente</SelectItem>
                      <SelectItem value="resolved">Resolvida</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Filtros de Fornecedor */}
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-3">Fornecedor</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label className="text-sm font-medium text-muted-foreground">Fornecedor</Label>
                  <Select value={vendorFilter} onValueChange={setVendorFilter}>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Todos os fornecedores" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      {uniqueVendors.map(vendor => (
                        <SelectItem key={vendor} value={vendor}>{vendor}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {tipoAgenciaAtual === 'terceirizada' && (
                  <div className="flex flex-col gap-2">
                    <Label className="text-sm font-medium text-muted-foreground">Transportadora</Label>
                    <Select value={transportadoraFilter} onValueChange={setTransportadoraFilter}>
                      <SelectTrigger className="h-9">
                        <Truck className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Todas as transportadoras" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas</SelectItem>
                        {uniqueTransportadoras.map(transportadora => (
                          <SelectItem key={transportadora} value={transportadora}>{transportadora}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </div>

            {/* Filtros Especiais */}
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-3">Filtros Especiais</h4>
              <div className="flex items-center space-x-2">
                <Switch
                  id="override-filter"
                  checked={overrideFilter}
                  onCheckedChange={setOverrideFilter}
                />
                <Label htmlFor="override-filter" className="text-sm font-medium">
                  Apenas ocorrências vencidas
                </Label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dashboard Content Wrapper for PDF Export */}
      <div id="dashboard-content">
        {/* KPI Cards */}
        {isLoading ? (
          <div className="responsive-grid responsive-grid-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="pb-2">
                  <Skeleton className="h-4 w-32" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-20 mb-2" />
                  <Skeleton className="h-3 w-28" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="responsive-grid responsive-grid-4 mb-6">
            <MetricCard 
              title="Total de Ocorrências" 
              value={metrics.totalOccurrences} 
              change="+12% vs mês anterior" 
              changeType="negative" 
              icon={<AlertTriangle className="h-5 w-5" />} 
              description={`${filterPeriod === '30-days' ? 'Últimos 30 dias' : 'Últimos 90 dias'}`} 
            />
            <MetricCard 
              title="Ocorrências Resolvidas" 
              value={metrics.resolvedOccurrences} 
              change="+8% vs mês anterior" 
              changeType="positive" 
              icon={<CheckCircle2 className="h-5 w-5" />} 
              description={`${metrics.resolutionRate}% taxa de resolução`} 
            />
            <MetricCard 
              title="MTTR Médio" 
              value={metrics.avgMTTR} 
              change="-15min vs mês anterior" 
              changeType="positive" 
              icon={<Clock className="h-5 w-5" />} 
              description="Tempo médio de resolução" 
            />
            <MetricCard 
              title="Agências Afetadas" 
              value={20} 
              change="2 novas esta semana" 
              changeType="neutral" 
              icon={<MapPin className="h-5 w-5" />} 
              description="De 2360 totais" 
            />
          </div>
        )}

        {/* Criticality Heatmap */}
        <CriticalityHeatmap occurrences={filteredOccurrences} />

        {/* Interactive Charts */}
        {isLoading ? (
          <div className="responsive-grid responsive-grid-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <Skeleton className="h-6 w-40" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-[300px] w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <InteractiveCharts 
            severityData={severityData} 
            timelineData={timelineData} 
            mttrData={mttrData} 
            equipmentData={equipmentData} 
            occurrences={filteredOccurrences} 
          />
        )}
      </div>

      {/* Occurrence Details Modal */}
      <OccurrenceModal open={modalOpen} onOpenChange={setModalOpen} occurrence={selectedOccurrence} mode="view" />
    </div>
  );
}