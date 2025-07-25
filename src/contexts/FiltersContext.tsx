
import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface FiltersState {
  // Filtros básicos
  segmentFilter: string;
  equipmentFilter: string;
  serialNumberFilter: string;
  statusFilter: string;
  vendorFilter: string;
  transportadoraFilter: string;
  
  // Filtros multiselect
  segmentFilterMulti: string[];
  equipmentFilterMulti: string[];
  statusFilterMulti: string[];
  vendorFilterMulti: string[];
  transportadoraFilterMulti: string[];
  severityFilterMulti: string[];
  
  // Filtros de localização
  agenciaFilter: string[];
  ufFilter: string[];
  municipioFilter: string[];
  dinegFilter: string[];
  tipoAgenciaFilter: string[];
  pontoVipFilter: string[];
  
  // Filtros especiais
  overrideFilter: boolean;
  vendorPriorityFilter: boolean;
  reincidentFilter: boolean;
  statusSlaFilter: string[];
  
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
  statusFilter: 'all',
  vendorFilter: 'all',
  transportadoraFilter: 'all',
  
  segmentFilterMulti: [],
  equipmentFilterMulti: [],
  statusFilterMulti: [],
  vendorFilterMulti: [],
  transportadoraFilterMulti: [],
  severityFilterMulti: [],
  
  agenciaFilter: [],
  ufFilter: [],
  municipioFilter: [],
  dinegFilter: [],
  tipoAgenciaFilter: [],
  pontoVipFilter: [],
  
  overrideFilter: false,
  vendorPriorityFilter: false,
  reincidentFilter: false,
  statusSlaFilter: [],
  
  filterPeriod: '30-days',
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
    filters.transportadoraFilterMulti.length > 0 ||
    filters.severityFilterMulti.length > 0 ||
    filters.segmentFilter !== 'all' ||
    filters.equipmentFilter !== 'all' ||
    filters.serialNumberFilter !== '' ||
    filters.statusFilter !== 'all' ||
    filters.overrideFilter ||
    filters.vendorPriorityFilter ||
    filters.reincidentFilter ||
    filters.vendorFilter !== 'all' ||
    filters.transportadoraFilter !== 'all' ||
    filters.agenciaFilter.length > 0 ||
    filters.ufFilter.length > 0 ||
    filters.municipioFilter.length > 0 ||
    filters.dinegFilter.length > 0 ||
    filters.tipoAgenciaFilter.length > 0 ||
    filters.pontoVipFilter.length > 0 ||
    filters.statusSlaFilter.length > 0;

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
