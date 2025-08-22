import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0'
import { corsHeaders } from '../_shared/cors.ts'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_ANON_KEY') ?? ''
)

// Sample data arrays
const equipments = [
  'CPU', 'Monitor', 'Impressora', 'UPS', 'Leitor de Cartão',
  'Câmera', 'Teclado', 'Scanner', 'Notebook', 'Desktop',
  'Servidor', 'ATM', 'PIN PAD', 'TCR', 'Classificadora'
];

const vendors = ['Fornecedor A', 'Fornecedor B', 'Fornecedor C', 'Fornecedor D', 'Fornecedor E'];
const segments = ['atm', 'pos', 'rede', 'datacenter'];
const states = ['SP', 'RJ', 'MG', 'RS', 'PR', 'SC', 'BA', 'GO', 'PE', 'CE'];
const agencyTypes = ['Convencional (Ag)', 'Convencional (PAB)', 'Terceirizada (Espaço Itaú)', 'Terceirizada (PAB)'];
const transporters = ['Transportadora Norte', 'Transportadora Sul', 'Transportadora Leste', 'Transportadora Oeste', 'Transportadora Centro'];
const statuses = ['pendente', 'em_andamento', 'resolvida', 'com_impedimentos'];
const priorities = ['baixa', 'media', 'alta', 'critica'];
const severities = ['baixa', 'media', 'alta', 'critica'];
const equipmentStatuses = ['operante', 'inoperante', 'degradado'];

const descriptions = [
  'Sistema travado', 'Falha na impressão', 'Equipamento não responde',
  'Problema de conectividade', 'Mau funcionamento do hardware', 'Falha na comunicação',
  'Falha de energia', 'Falha no sistema', 'Erro de hardware',
  'Problema de rede', 'Falha de software', 'Equipamento inoperante'
];

const reasons = [
  'Falha de hardware', 'Problema de software', 'Falha de conectividade',
  'Manutenção preventiva', 'Atualização de sistema', 'Substituição de peças'
];

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function generateSerialNumber(): string {
  const prefix = ['SN', 'BR', 'EQ', 'AT', 'SV'][Math.floor(Math.random() * 5)];
  const number = Math.floor(100000 + Math.random() * 900000);
  return `${prefix}${number}`;
}

function generateAgency(): string {
  const agencyNumber = Math.floor(1000 + Math.random() * 9000);
  return agencyNumber.toString();
}

function generateSupt(agency: string): string {
  const num = parseInt(agency);
  
  if (num >= 2000 && num <= 2999) return 'SUPT-02';
  if (num >= 3000 && num <= 3999) return 'SUPT-03';
  if (num >= 4000 && num <= 4999) return 'SUPT-04';
  if (num >= 5000 && num <= 5999) return 'SUPT-05';
  
  return ['SUPT-01', 'SUPT-02', 'SUPT-03', 'SUPT-04', 'SUPT-05'][Math.floor(Math.random() * 5)];
}

function generateRandomDate(daysAgo: number): string {
  const now = new Date();
  const randomDays = Math.floor(Math.random() * daysAgo);
  const date = new Date(now.getTime() - (randomDays * 24 * 60 * 60 * 1000));
  return date.toISOString();
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting to populate occurrences...');

    const occurrences = [];

    // Generate 50 random occurrences
    for (let i = 0; i < 50; i++) {
      const agency = generateAgency();
      const equipment = getRandomElement(equipments);
      const status = getRandomElement(statuses);
      const severity = getRandomElement(severities);
      const isVip = Math.random() < 0.2; // 20% chance of being VIP
      const hasImpediment = Math.random() < 0.15; // 15% chance of impediment
      const isReincident = Math.random() < 0.1; // 10% chance of reincidence
      
      // Generate dates - older occurrences have higher chance of being resolved
      const createdDaysAgo = Math.floor(Math.random() * 30); // Up to 30 days ago
      const createdAt = generateRandomDate(createdDaysAgo);
      
      let resolvedAt = null;
      let closedAt = null;
      let slaDeadline = null;
      
      // Calculate SLA deadline based on severity
      const slaHours = (severity === 'critica' || severity === 'alta') ? 24 : 72;
      const createdDate = new Date(createdAt);
      slaDeadline = new Date(createdDate.getTime() + (slaHours * 60 * 60 * 1000)).toISOString();
      
      // If status is resolved, generate resolution date
      if (status === 'resolvida') {
        const resolvedDaysAgo = Math.floor(Math.random() * createdDaysAgo);
        resolvedAt = generateRandomDate(resolvedDaysAgo);
        closedAt = resolvedAt;
      }
      
      const occurrence = {
        agencia: agency,
        equipamento: equipment,
        numero_serie: generateSerialNumber(),
        descricao: getRandomElement(descriptions),
        status: status,
        prioridade: getRandomElement(priorities),
        severidade: severity,
        fornecedor: getRandomElement(vendors),
        segmento: getRandomElement(segments),
        uf: getRandomElement(states),
        tipo_agencia: getRandomElement(agencyTypes),
        supt: generateSupt(agency),
        transportadora: getRandomElement(transporters),
        status_equipamento: getRandomElement(equipmentStatuses),
        vip: isVip,
        possui_impedimento: hasImpediment,
        reincidencia: isReincident,
        data_ocorrencia: createdAt,
        data_resolucao: resolvedAt,
        data_encerramento: closedAt,
        data_limite_sla: slaDeadline,
        motivo_ocorrencia: getRandomElement(reasons),
        observacoes: hasImpediment ? 'Equipamento aguardando peça de reposição' : null,
        motivo_impedimento: hasImpediment ? 'Peça em falta no estoque' : null,
        usuario_responsavel: `Usuario${Math.floor(1000 + Math.random() * 9000)}`,
        dineg: `DINEG-0${Math.floor(1 + Math.random() * 5)}`,
        prioridade_fornecedor: getRandomElement(['P1', 'P2', 'P3', 'P4']),
        data_previsao_encerramento: status === 'em_andamento' || status === 'com_impedimentos' ? 
          new Date(Date.now() + (Math.random() * 7 * 24 * 60 * 60 * 1000)).toISOString() : null
      };

      occurrences.push(occurrence);
    }

    console.log(`Generated ${occurrences.length} occurrences. Inserting into database...`);

    // Insert occurrences in batches
    const batchSize = 10;
    const results = [];
    
    for (let i = 0; i < occurrences.length; i += batchSize) {
      const batch = occurrences.slice(i, i + batchSize);
      
      const { data, error } = await supabase
        .from('occurrences')
        .insert(batch)
        .select('id');

      if (error) {
        console.error('Error inserting batch:', error);
        throw error;
      }

      results.push(...(data || []));
      console.log(`Inserted batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(occurrences.length/batchSize)}`);
    }

    console.log(`Successfully inserted ${results.length} occurrences`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully created ${results.length} occurrences`,
        insertedIds: results.map(r => r.id)
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in populate-occurrences function:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});