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
const agencyTypes = ['Convencional (AG)', 'Convencional (PAB)', 'Terceirizada (Espaço Itaú)', 'Terceirizada (PAB)', 'Terceirizada (PAE)', 'Terceirizada (Phygital)'];
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

function generateTodayDate(): string {
  const now = new Date();
  // Gerar uma hora aleatória para hoje (entre 00:00 e agora)
  const randomHour = Math.floor(Math.random() * now.getHours());
  const randomMinute = Math.floor(Math.random() * 60);
  const todayDate = new Date(now);
  todayDate.setHours(randomHour, randomMinute, 0, 0);
  return todayDate.toISOString();
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting to populate occurrences...');

    const occurrences = [];

    // Define aging scenarios distribution for heterogeneous data
    const totalOccurrences = 50;
    const scenarios = [
      { type: 'entraram_hoje', count: Math.floor(totalOccurrences * 0.20) }, // 20% - Entraram hoje
      { type: 'sem_previsao', count: Math.floor(totalOccurrences * 0.30) }, // 30% - Sem previsão
      { type: 'previsao_maior_sla', count: Math.floor(totalOccurrences * 0.20) }, // 20% - Previsão > SLA
      { type: 'sla_vencido', count: Math.floor(totalOccurrences * 0.15) }, // 15% - SLA vencido
      { type: 'resolvidas', count: Math.floor(totalOccurrences * 0.15) } // 15% - Resolvidas
    ];

    let occurrenceIndex = 0;

    // Generate occurrences for each scenario
    for (const scenario of scenarios) {
      for (let i = 0; i < scenario.count; i++) {
        const agency = generateAgency();
        const equipment = getRandomElement(equipments);
        const severity = getRandomElement(severities);
        const isVip = Math.random() < 0.2; // 20% chance of being VIP
        const hasImpediment = Math.random() < 0.15; // 15% chance of impediment
        const isReincident = Math.random() < 0.1; // 10% chance of reincidence
        
        // Generate creation date based on scenario
        let createdDaysAgo;
        let status;
        let resolvedAt = null;
        let closedAt = null;
        let slaDeadline = null;
        let forecastDate = null;
        
        // Calculate SLA deadline based on severity (24h for alta/critica, 72h for others)
        const slaHours = (severity === 'critica' || severity === 'alta') ? 24 : 72;
        
        switch (scenario.type) {
          case 'entraram_hoje':
            // Occurrences that started today - very recent
            status = Math.random() < 0.8 ? 'pendente' : 'em_andamento';
            forecastDate = null; // Usually no forecast yet since they just started
            break;
            
          case 'sem_previsao':
            // Ongoing occurrences without forecast - within SLA time
            createdDaysAgo = Math.floor(Math.random() * (slaHours === 24 ? 1 : 2)) + 0.5; // Recent creation, within SLA
            status = Math.random() < 0.7 ? 'em_andamento' : 'pendente';
            forecastDate = null; // No forecast date
            break;
            
          case 'previsao_maior_sla':
            // Occurrences with forecast beyond SLA deadline
            createdDaysAgo = Math.floor(Math.random() * (slaHours === 24 ? 2 : 4)) + 1; // 1-2 days for 24h SLA, 1-4 days for 72h SLA
            status = Math.random() < 0.6 ? 'em_andamento' : 'com_impedimentos';
            break;
            
          case 'sla_vencido':
            // Occurrences with expired SLA - created longer ago than SLA allows
            createdDaysAgo = (slaHours / 24) + Math.floor(Math.random() * 10) + 1; // Beyond SLA + 1-10 days
            status = Math.random() < 0.5 ? 'em_andamento' : 'com_impedimentos';
            // May or may not have forecast, but SLA is already expired
            forecastDate = Math.random() < 0.6 ? 
              new Date(Date.now() + (Math.random() * 3 * 24 * 60 * 60 * 1000)).toISOString() : null;
            break;
            
          case 'resolvidas':
            // Resolved occurrences with varied resolution times
            createdDaysAgo = Math.floor(Math.random() * 30) + 1; // 1-30 days ago
            status = 'resolvida';
            const resolvedDaysAgo = Math.floor(Math.random() * createdDaysAgo);
            resolvedAt = generateRandomDate(resolvedDaysAgo);
            closedAt = resolvedAt;
            break;
        }
        
        // Generate the creation date based on scenario
        let createdAt;
        if (scenario.type === 'entraram_hoje') {
          createdAt = generateTodayDate();
        } else {
          createdAt = generateRandomDate(createdDaysAgo);
        }
        
        const createdDate = new Date(createdAt);
        slaDeadline = new Date(createdDate.getTime() + (slaHours * 60 * 60 * 1000)).toISOString();
        
        // For previsao_maior_sla scenario, set forecast beyond SLA deadline
        if (scenario.type === 'previsao_maior_sla') {
          const slaDate = new Date(createdDate.getTime() + (slaHours * 60 * 60 * 1000));
          forecastDate = new Date(slaDate.getTime() + ((Math.random() * 5 + 1) * 24 * 60 * 60 * 1000)).toISOString();
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
          status_equipamento: getRandomElement(equipmentStatuses),
          vip: isVip,
          possui_impedimento: hasImpediment,
          reincidencia: isReincident,
          data_ocorrencia: createdAt,
          data_resolucao: resolvedAt,
          data_encerramento: closedAt,
          data_limite_sla: slaDeadline,
          data_previsao_encerramento: forecastDate,
          motivo_ocorrencia: getRandomElement(reasons),
          observacoes: hasImpediment ? 'Equipamento aguardando peça de reposição' : null,
          motivo_impedimento: hasImpediment ? 'Peça em falta no estoque' : null,
          usuario_responsavel: `Usuario${Math.floor(1000 + Math.random() * 9000)}`,
          dineg: `DINEG-0${Math.floor(1 + Math.random() * 5)}`,
          prioridade_fornecedor: getRandomElement(['P1', 'P2', 'P3', 'P4'])
        };

        occurrences.push(occurrence);
        occurrenceIndex++;
      }
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