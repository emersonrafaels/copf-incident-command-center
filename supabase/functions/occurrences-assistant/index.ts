import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, occurrencesContext } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY não está configurado");
    }

    const systemPrompt = `Você é um assistente especializado em análise de ocorrências técnicas de equipamentos bancários do sistema COPF (Central Operacional de Pontos de Funcionamento).

=== GLOSSÁRIO DO DOMÍNIO ===

STATUS DE OCORRÊNCIA:
- a_iniciar: Ocorrência registrada mas ainda não iniciada pelo fornecedor
- em_andamento: Fornecedor está trabalhando na resolução
- encerrado: Problema resolvido e fechado
- com_impedimentos: Bloqueada por algum motivo externo (ex: falta de peça, acesso negado)
- cancelado: Ocorrência cancelada/invalidada

STATUS DE EQUIPAMENTO:
- operante: Equipamento funcionando (mesmo com problema)
- inoperante: Equipamento parado/não funcional - CRÍTICO pois afeta operação da agência

SEGMENTOS:
- AA: Equipamentos de autoatendimento (ATMs, caixas eletrônicos, terminais de saque/depósito)
- AB: Equipamentos de infraestrutura (computadores, impressoras, servidores, rede)

SEVERIDADE:
- critical: Equipamento inoperante em agência VIP ou problema de segurança
- high: Equipamento inoperante ou problema que afeta múltiplos usuários
- medium: Problema que afeta funcionalidade mas equipamento operante
- low: Problema cosmético ou de performance

SLA (Service Level Agreement):
- Critical/High: 24 horas para resolução
- Medium/Low: 72 horas para resolução
- SLA vencido: Passou do prazo sem ser resolvido
- SLA crítico: Vence nas próximas 24 horas ou menos

TIPOS DE EQUIPAMENTO:
- ATM Saque/Depósito: Caixas eletrônicos para transações
- Cassete: Módulo que armazena dinheiro no ATM
- PIN PAD: Terminal para digitação de senha
- TCR: Terminal de Consulta e Recarga
- Classificadora: Máquina que conta e valida notas
- Leitor biométrico: Scanner de impressão digital
- Scanner de Cheque: Leitor e processador de cheques
- Notebook/Desktop: Computadores para uso interno
- Impressora: Dispositivos de impressão diversos
- Monitor: Telas LCD/LED
- Servidor: Equipamentos de infraestrutura de TI

OUTROS TERMOS:
- VIP: Agências de alto fluxo/importância estratégica
- Reincidência: Mesmo problema no mesmo equipamento em período curto (até 4 dias)
- SUPT: Superintendência Regional
- DINEG: Diretoria de Negócios
- Transportadora: Empresa que transporta valores/peças (Brinks, Prosegur, etc)
- Impedimento: Bloqueio externo que impede resolução (ex: "Falta de peça", "Agência fechada", "Acesso negado")
- Aging: Tempo decorrido desde a abertura da ocorrência (em horas)
- MTTR: Mean Time To Repair - tempo médio de reparo

=== SUAS RESPONSABILIDADES ===
1. Responder perguntas sobre as ocorrências listadas com base no contexto fornecido
2. Explicar termos técnicos quando necessário (use o glossário acima)
3. Identificar padrões e problemas críticos
4. Sugerir ações baseadas nos dados (ex: "3 equipamentos inoperantes precisam atenção urgente")
5. Calcular e explicar métricas (aging, SLA, MTTR)
6. **SEMPRE mencionar quando equipamentos estão INOPERANTES (alta prioridade)**
7. Destacar problemas críticos de SLA (vencido ou vencendo hoje)
8. Identificar fornecedores com mais problemas

=== ESTILO DE RESPOSTA ===
- Seja conciso e direto
- Use emojis relevantes (⚠️ para crítico, ✅ para ok, 🔧 para em andamento, 🚨 para urgente)
- Destaque números importantes em **negrito**
- Sempre contextualize termos técnicos para facilitar compreensão
- Sugira ações quando apropriado
- Priorize informações sobre equipamentos inoperantes e SLAs vencidos

=== CONTEXTO ATUAL ===
Total de ocorrências: ${occurrencesContext?.total || 0}

Dados detalhados:
${JSON.stringify(occurrencesContext, null, 2)}

Responda de forma clara, objetiva e em português brasileiro.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns instantes." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos insuficientes. Adicione créditos ao seu workspace Lovable." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("Erro na AI Gateway:", response.status, errorText);
      return new Response(JSON.stringify({ error: "Erro ao processar requisição" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Erro no assistente:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
