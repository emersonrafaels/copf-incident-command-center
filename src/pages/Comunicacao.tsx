import { COPFLayout } from "@/components/copf/COPFLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { MessageSquare, Send, Phone, Mail, Clock, User } from "lucide-react";

const mockComunicacao = [
  {
    id: 1,
    fornecedor: "Diebold Nixdorf",
    assunto: "ATM fora de operação - Ag. Centro",
    status: "aguardando",
    prioridade: "Alta",
    dataEnvio: "2024-01-15 09:30",
    ultimaResposta: "2024-01-15 10:45"
  },
  {
    id: 2,
    fornecedor: "Carrier",
    assunto: "Manutenção preventiva climatização",
    status: "respondido",
    prioridade: "Média",
    dataEnvio: "2024-01-14 16:20",
    ultimaResposta: "2024-01-15 08:15"
  },
  {
    id: 3,
    fornecedor: "Vivo Empresas",
    assunto: "Conectividade MPLS - Emergencial",
    status: "resolvido",
    prioridade: "Crítica",
    dataEnvio: "2024-01-15 07:45",
    ultimaResposta: "2024-01-15 11:20"
  }
];

const Comunicacao = () => {
  return (
    <COPFLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Comunicação</h1>
            <p className="text-muted-foreground">Gestão de comunicação com fornecedores</p>
          </div>
          <Button variant="premium">
            <MessageSquare className="mr-2 h-4 w-4" />
            Nova Comunicação
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Comunicações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {mockComunicacao.map((item) => (
                  <div key={item.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <User className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{item.fornecedor}</p>
                          <p className="text-sm text-muted-foreground">{item.assunto}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={
                          item.prioridade === "Crítica" ? "destructive" :
                          item.prioridade === "Alta" ? "secondary" : "outline"
                        }>
                          {item.prioridade}
                        </Badge>
                        <Badge variant={
                          item.status === "resolvido" ? "default" :
                          item.status === "respondido" ? "secondary" : "outline"
                        }>
                          {item.status}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Send className="h-3 w-3" />
                          Enviado: {item.dataEnvio}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Resposta: {item.ultimaResposta}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">
                          <Phone className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Mail className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Nova Mensagem</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Fornecedor</label>
                  <Input placeholder="Selecionar fornecedor..." />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Assunto</label>
                  <Input placeholder="Assunto da mensagem..." />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Prioridade</label>
                  <Input placeholder="Selecionar prioridade..." />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Mensagem</label>
                  <Textarea 
                    placeholder="Digite sua mensagem..."
                    className="min-h-[120px]"
                  />
                </div>
                
                <Button className="w-full" variant="premium">
                  <Send className="mr-2 h-4 w-4" />
                  Enviar Mensagem
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Templates Rápidos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start text-sm">
                  Solicitação de Reparo
                </Button>
                <Button variant="outline" className="w-full justify-start text-sm">
                  Manutenção Preventiva
                </Button>
                <Button variant="outline" className="w-full justify-start text-sm">
                  Escalação Urgente
                </Button>
                <Button variant="outline" className="w-full justify-start text-sm">
                  Status Update
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </COPFLayout>
  );
};

export default Comunicacao;