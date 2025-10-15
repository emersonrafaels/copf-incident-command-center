import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface OccurrencesAssistantProps {
  occurrences: any[];
  filteredCount: number;
  onClose?: () => void;
}

export const OccurrencesAssistant = ({ occurrences, filteredCount, onClose }: OccurrencesAssistantProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const getOccurrencesContext = () => {
    const now = new Date();
    
    // Contagens básicas
    const statusCount = occurrences.reduce((acc, occ) => {
      acc[occ.status] = (acc[occ.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const vendorCount = occurrences.reduce((acc, occ) => {
      acc[occ.vendor] = (acc[occ.vendor] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const severityCount = occurrences.reduce((acc, occ) => {
      acc[occ.severity] = (acc[occ.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const segmentCount = occurrences.reduce((acc, occ) => {
      acc[occ.segment] = (acc[occ.segment] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Status de equipamento
    const equipmentStatus = occurrences.reduce((acc, occ) => {
      const status = occ.statusEquipamento || 'operante';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Métricas de SLA
    const withoutForecast = occurrences.filter(occ => !occ.dataPrevisaoEncerramento).length;
    
    const overdueSla = occurrences.filter(occ => {
      if (occ.status === 'encerrado' || occ.status === 'cancelado') return false;
      const created = new Date(occ.createdAt);
      const hoursElapsed = (now.getTime() - created.getTime()) / (1000 * 60 * 60);
      const slaLimit = (occ.severity === 'critical' || occ.severity === 'high') ? 24 : 72;
      return hoursElapsed > slaLimit;
    }).length;

    const slaDueToday = occurrences.filter(occ => {
      if (occ.status === 'encerrado' || occ.status === 'cancelado') return false;
      const created = new Date(occ.createdAt);
      const slaLimit = (occ.severity === 'critical' || occ.severity === 'high') ? 24 : 72;
      const slaEndDate = new Date(created.getTime() + slaLimit * 60 * 60 * 1000);
      return slaEndDate.toDateString() === now.toDateString();
    }).length;

    const forecastBeyondSla = occurrences.filter(occ => {
      if (!occ.dataPrevisaoEncerramento) return false;
      const created = new Date(occ.createdAt);
      const forecast = new Date(occ.dataPrevisaoEncerramento);
      const slaLimit = (occ.severity === 'critical' || occ.severity === 'high') ? 24 : 72;
      const slaDeadline = new Date(created.getTime() + slaLimit * 60 * 60 * 1000);
      return forecast > slaDeadline;
    }).length;

    // Equipamentos problemáticos
    const equipmentCount = occurrences.reduce((acc, occ) => {
      acc[occ.equipment] = (acc[occ.equipment] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const topProblematicEquipment = Object.entries(equipmentCount)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 5)
      .map(([tipo, quantidade]) => ({ tipo, quantidade }));

    // Agências
    const uniqueAgencies = new Set(occurrences.map(occ => occ.agency)).size;
    
    // Calcula VIP dinamicamente (agências terminadas em 0 ou 5)
    const vipAgencies = occurrences.filter(occ => {
      const agencyNumber = occ.agency.match(/\d+/)?.[0] || '0';
      return agencyNumber.endsWith('0') || agencyNumber.endsWith('5');
    }).length;

    // Reincidência e impedimentos
    const recurrent = occurrences.filter(occ => {
      const sameReasonEquipment = occurrences.filter(other => 
        other.id !== occ.id &&
        other.description === occ.description &&
        other.equipment === occ.equipment &&
        other.agency === occ.agency
      );
      
      if (sameReasonEquipment.length === 0) return false;
      
      return sameReasonEquipment.some(other => {
        const daysDiff = Math.abs(new Date(occ.createdAt).getTime() - new Date(other.createdAt).getTime()) / (1000 * 60 * 60 * 24);
        return daysDiff <= 4;
      });
    }).length;
    
    const withImpediments = occurrences.filter(occ => occ.possuiImpedimento).length;

    // Exemplos de ocorrências (para contexto da IA)
    const examples = occurrences.slice(0, 5).map(occ => {
      const created = new Date(occ.createdAt);
      const hoursOpen = (now.getTime() - created.getTime()) / (1000 * 60 * 60);
      return {
        id: occ.displayId,
        equipamento: occ.equipment,
        status: occ.status,
        statusEquipamento: occ.statusEquipamento || 'operante',
        severidade: occ.severity,
        fornecedor: occ.vendor,
        motivoOcorrencia: occ.motivoOcorrencia || 'N/A',
        possuiImpedimento: occ.possuiImpedimento || false,
        horasAbertas: Math.round(hoursOpen)
      };
    });

    return {
      total: filteredCount,
      porStatus: statusCount,
      porFornecedor: vendorCount,
      porSeveridade: severityCount,
      porSegmento: segmentCount,
      
      // Status de equipamento
      equipamentosInoperantes: equipmentStatus['inoperante'] || 0,
      equipamentosOperantes: equipmentStatus['operante'] || 0,
      
      // Métricas de SLA
      slaVencido: overdueSla,
      slaVenceHoje: slaDueToday,
      semPrevisao: withoutForecast,
      previsaoAlemSLA: forecastBeyondSla,
      
      // Equipamentos problemáticos
      equipamentosMaisProblematicos: topProblematicEquipment,
      
      // Agências
      agenciasAfetadas: uniqueAgencies,
      agenciasVIP: vipAgencies,
      
      // Reincidência e impedimentos
      ocorrenciasReincidentes: recurrent,
      comImpedimentos: withImpediments,
      
      // Exemplos
      exemplos: examples
    };
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch(
        `https://xrxvfwurdjzzuibuahju.supabase.co/functions/v1/occurrences-assistant`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhyeHZmd3VyZGp6enVpYnVhaGp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3MTI5MTMsImV4cCI6MjA2OTI4ODkxM30.Ofmr-TfZfxV_AjikqlLmu6fYuO7zTKfDxmW_f3VGv-8`,
          },
          body: JSON.stringify({
            messages: messages.concat(userMessage),
            occurrencesContext: getOccurrencesContext(),
          }),
        }
      );

      if (!response.ok) {
        if (response.status === 429) {
          toast({
            title: "Limite excedido",
            description: "Muitas requisições. Aguarde um momento.",
            variant: "destructive",
          });
          setMessages(prev => prev.slice(0, -1));
          return;
        }
        if (response.status === 402) {
          toast({
            title: "Créditos insuficientes",
            description: "Adicione créditos ao workspace.",
            variant: "destructive",
          });
          setMessages(prev => prev.slice(0, -1));
          return;
        }
        throw new Error("Erro ao processar mensagem");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = "";

      if (!reader) throw new Error("Stream não disponível");

      setMessages(prev => [...prev, { role: "assistant", content: "" }]);

      let textBuffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantMessage += content;
              setMessages(prev => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1].content = assistantMessage;
                return newMessages;
              });
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }
    } catch (error) {
      console.error("Erro no assistente:", error);
      toast({
        title: "Erro",
        description: "Não foi possível processar sua mensagem.",
        variant: "destructive",
      });
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return null; // Controlado pelo componente pai agora
  }

  return (
    <Card className="fixed bottom-6 right-6 w-96 h-[600px] shadow-xl flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg">Assistente de Ocorrências</CardTitle>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            setIsOpen(false);
            onClose?.();
          }}
          className="h-8 w-8"
        >
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 px-4" ref={scrollRef}>
          <div className="space-y-4 pb-4">
            {messages.length === 0 && (
              <div className="text-sm text-muted-foreground space-y-4 py-4">
                <div className="text-center">
                  <p className="mb-2">👋 Olá! Sou seu assistente de ocorrências.</p>
                  <p className="mb-4">Pergunte-me sobre as {filteredCount} ocorrências listadas.</p>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-medium px-2">Sugestões rápidas:</p>
                  <div className="flex flex-col gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="justify-start text-left h-auto py-2 px-3"
                      onClick={() => {
                        setInput("Quais são as ocorrências mais críticas?");
                      }}
                    >
                      <span className="text-xs">⚠️ Quais são as ocorrências mais críticas?</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="justify-start text-left h-auto py-2 px-3"
                      onClick={() => {
                        setInput("Quantas ocorrências estão com SLA vencido?");
                      }}
                    >
                      <span className="text-xs">🚨 Quantas ocorrências estão com SLA vencido?</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="justify-start text-left h-auto py-2 px-3"
                      onClick={() => {
                        setInput("Mostre equipamentos inoperantes");
                      }}
                    >
                      <span className="text-xs">🔧 Mostre equipamentos inoperantes</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="justify-start text-left h-auto py-2 px-3"
                      onClick={() => {
                        setInput("Qual fornecedor tem mais problemas?");
                      }}
                    >
                      <span className="text-xs">📊 Qual fornecedor tem mais problemas?</span>
                    </Button>
                  </div>
                </div>
              </div>
            )}
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-lg px-4 py-2 text-sm ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
            {isLoading && messages[messages.length - 1]?.role === "user" && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg px-4 py-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        <div className="p-4 border-t">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
            className="flex gap-2"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Digite sua pergunta..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
};
