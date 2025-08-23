import { useState, useEffect, useMemo, Suspense, lazy } from "react";
import { useNavigate } from "react-router-dom";
import { OptimizedMetricCard } from "./OptimizedMetricCard";
import { OptimizedInteractiveCharts } from "./OptimizedInteractiveCharts";
import { StatusBadge } from "./StatusBadge";
import { AgingChart } from "./AgingChart";
import { OccurrenceModal } from "./OccurrenceModal";
import { EquipmentStatusChart } from "./EquipmentStatusChart";
import { TopAgenciesChart } from "./TopAgenciesChart";

import { FilterSection } from "./FilterSection";

// Lazy loading de componentes pesados
const EnhancedInteractiveCharts = lazy(() => import('./EnhancedInteractiveCharts').then(module => ({ default: module.EnhancedInteractiveCharts })))
const VendorMetricsMatrix = lazy(() => import('./VendorMetricsMatrix').then(module => ({ default: module.VendorMetricsMatrix })))
const CriticalityHeatmap = lazy(() => import('./CriticalityHeatmap').then(module => ({ default: module.CriticalityHeatmap })))
const MotivoLongTailChart = lazy(() => import('./MotivoLongTailChart'))
const SlaPrevisaoChart = lazy(() => import('./SlaPrevisaoChart').then(module => ({ default: module.SlaPrevisaoChart })))
import { OccurrenceHighlights } from "./OccurrenceHighlights";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Check } from "lucide-react";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useToast } from "@/hooks/use-toast";
import { useFilters } from "@/contexts/FiltersContext";
import { useFeatureToggle } from "@/contexts/FeatureToggleContext";
import { AlertTriangle, CheckCircle2, Clock, TrendingUp, MapPin, Users, Calendar, Download, RefreshCw, CalendarDays, Truck, HelpCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from 'sonner';

export function Dashboard() {
  const navigate = useNavigate();
  const {
    occurrences,
    isLoading,
    severityData,
    timelineData,
    mttrData,
    equipmentData,
    metrics,
    refreshData
  } = useDashboardData();
  const { toast: toastHook } = useToast();
  const { featureToggles, getOrderedItems } = useFeatureToggle();
  const [selectedOccurrence, setSelectedOccurrence] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Usar filtros do contexto
  const filters = useFilters();

  // Limpar todos os filtros ao entrar no dashboard
  useEffect(() => {
    filters.clearAllFilters();
  }, []);
  
  // Helper functions para renderizar componentes baseado nos feature toggles
  const renderCard = (cardId: string) => {
    if (!featureToggles[cardId]?.enabled) return null;
    
    switch (cardId) {
      case 'totalOccurrences':
        return (
          <div key={cardId} onClick={() => handleNavigateToOccurrences('total')} className="cursor-pointer">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="relative">
                    <OptimizedMetricCard 
                      title="Total de Ocorrências" 
                      value={cardMetrics.totalOccurrences}
                      icon={<AlertTriangle className="h-4 w-4" />} 
                      description={`${Math.round(cardMetrics.totalOccurrences / occurrences.length * 100)}% do total`}
                      isLoading={isLoading}
                    />
                    <HelpCircle className="absolute top-2 right-2 h-4 w-4 text-muted-foreground/50 hover:text-muted-foreground transition-colors" />
                  </div>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p><strong>Total de Ocorrências:</strong> Número total de incidentes registrados no sistema, incluindo todas as situações que requerem intervenção técnica nos equipamentos bancários.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        );
      case 'pendingOccurrences':
        return (
          <div key={cardId} onClick={() => handleNavigateToOccurrences('pending')} className="cursor-pointer">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="relative">
                    <OptimizedMetricCard 
                      title="Ocorrências Pendentes" 
                      value={cardMetrics.pendingOccurrences}
                      icon={<Clock className="h-4 w-4" />} 
                      description="Em andamento ou aguardando"
                      isLoading={isLoading}
                    />
                    <HelpCircle className="absolute top-2 right-2 h-4 w-4 text-muted-foreground/50 hover:text-muted-foreground transition-colors" />
                  </div>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p><strong>Ocorrências Pendentes:</strong> Incidentes que ainda não foram resolvidos, incluindo os que estão aguardando início, em andamento ou com impedimentos. Requer atenção da equipe técnica.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        );
      case 'inoperantEquipments':
        return (
          <div key={cardId} onClick={() => handleNavigateToOccurrences('inoperant')} className="cursor-pointer">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="relative">
                    <OptimizedMetricCard 
                      title="Equipamentos Inoperantes" 
                      value={cardMetrics.inoperantEquipments}
                      icon={<AlertTriangle className="h-4 w-4" />} 
                      description="Equipamentos fora de operação"
                      isLoading={isLoading}
                    />
                    <HelpCircle className="absolute top-2 right-2 h-4 w-4 text-muted-foreground/50 hover:text-muted-foreground transition-colors" />
                  </div>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p><strong>Equipamentos Inoperantes:</strong> Número de equipamentos que estão fora de operação devido a falhas técnicas, indisponibilidade ou manutenção, impactando diretamente o atendimento aos clientes.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        );
      case 'criticalOccurrences':
        return (
          <div key={cardId} onClick={() => handleNavigateToOccurrences('critical')} className="cursor-pointer">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="relative">
                    <OptimizedMetricCard 
                      title="Ocorrências Críticas" 
                      value={cardMetrics.criticalOccurrences}
                      icon={<AlertTriangle className="h-4 w-4" />} 
                      description="Prioridade máxima"
                      isLoading={isLoading}
                    />
                    <HelpCircle className="absolute top-2 right-2 h-4 w-4 text-muted-foreground/50 hover:text-muted-foreground transition-colors" />
                  </div>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p><strong>Ocorrências Críticas:</strong> Incidentes de severidade crítica que impactam severamente a operação e requerem atenção imediata, com SLA de resolução de 24 horas.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        );
      case 'overdueOccurrences':
        return (
          <div key={cardId} onClick={() => handleNavigateToOccurrences('overdue')} className="cursor-pointer">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="relative">
                    <OptimizedMetricCard 
                      title="SLA em Atraso" 
                      value={cardMetrics.overdueOccurrences}
                      icon={<AlertTriangle className="h-4 w-4" />} 
                      description="Acima do prazo limite"
                      isLoading={isLoading}
                    />
                    <HelpCircle className="absolute top-2 right-2 h-4 w-4 text-muted-foreground/50 hover:text-muted-foreground transition-colors" />
                  </div>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p><strong>SLA em Atraso:</strong> Ocorrências que ultrapassaram o tempo limite de resolução estabelecido no acordo de nível de serviço (24h para críticas/altas, 72h para médias/baixas).</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        );
      case 'reincidences':
        return (
          <div key={cardId} onClick={() => handleNavigateToOccurrences('reincidence')} className="cursor-pointer">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="relative">
                    <OptimizedMetricCard 
                      title="Reincidências" 
                      value={cardMetrics.reincidentOccurrences}
                      icon={<AlertTriangle className="h-4 w-4" />} 
                      description="Ocorrências repetidas"
                      isLoading={isLoading}
                    />
                    <HelpCircle className="absolute top-2 right-2 h-4 w-4 text-muted-foreground/50 hover:text-muted-foreground transition-colors" />
                  </div>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p><strong>Reincidências:</strong> Ocorrências que se repetem no mesmo equipamento e ponto, indicando possíveis problemas estruturais ou necessidade de manutenção preventiva mais eficaz.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        );
      case 'affectedAgencies':
        return (
          <div key={cardId} onClick={() => handleNavigateToOccurrences('agencies')} className="cursor-pointer">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="relative">
                    <OptimizedMetricCard 
                      title="Pontos Afetados" 
                      value={(() => {
                        const affectedAgencies = new Set(filteredOccurrences.map(o => o.agency));
                        const vipAgencies = Array.from(affectedAgencies).filter(agency => {
                          const agencyNumber = agency.match(/\d+/)?.[0] || '0';
                          return agencyNumber.endsWith('0') || agencyNumber.endsWith('5');
                        });
                        return `${affectedAgencies.size} (${vipAgencies.length} VIP)`;
                      })()}
                      icon={<MapPin className="h-4 w-4" />} 
                      description="Pontos com ocorrências"
                      isLoading={isLoading}
                    />
                    <HelpCircle className="absolute top-2 right-2 h-4 w-4 text-muted-foreground/50 hover:text-muted-foreground transition-colors" />
                  </div>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p><strong>Pontos Afetados:</strong> Número de pontos que possuem pelo menos uma ocorrência ativa. Os pontos VIP são unidades estratégicas que recebem prioridade especial no atendimento.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        );
      case 'averageMTTR':
        return (
          <div key={cardId} onClick={() => handleNavigateToOccurrences('mttr')} className="cursor-pointer">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="relative">
                    <OptimizedMetricCard 
                      title="MTTR" 
                      value={metrics?.avgMTTR || "4.2h"}
                      icon={<Clock className="h-4 w-4" />} 
                      description="Tempo médio de resolução"
                      isLoading={isLoading}
                    />
                    <HelpCircle className="absolute top-2 right-2 h-4 w-4 text-muted-foreground/50 hover:text-muted-foreground transition-colors" />
                  </div>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p><strong>MTTR (Mean Time To Resolution):</strong> Tempo médio necessário para resolver uma ocorrência, desde a abertura até o encerramento. Indicador chave de eficiência operacional da equipe de suporte.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        );
      case 'dueTodayOccurrences':
        return (
          <div key={cardId} onClick={() => handleNavigateToOccurrences('due-today')} className="cursor-pointer">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="relative">
                    <OptimizedMetricCard 
                      title="Vencem Hoje" 
                      value={cardMetrics.dueTodayOccurrences}
                      icon={<Clock className="h-4 w-4" />} 
                      description="SLA com vencimento hoje"
                      isLoading={isLoading}
                    />
                    <HelpCircle className="absolute top-2 right-2 h-4 w-4 text-muted-foreground/50 hover:text-muted-foreground transition-colors" />
                  </div>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p><strong>Vencem Hoje:</strong> Ocorrências que atingirão o prazo limite do SLA nas próximas 24 horas, requerendo atenção prioritária para evitar descumprimento do acordo de nível de serviço.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        );
      case 'todayOccurrences':
        return (
          <div key={cardId} onClick={() => handleNavigateToOccurrences('entered-today')} className="cursor-pointer">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="relative">
                    <OptimizedMetricCard 
                      title="Entraram Hoje" 
                      value={cardMetrics.todayOccurrences || 0}
                      icon={<Clock className="h-4 w-4" />} 
                      description="Ocorrências criadas hoje"
                      isLoading={isLoading}
                    />
                    <HelpCircle className="absolute top-2 right-2 h-4 w-4 text-muted-foreground/50 hover:text-muted-foreground transition-colors" />
                  </div>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p><strong>Entraram Hoje:</strong> Número de ocorrências que foram criadas no sistema no dia atual, permitindo acompanhar o volume diário de novos casos.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        );
      default:
        return null;
    }
  };

  const renderChart = (chartId: string) => {
    if (!featureToggles[chartId]?.enabled) return null;
    
    switch (chartId) {
      case 'equipmentStatusChart':
        return (
          <div key={chartId} className="animate-fade-in" style={{ animationDelay: '0.35s' }}>
            <EquipmentStatusChart occurrences={filteredOccurrences} />
          </div>
        );
      case 'topAgenciesChart':
        return (
          <div key={chartId} className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <TopAgenciesChart occurrences={occurrences} filteredOccurrences={filteredOccurrences} />
          </div>
        );
      case 'agingChart':
        return (
          <div key={chartId} className="animate-fade-in" style={{ animationDelay: '0.45s' }}>
            <Card className="border-l-4 border-l-orange-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-2 h-6 bg-gradient-to-b from-orange-500 to-red-500 rounded-sm"></div>
                  Gráfico de Aging
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Análise do tempo de permanência das ocorrências em aberto (aging), distribuídas por faixas temporais</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Distribuição temporal de ocorrências em aberto - identifique gargalos e otimize a performance operacional
                </p>
              </CardHeader>
              <CardContent>
                <AgingChart occurrences={occurrences} filteredOccurrences={filteredOccurrences} />
              </CardContent>
            </Card>
          </div>
        );
      case 'vendorMetricsMatrix':
        return (
          <div key={chartId} className="animate-fade-in" style={{ animationDelay: '0.5s' }}>
            <Suspense fallback={
              <Card className="border-l-4 border-l-primary">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-5 rounded" />
                    <Skeleton className="h-6 w-48" />
                  </div>
                  <Skeleton className="h-4 w-96" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-[400px] w-full rounded-lg" />
                </CardContent>
              </Card>
            }>
              <VendorMetricsMatrix 
                occurrences={filteredOccurrences} 
                onNavigateToOccurrences={handleVendorMetricsNavigation}
              />
            </Suspense>
          </div>
        );
      case 'motivoLongTailChart':
        return (
          <div key={chartId} className="animate-fade-in" style={{ animationDelay: '0.55s' }}>
            <Suspense fallback={
              <Card className="border-l-4 border-l-orange-500">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-5 rounded" />
                    <Skeleton className="h-6 w-48" />
                  </div>
                  <Skeleton className="h-4 w-96" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-[400px] w-full rounded-lg" />
                </CardContent>
              </Card>
            }>
              <MotivoLongTailChart 
                occurrences={occurrences} 
                filteredOccurrences={filteredOccurrences}
              />
            </Suspense>
          </div>
        );
        case 'slaPrevisaoChart':
        return (
          <div key={chartId} className="animate-fade-in" style={{ animationDelay: '0.6s' }}>
            <Suspense fallback={
              <Card className="border-l-4 border-l-blue-500">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-5 rounded" />
                    <Skeleton className="h-6 w-48" />
                  </div>
                  <Skeleton className="h-4 w-96" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-[400px] w-full rounded-lg" />
                </CardContent>
              </Card>
            }>
              <SlaPrevisaoChart 
                occurrences={occurrences} 
                filteredOccurrences={filteredOccurrences}
              />
            </Suspense>
          </div>
        );
      case 'criticalityHeatmap':
        return (
          <div key={chartId} className="animate-fade-in" style={{ animationDelay: '0.7s' }}>
            <Suspense fallback={
              <Card className="border-l-4 border-l-red-500">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-5 rounded" />
                    <Skeleton className="h-6 w-48" />
                  </div>
                  <Skeleton className="h-4 w-96" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-[400px] w-full rounded-lg" />
                </CardContent>
              </Card>
            }>
              <CriticalityHeatmap 
                occurrences={filteredOccurrences}
              />
            </Suspense>
          </div>
        );
      case 'interactiveCharts':
        return (
          <div key={chartId} className="animate-fade-in" style={{ animationDelay: '0.75s' }}>
            <OptimizedInteractiveCharts 
              severityData={severityData}
              timelineData={timelineData}
              mttrData={mttrData}
              equipmentData={equipmentData}
              occurrences={occurrences}
            />
          </div>
        );
      default:
        return null;
    }
  };

  const renderSection = (sectionId: string) => {
    if (!featureToggles[sectionId]?.enabled) return null;
    
    switch (sectionId) {
      case 'filterSection':
        return (
          <div key={sectionId} className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <FilterSection defaultOpen />
          </div>
        );
      case 'occurrenceHighlights':
        return (
          <div key={sectionId} className="animate-fade-in" style={{ animationDelay: '0.5s' }}>
            <OccurrenceHighlights 
              occurrences={filteredOccurrences} 
              onOccurrenceClick={handleOccurrenceClick}
              onNavigateToOccurrences={handleNavigateToOccurrences}
            />
          </div>
        );
      default:
        return null;
    }
  };
  const {
    agenciaFilter,
    ufFilter,
    tipoAgenciaFilter,
    pontoVipFilter,
    segmentFilterMulti,
    equipmentFilterMulti,
    statusFilterMulti,
    vendorFilterMulti,
    transportadoraFilterMulti,
    statusEquipamentoFilterMulti,
    serialNumberFilter,
    overrideFilter,
    vendorPriorityFilter,
    reincidentFilter,
    longTailFilter,
    motivoFilter,
    hasActiveFilters,
    filterPeriod,
    customDateRange,
    updateFilter
  } = filters;
  const handleExport = async () => {
    toast('Exportação iniciada - Gerando PDF da dashboard...');
    try {
      const dashboardElement = document.getElementById('dashboard-content');
      if (!dashboardElement) {
        toast('Erro - Elemento da dashboard não encontrado para exportação');
        return;
      }

      // Capturar imagem da dashboard com alta qualidade
      const canvas = await html2canvas(dashboardElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        removeContainer: false
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('l', 'mm', 'a4'); // Paisagem para melhor visualização
      
      // Configurações do PDF
      const pageWidth = 297;
      const pageHeight = 210;
      const margin = 15;
      const contentWidth = pageWidth - (margin * 2);
      
      // Header com informações
      const now = new Date();
      const dateTime = now.toLocaleString('pt-BR', {
        dateStyle: 'full',
        timeStyle: 'short'
      });
      
      // Título principal
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Dashboard COPF - Sistema de Monitoramento', margin, 25);
      
      // Data e hora de geração
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Gerado em: ${dateTime}`, margin, 35);
      
      // Informações adicionais sobre filtros
      if (hasActiveFilters) {
        pdf.setFontSize(10);
        pdf.setTextColor(100, 100, 100);
        pdf.text('* Relatório gerado com filtros aplicados', margin, 42);
      }
      
      // Período dos dados
      const periodText = filterPeriod === '7-days' ? 'Últimos 7 dias' :
                        filterPeriod === '30-days' ? 'Últimos 30 dias' :
                        filterPeriod === '60-days' ? 'Últimos 60 dias' :
                        filterPeriod === '90-days' ? 'Últimos 90 dias' : 'Período personalizado';
      
      pdf.setFontSize(10);
      pdf.setTextColor(80, 80, 80);
      pdf.text(`Período: ${periodText}`, margin, 48);
      
      // Resetar cor para preto
      pdf.setTextColor(0, 0, 0);
      
      // Calcular dimensões da imagem
      const imgAspectRatio = canvas.width / canvas.height;
      const imgWidth = contentWidth;
      const imgHeight = imgWidth / imgAspectRatio;
      
      // Posição inicial da imagem (após o header)
      let yPosition = 55;
      
      // Adicionar imagem da dashboard
      if (imgHeight <= (pageHeight - yPosition - margin)) {
        // A imagem cabe em uma página
        pdf.addImage(imgData, 'PNG', margin, yPosition, imgWidth, imgHeight);
      } else {
        // A imagem precisa ser dividida em múltiplas páginas
        let remainingHeight = imgHeight;
        let currentY = yPosition;
        let sourceY = 0;
        
        while (remainingHeight > 0) {
          const availableHeight = pageHeight - currentY - margin;
          const sliceHeight = Math.min(remainingHeight, availableHeight);
          const sourceHeight = (sliceHeight / imgHeight) * canvas.height;
          
          // Criar um canvas temporário para o slice
          const tempCanvas = document.createElement('canvas');
          const tempCtx = tempCanvas.getContext('2d');
          tempCanvas.width = canvas.width;
          tempCanvas.height = sourceHeight;
          
          if (tempCtx) {
            tempCtx.drawImage(canvas, 0, sourceY, canvas.width, sourceHeight, 0, 0, canvas.width, sourceHeight);
            const sliceData = tempCanvas.toDataURL('image/png');
            pdf.addImage(sliceData, 'PNG', margin, currentY, imgWidth, sliceHeight);
          }
          
          remainingHeight -= sliceHeight;
          sourceY += sourceHeight;
          
          if (remainingHeight > 0) {
            pdf.addPage();
            currentY = margin;
          }
        }
      }
      
      // Footer na última página
      const pageCount = pdf.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(120, 120, 120);
        pdf.text(`Página ${i} de ${pageCount} - Dashboard COPF`, margin, pageHeight - 5);
      }
      
      // Salvar o PDF
      const fileName = `dashboard-copf-${now.toISOString().split('T')[0]}-${now.getHours()}h${now.getMinutes()}.pdf`;
      pdf.save(fileName);
      
      toast('Download concluído - Dashboard exportada em PDF com sucesso!');
    } catch (error) {
      console.error('Erro na exportação:', error);
      toast('Erro na exportação - Não foi possível gerar o PDF. Tente novamente.');
    }
  };
  const handleOccurrenceClick = (occurrence: any) => {
    setSelectedOccurrence(occurrence);
    setModalOpen(true);
  };
  const handleRefresh = () => {
    refreshData();
    toast('Dados atualizados - Dashboard atualizado com as informações mais recentes.');
  };

  // Handlers para navegar com filtros específicos
  const handleNavigateToOccurrences = (filter: 'total' | 'pending' | 'reincidence' | 'overdue' | 'agencies' | 'mttr' | 'inoperant' | 'entered-today' | 'due-today' | 'overdue-today' | 'critical') => {
    console.log('Card clicked:', filter, 'Current filtered occurrences:', filteredOccurrences.length);
    
    // Aplicar filtros específicos do card clicado SEM limpar os filtros existentes
    const params = new URLSearchParams();
    switch (filter) {
      case 'total':
        // Sem filtros específicos
        break;
      case 'pending':
        filters.updateFilter('statusFilterMulti', ['a_iniciar', 'em_andamento', 'com_impedimentos']);
        params.set('status', 'a_iniciar,em_andamento,com_impedimentos');
        break;
      case 'reincidence':
        filters.updateFilter('reincidentFilter', true);
        params.set('reincidence', '1');
        break;
      case 'overdue':
        // Usar parâmetro de URL para aplicar na página
        params.set('sla_status', 'overdue');
        break;
      case 'entered-today':
        navigate('/ocorrencias', { state: { filterType: 'entered-today' } });
        return;
      case 'due-today':
        navigate('/ocorrencias', { state: { filterType: 'due-today' } });
        return;
      case 'overdue-today':
        navigate('/ocorrencias', { state: { filterType: 'overdue-today' } });
        return;
      case 'agencies':
        // Sem filtros específicos
        break;
      case 'mttr':
        filters.updateFilter('statusFilterMulti', ['encerrado']);
        params.set('status', 'encerrado');
        break;
      case 'inoperant':
        filters.updateFilter('statusEquipamentoFilterMulti', ['inoperante']);
        params.set('equip_status', 'inoperante');
        break;
      case 'critical':
        filters.updateFilter('severityFilterMulti', ['critical']);
        params.set('severity', 'critical');
        break;
    }
    
    // Navegar para a página de ocorrências com parâmetros quando necessário
    const query = params.toString();
    navigate(query ? `/ocorrencias?${query}` : '/ocorrencias');
    toast('Filtros aplicados - navegando para página de ocorrências');
  };

  // Handler para VendorMetricsMatrix
  const handleVendorMetricsNavigation = (filter: { vendor?: string; severity?: string; slaStatus?: string }) => {
    if (filter.vendor) {
      filters.updateFilter('vendorFilterMulti', [filter.vendor]);
    }
    if (filter.severity) {
      if (filter.severity.includes(',')) {
        // Múltiplas severidades separadas por vírgula
        filters.updateFilter('severityFilterMulti', filter.severity.split(','));
      } else {
        filters.updateFilter('severityFilterMulti', [filter.severity]);
      }
    }
    if (filter.slaStatus) {
      filters.updateFilter('statusSlaFilter', [filter.slaStatus]);
    }
    navigate('/ocorrencias');
    toast('Filtros aplicados - navegando para página de ocorrências');
  };

  // Filtrar ocorrências - Memoizado para performance
  const filteredOccurrences = useMemo(() => {
    // Determina intervalo de datas baseado no filtro selecionado
    const now = new Date();
    let startDate: Date | null = null;
    let endDate: Date | null = now;

    switch (filterPeriod) {
      case '7-days':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        break;
      case '30-days':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 30);
        break;
      case '60-days':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 60);
        break;
      case '90-days':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 90);
        break;
      case 'custom':
        if (customDateRange?.from) {
          startDate = new Date(customDateRange.from);
        }
        if (customDateRange?.to) {
          endDate = new Date(customDateRange.to);
          // incluir o dia final inteiro
          endDate.setHours(23, 59, 59, 999);
        }
        break;
      default:
        // fallback: sem filtro de período
        startDate = null;
        endDate = null;
    }

    let filtered = occurrences.filter(occurrence => {
      // Filtro por período (Data/Hora Abertura)
      if (startDate && endDate) {
        const created = new Date(occurrence.createdAt);
        if (isNaN(created.getTime())) return false;
        if (created < startDate || created > endDate) return false;
      }

      // Filtros multiselect
      if (segmentFilterMulti.length > 0 && !segmentFilterMulti.includes(occurrence.segment)) return false;
      if (equipmentFilterMulti.length > 0 && !equipmentFilterMulti.includes(occurrence.equipment)) return false;
      if (statusFilterMulti.length > 0 && !statusFilterMulti.includes(occurrence.status)) return false;
      if (statusEquipamentoFilterMulti.length > 0 && !statusEquipamentoFilterMulti.includes(occurrence.statusEquipamento)) return false;
      if (vendorFilterMulti.length > 0 && !vendorFilterMulti.includes(occurrence.vendor)) return false;
      if (transportadoraFilterMulti.length > 0) {
        // Verificar se a transportadora existe e não está vazia
        if (!occurrence.transportadora || occurrence.transportadora.trim() === '') return false;
        
        // Verificar se a transportadora está na lista de filtros
        if (!transportadoraFilterMulti.includes(occurrence.transportadora)) return false;
      }

      // Filtro de série
      if (serialNumberFilter && !occurrence.serialNumber.toLowerCase().includes(serialNumberFilter.toLowerCase())) return false;

      // Filtro de agência por número
      if (agenciaFilter.length > 0) {
        const agencyNumber = occurrence.agency.match(/\d+/)?.[0] || '';
        if (!agenciaFilter.includes(agencyNumber)) return false;
      }

      // Filtro de UF (usar campo 'estado' vindo do banco)
      if (ufFilter.length > 0) {
        const agencyUF = occurrence.estado;
        if (!ufFilter.includes(agencyUF)) return false;
      }

      // Usar o campo tipoAgencia do objeto de dados
      if (tipoAgenciaFilter.length > 0 && !tipoAgenciaFilter.includes(occurrence.tipoAgencia)) return false;

      // Simular ponto VIP (pontos com número terminado em 0, 5 são VIP)
      const agencyNumber = occurrence.agency.match(/\d+/)?.[0] || '0';
      const isVip = agencyNumber.endsWith('0') || agencyNumber.endsWith('5');
      const pontoVipStatus = isVip ? 'sim' : 'nao';
      if (pontoVipFilter.length > 0 && !pontoVipFilter.includes(pontoVipStatus)) return false;

      // Filtro de ocorrências que vencem hoje (próximas 24h)
      if (overrideFilter) {
        if (occurrence.status === 'encerrado') return false;
        const createdDate = new Date(occurrence.createdAt);
        const hoursElapsed = (Date.now() - createdDate.getTime()) / (1000 * 60 * 60);
        const slaLimit = occurrence.severity === 'critical' || occurrence.severity === 'high' ? 24 : 72;
        const hoursUntilDue = slaLimit - hoursElapsed;
        const dueToday = hoursUntilDue > 0 && hoursUntilDue <= 24; // Vence nas próximas 24 horas
        if (!dueToday) return false;
      }

      // Filtro de reincidências (simular campo reincidencia)
      if (reincidentFilter) {
        // Lógica simplificada: equipamentos com mais de uma ocorrência no mesmo ponto
        const hasReincidence = occurrences.some(other => 
          other.id !== occurrence.id &&
          other.equipment === occurrence.equipment && 
          other.agency === occurrence.agency
        );
        if (!hasReincidence) return false;
      }
      
      // Filtro de Aging (tempo desde abertura) - apenas ocorrências ativas para consistência com AgingChart
      if (longTailFilter.length > 0) {
        // Primeiro verificar se a ocorrência está ativa (não cancelada/encerrada)
        const isActiveOccurrence = occurrence.status === 'a_iniciar' || occurrence.status === 'em_andamento';
        if (!isActiveOccurrence) return false;
        
        const createdDate = new Date(occurrence.createdAt);
        const hoursDiff = (Date.now() - createdDate.getTime()) / (1000 * 60 * 60);
        const daysDiff = hoursDiff / 24;
        
        const matchesFilter = longTailFilter.some(filter => {
          switch (filter) {
            case '0-0.5h': return hoursDiff >= 0 && hoursDiff <= 0.5;
            case '0.5-1h': return hoursDiff > 0.5 && hoursDiff <= 1;
            case '1-2h': return hoursDiff > 1 && hoursDiff <= 2;
            case '2-4h': return hoursDiff > 2 && hoursDiff <= 4;
            case '4-8h': return hoursDiff > 4 && hoursDiff <= 8;
            case '8-12h': return hoursDiff > 8 && hoursDiff <= 12;
            case '12-24h': return hoursDiff > 12 && hoursDiff <= 24;
            case '1-2 dias': return daysDiff > 1 && daysDiff <= 2;
            case '2-3 dias': return daysDiff > 2 && daysDiff <= 3;
            case '3-5 dias': return daysDiff > 3 && daysDiff <= 5;
            case '>5 dias': return daysDiff > 5;
            default: return false;
          }
        });
        if (!matchesFilter) return false;
      }

      // Filtro de priorizadas com fornecedor (simular campo prioridade_fornecedor)
      if (vendorPriorityFilter) {
        // Lógica simplificada: ocorrências críticas ou altas como prioridade P1
        const isPriorityP1 = occurrence.severity === 'critical' || occurrence.severity === 'high';
        if (!isPriorityP1) return false;
      }

      // Filtro de motivo de ocorrência
      if (motivoFilter.length > 0) {
        const motivoOcorrencia = occurrence.motivoOcorrencia || 'Não informado';
        if (!motivoFilter.includes(motivoOcorrencia)) return false;
      }

      return true;
    });

    return filtered;
  }, [occurrences, filterPeriod, customDateRange, segmentFilterMulti, equipmentFilterMulti, statusFilterMulti, statusEquipamentoFilterMulti, vendorFilterMulti, transportadoraFilterMulti, serialNumberFilter, agenciaFilter, ufFilter, tipoAgenciaFilter, pontoVipFilter, overrideFilter, vendorPriorityFilter, reincidentFilter, longTailFilter, motivoFilter, hasActiveFilters]);

  // Cálculos memoizados para garantir consistência com a página de ocorrências
  const cardMetrics = useMemo(() => {
    // 1. Total de ocorrências (já está correto)
    const totalOccurrences = filteredOccurrences.length;

    // 2. Ocorrências pendentes (A iniciar, Em andamento, Com Impedimentos)
    const pendingOccurrences = filteredOccurrences.filter(o => 
      o.status === 'a_iniciar' || o.status === 'em_andamento' || o.status === 'com_impedimentos'
    ).length;

    // 3. Reincidências - ignorar itens sintéticos (id com "-dup-")
    const baseForReincidence = filteredOccurrences.filter(o => !String(o.id).includes('-dup-'));
    const reincidentOccurrences = baseForReincidence.reduce((count, occurrence, index) => {
      const sameReasonEquipment = baseForReincidence.filter((other, otherIndex) => 
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

    // 4. SLA em atraso - usar mesma lógica que será usada na página de ocorrências
    const overdueOccurrences = filteredOccurrences.filter(o => {
      if (o.status === 'encerrado') return false;
      const createdDate = new Date(o.createdAt);
      const hoursDiff = (Date.now() - createdDate.getTime()) / (1000 * 60 * 60);
      const slaLimit = o.severity === 'critical' || o.severity === 'high' ? 24 : 72;
      return hoursDiff > slaLimit;
    }).length;

    // 5. Equipamentos inoperantes
    const inoperantEquipments = filteredOccurrences.filter(o => o.statusEquipamento === 'inoperante').length;

    // 6. Ocorrências críticas
    const criticalOccurrences = filteredOccurrences.filter(o => o.severity === 'critical').length;

    // 7. Vencem hoje
    const dueTodayOccurrences = filteredOccurrences.filter(o => {
      const occCreatedDate = new Date(o.createdAt);
      const slaLimit = o.severity === 'critical' || o.severity === 'high' ? 24 : 72;
      const slaEndDate = new Date(occCreatedDate.getTime() + slaLimit * 60 * 60 * 1000);
      const isDueToday = slaEndDate.toDateString() === new Date().toDateString();
      const isNotCompleted = o.status !== 'encerrado' && o.status !== 'cancelado';
      return isDueToday && isNotCompleted;
    }).length;

    // 8. Entraram hoje
    const todayOccurrences = filteredOccurrences.filter(o => {
      const occCreatedDate = new Date(o.createdAt);
      const today = new Date();
      return occCreatedDate.toDateString() === today.toDateString();
    }).length;

    return {
      totalOccurrences,
      pendingOccurrences,
      reincidentOccurrences,
      overdueOccurrences,
      inoperantEquipments,
      criticalOccurrences,
      dueTodayOccurrences,
      todayOccurrences
    };
  }, [filteredOccurrences]);

  // Mapeamento de equipamentos por segmento
  const equipmentsBySegment = {
    AA: ['ATM Saque', 'ATM Depósito', 'Cassete'],
    AB: ['Notebook', 'Desktop', 'Leitor de Cheques/documentos', 'Leitor biométrico', 'PIN PAD', 'Scanner de Cheque', 'Impressora', 'Impressora térmica', 'Impressora multifuncional', 'Monitor LCD/LED', 'Teclado', 'Servidor', 'Televisão', 'Senheiro', 'TCR', 'Classificadora', 'Fragmentadora de Papel']
  };

  // Obter equipamentos únicos baseado no segmento selecionado
  const getFilteredEquipments = () => {
    if (segmentFilterMulti.length === 0) {
      return Array.from(new Set(occurrences.map(o => o.equipment))).sort();
    } else {
      const segmentEquipments = segmentFilterMulti.flatMap(segment => equipmentsBySegment[segment as 'AA' | 'AB'] || []);
      return Array.from(new Set(segmentEquipments)).sort();
    }
  };
  const uniqueEquipments = getFilteredEquipments();
  const uniqueVendors = Array.from(new Set(occurrences.map(o => o.vendor))).sort();

  // Dados de transportadoras e seus fornecedores
  const transportadoraFornecedores = {
    'Express Logística': ['Fornecedor A', 'Fornecedor B', 'Fornecedor C'],
    'TechTransporte': ['Fornecedor D', 'Fornecedor E'],
    'LogiCorp': ['Fornecedor F', 'Fornecedor G', 'Fornecedor H']
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

  // Filtrar UFs baseadas nos pontos selecionados
  const availableUFs = !Array.isArray(agenciaFilter) || agenciaFilter.length === 0 ? estadosBrasil : Array.from(new Set(agenciaFilter.map(agencyNumber => {
    // Lógica simplificada: pontos 0-999 = SP, 1000-1999 = RJ, etc.
    const num = parseInt(agencyNumber);
    if (num <= 999) return 'SP';
    if (num <= 1999) return 'RJ';
    if (num <= 2999) return 'MG';
    if (num <= 3999) return 'RS';
    return 'PR';
  })));

  // Verificar tipo de ponto atual (para mostrar filtros condicionais)
  const tipoAgenciaAtual = tipoAgenciaFilter.some(tipo => tipo.includes('Terceirizada')) ? 'terceirizada' : tipoAgenciaFilter.some(tipo => tipo.includes('Convencional')) ? 'convencional' : 'all';
  return <div id="dashboard-content" className="space-y-8 animate-fade-in">
      {/* Hero Header */}
      <div className="relative">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 rounded-3xl"></div>
        
        <div className="relative p-8 rounded-3xl border border-border/50 bg-card/50 backdrop-blur-sm shadow-elegant">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-gradient-primary shadow-lg">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                    Dashboard COPF
                  </h1>
                  <p className="text-lg text-muted-foreground">
                    Centro de Operações de Pontos Físicos
                  </p>
                </div>
              </div>
              
              {/* Status Badges */}
              <div className="flex flex-wrap items-center gap-3">
                
                <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl border border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-200">
                  <div className="p-1.5 rounded-lg bg-primary/10">
                    <MapPin className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-foreground">
                      2.360 Pontos
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Monitorados
                    </span>
                  </div>
                </div>
                {hasActiveFilters && <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-warning/10 border border-warning/20">
                    <AlertTriangle className="h-4 w-4 text-warning" />
                    <span className="text-sm font-medium text-warning-foreground">
                      Filtros Aplicados
                    </span>
                  </div>}
              </div>
            </div>
            {/* Action Controls */}
            <div className="flex flex-wrap gap-3">
              {/* Filtro de Período */}
              <Select value={filterPeriod} onValueChange={(value) => updateFilter('filterPeriod', value)}>
                <SelectTrigger className="w-auto min-w-[180px] bg-card border-border/50 hover:border-primary/30 transition-colors shadow-card-default text-foreground font-medium">
                  <Calendar className="h-4 w-4 mr-2 text-primary" />
                  <SelectValue className="text-foreground" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border/50">
                  <SelectItem value="7-days">Últimos 7 dias</SelectItem>
                  <SelectItem value="30-days">Últimos 30 dias</SelectItem>
                  <SelectItem value="60-days">Últimos 60 dias</SelectItem>
                  <SelectItem value="90-days">Últimos 90 dias</SelectItem>
                  <SelectItem value="custom">Período personalizado</SelectItem>
                </SelectContent>
              </Select>

              {/* Seletor de data personalizado */}
              {filterPeriod === 'custom' && <Popover open={showDatePicker} onOpenChange={setShowDatePicker}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className={cn("w-auto justify-start text-left font-normal shadow-card-default hover:shadow-card-hover transition-all text-foreground", !customDateRange.from && "text-muted-foreground")}>
                      <CalendarDays className="h-4 w-4 mr-2 text-primary" />
                      {customDateRange.from ? customDateRange.to ? <>
                          <span className="text-foreground">{format(customDateRange.from, "dd/MM/yyyy")} -{" "}
                          {format(customDateRange.to, "dd/MM/yyyy")}</span>
                        </> : <span className="text-foreground">{format(customDateRange.from, "dd/MM/yyyy")}</span> : <span className="text-muted-foreground">Selecionar período</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-card border-border/50 shadow-elegant" align="start">
                    <CalendarComponent initialFocus mode="range" defaultMonth={customDateRange.from} selected={{
                  from: customDateRange.from,
                  to: customDateRange.to
                }} onSelect={range => {
                  updateFilter('customDateRange', range || {});
                  if (range?.from && range?.to) {
                    setShowDatePicker(false);
                  }
                }} numberOfMonths={2} className="pointer-events-auto" />
                  </PopoverContent>
                </Popover>}

              <Button variant="outline" size="sm" onClick={handleRefresh} className="shadow-card-default hover:shadow-card-hover transition-all hover:border-primary/30">
                <RefreshCw className="h-4 w-4 mr-2 text-primary" />
                Atualizar
              </Button>
              
              <Button variant="default" size="sm" onClick={handleExport} className="bg-gradient-primary hover:scale-105 transition-all shadow-elegant">
                <Download className="h-4 w-4 mr-2" />
                Exportar PDF
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      {featureToggles.filterSection?.enabled && (
        <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <FilterSection defaultOpen />
        </div>
      )}

      {/* Métricas principais */}
      <div className="animate-fade-in" style={{
      animationDelay: '0.2s'
    }}>
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-primary">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            Indicadores Principais
          </h2>
          <p className="text-muted-foreground mt-1">Visão geral do status operacional do parque de pontos físicos</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {getOrderedItems('cards').map(item => renderCard(item.id)).filter(Boolean)}
        </div>
      </div>


      {/* Seção de Análise Visual - Grid de Gráficos */}
      <div className="space-y-8 animate-fade-in" style={{
      animationDelay: '0.3s'
    }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">Análise Visual Operacional</h2>
              <p className="text-muted-foreground">Dashboards interativos para análise detalhada dos dados</p>
            </div>
          </div>
        </div>

        {/* Charts Section - Dynamic rendering based on feature toggles */}
        <div className="space-y-8">
          {getOrderedItems('charts').map(item => renderChart(item.id)).filter(Boolean)}
        </div>
      </div>

      {/* Sections - Dynamic rendering based on feature toggles (excluding filterSection) */}
      {getOrderedItems('sections').filter(item => item.id !== 'filterSection').map(item => renderSection(item.id)).filter(Boolean)}

      {/* Dashboard Content Wrapper for PDF Export */}
      <div id="dashboard-content" className="hidden">
        {/* This content is only for PDF export - hidden from view */}
      </div>

      {/* Occurrence Details Modal */}
      <OccurrenceModal open={modalOpen} onOpenChange={setModalOpen} occurrence={selectedOccurrence} mode="view" />
    </div>;
}