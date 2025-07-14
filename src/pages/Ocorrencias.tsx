import { COPFLayout } from "@/components/copf/COPFLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, Filter, Download, Eye, MessageSquare, Bot, Star, MoreHorizontal, Zap, Clock, X, Building, Package, Hash, AlertTriangle } from "lucide-react";
import { StatusBadge } from "@/components/copf/StatusBadge";
import { OccurrenceModal } from "@/components/copf/OccurrenceModal";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import * as XLSX from 'xlsx';

const Ocorrencias = () => {
  const { occurrences, isLoading } = useDashboardData()
  const { toast } = useToast()
  const [selectedOccurrence, setSelectedOccurrence] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'view' | 'communication' | 'priority_communication'>('view')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [severityFilter, setSeverityFilter] = useState('all')
  const [vendorPriorityFilter, setVendorPriorityFilter] = useState(false)
  const [segmentFilter, setSegmentFilter] = useState('all')
  const [equipmentFilter, setEquipmentFilter] = useState('all')
  const [serialNumberFilter, setSerialNumberFilter] = useState('')
  const [showBot, setShowBot] = useState(false)
  const [priorityModalOpen, setPriorityModalOpen] = useState(false)
  const [selectedPriorityOccurrence, setSelectedPriorityOccurrence] = useState(null)

  // Filtrar ocorrências
  const filteredOccurrences = occurrences.filter(occurrence => {
    const matchesSearch = 
      occurrence.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      occurrence.agency.toLowerCase().includes(searchTerm.toLowerCase()) ||
      occurrence.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || occurrence.status === statusFilter
    const matchesSeverity = severityFilter === 'all' || occurrence.severity === severityFilter
    const matchesSegment = segmentFilter === 'all' || occurrence.segment === segmentFilter
    const matchesEquipment = equipmentFilter === 'all' || occurrence.equipment === equipmentFilter
    const matchesSerial = !serialNumberFilter || occurrence.serialNumber.toLowerCase().includes(serialNumberFilter.toLowerCase())
    
    // Simular lógica de priorização para fornecedor (críticas e altas são priorizadas)
    const isVendorPriority = occurrence.severity === 'critical' || occurrence.severity === 'high'
    const matchesVendorPriority = !vendorPriorityFilter || isVendorPriority

    return matchesSearch && matchesStatus && matchesSeverity && matchesSegment && matchesEquipment && matchesSerial && matchesVendorPriority
  })

  // Obter equipamentos únicos para o filtro
  const uniqueEquipments = Array.from(new Set(occurrences.map(o => o.equipment))).sort()

  // Verificar se há filtros ativos
  const hasActiveFilters = searchTerm || statusFilter !== 'all' || severityFilter !== 'all' || 
    segmentFilter !== 'all' || equipmentFilter !== 'all' || serialNumberFilter || vendorPriorityFilter

  // Limpar todos os filtros
  const clearAllFilters = () => {
    setSearchTerm('')
    setStatusFilter('all')
    setSeverityFilter('all')
    setSegmentFilter('all')
    setEquipmentFilter('all')
    setSerialNumberFilter('')
    setVendorPriorityFilter(false)
  }

  const handleViewDetails = (occurrence) => {
    setSelectedOccurrence(occurrence)
    setModalMode('view')
    setIsModalOpen(true)
  }

  const handleSendMessage = (occurrence) => {
    setSelectedOccurrence(occurrence)
    setModalMode('communication')
    setIsModalOpen(true)
  }

  const handlePrioritize = (occurrence, type: 'priority_only' | 'priority_with_message') => {
    if (type === 'priority_only') {
      // Abrir modal para escolher nível de priorização
      setSelectedPriorityOccurrence(occurrence)
      setPriorityModalOpen(true)
    } else {
      // Abrir modal de comunicação para priorizar com mensagem
      setSelectedOccurrence(occurrence)
      setModalMode('priority_communication')
      setIsModalOpen(true)
    }
  }

  const handlePrioritySelect = (level: string) => {
    toast({
      title: "Ocorrência Priorizada",
      description: `Ocorrência ${selectedPriorityOccurrence?.id} foi marcada como prioridade ${level}`,
    })
    setPriorityModalOpen(false)
    setSelectedPriorityOccurrence(null)
  }

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
      'Responsável': occurrence.assignedTo,
      'Descrição': occurrence.description
    }))

    // Criar workbook
    const ws = XLSX.utils.json_to_sheet(exportData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Ocorrências")

    // Ajustar largura das colunas
    const wscols = [
      { wch: 10 }, // ID
      { wch: 30 }, // Agência
      { wch: 20 }, // Equipamento
      { wch: 15 }, // Severidade
      { wch: 15 }, // Status
      { wch: 20 }, // Data/Hora
      { wch: 20 }, // Fornecedor
      { wch: 20 }, // Responsável
      { wch: 50 }  // Descrição
    ]
    ws['!cols'] = wscols

    // Baixar arquivo
    const fileName = `ocorrencias_${new Date().toISOString().split('T')[0]}.xlsx`
    XLSX.writeFile(wb, fileName)

    toast({
      title: "Exportação Concluída",
      description: `Arquivo ${fileName} foi baixado com sucesso.`,
    })
  }

  const handleBotInteraction = (message: string) => {
    // Simular resposta do bot
    const responses = [
      "Analisando as ocorrências... Encontrei 3 ocorrências críticas que precisam de atenção imediata.",
      "Com base no histórico, o fornecedor TechSol tem respondido 40% mais rápido que a média.",
      "Recomendo priorizar as ocorrências da Agência Centro, que têm maior impacto nos clientes.",
      "Identifiquei um padrão: 60% das falhas ocorrem entre 14h-16h. Sugestão: manutenção preventiva neste horário."
    ]
    
    const randomResponse = responses[Math.floor(Math.random() * responses.length)]
    
    setTimeout(() => {
      toast({
        title: "Assistente Virtual",
        description: randomResponse,
      })
    }, 1000)
  }

  const getSeverityVariant = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive'
      case 'high': return 'secondary'
      case 'medium': return 'default'
      default: return 'outline'
    }
  }

  const getSeverityLabel = (severity: string) => {
    switch (severity) {
      case 'critical': return 'Crítica'
      case 'high': return 'Alta'
      case 'medium': return 'Média'
      case 'low': return 'Baixa'
      default: return severity
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Aberta'
      case 'pending': return 'Em Andamento'
      case 'resolved': return 'Resolvida'
      default: return status
    }
  }

  return (
    <COPFLayout>
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

        <Card className="shadow-lg border-0 bg-gradient-to-r from-background to-accent/5">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Filter className="h-5 w-5 text-primary" />
                Filtros e Busca
              </CardTitle>
              {hasActiveFilters && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={clearAllFilters}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4 mr-2" />
                  Limpar Filtros
                </Button>
              )}
            </div>
            {hasActiveFilters && (
              <div className="flex flex-wrap gap-2 mt-2">
                {searchTerm && (
                  <Badge variant="secondary" className="text-xs">
                    Busca: {searchTerm}
                    <X 
                      className="h-3 w-3 ml-1 cursor-pointer hover:bg-destructive/20 rounded-full" 
                      onClick={() => setSearchTerm('')}
                    />
                  </Badge>
                )}
                {statusFilter !== 'all' && (
                  <Badge variant="secondary" className="text-xs">
                    Status: {getStatusLabel(statusFilter)}
                    <X 
                      className="h-3 w-3 ml-1 cursor-pointer hover:bg-destructive/20 rounded-full" 
                      onClick={() => setStatusFilter('all')}
                    />
                  </Badge>
                )}
                {severityFilter !== 'all' && (
                  <Badge variant="secondary" className="text-xs">
                    Severidade: {getSeverityLabel(severityFilter)}
                    <X 
                      className="h-3 w-3 ml-1 cursor-pointer hover:bg-destructive/20 rounded-full" 
                      onClick={() => setSeverityFilter('all')}
                    />
                  </Badge>
                )}
                {segmentFilter !== 'all' && (
                  <Badge variant="secondary" className="text-xs">
                    Segmento: {segmentFilter}
                    <X 
                      className="h-3 w-3 ml-1 cursor-pointer hover:bg-destructive/20 rounded-full" 
                      onClick={() => setSegmentFilter('all')}
                    />
                  </Badge>
                )}
                {equipmentFilter !== 'all' && (
                  <Badge variant="secondary" className="text-xs">
                    Equipamento: {equipmentFilter}
                    <X 
                      className="h-3 w-3 ml-1 cursor-pointer hover:bg-destructive/20 rounded-full" 
                      onClick={() => setEquipmentFilter('all')}
                    />
                  </Badge>
                )}
                {serialNumberFilter && (
                  <Badge variant="secondary" className="text-xs">
                    Nº Série: {serialNumberFilter}
                    <X 
                      className="h-3 w-3 ml-1 cursor-pointer hover:bg-destructive/20 rounded-full" 
                      onClick={() => setSerialNumberFilter('')}
                    />
                  </Badge>
                )}
                {vendorPriorityFilter && (
                  <Badge variant="secondary" className="text-xs">
                    Priorizadas
                    <X 
                      className="h-3 w-3 ml-1 cursor-pointer hover:bg-destructive/20 rounded-full" 
                      onClick={() => setVendorPriorityFilter(false)}
                    />
                  </Badge>
                )}
              </div>
            )}
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Busca Principal */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Buscar por ID, agência ou descrição..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-11 border-2 focus:border-primary/50 transition-colors"
                />
              </div>

              {/* Filtros Agrupados */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Status e Severidade */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Status & Severidade
                  </label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Selecionar status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os Status</SelectItem>
                      <SelectItem value="active">Abertas</SelectItem>
                      <SelectItem value="pending">Em Andamento</SelectItem>
                      <SelectItem value="resolved">Resolvidas</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={severityFilter} onValueChange={setSeverityFilter}>
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Selecionar severidade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as Severidades</SelectItem>
                      <SelectItem value="critical">Crítica</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                      <SelectItem value="medium">Média</SelectItem>
                      <SelectItem value="low">Baixa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Segmento e Equipamento */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    Local & Equipamento
                  </label>
                  <Select value={segmentFilter} onValueChange={setSegmentFilter}>
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Selecionar segmento" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os Segmentos</SelectItem>
                      <SelectItem value="AA">Segmento AA</SelectItem>
                      <SelectItem value="AB">Segmento AB</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={equipmentFilter} onValueChange={setEquipmentFilter}>
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Selecionar equipamento" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os Equipamentos</SelectItem>
                      {uniqueEquipments.map(equipment => (
                        <SelectItem key={equipment} value={equipment}>{equipment}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Número de Série */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Hash className="h-4 w-4" />
                    Número de Série
                  </label>
                  <div className="relative">
                    <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Ex: ATM001-SP-001"
                      value={serialNumberFilter}
                      onChange={(e) => setSerialNumberFilter(e.target.value)}
                      className="pl-10 h-10"
                    />
                  </div>
                </div>

                {/* Opções Especiais */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Star className="h-4 w-4" />
                    Opções Especiais
                  </label>
                  <div className="flex items-center space-x-3 p-3 border rounded-lg bg-accent/20 hover:bg-accent/30 transition-colors">
                    <Checkbox 
                      id="vendor-priority"
                      checked={vendorPriorityFilter}
                      onCheckedChange={(checked) => setVendorPriorityFilter(checked === true)}
                    />
                    <label 
                      htmlFor="vendor-priority" 
                      className="text-sm font-medium leading-none cursor-pointer flex-1"
                    >
                      Priorizadas para Fornecedor
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bot Assistente */}
        {showBot && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                Assistente Virtual - Análise Inteligente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button 
                    variant="outline" 
                    onClick={() => handleBotInteraction("Analisar ocorrências críticas")}
                    className="text-left p-4 h-auto"
                  >
                    <div>
                      <p className="font-medium">Analisar Criticidade</p>
                      <p className="text-sm text-muted-foreground">Identifica ocorrências que precisam de atenção imediata</p>
                    </div>
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => handleBotInteraction("Analisar performance fornecedores")}
                    className="text-left p-4 h-auto"
                  >
                    <div>
                      <p className="font-medium">Performance Fornecedores</p>
                      <p className="text-sm text-muted-foreground">Avalia tempo de resposta e eficiência</p>
                    </div>
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => handleBotInteraction("Sugerir otimizações")}
                    className="text-left p-4 h-auto"
                  >
                    <div>
                      <p className="font-medium">Sugestões de Melhoria</p>
                      <p className="text-sm text-muted-foreground">Recomendações baseadas em padrões identificados</p>
                    </div>
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Input 
                    placeholder="Digite sua pergunta sobre as ocorrências..." 
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleBotInteraction(e.currentTarget.value)
                        e.currentTarget.value = ''
                      }
                    }}
                  />
                  <Button size="sm" variant="premium">
                    Perguntar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

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
            {isLoading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Carregando ocorrências...</p>
              </div>
            ) : (
              <ScrollArea className="h-[600px]">
                <Table>
                  <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Agência</TableHead>
                    <TableHead>Segmento</TableHead>
                    <TableHead>Equipamento</TableHead>
                    <TableHead>Nº Série</TableHead>
                    <TableHead>Severidade</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data/Hora</TableHead>
                    <TableHead>Fornecedor</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOccurrences.map((occurrence) => (
                    <TableRow key={occurrence.id}>
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
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(occurrence.createdAt).toLocaleString('pt-BR')}
                      </TableCell>
                      <TableCell className="text-sm">{occurrence.vendor}</TableCell>
                       <TableCell>
                         <div className="flex gap-1">
                           <Button 
                             variant="ghost" 
                             size="sm"
                             onClick={() => handleViewDetails(occurrence)}
                             title="Visualizar detalhes"
                           >
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
                                  <DropdownMenuItem 
                                    onClick={() => handlePrioritize(occurrence, 'priority_only')}
                                  >
                                    <Zap className="mr-2 h-4 w-4" />
                                    Apenas Priorizar
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => handlePrioritize(occurrence, 'priority_with_message')}
                                  >
                                    <MessageSquare className="mr-2 h-4 w-4" />
                                    Priorizar + Mensagem
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => handleSendMessage(occurrence)}
                                  >
                                    <MessageSquare className="mr-2 h-4 w-4" />
                                    Apenas Mensagem
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                         </div>
                       </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>

      <OccurrenceModal
        occurrence={selectedOccurrence}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        mode={modalMode}
      />

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
            <Button
              variant="destructive"
              onClick={() => handlePrioritySelect('Crítica')}
              className="justify-start h-auto p-4"
            >
              <div className="flex items-start gap-3">
                <Zap className="h-5 w-5 mt-0.5 text-destructive-foreground" />
                <div className="text-left">
                  <p className="font-medium">Prioridade Crítica</p>
                  <p className="text-sm opacity-90">Requer atenção imediata - SLA 2h</p>
                </div>
              </div>
            </Button>
            <Button
              variant="secondary"
              onClick={() => handlePrioritySelect('Alta')}
              className="justify-start h-auto p-4"
            >
              <div className="flex items-start gap-3">
                <Star className="h-5 w-5 mt-0.5" />
                <div className="text-left">
                  <p className="font-medium">Prioridade Alta</p>
                  <p className="text-sm text-muted-foreground">Importante - SLA 4h</p>
                </div>
              </div>
            </Button>
            <Button
              variant="outline"
              onClick={() => handlePrioritySelect('Média')}
              className="justify-start h-auto p-4"
            >
              <div className="flex items-start gap-3">
                <MessageSquare className="h-5 w-5 mt-0.5" />
                <div className="text-left">
                  <p className="font-medium">Prioridade Média</p>
                  <p className="text-sm text-muted-foreground">Padrão - SLA 8h</p>
                </div>
              </div>
            </Button>
            <Button
              variant="outline"
              onClick={() => handlePrioritySelect('Baixa')}
              className="justify-start h-auto p-4"
            >
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
    </COPFLayout>
  );
};

export default Ocorrencias;