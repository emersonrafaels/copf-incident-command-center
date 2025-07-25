import { COPFLayout } from "@/components/copf/COPFLayout";
import { FilterSection } from "@/components/copf/FilterSection";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Search, Download, Eye, MessageSquare, Bot, Star, Zap, Clock, ChevronUp, ChevronDown } from "lucide-react";
import { StatusBadge } from "@/components/copf/StatusBadge";
import { OccurrenceModal } from "@/components/copf/OccurrenceModal";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useFilters } from "@/contexts/FiltersContext";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import * as XLSX from 'xlsx';
const Ocorrencias = () => {
  const {
    occurrences,
    isLoading
  } = useDashboardData();
  const {
    toast
  } = useToast();
  const [selectedOccurrence, setSelectedOccurrence] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'view' | 'communication' | 'priority_communication'>('view');
  const [searchTerm, setSearchTerm] = useState('');
  const [showBot, setShowBot] = useState(false);
  const [priorityModalOpen, setPriorityModalOpen] = useState(false);
  const [selectedPriorityOccurrence, setSelectedPriorityOccurrence] = useState(null);
  const [sortColumn, setSortColumn] = useState<string>('remainingTime');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Usar filtros do contexto
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
  } = useFilters();

  // Filtrar ocorrências
  const filteredOccurrences = occurrences.filter(occurrence => {
    const matchesSearch = occurrence.id.toLowerCase().includes(searchTerm.toLowerCase()) || occurrence.agency.toLowerCase().includes(searchTerm.toLowerCase()) || occurrence.description.toLowerCase().includes(searchTerm.toLowerCase());

    // Filtros multiselect
    const matchesSegment = segmentFilterMulti.length === 0 || segmentFilterMulti.includes(occurrence.segment);
    const matchesEquipment = equipmentFilterMulti.length === 0 || equipmentFilterMulti.includes(occurrence.equipment);
    const matchesStatus = statusFilterMulti.length === 0 || statusFilterMulti.includes(occurrence.status);
    const matchesVendor = vendorFilterMulti.length === 0 || vendorFilterMulti.includes(occurrence.vendor);

    // Filtro de transportadora
    if (transportadoraFilterMulti.length > 0) {
      const transportadora = occurrence.vendor.includes('Express') ? 'Express Logística' : occurrence.vendor.includes('Tech') ? 'TechTransporte' : 'LogiCorp';
      if (!transportadoraFilterMulti.includes(transportadora)) return false;
    }

    // Filtro de série
    const matchesSerial = !serialNumberFilter || occurrence.serialNumber.toLowerCase().includes(serialNumberFilter.toLowerCase());

    // Filtro de agência por número
    const matchesAgencia = agenciaFilter.length === 0 || agenciaFilter.some(agency => occurrence.agency.includes(agency));

    // Filtro de UF
    const agencyUF = occurrence.agency.split(' - ')[1] || 'SP';
    const matchesUF = ufFilter.length === 0 || ufFilter.includes(agencyUF);

    // Simular tipo de agência baseado na agência
    const tipoAgencia = occurrence.agency.includes('Terceirizada') ? 'terceirizada' : 'convencional';
    const matchesTipoAgencia = tipoAgenciaFilter.length === 0 || tipoAgenciaFilter.includes(tipoAgencia);

    // Simular ponto VIP (agências com número terminado em 0, 5 são VIP)
    const agencyNumber = occurrence.agency.match(/\d+/)?.[0] || '0';
    const isVip = agencyNumber.endsWith('0') || agencyNumber.endsWith('5');
    const pontoVipStatus = isVip ? 'sim' : 'nao';
    const matchesPontoVip = pontoVipFilter.length === 0 || pontoVipFilter.includes(pontoVipStatus);

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
    return matchesSearch && matchesStatus && matchesSegment && matchesEquipment && matchesSerial && matchesVendor && matchesAgencia && matchesUF && matchesTipoAgencia && matchesPontoVip;
  });
  const handleViewDetails = occurrence => {
    setSelectedOccurrence(occurrence);
    setModalMode('view');
    setIsModalOpen(true);
  };
  const handleSendMessage = occurrence => {
    setSelectedOccurrence(occurrence);
    setModalMode('communication');
    setIsModalOpen(true);
  };
  const handlePrioritize = (occurrence, type: 'priority_only' | 'priority_with_message') => {
    if (type === 'priority_only') {
      // Abrir modal para escolher nível de priorização
      setSelectedPriorityOccurrence(occurrence);
      setPriorityModalOpen(true);
    } else {
      // Abrir modal de comunicação para priorizar com mensagem
      setSelectedOccurrence(occurrence);
      setModalMode('priority_communication');
      setIsModalOpen(true);
    }
  };
  const handlePrioritySelect = (level: string) => {
    toast({
      title: "Ocorrência Priorizada",
      description: `Ocorrência ${selectedPriorityOccurrence?.id} foi marcada como prioridade ${level}`
    });
    setPriorityModalOpen(false);
    setSelectedPriorityOccurrence(null);
  };
  const handleExportExcel = () => {
    // Preparar dados para exportação
    const exportData = filteredOccurrences.map(occurrence => ({
      'ID': occurrence.id,
      'Agência': occurrence.agency,
      'Equipamento': occurrence.equipment,
      'Severidade': getSeverityLabel(occurrence.severity),
      'Status': getStatusLabel(occurrence.status),
      'Data/Hora': new Date(occurrence.createdAt).toLocaleString('pt-BR'),
      'Fornecedor': occurrence.vendor,
      'Descrição': occurrence.description
    }));

    // Criar workbook
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Ocorrências");

    // Ajustar largura das colunas
    const wscols = [{
      wch: 10
    },
    // ID
    {
      wch: 30
    },
    // Agência
    {
      wch: 20
    },
    // Equipamento
    {
      wch: 15
    },
    // Severidade
    {
      wch: 15
    },
    // Status
    {
      wch: 20
    },
    // Data/Hora
    {
      wch: 20
    },
    // Fornecedor
    {
      wch: 50
    } // Descrição
    ];
    ws['!cols'] = wscols;

    // Baixar arquivo
    const fileName = `ocorrencias_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
    toast({
      title: "Exportação Concluída",
      description: `Arquivo ${fileName} foi baixado com sucesso.`
    });
  };
  const handleBotInteraction = (message: string) => {
    // Simular resposta do bot
    const responses = ["Analisando as ocorrências... Encontrei 3 ocorrências críticas que precisam de atenção imediata.", "Com base no histórico, o fornecedor TechSol tem respondido 40% mais rápido que a média.", "Recomendo priorizar as ocorrências da Agência Centro, que têm maior impacto nos clientes.", "Identifiquei um padrão: 60% das falhas ocorrem entre 14h-16h. Sugestão: manutenção preventiva neste horário."];
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    setTimeout(() => {
      toast({
        title: "Assistente Virtual",
        description: randomResponse
      });
    }, 1000);
  };
  const getSeverityVariant = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'destructive';
      case 'high':
        return 'secondary';
      case 'medium':
        return 'default';
      default:
        return 'outline';
    }
  };
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
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Aberta';
      case 'pending':
        return 'Em Andamento';
      case 'resolved':
        return 'Resolvida';
      default:
        return status;
    }
  };

  const getSlaStatus = (occurrence: any) => {
    const createdDate = new Date(occurrence.createdAt);
    const hoursDiff = (Date.now() - createdDate.getTime()) / (1000 * 60 * 60);
    const slaLimit = occurrence.severity === 'critical' || occurrence.severity === 'high' ? 24 : 72;
    
    if (occurrence.status === 'resolved' || occurrence.status === 'encerrada') {
      return 'Dentro do SLA';
    }
    
    if (hoursDiff > slaLimit) {
      return 'Vencido';
    } else if (hoursDiff > slaLimit * 0.8) {
      return 'Crítico';
    } else {
      return 'No Prazo';
    }
  };

  const getSlaStatusVariant = (slaStatus: string) => {
    switch (slaStatus) {
      case 'Vencido':
        return 'destructive';
      case 'Crítico':
        return 'secondary';
      case 'No Prazo':
        return 'default';
      default:
        return 'outline';
    }
  };

  const getRemainingTime = (occurrence: any) => {
    const createdDate = new Date(occurrence.createdAt);
    const hoursDiff = (Date.now() - createdDate.getTime()) / (1000 * 60 * 60);
    const slaLimit = occurrence.severity === 'critical' || occurrence.severity === 'high' ? 24 : 72;
    
    if (occurrence.status === 'resolved' || occurrence.status === 'encerrada') {
      return 'Concluída';
    }
    
    const remainingHours = slaLimit - hoursDiff;
    
    if (remainingHours <= 0) {
      const overdueHours = Math.abs(remainingHours);
      if (overdueHours < 1) {
        return `${Math.floor(overdueHours * 60)}min vencido`;
      }
      return `${Math.floor(overdueHours)}h vencido`;
    }
    
    if (remainingHours < 1) {
      return `${Math.floor(remainingHours * 60)}min`;
    }
    
    return `${Math.floor(remainingHours)}h`;
  };

  // Função para converter valores em números para ordenação
  const getSortValue = (occurrence: any, column: string) => {
    switch (column) {
      case 'id':
        return occurrence.id.toLowerCase();
      case 'agency':
        return occurrence.agency.toLowerCase();
      case 'segment':
        return occurrence.segment.toLowerCase();
      case 'equipment':
        return occurrence.equipment.toLowerCase();
      case 'serialNumber':
        return occurrence.serialNumber.toLowerCase();
      case 'severity':
        const severityMap = { 'critical': 4, 'high': 3, 'medium': 2, 'low': 1 };
        return severityMap[occurrence.severity] || 0;
      case 'status':
        return occurrence.status.toLowerCase();
      case 'slaStatus':
        const slaStatusMap = { 'Vencido': 3, 'Crítico': 2, 'No Prazo': 1, 'Dentro do SLA': 0 };
        return slaStatusMap[getSlaStatus(occurrence)] || 0;
      case 'remainingTime':
        const createdDate = new Date(occurrence.createdAt);
        const hoursDiff = (Date.now() - createdDate.getTime()) / (1000 * 60 * 60);
        const slaLimit = occurrence.severity === 'critical' || occurrence.severity === 'high' ? 24 : 72;
        return slaLimit - hoursDiff; // Menor tempo restante = maior urgência
      case 'createdAt':
        return new Date(occurrence.createdAt).getTime();
      case 'vendor':
        return occurrence.vendor.toLowerCase();
      default:
        return '';
    }
  };

  // Função para ordenar ocorrências
  const sortOccurrences = (occurrences: any[]) => {
    return [...occurrences].sort((a, b) => {
      const aValue = getSortValue(a, sortColumn);
      const bValue = getSortValue(b, sortColumn);
      
      // Ordenação primária
      let result = 0;
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        result = aValue - bValue;
      } else {
        result = String(aValue).localeCompare(String(bValue));
      }
      
      // Aplicar direção da ordenação
      if (sortDirection === 'desc') {
        result *= -1;
      }
      
      // Se for ordenação por tempo restante, aplicar ordenação secundária por severidade
      if (sortColumn === 'remainingTime' && result === 0) {
        const aSeverity = getSortValue(a, 'severity');
        const bSeverity = getSortValue(b, 'severity');
        return bSeverity - aSeverity; // Severidade maior primeiro
      }
      
      return result;
    });
  };

  // Função para lidar com clique no cabeçalho
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  // Aplicar ordenação padrão: tempo restante (menor primeiro) + severidade crítica
  const sortedOccurrences = sortOccurrences(filteredOccurrences);
  return <COPFLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Ocorrências</h1>
            <p className="text-muted-foreground">Lista detalhada de todas as ocorrências registradas</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowBot(!showBot)}>
              <Bot className="mr-2 h-4 w-4" />
              Assistente IA
            </Button>
            <Button variant="premium" onClick={handleExportExcel}>
              <Download className="mr-2 h-4 w-4" />
              Exportar Excel
            </Button>
          </div>
        </div>

        {/* Filtros */}
        <FilterSection />

        <Card className="shadow-lg border-0 bg-gradient-to-r from-background to-accent/5">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Search className="h-5 w-5 text-primary" />
                Busca Específica
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Busca Principal */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Buscar por ID, agência ou descrição..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10 h-11 border-2 focus:border-primary/50 transition-colors" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bot Assistente */}
        {showBot && <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                Assistente Virtual - Análise Inteligente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button variant="outline" onClick={() => handleBotInteraction("Analisar ocorrências críticas")} className="text-left p-4 h-auto">
                    <div>
                      <p className="font-medium">Analisar Criticidade</p>
                      <p className="text-sm text-muted-foreground">Identifica ocorrências que precisam de atenção imediata</p>
                    </div>
                  </Button>
                  <Button variant="outline" onClick={() => handleBotInteraction("Analisar performance fornecedores")} className="text-left p-4 h-auto">
                    <div>
                      <p className="font-medium">Performance Fornecedores</p>
                      <p className="text-sm text-muted-foreground">Avalia tempo de resposta e eficiência</p>
                    </div>
                  </Button>
                  <Button variant="outline" onClick={() => handleBotInteraction("Sugerir otimizações")} className="text-left p-4 h-auto">
                    <div>
                      <p className="font-medium">Sugestões de Melhoria</p>
                      <p className="text-sm text-muted-foreground">Recomendações baseadas em padrões identificados</p>
                    </div>
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Input placeholder="Digite sua pergunta sobre as ocorrências..." onKeyPress={e => {
                if (e.key === 'Enter') {
                  handleBotInteraction(e.currentTarget.value);
                  e.currentTarget.value = '';
                }
              }} />
                  <Button size="sm" variant="premium">
                    Perguntar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>}

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Lista de Ocorrências</CardTitle>
              <Badge variant="outline">
                {filteredOccurrences.length} ocorrência(s) encontrada(s)
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? <div className="text-center py-8">
                <p className="text-muted-foreground">Carregando ocorrências...</p>
              </div> : <ScrollArea className="h-[600px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead 
                          className="cursor-pointer hover:bg-accent/50 transition-colors select-none"
                          onClick={() => handleSort('id')}
                        >
                          <div className="flex items-center gap-1 text-sm font-medium">
                            ID
                            <div className="flex flex-col opacity-40 hover:opacity-100 transition-opacity">
                              <ChevronUp className={`h-3 w-3 -mb-1 ${sortColumn === 'id' && sortDirection === 'asc' ? 'opacity-100 text-primary' : ''}`} />
                              <ChevronDown className={`h-3 w-3 ${sortColumn === 'id' && sortDirection === 'desc' ? 'opacity-100 text-primary' : ''}`} />
                            </div>
                          </div>
                        </TableHead>
                        <TableHead 
                          className="cursor-pointer hover:bg-accent/50 transition-colors select-none"
                          onClick={() => handleSort('agency')}
                        >
                          <div className="flex items-center gap-1 text-sm font-medium">
                            Agência
                            <div className="flex flex-col opacity-40 hover:opacity-100 transition-opacity">
                              <ChevronUp className={`h-3 w-3 -mb-1 ${sortColumn === 'agency' && sortDirection === 'asc' ? 'opacity-100 text-primary' : ''}`} />
                              <ChevronDown className={`h-3 w-3 ${sortColumn === 'agency' && sortDirection === 'desc' ? 'opacity-100 text-primary' : ''}`} />
                            </div>
                          </div>
                        </TableHead>
                        <TableHead 
                          className="cursor-pointer hover:bg-accent/50 transition-colors select-none"
                          onClick={() => handleSort('segment')}
                        >
                          <div className="flex items-center gap-1 text-sm font-medium">
                            Segmento
                            <div className="flex flex-col opacity-40 hover:opacity-100 transition-opacity">
                              <ChevronUp className={`h-3 w-3 -mb-1 ${sortColumn === 'segment' && sortDirection === 'asc' ? 'opacity-100 text-primary' : ''}`} />
                              <ChevronDown className={`h-3 w-3 ${sortColumn === 'segment' && sortDirection === 'desc' ? 'opacity-100 text-primary' : ''}`} />
                            </div>
                          </div>
                        </TableHead>
                        <TableHead 
                          className="cursor-pointer hover:bg-accent/50 transition-colors select-none"
                          onClick={() => handleSort('equipment')}
                        >
                          <div className="flex items-center gap-1 text-sm font-medium">
                            Equipamento
                            <div className="flex flex-col opacity-40 hover:opacity-100 transition-opacity">
                              <ChevronUp className={`h-3 w-3 -mb-1 ${sortColumn === 'equipment' && sortDirection === 'asc' ? 'opacity-100 text-primary' : ''}`} />
                              <ChevronDown className={`h-3 w-3 ${sortColumn === 'equipment' && sortDirection === 'desc' ? 'opacity-100 text-primary' : ''}`} />
                            </div>
                          </div>
                        </TableHead>
                        <TableHead 
                          className="cursor-pointer hover:bg-accent/50 transition-colors select-none"
                          onClick={() => handleSort('serialNumber')}
                        >
                          <div className="flex items-center gap-1 text-sm font-medium">
                            Nº Série
                            <div className="flex flex-col opacity-40 hover:opacity-100 transition-opacity">
                              <ChevronUp className={`h-3 w-3 -mb-1 ${sortColumn === 'serialNumber' && sortDirection === 'asc' ? 'opacity-100 text-primary' : ''}`} />
                              <ChevronDown className={`h-3 w-3 ${sortColumn === 'serialNumber' && sortDirection === 'desc' ? 'opacity-100 text-primary' : ''}`} />
                            </div>
                          </div>
                        </TableHead>
                        <TableHead 
                          className="cursor-pointer hover:bg-accent/50 transition-colors select-none"
                          onClick={() => handleSort('severity')}
                        >
                          <div className="flex items-center gap-1 text-sm font-medium">
                            Severidade
                            <div className="flex flex-col opacity-40 hover:opacity-100 transition-opacity">
                              <ChevronUp className={`h-3 w-3 -mb-1 ${sortColumn === 'severity' && sortDirection === 'asc' ? 'opacity-100 text-primary' : ''}`} />
                              <ChevronDown className={`h-3 w-3 ${sortColumn === 'severity' && sortDirection === 'desc' ? 'opacity-100 text-primary' : ''}`} />
                            </div>
                          </div>
                        </TableHead>
                        <TableHead 
                          className="cursor-pointer hover:bg-accent/50 transition-colors select-none"
                          onClick={() => handleSort('status')}
                        >
                          <div className="flex items-center gap-1 text-sm font-medium">
                            Status
                            <div className="flex flex-col opacity-40 hover:opacity-100 transition-opacity">
                              <ChevronUp className={`h-3 w-3 -mb-1 ${sortColumn === 'status' && sortDirection === 'asc' ? 'opacity-100 text-primary' : ''}`} />
                              <ChevronDown className={`h-3 w-3 ${sortColumn === 'status' && sortDirection === 'desc' ? 'opacity-100 text-primary' : ''}`} />
                            </div>
                          </div>
                        </TableHead>
                        <TableHead 
                          className="cursor-pointer hover:bg-accent/50 transition-colors select-none"
                          onClick={() => handleSort('slaStatus')}
                        >
                          <div className="flex items-center gap-1 text-sm font-medium">
                            Status SLA
                            <div className="flex flex-col opacity-40 hover:opacity-100 transition-opacity">
                              <ChevronUp className={`h-3 w-3 -mb-1 ${sortColumn === 'slaStatus' && sortDirection === 'asc' ? 'opacity-100 text-primary' : ''}`} />
                              <ChevronDown className={`h-3 w-3 ${sortColumn === 'slaStatus' && sortDirection === 'desc' ? 'opacity-100 text-primary' : ''}`} />
                            </div>
                          </div>
                        </TableHead>
                        <TableHead 
                          className="cursor-pointer hover:bg-accent/50 transition-colors bg-primary/5 select-none"
                          onClick={() => handleSort('remainingTime')}
                        >
                          <div className="flex items-center gap-1 font-semibold">
                            Tempo Restante
                            <div className="flex flex-col opacity-60 hover:opacity-100 transition-opacity">
                              <ChevronUp className={`h-3 w-3 -mb-1 ${sortColumn === 'remainingTime' && sortDirection === 'asc' ? 'opacity-100 text-primary' : 'text-primary'}`} />
                              <ChevronDown className={`h-3 w-3 ${sortColumn === 'remainingTime' && sortDirection === 'desc' ? 'opacity-100 text-primary' : 'text-primary'}`} />
                            </div>
                          </div>
                        </TableHead>
                        <TableHead 
                          className="cursor-pointer hover:bg-accent/50 transition-colors select-none"
                          onClick={() => handleSort('createdAt')}
                        >
                          <div className="flex items-center gap-1 text-sm font-medium">
                            Data/Hora Abertura
                            <div className="flex flex-col opacity-40 hover:opacity-100 transition-opacity">
                              <ChevronUp className={`h-3 w-3 -mb-1 ${sortColumn === 'createdAt' && sortDirection === 'asc' ? 'opacity-100 text-primary' : ''}`} />
                              <ChevronDown className={`h-3 w-3 ${sortColumn === 'createdAt' && sortDirection === 'desc' ? 'opacity-100 text-primary' : ''}`} />
                            </div>
                          </div>
                        </TableHead>
                        <TableHead 
                          className="cursor-pointer hover:bg-accent/50 transition-colors select-none"
                          onClick={() => handleSort('vendor')}
                        >
                          <div className="flex items-center gap-1 text-sm font-medium">
                            Fornecedor
                            <div className="flex flex-col opacity-40 hover:opacity-100 transition-opacity">
                              <ChevronUp className={`h-3 w-3 -mb-1 ${sortColumn === 'vendor' && sortDirection === 'asc' ? 'opacity-100 text-primary' : ''}`} />
                              <ChevronDown className={`h-3 w-3 ${sortColumn === 'vendor' && sortDirection === 'desc' ? 'opacity-100 text-primary' : ''}`} />
                            </div>
                          </div>
                        </TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                  <TableBody>
                    {sortedOccurrences.map(occurrence => <TableRow key={occurrence.id}>
                        <TableCell className="font-medium">{occurrence.id}</TableCell>
                        <TableCell className="max-w-[200px] truncate">{occurrence.agency}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{occurrence.segment}</Badge>
                        </TableCell>
                        <TableCell className="max-w-[150px] truncate">{occurrence.equipment}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{occurrence.serialNumber}</TableCell>
                        <TableCell>
                          <Badge variant={getSeverityVariant(occurrence.severity)}>
                            {getSeverityLabel(occurrence.severity)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={occurrence.status} />
                        </TableCell>
                        <TableCell>
                          <Badge variant={getSlaStatusVariant(getSlaStatus(occurrence))}>
                            {getSlaStatus(occurrence)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm font-medium">
                          {getRemainingTime(occurrence)}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(occurrence.createdAt).toLocaleString('pt-BR')}
                        </TableCell>
                        <TableCell className="text-sm">{occurrence.vendor}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm" onClick={() => handleViewDetails(occurrence)} title="Visualizar detalhes">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="h-8 px-3" title="Ações da ocorrência">
                                  <MessageSquare className="h-4 w-4 mr-1" />
                                  <span className="text-xs">Ações</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem onClick={() => handlePrioritize(occurrence, 'priority_only')}>
                                  <Zap className="mr-2 h-4 w-4" />
                                  Apenas Priorizar
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handlePrioritize(occurrence, 'priority_with_message')}>
                                  <MessageSquare className="mr-2 h-4 w-4" />
                                  Priorizar + Mensagem
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleSendMessage(occurrence)}>
                                  <MessageSquare className="mr-2 h-4 w-4" />
                                  Apenas Mensagem
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>)}
                  </TableBody>
                </Table>
              </ScrollArea>}
          </CardContent>
        </Card>
      </div>

      <OccurrenceModal occurrence={selectedOccurrence} open={isModalOpen} onOpenChange={setIsModalOpen} mode={modalMode} />

      {/* Modal de seleção de prioridade */}
      <Dialog open={priorityModalOpen} onOpenChange={setPriorityModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Selecionar Nível de Prioridade</DialogTitle>
            <DialogDescription>
              Escolha o nível de prioridade para a ocorrência {selectedPriorityOccurrence?.id}
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-3 py-4">
            <Button variant="destructive" onClick={() => handlePrioritySelect('Crítica')} className="justify-start h-auto p-4">
              <div className="flex items-start gap-3">
                <Zap className="h-5 w-5 mt-0.5 text-destructive-foreground" />
                <div className="text-left">
                  <p className="font-medium">Prioridade Crítica</p>
                  <p className="text-sm opacity-90">Requer atenção imediata - SLA 2h</p>
                </div>
              </div>
            </Button>
            <Button variant="secondary" onClick={() => handlePrioritySelect('Alta')} className="justify-start h-auto p-4">
              <div className="flex items-start gap-3">
                <Star className="h-5 w-5 mt-0.5" />
                <div className="text-left">
                  <p className="font-medium">Prioridade Alta</p>
                  <p className="text-sm text-muted-foreground">Importante - SLA 4h</p>
                </div>
              </div>
            </Button>
            <Button variant="outline" onClick={() => handlePrioritySelect('Média')} className="justify-start h-auto p-4">
              <div className="flex items-start gap-3">
                <MessageSquare className="h-5 w-5 mt-0.5" />
                <div className="text-left">
                  <p className="font-medium">Prioridade Média</p>
                  <p className="text-sm text-muted-foreground">Padrão - SLA 8h</p>
                </div>
              </div>
            </Button>
            <Button variant="outline" onClick={() => handlePrioritySelect('Baixa')} className="justify-start h-auto p-4">
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 mt-0.5" />
                <div className="text-left">
                  <p className="font-medium">Prioridade Baixa</p>
                  <p className="text-sm text-muted-foreground">Não urgente - SLA 24h</p>
                </div>
              </div>
            </Button>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPriorityModalOpen(false)}>
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </COPFLayout>;
};
export default Ocorrencias;