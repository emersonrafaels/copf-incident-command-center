import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { COPFLayout } from '@/components/copf/COPFLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Send, AlertTriangle, Clock, User, FileText, Upload, X, Star, MessageSquare } from 'lucide-react';
import { useDashboardData } from '@/hooks/useDashboardData';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { MessageTemplates } from '@/components/copf/MessageTemplates';
export default function OcorrenciaDetalhes() {
  const {
    id
  } = useParams<{
    id: string;
  }>();
  const navigate = useNavigate();
  const {
    occurrences
  } = useDashboardData();
  const {
    toast
  } = useToast();
  const [occurrence, setOccurrence] = useState<any>(null);
  const [vendorMessage, setVendorMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isPrioritized, setIsPrioritized] = useState(false);
  const [tempPriority, setTempPriority] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [showTemplates, setShowTemplates] = useState(false);
  const [historyEntries, setHistoryEntries] = useState<any[]>([]);
  useEffect(() => {
    console.log('Procurando ocorrência com ID:', id);
    console.log('Ocorrências disponíveis:', occurrences?.length);
    if (occurrences && id) {
      // Buscar por ID real ou displayId
      const found = occurrences.find(occ => occ.id === id || occ.displayId === id);
      console.log('Ocorrência encontrada:', found);
      setOccurrence(found);
      if (found) {
        const priority = found.severity === 'critical' || found.severity === 'high';
        setIsPrioritized(priority);
        setTempPriority(priority);
        // Histórico inicial com duas entradas obrigatórias (ordem crescente por timestamp)
        const openingDate = new Date(found.createdAt);
        const assignmentDate = new Date(openingDate.getTime() + 2 * 60 * 1000); // 2 minutos depois

        setHistoryEntries([{
          id: '1',
          type: 'created',
          timestamp: openingDate.toISOString(),
          author: 'Sistema',
          description: 'Abertura da Ocorrência',
          details: found.description
        }, {
          id: '2',
          type: 'assigned',
          timestamp: assignmentDate.toISOString(),
          author: 'Sistema',
          description: 'Atribuição da Ocorrência para o Fornecedor',
          details: `Ocorrência atribuída para ${found.vendor}`
        }]);
      }
    }
  }, [occurrences, id]);
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd/MM/yyyy 'às' HH:mm", {
      locale: ptBR
    });
  };
  const handlePriorityToggle = (checked: boolean) => {
    setTempPriority(checked);
  };
  const savePriority = () => {
    if (tempPriority === isPrioritized) return;
    setIsPrioritized(tempPriority);

    // Create new history entry for priority change
    const newEntry = {
      id: Date.now().toString(),
      type: tempPriority ? 'prioritized' : 'deprioritized',
      timestamp: new Date().toISOString(),
      author: 'Operação',
      description: tempPriority ? 'Ocorrência priorizada' : 'Ocorrência despriorizada',
      details: tempPriority ? 'Ocorrência marcada como prioritária para atendimento urgente' : 'Prioridade removida da ocorrência'
    };
    setHistoryEntries(prev => [...prev, newEntry].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()));
    toast({
      title: tempPriority ? "Ocorrência Priorizada" : "Prioridade Removida",
      description: tempPriority ? "A ocorrência foi marcada como prioritária" : "A prioridade foi removida da ocorrência"
    });
  };
  const handleTemplateSelect = (template: any) => {
    setVendorMessage(template.content);
    setShowTemplates(false);
  };
  const handleSendToVendor = async () => {
    if (!vendorMessage.trim()) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Digite uma mensagem para enviar ao fornecedor"
      });
      return;
    }
    setIsSending(true);

    // Adicionar mensagem ao histórico
    const newEntry = {
      id: Date.now().toString(),
      type: 'message',
      timestamp: new Date().toISOString(),
      author: 'Operação',
      description: 'Mensagem enviada para o fornecedor',
      details: vendorMessage
    };
    setHistoryEntries(prev => [...prev, newEntry].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()));

    // Simular envio
    setTimeout(() => {
      toast({
        title: "Mensagem enviada",
        description: "Sua mensagem foi enviada para o fornecedor com sucesso"
      });
      setVendorMessage('');
      setAttachments([]);
      setIsSending(false);
    }, 1000);
  };
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setAttachments(prev => [...prev, ...files]);
  };
  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };
  const getSeverityVariant = (severity: string): "default" | "destructive" | "outline" | "secondary" => {
    const variants: Record<string, "default" | "destructive" | "outline" | "secondary"> = {
      critical: 'destructive',
      high: 'destructive',
      medium: 'default',
      low: 'secondary'
    };
    return variants[severity] || 'default';
  };
  const getSeverityLabel = (severity: string) => {
    const labels = {
      critical: 'Crítica',
      high: 'Alta',
      medium: 'Média',
      low: 'Baixa'
    };
    return labels[severity as keyof typeof labels] || severity;
  };
  const getTimeElapsed = (dateString: string) => {
    const now = new Date();
    const occurrenceDate = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - occurrenceDate.getTime()) / (1000 * 60));
    if (diffInMinutes < 60) {
      return `${diffInMinutes}min`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d`;
    }
  };
  if (!occurrence) {
    return <COPFLayout>
        <div className="p-6">
          <Button variant="ghost" onClick={() => navigate('/ocorrencias')} className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Ocorrências
          </Button>
          <div className="text-center py-12">
            <p className="text-muted-foreground">Ocorrência não encontrada</p>
          </div>
        </div>
      </COPFLayout>;
  }
  return <COPFLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => navigate('/ocorrencias')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Ocorrência #{occurrence.displayId}</h1>
              <p className="text-muted-foreground">
                Aberta há {getTimeElapsed(occurrence.createdAt)}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
             <Badge variant={getSeverityVariant(occurrence.severity)}>
               {getSeverityLabel(occurrence.severity)}
             </Badge>
             <Badge variant={occurrence.status === 'a_iniciar' || occurrence.status === 'em_andamento' ? 'destructive' : 'default'}>
               {occurrence.status === 'a_iniciar' ? 'A Iniciar' : occurrence.status === 'em_andamento' ? 'Em Andamento' : occurrence.status === 'encerrado' ? 'Encerrada' : occurrence.status === 'com_impedimentos' ? 'Com Impedimentos' : 'Cancelada'}
             </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Informações da Ocorrência */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status e Fornecedor */}
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Fornecedor */}
                  <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
                        <User className="h-5 w-5 text-primary-foreground" />
                      </div>
                      <div>
                        <Label className="font-medium text-xs text-muted-foreground">FORNECEDOR RESPONSÁVEL</Label>
                        <p className="text-xl font-bold text-primary">{occurrence.vendor}</p>
                      </div>
                    </div>
                  </div>

                  {/* Status Atual */}
                  <div className="bg-secondary/10 border border-secondary/20 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center">
                        <AlertTriangle className="h-5 w-5 text-secondary-foreground" />
                      </div>
                      <div>
                        <Label className="font-medium text-xs text-muted-foreground">STATUS ATUAL</Label>
                        <p className="text-xl font-bold text-foreground">
                          {occurrence.status === 'a_iniciar' ? 'A Iniciar' : 
                           occurrence.status === 'em_andamento' ? 'Em Andamento' : 
                           occurrence.status === 'encerrado' ? 'Encerrada' : 
                           occurrence.status === 'com_impedimentos' ? 'Com Impedimentos' : 'Cancelada'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Detalhes da Ocorrência
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-6">
                  {/* Informações da Agência */}
                  <div>
                    <h4 className="font-extrabold text-base text-foreground mb-3">Informações da Agência</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <Label className="font-medium text-xs">Agência</Label>
                        <p className="text-sm font-medium">{occurrence.agency}</p>
                      </div>
                      <div>
                        <Label className="font-medium text-xs">UF</Label>
                        <p className="text-sm">{occurrence.estado}</p>
                      </div>
                      <div>
                        <Label className="font-medium text-xs">DINEG</Label>
                        <p className="text-sm">{occurrence.dineg || 'Não informado'}</p>
                      </div>
                      <div>
                        <Label className="font-medium text-xs">SUPT</Label>
                        <p className="text-sm">{occurrence.supt || 'Não informado'}</p>
                      </div>
                    </div>
                  </div>

                   {/* Removed duplicate supplier section - now shown in header */}

                   {/* Informações do Equipamento */}
                   <div>
                     <h4 className="font-extrabold text-base text-foreground mb-3">Informações do Equipamento</h4>
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                       <div>
                         <Label className="font-medium text-xs">Equipamento</Label>
                         <p className="text-sm">{occurrence.equipment}</p>
                       </div>
                       <div>
                         <Label className="font-medium text-xs">Modelo</Label>
                         <p className="text-sm">{(() => {
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
                           const models = equipmentModelsMap[occurrence.equipment] || ['Modelo Genérico 1', 'Modelo Genérico 2'];
                           const key = (occurrence.serialNumber || occurrence.id || '').toString();
                           const idx = key.length > 0 ? (key.charCodeAt(0) + key.length) % models.length : 0;
                           return models[idx];
                         })()}</p>
                       </div>
                       <div>
                         <Label className="font-medium text-xs">Número de Série</Label>
                         <p className="text-sm font-mono">{occurrence.serialNumber}</p>
                       </div>
                     </div>
                   </div>

                   {/* Informações de Impedimento */}
                   <div>
                     <h4 className="font-extrabold text-base text-foreground mb-3">Informações de Impedimento</h4>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <div>
                         <Label className="font-medium text-xs">Impedimento</Label>
                         <p className="text-sm">{occurrence.possuiImpedimento ? 'Sim' : 'Não'}</p>
                       </div>
                       <div>
                         <Label className="font-medium text-xs">Motivo</Label>
                         <p className="text-sm">{occurrence.motivoImpedimento || ''}</p>
                       </div>
                     </div>
                   </div>

                  {/* Informações Temporais */}
                  <div>
                    <h4 className="font-extrabold text-base text-foreground mb-3">Informações Temporais</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <Label className="font-medium text-xs">Data/Hora da Abertura</Label>
                        <p className="text-sm">{formatDate(occurrence.createdAt)}</p>
                      </div>
                      <div>
                        <Label className="font-medium text-xs">Previsão de Atendimento</Label>
                        <p className="text-sm">
                          {(() => {
                            const createdDate = new Date(occurrence.createdAt);
                            const slaHours = occurrence.severity === 'critical' || occurrence.severity === 'high' ? 24 : 72;
                            const predictedDate = new Date(createdDate.getTime() + slaHours * 60 * 60 * 1000);
                            return formatDate(predictedDate.toISOString());
                          })()}
                        </p>
                      </div>
                      <div>
                        <Label className="font-medium text-xs">Data/Hora de Encerramento</Label>
                        <p className="text-sm">
                          {occurrence.status === 'encerrado' && occurrence.resolvedAt 
                            ? formatDate(occurrence.resolvedAt) 
                            : <span className="text-muted-foreground">Em aberto</span>
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                 
                 <Separator />
                 
                 {/* Campos específicos para agências (exceto PAB e PAE) */}
                 {(() => {
                // Simular tipo de agência baseado no número
                const agencyNumber = occurrence.agency.match(/\d+/)?.[0] || '0';
                const agencyType = parseInt(agencyNumber) % 10 === 0 ? 'PAB' : parseInt(agencyNumber) % 10 === 5 ? 'PAE' : 'Convencional';
                if (agencyType !== 'PAB' && agencyType !== 'PAE') {
                  return <div>
                         <h4 className="font-medium mb-3">Informações da Agência</h4>
                         <div className="grid grid-cols-2 gap-4">
                           <div>
                             <Label className="font-medium">Última Reforma</Label>
                             <p className="text-sm">
                               {(() => {
                            const reforms = ['Plano Diretor', 'Espaço Itaú', 'Ainda Não Reformada'];
                            return reforms[parseInt(agencyNumber) % 3];
                          })()}
                             </p>
                           </div>
                           <div>
                             <Label className="font-medium">Data da Última Reforma</Label>
                             <p className="text-sm">
                               {(() => {
                            const years = ['2022', '2023', '2024', '2025', 'Ainda Não Reformada'];
                            return years[parseInt(agencyNumber) % 5];
                          })()}
                             </p>
                           </div>
                           <div>
                             <Label className="font-medium">Arquétipo Atual</Label>
                             <p className="text-sm">
                               {(() => {
                            const archetypes = ['Standard', 'Ultralight', 'Premium'];
                            return archetypes[parseInt(agencyNumber) % 3];
                          })()}
                             </p>
                           </div>
                           <div>
                             <Label className="font-medium">Ponto VIP</Label>
                             <p className="text-sm">
                               {parseInt(agencyNumber) % 4 === 0 ? 'Sim' : 'Não'}
                             </p>
                           </div>
                           <div>
                             <Label className="font-medium">Tipo do Ponto</Label>
                             <p className="text-sm">{agencyType}</p>
                           </div>
                         </div>
                         <Separator className="mt-4" />
                       </div>;
                }
                return null;
              })()}
                 
                <div>
                  <Label className="font-extrabold text-base">Sintoma</Label>
                  <p className="text-sm mt-1 p-3 bg-muted rounded-md">
                    {occurrence.description}
                  </p>
                </div>
                <div>
                  
                  
                </div>
              </CardContent>
            </Card>

            {/* Histórico */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Histórico
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-4">
                    {historyEntries.map(entry => {
                    const getIcon = () => {
                      switch (entry.type) {
                        case 'created':
                          return <Clock className="h-4 w-4" />;
                        case 'assigned':
                          return <User className="h-4 w-4" />;
                        case 'prioritized':
                          return <Star className="h-4 w-4 text-yellow-500" />;
                        case 'deprioritized':
                          return <Star className="h-4 w-4 text-gray-400" />;
                        case 'message':
                          return <MessageSquare className="h-4 w-4" />;
                        default:
                          return <Clock className="h-4 w-4" />;
                      }
                    };
                    const getBadgeVariant = () => {
                      switch (entry.type) {
                        case 'created':
                          return 'secondary';
                        case 'assigned':
                          return 'outline';
                        case 'prioritized':
                          return 'default';
                        case 'deprioritized':
                          return 'secondary';
                        case 'message':
                          return 'outline';
                        default:
                          return 'secondary';
                      }
                    };
                    const getBadgeText = () => {
                      switch (entry.type) {
                        case 'created':
                          return 'Abertura';
                        case 'assigned':
                          return 'Atribuição';
                        case 'prioritized':
                          return 'Priorizada';
                        case 'deprioritized':
                          return 'Despriorizada';
                        case 'message':
                          return 'Mensagem';
                        default:
                          return 'Atualização';
                      }
                    };
                    return <div key={entry.id} className="flex items-start space-x-3 p-3 bg-muted rounded-md">
                          <div className="flex-shrink-0 mt-1">
                            {getIcon()}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium">{entry.description}</p>
                              <Badge variant={getBadgeVariant()} className="text-xs">
                                {getBadgeText()}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {formatDate(entry.timestamp)} • {entry.author}
                            </p>
                            {entry.details && <p className="text-xs text-gray-600 mt-1 italic">
                                "{entry.details}"
                              </p>}
                          </div>
                        </div>;
                  })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Ações */}
          <div className="space-y-6">
            {/* Prioridade */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <AlertTriangle className="h-5 w-5 mr-2" />
                    Priorização
                  </div>
                  <Badge variant={isPrioritized ? 'default' : 'secondary'}>
                    {isPrioritized ? 'Priorizada' : 'Normal'}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Switch id="priority-switch" checked={tempPriority} onCheckedChange={handlePriorityToggle} />
                    <Label htmlFor="priority-switch" className="text-sm font-medium">
                      {tempPriority ? 'Remover prioridade' : 'Priorizar ocorrência'}
                    </Label>
                  </div>
                  
                  {tempPriority !== isPrioritized && <Button onClick={savePriority} size="sm" className="w-full">
                      Salvar Priorização
                    </Button>}
                  
                  {isPrioritized && <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-600 mr-2" />
                        <span className="text-sm font-medium text-yellow-800">Ocorrência Prioritária</span>
                      </div>
                      <p className="text-xs text-yellow-700 mt-1">
                        Ao salvar como priorizada, essa ocorrência aparecerá priorizada para o fornecedor.
                      </p>
                    </div>}
                </div>
              </CardContent>
            </Card>

            {/* Comunicação com Fornecedor */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Send className="h-5 w-5 mr-2" />
                    Mensagem para Fornecedor
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setShowTemplates(!showTemplates)}>
                    Templates
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {showTemplates && <MessageTemplates type="operation" onSelectTemplate={handleTemplateSelect} />}
                <Textarea placeholder="Digite sua mensagem para o fornecedor ou selecione um template..." value={vendorMessage} onChange={e => setVendorMessage(e.target.value)} className="min-h-32" />
                
                {/* Anexos */}
                <div>
                  <Label htmlFor="file-upload" className="cursor-pointer">
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-foreground">
                      <Upload className="h-4 w-4" />
                      <span>Anexar arquivos</span>
                    </div>
                  </Label>
                  <Input id="file-upload" type="file" multiple onChange={handleFileUpload} className="hidden" />
                  
                  {attachments.length > 0 && <div className="mt-2 space-y-2">
                      {attachments.map((file, index) => <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                          <span className="text-sm truncate">{file.name}</span>
                          <Button variant="ghost" size="sm" onClick={() => removeAttachment(index)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>)}
                    </div>}
                </div>

                <div className="space-y-2">
                  <Button onClick={handleSendToVendor} disabled={isSending || !vendorMessage.trim()} className="w-full">
                    {isSending ? 'Enviando...' : 'Enviar Mensagem'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </COPFLayout>;
}