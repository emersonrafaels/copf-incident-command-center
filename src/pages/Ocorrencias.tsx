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
import { Search, Filter, Download, Eye, MessageSquare, Bot, Star, MoreHorizontal, Zap } from "lucide-react";
import { StatusBadge } from "@/components/copf/StatusBadge";
import { OccurrenceModal } from "@/components/copf/OccurrenceModal";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from 'xlsx';

const Ocorrencias = () => {
  const { occurrences, isLoading } = useDashboardData()
  const { toast } = useToast()
  const [selectedOccurrence, setSelectedOccurrence] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'view' | 'communication'>('view')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [severityFilter, setSeverityFilter] = useState('all')
  const [vendorPriorityFilter, setVendorPriorityFilter] = useState(false)
  const [showBot, setShowBot] = useState(false)

  // Filtrar ocorrências
  const filteredOccurrences = occurrences.filter(occurrence => {
    const matchesSearch = 
      occurrence.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      occurrence.agency.toLowerCase().includes(searchTerm.toLowerCase()) ||
      occurrence.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || occurrence.status === statusFilter
    const matchesSeverity = severityFilter === 'all' || occurrence.severity === severityFilter
    
    // Simular lógica de priorização para fornecedor (críticas e altas são priorizadas)
    const isVendorPriority = occurrence.severity === 'critical' || occurrence.severity === 'high'
    const matchesVendorPriority = !vendorPriorityFilter || isVendorPriority

    return matchesSearch && matchesStatus && matchesSeverity && matchesVendorPriority
  })

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
      toast({
        title: "Ocorrência Priorizada",
        description: `Ocorrência ${occurrence.id} foi marcada como prioritária`,
      })
    } else {
      // Abrir modal de comunicação para priorizar com mensagem
      setSelectedOccurrence(occurrence)
      setModalMode('communication')
      setIsModalOpen(true)
    }
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

        <Card>
          <CardHeader>
            <CardTitle>Filtros e Busca</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="responsive-grid responsive-grid-4">
              <div>
                <Input 
                  placeholder="Buscar por ID, agência..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Status</SelectItem>
                  <SelectItem value="active">Abertas</SelectItem>
                  <SelectItem value="pending">Em Andamento</SelectItem>
                  <SelectItem value="resolved">Resolvidas</SelectItem>
                </SelectContent>
              </Select>

              <Select value={severityFilter} onValueChange={setSeverityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Severidade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Severidades</SelectItem>
                  <SelectItem value="critical">Crítica</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="medium">Média</SelectItem>
                  <SelectItem value="low">Baixa</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="vendor-priority"
                  checked={vendorPriorityFilter}
                  onCheckedChange={(checked) => setVendorPriorityFilter(checked === true)}
                />
                <label 
                  htmlFor="vendor-priority" 
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Priorizadas para Fornecedor
                </label>
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
                    <TableHead>Equipamento</TableHead>
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
                      <TableCell className="max-w-[150px] truncate">{occurrence.equipment}</TableCell>
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
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleSendMessage(occurrence)}
                              title="Enviar mensagem"
                            >
                              <MessageSquare className="h-4 w-4" />
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
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
    </COPFLayout>
  );
};

export default Ocorrencias;