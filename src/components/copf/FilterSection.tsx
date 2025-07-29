import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Filter, RefreshCw, ChevronDown, ChevronUp, Check, Truck, Clock } from "lucide-react";
import { useFilters } from "@/contexts/FiltersContext";
import { useDashboardData } from "@/hooks/useDashboardData";
import { cn } from "@/lib/utils";

interface FilterSectionProps {
  className?: string;
  showSerialNumber?: boolean;
}

export function FilterSection({ className, showSerialNumber = false }: FilterSectionProps) {
  const [isFiltersOpen, setIsFiltersOpen] = useState(true);
  const [isLocationOpen, setIsLocationOpen] = useState(true);
  const [isEquipmentOpen, setIsEquipmentOpen] = useState(true);
  const [isVendorOpen, setIsVendorOpen] = useState(true);
  const [isSpecialFiltersOpen, setIsSpecialFiltersOpen] = useState(true);
  const { occurrences } = useDashboardData();
  const {
    agenciaFilter,
    ufFilter,
    municipioFilter,
    dinegFilter,
    tipoAgenciaFilter,
    pontoVipFilter,
    suptFilter,
    segmentFilterMulti,
    equipmentFilterMulti,
    statusFilterMulti,
    vendorFilterMulti,
    transportadoraFilterMulti,
    severityFilterMulti,
    statusEquipamentoFilterMulti,
    serialNumberFilter,
    overrideFilter,
    vendorPriorityFilter,
    reincidentFilter,
    statusSlaFilter,
    longTailFilter,
    hasActiveFilters,
    updateFilter,
    clearAllFilters
  } = useFilters();

  // Mapeamento de equipamentos por segmento conforme especificação
  const equipmentsBySegment = {
    AA: [
      'ATM Saque',
      'ATM Depósito', 
      'Cassete'
    ],
    AB: [
      'Notebook',
      'Desktop',
      'Leitor de Cheques/documentos',
      'Leitor biométrico',
      'PIN PAD',
      'Scanner de Cheque',
      'Impressora',
      'Impressora térmica',
      'Impressora multifuncional',
      'Monitor LCD/LED',
      'Teclado',
      'Servidor',
      'Televisão',
      'Senheiro',
      'TCR',
      'Classificadora',
      'Fragmentadora de Papel'
    ]
  };

  // Obter equipamentos únicos dos dados reais + equipamentos por segmento
  const getFilteredEquipments = () => {
    if (segmentFilterMulti.length === 0) {
      // Quando nenhum segmento selecionado, mostrar todos os equipamentos possíveis
      const allEquipments = Object.values(equipmentsBySegment).flat();
      const dataEquipments = Array.from(new Set(occurrences.map(o => o.equipment)));
      return Array.from(new Set([...allEquipments, ...dataEquipments])).sort();
    } else {
      const filteredEquipments = segmentFilterMulti.flatMap(segment => 
        equipmentsBySegment[segment as 'AA' | 'AB'] || []
      );
      return Array.from(new Set(filteredEquipments)).sort();
    }
  };

  const uniqueEquipments = getFilteredEquipments();
  const uniqueVendors = Array.from(new Set(occurrences.map(o => o.vendor))).sort();

  // Dados de transportadoras e seus fornecedores
  const transportadoraFornecedores = {
    'Protege': ['STM', 'NCR', 'Diebold'],
    'TBFort': ['Artis', 'Azmachi'],
    'Prosegur': ['Lexmark', 'Nextvision'],
    'Brinks': ['STM', 'Diebold', 'NCR']
  };
  const uniqueTransportadoras = Object.keys(transportadoraFornecedores);

  // Filtrar fornecedores baseado na transportadora selecionada
  const getFilteredVendors = () => {
    if (!tipoAgenciaFilter.includes('terceirizada')) return uniqueVendors;
    if (transportadoraFilterMulti.length === 0) return uniqueVendors;
    const filteredVendors = transportadoraFilterMulti.flatMap(t => transportadoraFornecedores[t] || []);
    return filteredVendors.length > 0 ? filteredVendors : uniqueVendors;
  };
  const availableVendors = getFilteredVendors();

  // Gerar agências únicas baseadas nas ocorrências
  const uniqueAgencies = Array.from(new Set(occurrences.map(o => o.agency.match(/\d+/)?.[0] || ''))).filter(Boolean).sort();

  // Estados brasileiros
  const estadosBrasil = ['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'];

  // Filtrar UFs baseadas nas agências selecionadas
  const availableUFs = !Array.isArray(agenciaFilter) || agenciaFilter.length === 0 ? estadosBrasil : Array.from(new Set(agenciaFilter.map(agencyNumber => {
    // Lógica simplificada: agências 0-999 = SP, 1000-1999 = RJ, etc.
    const num = parseInt(agencyNumber);
    if (num <= 999) return 'SP';
    if (num <= 1999) return 'RJ';
    if (num <= 2999) return 'MG';
    if (num <= 3999) return 'RS';
    return 'PR';
  })));

  // Dados de municípios por UF (alguns exemplos)
  const municipiosPorUF = {
    'SP': ['São Paulo', 'Campinas', 'Santos', 'Ribeirão Preto', 'Sorocaba', 'Osasco', 'Santo André', 'São Bernardo do Campo', 'Guarulhos', 'Bauru'],
    'RJ': ['Rio de Janeiro', 'Niterói', 'Campos dos Goytacazes', 'Nova Iguaçu', 'Petrópolis', 'Volta Redonda', 'Duque de Caxias', 'Nova Friburgo', 'Cabo Frio', 'Angra dos Reis'],
    'MG': ['Belo Horizonte', 'Uberlândia', 'Contagem', 'Juiz de Fora', 'Betim', 'Montes Claros', 'Ribeirão das Neves', 'Uberaba', 'Governador Valadares', 'Ipatinga'],
    'RS': ['Porto Alegre', 'Caxias do Sul', 'Pelotas', 'Canoas', 'Santa Maria', 'Gravataí', 'Viamão', 'Novo Hamburgo', 'São Leopoldo', 'Rio Grande'],
    'PR': ['Curitiba', 'Londrina', 'Maringá', 'Ponta Grossa', 'Cascavel', 'São José dos Pinhais', 'Foz do Iguaçu', 'Colombo', 'Guarapuava', 'Paranaguá']
  };

  // Filtrar municípios baseados nos UFs selecionados
  const availableMunicipios = ufFilter.length === 0 
    ? Object.values(municipiosPorUF).flat().sort()
    : ufFilter.flatMap(uf => municipiosPorUF[uf as keyof typeof municipiosPorUF] || []).sort();

  // Diretorias de Negócio (DINEG)
  const dinegOptions = ['2', '5', '8', '80'];

  // Superintendências (SUPT) - Hierarquia baseada em DINEG
  const suptOptions = {
    '2': ['21', '22', '23', '24', '25', '26', '27', '28', '29'],
    '5': ['51', '52', '53', '54', '55', '56', '57', '58', '59']
  };

  // Filtrar SUPT baseado nos DINEGs selecionados
  const getAvailableSupts = () => {
    if (dinegFilter.length === 0) {
      return Object.values(suptOptions).flat().sort();
    }
    return dinegFilter.flatMap(dineg => suptOptions[dineg as keyof typeof suptOptions] || []).sort();
  };

  // Filtrar DINEG baseado nas agências selecionadas (lógica simplificada)
  const availableDinegs = !Array.isArray(agenciaFilter) || agenciaFilter.length === 0 ? dinegOptions : dinegOptions.filter((dineg, index) => {
    // Lógica simplificada para demonstração
    const agencyNumbers = agenciaFilter.map(a => parseInt(a));
    const hasMatchingAgency = agencyNumbers.some(num => {
      if (num <= 500 && index < 3) return true;
      if (num > 500 && num <= 1000 && index >= 3 && index < 6) return true;
      if (num > 1000 && index >= 6) return true;
      return false;
    });
    return hasMatchingAgency;
  });

  // Verificar tipo de agência atual (para mostrar filtros condicionais)
  const tipoAgenciaAtual = tipoAgenciaFilter.includes('terceirizada') ? 'terceirizada' : tipoAgenciaFilter.includes('convencional') ? 'convencional' : 'all';

  return (
    <Card className={cn("animate-fade-in border-border/50 bg-gradient-to-r from-card to-muted/20", className)}>
      <Collapsible open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="pb-4 cursor-pointer hover:bg-accent/5 transition-colors">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Filter className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Filtros</h3>
                  {hasActiveFilters && (
                    <p className="text-sm text-muted-foreground">
                      Filtros ativos aplicados
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {hasActiveFilters && (
                  <>
                    <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
                      {Object.values({
                        agencia: agenciaFilter.length > 0,
                        uf: ufFilter.length > 0,
                        municipio: municipioFilter.length > 0,
                        dineg: dinegFilter.length > 0,
                        tipoAgencia: tipoAgenciaFilter.length > 0,
                        pontoVip: pontoVipFilter.length > 0,
                        supt: suptFilter.length > 0,
                        segmento: segmentFilterMulti.length > 0,
                        equipamento: equipmentFilterMulti.length > 0,
                        status: statusFilterMulti.length > 0,
                        statusEquipamento: statusEquipamentoFilterMulti.length > 0,
                        criticidade: severityFilterMulti.length > 0,
                        fornecedor: vendorFilterMulti.length > 0,
                        transportadora: transportadoraFilterMulti.length > 0,
                        serie: showSerialNumber && serialNumberFilter !== '',
                        vencidas: overrideFilter,
                        priorizado: vendorPriorityFilter,
                        reincidentes: reincidentFilter,
                        longTail: longTailFilter.length > 0
                      }).filter(Boolean).length} filtro{Object.values({
                        agencia: agenciaFilter.length > 0,
                        uf: ufFilter.length > 0,
                        municipio: municipioFilter.length > 0,
                        dineg: dinegFilter.length > 0,
                        tipoAgencia: tipoAgenciaFilter.length > 0,
                        pontoVip: pontoVipFilter.length > 0,
                        supt: suptFilter.length > 0,
                        segmento: segmentFilterMulti.length > 0,
                        equipamento: equipmentFilterMulti.length > 0,
                        status: statusFilterMulti.length > 0,
                        statusEquipamento: statusEquipamentoFilterMulti.length > 0,
                        criticidade: severityFilterMulti.length > 0,
                        fornecedor: vendorFilterMulti.length > 0,
                        transportadora: transportadoraFilterMulti.length > 0,
                        serie: showSerialNumber && serialNumberFilter !== '',
                        vencidas: overrideFilter,
                        priorizado: vendorPriorityFilter,
                        reincidentes: reincidentFilter,
                        longTail: longTailFilter.length > 0
                      }).filter(Boolean).length !== 1 ? 's' : ''} ativo{Object.values({
                        agencia: agenciaFilter.length > 0,
                        uf: ufFilter.length > 0,
                        municipio: municipioFilter.length > 0,
                        dineg: dinegFilter.length > 0,
                        tipoAgencia: tipoAgenciaFilter.length > 0,
                        pontoVip: pontoVipFilter.length > 0,
                        supt: suptFilter.length > 0,
                        segmento: segmentFilterMulti.length > 0,
                        equipamento: equipmentFilterMulti.length > 0,
                        status: statusFilterMulti.length > 0,
                        statusEquipamento: statusEquipamentoFilterMulti.length > 0,
                        criticidade: severityFilterMulti.length > 0,
                        fornecedor: vendorFilterMulti.length > 0,
                        transportadora: transportadoraFilterMulti.length > 0,
                        serie: showSerialNumber && serialNumberFilter !== '',
                        vencidas: overrideFilter,
                        priorizado: vendorPriorityFilter,
                        reincidentes: reincidentFilter,
                        longTail: longTailFilter.length > 0
                      }).filter(Boolean).length !== 1 ? 's' : ''}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        clearAllFilters();
                      }}
                      className="hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20 transition-colors"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Limpar Filtros
                    </Button>
                  </>
                )}
                {isFiltersOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </div>
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="space-y-8">
            {/* Filtros de Localização */}
            <Collapsible open={isLocationOpen} onOpenChange={setIsLocationOpen}>
              <div className="space-y-4">
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="w-full justify-between p-0 h-auto">
                    <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-primary"></div>
                      </div>
                      <h4 className="text-base font-semibold text-foreground">Localização</h4>
                    </div>
                    {isLocationOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="space-y-6">
                    {/* Tipo da Agência - Primeiro filtro */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="group space-y-3">
                        <Label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                          <div className="w-1 h-4 bg-primary/60 rounded-full"></div>
                          Tipo da Agência
                        </Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full h-10 justify-between hover:bg-primary/5 hover:border-primary/30 transition-all duration-200 group-hover:shadow-sm">
                              {tipoAgenciaFilter.length > 0 ? (
                                <div className="flex items-center gap-2">
                                  <Badge variant="secondary" className="h-5 text-xs bg-primary/10 text-primary">
                                    {tipoAgenciaFilter.length}
                                  </Badge>
                                   <span className="text-sm">
                                     {tipoAgenciaFilter.length === 1 ? 
                                       (tipoAgenciaFilter[0] === 'convencional' ? 'Convencional' : 
                                        tipoAgenciaFilter[0] === 'terceirizada' ? 'Terceirizada' :
                                        tipoAgenciaFilter[0] === 'pab' ? 'PAB' : 'PAE') : 
                                       `${tipoAgenciaFilter.length} tipos`}
                                   </span>
                                </div>
                              ) : "Todos os tipos"}
                              <div className="w-4 h-4 opacity-50">⌄</div>
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-72 p-0 bg-background/95 backdrop-blur-sm border border-border/80 shadow-lg z-50" align="start">
                            <Command>
                              <CommandList>
                                <CommandGroup>
                                   {['convencional', 'terceirizada', 'pab', 'pae'].map(tipo => (
                                     <CommandItem key={tipo} onSelect={() => {
                                       const isSelected = tipoAgenciaFilter.includes(tipo);
                                       if (isSelected) {
                                         updateFilter('tipoAgenciaFilter', tipoAgenciaFilter.filter(t => t !== tipo));
                                       } else {
                                         updateFilter('tipoAgenciaFilter', [...tipoAgenciaFilter, tipo]);
                                       }
                                     }}>
                                       <Check className={cn("mr-2 h-4 w-4", tipoAgenciaFilter.includes(tipo) ? "opacity-100" : "opacity-0")} />
                                       {tipo === 'convencional' ? 'Convencional' : 
                                        tipo === 'terceirizada' ? 'Terceirizada' :
                                        tipo === 'pab' ? 'PAB' : 'PAE'}
                                     </CommandItem>
                                   ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>

                    {/* Linha com Agência, UF, Município */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {/* Agência */}
                      <div className="group space-y-3">
                        <Label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                          <div className="w-1 h-4 bg-primary/60 rounded-full"></div>
                          Agência
                        </Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full h-10 justify-between hover:bg-primary/5 hover:border-primary/30 transition-all duration-200 group-hover:shadow-sm">
                              {agenciaFilter.length > 0 ? (
                                <div className="flex items-center gap-2">
                                  <Badge variant="secondary" className="h-5 text-xs bg-primary/10 text-primary">
                                    {agenciaFilter.length}
                                  </Badge>
                                  <span className="text-sm">
                                    {agenciaFilter.length === 1 ? `Agência ${agenciaFilter[0]}` : `${agenciaFilter.length} agências`}
                                  </span>
                                </div>
                              ) : "Todas as agências"}
                              <div className="w-4 h-4 opacity-50">⌄</div>
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-72 p-0 bg-background/95 backdrop-blur-sm border border-border/80 shadow-lg z-50" align="start">
                            <Command>
                              <CommandInput placeholder="Buscar agência..." className="h-9" />
                              <CommandEmpty>Nenhuma agência encontrada.</CommandEmpty>
                              <CommandList>
                                <CommandGroup className="max-h-64 overflow-y-auto">
                                  {uniqueAgencies.map(agency => (
                                    <CommandItem key={agency} onSelect={() => {
                                      const isSelected = agenciaFilter.includes(agency);
                                      if (isSelected) {
                                        updateFilter('agenciaFilter', agenciaFilter.filter(a => a !== agency));
                                      } else {
                                        updateFilter('agenciaFilter', [...agenciaFilter, agency]);
                                      }
                                    }}>
                                      <Check className={cn("mr-2 h-4 w-4", agenciaFilter.includes(agency) ? "opacity-100" : "opacity-0")} />
                                      Agência {agency}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                      </div>

                      {/* UF */}
                      <div className="group space-y-3">
                        <Label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                          <div className="w-1 h-4 bg-primary/60 rounded-full"></div>
                          Estado (UF)
                        </Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full h-10 justify-between hover:bg-primary/5 hover:border-primary/30 transition-all duration-200 group-hover:shadow-sm">
                              {ufFilter.length > 0 ? (
                                <div className="flex items-center gap-2">
                                  <Badge variant="secondary" className="h-5 text-xs bg-primary/10 text-primary">
                                    {ufFilter.length}
                                  </Badge>
                                  <span className="text-sm">
                                    {ufFilter.length === 1 ? ufFilter[0] : `${ufFilter.length} estados`}
                                  </span>
                                </div>
                              ) : "Todos os estados"}
                              <div className="w-4 h-4 opacity-50">⌄</div>
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-72 p-0 bg-background/95 backdrop-blur-sm border border-border/80 shadow-lg z-50" align="start">
                            <Command>
                              <CommandInput placeholder="Buscar estado..." className="h-9" />
                              <CommandEmpty>Nenhum estado encontrado.</CommandEmpty>
                              <CommandList>
                                <CommandGroup className="max-h-64 overflow-y-auto">
                                  {availableUFs.map(uf => (
                                    <CommandItem key={uf} onSelect={() => {
                                      const isSelected = ufFilter.includes(uf);
                                      if (isSelected) {
                                        updateFilter('ufFilter', ufFilter.filter(u => u !== uf));
                                      } else {
                                        updateFilter('ufFilter', [...ufFilter, uf]);
                                      }
                                    }}>
                                      <Check className={cn("mr-2 h-4 w-4", ufFilter.includes(uf) ? "opacity-100" : "opacity-0")} />
                                      {uf}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                      </div>

                      {/* Município */}
                      <div className="group space-y-3">
                        <Label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                          <div className="w-1 h-4 bg-primary/60 rounded-full"></div>
                          Município
                        </Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full h-10 justify-between hover:bg-primary/5 hover:border-primary/30 transition-all duration-200 group-hover:shadow-sm">
                              {municipioFilter.length > 0 ? (
                                <div className="flex items-center gap-2">
                                  <Badge variant="secondary" className="h-5 text-xs bg-primary/10 text-primary">
                                    {municipioFilter.length}
                                  </Badge>
                                  <span className="text-sm">
                                    {municipioFilter.length === 1 ? municipioFilter[0] : `${municipioFilter.length} municípios`}
                                  </span>
                                </div>
                              ) : "Todos os municípios"}
                              <div className="w-4 h-4 opacity-50">⌄</div>
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-72 p-0 bg-background/95 backdrop-blur-sm border border-border/80 shadow-lg z-50" align="start">
                            <Command>
                              <CommandInput placeholder="Buscar município..." className="h-9" />
                              <CommandEmpty>Nenhum município encontrado.</CommandEmpty>
                              <CommandList>
                                <CommandGroup className="max-h-64 overflow-y-auto">
                                  {availableMunicipios.map(municipio => (
                                    <CommandItem key={municipio} onSelect={() => {
                                      const isSelected = municipioFilter.includes(municipio);
                                      if (isSelected) {
                                        updateFilter('municipioFilter', municipioFilter.filter(m => m !== municipio));
                                      } else {
                                        updateFilter('municipioFilter', [...municipioFilter, municipio]);
                                      }
                                    }}>
                                      <Check className={cn("mr-2 h-4 w-4", municipioFilter.includes(municipio) ? "opacity-100" : "opacity-0")} />
                                      {municipio}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>

                    {/* Segunda linha: DINEG, SUPT, Ponto VIP */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {/* DINEG */}
                      <div className="group space-y-3">
                        <Label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                          <div className="w-1 h-4 bg-primary/60 rounded-full"></div>
                          DINEG
                        </Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full h-10 justify-between hover:bg-primary/5 hover:border-primary/30 transition-all duration-200 group-hover:shadow-sm">
                              {dinegFilter.length > 0 ? (
                                <div className="flex items-center gap-2">
                                  <Badge variant="secondary" className="h-5 text-xs bg-primary/10 text-primary">
                                    {dinegFilter.length}
                                  </Badge>
                                  <span className="text-sm">
                                    {dinegFilter.length === 1 ? `DINEG ${dinegFilter[0]}` : `${dinegFilter.length} DINEGs`}
                                  </span>
                                </div>
                              ) : "Todas as DINEGs"}
                              <div className="w-4 h-4 opacity-50">⌄</div>
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-72 p-0 bg-background/95 backdrop-blur-sm border border-border/80 shadow-lg z-50" align="start">
                            <Command>
                              <CommandInput placeholder="Buscar DINEG..." className="h-9" />
                              <CommandEmpty>Nenhuma DINEG encontrada.</CommandEmpty>
                              <CommandList>
                                <CommandGroup>
                                  {availableDinegs.map(dineg => (
                                    <CommandItem key={dineg} onSelect={() => {
                                      const isSelected = dinegFilter.includes(dineg);
                                      if (isSelected) {
                                        updateFilter('dinegFilter', dinegFilter.filter(d => d !== dineg));
                                      } else {
                                        updateFilter('dinegFilter', [...dinegFilter, dineg]);
                                      }
                                    }}>
                                      <Check className={cn("mr-2 h-4 w-4", dinegFilter.includes(dineg) ? "opacity-100" : "opacity-0")} />
                                      DINEG {dineg}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                      </div>

                      {/* SUPT */}
                      <div className="group space-y-3">
                        <Label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                          <div className="w-1 h-4 bg-primary/60 rounded-full"></div>
                          Supt
                        </Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full h-10 justify-between hover:bg-primary/5 hover:border-primary/30 transition-all duration-200 group-hover:shadow-sm">
                              {suptFilter.length > 0 ? (
                                <div className="flex items-center gap-2">
                                  <Badge variant="secondary" className="h-5 text-xs bg-primary/10 text-primary">
                                    {suptFilter.length}
                                  </Badge>
                                  <span className="text-sm">
                                    {suptFilter.length === 1 ? `Supt ${suptFilter[0]}` : `${suptFilter.length} Supts`}
                                  </span>
                                </div>
                              ) : "Todas as Supts"}
                              <div className="w-4 h-4 opacity-50">⌄</div>
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-72 p-0 bg-background/95 backdrop-blur-sm border border-border/80 shadow-lg z-50" align="start">
                            <Command>
                              <CommandInput placeholder="Buscar Supt..." className="h-9" />
                              <CommandEmpty>Nenhuma Supt encontrada.</CommandEmpty>
                              <CommandList>
                                <CommandGroup>
                                  {getAvailableSupts().map(supt => (
                                    <CommandItem key={supt} onSelect={() => {
                                      const isSelected = suptFilter.includes(supt);
                                      if (isSelected) {
                                        updateFilter('suptFilter', suptFilter.filter(s => s !== supt));
                                      } else {
                                        updateFilter('suptFilter', [...suptFilter, supt]);
                                      }
                                    }}>
                                      <Check className={cn("mr-2 h-4 w-4", suptFilter.includes(supt) ? "opacity-100" : "opacity-0")} />
                                      Supt {supt}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>

            {/* Filtros de Equipamento */}
            <Collapsible open={isEquipmentOpen} onOpenChange={setIsEquipmentOpen}>
              <div className="space-y-4">
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="w-full justify-between p-0 h-auto">
                    <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                      <div className="w-6 h-6 rounded-full bg-secondary/10 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-secondary"></div>
                      </div>
                      <h4 className="text-base font-semibold text-foreground">Equipamentos/Ocorrência</h4>
                    </div>
                    {isEquipmentOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="responsive-grid responsive-grid-3">
                    {/* Segmento */}
                    <div className="group space-y-3">
                      <Label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <div className="w-1 h-4 bg-secondary/60 rounded-full"></div>
                        Segmento
                      </Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full h-10 justify-between hover:bg-secondary/5 hover:border-secondary/30 transition-all duration-200 group-hover:shadow-sm">
                            {segmentFilterMulti.length > 0 ? (
                              <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="h-5 text-xs bg-secondary/10 text-secondary">
                                  {segmentFilterMulti.length}
                                </Badge>
                                <span className="text-sm">
                                  {segmentFilterMulti.length === 1 ? segmentFilterMulti[0] : `${segmentFilterMulti.length} segmentos`}
                                </span>
                              </div>
                            ) : "Todos os segmentos"}
                            <div className="w-4 h-4 opacity-50">⌄</div>
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-72 p-0 bg-background/95 backdrop-blur-sm border border-border/80 shadow-lg z-50" align="start">
                          <Command>
                            <CommandInput placeholder="Buscar segmento..." className="h-9" />
                            <CommandEmpty>Nenhum segmento encontrado.</CommandEmpty>
                            <CommandList>
                              <CommandGroup>
                                {[
                                  { value: 'AA', label: 'Segmento AA' },
                                  { value: 'AB', label: 'Segmento AB' }
                                ].map(segment => (
                                  <CommandItem key={segment.value} onSelect={() => {
                                    const isSelected = segmentFilterMulti.includes(segment.value);
                                    if (isSelected) {
                                      updateFilter('segmentFilterMulti', segmentFilterMulti.filter(s => s !== segment.value));
                                    } else {
                                      updateFilter('segmentFilterMulti', [...segmentFilterMulti, segment.value]);
                                    }
                                  }}>
                                    <Check className={cn("mr-2 h-4 w-4", segmentFilterMulti.includes(segment.value) ? "opacity-100" : "opacity-0")} />
                                    {segment.label}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>

                    {/* Equipamento */}
                    <div className="group space-y-3">
                      <Label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <div className="w-1 h-4 bg-secondary/60 rounded-full"></div>
                        Equipamento
                      </Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full h-10 justify-between hover:bg-secondary/5 hover:border-secondary/30 transition-all duration-200 group-hover:shadow-sm">
                            {equipmentFilterMulti.length > 0 ? (
                              <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="h-5 text-xs bg-secondary/10 text-secondary">
                                  {equipmentFilterMulti.length}
                                </Badge>
                                <span className="text-sm">
                                  {equipmentFilterMulti.length === 1 ? equipmentFilterMulti[0] : `${equipmentFilterMulti.length} equipamentos`}
                                </span>
                              </div>
                            ) : "Todos os equipamentos"}
                            <div className="w-4 h-4 opacity-50">⌄</div>
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-72 p-0 bg-background/95 backdrop-blur-sm border border-border/80 shadow-lg z-50" align="start">
                          <Command>
                            <CommandInput placeholder="Buscar equipamento..." className="h-9" />
                            <CommandEmpty>Nenhum equipamento encontrado.</CommandEmpty>
                            <CommandList>
                              <CommandGroup className="max-h-64 overflow-y-auto">
                                {uniqueEquipments.map(equipment => (
                                  <CommandItem key={equipment} onSelect={() => {
                                    const isSelected = equipmentFilterMulti.includes(equipment);
                                    if (isSelected) {
                                      updateFilter('equipmentFilterMulti', equipmentFilterMulti.filter(e => e !== equipment));
                                    } else {
                                      updateFilter('equipmentFilterMulti', [...equipmentFilterMulti, equipment]);
                                    }
                                  }}>
                                    <Check className={cn("mr-2 h-4 w-4", equipmentFilterMulti.includes(equipment) ? "opacity-100" : "opacity-0")} />
                                    {equipment}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>

                    {/* Status da ocorrência */}
                    <div className="group space-y-3">
                      <Label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <div className="w-1 h-4 bg-secondary/60 rounded-full"></div>
                        Status da ocorrência
                      </Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full h-10 justify-between hover:bg-secondary/5 hover:border-secondary/30 transition-all duration-200 group-hover:shadow-sm">
                            {statusFilterMulti.length > 0 ? (
                              <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="h-5 text-xs bg-secondary/10 text-secondary">
                                  {statusFilterMulti.length}
                                </Badge>
                                <span className="text-sm">
                                  {statusFilterMulti.length === 1 ? statusFilterMulti[0] : `${statusFilterMulti.length} status`}
                                </span>
                              </div>
                            ) : "Todos os status"}
                            <div className="w-4 h-4 opacity-50">⌄</div>
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-72 p-0 bg-background/95 backdrop-blur-sm border border-border/80 shadow-lg z-50" align="start">
                          <Command>
                            <CommandInput placeholder="Buscar status..." className="h-9" />
                            <CommandEmpty>Nenhum status encontrado.</CommandEmpty>
                            <CommandList>
                              <CommandGroup>
                                {[
                                  { value: 'a_iniciar', label: 'A iniciar' },
                                  { value: 'em_andamento', label: 'Em andamento' },
                                  { value: 'encerrado', label: 'Encerrado' },
                                  { value: 'com_impedimentos', label: 'Com impedimentos' },
                                  { value: 'cancelado', label: 'Cancelado' }
                                ].map(status => (
                                  <CommandItem key={status.value} onSelect={() => {
                                    const isSelected = statusFilterMulti.includes(status.value);
                                    if (isSelected) {
                                      updateFilter('statusFilterMulti', statusFilterMulti.filter(s => s !== status.value));
                                    } else {
                                      updateFilter('statusFilterMulti', [...statusFilterMulti, status.value]);
                                    }
                                  }}>
                                    <Check className={cn("mr-2 h-4 w-4", statusFilterMulti.includes(status.value) ? "opacity-100" : "opacity-0")} />
                                    {status.label}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>

                    {/* Status do equipamento */}
                    <div className="group space-y-3">
                      <Label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <div className="w-1 h-4 bg-secondary/60 rounded-full"></div>
                        Status do equipamento
                      </Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full h-10 justify-between hover:bg-secondary/5 hover:border-secondary/30 transition-all duration-200 group-hover:shadow-sm">
                            {statusEquipamentoFilterMulti.length > 0 ? (
                              <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="h-5 text-xs bg-secondary/10 text-secondary">
                                  {statusEquipamentoFilterMulti.length}
                                </Badge>
                                <span className="text-sm">
                                  {statusEquipamentoFilterMulti.length === 1 ? 
                                    (statusEquipamentoFilterMulti[0] === 'operante' ? 'Operante' : 'Inoperante') : 
                                    `${statusEquipamentoFilterMulti.length} status`}
                                </span>
                              </div>
                            ) : "Todos os status"}
                            <div className="w-4 h-4 opacity-50">⌄</div>
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-72 p-0 bg-background/95 backdrop-blur-sm border border-border/80 shadow-lg z-50" align="start">
                          <Command>
                            <CommandList>
                              <CommandGroup>
                                {[
                                  { value: 'operante', label: 'Equipamento Operante' },
                                  { value: 'inoperante', label: 'Equipamento Inoperante' }
                                ].map(status => (
                                  <CommandItem key={status.value} onSelect={() => {
                                    const isSelected = statusEquipamentoFilterMulti.includes(status.value);
                                    if (isSelected) {
                                      updateFilter('statusEquipamentoFilterMulti', statusEquipamentoFilterMulti.filter(s => s !== status.value));
                                    } else {
                                      updateFilter('statusEquipamentoFilterMulti', [...statusEquipamentoFilterMulti, status.value]);
                                    }
                                  }}>
                                    <Check className={cn("mr-2 h-4 w-4", statusEquipamentoFilterMulti.includes(status.value) ? "opacity-100" : "opacity-0")} />
                                    {status.label}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>

            {/* Filtros de Fornecedor */}
            <Collapsible open={isVendorOpen} onOpenChange={setIsVendorOpen}>
              <div className="space-y-4">
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="w-full justify-between p-0 h-auto">
                    <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                      <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center">
                        <Truck className="h-3 w-3 text-accent" />
                      </div>
                      <h4 className="text-base font-semibold text-foreground">Fornecedores</h4>
                    </div>
                    {isVendorOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="responsive-grid responsive-grid-2">
                    {/* Transportadora (sempre visível, mas desabilitada se não terceirizada) */}
                    <div className="group space-y-3">
                      <Label className={cn(
                        "text-sm font-medium flex items-center gap-2",
                        !tipoAgenciaFilter.includes('terceirizada') ? "text-muted-foreground/50" : "text-muted-foreground"
                      )}>
                        <Truck className="h-3 w-3 text-accent" />
                        Transportadora
                      </Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button 
                            variant="outline" 
                            disabled={!tipoAgenciaFilter.includes('terceirizada')}
                            className={cn(
                              "w-full h-10 justify-between transition-all duration-200 group-hover:shadow-sm",
                              !tipoAgenciaFilter.includes('terceirizada') 
                                ? "opacity-50 cursor-not-allowed bg-muted/50" 
                                : "hover:bg-accent/5 hover:border-accent/30"
                            )}
                          >
                            {transportadoraFilterMulti.length > 0 ? (
                              <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="h-5 text-xs bg-accent/10 text-accent">
                                  {transportadoraFilterMulti.length}
                                </Badge>
                                <span className="text-sm">
                                  {transportadoraFilterMulti.length === 1 ? transportadoraFilterMulti[0] : `${transportadoraFilterMulti.length} transportadoras`}
                                </span>
                              </div>
                            ) : "Todas as transportadoras"}
                            <div className="w-4 h-4 opacity-50">⌄</div>
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-72 p-0 bg-background/95 backdrop-blur-sm border border-border/80 shadow-lg z-50" align="start">
                          <Command>
                            <CommandInput placeholder="Buscar transportadora..." className="h-9" />
                            <CommandEmpty>Nenhuma transportadora encontrada.</CommandEmpty>
                            <CommandList>
                              <CommandGroup>
                                {uniqueTransportadoras.map(transportadora => (
                                  <CommandItem key={transportadora} onSelect={() => {
                                    const isSelected = transportadoraFilterMulti.includes(transportadora);
                                    if (isSelected) {
                                      updateFilter('transportadoraFilterMulti', transportadoraFilterMulti.filter(t => t !== transportadora));
                                    } else {
                                      updateFilter('transportadoraFilterMulti', [...transportadoraFilterMulti, transportadora]);
                                    }
                                  }}>
                                    <Check className={cn("mr-2 h-4 w-4", transportadoraFilterMulti.includes(transportadora) ? "opacity-100" : "opacity-0")} />
                                    {transportadora}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>

                    {/* Fornecedor */}
                    <div className="group space-y-3">
                      <Label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <div className="w-1 h-4 bg-accent/60 rounded-full"></div>
                        Fornecedor
                      </Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full h-10 justify-between hover:bg-accent/5 hover:border-accent/30 transition-all duration-200 group-hover:shadow-sm">
                            {vendorFilterMulti.length > 0 ? (
                              <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="h-5 text-xs bg-accent/10 text-accent">
                                  {vendorFilterMulti.length}
                                </Badge>
                                <span className="text-sm">
                                  {vendorFilterMulti.length === 1 ? vendorFilterMulti[0] : `${vendorFilterMulti.length} fornecedores`}
                                </span>
                              </div>
                            ) : "Todos os fornecedores"}
                            <div className="w-4 h-4 opacity-50">⌄</div>
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-72 p-0 bg-background/95 backdrop-blur-sm border border-border/80 shadow-lg z-50" align="start">
                          <Command>
                            <CommandInput placeholder="Buscar fornecedor..." className="h-9" />
                            <CommandEmpty>Nenhum fornecedor encontrado.</CommandEmpty>
                            <CommandList>
                              <CommandGroup className="max-h-64 overflow-y-auto">
                                {availableVendors.map(vendor => (
                                  <CommandItem key={vendor} onSelect={() => {
                                    const isSelected = vendorFilterMulti.includes(vendor);
                                    if (isSelected) {
                                      updateFilter('vendorFilterMulti', vendorFilterMulti.filter(v => v !== vendor));
                                    } else {
                                      updateFilter('vendorFilterMulti', [...vendorFilterMulti, vendor]);
                                    }
                                  }}>
                                    <Check className={cn("mr-2 h-4 w-4", vendorFilterMulti.includes(vendor) ? "opacity-100" : "opacity-0")} />
                                    {vendor}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                 </CollapsibleContent>
               </div>
             </Collapsible>

             {/* Filtros Especiais */}
             <Collapsible open={isSpecialFiltersOpen} onOpenChange={setIsSpecialFiltersOpen}>
               <div className="space-y-4">
                 <CollapsibleTrigger asChild>
                   <Button variant="ghost" className="w-full justify-between p-0 h-auto">
                     <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                       <div className="w-6 h-6 rounded-full bg-warning/10 flex items-center justify-center">
                         <div className="w-2 h-2 rounded-full bg-warning"></div>
                       </div>
                       <h4 className="text-base font-semibold text-foreground">Filtros Especiais</h4>
                     </div>
                     {isSpecialFiltersOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                   </Button>
                 </CollapsibleTrigger>
                 <CollapsibleContent>
                   <div className="space-y-4">
                     {/* Primeira linha: Switches */}
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                       <div className="flex items-center space-x-2 p-3 border border-border/50 rounded-lg bg-background/50 hover:bg-accent/10 transition-colors">
                         <Switch
                           id="override-filter"
                           checked={overrideFilter}
                           onCheckedChange={(checked) => updateFilter('overrideFilter', checked)}
                           className="data-[state=checked]:bg-primary"
                         />
                          <Label htmlFor="override-filter" className="text-sm cursor-pointer select-none">
                            Ocorrências em Atraso
                          </Label>
                       </div>

                       <div className="flex items-center space-x-2 p-3 border border-border/50 rounded-lg bg-background/50 hover:bg-accent/10 transition-colors">
                         <Switch
                           id="reincident-filter"
                           checked={reincidentFilter}
                           onCheckedChange={(checked) => updateFilter('reincidentFilter', checked)}
                           className="data-[state=checked]:bg-primary"
                         />
                         <Label htmlFor="reincident-filter" className="text-sm cursor-pointer select-none">
                           Ocorrências Reincidentes
                         </Label>
                       </div>

                       <div className="flex items-center space-x-2 p-3 border border-border/50 rounded-lg bg-background/50 hover:bg-accent/10 transition-colors">
                         <Switch
                           id="vendor-priority-filter"
                           checked={vendorPriorityFilter}
                           onCheckedChange={(checked) => updateFilter('vendorPriorityFilter', checked)}
                           className="data-[state=checked]:bg-primary"
                         />
                         <Label htmlFor="vendor-priority-filter" className="text-sm cursor-pointer select-none">
                           Priorizadas com o Fornecedor
                         </Label>
                       </div>
                     </div>

                     {/* Segunda linha: Filtros dropdown */}
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                       {/* Status SLA */}
                       <div className="group space-y-3">
                         <Label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                           <div className="w-1 h-4 bg-warning/60 rounded-full"></div>
                           Status SLA
                         </Label>
                         <Popover>
                           <PopoverTrigger asChild>
                             <Button variant="outline" className="w-full h-10 justify-between hover:bg-warning/5 hover:border-warning/30 transition-all duration-200 group-hover:shadow-sm">
                               {statusSlaFilter.length > 0 ? (
                                 <div className="flex items-center gap-2">
                                   <Badge variant="secondary" className="h-5 text-xs bg-warning/10 text-warning">
                                     {statusSlaFilter.length}
                                   </Badge>
                                   <span className="text-sm">
                                     {statusSlaFilter.length === 1 ? 
                                       (['no_prazo', 'vencido', 'critico'].includes(statusSlaFilter[0]) ? 
                                         { no_prazo: 'No Prazo', vencido: 'Vencido', critico: 'Crítico' }[statusSlaFilter[0] as 'no_prazo' | 'vencido' | 'critico'] : 
                                         statusSlaFilter[0]
                                       ) : 
                                       `${statusSlaFilter.length} status`
                                     }
                                   </span>
                                 </div>
                               ) : "Todos os status SLA"}
                               <div className="w-4 h-4 opacity-50">⌄</div>
                             </Button>
                           </PopoverTrigger>
                           <PopoverContent className="w-72 p-0 bg-background/95 backdrop-blur-sm border border-border/80 shadow-lg z-50" align="start">
                             <Command>
                               <CommandInput placeholder="Buscar status SLA..." className="h-9" />
                               <CommandEmpty>Nenhum status SLA encontrado.</CommandEmpty>
                               <CommandList>
                                 <CommandGroup>
                                   {[
                                     { value: 'no_prazo', label: 'No Prazo' },
                                     { value: 'vencido', label: 'Vencido' },
                                     { value: 'critico', label: 'Crítico' }
                                   ].map(status => (
                                     <CommandItem key={status.value} onSelect={() => {
                                       const isSelected = statusSlaFilter.includes(status.value);
                                       if (isSelected) {
                                         updateFilter('statusSlaFilter', statusSlaFilter.filter(s => s !== status.value));
                                       } else {
                                         updateFilter('statusSlaFilter', [...statusSlaFilter, status.value]);
                                       }
                                     }}>
                                       <Check className={cn("mr-2 h-4 w-4", statusSlaFilter.includes(status.value) ? "opacity-100" : "opacity-0")} />
                                       {status.label}
                                     </CommandItem>
                                   ))}
                                 </CommandGroup>
                               </CommandList>
                             </Command>
                           </PopoverContent>
                         </Popover>
                       </div>

                       {/* Criticidade */}
                       <div className="group space-y-3">
                         <Label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                           <div className="w-1 h-4 bg-destructive/60 rounded-full"></div>
                          Criticidade
                         </Label>
                         <Popover>
                           <PopoverTrigger asChild>
                             <Button variant="outline" className="w-full h-10 justify-between hover:bg-destructive/5 hover:border-destructive/30 transition-all duration-200 group-hover:shadow-sm">
                               {severityFilterMulti.length > 0 ? (
                                 <div className="flex items-center gap-2">
                                   <Badge variant="secondary" className="h-5 text-xs bg-destructive/10 text-destructive">
                                     {severityFilterMulti.length}
                                   </Badge>
                                   <span className="text-sm">
                                     {severityFilterMulti.length === 1 ? 
                                       (['critical', 'high', 'medium', 'low'].includes(severityFilterMulti[0]) ? 
                                         { critical: 'Crítico', high: 'Alto', medium: 'Médio', low: 'Baixo' }[severityFilterMulti[0] as 'critical' | 'high' | 'medium' | 'low'] : 
                                         severityFilterMulti[0]
                                        ) : 
                                        `${severityFilterMulti.length} criticidades`
                                     }
                                   </span>
                                 </div>
                               ) : "Todas as criticidades"}
                               <div className="w-4 h-4 opacity-50">⌄</div>
                             </Button>
                           </PopoverTrigger>
                           <PopoverContent className="w-72 p-0 bg-background/95 backdrop-blur-sm border border-border/80 shadow-lg z-50" align="start">
                             <Command>
                                <CommandInput placeholder="Buscar criticidade..." className="h-9" />
                                <CommandEmpty>Nenhuma criticidade encontrada.</CommandEmpty>
                               <CommandList>
                                 <CommandGroup>
                                   {[
                                     { value: 'critical', label: 'Crítico' },
                                     { value: 'high', label: 'Alto' },
                                     { value: 'medium', label: 'Médio' },
                                     { value: 'low', label: 'Baixo' }
                                   ].map(severity => (
                                     <CommandItem key={severity.value} onSelect={() => {
                                       const isSelected = severityFilterMulti.includes(severity.value);
                                       if (isSelected) {
                                         updateFilter('severityFilterMulti', severityFilterMulti.filter(s => s !== severity.value));
                                       } else {
                                         updateFilter('severityFilterMulti', [...severityFilterMulti, severity.value]);
                                       }
                                     }}>
                                       <Check className={cn("mr-2 h-4 w-4", severityFilterMulti.includes(severity.value) ? "opacity-100" : "opacity-0")} />
                                       {severity.label}
                                     </CommandItem>
                                   ))}
                                 </CommandGroup>
                               </CommandList>
                             </Command>
                           </PopoverContent>
                         </Popover>
                       </div>

                        {/* Aging */}
                        <div className="group space-y-3">
                          <Label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <Clock className="h-3 w-3 text-orange-500" />
                            Aging
                          </Label>
                         <Popover>
                           <PopoverTrigger asChild>
                             <Button variant="outline" className="w-full h-10 justify-between hover:bg-orange-500/5 hover:border-orange-500/30 transition-all duration-200 group-hover:shadow-sm">
                                {longTailFilter.length > 0 ? (
                                  <div className="flex items-center gap-2">
                                    <Badge variant="secondary" className="h-5 text-xs bg-orange-500/10 text-orange-500">
                                      {longTailFilter.length}
                                    </Badge>
                                    <span className="text-sm">
                                      {longTailFilter.length === 1 ? 
                                        longTailFilter[0] : 
                                        `${longTailFilter.length} faixas`
                                      }
                                    </span>
                                  </div>
                               ) : "Todas as faixas"}
                               <div className="w-4 h-4 opacity-50">⌄</div>
                             </Button>
                           </PopoverTrigger>
                           <PopoverContent className="w-72 p-0 bg-background/95 backdrop-blur-sm border border-border/80 shadow-lg z-50" align="start">
                             <Command>
                               <CommandInput placeholder="Buscar faixa..." className="h-9" />
                               <CommandEmpty>Nenhuma faixa encontrada.</CommandEmpty>
                               <CommandList>
                                 <CommandGroup>
                                    {[
                                      { value: '0-0.5h', label: '0-0.5h' },
                                      { value: '0.5-1h', label: '0.5-1h' },
                                      { value: '1-2h', label: '1-2h' },
                                      { value: '2-4h', label: '2-4h' },
                                      { value: '4-8h', label: '4-8h' },
                                      { value: '8-12h', label: '8-12h' },
                                      { value: '12-24h', label: '12-24h' },
                                      { value: '1-2 dias', label: '1-2 dias' },
                                      { value: '2-3 dias', label: '2-3 dias' },
                                      { value: '3-5 dias', label: '3-5 dias' },
                                      { value: '>5 dias', label: '>5 dias', highlight: true }
                                   ].map(range => (
                                     <CommandItem key={range.value} onSelect={() => {
                                       const isSelected = longTailFilter.includes(range.value);
                                       if (isSelected) {
                                         updateFilter('longTailFilter', longTailFilter.filter(l => l !== range.value));
                                       } else {
                                         updateFilter('longTailFilter', [...longTailFilter, range.value]);
                                       }
                                     }}>
                                       <Check className={cn("mr-2 h-4 w-4", longTailFilter.includes(range.value) ? "opacity-100" : "opacity-0")} />
                                       <span className={cn(
                                         range.highlight && "font-semibold text-orange-500"
                                       )}>
                                         {range.label}
                                       </span>
                                     </CommandItem>
                                   ))}
                                 </CommandGroup>
                               </CommandList>
                             </Command>
                           </PopoverContent>
                         </Popover>
                       </div>
                     </div>

                     {/* Número de Série - Apenas na página Ocorrências */}
                     {showSerialNumber && (
                       <div className="space-y-3">
                         <Label className="text-sm font-medium text-muted-foreground">
                           Número de Série
                         </Label>
                         <Input
                           placeholder="Ex: ATM001-SP-001"
                           value={serialNumberFilter}
                           onChange={(e) => updateFilter('serialNumberFilter', e.target.value)}
                           className="h-10"
                         />
                       </div>
                     )}
                   </div>
                </CollapsibleContent>
              </div>
            </Collapsible>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
