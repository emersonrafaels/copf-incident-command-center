import { useState, useEffect, useMemo, Suspense, lazy } from "react";
import { useNavigate } from "react-router-dom";
import { OptimizedMetricCard } from "./OptimizedMetricCard";
import { OptimizedInteractiveCharts } from "./OptimizedInteractiveCharts";
import { StatusBadge } from "./StatusBadge";
import { AgingChart } from "./AgingChart";
import { OccurrenceModal } from "./OccurrenceModal";
import { EquipmentStatusChart } from "./EquipmentStatusChart";
import { TopAgenciesChart } from "./TopAgenciesChart";

import { FilterSection } from "./FilterSection";

// Lazy loading de componentes pesados
const EnhancedInteractiveCharts = lazy(() => import('./EnhancedInteractiveCharts').then(module => ({ default: module.EnhancedInteractiveCharts })))
const VendorEquipmentMatrix = lazy(() => import('./VendorEquipmentMatrix').then(module => ({ default: module.VendorEquipmentMatrix })))
import { OccurrenceHighlights } from "./OccurrenceHighlights";
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
import { AlertTriangle, CheckCircle2, Clock, TrendingUp, MapPin, Users, Calendar, Download, RefreshCw, CalendarDays, Truck, HelpCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from 'sonner';

export function Dashboard() {
  const navigate = useNavigate();
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
  const { toast: toastHook } = useToast();
  const [selectedOccurrence, setSelectedOccurrence] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Usar filtros do contexto
  const filters = useFilters();

  // Limpar todos os filtros ao entrar no dashboard
  useEffect(() => {
    filters.clearAllFilters();
  }, []);
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
    statusEquipamentoFilterMulti,
    serialNumberFilter,
    overrideFilter,
    vendorPriorityFilter,
    reincidentFilter,
    longTailFilter,
    hasActiveFilters,
    filterPeriod,
    customDateRange,
    updateFilter
  } = filters;
  const handleExport = async () => {
    toast('Exportação iniciada - Gerando PDF da dashboard...');
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
      toast('Download concluído - Dashboard exportada em PDF com sucesso!');
    } catch (error) {
      toast('Erro na exportação - Não foi possível gerar o PDF. Tente novamente.');
    }
  };
  const handleOccurrenceClick = (occurrence: any) => {
    setSelectedOccurrence(occurrence);
    setModalOpen(true);
  };
  const handleRefresh = () => {
    refreshData();
    toast('Dados atualizados - Dashboard atualizado com as informações mais recentes.');
  };

  // Handlers para navegar com filtros específicos
  const handleNavigateToOccurrences = (filter: 'total' | 'pending' | 'reincidence' | 'overdue' | 'agencies' | 'mttr' | 'inoperant' | 'entered-today' | 'due-today' | 'overdue-today') => {
    console.log('Card clicked:', filter, 'Current filtered occurrences:', filteredOccurrences.length);
    
    // Aplicar filtros específicos do card clicado SEM limpar os filtros existentes
    switch (filter) {
      case 'total':
        // Sem filtros específicos adicionais - mantém apenas os filtros já aplicados
        break;
      case 'pending':
        filters.updateFilter('statusFilterMulti', ['a_iniciar', 'em_andamento', 'com_impedimentos']);
        break;
      case 'reincidence':
        filters.updateFilter('reincidentFilter', true);
        break;
      case 'overdue':
        filters.updateFilter('overrideFilter', true);
        break;
      case 'entered-today':
        // Navegar com filtro específico via state
        navigate('/ocorrencias', { 
          state: { filterType: 'entered-today' } 
        });
        return; // Early return para evitar navegação dupla
      case 'due-today':
        // Navegar com filtro específico via state
        navigate('/ocorrencias', { 
          state: { filterType: 'due-today' } 
        });
        return; // Early return para evitar navegação dupla
      case 'overdue-today':
        // Navegar com filtro específico via state
        navigate('/ocorrencias', { 
          state: { filterType: 'overdue-today' } 
        });
        return; // Early return para evitar navegação dupla
      case 'agencies':
        // Sem filtros específicos adicionais - mantém apenas os filtros já aplicados
        break;
      case 'mttr':
        filters.updateFilter('statusFilterMulti', ['encerrado']);
        break;
      case 'inoperant':
        filters.updateFilter('statusEquipamentoFilterMulti', ['inoperante']);
        break;
    }
    
    // Navegar para a página de ocorrências
    navigate('/ocorrencias');
    toast('Filtros aplicados - navegando para página de ocorrências');
  };

  // Filtrar ocorrências - Memoizado para performance
  const filteredOccurrences = useMemo(() => {
    let filtered = occurrences.filter(occurrence => {
      // Filtros multiselect
      if (segmentFilterMulti.length > 0 && !segmentFilterMulti.includes(occurrence.segment)) return false;
      if (equipmentFilterMulti.length > 0 && !equipmentFilterMulti.includes(occurrence.equipment)) return false;
      if (statusFilterMulti.length > 0 && !statusFilterMulti.includes(occurrence.status)) return false;
      if (statusEquipamentoFilterMulti.length > 0 && !statusEquipamentoFilterMulti.includes(occurrence.statusEquipamento)) return false;
      if (vendorFilterMulti.length > 0 && !vendorFilterMulti.includes(occurrence.vendor)) return false;
      if (transportadoraFilterMulti.length > 0) {
        // Verificar se a transportadora existe e não está vazia
        if (!occurrence.transportadora || occurrence.transportadora.trim() === '') return false;
        
        // Verificar se a transportadora está na lista de filtros
        if (!transportadoraFilterMulti.includes(occurrence.transportadora)) return false;
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

      // Usar o campo tipoAgencia do objeto de dados
      if (tipoAgenciaFilter.length > 0 && !tipoAgenciaFilter.includes(occurrence.tipoAgencia)) return false;

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
        const isOverdue = hoursDiff > slaLimit && occurrence.status !== 'encerrado';
        if (!isOverdue) return false;
      }

      // Filtro de reincidências (simular campo reincidencia)
      if (reincidentFilter) {
        // Lógica simplificada: equipamentos com mais de uma ocorrência na mesma agência
        const hasReincidence = occurrences.some(other => 
          other.id !== occurrence.id &&
          other.equipment === occurrence.equipment && 
          other.agency === occurrence.agency
        );
        if (!hasReincidence) return false;
      }
      
      // Filtro de Long Tail (tempo desde abertura) - apenas ocorrências ativas para consistência com LongTailChart
      if (longTailFilter.length > 0) {
        // Primeiro verificar se a ocorrência está ativa (não cancelada/encerrada)
        const isActiveOccurrence = occurrence.status === 'a_iniciar' || occurrence.status === 'em_andamento';
        if (!isActiveOccurrence) return false;
        
        const createdDate = new Date(occurrence.createdAt);
        const hoursDiff = (Date.now() - createdDate.getTime()) / (1000 * 60 * 60);
        const daysDiff = hoursDiff / 24;
        
        const matchesFilter = longTailFilter.some(filter => {
          switch (filter) {
            case '0-0.5h': return hoursDiff >= 0 && hoursDiff <= 0.5;
            case '0.5-1h': return hoursDiff > 0.5 && hoursDiff <= 1;
            case '1-2h': return hoursDiff > 1 && hoursDiff <= 2;
            case '2-4h': return hoursDiff > 2 && hoursDiff <= 4;
            case '4-8h': return hoursDiff > 4 && hoursDiff <= 8;
            case '8-12h': return hoursDiff > 8 && hoursDiff <= 12;
            case '12-24h': return hoursDiff > 12 && hoursDiff <= 24;
            case '1-2 dias': return daysDiff > 1 && daysDiff <= 2;
            case '2-3 dias': return daysDiff > 2 && daysDiff <= 3;
            case '3-5 dias': return daysDiff > 3 && daysDiff <= 5;
            case '>5 dias': return daysDiff > 5;
            default: return false;
          }
        });
        if (!matchesFilter) return false;
      }

      // Filtro de priorizadas com fornecedor (simular campo prioridade_fornecedor)
      if (vendorPriorityFilter) {
        // Lógica simplificada: ocorrências críticas ou altas como prioridade P1
        const isPriorityP1 = occurrence.severity === 'critical' || occurrence.severity === 'high';
        if (!isPriorityP1) return false;
      }
      return true;
    });
    return filtered;
  }, [occurrences, segmentFilterMulti, equipmentFilterMulti, statusFilterMulti, statusEquipamentoFilterMulti, vendorFilterMulti, transportadoraFilterMulti, serialNumberFilter, agenciaFilter, ufFilter, tipoAgenciaFilter, pontoVipFilter, overrideFilter, vendorPriorityFilter, reincidentFilter, longTailFilter]);

  // Cálculos memoizados para garantir consistência com a página de ocorrências
  const cardMetrics = useMemo(() => {
    // 1. Total de ocorrências (já está correto)
    const totalOccurrences = filteredOccurrences.length;

    // 2. Ocorrências pendentes (A iniciar, Em andamento, Com Impedimentos)
    const pendingOccurrences = filteredOccurrences.filter(o => 
      o.status === 'a_iniciar' || o.status === 'em_andamento' || o.status === 'com_impedimentos'
    ).length;

    // 3. Reincidências - usar mesma lógica que será usada na página de ocorrências
    const reincidentOccurrences = filteredOccurrences.reduce((count, occurrence, index) => {
      const sameReasonEquipment = filteredOccurrences.filter((other, otherIndex) => 
        otherIndex !== index &&
        other.description === occurrence.description &&
        other.equipment === occurrence.equipment &&
        other.agency === occurrence.agency
      );
      
      if (sameReasonEquipment.length > 0) {
        const hasRecentRecurrence = sameReasonEquipment.some(other => {
          const daysDiff = Math.abs(new Date(occurrence.createdAt).getTime() - new Date(other.createdAt).getTime()) / (1000 * 60 * 60 * 24);
          return daysDiff <= 4;
        });
        
        if (hasRecentRecurrence) {
          return count + 1;
        }
      }
      return count;
    }, 0);

    // 4. SLA em atraso - usar mesma lógica que será usada na página de ocorrências
    const overdueOccurrences = filteredOccurrences.filter(o => {
      if (o.status === 'encerrado') return false;
      const createdDate = new Date(o.createdAt);
      const hoursDiff = (Date.now() - createdDate.getTime()) / (1000 * 60 * 60);
      const slaLimit = o.severity === 'critical' || o.severity === 'high' ? 24 : 72;
      return hoursDiff > slaLimit;
    }).length;

    // 5. Equipamentos inoperantes
    const inoperantEquipments = filteredOccurrences.filter(o => o.statusEquipamento === 'inoperante').length;

    return {
      totalOccurrences,
      pendingOccurrences,
      reincidentOccurrences,
      overdueOccurrences,
      inoperantEquipments
    };
  }, [filteredOccurrences]);

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
  return <div className="space-y-8 animate-fade-in">
      {/* Hero Header */}
      <div className="relative">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 rounded-3xl"></div>
        
        <div className="relative p-8 rounded-3xl border border-border/50 bg-card/50 backdrop-blur-sm shadow-elegant">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-gradient-primary shadow-lg">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                    Dashboard COPF
                  </h1>
                  <p className="text-lg text-muted-foreground">
                    Centro de Operações de Pontos Físicos
                  </p>
                </div>
              </div>
              
              {/* Status Badges */}
              <div className="flex flex-wrap items-center gap-3">
                
                <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl border border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-200">
                  <div className="p-1.5 rounded-lg bg-primary/10">
                    <MapPin className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-foreground">
                      2.360 Pontos
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Monitorados
                    </span>
                  </div>
                </div>
                {hasActiveFilters && <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-warning/10 border border-warning/20">
                    <AlertTriangle className="h-4 w-4 text-warning" />
                    <span className="text-sm font-medium text-warning-foreground">
                      Filtros Aplicados
                    </span>
                  </div>}
              </div>
            </div>
            {/* Action Controls */}
            <div className="flex flex-wrap gap-3">
              {/* Filtro de Período */}
              <Select value={filterPeriod} onValueChange={(value) => updateFilter('filterPeriod', value)}>
                <SelectTrigger className="w-auto min-w-[180px] bg-card border-border/50 hover:border-primary/30 transition-colors shadow-card-default">
                  <Calendar className="h-4 w-4 mr-2 text-primary" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border/50">
                  <SelectItem value="7-days">Últimos 7 dias</SelectItem>
                  <SelectItem value="30-days">Últimos 30 dias</SelectItem>
                  <SelectItem value="60-days">Últimos 60 dias</SelectItem>
                  <SelectItem value="90-days">Últimos 90 dias</SelectItem>
                  <SelectItem value="custom">Período personalizado</SelectItem>
                </SelectContent>
              </Select>

              {/* Seletor de data personalizado */}
              {filterPeriod === 'custom' && <Popover open={showDatePicker} onOpenChange={setShowDatePicker}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className={cn("w-auto justify-start text-left font-normal shadow-card-default hover:shadow-card-hover transition-all", !customDateRange.from && "text-muted-foreground")}>
                      <CalendarDays className="h-4 w-4 mr-2 text-primary" />
                      {customDateRange.from ? customDateRange.to ? <>
                          {format(customDateRange.from, "dd/MM/yyyy")} -{" "}
                          {format(customDateRange.to, "dd/MM/yyyy")}
                        </> : format(customDateRange.from, "dd/MM/yyyy") : <span>Selecionar período</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-card border-border/50 shadow-elegant" align="start">
                    <CalendarComponent initialFocus mode="range" defaultMonth={customDateRange.from} selected={{
                  from: customDateRange.from,
                  to: customDateRange.to
                }} onSelect={range => {
                  updateFilter('customDateRange', range || {});
                  if (range?.from && range?.to) {
                    setShowDatePicker(false);
                  }
                }} numberOfMonths={2} className="pointer-events-auto" />
                  </PopoverContent>
                </Popover>}

              <Button variant="outline" size="sm" onClick={handleRefresh} className="shadow-card-default hover:shadow-card-hover transition-all hover:border-primary/30">
                <RefreshCw className="h-4 w-4 mr-2 text-primary" />
                Atualizar
              </Button>
              
              <Button variant="default" size="sm" onClick={handleExport} className="bg-gradient-primary hover:scale-105 transition-all shadow-elegant">
                <Download className="h-4 w-4 mr-2" />
                Exportar PDF
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="animate-fade-in" style={{
      animationDelay: '0.1s'
    }}>
        <FilterSection />
      </div>

      {/* Métricas principais */}
      <div className="animate-fade-in" style={{
      animationDelay: '0.2s'
    }}>
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-primary">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            Indicadores Principais
          </h2>
          <p className="text-muted-foreground mt-1">Visão geral do status operacional do parque de pontos físicos</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* 1. Total de Ocorrências */}
          <div onClick={() => handleNavigateToOccurrences('total')} className="cursor-pointer">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="relative">
                    <OptimizedMetricCard 
                      title="Total de Ocorrências" 
                      value={cardMetrics.totalOccurrences}
                      icon={<AlertTriangle className="h-4 w-4" />} 
                      description={`${Math.round(cardMetrics.totalOccurrences / occurrences.length * 100)}% do total`}
                      isLoading={isLoading}
                    />
                    <HelpCircle className="absolute top-2 right-2 h-4 w-4 text-muted-foreground/50 hover:text-muted-foreground transition-colors" />
                  </div>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p><strong>Total de Ocorrências:</strong> Número total de incidentes registrados no sistema, incluindo todas as situações que requerem intervenção técnica nos equipamentos bancários.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          {/* 2. Ocorrências Pendentes */}
          <div onClick={() => handleNavigateToOccurrences('pending')} className="cursor-pointer">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="relative">
                    <OptimizedMetricCard 
                      title="Ocorrências Pendentes" 
                      value={cardMetrics.pendingOccurrences}
                      icon={<Clock className="h-4 w-4" />} 
                      description="Em andamento ou aguardando"
                      isLoading={isLoading}
                    />
                    <HelpCircle className="absolute top-2 right-2 h-4 w-4 text-muted-foreground/50 hover:text-muted-foreground transition-colors" />
                  </div>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p><strong>Ocorrências Pendentes:</strong> Incidentes que ainda não foram resolvidos, incluindo os que estão aguardando início, em andamento ou com impedimentos. Requer atenção da equipe técnica.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* 2.5. Equipamentos Inoperantes */}
          <div onClick={() => handleNavigateToOccurrences('inoperant')} className="cursor-pointer">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="relative">
                    <OptimizedMetricCard 
                      title="Equipamentos Inoperantes" 
                      value={cardMetrics.inoperantEquipments}
                      icon={<AlertTriangle className="h-4 w-4" />} 
                      description="Equipamentos fora de operação"
                      isLoading={isLoading}
                    />
                    <HelpCircle className="absolute top-2 right-2 h-4 w-4 text-muted-foreground/50 hover:text-muted-foreground transition-colors" />
                  </div>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p><strong>Equipamentos Inoperantes:</strong> Número de equipamentos que estão fora de operação devido a falhas técnicas, indisponibilidade ou manutenção, impactando diretamente o atendimento aos clientes.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          {/* 3. Reincidências */}
          <div onClick={() => handleNavigateToOccurrences('reincidence')} className="cursor-pointer">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="relative">
                    <OptimizedMetricCard 
                      title="Reincidências" 
                      value={cardMetrics.reincidentOccurrences}
                      icon={<AlertTriangle className="h-4 w-4" />} 
                      description="Ocorrências repetidas"
                      isLoading={isLoading}
                    />
                    <HelpCircle className="absolute top-2 right-2 h-4 w-4 text-muted-foreground/50 hover:text-muted-foreground transition-colors" />
                  </div>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p><strong>Reincidências:</strong> Ocorrências que se repetem no mesmo equipamento e agência, indicando possíveis problemas estruturais ou necessidade de manutenção preventiva mais eficaz.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          {/* 4. Ocorrências com SLA em atraso */}
          <div onClick={() => handleNavigateToOccurrences('overdue')} className="cursor-pointer">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="relative">
                    <OptimizedMetricCard 
                      title="SLA em Atraso" 
                      value={cardMetrics.overdueOccurrences}
                      icon={<AlertTriangle className="h-4 w-4" />} 
                      description="Acima do prazo limite"
                      isLoading={isLoading}
                    />
                    <HelpCircle className="absolute top-2 right-2 h-4 w-4 text-muted-foreground/50 hover:text-muted-foreground transition-colors" />
                  </div>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p><strong>SLA em Atraso:</strong> Ocorrências que ultrapassaram o tempo limite de resolução estabelecido no acordo de nível de serviço (24h para críticas/altas, 72h para médias/baixas).</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          {/* 5. Agências Afetadas + VIP */}
          <div onClick={() => handleNavigateToOccurrences('agencies')} className="cursor-pointer">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="relative">
                    <OptimizedMetricCard 
                      title="Agências Afetadas" 
                      value={(() => {
                        const affectedAgencies = new Set(filteredOccurrences.map(o => o.agency));
                        const vipAgencies = Array.from(affectedAgencies).filter(agency => {
                          const agencyNumber = agency.match(/\d+/)?.[0] || '0';
                          return agencyNumber.endsWith('0') || agencyNumber.endsWith('5');
                        });
                        return `${affectedAgencies.size} (${vipAgencies.length} VIP)`;
                      })()}
                      icon={<MapPin className="h-4 w-4" />} 
                      description="Pontos com ocorrências"
                      isLoading={isLoading}
                    />
                    <HelpCircle className="absolute top-2 right-2 h-4 w-4 text-muted-foreground/50 hover:text-muted-foreground transition-colors" />
                  </div>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p><strong>Agências Afetadas:</strong> Número de agências bancárias que possuem pelo menos uma ocorrência ativa. As agências VIP são pontos estratégicos que recebem prioridade especial no atendimento.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          {/* 6. MTTR */}
          <div onClick={() => handleNavigateToOccurrences('mttr')} className="cursor-pointer">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="relative">
                    <OptimizedMetricCard 
                      title="MTTR" 
                      value={metrics?.avgMTTR || "4.2h"}
                      icon={<Clock className="h-4 w-4" />} 
                      description="Tempo médio de resolução"
                      isLoading={isLoading}
                    />
                    <HelpCircle className="absolute top-2 right-2 h-4 w-4 text-muted-foreground/50 hover:text-muted-foreground transition-colors" />
                  </div>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p><strong>MTTR (Mean Time To Resolution):</strong> Tempo médio necessário para resolver uma ocorrência, desde a abertura até o encerramento. Indicador chave de eficiência operacional da equipe de suporte.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>


      {/* Seção de Análise Visual - Grid de Gráficos */}
      <div className="space-y-8 animate-fade-in" style={{
      animationDelay: '0.3s'
    }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">Análise Visual Operacional</h2>
              <p className="text-muted-foreground">Dashboards interativos para análise detalhada dos dados</p>
            </div>
          </div>
        </div>

        {/* Grid de gráficos organizados para storytelling */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Equipment Status Chart */}
          <div className="animate-fade-in" style={{
          animationDelay: '0.35s'
        }}>
            <EquipmentStatusChart occurrences={filteredOccurrences} />
          </div>

          {/* Top Agencies Chart */}
          <div className="animate-fade-in" style={{
          animationDelay: '0.4s'
        }}>
            <TopAgenciesChart occurrences={occurrences} filteredOccurrences={filteredOccurrences} />
          </div>
        </div>

        {/* Gráfico de Aging - Largura completa para destaque */}
        <div className="animate-fade-in" style={{
        animationDelay: '0.45s'
      }}>
          <Card className="border-l-4 border-l-orange-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-2 h-6 bg-gradient-to-b from-orange-500 to-red-500 rounded-sm"></div>
                Gráfico de Aging
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Análise do tempo de permanência das ocorrências em aberto (aging), distribuídas por faixas temporais</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Distribuição temporal de ocorrências em aberto - identifique gargalos e otimize a performance operacional
              </p>
            </CardHeader>
            <CardContent>
              <AgingChart occurrences={occurrences} filteredOccurrences={filteredOccurrences} />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Highlights Operacionais */}
      <div className="animate-fade-in" style={{
      animationDelay: '0.5s'
    }}>
        <OccurrenceHighlights 
          occurrences={filteredOccurrences} 
          onOccurrenceClick={handleOccurrenceClick}
          onNavigateToOccurrences={handleNavigateToOccurrences}
        />
      </div>

      {/* Dashboard Content Wrapper for PDF Export */}
      <div id="dashboard-content" className="hidden">
        {/* This content is only for PDF export - hidden from view */}
      </div>

      {/* Occurrence Details Modal */}
      <OccurrenceModal open={modalOpen} onOpenChange={setModalOpen} occurrence={selectedOccurrence} mode="view" />
    </div>;
}