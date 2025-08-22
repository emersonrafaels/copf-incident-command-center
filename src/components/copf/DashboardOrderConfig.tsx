import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { GripVertical, RotateCcw, Eye, EyeOff, ArrowUp, ArrowDown } from 'lucide-react';
import { useFeatureToggle, FeatureToggle, DashboardOrder } from '@/contexts/FeatureToggleContext';
import { cn } from '@/lib/utils';

interface CategoryConfig {
  key: keyof DashboardOrder;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const categories: CategoryConfig[] = [
  {
    key: 'cards',
    title: 'Cards dos Indicadores',
    description: 'Métricas principais do dashboard',
    icon: <Eye className="h-4 w-4" />
  },
  {
    key: 'charts',
    title: 'Gráficos e Análises',
    description: 'Visualizações e relatórios gráficos',
    icon: <Eye className="h-4 w-4" />
  },
  {
    key: 'sections',
    title: 'Seções Especiais',
    description: 'Filtros e highlights operacionais',
    icon: <Eye className="h-4 w-4" />
  }
];

export const DashboardOrderConfig: React.FC = () => {
  const { featureToggles, dashboardOrder, updateToggle, reorderItems, resetToDefaults, getOrderedItems } = useFeatureToggle();
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  const handleDragEnd = (result: DropResult) => {
    setDraggedItem(null);
    
    if (!result.destination) return;

    const { source, destination, type } = result;
    
    if (source.index === destination.index) return;

    const category = type as keyof DashboardOrder;
    const items = [...dashboardOrder[category]];
    const [reorderedItem] = items.splice(source.index, 1);
    items.splice(destination.index, 0, reorderedItem);

    reorderItems(category, items);
  };

  const handleDragStart = (result: any) => {
    setDraggedItem(result.draggableId);
  };

  const moveItem = (category: keyof DashboardOrder, itemId: string, direction: 'up' | 'down') => {
    const items = [...dashboardOrder[category]];
    const currentIndex = items.indexOf(itemId);
    
    if (direction === 'up' && currentIndex > 0) {
      [items[currentIndex], items[currentIndex - 1]] = [items[currentIndex - 1], items[currentIndex]];
    } else if (direction === 'down' && currentIndex < items.length - 1) {
      [items[currentIndex], items[currentIndex + 1]] = [items[currentIndex + 1], items[currentIndex]];
    }
    
    reorderItems(category, items);
  };

  const getActiveCount = (category: keyof DashboardOrder) => {
    return dashboardOrder[category].filter(id => featureToggles[id]?.enabled).length;
  };

  const getTotalCount = (category: keyof DashboardOrder) => {
    return dashboardOrder[category].length;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Configuração do Dashboard</h3>
          <p className="text-sm text-muted-foreground">
            Personalize quais componentes aparecem e em que ordem
          </p>
        </div>
        <Button
          variant="outline"
          onClick={resetToDefaults}
          className="flex items-center gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          Restaurar Padrões
        </Button>
      </div>

      <Accordion type="multiple" defaultValue={['cards', 'charts', 'sections']} className="space-y-4">
        {categories.map((category) => (
          <AccordionItem key={category.key} value={category.key} className="border rounded-lg">
            <AccordionTrigger className="px-4 py-3 hover:no-underline">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                  {category.icon}
                  <div className="text-left">
                    <div className="font-medium">{category.title}</div>
                    <div className="text-sm text-muted-foreground">{category.description}</div>
                  </div>
                </div>
                <Badge variant="secondary" className="mr-2">
                  {getActiveCount(category.key)} de {getTotalCount(category.key)} ativos
                </Badge>
              </div>
            </AccordionTrigger>
            
            <AccordionContent className="px-4 pb-4">
              <DragDropContext onDragEnd={handleDragEnd} onDragStart={handleDragStart}>
                <Droppable droppableId={category.key} type={category.key}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={cn(
                        "space-y-2 p-2 rounded-md border-2 border-dashed transition-colors",
                        snapshot.isDraggingOver ? "border-primary bg-primary/5" : "border-border bg-muted/20"
                      )}
                    >
                      {dashboardOrder[category.key].map((itemId, index) => {
                        const item = featureToggles[itemId];
                        if (!item) return null;

                        return (
                          <Draggable key={itemId} draggableId={itemId} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className={cn(
                                  "flex items-center justify-between p-3 rounded-md border bg-card transition-all duration-200",
                                  snapshot.isDragging 
                                    ? "shadow-lg scale-105 rotate-2 z-50" 
                                    : "shadow-sm hover:shadow-md",
                                  !item.enabled && "opacity-60"
                                )}
                              >
                                <div className="flex items-center gap-3 flex-1">
                                  <div
                                    {...provided.dragHandleProps}
                                    className="p-1 rounded hover:bg-muted cursor-grab active:cursor-grabbing"
                                  >
                                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                                  </div>

                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium text-sm">{item.label}</span>
                                      {item.enabled ? (
                                        <Eye className="h-3 w-3 text-success" />
                                      ) : (
                                        <EyeOff className="h-3 w-3 text-muted-foreground" />
                                      )}
                                    </div>
                                    <p className="text-xs text-muted-foreground">{item.description}</p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2">
                                  <div className="flex flex-col gap-1">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 w-6 p-0"
                                      onClick={() => moveItem(category.key, itemId, 'up')}
                                      disabled={index === 0}
                                    >
                                      <ArrowUp className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 w-6 p-0"
                                      onClick={() => moveItem(category.key, itemId, 'down')}
                                      disabled={index === dashboardOrder[category.key].length - 1}
                                    >
                                      <ArrowDown className="h-3 w-3" />
                                    </Button>
                                  </div>
                                  
                                  <Switch
                                    checked={item.enabled}
                                    onCheckedChange={(checked) => updateToggle(itemId, checked)}
                                  />
                                </div>
                              </div>
                            )}
                          </Draggable>
                        );
                      })}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <div className="bg-muted/50 p-4 rounded-lg">
        <p className="text-sm text-muted-foreground">
          <strong>Dica:</strong> Arraste os itens para reordená-los ou use as setas. As alterações são salvas automaticamente.
        </p>
      </div>
    </div>
  );
};