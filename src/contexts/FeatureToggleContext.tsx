import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Force refresh after removing Supabase/useToast dependencies

export interface FeatureToggle {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
  category: 'cards' | 'charts' | 'sections';
  order: number;
}

export interface DashboardOrder {
  cards: string[];
  charts: string[];
  sections: string[];
}

interface FeatureToggleContextType {
  featureToggles: Record<string, FeatureToggle>;
  dashboardOrder: DashboardOrder;
  updateToggle: (id: string, enabled: boolean) => void;
  reorderItems: (category: keyof DashboardOrder, newOrder: string[]) => void;
  resetToDefaults: () => void;
  getOrderedItems: (category: keyof DashboardOrder) => FeatureToggle[];
}

const FeatureToggleContext = createContext<FeatureToggleContextType | undefined>(undefined);

const defaultToggles: Record<string, FeatureToggle> = {
  // Cards Principais
  totalOccurrences: {
    id: 'totalOccurrences',
    label: 'Total de Ocorrências',
    description: 'Exibe o número total de ocorrências no sistema',
    enabled: true,
    category: 'cards',
    order: 0
  },
  pendingOccurrences: {
    id: 'pendingOccurrences',
    label: 'Ocorrências Pendentes',
    description: 'Mostra ocorrências que aguardam resolução',
    enabled: true,
    category: 'cards',
    order: 1
  },
  inoperantEquipments: {
    id: 'inoperantEquipments',
    label: 'Equipamentos Inoperantes',
    description: 'Conta equipamentos fora de operação',
    enabled: true,
    category: 'cards',
    order: 2
  },
  criticalOccurrences: {
    id: 'criticalOccurrences',
    label: 'Ocorrências Críticas',
    description: 'Destaca ocorrências de alta prioridade',
    enabled: true,
    category: 'cards',
    order: 3
  },
  overdueOccurrences: {
    id: 'overdueOccurrences',
    label: 'Em Atraso',
    description: 'Ocorrências que perderam o prazo de SLA',
    enabled: true,
    category: 'cards',
    order: 4
  },
  reincidences: {
    id: 'reincidences',
    label: 'Reincidências',
    description: 'Percentual de ocorrências recorrentes',
    enabled: true,
    category: 'cards',
    order: 5
  },
  affectedAgencies: {
    id: 'affectedAgencies',
    label: 'Agências Afetadas',
    description: 'Número de agências com ocorrências',
    enabled: true,
    category: 'cards',
    order: 6
  },
  averageMTTR: {
    id: 'averageMTTR',
    label: 'MTTR Médio',
    description: 'Tempo médio de resolução de ocorrências',
    enabled: true,
    category: 'cards',
    order: 7
  },

  // Gráficos e Análises
  equipmentStatusChart: {
    id: 'equipmentStatusChart',
    label: 'Status dos Equipamentos',
    description: 'Gráfico mostrando operante vs inoperante por equipamento',
    enabled: true,
    category: 'charts',
    order: 0
  },
  topAgenciesChart: {
    id: 'topAgenciesChart',
    label: 'Top Agências Afetadas',
    description: 'Ranking das agências com mais ocorrências',
    enabled: true,
    category: 'charts',
    order: 1
  },
  agingChart: {
    id: 'agingChart',
    label: 'Gráfico de Aging',
    description: 'Análise de envelhecimento das ocorrências',
    enabled: true,
    category: 'charts',
    order: 2
  },
  vendorMetricsMatrix: {
    id: 'vendorMetricsMatrix',
    label: 'Matriz de Métricas por Fornecedor',
    description: 'Análise detalhada por fornecedor',
    enabled: true,
    category: 'charts',
    order: 3
  },
  motivoLongTailChart: {
    id: 'motivoLongTailChart',
    label: 'Long Tail - Motivos',
    description: 'Distribuição de motivos de ocorrência',
    enabled: true,
    category: 'charts',
    order: 4
  },
  slaPrevisaoChart: {
    id: 'slaPrevisaoChart',
    label: 'Previsão vs SLA',
    description: 'Comparativo entre previsão e SLA real',
    enabled: true,
    category: 'charts',
    order: 5
  },

  // Seções Especiais
  filterSection: {
    id: 'filterSection',
    label: 'Seção de Filtros',
    description: 'Painel de filtros para personalizar visualização',
    enabled: true,
    category: 'sections',
    order: 0
  },
  occurrenceHighlights: {
    id: 'occurrenceHighlights',
    label: 'Highlights Operacionais',
    description: 'Destaques de ocorrências recentes ou importantes',
    enabled: true,
    category: 'sections',
    order: 1
  }
};

const defaultOrder: DashboardOrder = {
  cards: [
    'totalOccurrences',
    'pendingOccurrences', 
    'inoperantEquipments',
    'criticalOccurrences',
    'overdueOccurrences',
    'reincidences',
    'affectedAgencies',
    'averageMTTR'
  ],
  charts: [
    'equipmentStatusChart',
    'topAgenciesChart',
    'agingChart',
    'vendorMetricsMatrix',
    'motivoLongTailChart',
    'slaPrevisaoChart'
  ],
  sections: [
    'filterSection',
    'occurrenceHighlights'
  ]
};

export const FeatureToggleProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [featureToggles, setFeatureToggles] = useState<Record<string, FeatureToggle>>(defaultToggles);
  const [dashboardOrder, setDashboardOrder] = useState<DashboardOrder>(defaultOrder);

  // Carregar configurações do sessionStorage na inicialização
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = () => {
    try {
      const savedToggles = sessionStorage.getItem('feature-toggles');
      const savedOrder = sessionStorage.getItem('dashboard-order');

      if (savedToggles) {
        const parsedToggles = JSON.parse(savedToggles);
        setFeatureToggles({ ...defaultToggles, ...parsedToggles });
      }

      if (savedOrder) {
        const parsedOrder = JSON.parse(savedOrder);
        setDashboardOrder({ ...defaultOrder, ...parsedOrder });
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    }
  };

  const saveSettings = (key: string, value: any) => {
    try {
      sessionStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Erro ao salvar ${key}:`, error);
    }
  };

  // Salvar no sessionStorage sempre que houver mudanças
  useEffect(() => {
    if (JSON.stringify(featureToggles) !== JSON.stringify(defaultToggles)) {
      saveSettings('feature-toggles', featureToggles);
    }
  }, [featureToggles]);

  useEffect(() => {
    if (JSON.stringify(dashboardOrder) !== JSON.stringify(defaultOrder)) {
      saveSettings('dashboard-order', dashboardOrder);
    }
  }, [dashboardOrder]);

  const updateToggle = (id: string, enabled: boolean) => {
    setFeatureToggles(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        enabled
      }
    }));
  };

  const reorderItems = (category: keyof DashboardOrder, newOrder: string[]) => {
    setDashboardOrder(prev => ({
      ...prev,
      [category]: newOrder
    }));
  };

  const resetToDefaults = () => {
    setFeatureToggles(defaultToggles);
    setDashboardOrder(defaultOrder);
    
    try {
      sessionStorage.removeItem('feature-toggles');
      sessionStorage.removeItem('dashboard-order');
    } catch (error) {
      console.error('Erro ao resetar configurações:', error);
    }
  };

  const getOrderedItems = (category: keyof DashboardOrder): FeatureToggle[] => {
    return dashboardOrder[category]
      .map(id => featureToggles[id])
      .filter(Boolean);
  };

  const value: FeatureToggleContextType = {
    featureToggles,
    dashboardOrder,
    updateToggle,
    reorderItems,
    resetToDefaults,
    getOrderedItems
  };

  return (
    <FeatureToggleContext.Provider value={value}>
      {children}
    </FeatureToggleContext.Provider>
  );
};

export const useFeatureToggle = (): FeatureToggleContextType => {
  const context = useContext(FeatureToggleContext);
  if (!context) {
    throw new Error('useFeatureToggle deve ser usado dentro de um FeatureToggleProvider');
  }
  return context;
};