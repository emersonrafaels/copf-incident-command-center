import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { MetricCard } from "./MetricCard";
import { StatusBadge } from "./StatusBadge";
import { LongTailChart } from "./LongTailChart";
import { OccurrenceModal } from "./OccurrenceModal";
import { CriticalityHeatmap } from "./CriticalityHeatmap";
import { FilterSection } from "./FilterSection";
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
import { AlertTriangle, CheckCircle2, Clock, TrendingUp, MapPin, Users, Calendar, Download, RefreshCw, CalendarDays, Truck } from "lucide-react";
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
  const [filterPeriod, setFilterPeriod] = useState('30-days');
  const [customDateRange, setCustomDateRange] = useState<{
    from?: Date;
    to?: Date;
  }>({});
  const [showDatePicker, setShowDatePicker] = useState(false);

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
  const handleNavigateToOccurrences = (filter: 'total' | 'pending' | 'reincidence' | 'overdue' | 'agencies' | 'mttr') => {
    filters.clearAllFilters();
    
    setTimeout(() => {
      switch (filter) {
        case 'total':
          // Sem filtros específicos - mostra todas
          break;
        case 'pending':
          filters.updateFilter('statusFilterMulti', ['a_iniciar', 'em_andamento']);
          break;
        case 'reincidence':
          // Não há filtro direto para reincidência, navega para todas
          break;
        case 'overdue':
          filters.updateFilter('statusFilterMulti', ['a_iniciar', 'em_andamento']);
          filters.updateFilter('overrideFilter', true);
          break;
        case 'agencies':
          // Sem filtros específicos - mostra todas
          break;
        case 'mttr':
          filters.updateFilter('statusFilterMulti', ['encerrado']);
          break;
      }
      navigate('/ocorrencias');
      toast('Filtros aplicados - navegando para página de ocorrências');
    }, 100);
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
        const transportadora = occurrence.vendor.includes('Express') ? 'Express Logística' : occurrence.vendor.includes('Tech') ? 'TechTransporte' : 'LogiCorp';
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
        const isOverdue = hoursDiff > slaLimit && occurrence.status !== 'encerrado';
        if (!isOverdue) return false;
      }

      // Filtro de priorizadas com fornecedor
      if (vendorPriorityFilter) {
        const isHighPriority = occurrence.severity === 'critical' || occurrence.severity === 'high';
        if (!isHighPriority) return false;
      }
      return true;
    });
    return filtered;
  }, [occurrences, segmentFilterMulti, equipmentFilterMulti, statusFilterMulti, vendorFilterMulti, transportadoraFilterMulti, serialNumberFilter, agenciaFilter, ufFilter, tipoAgenciaFilter, pontoVipFilter, overrideFilter, vendorPriorityFilter]);

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
              <Select value={filterPeriod} onValueChange={setFilterPeriod}>
                <SelectTrigger className="w-auto min-w-[180px] bg-card border-border/50 hover:border-primary/30 transition-colors shadow-card-default">
                  <Calendar className="h-4 w-4 mr-2 text-primary" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border/50">
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
                  setCustomDateRange(range || {});
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
          <p className="text-muted-foreground mt-1">Visão geral do status operacional em tempo real</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* 1. Total de Ocorrências */}
          <MetricCard 
            title="Total de Ocorrências" 
            value={filteredOccurrences.length.toString()} 
            icon={<AlertTriangle className="h-4 w-4" />} 
            change={`${Math.round(filteredOccurrences.length / occurrences.length * 100)}% do total`} 
            changeType="neutral" 
            clickable={true}
            onClick={() => handleNavigateToOccurrences('total')}
          />
          
          {/* 2. Ocorrências Pendentes */}
          <MetricCard 
            title="Ocorrências Pendentes" 
            value={filteredOccurrences.filter(o => o.status === 'a_iniciar' || o.status === 'em_andamento').length.toString()} 
            icon={<Clock className="h-4 w-4" />} 
            change="+12% desde ontem" 
            changeType="neutral" 
            clickable={true}
            onClick={() => handleNavigateToOccurrences('pending')}
          />
          
          {/* 3. Reincidências */}
          <MetricCard 
            title="Reincidências" 
            value={filteredOccurrences.reduce((count, occurrence, index) => {
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
            }, 0).toString()} 
            icon={<AlertTriangle className="h-4 w-4" />} 
            change="-5% desde ontem" 
            changeType="positive" 
            clickable={true}
            onClick={() => handleNavigateToOccurrences('reincidence')}
          />
          
          {/* 4. Ocorrências com SLA em atraso */}
          <MetricCard 
            title="SLA em Atraso" 
            value={filteredOccurrences.filter(o => {
              if (o.status === 'encerrado') return false;
              const createdDate = new Date(o.createdAt);
              const hoursDiff = (Date.now() - createdDate.getTime()) / (1000 * 60 * 60);
              const slaLimit = o.severity === 'critical' || o.severity === 'high' ? 24 : 72;
              return hoursDiff > slaLimit;
            }).length.toString()} 
            icon={<AlertTriangle className="h-4 w-4" />} 
            change="-8% desde ontem" 
            changeType="positive" 
            clickable={true}
            onClick={() => handleNavigateToOccurrences('overdue')}
          />
          
          {/* 5. Agências Afetadas + VIP */}
          <MetricCard 
            title="Agências Afetadas" 
            value={(() => {
              const affectedAgencies = new Set(filteredOccurrences.map(o => o.agency));
              const vipAgencies = Array.from(affectedAgencies).filter(agency => {
                const agencyNumber = agency.match(/\d+/)?.[0] || '0';
                return agencyNumber.endsWith('0') || agencyNumber.endsWith('5');
              });
              return `${affectedAgencies.size} (${vipAgencies.length} VIPs)`;
            })()} 
            icon={<MapPin className="h-4 w-4" />} 
            change="+3% desde ontem" 
            changeType="neutral" 
            clickable={true}
            onClick={() => handleNavigateToOccurrences('agencies')}
          />
          
          {/* 6. MTTR */}
          <MetricCard 
            title="MTTR" 
            value={metrics?.avgMTTR || "4.2h"} 
            icon={<Clock className="h-4 w-4" />} 
            change="-0.3h desde ontem" 
            changeType="positive" 
            clickable={true}
            onClick={() => handleNavigateToOccurrences('mttr')}
          />
        </div>
      </div>

      {/* Mapa de Criticidade */}
      <div className="animate-fade-in space-y-6" style={{
      animationDelay: '0.3s'
    }}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gradient-primary">
                <MapPin className="h-5 w-5 text-white" />
              </div>
              Mapa de Criticidade por Equipamento
            </h2>
            <p className="text-muted-foreground mt-1">Distribuição de criticidade por tipo de equipamento</p>
          </div>
        </div>
        <CriticalityHeatmap occurrences={filteredOccurrences} />
      </div>

      {/* Long Tail Analysis */}
      <div className="animate-fade-in" style={{
      animationDelay: '0.4s'
    }}>
        <LongTailChart occurrences={occurrences} filteredOccurrences={filteredOccurrences} />
      </div>

      {/* Highlights Operacionais */}
      <div className="animate-fade-in" style={{
      animationDelay: '0.5s'
    }}>
        <OccurrenceHighlights occurrences={filteredOccurrences} onOccurrenceClick={handleOccurrenceClick} />
      </div>

      {/* Dashboard Content Wrapper for PDF Export */}
      <div id="dashboard-content" className="hidden">
        {/* This content is only for PDF export - hidden from view */}
      </div>

      {/* Occurrence Details Modal */}
      <OccurrenceModal open={modalOpen} onOpenChange={setModalOpen} occurrence={selectedOccurrence} mode="view" />
    </div>;
}