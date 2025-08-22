import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0'
import { corsHeaders } from '../_shared/cors.ts'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_ANON_KEY') ?? ''
)

// Sample data arrays
const equipments = [
  'ATM Saque', 'ATM Depósito', 'Cassete', 'Notebook', 'Desktop',
  'Leitor de Cheques/documentos', 'Leitor biométrico', 'PIN PAD',
  'Scanner de Cheque', 'Impressora', 'Impressora térmica',
  'Impressora multifuncional', 'Monitor LCD/LED', 'Teclado',
  'Servidor', 'Televisão', 'Senheiro', 'TCR', 'Classificadora',
  'Fragmentadora de Papel'
];

const vendors = ['Fornecedor A', 'Fornecedor B', 'Fornecedor C', 'Fornecedor D', 'Fornecedor E'];
const segments = ['Varejo', 'Atacado', 'Corporativo', 'Private'];
const states = ['SP', 'RJ', 'MG', 'RS', 'PR', 'SC', 'BA', 'GO', 'PE', 'CE'];
const agencyTypes = ['Tradicional', 'PAB', 'PAE', 'Posto'];
const transporters = ['Transportadora A', 'Transportadora B', 'Transportadora C', 'Transportadora D'];
const statuses = ['aberto', 'em_andamento', 'aguardando_peca', 'aguardando_terceiro', 'encerrado', 'cancelado'];
const priorities = ['baixa', 'media', 'alta', 'critica'];
const severities = ['low', 'medium', 'high', 'critical'];
const equipmentStatuses = ['operante', 'inoperante'];

const descriptions = [
  'Equipamento não liga após atualização',
  'Erro na leitura de cartão magnético',
  'Impressora não responde aos comandos',
  'Tela preta sem sinal de vídeo',
  'Barulho anormal durante operação',
  'Aquecimento excessivo do equipamento',
  'Falha na comunicação com servidor central',
  'Travamento intermitente do sistema',
  'Papel atolado no mecanismo interno',
  'Sensor biométrico com baixa sensibilidade',
  'Conexão de rede instável',
  'Falha no mecanismo de dispensa de cédulas',
  'Teclado com teclas não funcionais',
  'Monitor com pixels mortos',
  'Sistema operacional corrompido',
  'Falha no sistema de refrigeração',
  'Erro de comunicação USB',
  'Bateria do nobreak descarregando rapidamente',
  'Fragmentadora travando com papel',
  'Scanner não detectando documentos'
];

const reasons = [
  'Desgaste natural dos componentes',
  'Falta de manutenção preventiva',
  'Sobrecarga no sistema elétrico',
  'Umidade excessiva no ambiente',
  'Poeira acumulada nos componentes',
  'Atualização de software mal sucedida',
  'Falha na rede elétrica local',
  'Uso inadequado pelo usuário',
  'Fim da vida útil do componente',
  'Defeito de fabricação',
  'Interferência eletromagnética',
  'Configuração inadequada do sistema'
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
  const agencyNames = [
    'Centro', 'Matriz', 'Shopping', 'Aeroporto', 'Rodoviária',
    'Universitária', 'Industrial', 'Comercial', 'Residencial', 'Terminal'
  ];
  return `Agência ${getRandomElement(agencyNames)} - ${agencyNumber}`;
}

function generateSupt(agency: string): string {
  const agencyNumber = agency.match(/\d+/)?.[0] || '1000';
  const num = parseInt(agencyNumber);
  
  if (num >= 2000 && num <= 2999) return '20';
  if (num >= 3000 && num <= 3999) return '30';
  if (num >= 4000 && num <= 4999) return '40';
  if (num >= 5000 && num <= 5999) return '50';
  
  return ['10', '15', '21', '31', '41', '51'][Math.floor(Math.random() * 6)];
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
      const slaHours = (severity === 'critical' || severity === 'high') ? 24 : 72;
      const createdDate = new Date(createdAt);
      slaDeadline = new Date(createdDate.getTime() + (slaHours * 60 * 60 * 1000)).toISOString();
      
      // If status is resolved or closed, generate resolution date
      if (status === 'encerrado' || status === 'cancelado') {
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
        dineg: `DINEG${Math.floor(10 + Math.random() * 90)}`,
        prioridade_fornecedor: getRandomElement(['P1', 'P2', 'P3', 'P4']),
        data_previsao_encerramento: status === 'em_andamento' || status === 'aguardando_peca' ? 
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