import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Bell, MessageSquare, Clock, AlertTriangle, CheckCircle, User, Building, ExternalLink } from "lucide-react";
import { format } from "date-fns";

interface Message {
  id: string;
  type: 'vendor_to_operation' | 'operation_to_vendor';
  title: string;
  content: string;
  category: 'response' | 'status' | 'escalation' | 'resolution';
  sender: string;
  occurrenceId: string;
  timestamp: Date;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

// Mensagens mock padrão recebidas pelo fornecedor para a operação
const defaultMessages: Message[] = [
  {
    id: '1',
    type: 'vendor_to_operation',
    title: 'Técnico a caminho - ATM AG0001',
    content: 'Técnico especializado foi despachado para o local. Previsão de chegada: 25 minutos. Contato: (11) 99999-1234',
    category: 'response',
    sender: 'Diebold Nixdorf',
    occurrenceId: '005a5717-dd52-463f-adfc-76fc27dfdff7',
    timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 min atrás
    isRead: false,
    priority: 'high'
  },
  {
    id: '2',
    type: 'vendor_to_operation',
    title: 'Problema resolvido - Scanner AG1001',
    content: 'Ocorrência resolvida com sucesso. Scanner de documentos testado e funcionando normalmente. Documentação técnica anexada.',
    category: 'resolution',
    sender: 'Dell Technologies',
    occurrenceId: '9e3afd55-7042-476e-8cfc-c55cd0c9f288',
    timestamp: new Date(Date.now() - 45 * 60 * 1000), // 45 min atrás
    isRead: false,
    priority: 'medium'
  },
  {
    id: '3',
    type: 'vendor_to_operation',
    title: 'Solicitação de extensão - Servidor AG2001',
    content: 'Devido à complexidade do problema no servidor, solicitamos extensão do SLA em 3 horas. Equipe especializada de infraestrutura foi acionada.',
    category: 'escalation',
    sender: 'HP',
    occurrenceId: '2eb390bf-d10f-4435-830d-75e6a1c2e846',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2h atrás
    isRead: true,
    priority: 'critical'
  },
  {
    id: '4',
    type: 'vendor_to_operation',
    title: 'Aguardando peças - Impressora AG0015',
    content: 'Diagnóstico concluído. Problema na impressora térmica requer substituição do mecanismo de impressão. Peça será entregue em 4 horas.',
    category: 'status',
    sender: 'Epson',
    occurrenceId: 'd6e3b297-6ba5-46e2-a971-d9881c70c60f',
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3h atrás
    isRead: true,
    priority: 'medium'
  },
  {
    id: '5',
    type: 'vendor_to_operation',
    title: 'Investigando falha - Monitor AG1070',
    content: 'Recebemos a ocorrência de falha no monitor LCD. Nossa equipe técnica está investigando remotamente. Previsão de diagnóstico em 20 minutos.',
    category: 'response',
    sender: 'Lenovo',
    occurrenceId: '82fae9a2-ad13-44db-8080-c220cbcc9f09',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4h atrás
    isRead: true,
    priority: 'high'
  }
];

const categoryIcons = {
  response: <MessageSquare className="h-4 w-4" />,
  status: <Clock className="h-4 w-4" />,
  escalation: <AlertTriangle className="h-4 w-4" />,
  resolution: <CheckCircle className="h-4 w-4" />
};

const categoryLabels = {
  response: 'Resposta',
  status: 'Status',
  escalation: 'Escalação',
  resolution: 'Resolução'
};

const priorityColors = {
  low: 'secondary',
  medium: 'default',
  high: 'outline',
  critical: 'destructive'
} as const;

const priorityLabels = {
  low: 'Baixa',
  medium: 'Média',
  high: 'Alta',
  critical: 'Crítica'
};

export function NotificationPanel({ isOpen, onClose }: NotificationPanelProps) {
  const navigate = useNavigate();
  const [messages] = useState<Message[]>(defaultMessages);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

  const handleViewOccurrence = (occurrenceId: string) => {
    // Fechar o painel de notificações
    onClose();
    // Navegar para a página de detalhes da ocorrência
    navigate(`/ocorrencia/${occurrenceId}`);
  };

  const unreadCount = messages.filter(m => !m.isRead).length;

  if (!isOpen) return null;

  return (
    <div className="fixed top-16 right-4 z-50">
      <div className="w-96 max-w-full bg-card border border-border shadow-elegant rounded-xl animate-slide-in-right">
        <Card className="border-0">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Bell className="h-5 w-5 text-primary" />
                Mensagens Recebidas
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {unreadCount}
                  </Badge>
                )}
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={onClose}>
                ×
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Comunicações dos fornecedores para a operação
            </p>
          </CardHeader>
          <CardContent className="p-0">
            {selectedMessage ? (
              <div className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedMessage(null)}
                  >
                    ← Voltar
                  </Button>
                  <Badge variant={priorityColors[selectedMessage.priority]}>
                    {priorityLabels[selectedMessage.priority]}
                  </Badge>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    {categoryIcons[selectedMessage.category]}
                    <Badge variant="outline">
                      {categoryLabels[selectedMessage.category]}
                    </Badge>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-foreground">
                      {selectedMessage.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                      <Building className="h-3 w-3" />
                      <span>{selectedMessage.sender}</span>
                      <span>•</span>
                      <span>{selectedMessage.occurrenceId}</span>
                    </div>
                  </div>
                  
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <p className="text-sm text-foreground leading-relaxed">
                      {selectedMessage.content}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>
                      {format(selectedMessage.timestamp, 'dd/MM/yyyy HH:mm')}
                    </span>
                  </div>

                  {/* Botão para abrir detalhe da ocorrência */}
                  <div className="pt-2 border-t border-border">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => handleViewOccurrence(selectedMessage.occurrenceId)}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Ver Detalhe da Ocorrência
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <ScrollArea className="h-[400px]">
                <div className="p-4 space-y-3">
                  {messages.map((message, index) => (
                    <div key={message.id}>
                      <div
                        className={`p-3 rounded-lg border cursor-pointer transition-all hover:bg-muted/30 ${
                          !message.isRead ? 'bg-primary/5 border-primary/20' : 'bg-card border-border'
                        }`}
                        onClick={() => setSelectedMessage(message)}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              {categoryIcons[message.category]}
                              <Badge variant={priorityColors[message.priority]} className="text-xs">
                                {priorityLabels[message.priority]}
                              </Badge>
                              {!message.isRead && (
                                <div className="w-2 h-2 bg-primary rounded-full"></div>
                              )}
                            </div>
                            
                            <h4 className="font-medium text-sm text-foreground truncate">
                              {message.title}
                            </h4>
                            
                            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                              <Building className="h-3 w-3" />
                              <span className="truncate">{message.sender}</span>
                            </div>
                            
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {message.content}
                            </p>
                          </div>
                          
                          <div className="text-xs text-muted-foreground">
                            {format(message.timestamp, 'HH:mm')}
                          </div>
                        </div>
                      </div>
                      
                      {index < messages.length - 1 && <Separator className="my-2" />}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}