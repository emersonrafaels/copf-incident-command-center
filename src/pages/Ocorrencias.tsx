import { COPFLayout } from "@/components/copf/COPFLayout";
import { FilterSection } from "@/components/copf/FilterSection";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Download, Eye, MessageSquare, Bot, ChevronUp, ChevronDown } from "lucide-react";
import { StatusBadge } from "@/components/copf/StatusBadge";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useState, useEffect, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import { useFilters } from "@/contexts/FiltersContext";
import { useSearchParams, useNavigate, useLocation } from "react-router-dom";
import * as XLSX from 'xlsx';
import { Label } from "@/components/ui/label";

const Ocorrencias = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    occurrences,
    isLoading,
    refreshData
  } = useDashboardData();
  const { toast } = useToast();
  const { 
    segmentFilterMulti, 
    equipmentFilterMulti, 
    statusFilterMulti, 
    vendorFilterMulti, 
    severityFilterMulti,
    statusEquipamentoFilterMulti,
    transportadoraFilterMulti,
    tipoAgenciaFilter,
    agenciaFilter,
    ufFilter,
    municipioFilter,
    pontoVipFilter,
    suptFilter,
    overrideFilter,
    vendorPriorityFilter,
    reincidentFilter,
    statusSlaFilter,
    motivoFilter,
    previsaoSlaFilter,
    equipmentModelFilterMulti,
    impedimentoFilter,
    motivoImpedimentoFilter,
    filterPeriod,
    customDateRange,
    updateFilter,
    serialNumberFilter,
    hasActiveFilters
  } = useFilters();
  const [searchParams] = useSearchParams();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [showAIAssistant, setShowAIAssistant] = useState(false);

  // Filtro de modelo: usa o filtro global do contexto (multiselect)
  const filtersCtxForModels = useFilters();
  const selectedEquipmentModels = filtersCtxForModels?.equipmentModelFilterMulti ?? [];
  
  // Mapeamento genérico de modelos por equipamento (somente para esta página)
  const equipmentModelsMap: Record<string, string[]> = {
    'ATM Saque': ['Modelo ATM Saque 1', 'Modelo ATM Saque 2'],
    'ATM Depósito': ['Modelo ATM Depósito 1', 'Modelo ATM Depósito 2'],
    'Cassete': ['Modelo Cassete 1', 'Modelo Cassete 2'],
    'Notebook': ['Modelo Notebook 1', 'Modelo Notebook 2'],
    'Desktop': ['Modelo Desktop 1', 'Modelo Desktop 2'],
    'Leitor de Cheques/documentos': ['Modelo Leitor Cheques 1', 'Modelo Leitor Cheques 2'],
    'Leitor biométrico': ['Modelo Leitor Biométrico 1', 'Modelo Leitor Biométrico 2'],
    'PIN PAD': ['Modelo PIN PAD 1', 'Modelo PIN PAD 2'],
    'Scanner de Cheque': ['Modelo Scanner Cheque 1', 'Modelo Scanner Cheque 2'],
    'Impressora': ['Modelo Impressora 1', 'Modelo Impressora 2'],
    'Impressora térmica': ['Modelo Impressora Térmica 1', 'Modelo Impressora Térmica 2'],
    'Impressora multifuncional': ['Modelo Impressora Multifuncional 1', 'Modelo Impressora Multifuncional 2'],
    'Monitor LCD/LED': ['Modelo Monitor 1', 'Modelo Monitor 2'],
    'Teclado': ['Modelo Teclado 1', 'Modelo Teclado 2'],
    'Servidor': ['Modelo Servidor 1', 'Modelo Servidor 2'],
    'Televisão': ['Modelo Televisão 1', 'Modelo Televisão 2'],
    'Senheiro': ['Modelo Senheiro 1', 'Modelo Senheiro 2'],
    'TCR': ['Modelo TCR 1', 'Modelo TCR 2'],
    'Classificadora': ['Modelo Classificadora 1', 'Modelo Classificadora 2'],
    'Fragmentadora de Papel': ['Modelo Fragmentadora 1', 'Modelo Fragmentadora 2'],
  };

  const getModelForOccurrence = (occurrence: any) => {
    const models = equipmentModelsMap[occurrence.equipment] || ['Modelo Genérico 1', 'Modelo Genérico 2'];
    const key = (occurrence.serialNumber || occurrence.id || '').toString();
    const idx = key.length > 0 ? (key.charCodeAt(0) + key.length) % models.length : 0;
    return models[idx];
  };

  // Extrair parâmetros de aging da URL
  const agingMin = searchParams.get('aging_min');
  const agingMax = searchParams.get('aging_max');
  
  // Extrair parâmetros dos highlights
  const createdDate = searchParams.get('created_date');
  const slaDate = searchParams.get('sla_date');
  const slaStatus = searchParams.get('sla_status');
  
  // Filtros especiais vindos do dashboard via navigation state
  const filterType = location.state?.filterType;

  // Aplicar filtros especiais ao carregar a página
  useEffect(() => {
    const agencyParam = searchParams.get('agency');
    const segmentParam = searchParams.get('segment');
    const equipmentParam = searchParams.get('equipment');
    const previsaoParam = searchParams.get('previsao');
    const equipStatusParam = searchParams.get('equip_status');
    const statusParam = searchParams.get('status');
    const severityParam = searchParams.get('severity');
    const reincidenceParam = searchParams.get('reincidence');
    const motivoParam = searchParams.get('motivo');

    if (agencyParam) updateFilter('agenciaFilter', [agencyParam]);
    if (segmentParam) updateFilter('segmentFilterMulti', [segmentParam]);
    if (equipmentParam) updateFilter('equipmentFilterMulti', [equipmentParam]);
    if (previsaoParam && ['sem_previsao','previsao_alem_sla','com_previsao_dentro_sla'].includes(previsaoParam)) {
      updateFilter('previsaoSlaFilter', [previsaoParam]);
    }
    if (equipStatusParam && ['operante','inoperante'].includes(equipStatusParam)) {
      updateFilter('statusEquipamentoFilterMulti', [equipStatusParam]);
    }
    if (statusParam) {
      const statuses = statusParam.split(',').filter(Boolean);
      if (statuses.length) updateFilter('statusFilterMulti', statuses);
    }
    if (severityParam) {
      updateFilter('severityFilterMulti', [severityParam]);
    }
    if (reincidenceParam === '1' || reincidenceParam === 'true') {
      updateFilter('reincidentFilter', true);
    }
    if (motivoParam) {
      updateFilter('motivoFilter', [decodeURIComponent(motivoParam)]);
    }

    if (filterType === 'critical') {
      updateFilter('severityFilterMulti', ['critical']);
    } else if (filterType === 'due-today') {
      updateFilter('statusSlaFilter', ['critico']);
    }
    
    if (slaStatus === 'due_today') {
      updateFilter('statusSlaFilter', ['critico']);
    }
  }, [filterType, slaStatus, updateFilter, searchParams]);

  // Filtrar ocorrências com consistência com o Dashboard
  const filteredOccurrences = useMemo(() => {
    // Determinar intervalo de datas baseado no filtro selecionado no contexto (igual ao Dashboard)
    const now = new Date();
    let startDate: Date | null = null;
    let endDate: Date | null = now;

    switch (filterPeriod) {
      case '7-days':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        break;
      case '30-days':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 30);
        break;
      case '60-days':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 60);
        break;
      case '90-days':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 90);
        break;
      case 'custom':
        if (customDateRange?.from) {
          startDate = new Date(customDateRange.from);
        }
        if (customDateRange?.to) {
          endDate = new Date(customDateRange.to);
          endDate.setHours(23, 59, 59, 999);
        }
        break;
      default:
        startDate = null;
        endDate = null;
    }

    return occurrences.filter(occurrence => {
      // Filtro por período (Data/Hora Abertura) - IGUAL AO DASHBOARD
      if (startDate && endDate) {
        const created = new Date(occurrence.createdAt);
        if (isNaN(created.getTime())) return false;
        if (created < startDate || created > endDate) return false;
      }

      // Busca por texto
      const matchesSearch = occurrence.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          occurrence.agency.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          occurrence.description.toLowerCase().includes(searchTerm.toLowerCase());

      // Filtros multiselect - ORDEM E LÓGICA IGUAL AO DASHBOARD
      if (segmentFilterMulti.length > 0 && !segmentFilterMulti.includes(occurrence.segment)) return false;
      if (equipmentFilterMulti.length > 0 && !equipmentFilterMulti.includes(occurrence.equipment)) return false;
      if (statusFilterMulti.length > 0 && !statusFilterMulti.includes(occurrence.status)) return false;
      if (statusEquipamentoFilterMulti.length > 0 && !statusEquipamentoFilterMulti.includes(occurrence.statusEquipamento)) return false;
      if (vendorFilterMulti.length > 0 && !vendorFilterMulti.includes(occurrence.vendor)) return false;
      if (transportadoraFilterMulti.length > 0) {
        if (!occurrence.transportadora || occurrence.transportadora.trim() === '') return false;
        if (!transportadoraFilterMulti.includes(occurrence.transportadora)) return false;
      }
      if (severityFilterMulti.length > 0 && !severityFilterMulti.includes(occurrence.severity)) return false;

      // Filtro de série
      if (serialNumberFilter && !occurrence.serialNumber.toLowerCase().includes(serialNumberFilter.toLowerCase())) return false;

      // Filtro de agência por número
      if (agenciaFilter.length > 0) {
        const agencyNumber = occurrence.agency.match(/\d+/)?.[0] || '';
        if (!agenciaFilter.includes(agencyNumber)) return false;
      }

      // Filtro de UF
      if (ufFilter.length > 0) {
        const agencyUF = occurrence.estado;
        if (!ufFilter.includes(agencyUF)) return false;
      }

      // Tipo de agência
      if (tipoAgenciaFilter.length > 0 && !tipoAgenciaFilter.includes(occurrence.tipoAgencia)) return false;

      // Ponto VIP
      const agencyNumber = occurrence.agency.match(/\d+/)?.[0] || '0';
      const isVip = agencyNumber.endsWith('0') || agencyNumber.endsWith('5');
      const pontoVipStatus = isVip ? 'sim' : 'nao';
      if (pontoVipFilter.length > 0 && !pontoVipFilter.includes(pontoVipStatus)) return false;

      // SUPT
      const agencyNum = parseInt(agencyNumber);
      let agencySupt = '';
      if (agencyNum >= 210 && agencyNum <= 299) agencySupt = agencyNum.toString().substring(0, 2);
      else if (agencyNum >= 510 && agencyNum <= 599) agencySupt = agencyNum.toString().substring(0, 2);
      if (suptFilter.length > 0 && (!agencySupt || !suptFilter.includes(agencySupt))) return false;

      // Motivos
      if (motivoFilter.length > 0 && !motivoFilter.includes(occurrence.motivoOcorrencia)) return false;
      if (motivoImpedimentoFilter.length > 0 && !motivoImpedimentoFilter.includes(occurrence.motivoImpedimento || 'N/A')) return false;

      // Modelo de equipamento
      const occurrenceModel = getModelForOccurrence(occurrence);
      if (selectedEquipmentModels.length > 0 && !selectedEquipmentModels.includes(occurrenceModel)) return false;

      // Impedimento
      if (impedimentoFilter && !occurrence.possuiImpedimento) return false;

      // Previsão SLA
      if (previsaoSlaFilter.length > 0) {
        const createdDate = new Date(occurrence.createdAt);
        const slaHours = occurrence.severity === 'critical' || occurrence.severity === 'high' ? 24 : 72;
        const slaDeadline = new Date(createdDate.getTime() + slaHours * 60 * 60 * 1000);
        
        let matches = false;
        if (previsaoSlaFilter.includes('sem_previsao') && !occurrence.dataPrevisaoEncerramento) matches = true;
        if (previsaoSlaFilter.includes('com_previsao_dentro_sla') && occurrence.dataPrevisaoEncerramento) {
          const previsaoDate = new Date(occurrence.dataPrevisaoEncerramento);
          if (previsaoDate <= slaDeadline) matches = true;
        }
        if (previsaoSlaFilter.includes('previsao_alem_sla') && occurrence.dataPrevisaoEncerramento) {
          const previsaoDate = new Date(occurrence.dataPrevisaoEncerramento);
          if (previsaoDate > slaDeadline) matches = true;
        }
        if (!matches) return false;
      }

      // Filtros especiais
      if (overrideFilter) {
        if (occurrence.status === 'encerrado') return false;
        const createdDate = new Date(occurrence.createdAt);
        const hoursElapsed = (Date.now() - createdDate.getTime()) / (1000 * 60 * 60);
        const slaLimit = occurrence.severity === 'critical' || occurrence.severity === 'high' ? 24 : 72;
        const hoursUntilDue = slaLimit - hoursElapsed;
        const dueToday = hoursUntilDue > 0 && hoursUntilDue <= 24;
        if (!dueToday) return false;
      }

      if (vendorPriorityFilter) {
        const isHighPriority = occurrence.severity === 'critical' || occurrence.severity === 'high';
        if (!isHighPriority) return false;
      }

      if (reincidentFilter) {
        const sameReasonEquipment = occurrences.filter(other => 
          other.id !== occurrence.id &&
          other.description === occurrence.description &&
          other.equipment === occurrence.equipment &&
          other.agency === occurrence.agency
        );
        
        if (sameReasonEquipment.length === 0) return false;
        
        const hasRecentRecurrence = sameReasonEquipment.some(other => {
          const daysDiff = Math.abs(new Date(occurrence.createdAt).getTime() - new Date(other.createdAt).getTime()) / (1000 * 60 * 60 * 24);
          return daysDiff <= 4;
        });
        
        if (!hasRecentRecurrence) return false;
      }

      // Status SLA
      if (statusSlaFilter.length > 0) {
        const occCreatedDate = new Date(occurrence.createdAt);
        const hoursDiff = (Date.now() - occCreatedDate.getTime()) / (1000 * 60 * 60);
        const slaLimit = occurrence.severity === 'critical' || occurrence.severity === 'high' ? 24 : 72;
        const slaEndDate = new Date(occCreatedDate.getTime() + slaLimit * 60 * 60 * 1000);
        
        let currentSlaStatus = '';
        if (occurrence.status === 'encerrado' || occurrence.status === 'cancelado') {
          currentSlaStatus = 'no_prazo';
        } else if (hoursDiff > slaLimit) {
          currentSlaStatus = 'vencido';
        } else if (slaEndDate.toDateString() === new Date().toDateString()) {
          currentSlaStatus = 'critico';
        } else {
          currentSlaStatus = 'no_prazo';
        }
        
        if (!statusSlaFilter.includes(currentSlaStatus)) return false;
      }

      // Aging
      if (agingMin !== null || agingMax !== null) {
        const createdDate = new Date(occurrence.createdAt);
        const agingHours = (Date.now() - createdDate.getTime()) / (1000 * 60 * 60);
        
        if (agingMin !== null) {
          const minHours = parseFloat(agingMin);
          if (agingHours < minHours) return false;
        }
        
        if (agingMax !== null) {
          const maxHours = parseFloat(agingMax);
          if (agingMax !== '999999' && agingHours >= maxHours) return false;
        }
      }

      // Highlights do dashboard
      if (filterType) {
        if (filterType === 'entered-today') {
          const today = new Date();
          const occCreatedDate = new Date(occurrence.createdAt);
          const isToday = today.toDateString() === occCreatedDate.toDateString();
          if (!isToday) return false;
        } else if (filterType === 'due-today') {
          const occCreatedDate = new Date(occurrence.createdAt);
          const slaLimit = occurrence.severity === 'critical' || occurrence.severity === 'high' ? 24 : 72;
          const slaEndDate = new Date(occCreatedDate.getTime() + slaLimit * 60 * 60 * 1000);
          
          const isDueToday = slaEndDate.toDateString() === new Date().toDateString();
          const isNotCompleted = occurrence.status !== 'encerrado' && occurrence.status !== 'cancelado';
          
          if (!(isDueToday && isNotCompleted)) return false;
        } else if (filterType === 'overdue-today') {
          const occCreatedDate = new Date(occurrence.createdAt);
          const hoursDiff = (Date.now() - occCreatedDate.getTime()) / (1000 * 60 * 60);
          const slaLimit = occurrence.severity === 'critical' || occurrence.severity === 'high' ? 24 : 72;
          
          const isNotCompleted = occurrence.status !== 'encerrado' && occurrence.status !== 'cancelado';
          const isOverdue = hoursDiff > slaLimit;
          
          if (!(isNotCompleted && isOverdue)) return false;
        }
      }

      // Query params highlights
      if (createdDate) {
        const filterDate = new Date(createdDate);
        const occCreatedDate = new Date(occurrence.createdAt);
        const isSameDay = filterDate.toDateString() === occCreatedDate.toDateString();
        if (!isSameDay) return false;
      }

      if (slaStatus) {
        const occCreatedDate = new Date(occurrence.createdAt);
        const hoursDiff = (Date.now() - occCreatedDate.getTime()) / (1000 * 60 * 60);
        const slaLimit = occurrence.severity === 'critical' || occurrence.severity === 'high' ? 24 : 72;
        const slaEndDate = new Date(occCreatedDate.getTime() + slaLimit * 60 * 60 * 1000);

        if (slaStatus === 'due_today') {
          const isDueToday = slaEndDate.toDateString() === new Date().toDateString();
          const isNotCompleted = occurrence.status !== 'encerrado' && occurrence.status !== 'cancelado';
          if (!(isDueToday && isNotCompleted)) return false;
        } else if (slaStatus === 'overdue') {
          const isNotCompleted = occurrence.status !== 'encerrado' && occurrence.status !== 'cancelado';
          const isOverdue = hoursDiff > slaLimit;
          if (!(isNotCompleted && isOverdue)) return false;
        }
      }

      return matchesSearch;
    });
  }, [occurrences, filterPeriod, customDateRange, segmentFilterMulti, equipmentFilterMulti, statusFilterMulti, statusEquipamentoFilterMulti, vendorFilterMulti, transportadoraFilterMulti, severityFilterMulti, serialNumberFilter, agenciaFilter, ufFilter, tipoAgenciaFilter, pontoVipFilter, suptFilter, searchTerm, overrideFilter, vendorPriorityFilter, reincidentFilter, statusSlaFilter, motivoFilter, previsaoSlaFilter, selectedEquipmentModels, impedimentoFilter, motivoImpedimentoFilter, agingMin, agingMax, filterType, createdDate, slaStatus]);

  const handleExportExcel = () => {
    // Preparar dados para exportação (ordem alinhada à tabela)
    const exportData = filteredOccurrences.map(occurrence => ({
      'ID': occurrence.id,
      'Agência': occurrence.agency,
      'Segmento': occurrence.segment,
      'Equipamento': occurrence.equipment,
      'Status Equipamento': occurrence.statusEquipamento === 'operante' ? 'Operante' : 'Inoperante',
      'Fornecedor': occurrence.vendor,
      'Status': getStatusLabel(occurrence.status),
      'SLA': getSlaStatus(occurrence),
      'Criticidade': getSeverityLabel(occurrence.severity),
      'Data/Hora Abertura': new Date(occurrence.createdAt).toLocaleString('pt-BR'),
      'Previsão de Atendimento': occurrence.dataPrevisaoEncerramento ? new Date(occurrence.dataPrevisaoEncerramento).toLocaleString('pt-BR') : '',
      'Data Encerramento': occurrence.dataEncerramento ? new Date(occurrence.dataEncerramento).toLocaleString('pt-BR') : '',
      'Impedimento': occurrence.possuiImpedimento ? 'Sim' : 'Não',
      'Motivo Impedimento': occurrence.motivoImpedimento || '',
      'Modelo': getModelForOccurrence(occurrence),
      'N° Série': occurrence.serialNumber || ''
    }));

    // Criar workbook e worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(exportData);

    // Adicionar worksheet ao workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Ocorrências');

    // Gerar arquivo Excel
    const fileName = `ocorrencias_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);

    toast({
      title: "Exportação concluída",
      description: `Arquivo ${fileName} foi baixado com sucesso.`,
    });
  };

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const getSortedOccurrences = () => {
    if (!sortColumn) return filteredOccurrences;

    return [...filteredOccurrences].sort((a, b) => {
      let aValue: any = a[sortColumn as keyof typeof a];
      let bValue: any = b[sortColumn as keyof typeof b];

      // Tratamento especial para datas
      if (sortColumn === 'createdAt' || sortColumn === 'dataPrevisaoEncerramento' || sortColumn === 'dataEncerramento') {
        aValue = aValue ? new Date(aValue).getTime() : 0;
        bValue = bValue ? new Date(bValue).getTime() : 0;
      }

      // Tratamento para strings
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const sortedOccurrences = getSortedOccurrences();

  const getStatusLabel = (status: string) => {
    const statusMap = {
      'a_iniciar': 'A Iniciar',
      'em_andamento': 'Em Andamento',
      'encerrado': 'Encerrado',
      'com_impedimentos': 'Com Impedimentos',
      'cancelado': 'Cancelado'
    };
    return statusMap[status as keyof typeof statusMap] || status;
  };

  const getSeverityLabel = (severity: string) => {
    const severityMap = {
      'critical': 'Crítico',
      'high': 'Alto',
      'medium': 'Médio',
      'low': 'Baixo'
    };
    return severityMap[severity as keyof typeof severityMap] || severity;
  };

  const getSlaStatus = (occurrence: any) => {
    if (occurrence.status === 'encerrado' || occurrence.status === 'cancelado') {
      return 'No Prazo';
    }

    const createdDate = new Date(occurrence.createdAt);
    const hoursDiff = (Date.now() - createdDate.getTime()) / (1000 * 60 * 60);
    const slaLimit = occurrence.severity === 'critical' || occurrence.severity === 'high' ? 24 : 72;
    const slaEndDate = new Date(createdDate.getTime() + slaLimit * 60 * 60 * 1000);

    if (hoursDiff > slaLimit) {
      return 'Vencido';
    } else if (slaEndDate.toDateString() === new Date().toDateString()) {
      return 'Vence Hoje';
    } else {
      return 'No Prazo';
    }
  };

  const getSlaVariant = (occurrence: any) => {
    if (occurrence.status === 'encerrado' || occurrence.status === 'cancelado') {
      return 'secondary';
    }

    const createdDate = new Date(occurrence.createdAt);
    const hoursDiff = (Date.now() - createdDate.getTime()) / (1000 * 60 * 60);
    const slaLimit = occurrence.severity === 'critical' || occurrence.severity === 'high' ? 24 : 72;
    const slaEndDate = new Date(createdDate.getTime() + slaLimit * 60 * 60 * 1000);

    if (hoursDiff > slaLimit) {
      return 'destructive';
    } else if (slaEndDate.toDateString() === new Date().toDateString()) {
      return 'default';
    } else {
      return 'secondary';
    }
  };

  const handleOccurrenceClick = (occurrence: any) => {
    navigate(`/ocorrencia-detalhes/${occurrence.id}`);
  };

  return (
    <COPFLayout>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Ocorrências</h1>
            <p className="text-muted-foreground">
              Gerencie e monitore todas as ocorrências do sistema
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={handleExportExcel} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exportar Excel
            </Button>
            <Button onClick={refreshData} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
          </div>
        </div>

        <FilterSection />

        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <CardTitle className="flex items-center gap-2">
                Lista de Ocorrências
                <Badge variant="secondary">
                  {filteredOccurrences.length} de {occurrences.length}
                </Badge>
              </CardTitle>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por ID, agência ou descrição..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 w-64"
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort('id')}
                    >
                      <div className="flex items-center gap-1">
                        ID
                        {sortColumn === 'id' && (
                          sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort('agency')}
                    >
                      <div className="flex items-center gap-1">
                        Agência
                        {sortColumn === 'agency' && (
                          sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead>Segmento</TableHead>
                    <TableHead>Equipamento</TableHead>
                    <TableHead>Status Equip.</TableHead>
                    <TableHead>Fornecedor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>SLA</TableHead>
                    <TableHead>Criticidade</TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort('createdAt')}
                    >
                      <div className="flex items-center gap-1">
                        Data/Hora Abertura
                        {sortColumn === 'createdAt' && (
                          sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead>Previsão</TableHead>
                    <TableHead>Impedimento</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, index) => (
                      <TableRow key={index}>
                        <TableCell colSpan={13} className="text-center py-8">
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : sortedOccurrences.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={13} className="text-center py-8 text-muted-foreground">
                        Nenhuma ocorrência encontrada com os filtros aplicados.
                      </TableCell>
                    </TableRow>
                  ) : (
                    sortedOccurrences.map((occurrence) => (
                      <TableRow key={occurrence.id} className="hover:bg-muted/50 cursor-pointer">
                        <TableCell className="font-mono text-xs">{occurrence.id}</TableCell>
                        <TableCell>{occurrence.agency}</TableCell>
                        <TableCell>
                          <Badge variant={occurrence.segment === 'AA' ? 'default' : 'secondary'}>
                            {occurrence.segment}
                          </Badge>
                        </TableCell>
                        <TableCell>{occurrence.equipment}</TableCell>
                        <TableCell>
                          <Badge variant={occurrence.statusEquipamento === 'operante' ? 'secondary' : 'destructive'}>
                            {occurrence.statusEquipamento === 'operante' ? 'Operante' : 'Inoperante'}
                          </Badge>
                        </TableCell>
                        <TableCell>{occurrence.vendor}</TableCell>
                        <TableCell>
                          <StatusBadge status={occurrence.status} />
                        </TableCell>
                        <TableCell>
                          <Badge variant={getSlaVariant(occurrence)}>
                            {getSlaStatus(occurrence)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              occurrence.severity === 'critical' ? 'destructive' :
                              occurrence.severity === 'high' ? 'default' :
                              occurrence.severity === 'medium' ? 'secondary' : 'outline'
                            }
                          >
                            {getSeverityLabel(occurrence.severity)}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(occurrence.createdAt).toLocaleString('pt-BR')}</TableCell>
                        <TableCell>
                          {occurrence.dataPrevisaoEncerramento ? new Date(occurrence.dataPrevisaoEncerramento).toLocaleString('pt-BR') : '-'}
                        </TableCell>
                        <TableCell>
                          {occurrence.possuiImpedimento ? (
                            <Badge variant="destructive">Sim</Badge>
                          ) : (
                            <Badge variant="secondary">Não</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOccurrenceClick(occurrence)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </COPFLayout>
  );
};

export default Ocorrencias;