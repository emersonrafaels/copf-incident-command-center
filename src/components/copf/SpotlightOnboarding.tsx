import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight, X, LayoutDashboard, List, TrendingUp, MessageSquare, Settings, Sparkles } from "lucide-react";

interface OnboardingStep {
  title: string;
  description: string;
  icon: React.ReactNode;
  targetId?: string; // data-tour-id do elemento a destacar
}

const steps: OnboardingStep[] = [
  {
    title: "Bem-vindo ao Sistema COPF",
    description: "Sistema de gestão e monitoramento de ocorrências em pontos físicos. Vamos fazer um tour rápido pelas principais funcionalidades.",
    icon: <Sparkles className="h-12 w-12 text-primary" />,
  },
  {
    title: "Dashboard Inteligente",
    description: "Visualize métricas em tempo real com KPIs essenciais: ocorrências totais, pendentes, críticas, SLA e muito mais.",
    icon: <LayoutDashboard className="h-12 w-12 text-primary" />,
    targetId: "dashboard-metrics",
  },
  {
    title: "Análises Visuais",
    description: "Gráficos interativos para análise de tendências, distribuição por fornecedor, equipamentos e aging de ocorrências.",
    icon: <TrendingUp className="h-12 w-12 text-primary" />,
    targetId: "dashboard-charts",
  },
  {
    title: "Lista de Ocorrências",
    description: "Acesse todas as ocorrências com filtros avançados, exportação para Excel, e visualização detalhada de cada registro.",
    icon: <List className="h-12 w-12 text-primary" />,
    targetId: "sidebar-occurrences",
  },
  {
    title: "Assistente com IA",
    description: "Use nosso assistente conversacional para tirar dúvidas sobre as ocorrências, obter insights e análises dos dados em tempo real.",
    icon: <MessageSquare className="h-12 w-12 text-primary" />,
    targetId: "ai-assistant-button",
  },
  {
    title: "Configurações",
    description: "Customize sua experiência ajustando a ordem dos componentes no dashboard e ativando/desativando recursos conforme sua necessidade.",
    icon: <Settings className="h-12 w-12 text-primary" />,
    targetId: "sidebar-settings",
  },
];

export const SpotlightOnboarding = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [spotlightRect, setSpotlightRect] = useState<DOMRect | null>(null);
  const [cardPosition, setCardPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem("copf-onboarding-completed");
    if (!hasSeenOnboarding) {
      // Aguardar um pouco para garantir que os elementos estejam renderizados
      setTimeout(() => setIsOpen(true), 500);
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const currentStepData = steps[currentStep];
    if (!currentStepData.targetId) {
      setSpotlightRect(null);
      return;
    }

    const updateSpotlight = () => {
      const element = document.querySelector(`[data-tour-id="${currentStepData.targetId}"]`);
      if (element) {
        const rect = element.getBoundingClientRect();
        setSpotlightRect(rect);

        // Scroll suave para o elemento
        element.scrollIntoView({ behavior: "smooth", block: "center" });

        // Calcular posição do card
        const cardWidth = 400;
        const cardHeight = 300;
        const padding = 20;
        
        let top = rect.bottom + padding;
        let left = rect.left;

        // Ajustar se sair da tela (baixo)
        if (top + cardHeight > window.innerHeight) {
          top = rect.top - cardHeight - padding;
        }

        // Ajustar se sair da tela (direita)
        if (left + cardWidth > window.innerWidth) {
          left = window.innerWidth - cardWidth - padding;
        }

        // Ajustar se sair da tela (esquerda)
        if (left < padding) {
          left = padding;
        }

        // Ajustar se sair da tela (topo)
        if (top < padding) {
          top = padding;
        }

        setCardPosition({ top, left });
      }
    };

    updateSpotlight();
    window.addEventListener("resize", updateSpotlight);
    window.addEventListener("scroll", updateSpotlight);

    return () => {
      window.removeEventListener("resize", updateSpotlight);
      window.removeEventListener("scroll", updateSpotlight);
    };
  }, [currentStep, isOpen]);

  const handleComplete = () => {
    localStorage.setItem("copf-onboarding-completed", "true");
    setIsOpen(false);
  };

  const handleSkip = () => {
    localStorage.setItem("copf-onboarding-completed", "true");
    setIsOpen(false);
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const progress = ((currentStep + 1) / steps.length) * 100;
  const isFirstStep = currentStep === 0;

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay escurecido */}
      <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 transition-opacity duration-300"
        style={{
          pointerEvents: spotlightRect ? "none" : "auto",
        }}
      />

      {/* Spotlight com recorte */}
      {spotlightRect && (
        <>
          {/* Elemento destacado com brilho */}
          <div
            className="fixed z-[51] pointer-events-none animate-pulse"
            style={{
              top: spotlightRect.top - 8,
              left: spotlightRect.left - 8,
              width: spotlightRect.width + 16,
              height: spotlightRect.height + 16,
              boxShadow: "0 0 0 4px rgba(var(--primary), 0.5), 0 0 60px 20px rgba(var(--primary), 0.3)",
              borderRadius: "12px",
              background: "transparent",
            }}
          />
          
          {/* Seta apontando para o elemento */}
          <div
            className="fixed z-[52] pointer-events-none"
            style={{
              top: cardPosition.top < spotlightRect.top 
                ? spotlightRect.top - 30 
                : spotlightRect.bottom + 10,
              left: spotlightRect.left + spotlightRect.width / 2 - 10,
            }}
          >
            <div 
              className="w-0 h-0 border-l-[10px] border-r-[10px] border-transparent animate-bounce"
              style={{
                borderTopWidth: cardPosition.top < spotlightRect.top ? "20px" : 0,
                borderBottomWidth: cardPosition.top < spotlightRect.top ? 0 : "20px",
                borderTopColor: cardPosition.top < spotlightRect.top ? "hsl(var(--primary))" : "transparent",
                borderBottomColor: cardPosition.top >= spotlightRect.top ? "hsl(var(--primary))" : "transparent",
              }}
            />
          </div>
        </>
      )}

      {/* Card de explicação */}
      <Card 
        className="fixed z-[53] w-[400px] shadow-2xl animate-scale-in border-2 border-primary"
        style={
          isFirstStep 
            ? {
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
              }
            : {
                top: `${cardPosition.top}px`,
                left: `${cardPosition.left}px`,
              }
        }
      >
        <CardHeader className="relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {steps[currentStep].icon}
              <div>
                <CardTitle className="text-xl">{steps[currentStep].title}</CardTitle>
                <CardDescription className="mt-1">
                  Etapa {currentStep + 1} de {steps.length}
                </CardDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSkip}
              className="h-8 w-8 absolute top-4 right-4"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <p className="text-muted-foreground leading-relaxed">
            {steps[currentStep].description}
          </p>

          <div className="space-y-2">
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{Math.round(progress)}% completo</span>
              <span>{steps.length - currentStep - 1} etapas restantes</span>
            </div>
          </div>

          <div className="flex justify-between gap-2 pt-2">
            <Button
              variant="outline"
              onClick={handleSkip}
              size="sm"
            >
              Pular Tour
            </Button>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 0}
                size="sm"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Anterior
              </Button>
              <Button onClick={handleNext} size="sm">
                {currentStep === steps.length - 1 ? (
                  "Começar"
                ) : (
                  <>
                    Próximo
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
};
