import { COPFLayout } from "@/components/copf/COPFLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Filter, Download, Eye, MessageSquare } from "lucide-react";
import { StatusBadge } from "@/components/copf/StatusBadge";
import { OccurrenceModal } from "@/components/copf/OccurrenceModal";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const Ocorrencias = () => {
  const { occurrences, isLoading } = useDashboardData()
  const { toast } = useToast()
  const [selectedOccurrence, setSelectedOccurrence] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [severityFilter, setSeverityFilter] = useState('all')
  const [vendorPriorityFilter, setVendorPriorityFilter] = useState(false)

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
    setIsModalOpen(true)
  }

  const handleExportCSV = () => {
    toast({
      title: "Exportação Iniciada",
      description: "O arquivo CSV será baixado em instantes.",
    })
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
          <Button variant="premium" onClick={handleExportCSV}>
            <Download className="mr-2 h-4 w-4" />
            Exportar CSV
          </Button>
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
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleViewDetails(occurrence)}
                          >
                            <MessageSquare className="h-4 w-4" />
                          </Button>
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
      />
    </COPFLayout>
  );
};

export default Ocorrencias;