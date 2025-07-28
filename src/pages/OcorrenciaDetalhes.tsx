import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { COPFLayout } from '@/components/copf/COPFLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Send, AlertTriangle, Clock, User, FileText, Upload, X } from 'lucide-react';
import { useDashboardData } from '@/hooks/useDashboardData';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function OcorrenciaDetalhes() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { occurrences } = useDashboardData();
  const { toast } = useToast();
  
  const [occurrence, setOccurrence] = useState<any>(null);
  const [vendorMessage, setVendorMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [selectedPriority, setSelectedPriority] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);

  useEffect(() => {
    console.log('Procurando ocorrência com ID:', id);
    console.log('Ocorrências disponíveis:', occurrences?.length);
    if (occurrences && id) {
      const found = occurrences.find(occ => occ.id === id);
      console.log('Ocorrência encontrada:', found);
      setOccurrence(found);
      if (found) {
        setSelectedPriority('medium'); // Default priority
      }
    }
  }, [occurrences, id]);

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
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

  const handlePriorityChange = (newPriority: string) => {
    setSelectedPriority(newPriority);
    if (occurrence) {
      setOccurrence({...occurrence, priority: newPriority});
      toast({
        title: "Prioridade alterada",
        description: `Prioridade alterada para ${getPriorityLabel(newPriority)}`
      });
    }
  };

  const getPriorityLabel = (priority: string) => {
    const labels = {
      low: 'Baixa',
      medium: 'Média',
      high: 'Alta',
      urgent: 'Urgente'
    };
    return labels[priority as keyof typeof labels] || priority;
  };

  const getPriorityVariant = (priority: string): "default" | "destructive" | "outline" | "secondary" => {
    const variants: Record<string, "default" | "destructive" | "outline" | "secondary"> = {
      low: 'secondary',
      medium: 'default',
      high: 'destructive',
      urgent: 'destructive'
    };
    return variants[priority] || 'default';
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
    return (
      <COPFLayout>
        <div className="p-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/ocorrencias')}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Ocorrências
          </Button>
          <div className="text-center py-12">
            <p className="text-muted-foreground">Ocorrência não encontrada</p>
          </div>
        </div>
      </COPFLayout>
    );
  }

  return (
    <COPFLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/ocorrencias')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Ocorrência #{occurrence.id}</h1>
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
               {occurrence.status === 'a_iniciar' ? 'A Iniciar' : 
                occurrence.status === 'em_andamento' ? 'Em Andamento' : 
                occurrence.status === 'encerrado' ? 'Encerrada' : 
                occurrence.status === 'com_impedimentos' ? 'Com Impedimentos' : 'Cancelada'}
             </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Informações da Ocorrência */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Detalhes da Ocorrência
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                 <div className="grid grid-cols-2 gap-4">
                   <div>
                     <Label className="font-medium">Agência</Label>
                     <p className="text-sm">{occurrence.agency}</p>
                   </div>
                   <div>
                     <Label className="font-medium">UF</Label>
                     <p className="text-sm">{occurrence.estado}</p>
                   </div>
                   <div>
                     <Label className="font-medium">Equipamento</Label>
                     <p className="text-sm">{occurrence.equipment}</p>
                   </div>
                   <div>
                     <Label className="font-medium">Fornecedor</Label>
                     <p className="text-sm">{occurrence.vendor}</p>
                   </div>
                   <div>
                     <Label className="font-medium">Número de Série</Label>
                     <p className="text-sm">{occurrence.serialNumber}</p>
                   </div>
                   <div>
                     <Label className="font-medium">Abertura</Label>
                     <p className="text-sm">{formatDate(occurrence.createdAt)}</p>
                   </div>
                 </div>
                <Separator />
                <div>
                  <Label className="font-medium">Descrição do Problema</Label>
                  <p className="text-sm mt-1 p-3 bg-muted rounded-md">
                    {occurrence.description}
                  </p>
                </div>
                <div>
                  <Label className="font-medium">Responsável</Label>
                  <p className="text-sm">{occurrence.assignedTo}</p>
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
                <ScrollArea className="h-64">
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3 p-3 bg-muted rounded-md">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Ocorrência criada</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(occurrence.createdAt)} • Sistema
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 p-3 bg-muted rounded-md">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mt-2" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Atribuída ao fornecedor</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(occurrence.createdAt)} • {occurrence.assignedTo}
                        </p>
                      </div>
                    </div>
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
                <CardTitle className="flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  Prioridade
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={selectedPriority} onValueChange={handlePriorityChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Baixa</SelectItem>
                    <SelectItem value="medium">Média</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                    <SelectItem value="urgent">Urgente</SelectItem>
                  </SelectContent>
                </Select>
                <div className="mt-2">
                  <Badge variant={getPriorityVariant(selectedPriority)}>
                    {getPriorityLabel(selectedPriority)}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Comunicação com Fornecedor */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Send className="h-5 w-5 mr-2" />
                  Mensagem para Fornecedor
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Digite sua mensagem para o fornecedor..."
                  value={vendorMessage}
                  onChange={(e) => setVendorMessage(e.target.value)}
                  className="min-h-32"
                />
                
                {/* Anexos */}
                <div>
                  <Label htmlFor="file-upload" className="cursor-pointer">
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-foreground">
                      <Upload className="h-4 w-4" />
                      <span>Anexar arquivos</span>
                    </div>
                  </Label>
                  <Input
                    id="file-upload"
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  
                  {attachments.length > 0 && (
                    <div className="mt-2 space-y-2">
                      {attachments.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                          <span className="text-sm truncate">{file.name}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeAttachment(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Button 
                  onClick={handleSendToVendor}
                  disabled={isSending || !vendorMessage.trim()}
                  className="w-full"
                >
                  {isSending ? 'Enviando...' : 'Enviar Mensagem'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </COPFLayout>
  );
}