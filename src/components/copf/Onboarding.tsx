import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X, LayoutDashboard, List, TrendingUp, MessageSquare, Settings } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface OnboardingStep {
  title: string;
  description: string;
  icon: React.ReactNode;
  image?: string;
}

const steps: OnboardingStep[] = [
  {
    title: "Bem-vindo ao Sistema COPF",
    description: "Sistema de gestão e monitoramento de ocorrências em pontos físicos. Vamos fazer um tour rápido pelas principais funcionalidades.",
    icon: <LayoutDashboard className="h-12 w-12 text-primary" />,
  },
  {
    title: "Dashboard Inteligente",
    description: "Visualize métricas em tempo real, indicadores de SLA, análises por fornecedor e equipamento. Todos os dados filtráveis por período personalizado.",
    icon: <TrendingUp className="h-12 w-12 text-primary" />,
  },
  {
    title: "Lista de Ocorrências",
    description: "Acesse todas as ocorrências com filtros avançados, exportação para Excel, e visualização detalhada de cada registro.",
    icon: <List className="h-12 w-12 text-primary" />,
  },
  {
    title: "Assistente Conversacional",
    description: "Use nosso assistente com IA para tirar dúvidas sobre as ocorrências, obter insights e análises dos dados em tempo real.",
    icon: <MessageSquare className="h-12 w-12 text-primary" />,
  },
  {
    title: "Configurações Personalizáveis",
    description: "Customize sua experiência ajustando a ordem dos componentes no dashboard e ativando/desativando recursos conforme sua necessidade.",
    icon: <Settings className="h-12 w-12 text-primary" />,
  },
];

export const Onboarding = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem("copf-onboarding-completed");
    if (!hasSeenOnboarding) {
      setIsOpen(true);
    }
  }, []);

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

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl">{steps[currentStep].title}</DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSkip}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-6">
          <div className="flex justify-center">
            {steps[currentStep].icon}
          </div>

          <div className="text-center space-y-2">
            <p className="text-muted-foreground text-lg">
              {steps[currentStep].description}
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Etapa {currentStep + 1} de {steps.length}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>

        <DialogFooter className="flex justify-between sm:justify-between">
          <Button
            variant="outline"
            onClick={handleSkip}
          >
            Pular Tour
          </Button>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Anterior
            </Button>
            <Button onClick={handleNext}>
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
