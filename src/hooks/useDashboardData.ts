import { useState, useEffect, useMemo, useCallback } from 'react'
import { formatHours } from '@/lib/timeUtils'
import { useFilters } from '@/contexts/FiltersContext'

export interface OccurrenceData {
  id: string
  agency: string
  segment: 'AA' | 'AB'
  equipment: string
  serialNumber: string
  description: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  status: 'a_iniciar' | 'em_andamento' | 'encerrado' | 'com_impedimentos' | 'cancelado'
  createdAt: string
  resolvedAt?: string
  assignedTo: string
  vendor: string
  transportadora?: string // Hierarquia: transportadora > fornecedor para terceirizados
  tipoAgencia: string
  estado: string
  municipio: string
  dineg: string
  vip: boolean
}

export interface ChartData {
  name: string
  value: number
  fill: string
}

export interface TimelineData {
  date: string
  ocorrencias: number
  resolvidas: number
}

export interface MTTRData {
  mes: string
  mttr: number
}

export function useDashboardData() {
  const [occurrences, setOccurrences] = useState<OccurrenceData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { filterPeriod } = useFilters()

  // Dados mock estáticos para ~1200 ocorrências - fixo para evitar mudanças na navegação
  const generateMockData = () => {
    // Data fixa para garantir consistência
    const today = new Date('2024-01-15T10:00:00.000Z');
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const twoDaysAgo = new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000);
    const threeDaysAgo = new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000);

    // Estrutura expandida para gerar ~1200 ocorrências
    const hierarchyStructure = [
      // SP - DINEG 2 (20 agências)
      { estado: 'SP', municipio: 'São Paulo', dineg: '2', agencias: ['0001', '0002', '0003', '0004', '0005', '0015', '0016', '0017', '0018', '0032'], tipo: 'convencional', vip: true },
      { estado: 'SP', municipio: 'São Paulo', dineg: '2', agencias: ['0045', '0046', '0047', '0067', '0068', '0069', '0089', '0090', '0091', '0095'], tipo: 'terceirizada', vip: false },
      { estado: 'SP', municipio: 'Campinas', dineg: '2', agencias: ['0101', '0102', '0103', '0115', '0116', '0132', '0133', '0134', '0135', '0136'], tipo: 'pab', vip: true },
      { estado: 'SP', municipio: 'Santos', dineg: '2', agencias: ['0201', '0202', '0203', '0215', '0216', '0217', '0218', '0219', '0220', '0221'], tipo: 'pae', vip: false },
      
      // RJ - DINEG 4 (20 agências)
      { estado: 'RJ', municipio: 'Rio de Janeiro', dineg: '4', agencias: ['1001', '1002', '1003', '1015', '1016', '1017', '1032', '1033', '1034', '1035'], tipo: 'convencional', vip: true },
      { estado: 'RJ', municipio: 'Rio de Janeiro', dineg: '4', agencias: ['1045', '1046', '1047', '1067', '1068', '1070', '1071', '1075', '1076', '1080'], tipo: 'terceirizada', vip: false },
      { estado: 'RJ', municipio: 'Niterói', dineg: '4', agencias: ['1101', '1102', '1103', '1115', '1116', '1117', '1118', '1119', '1120', '1121'], tipo: 'pab', vip: true },
      { estado: 'RJ', municipio: 'Nova Iguaçu', dineg: '4', agencias: ['1401', '1402', '1403', '1410', '1411', '1412', '1413', '1414', '1415', '1416'], tipo: 'terceirizada', vip: false },
      
      // MG - DINEG 8 (20 agências)
      { estado: 'MG', municipio: 'Belo Horizonte', dineg: '8', agencias: ['2001', '2002', '2003', '2015', '2016', '2017', '2032', '2033', '2034', '2035'], tipo: 'convencional', vip: true },
      { estado: 'MG', municipio: 'Belo Horizonte', dineg: '8', agencias: ['2045', '2046', '2047', '2067', '2068', '2070', '2071', '2075', '2076', '2077'], tipo: 'terceirizada', vip: false },
      { estado: 'MG', municipio: 'Uberlândia', dineg: '8', agencias: ['2101', '2102', '2103', '2115', '2116', '2117', '2118', '2119', '2120', '2121'], tipo: 'pab', vip: true },
      { estado: 'MG', municipio: 'Juiz de Fora', dineg: '8', agencias: ['2301', '2302', '2303', '2315', '2316', '2317', '2318', '2319', '2320', '2321'], tipo: 'terceirizada', vip: false },
      
      // RS - DINEG 80 (20 agências)
      { estado: 'RS', municipio: 'Porto Alegre', dineg: '80', agencias: ['3001', '3002', '3003', '3015', '3016', '3017', '3032', '3033', '3034', '3035'], tipo: 'convencional', vip: true },
      { estado: 'RS', municipio: 'Porto Alegre', dineg: '80', agencias: ['3045', '3046', '3047', '3050', '3051', '3055', '3056', '3057', '3058', '3059'], tipo: 'terceirizada', vip: false },
      { estado: 'RS', municipio: 'Caxias do Sul', dineg: '80', agencias: ['3101', '3102', '3103', '3104', '3105', '3106', '3107', '3108', '3109', '3110'], tipo: 'pab', vip: true },
      { estado: 'RS', municipio: 'Canoas', dineg: '80', agencias: ['3301', '3302', '3303', '3310', '3311', '3312', '3313', '3314', '3315', '3316'], tipo: 'terceirizada', vip: false },
      
      // BA - DINEG 3 (20 agências)
      { estado: 'BA', municipio: 'Salvador', dineg: '3', agencias: ['4001', '4002', '4003', '4015', '4016', '4017', '4032', '4033', '4034', '4035'], tipo: 'convencional', vip: true },
      { estado: 'BA', municipio: 'Salvador', dineg: '3', agencias: ['4045', '4046', '4047', '4067', '4068', '4070', '4071', '4072', '4073', '4074'], tipo: 'terceirizada', vip: false },
      { estado: 'BA', municipio: 'Feira de Santana', dineg: '3', agencias: ['4101', '4102', '4103', '4115', '4116', '4117', '4118', '4119', '4120', '4121'], tipo: 'terceirizada', vip: true },
      
      // PR - DINEG 5 (20 agências)
      { estado: 'PR', municipio: 'Curitiba', dineg: '5', agencias: ['5001', '5002', '5003', '5015', '5016', '5017', '5032', '5033', '5034', '5035'], tipo: 'convencional', vip: true },
      { estado: 'PR', municipio: 'Curitiba', dineg: '5', agencias: ['5045', '5046', '5047', '5067', '5068', '5070', '5071', '5072', '5073', '5074'], tipo: 'terceirizada', vip: false },
      { estado: 'PR', municipio: 'Londrina', dineg: '5', agencias: ['5101', '5102', '5103', '5115', '5116', '5117', '5118', '5119', '5120', '5121'], tipo: 'pab', vip: true },
    ];

    // Equipamentos por segmento
    const equipmentsBySegment = {
      AA: ['ATM Saque', 'ATM Depósito', 'Cassete'],
      AB: ['Notebook', 'Desktop', 'Leitor de Cheques/documentos', 'Leitor biométrico', 'PIN PAD', 'Scanner de Cheque', 'Impressora', 'Impressora térmica', 'Impressora multifuncional', 'Monitor LCD/LED', 'Teclado', 'Servidor', 'Televisão', 'Senheiro', 'TCR', 'Classificadora', 'Fragmentadora de Papel']
    };

    // Transportadoras
    const transportadoras = ['Express Logística', 'TechTransporte', 'LogiCorp'];
    const fornecedoresPorTransportadora = {
      'Express Logística': ['Fornecedor A', 'Fornecedor B', 'Fornecedor C'],
      'TechTransporte': ['Fornecedor D', 'Fornecedor E'],
      'LogiCorp': ['Fornecedor F', 'Fornecedor G', 'Fornecedor H']
    };

    // Fornecedores por segmento
    const allVendors = {
      AA: ['Diebold Nixdorf', 'NCR Corporation', 'Itautec'],
      AB: ['Dell Technologies', 'HP', 'Lenovo', 'Gertec', 'Bematech', 'Epson', 'Canon']
    };

    // Descrições por segmento
    const descriptions = {
      AA: [
        'ATM não está dispensando cédulas - erro de hardware na gaveta',
        'ATM não aceita depósitos - problemas no mecanismo de captura',
        'Erro de conectividade com o servidor central',
        'Cassete com defeito no sensor de notas',
        'Falha na autenticação biométrica',
        'Problema no leitor de cartão magnético',
        'Display do ATM com falha na exibição',
        'Teclado numérico não responsivo'
      ],
      AB: [
        'Impressora com papel atolado constantemente',
        'Perda total de conectividade - link primário inoperante', 
        'Terminal não reconhece cartões chip',
        'Monitor com falha na exibição',
        'Teclado com teclas não responsivas',
        'Servidor com alta latência',
        'Scanner não consegue ler documentos',
        'Leitor biométrico não funciona',
        'Televisão sem sinal',
        'Classificadora com erro de contagem',
        'Notebook apresentando tela azul',
        'Desktop com lentidão extrema',
        'PIN PAD com botões travados'
      ]
    };

    const statuses = ['a_iniciar', 'em_andamento', 'encerrado', 'com_impedimentos', 'cancelado'];
    const severities = ['critical', 'high', 'medium', 'low'];
    const assignees = ['João Silva - NOC', 'Maria Santos - Facilities', 'Carlos Oliveira - Redes', 'Ana Costa - POS', 'Roberto Lima - Suporte'];

    const mockOccurrences: OccurrenceData[] = [];
    let occurrenceCounter = 1;

    // Gerar ocorrências para cada estrutura
    hierarchyStructure.forEach((structure, groupIndex) => {
      structure.agencias.forEach((agencyNum, agencyIndex) => {
        // Cada agência terá entre 5-7 ocorrências para chegar em ~1200
        const occurrenceCount = 6;
        
        for (let i = 0; i < occurrenceCount; i++) {
          const segment = (i % 3 === 0) ? 'AB' : 'AA'; // 33% AB, 67% AA
          const equipmentList = equipmentsBySegment[segment];
          const equipment = equipmentList[i % equipmentList.length];
          
          // Determinar fornecedor
          let vendor: string;
          let transportadora: string | undefined;
          
          if (structure.tipo === 'terceirizada') {
            transportadora = transportadoras[groupIndex % transportadoras.length];
            vendor = fornecedoresPorTransportadora[transportadora][i % fornecedoresPorTransportadora[transportadora].length];
          } else {
            const segmentVendors = allVendors[segment];
            vendor = segmentVendors[i % segmentVendors.length];
          }

          // Status distribuído com seed fixo
          const status = statuses[(occurrenceCounter + i) % statuses.length] as any;
          
          // Datas estratégicas com seed fixo:
          let createdAt: Date;
          let resolvedAt: string | undefined;
          
          // Distribuição de datas baseada em seed fixo:
          const seed = (occurrenceCounter + i + groupIndex) % 100;
          
          if (seed < 10) {
            // 10% criadas hoje
            createdAt = new Date(today.getTime() - (seed * 60 * 60 * 1000)); // 0-9h atrás
          } else if (seed < 15) {
            // 5% que vencem hoje - críticas/altas criadas há ~23h, médias/baixas há ~71h
            const severity = severities[(occurrenceCounter + i) % severities.length] as any;
            if (severity === 'critical' || severity === 'high') {
              createdAt = new Date(today.getTime() - 23 * 60 * 60 * 1000); // 23h atrás
            } else {
              createdAt = new Date(today.getTime() - 71 * 60 * 60 * 1000); // 71h atrás
            }
          } else if (seed < 30) {
            // ~15% em atraso
            const severity = severities[(occurrenceCounter + i) % severities.length] as any;
            if (severity === 'critical' || severity === 'high') {
              createdAt = new Date(today.getTime() - (26 + (seed * 2)) * 60 * 60 * 1000); // 26-86h atrás
            } else {
              createdAt = new Date(today.getTime() - (74 + (seed * 2)) * 60 * 60 * 1000); // 74-134h atrás
            }
          } else {
            // 70% distribuídas nos últimos 30 dias
            const daysAgo = (seed - 30) * 0.4; // 0-28 dias
            createdAt = new Date(today.getTime() - daysAgo * 24 * 60 * 60 * 1000);
          }
          
          // Resolver ocorrências encerradas
          if (status === 'encerrado') {
            const durationHours = 2 + ((occurrenceCounter + i) % 46); // 2-48 horas determinístico
            resolvedAt = new Date(createdAt.getTime() + durationHours * 60 * 60 * 1000).toISOString();
          }

          const occurrenceId = `COPF-2024-${String(occurrenceCounter).padStart(4, '0')}`;
          
          mockOccurrences.push({
            id: occurrenceId,
            agency: `AG${agencyNum} - Centro (${structure.municipio})`,
            segment,
            equipment,
            serialNumber: `${segment}${String(occurrenceCounter).padStart(4, '0')}-${structure.estado}-${agencyNum}`,
            description: descriptions[segment][i % descriptions[segment].length],
            severity: severities[(occurrenceCounter + i) % severities.length] as any,
            status,
            createdAt: createdAt.toISOString(),
            resolvedAt,
            assignedTo: assignees[i % assignees.length],
            vendor,
            transportadora,
            tipoAgencia: structure.tipo,
            estado: structure.estado,
            municipio: structure.municipio,
            dineg: structure.dineg,
            vip: structure.vip
          });
          
          occurrenceCounter++;
        }
      });
    });

    // Adicionar reincidências específicas (50 total) com seed fixo
    const reincidenceTemplates = [
      { agency: 'AG0001 - Centro (São Paulo)', equipment: 'ATM Saque', description: 'ATM não está dispensando cédulas - erro de hardware na gaveta' },
      { agency: 'AG0015 - Centro (São Paulo)', equipment: 'Impressora', description: 'Impressora com papel atolado constantemente' },
      { agency: 'AG1001 - Centro (Rio de Janeiro)', equipment: 'ATM Depósito', description: 'ATM não aceita depósitos - problemas no mecanismo de captura' },
      { agency: 'AG2001 - Centro (Belo Horizonte)', equipment: 'Desktop', description: 'Desktop com lentidão extrema' },
      { agency: 'AG3001 - Centro (Porto Alegre)', equipment: 'Monitor LCD/LED', description: 'Monitor com falha na exibição' },
    ];

    for (let i = 0; i < 50; i++) {
      const template = reincidenceTemplates[i % reincidenceTemplates.length];
      const daysAgo = (i % 3) * 0.5; // 0, 0.5, 1 dia atrás - determinístico
      const createdAt = new Date(today.getTime() - daysAgo * 24 * 60 * 60 * 1000);
      
      mockOccurrences.push({
        id: `COPF-2024-REC-${String(i + 1).padStart(3, '0')}`,
        agency: template.agency,
        segment: template.equipment.includes('ATM') ? 'AA' : 'AB',
        equipment: template.equipment,
        serialNumber: `REC${String(i + 1).padStart(3, '0')}-${template.agency.substring(3, 5)}`,
        description: template.description,
        severity: severities[i % severities.length] as any,
        status: ['a_iniciar', 'em_andamento', 'com_impedimentos'][i % 3] as any,
        createdAt: createdAt.toISOString(),
        assignedTo: assignees[i % assignees.length],
        vendor: template.equipment.includes('ATM') ? 'Diebold Nixdorf' : 'HP',
        tipoAgencia: 'convencional',
        estado: template.agency.includes('São Paulo') ? 'SP' : template.agency.includes('Rio') ? 'RJ' : template.agency.includes('Belo') ? 'MG' : 'RS',
        municipio: template.agency.includes('São Paulo') ? 'São Paulo' : template.agency.includes('Rio') ? 'Rio de Janeiro' : template.agency.includes('Belo') ? 'Belo Horizonte' : 'Porto Alegre',
        dineg: template.agency.includes('São Paulo') ? '2' : template.agency.includes('Rio') ? '4' : template.agency.includes('Belo') ? '8' : '80',
        vip: true
      });
    }

    return mockOccurrences;
  }

  // Inicializar dados uma única vez
  useEffect(() => {
    setIsLoading(true)
    const timer = setTimeout(() => {
      setOccurrences(generateMockData())
      setIsLoading(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  // Dados processados para gráficos - Memoizados para performance
  const severityData: ChartData[] = useMemo(() => [
    {
      name: 'Crítico',
      value: occurrences.filter(o => o.severity === 'critical').length,
      fill: 'hsl(var(--destructive))'
    },
    {
      name: 'Alto',
      value: occurrences.filter(o => o.severity === 'high').length,
      fill: 'hsl(var(--warning))'
    },
    {
      name: 'Médio',
      value: occurrences.filter(o => o.severity === 'medium').length,
      fill: 'hsl(var(--primary))'
    },
    {
      name: 'Baixo',
      value: occurrences.filter(o => o.severity === 'low').length,
      fill: 'hsl(var(--muted-foreground))'
    }
  ], [occurrences])

  const timelineData: TimelineData[] = useMemo(() => {
    const multiplier = filterPeriod === '1-day' ? 0.3 : 
                      filterPeriod === '7-days' ? 1 :
                      filterPeriod === '30-days' ? 4.2 :
                      filterPeriod === '90-days' ? 12.5 : 52;

    return [
      { date: '01/01', ocorrencias: Math.round(45 * multiplier), resolvidas: Math.round(38 * multiplier) },
      { date: '02/01', ocorrencias: Math.round(52 * multiplier), resolvidas: Math.round(44 * multiplier) },
      { date: '03/01', ocorrencias: Math.round(48 * multiplier), resolvidas: Math.round(41 * multiplier) },
      { date: '04/01', ocorrencias: Math.round(61 * multiplier), resolvidas: Math.round(55 * multiplier) },
      { date: '05/01', ocorrencias: Math.round(55 * multiplier), resolvidas: Math.round(48 * multiplier) },
      { date: '06/01', ocorrencias: Math.round(67 * multiplier), resolvidas: Math.round(59 * multiplier) },
      { date: '07/01', ocorrencias: Math.round(59 * multiplier), resolvidas: Math.round(52 * multiplier) }
    ]
  }, [filterPeriod])

  const mttrData: MTTRData[] = [
    { mes: 'Jul', mttr: 5.2 },
    { mes: 'Ago', mttr: 4.8 },
    { mes: 'Set', mttr: 4.5 },
    { mes: 'Out', mttr: 4.1 },
    { mes: 'Nov', mttr: 3.9 },
    { mes: 'Dez', mttr: 4.2 }
  ]

  // Dados dos equipamentos baseados nos segmentos AA e AB mapeados - Memoizados
  const equipmentData: ChartData[] = useMemo(() => [
    { 
      name: 'Segmento AA', 
      value: occurrences.filter(o => o.segment === 'AA').length, 
      fill: 'hsl(var(--primary))' 
    },
    { 
      name: 'Segmento AB', 
      value: occurrences.filter(o => o.segment === 'AB').length, 
      fill: 'hsl(var(--warning))' 
    }
  ], [occurrences])

  const metrics = useMemo(() => {
    const resolvedCount = occurrences.filter(o => o.status === 'encerrado').length
    const totalCount = occurrences.length
    const pendingCount = occurrences.filter(o => o.status === 'a_iniciar' || o.status === 'em_andamento').length
    
    // Calcular reincidências (mesmo motivo, mesmo equipamento, em até 4 dias)
    const reincidenceCount = occurrences.reduce((count, occurrence, index) => {
      const sameReasonEquipment = occurrences.filter((other, otherIndex) => 
        otherIndex !== index &&
        other.description === occurrence.description &&
        other.equipment === occurrence.equipment &&
        other.agency === occurrence.agency
      );
      
      if (sameReasonEquipment.length > 0) {
        const hasRecentRecurrence = sameReasonEquipment.some(other => {
          const daysDiff = Math.abs(new Date(occurrence.createdAt).getTime() - new Date(other.createdAt).getTime()) / (1000 * 60 * 60 * 24);
          return daysDiff <= 4;
        });
        
        if (hasRecentRecurrence) {
          return count + 1;
        }
      }
      return count;
    }, 0);
    
    // Calcular SLA em atraso
    const overdueCount = occurrences.filter(o => {
      if (o.status === 'encerrado') return false;
      const createdDate = new Date(o.createdAt);
      const hoursDiff = (Date.now() - createdDate.getTime()) / (1000 * 60 * 60);
      const slaLimit = o.severity === 'critical' || o.severity === 'high' ? 24 : 72;
      return hoursDiff > slaLimit;
    }).length;
    
    // Calcular agências afetadas e VIPs
    const affectedAgencies = new Set(occurrences.map(o => o.agency));
    const vipAgencies = Array.from(affectedAgencies).filter(agency => {
      const agencyNumber = agency.match(/\d+/)?.[0] || '0';
      return agencyNumber.endsWith('0') || agencyNumber.endsWith('5');
    });
    
    return {
      totalOccurrences: totalCount,
      resolvedOccurrences: resolvedCount,
      pendingOccurrences: pendingCount,
      reincidenceCount,
      overdueCount,
      affectedAgencies: affectedAgencies.size,
      vipAgencies: vipAgencies.length,
      avgMTTR: formatHours(4.2),
      resolutionRate: totalCount > 0 ? Math.round((resolvedCount / totalCount) * 100) : 0
    }
  }, [occurrences])

  return {
    occurrences,
    isLoading,
    severityData,
    timelineData,
    mttrData,
    equipmentData,
    metrics,
    refreshData: useCallback(() => {
      setIsLoading(true)
      setTimeout(() => {
        setOccurrences(generateMockData())
        setIsLoading(false)
      }, 500)
    }, [generateMockData])
  }
}