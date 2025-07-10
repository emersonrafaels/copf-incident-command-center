import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Clock, AlertTriangle, CheckCircle, Wrench } from "lucide-react";

interface MessageTemplate {
  id: string;
  title: string;
  content: string;
  category: 'response' | 'status' | 'escalation' | 'resolution';
  type: 'vendor' | 'operation';
}

interface MessageTemplatesProps {
  type: 'vendor' | 'operation';
  onSelectTemplate: (template: MessageTemplate) => void;
}

const templates: MessageTemplate[] = [
  // Templates para Fornecedor
  {
    id: 'vendor-investigating',
    title: 'Investigando Problema',
    content: 'Recebemos a ocorrência e nossa equipe técnica está investigando o problema. Previsão de diagnóstico em 30 minutos.',
    category: 'response',
    type: 'vendor'
  },
  {
    id: 'vendor-onsite',
    title: 'Técnico a Caminho',
    content: 'Técnico especializado foi despachado para o local. Previsão de chegada: 45 minutos. Contato do técnico: (11) 99999-9999',
    category: 'response',
    type: 'vendor'
  },
  {
    id: 'vendor-parts',
    title: 'Aguardando Peças',
    content: 'Diagnóstico concluído. Problema identificado requer substituição de componente. Peça será entregue em 2 horas.',
    category: 'status',
    type: 'vendor'
  },
  {
    id: 'vendor-resolved',
    title: 'Problema Resolvido',
    content: 'Ocorrência resolvida com sucesso. Equipamento testado e funcionando normalmente. Documentação anexada.',
    category: 'resolution',
    type: 'vendor'
  },
  {
    id: 'vendor-delay',
    title: 'Solicitação de Extensão',
    content: 'Devido à complexidade do problema, solicitamos extensão do SLA em 2 horas. Equipe especializada está trabalhando na resolução.',
    category: 'escalation',
    type: 'vendor'
  },

  // Templates para Operação
  {
    id: 'op-priority-critical',
    title: 'Prioridade Crítica',
    content: 'Ocorrência elevada para prioridade CRÍTICA. SLA reduzido para 2 horas. Favor confirmar recebimento e iniciar atendimento imediato.',
    category: 'escalation',
    type: 'operation'
  },
  {
    id: 'op-sla-warning',
    title: 'Alerta de SLA',
    content: 'ATENÇÃO: SLA próximo do vencimento. Restam apenas 30 minutos. Favor atualizar status da ocorrência.',
    category: 'escalation',
    type: 'operation'
  },
  {
    id: 'op-info-request',
    title: 'Solicitação de Informações',
    content: 'Favor fornecer previsão de resolução e status atual do atendimento. Cliente solicitando atualização.',
    category: 'response',
    type: 'operation'
  },
  {
    id: 'op-escalation',
    title: 'Escalação de Ocorrência',
    content: 'Ocorrência escalada para supervisão devido ao não cumprimento do SLA. Favor contatar supervisor imediatamente.',
    category: 'escalation',
    type: 'operation'
  },
  {
    id: 'op-customer-impact',
    title: 'Alto Impacto ao Cliente',
    content: 'Ocorrência com alto impacto operacional. Cliente reportando perdas significativas. Priorização máxima solicitada.',
    category: 'escalation',
    type: 'operation'
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

const categoryColors = {
  response: 'default',
  status: 'secondary',
  escalation: 'destructive',
  resolution: 'outline'
} as const;

export const MessageTemplates = ({ type, onSelectTemplate }: MessageTemplatesProps) => {
  const filteredTemplates = templates.filter(template => template.type === type);
  const categories = Array.from(new Set(filteredTemplates.map(t => t.category)));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wrench className="h-5 w-5" />
          Templates de Mensagem
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]">
          <div className="space-y-4">
            {categories.map(category => {
              const categoryTemplates = filteredTemplates.filter(t => t.category === category);
              
              return (
                <div key={category} className="space-y-2">
                  <div className="flex items-center gap-2">
                    {categoryIcons[category]}
                    <Badge variant={categoryColors[category]}>
                      {categoryLabels[category]}
                    </Badge>
                  </div>
                  <div className="space-y-1 ml-6">
                    {categoryTemplates.map(template => (
                      <Button
                        key={template.id}
                        variant="ghost"
                        className="w-full justify-start text-left h-auto p-3"
                        onClick={() => onSelectTemplate(template)}
                      >
                        <div>
                          <div className="font-medium text-sm">{template.title}</div>
                          <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {template.content}
                          </div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};