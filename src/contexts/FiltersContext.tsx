
import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface FiltersState {
  // Filtros básicos
  segmentFilter: string;
  equipmentFilter: string;
  serialNumberFilter: string;
  equipmentModelFilterMulti: string[];
  statusFilter: string;
  vendorFilter: string;
  
  // Filtros multiselect
  segmentFilterMulti: string[];
  equipmentFilterMulti: string[];
  statusFilterMulti: string[];
  vendorFilterMulti: string[];
  severityFilterMulti: string[];
  statusEquipamentoFilterMulti: string[];
  
  // Filtros de localização
  agenciaFilter: string[];
  ufFilter: string[];
  municipioFilter: string[];
  dinegFilter: string[];
  tipoAgenciaFilter: string[];
  pontoVipFilter: string[];
  suptFilter: string[];
  
  // Filtros especiais
  overrideFilter: boolean;
  vendorPriorityFilter: boolean;
  reincidentFilter: boolean;
  statusSlaFilter: string[];
  longTailFilter: string[];
  motivoFilter: string[];
  // Impedimentos
  impedimentoFilter: boolean;
  motivoImpedimentoFilter: string[];
  previsaoSlaFilter: string[];
  
  // Filtros de período
  filterPeriod: string;
  customDateRange: {
    from?: Date;
    to?: Date;
  };
}

interface FiltersContextType extends FiltersState {
  updateFilter: (key: keyof FiltersState, value: any) => void;
  clearAllFilters: () => void;
  hasActiveFilters: boolean;
}

const defaultFilters: FiltersState = {
  segmentFilter: 'all',
  equipmentFilter: 'all',
  serialNumberFilter: '',
  equipmentModelFilterMulti: [],
  statusFilter: 'all',
  vendorFilter: 'all',
  
  segmentFilterMulti: [],
  equipmentFilterMulti: [],
  statusFilterMulti: ['a_iniciar', 'em_andamento', 'com_impedimentos'],
  vendorFilterMulti: [],
  severityFilterMulti: [],
  statusEquipamentoFilterMulti: [],
  
  agenciaFilter: [],
  ufFilter: [],
  municipioFilter: [],
  dinegFilter: [],
  tipoAgenciaFilter: [],
  pontoVipFilter: [],
  suptFilter: [],
  
  overrideFilter: false,
  vendorPriorityFilter: false,
  reincidentFilter: false,
  statusSlaFilter: [],
  longTailFilter: [],
  motivoFilter: [],
  impedimentoFilter: false,
  motivoImpedimentoFilter: [],
  previsaoSlaFilter: [],
  
  filterPeriod: '7-days',
  customDateRange: {}
};

const FiltersContext = createContext<FiltersContextType | undefined>(undefined);

export const FiltersProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [filters, setFilters] = useState<FiltersState>(defaultFilters);

  const updateFilter = (key: keyof FiltersState, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearAllFilters = () => {
    setFilters(defaultFilters);
  };

  const hasActiveFilters = 
    filters.segmentFilterMulti.length > 0 ||
    filters.equipmentFilterMulti.length > 0 ||
    filters.statusFilterMulti.length > 0 ||
    filters.vendorFilterMulti.length > 0 ||
    filters.severityFilterMulti.length > 0 ||
    filters.statusEquipamentoFilterMulti.length > 0 ||
    filters.segmentFilter !== 'all' ||
    filters.equipmentFilter !== 'all' ||
    filters.serialNumberFilter !== '' ||
    filters.equipmentModelFilterMulti.length > 0 ||
    filters.statusFilter !== 'all' ||
    filters.overrideFilter ||
    filters.vendorPriorityFilter ||
    filters.reincidentFilter ||
    filters.impedimentoFilter ||
    filters.vendorFilter !== 'all' ||
    filters.agenciaFilter.length > 0 ||
    filters.ufFilter.length > 0 ||
    filters.municipioFilter.length > 0 ||
    filters.dinegFilter.length > 0 ||
    filters.tipoAgenciaFilter.length > 0 ||
    filters.pontoVipFilter.length > 0 ||
    filters.suptFilter.length > 0 ||
    filters.statusSlaFilter.length > 0 ||
    filters.longTailFilter.length > 0 ||
    filters.motivoFilter.length > 0 ||
    filters.motivoImpedimentoFilter.length > 0 ||
    filters.previsaoSlaFilter.length > 0;

  return (
    <FiltersContext.Provider
      value={{
        ...filters,
        updateFilter,
        clearAllFilters,
        hasActiveFilters
      }}
    >
      {children}
    </FiltersContext.Provider>
  );
};

export const useFilters = () => {
  const context = useContext(FiltersContext);
  if (context === undefined) {
    throw new Error('useFilters must be used within a FiltersProvider');
  }
  return context;
};
