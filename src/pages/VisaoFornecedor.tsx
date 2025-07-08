import { COPFLayout } from "@/components/copf/COPFLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
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
  Download
} from "lucide-react";
import { StatusBadge } from "@/components/copf/StatusBadge";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const VisaoFornecedor = () => {
  const { occurrences, isLoading } = useDashboardData()
  const { toast } = useToast()
  const [responseText, setResponseText] = useState("")
  
  // Simular fornecedor logado
  const currentVendor = 'TechSoluções Ltda'
  
  // Filtrar ocorrências do fornecedor atual
  const vendorOccurrences = occurrences.filter(occ => occ.vendor === currentVendor)
  
  // Ocorrências priorizadas para este fornecedor
  const prioritizedOccurrences = vendorOccurrences.filter(occ => 
    occ.severity === 'critical' || occ.severity === 'high'
  )
  
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
      message: "Ocorrência escalada devido ao não cumprimento do SLA. Favor contatar supervisor responsável. Prioridade elevada para CRÍTICA devido ao tempo de resposta.",
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
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="occurrences">Minhas Ocorrências</TabsTrigger>
            <TabsTrigger value="priority">Ocorrências Priorizadas</TabsTrigger>
            <TabsTrigger value="messages">Mensagens Recebidas</TabsTrigger>
          </TabsList>

          <TabsContent value="occurrences" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Todas as Minhas Ocorrências</CardTitle>
              </CardHeader>
              <CardContent>
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
                            <div className="space-y-2">
                              <Textarea 
                                placeholder="Descreva as ações tomadas..."
                                value={responseText}
                                onChange={(e) => setResponseText(e.target.value)}
                                className="min-h-[60px]"
                              />
                              <Button 
                                size="sm" 
                                onClick={() => handleSendResponse(occurrence.id)}
                                disabled={!responseText.trim()}
                              >
                                <Send className="h-4 w-4 mr-1" />
                                Enviar Resposta
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
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
                             
                             {message.attachments.length > 0 && (
                               <div className="space-y-1 mb-3">
                                 <p className="text-xs font-medium text-muted-foreground">Anexos:</p>
                                 {message.attachments.map((attachment, idx) => (
                                   <div key={idx} className="flex items-center gap-2 p-2 bg-muted/30 rounded text-xs">
                                     <Paperclip className="h-3 w-3" />
                                     <span className="flex-1">{attachment.name}</span>
                                     <span className="text-muted-foreground">{attachment.size}</span>
                                     <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                                       <Download className="h-3 w-3" />
                                     </Button>
                                   </div>
                                 ))}
                               </div>
                             )}
                           </div>
                           <div className="flex flex-col gap-2">
                             <Button size="sm" variant="outline">
                               Responder
                             </Button>
                             {!message.read && (
                               <Button size="sm" variant="ghost" className="text-xs">
                                 Marcar como lida
                               </Button>
                             )}
                           </div>
                         </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </COPFLayout>
  );
};

export default VisaoFornecedor;