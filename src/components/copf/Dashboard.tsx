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
  
  // Dados de transportadoras e seus fornecedores
  const transportadoraFornecedores = {
    'Express Logística': ['Fornecedor A', 'Fornecedor B', 'Fornecedor C'],
    'TechTransporte': ['Fornecedor D', 'Fornecedor E'],
    'LogiCorp': ['Fornecedor F', 'Fornecedor G', 'Fornecedor H']
  };
  
  const uniqueTransportadoras = Object.keys(transportadoraFornecedores);
  
  // Filtrar fornecedores baseado na transportadora selecionada
  const getFilteredVendors = () => {
    if (tipoAgenciaFilter !== 'terceirizada') return uniqueVendors;
    if (transportadoraFilter === 'all') return uniqueVendors;
    return transportadoraFornecedores[transportadoraFilter] || uniqueVendors;
  };
  
  const availableVendors = getFilteredVendors();
  
  // Gerar agências únicas baseadas nas ocorrências
  const uniqueAgencies = Array.from(new Set(occurrences.map(o => o.agency.match(/\d+/)?.[0] || ''))).filter(Boolean).sort();
  
  // Estados brasileiros
  const estadosBrasil = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 
    'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 
    'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ];
  
  // Filtrar UFs baseadas nas agências selecionadas
  const availableUFs = agenciaFilter.length === 0 
    ? estadosBrasil 
    : Array.from(new Set(agenciaFilter.map(agencyNumber => {
        // Lógica simplificada: agências 0-999 = SP, 1000-1999 = RJ, etc.
        const num = parseInt(agencyNumber);
        if (num <= 999) return 'SP';
        if (num <= 1999) return 'RJ';
        if (num <= 2999) return 'MG';
        if (num <= 3999) return 'RS';
        return 'PR';
      })));

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
    vendorFilter !== 'all' || transportadoraFilter !== 'all' || agenciaFilter.length > 0 ||
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
    setAgenciaFilter([]);
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
      <Card className="animate-fade-in border-border/50 bg-gradient-to-r from-card to-muted/20">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Filter className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Filtros Avançados</h3>
                {hasActiveFilters && (
                  <p className="text-sm text-muted-foreground">
                    {filteredOccurrences.length} resultado{filteredOccurrences.length !== 1 ? 's' : ''} encontrado{filteredOccurrences.length !== 1 ? 's' : ''}
                  </p>
                )}
              </div>
            </div>
            {hasActiveFilters && (
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
                  {Object.values({
                    agencia: agenciaFilter.length > 0,
                    uf: ufFilter.length > 0,
                    tipoAgencia: tipoAgenciaFilter !== 'all',
                    pontoVip: pontoVipFilter !== 'all',
                    segmento: segmentFilter !== 'all',
                    equipamento: equipmentFilter !== 'all',
                    serie: serialNumberFilter !== '',
                    status: statusFilter !== 'all',
                    fornecedor: vendorFilter !== 'all',
                    transportadora: transportadoraFilter !== 'all',
                    vencidas: overrideFilter
                  }).filter(Boolean).length} filtro{Object.values({
                    agencia: agenciaFilter.length > 0,
                    uf: ufFilter.length > 0,
                    tipoAgencia: tipoAgenciaFilter !== 'all',
                    pontoVip: pontoVipFilter !== 'all',
                    segmento: segmentFilter !== 'all',
                    equipamento: equipmentFilter !== 'all',
                    serie: serialNumberFilter !== '',
                    status: statusFilter !== 'all',
                    fornecedor: vendorFilter !== 'all',
                    transportadora: transportadoraFilter !== 'all',
                    vencidas: overrideFilter
                  }).filter(Boolean).length !== 1 ? 's' : ''} ativo{Object.values({
                    agencia: agenciaFilter.length > 0,
                    uf: ufFilter.length > 0,
                    tipoAgencia: tipoAgenciaFilter !== 'all',
                    pontoVip: pontoVipFilter !== 'all',
                    segmento: segmentFilter !== 'all',
                    equipamento: equipmentFilter !== 'all',
                    serie: serialNumberFilter !== '',
                    status: statusFilter !== 'all',
                    fornecedor: vendorFilter !== 'all',
                    transportadora: transportadoraFilter !== 'all',
                    vencidas: overrideFilter
                  }).filter(Boolean).length !== 1 ? 's' : ''}
                </Badge>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={clearAllFilters}
                  className="hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20 transition-colors"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Limpar Filtros
                </Button>
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Filtros de Localização */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-border/50">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-primary"></div>
              </div>
              <h4 className="text-base font-semibold text-foreground">Localização</h4>
            </div>
            <div className="responsive-grid responsive-grid-4">
              <div className="group space-y-3">
                <Label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <div className="w-1 h-4 bg-primary/60 rounded-full"></div>
                  Agência
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full h-10 justify-between hover:bg-primary/5 hover:border-primary/30 transition-all duration-200 group-hover:shadow-sm"
                    >
                      {agenciaFilter.length > 0 ? (
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="h-5 text-xs bg-primary/10 text-primary">
                            {agenciaFilter.length}
                          </Badge>
                          <span className="text-sm">
                            agência{agenciaFilter.length > 1 ? 's' : ''} selecionada{agenciaFilter.length > 1 ? 's' : ''}
                          </span>
                        </div>
                      ) : (
                        "Todas as agências"
                      )}
                      <div className="w-4 h-4 opacity-50">⌄</div>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-72 p-0 bg-background/95 backdrop-blur-sm border border-border/80 shadow-lg z-50" align="start">
                    <div className="p-4">
                      <div className="pb-3 mb-3 border-b border-border/50">
                        <h5 className="font-medium text-sm">Selecionar Agências</h5>
                        <p className="text-xs text-muted-foreground mt-1">Escolha uma ou mais agências</p>
                      </div>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {uniqueAgencies.map((agency) => (
                          <div key={agency} className="flex items-center space-x-3 p-2 rounded-md hover:bg-muted/50 transition-colors">
                            <Checkbox
                              id={`agency-${agency}`}
                              checked={agenciaFilter.includes(agency)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setAgenciaFilter([...agenciaFilter, agency]);
                                } else {
                                  setAgenciaFilter(agenciaFilter.filter(a => a !== agency));
                                }
                              }}
                              className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                            />
                            <Label
                              htmlFor={`agency-${agency}`}
                              className="text-sm cursor-pointer flex-1 font-medium"
                            >
                              Agência {agency}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="group space-y-3">
                <Label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <div className="w-1 h-4 bg-primary/60 rounded-full"></div>
                  Estado (UF)
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full h-10 justify-between hover:bg-primary/5 hover:border-primary/30 transition-all duration-200 group-hover:shadow-sm"
                    >
                      {ufFilter.length > 0 ? (
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="h-5 text-xs bg-primary/10 text-primary">
                            {ufFilter.length}
                          </Badge>
                          <span className="text-sm">
                            estado{ufFilter.length > 1 ? 's' : ''} selecionado{ufFilter.length > 1 ? 's' : ''}
                          </span>
                        </div>
                      ) : (
                        "Todos os estados"
                      )}
                      <div className="w-4 h-4 opacity-50">⌄</div>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-72 p-0 bg-background/95 backdrop-blur-sm border border-border/80 shadow-lg z-50" align="start">
                    <div className="p-4">
                      <div className="pb-3 mb-3 border-b border-border/50">
                        <h5 className="font-medium text-sm">Selecionar Estados</h5>
                        <p className="text-xs text-muted-foreground mt-1">
                          {agenciaFilter.length > 0 ? 'Filtrado pelas agências selecionadas' : 'Escolha um ou mais estados'}
                        </p>
                      </div>
                      <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto">
                        {availableUFs.map((uf) => (
                          <div key={uf} className="flex items-center space-x-2 p-2 rounded-md hover:bg-muted/50 transition-colors">
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
                              className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                            />
                            <Label
                              htmlFor={`uf-${uf}`}
                              className="text-sm cursor-pointer font-medium"
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

              <div className="group space-y-3">
                <Label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <div className="w-1 h-4 bg-primary/60 rounded-full"></div>
                  Tipo da Agência
                </Label>
                <Select value={tipoAgenciaFilter} onValueChange={setTipoAgenciaFilter}>
                  <SelectTrigger className="h-10 hover:bg-primary/5 hover:border-primary/30 transition-all duration-200 group-hover:shadow-sm">
                    <SelectValue placeholder="Todos os tipos" />
                  </SelectTrigger>
                  <SelectContent className="bg-background/95 backdrop-blur-sm border border-border/80">
                    <SelectItem value="all">Todos os tipos</SelectItem>
                    <SelectItem value="convencional">Convencional</SelectItem>
                    <SelectItem value="terceirizada">Ponto Terceirizado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="group space-y-3">
                <Label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <div className="w-1 h-4 bg-primary/60 rounded-full"></div>
                  Ponto VIP
                </Label>
                <Select value={pontoVipFilter} onValueChange={setPontoVipFilter}>
                  <SelectTrigger className="h-10 hover:bg-primary/5 hover:border-primary/30 transition-all duration-200 group-hover:shadow-sm">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent className="bg-background/95 backdrop-blur-sm border border-border/80">
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="sim">Sim</SelectItem>
                    <SelectItem value="nao">Não</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Filtros de Equipamento */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-border/50">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-primary"></div>
              </div>
              <h4 className="text-base font-semibold text-foreground">Equipamento</h4>
            </div>
            <div className="responsive-grid responsive-grid-4">
              <div className="group space-y-3">
                <Label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <div className="w-1 h-4 bg-primary/60 rounded-full"></div>
                  Segmento
                </Label>
                <Select value={segmentFilter} onValueChange={setSegmentFilter}>
                  <SelectTrigger className="h-10 hover:bg-primary/5 hover:border-primary/30 transition-all duration-200 group-hover:shadow-sm">
                    <SelectValue placeholder="Todos os segmentos" />
                  </SelectTrigger>
                  <SelectContent className="bg-background/95 backdrop-blur-sm border border-border/80">
                    <SelectItem value="all">Todos os segmentos</SelectItem>
                    <SelectItem value="AA">Segmento AA</SelectItem>
                    <SelectItem value="AB">Segmento AB</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="group space-y-3">
                <Label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <div className="w-1 h-4 bg-primary/60 rounded-full"></div>
                  Equipamento
                </Label>
                <Select value={equipmentFilter} onValueChange={setEquipmentFilter}>
                  <SelectTrigger className="h-10 hover:bg-primary/5 hover:border-primary/30 transition-all duration-200 group-hover:shadow-sm">
                    <SelectValue placeholder="Todos os equipamentos" />
                  </SelectTrigger>
                  <SelectContent className="bg-background/95 backdrop-blur-sm border border-border/80">
                    <SelectItem value="all">Todos os equipamentos</SelectItem>
                    {uniqueEquipments.map(equipment => (
                      <SelectItem key={equipment} value={equipment}>{equipment}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="group space-y-3">
                <Label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <div className="w-1 h-4 bg-primary/60 rounded-full"></div>
                  Número de Série
                </Label>
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Buscar por série..."
                    value={serialNumberFilter}
                    onChange={(e) => setSerialNumberFilter(e.target.value)}
                    className="h-10 pl-10 hover:border-primary/30 focus:border-primary transition-colors"
                  />
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground">
                    🔍
                  </div>
                </div>
              </div>
              
              <div className="group space-y-3">
                <Label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <div className="w-1 h-4 bg-primary/60 rounded-full"></div>
                  Status
                </Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="h-10 hover:bg-primary/5 hover:border-primary/30 transition-all duration-200 group-hover:shadow-sm">
                    <SelectValue placeholder="Todos os status" />
                  </SelectTrigger>
                  <SelectContent className="bg-background/95 backdrop-blur-sm border border-border/80">
                    <SelectItem value="all">Todos os status</SelectItem>
                    <SelectItem value="open">🔴 Aberta</SelectItem>
                    <SelectItem value="in-progress">🟡 Em Andamento</SelectItem>
                    <SelectItem value="pending">🟠 Pendente</SelectItem>
                    <SelectItem value="resolved">🟢 Resolvida</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Filtros de Fornecedor */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-border/50">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-primary"></div>
              </div>
              <h4 className="text-base font-semibold text-foreground">Fornecedor</h4>
            </div>
            <div className="responsive-grid responsive-grid-2">
              {tipoAgenciaAtual === 'terceirizada' && (
                <div className="group space-y-3">
                  <Label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <div className="w-1 h-4 bg-primary/60 rounded-full"></div>
                    Transportadora
                  </Label>
                  <Select value={transportadoraFilter} onValueChange={(value) => {
                    setTransportadoraFilter(value);
                    // Resetar filtro de fornecedor quando mudar transportadora
                    if (value !== 'all') {
                      setVendorFilter('all');
                    }
                  }}>
                    <SelectTrigger className="h-10 hover:bg-primary/5 hover:border-primary/30 transition-all duration-200 group-hover:shadow-sm">
                      <Truck className="h-4 w-4 mr-2 text-primary" />
                      <SelectValue placeholder="Todas as transportadoras" />
                    </SelectTrigger>
                    <SelectContent className="bg-background/95 backdrop-blur-sm border border-border/80">
                      <SelectItem value="all">Todas as transportadoras</SelectItem>
                      {uniqueTransportadoras.map(transportadora => (
                        <SelectItem key={transportadora} value={transportadora}>{transportadora}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="group space-y-3">
                <Label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <div className="w-1 h-4 bg-primary/60 rounded-full"></div>
                  Fornecedor
                  {tipoAgenciaAtual === 'terceirizada' && transportadoraFilter !== 'all' && (
                    <Badge variant="secondary" className="h-5 text-xs bg-primary/10 text-primary">
                      {transportadoraFilter}
                    </Badge>
                  )}
                </Label>
                <Select value={vendorFilter} onValueChange={setVendorFilter}>
                  <SelectTrigger className="h-10 hover:bg-primary/5 hover:border-primary/30 transition-all duration-200 group-hover:shadow-sm">
                    <SelectValue placeholder="Todos os fornecedores" />
                  </SelectTrigger>
                  <SelectContent className="bg-background/95 backdrop-blur-sm border border-border/80">
                    <SelectItem value="all">Todos os fornecedores</SelectItem>
                    {availableVendors.map(vendor => (
                      <SelectItem key={vendor} value={vendor}>{vendor}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Filtros Especiais */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-border/50">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-primary"></div>
              </div>
              <h4 className="text-base font-semibold text-foreground">Filtros Especiais</h4>
            </div>
            <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Switch
                    id="override-filter"
                    checked={overrideFilter}
                    onCheckedChange={setOverrideFilter}
                    className="data-[state=checked]:bg-primary"
                  />
                  <div>
                    <Label htmlFor="override-filter" className="text-sm font-medium cursor-pointer">
                      Ocorrências Vencidas
                    </Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Mostrar apenas ocorrências que já passaram do prazo
                    </p>
                  </div>
                </div>
                {overrideFilter && (
                  <Badge variant="secondary" className="bg-warning/10 text-warning border-warning/20">
                    Ativo
                  </Badge>
                )}
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