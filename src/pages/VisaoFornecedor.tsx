import { COPFLayout } from "@/components/copf/COPFLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp, 
  Building2,
  MessageSquare,
  Send,
  Bell,
  Star,
  Paperclip,
  Flag,
  Download,
  Reply,
  FileText,
  History,
  Zap
} from "lucide-react";
import { StatusBadge } from "@/components/copf/StatusBadge";
import { MessageTemplates } from "@/components/copf/MessageTemplates";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const VisaoFornecedor = () => {
  const { occurrences, isLoading } = useDashboardData()
  const { toast } = useToast()
  const [responseText, setResponseText] = useState("")
  const [selectedMessageId, setSelectedMessageId] = useState<number | null>(null)
  const [replyText, setReplyText] = useState("")
  
  // Simular fornecedor logado
  const currentVendor = 'TechSoluções Ltda'
  
  // Mock de ocorrências do fornecedor atual
  const vendorOccurrences = [
    {
      id: "OCC-2024-001",
      equipment: "ATM AG-001 - Terminal Principal",
      severity: "critical",
      status: "pending" as const,
      createdAt: "2024-01-15T10:30:00Z",
      vendor: currentVendor,
      agency: "AG0001 - Centro (São Paulo)"
    },
    {
      id: "OCC-2024-003",
      equipment: "Router CORE-02 - Sala Servidores",
      severity: "high",
      status: "pending" as const,
      createdAt: "2024-01-15T08:45:00Z",
      vendor: currentVendor,
      agency: "AG0015 - Paulista (São Paulo)"
    },
    {
      id: "OCC-2024-005",
      equipment: "Servidor APP-01 - Data Center",
      severity: "medium",
      status: "resolved" as const,
      createdAt: "2024-01-15T07:20:00Z",
      vendor: currentVendor,
      agency: "AG0032 - Vila Madalena (São Paulo)"
    },
    {
      id: "OCC-2024-007",
      equipment: "Switch NET-05 - Rede Principal",
      severity: "critical",
      status: "pending" as const,
      createdAt: "2024-01-14T16:15:00Z",
      vendor: currentVendor,
      agency: "AG0045 - Pinheiros (São Paulo)"
    },
    {
      id: "OCC-2024-009",
      equipment: "UPS-03 - Alimentação Crítica",
      severity: "high",
      status: "pending" as const,
      createdAt: "2024-01-14T14:30:00Z",
      vendor: currentVendor,
      agency: "AG0067 - Moema (São Paulo)"
    }
  ]
  
  // Ocorrências priorizadas para este fornecedor
  const prioritizedOccurrences = vendorOccurrences.filter(occ => 
    occ.severity === 'critical' || occ.severity === 'high'
  )
  
  // Simular ocorrências resolvidas
  const resolvedOccurrences = [
    {
      id: "OCC-2024-R001",
      equipment: "ATM AG-005 - Terminal Principal",
      severity: "high",
      resolvedAt: "2024-01-14T16:30:00Z",
      resolutionTime: "1.5h",
      satisfactionScore: 5,
      resolutionSummary: "Substituição do módulo de dispensador de cédulas"
    },
    {
      id: "OCC-2024-R002", 
      equipment: "Router CORE-02 - Sala Servidores",
      severity: "critical",
      resolvedAt: "2024-01-13T14:15:00Z",
      resolutionTime: "45min",
      satisfactionScore: 4,
      resolutionSummary: "Reinicialização do equipamento após atualização de firmware"
    },
    {
      id: "OCC-2024-R003",
      equipment: "Servidor APP-01 - Data Center",
      severity: "medium", 
      resolvedAt: "2024-01-12T11:20:00Z",
      resolutionTime: "2.2h",
      satisfactionScore: 5,
      resolutionSummary: "Limpeza de cache e otimização de performance"
    }
  ]
  
  // Simular mensagens/comentários recebidos com mais detalhes
  const receivedMessages = [
    {
      id: 1,
      occurrenceId: "OCC-2024-001",
      from: "COPF - Centro de Operações",
      message: "Ocorrência crítica no ATM AG-001. Necessária intervenção imediata conforme SLA de 2 horas. Prioridade alterada para CRÍTICA.",
      timestamp: "2024-01-15T14:30:00Z",
      priority: "critical",
      read: false,
      attachments: [
        { name: "diagnostico_atm.pdf", size: "2.3MB" },
        { name: "foto_erro.jpg", size: "1.8MB" }
      ],
      priorityChanged: true,
      previousPriority: "high"
    },
    {
      id: 2,
      occurrenceId: "OCC-2024-003", 
      from: "COPF - Centro de Operações",
      message: "Favor confirmar previsão de resolução para a ocorrência no equipamento de rede principal. Cliente reportando lentidão nas transações.",
      timestamp: "2024-01-15T13:15:00Z",
      priority: "high",
      read: true,
      attachments: [],
      priorityChanged: false
    },
    {
      id: 3,
      occurrenceId: "OCC-2024-005",
      from: "COPF - Escalação",
      message: "Ocorrência escalada devido ao não cumprimento do SLA. Favor contatar fornecedor. Prioridade elevada para CRÍTICA devido ao tempo de resposta.",
      timestamp: "2024-01-15T12:00:00Z", 
      priority: "critical",
      read: false,
      attachments: [
        { name: "relatorio_sla.docx", size: "856KB" }
      ],
      priorityChanged: true,
      previousPriority: "medium"
    },
    {
      id: 4,
      occurrenceId: "OCC-2024-007",
      from: "COPF - Centro de Operações",
      message: "Nova ocorrência registrada. Equipamento apresentando erro intermitente. Verificar se é problema recorrente.",
      timestamp: "2024-01-15T11:45:00Z",
      priority: "medium",
      read: true,
      attachments: [],
      priorityChanged: false
    }
  ]

  const handleSendResponse = (occurrenceId: string) => {
    if (!responseText.trim()) return
    
    toast({
      title: "Resposta Enviada",
      description: `Resposta enviada para ocorrência ${occurrenceId}`,
    })
    setResponseText("")
  }

  const handleReplyToMessage = (messageId: number) => {
    if (!replyText.trim()) return
    
    toast({
      title: "Resposta Enviada",
      description: `Resposta enviada para a mensagem do COPF`,
    })
    setReplyText("")
    setSelectedMessageId(null)
  }

  const handleTemplateSelect = (template: any, occurrenceId?: string) => {
    if (selectedMessageId) {
      setReplyText(template.content)
    } else if (occurrenceId) {
      // Para templates específicos por ocorrência nas priorizadas
      setResponseText(template.content)
    } else {
      setResponseText(template.content)
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

  const getSeverityVariant = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive'
      case 'high': return 'secondary'
      case 'medium': return 'default'
      default: return 'outline'
    }
  }

  const getTimeAgo = (timestamp: string) => {
    const hours = Math.floor((Date.now() - new Date(timestamp).getTime()) / (1000 * 60 * 60))
    return `${hours}h atrás`
  }

  return (
    <COPFLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Portal do Fornecedor</h1>
            <p className="text-muted-foreground">Bem-vindo, <strong>{currentVendor}</strong></p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-sm">
              <Building2 className="h-4 w-4 mr-1" />
              {currentVendor}
            </Badge>
          </div>
        </div>

        {/* Alertas Urgentes */}
        {receivedMessages.filter(msg => !msg.read).length > 0 && (
          <Alert className="border-destructive bg-destructive/5">
            <Bell className="h-4 w-4" />
            <AlertDescription className="font-medium">
              Você tem {receivedMessages.filter(msg => !msg.read).length} mensagens não lidas do COPF
            </AlertDescription>
          </Alert>
        )}

        {/* Métricas do Fornecedor */}
        <div className="responsive-grid responsive-grid-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Minhas Ocorrências</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{vendorOccurrences.length}</div>
              <p className="text-xs text-muted-foreground">
                Total de ocorrências ativas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Críticas/Altas</CardTitle>
              <Star className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">
                {prioritizedOccurrences.length}
              </div>
              <p className="text-xs text-muted-foreground">
                Requerem atenção imediata
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Meu SLA</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">94%</div>
              <p className="text-xs text-muted-foreground">
                Cumprimento do SLA
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1.8h</div>
              <p className="text-xs text-muted-foreground">
                Tempo de resposta
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="occurrences" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="occurrences">Minhas Ocorrências</TabsTrigger>
            <TabsTrigger value="priority">Ocorrências Priorizadas</TabsTrigger>
            <TabsTrigger value="messages">Mensagens Recebidas</TabsTrigger>
            <TabsTrigger value="history">Histórico Resolvidas</TabsTrigger>
          </TabsList>

          <TabsContent value="occurrences" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Todas as Minhas Ocorrências</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Equipamento</TableHead>
                      <TableHead>Severidade</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Tempo</TableHead>
                      <TableHead>SLA</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vendorOccurrences.map((occurrence) => {
                      const hoursSince = Math.floor(
                        (Date.now() - new Date(occurrence.createdAt).getTime()) / (1000 * 60 * 60)
                      )
                      const slaLimit = occurrence.severity === 'critical' ? 2 : 4
                      const slaProgress = (hoursSince / slaLimit) * 100

                      return (
                        <TableRow key={occurrence.id}>
                          <TableCell className="font-medium">{occurrence.id}</TableCell>
                          <TableCell className="max-w-[200px] truncate">{occurrence.equipment}</TableCell>
                          <TableCell>
                            <Badge variant={getSeverityVariant(occurrence.severity)}>
                              {getSeverityLabel(occurrence.severity)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={occurrence.status} />
                          </TableCell>
                          <TableCell>{hoursSince}h</TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <Badge variant={slaProgress > 100 ? 'destructive' : 'outline'}>
                                {slaLimit}h
                              </Badge>
                              <Progress 
                                value={Math.min(slaProgress, 100)} 
                                className="h-2"
                              />
                            </div>
                          </TableCell>
                          <TableCell>
                            <Button size="sm" variant="outline">
                              Atualizar
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="priority" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-destructive" />
                  Ocorrências Priorizadas - Ação Imediata
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Equipamento</TableHead>
                      <TableHead>Severidade</TableHead>
                      <TableHead>Tempo Decorrido</TableHead>
                      <TableHead>SLA Restante</TableHead>
                      <TableHead>Resposta</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {prioritizedOccurrences.map((occurrence) => {
                      const hoursSince = Math.floor(
                        (Date.now() - new Date(occurrence.createdAt).getTime()) / (1000 * 60 * 60)
                      )
                      const slaLimit = occurrence.severity === 'critical' ? 2 : 4
                      const timeRemaining = Math.max(0, slaLimit - hoursSince)

                      return (
                        <TableRow key={occurrence.id} className="border-l-4 border-l-destructive">
                          <TableCell className="font-medium">{occurrence.id}</TableCell>
                          <TableCell className="max-w-[200px] truncate">{occurrence.equipment}</TableCell>
                          <TableCell>
                            <Badge variant={getSeverityVariant(occurrence.severity)}>
                              {getSeverityLabel(occurrence.severity)}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-semibold">{hoursSince}h</TableCell>
                          <TableCell>
                            <Badge variant={timeRemaining === 0 ? 'destructive' : 'secondary'}>
                              {timeRemaining > 0 ? `${timeRemaining}h restantes` : 'VENCIDO'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <MessageSquare className="h-4 w-4 mr-1" />
                                  Responder
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>Responder à Ocorrência {occurrence.id}</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div className="bg-muted/50 p-3 rounded-lg">
                                    <p className="text-sm text-muted-foreground">Equipamento:</p>
                                    <p className="font-medium">{occurrence.equipment}</p>
                                  </div>
                                  <div className="space-y-2">
                                    <Textarea 
                                      placeholder="Descreva as ações tomadas ou situação atual..."
                                      value={responseText}
                                      onChange={(e) => setResponseText(e.target.value)}
                                      className="min-h-[120px]"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <p className="text-sm font-medium">Templates de Resposta:</p>
                                    <MessageTemplates 
                                      type="vendor" 
                                      onSelectTemplate={(template) => handleTemplateSelect(template, occurrence.id)}
                                    />
                                  </div>
                                  <div className="flex justify-end gap-2">
                                    <Button 
                                      onClick={() => handleSendResponse(occurrence.id)}
                                      disabled={!responseText.trim()}
                                    >
                                      <Send className="h-4 w-4 mr-1" />
                                      Enviar Resposta
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="messages" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Mensagens do COPF
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  <div className="space-y-4">
                  {receivedMessages.map((message) => (
                    <Card 
                      key={message.id} 
                      className={`${!message.read ? 'border-l-4 border-l-destructive bg-destructive/5' : ''}`}
                    >
                      <CardContent className="pt-4">
                         <div className="flex items-start justify-between gap-4">
                           <div className="flex-1">
                             <div className="flex items-center gap-2 mb-2">
                               <Badge variant="outline">{message.occurrenceId}</Badge>
                               <Badge variant={getSeverityVariant(message.priority)}>
                                 {getSeverityLabel(message.priority)}
                               </Badge>
                               {message.priorityChanged && (
                                 <Badge variant="outline" className="text-xs bg-warning/10">
                                   <Flag className="h-3 w-3 mr-1" />
                                   Prioridade Alterada
                                 </Badge>
                               )}
                               {message.attachments.length > 0 && (
                                 <Badge variant="outline" className="text-xs">
                                   <Paperclip className="h-3 w-3 mr-1" />
                                   {message.attachments.length} anexo(s)
                                 </Badge>
                               )}
                               {!message.read && (
                                 <Badge variant="destructive" className="text-xs">
                                   NOVA
                                 </Badge>
                               )}
                             </div>
                             <div className="text-sm text-muted-foreground mb-2">
                               <strong>{message.from}</strong> • {getTimeAgo(message.timestamp)}
                             </div>
                             
                             {message.priorityChanged && (
                               <div className="text-xs text-warning mb-2 p-2 bg-warning/5 rounded border-l-2 border-warning">
                                 <Flag className="h-3 w-3 inline mr-1" />
                                 Prioridade alterada de <strong>{getSeverityLabel(message.previousPriority)}</strong> para <strong>{getSeverityLabel(message.priority)}</strong>
                               </div>
                             )}
                             
                             <p className="text-sm mb-3">{message.message}</p>
                             
                             {/* Anexos */}
                             {message.attachments.length > 0 && (
                               <div className="mt-3">
                                 <p className="text-xs font-medium text-muted-foreground mb-2">Anexos:</p>
                                 <div className="space-y-1">
                                   {message.attachments.map((attachment, idx) => (
                                     <div key={idx} className="flex items-center gap-2 text-xs p-2 bg-muted/50 rounded">
                                       <Paperclip className="h-3 w-3" />
                                       <span className="flex-1">{attachment.name}</span>
                                       <span className="text-muted-foreground">{attachment.size}</span>
                                       <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                                         <Download className="h-3 w-3" />
                                       </Button>
                                     </div>
                                   ))}
                                 </div>
                               </div>
                             )}

                             {/* Área de Resposta */}
                             {selectedMessageId === message.id && (
                               <div className="mt-4 p-3 bg-muted/30 rounded border">
                                 <div className="flex gap-2 mb-2">
                                   <div className="flex-1">
                                     <Textarea
                                       placeholder="Digite sua resposta..."
                                       value={replyText}
                                       onChange={(e) => setReplyText(e.target.value)}
                                       className="min-h-[80px]"
                                     />
                                   </div>
                                   <Dialog>
                                     <DialogTrigger asChild>
                                       <Button variant="outline" size="sm">
                                         <FileText className="h-4 w-4" />
                                       </Button>
                                     </DialogTrigger>
                                     <DialogContent className="max-w-lg">
                                       <DialogHeader>
                                         <DialogTitle>Templates de Resposta</DialogTitle>
                                       </DialogHeader>
                                       <MessageTemplates 
                                         type="vendor" 
                                         onSelectTemplate={handleTemplateSelect}
                                       />
                                     </DialogContent>
                                   </Dialog>
                                 </div>
                                 <div className="flex gap-2">
                                   <Button 
                                     size="sm" 
                                     onClick={() => handleReplyToMessage(message.id)}
                                     disabled={!replyText.trim()}
                                   >
                                     <Send className="h-4 w-4 mr-1" />
                                     Enviar Resposta
                                   </Button>
                                   <Button 
                                     size="sm" 
                                     variant="outline"
                                     onClick={() => setSelectedMessageId(null)}
                                   >
                                     Cancelar
                                   </Button>
                                 </div>
                               </div>
                             )}
                           </div>
                           <div className="text-right">
                             <Button 
                               variant="outline" 
                               size="sm"
                               onClick={() => setSelectedMessageId(selectedMessageId === message.id ? null : message.id)}
                             >
                               <Reply className="h-4 w-4 mr-1" />
                               {selectedMessageId === message.id ? 'Cancelar' : 'Responder'}
                             </Button>
                           </div>
                         </div>
                      </CardContent>
                    </Card>
                  ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5 text-success" />
                  Histórico de Ocorrências Resolvidas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Equipamento</TableHead>
                        <TableHead>Severidade</TableHead>
                        <TableHead>Resolvida em</TableHead>
                        <TableHead>Tempo de Resolução</TableHead>
                        <TableHead>Resumo</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {resolvedOccurrences.map((occurrence) => (
                        <TableRow key={occurrence.id} className="border-l-4 border-l-success">
                          <TableCell className="font-medium">{occurrence.id}</TableCell>
                          <TableCell className="max-w-[200px] truncate">{occurrence.equipment}</TableCell>
                          <TableCell>
                            <Badge variant={getSeverityVariant(occurrence.severity)}>
                              {getSeverityLabel(occurrence.severity)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(occurrence.resolvedAt).toLocaleDateString('pt-BR')} às {' '}
                            {new Date(occurrence.resolvedAt).toLocaleTimeString('pt-BR', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-success">
                              {occurrence.resolutionTime}
                            </Badge>
                          </TableCell>
                          <TableCell className="max-w-[300px]">
                            <span className="text-sm text-muted-foreground">
                              {occurrence.resolutionSummary}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </COPFLayout>
  )
}

export default VisaoFornecedor