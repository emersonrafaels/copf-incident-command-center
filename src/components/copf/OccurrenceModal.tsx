import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { StatusBadge } from './StatusBadge'
import { OccurrenceData } from '@/hooks/useDashboardData'
import { useToast } from '@/hooks/use-toast'
import { useState } from 'react'
import { 
  Building2, 
  Wrench, 
  User, 
  Calendar,
  FileText,
  Phone,
  Clock,
  Send,
  MessageSquare,
  Flag,
  Paperclip,
  Upload,
  X
} from 'lucide-react'

interface OccurrenceModalProps {
  occurrence: OccurrenceData | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onAssign?: (id: string) => void
  onComment?: (id: string) => void
}

export function OccurrenceModal({ 
  occurrence, 
  open, 
  onOpenChange, 
  onAssign, 
  onComment 
}: OccurrenceModalProps) {
  const { toast } = useToast()
  const [vendorMessage, setVendorMessage] = useState('')
  const [isSendingMessage, setIsSendingMessage] = useState(false)
  const [showVendorComm, setShowVendorComm] = useState(false)
  const [priority, setPriority] = useState<'critical' | 'high' | 'medium' | 'low'>(
    (occurrence?.severity as 'critical' | 'high' | 'medium' | 'low') || 'medium'
  )
  const [attachments, setAttachments] = useState<File[]>([])
  const [showPriorityOptions, setShowPriorityOptions] = useState(false)

  if (!occurrence) return null

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR')
  }

  const handleSendToVendor = async () => {
    if (!vendorMessage.trim()) {
      toast({
        title: "Erro",
        description: "Digite uma mensagem para enviar ao fornecedor",
        variant: "destructive"
      })
      return
    }

    setIsSendingMessage(true)
    
    // Simular envio da mensagem
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    const priorityText = priority !== occurrence.severity ? ` (Prioridade alterada para ${getPriorityLabel(priority)})` : ''
    const attachmentText = attachments.length > 0 ? ` com ${attachments.length} anexo(s)` : ''
    
    toast({
      title: "Mensagem Enviada",
      description: `Fornecedor ${occurrence.vendor} foi notificado sobre a ocorrência ${occurrence.id}${priorityText}${attachmentText}`,
    })
    
    setVendorMessage('')
    setAttachments([])
    setShowVendorComm(false)
    setIsSendingMessage(false)
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    setAttachments(prev => [...prev, ...files])
  }

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index))
  }

  const handlePriorityChange = (newPriority: string) => {
    const validPriority = newPriority as 'critical' | 'high' | 'medium' | 'low'
    setPriority(validPriority)
    toast({
      title: "Prioridade Alterada",
      description: `Ocorrência ${occurrence.id} definida como ${getPriorityLabel(validPriority)}`,
    })
  }

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'critical': return 'Crítica'
      case 'high': return 'Alta'
      case 'medium': return 'Média'
      case 'low': return 'Baixa'
      default: return priority
    }
  }

  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case 'critical': return 'destructive'
      case 'high': return 'secondary'
      case 'medium': return 'default'
      case 'low': return 'outline'
      default: return 'outline'
    }
  }

  const getTimeElapsed = (dateString: string) => {
    const now = new Date()
    const created = new Date(dateString)
    const diffHours = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60))
    
    if (diffHours < 1) return 'Menos de 1 hora'
    if (diffHours < 24) return `${diffHours} horas`
    return `${Math.floor(diffHours / 24)} dias`
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Detalhes da Ocorrência
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header com ID e Status */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">{occurrence.id}</h3>
              <p className="text-sm text-muted-foreground">
                Criado há {getTimeElapsed(occurrence.createdAt)}
              </p>
            </div>
            <div className="flex gap-2">
              <StatusBadge status={occurrence.severity} />
              <StatusBadge status={occurrence.status} />
            </div>
          </div>

          <Separator />

          {/* Informações Principais */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <Building2 className="h-4 w-4 mt-1 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Agência</p>
                  <p className="text-sm text-muted-foreground">{occurrence.agency}</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Wrench className="h-4 w-4 mt-1 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Equipamento</p>
                  <p className="text-sm text-muted-foreground">{occurrence.equipment}</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <User className="h-4 w-4 mt-1 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Responsável</p>
                  <p className="text-sm text-muted-foreground">{occurrence.assignedTo}</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <Calendar className="h-4 w-4 mt-1 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Data/Hora</p>
                  <p className="text-sm text-muted-foreground">{formatDate(occurrence.createdAt)}</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Phone className="h-4 w-4 mt-1 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Fornecedor</p>
                  <p className="text-sm text-muted-foreground">{occurrence.vendor}</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Clock className="h-4 w-4 mt-1 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">SLA</p>
                  <Badge variant="outline" className="text-xs">
                    {occurrence.severity === 'critical' ? '2h' : '4h'}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Descrição */}
          <div>
            <h4 className="text-sm font-medium mb-2">Descrição do Problema</h4>
            <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
              {occurrence.description}
            </p>
          </div>

          {/* Timeline de Ações */}
          <div>
            <h4 className="text-sm font-medium mb-2">Histórico de Ações</h4>
            <div className="space-y-2">
              <div className="flex gap-3 p-2 bg-muted/50 rounded-lg">
                <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(occurrence.createdAt)}
                  </p>
                  <p className="text-sm">Ocorrência criada automaticamente</p>
                </div>
              </div>
              
              {occurrence.status === 'pending' && (
                <div className="flex gap-3 p-2 bg-warning/10 rounded-lg">
                  <div className="w-2 h-2 bg-warning rounded-full mt-2"></div>
                  <div>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(new Date(Date.now() - 30 * 60 * 1000).toISOString())}
                    </p>
                    <p className="text-sm">Fornecedor acionado - Aguardando resposta</p>
                  </div>
                </div>
              )}

              {occurrence.status === 'resolved' && (
                <div className="flex gap-3 p-2 bg-success/10 rounded-lg">
                  <div className="w-2 h-2 bg-success rounded-full mt-2"></div>
                  <div>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(new Date(Date.now() - 60 * 60 * 1000).toISOString())}
                    </p>
                    <p className="text-sm">Ocorrência resolvida pelo fornecedor</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Comunicação com Fornecedor */}
          {showVendorComm && (
            <div className="border rounded-lg p-4 bg-muted/20">
              <div className="flex items-center gap-2 mb-3">
                <MessageSquare className="h-4 w-4" />
                <h4 className="text-sm font-medium">Comunicação com Fornecedor</h4>
              </div>
              <div className="space-y-4">
                {/* Definir Prioridade */}
                <div>
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Flag className="h-4 w-4" />
                    Prioridade da Ocorrência
                  </Label>
                  <Select value={priority} onValueChange={handlePriorityChange}>
                    <SelectTrigger className="w-full mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="critical">🔴 Crítica</SelectItem>
                      <SelectItem value="high">🟡 Alta</SelectItem>
                      <SelectItem value="medium">🟢 Média</SelectItem>
                      <SelectItem value="low">⚪ Baixa</SelectItem>
                    </SelectContent>
                  </Select>
                  {priority !== occurrence.severity && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Prioridade alterada de {getPriorityLabel(occurrence.severity)} para {getPriorityLabel(priority)}
                    </p>
                  )}
                </div>

                {/* Mensagem */}
                <div>
                  <Label htmlFor="vendor-message" className="text-sm font-medium">
                    Mensagem para {occurrence.vendor}
                  </Label>
                  <Textarea
                    id="vendor-message"
                    placeholder="Digite sua mensagem para o fornecedor..."
                    value={vendorMessage}
                    onChange={(e) => setVendorMessage(e.target.value)}
                    className="mt-1 min-h-[100px]"
                  />
                </div>

                {/* Anexos */}
                <div>
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Paperclip className="h-4 w-4" />
                    Anexos
                  </Label>
                  <div className="mt-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        multiple
                        onChange={handleFileUpload}
                        className="hidden"
                        id="file-upload"
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => document.getElementById('file-upload')?.click()}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Adicionar Arquivo
                      </Button>
                      <span className="text-xs text-muted-foreground">
                        PDF, DOC, IMG até 10MB
                      </span>
                    </div>
                    
                    {attachments.length > 0 && (
                      <div className="space-y-1">
                        {attachments.map((file, index) => (
                          <div key={index} className="flex items-center gap-2 p-2 bg-muted/50 rounded-md">
                            <Paperclip className="h-3 w-3" />
                            <span className="text-xs flex-1 truncate">{file.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {(file.size / 1024 / 1024).toFixed(1)}MB
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeAttachment(index)}
                              className="h-6 w-6 p-0"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button 
                    onClick={handleSendToVendor}
                    disabled={isSendingMessage}
                    size="sm"
                  >
                    <Send className="mr-2 h-4 w-4" />
                    {isSendingMessage ? 'Enviando...' : 'Enviar Mensagem'}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowVendorComm(false)}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Ações */}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => onComment?.(occurrence.id)}>
              Adicionar Comentário
            </Button>
            <Button variant="outline" onClick={() => onAssign?.(occurrence.id)}>
              Reatribuir
            </Button>
            <Button 
              variant="premium"
              onClick={() => setShowVendorComm(!showVendorComm)}
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              {showVendorComm ? 'Cancelar' : 'Comunicar com Fornecedor'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}