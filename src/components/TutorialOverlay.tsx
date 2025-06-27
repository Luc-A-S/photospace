
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { X, ArrowRight, ArrowLeft } from 'lucide-react';

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  target?: string;
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: () => void;
}

interface TutorialOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  currentStep: string;
  onStepChange: (step: string) => void;
}

const tutorialSteps: TutorialStep[] = [
  {
    id: 'welcome',
    title: 'Bem-vindo ao PhotoSpace!',
    description: 'Vou te guiar através do processo de criação de fotos profissionais. Vamos começar!',
    position: 'center'
  },
  {
    id: 'photoType',
    title: 'Escolha o Tipo de Foto',
    description: 'Primeiro, selecione o tamanho da foto que você deseja criar (3x4, 5x7, etc.).',
    target: 'photo-type-selector',
    position: 'bottom'
  },
  {
    id: 'upload',
    title: 'Faça Upload das Imagens',
    description: 'Clique em "Selecionar Imagens" para adicionar suas fotos ou use "Colar Imagem" para colar da área de transferência.',
    target: 'upload-section',
    position: 'top'
  },
  {
    id: 'edit',
    title: 'Edite suas Imagens',
    description: 'Ajuste o enquadramento, rotação e outros aspectos de cada imagem para que fiquem perfeitas.',
    target: 'edit-section',
    position: 'top'
  },
  {
    id: 'background',
    title: 'Remova o Fundo',
    description: 'Faça upload das imagens sem fundo ou use ferramentas externas para remover o fundo.',
    target: 'background-section',
    position: 'top'
  },
  {
    id: 'quantity',
    title: 'Escolha a Quantidade',
    description: 'Defina quantas cópias de cada foto você deseja no documento final.',
    target: 'quantity-section',
    position: 'top'
  },
  {
    id: 'download',
    title: 'Baixe seu PDF',
    description: 'Pronto! Agora você pode baixar seu PDF com todas as fotos organizadas e prontas para impressão.',
    target: 'download-section',
    position: 'top'
  }
];

const TutorialOverlay: React.FC<TutorialOverlayProps> = ({
  isOpen,
  onClose,
  currentStep,
  onStepChange
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [highlightedElement, setHighlightedElement] = useState<HTMLElement | null>(null);

  const currentTutorialStep = tutorialSteps[currentStepIndex];

  useEffect(() => {
    if (isOpen && currentTutorialStep?.target) {
      const element = document.querySelector(`[data-tutorial="${currentTutorialStep.target}"]`) as HTMLElement;
      if (element) {
        setHighlightedElement(element);
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } else {
      setHighlightedElement(null);
    }
  }, [isOpen, currentStepIndex, currentTutorialStep]);

  useEffect(() => {
    if (highlightedElement) {
      highlightedElement.style.position = 'relative';
      highlightedElement.style.zIndex = '1001';
      highlightedElement.style.outline = '3px solid #3b82f6';
      highlightedElement.style.outlineOffset = '4px';
      highlightedElement.style.borderRadius = '8px';

      return () => {
        highlightedElement.style.position = '';
        highlightedElement.style.zIndex = '';
        highlightedElement.style.outline = '';
        highlightedElement.style.outlineOffset = '';
        highlightedElement.style.borderRadius = '';
      };
    }
  }, [highlightedElement]);

  const nextStep = () => {
    if (currentStepIndex < tutorialSteps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      onClose();
    }
  };

  const prevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const skipTutorial = () => {
    onClose();
  };

  if (!isOpen) return null;

  const getTooltipPosition = () => {
    if (!highlightedElement || currentTutorialStep.position === 'center') {
      return {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)'
      };
    }

    const rect = highlightedElement.getBoundingClientRect();
    const tooltipWidth = 350;
    const tooltipHeight = 200;

    switch (currentTutorialStep.position) {
      case 'top':
        return {
          top: rect.top - tooltipHeight - 20,
          left: rect.left + (rect.width / 2) - (tooltipWidth / 2),
        };
      case 'bottom':
        return {
          top: rect.bottom + 20,
          left: rect.left + (rect.width / 2) - (tooltipWidth / 2),
        };
      case 'left':
        return {
          top: rect.top + (rect.height / 2) - (tooltipHeight / 2),
          left: rect.left - tooltipWidth - 20,
        };
      case 'right':
        return {
          top: rect.top + (rect.height / 2) - (tooltipHeight / 2),
          left: rect.right + 20,
        };
      default:
        return {
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)'
        };
    }
  };

  return (
    <>
      {/* Overlay escuro */}
      <div 
        className="fixed inset-0 bg-black/50 z-1000"
        onClick={onClose}
      />
      
      {/* Tooltip do tutorial */}
      <Card 
        className="fixed z-1001 w-80 sm:w-96 bg-white border-2 border-blue-500 shadow-2xl p-6"
        style={getTooltipPosition()}
      >
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              {currentTutorialStep.title}
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              {currentTutorialStep.description}
            </p>
          </div>
          <Button
            onClick={onClose}
            size="sm"
            variant="ghost"
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-500">
            Passo {currentStepIndex + 1} de {tutorialSteps.length}
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={skipTutorial}
              size="sm"
              variant="ghost"
              className="text-gray-500 hover:text-gray-700"
            >
              Pular Tutorial
            </Button>
            
            {currentStepIndex > 0 && (
              <Button
                onClick={prevStep}
                size="sm"
                variant="outline"
                className="text-gray-600"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Anterior
              </Button>
            )}
            
            <Button
              onClick={nextStep}
              size="sm"
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              {currentStepIndex === tutorialSteps.length - 1 ? 'Finalizar' : 'Próximo'}
              {currentStepIndex < tutorialSteps.length - 1 && (
                <ArrowRight className="h-4 w-4 ml-1" />
              )}
            </Button>
          </div>
        </div>
      </Card>
    </>
  );
};

export default TutorialOverlay;
