
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { X, ArrowRight, ArrowLeft, HelpCircle } from 'lucide-react';

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  targetSelector: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  arrow?: 'up' | 'down' | 'left' | 'right';
}

interface TutorialOverlayProps {
  isActive: boolean;
  onClose: () => void;
  currentStep: string;
}

const tutorialSteps: TutorialStep[] = [
  {
    id: 'welcome',
    title: 'Bem-vindo ao PhotoSpace! 🚀',
    description: 'Vou te guiar através do processo completo para criar suas fotos profissionais. Vamos começar!',
    targetSelector: 'h1',
    position: 'bottom',
    arrow: 'down'
  },
  {
    id: 'photoType',
    title: 'Escolha o Tipo de Foto',
    description: 'Primeiro, selecione o formato da foto que você deseja criar (3x4, 5x7, etc.)',
    targetSelector: '[data-tutorial="photo-types"]',
    position: 'top',
    arrow: 'up'
  },
  {
    id: 'upload',
    title: 'Faça Upload das Imagens',
    description: 'Clique em "Selecionar Imagens" ou use "Colar Imagem" para adicionar suas fotos.',
    targetSelector: '[data-tutorial="upload-button"]',
    position: 'bottom',
    arrow: 'down'
  },
  {
    id: 'edit',
    title: 'Ajuste suas Imagens',
    description: 'Após o upload, você poderá recortar e ajustar cada imagem individualmente.',
    targetSelector: '[data-tutorial="edit-button"]',
    position: 'top',
    arrow: 'up'
  },
  {
    id: 'background',
    title: 'Remova o Fundo',
    description: 'Faça upload das versões sem fundo das suas imagens para um resultado profissional.',
    targetSelector: '[data-tutorial="background-step"]',
    position: 'bottom',
    arrow: 'down'
  },
  {
    id: 'quantity',
    title: 'Defina as Quantidades',
    description: 'Escolha quantas cópias de cada foto você quer no documento final.',
    targetSelector: '[data-tutorial="quantity-step"]',
    position: 'top',
    arrow: 'up'
  },
  {
    id: 'generate',
    title: 'Gere o PDF',
    description: 'Clique em "Gerar PDF" para criar seu documento com contornos para recorte.',
    targetSelector: '[data-tutorial="generate-button"]',
    position: 'top',
    arrow: 'up'
  }
];

const TutorialOverlay: React.FC<TutorialOverlayProps> = ({ isActive, onClose, currentStep }) => {
  const [currentTutorialStep, setCurrentTutorialStep] = useState(0);
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);

  const getCurrentStep = () => tutorialSteps[currentTutorialStep];

  useEffect(() => {
    if (!isActive) return;

    const findTargetElement = () => {
      const step = getCurrentStep();
      const element = document.querySelector(step.targetSelector) as HTMLElement;
      setTargetElement(element);
    };

    findTargetElement();
    const interval = setInterval(findTargetElement, 500);

    return () => clearInterval(interval);
  }, [isActive, currentTutorialStep]);

  useEffect(() => {
    if (!isActive || !targetElement) return;

    targetElement.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'center' 
    });

    // Adiciona destaque ao elemento
    targetElement.style.position = 'relative';
    targetElement.style.zIndex = '1001';
    targetElement.style.boxShadow = '0 0 0 4px rgba(147, 51, 234, 0.5), 0 0 20px rgba(147, 51, 234, 0.3)';
    targetElement.style.borderRadius = '8px';
    targetElement.style.transition = 'all 0.3s ease';

    return () => {
      if (targetElement) {
        targetElement.style.position = '';
        targetElement.style.zIndex = '';
        targetElement.style.boxShadow = '';
        targetElement.style.borderRadius = '';
      }
    };
  }, [targetElement, isActive]);

  const nextStep = () => {
    if (currentTutorialStep < tutorialSteps.length - 1) {
      setCurrentTutorialStep(currentTutorialStep + 1);
    } else {
      onClose();
    }
  };

  const prevStep = () => {
    if (currentTutorialStep > 0) {
      setCurrentTutorialStep(currentTutorialStep - 1);
    }
  };

  const getTooltipPosition = () => {
    if (!targetElement) return { top: '50%', left: '50%' };

    const rect = targetElement.getBoundingClientRect();
    const step = getCurrentStep();

    switch (step.position) {
      case 'top':
        return {
          top: `${rect.top - 20}px`,
          left: `${rect.left + rect.width / 2}px`,
          transform: 'translate(-50%, -100%)'
        };
      case 'bottom':
        return {
          top: `${rect.bottom + 20}px`,
          left: `${rect.left + rect.width / 2}px`,
          transform: 'translate(-50%, 0)'
        };
      case 'left':
        return {
          top: `${rect.top + rect.height / 2}px`,
          left: `${rect.left - 20}px`,
          transform: 'translate(-100%, -50%)'
        };
      case 'right':
        return {
          top: `${rect.top + rect.height / 2}px`,
          left: `${rect.right + 20}px`,
          transform: 'translate(0, -50%)'
        };
      default:
        return {
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)'
        };
    }
  };

  const getArrowStyle = () => {
    const step = getCurrentStep();
    const baseArrow = 'absolute w-0 h-0 border-solid';

    switch (step.arrow) {
      case 'up':
        return `${baseArrow} border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent border-b-slate-800 -top-2 left-1/2 transform -translate-x-1/2`;
      case 'down':
        return `${baseArrow} border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-slate-800 -bottom-2 left-1/2 transform -translate-x-1/2`;
      case 'left':
        return `${baseArrow} border-t-8 border-b-8 border-r-8 border-t-transparent border-b-transparent border-r-slate-800 -left-2 top-1/2 transform -translate-y-1/2`;
      case 'right':
        return `${baseArrow} border-t-8 border-b-8 border-l-8 border-t-transparent border-b-transparent border-l-slate-800 -right-2 top-1/2 transform -translate-y-1/2`;
      default:
        return '';
    }
  };

  if (!isActive || !targetElement) return null;

  const step = getCurrentStep();

  return (
    <>
      {/* Overlay escuro */}
      <div className="fixed inset-0 bg-black/60 z-1000 pointer-events-auto" />
      
      {/* Tooltip do tutorial */}
      <div
        className="fixed z-1002 pointer-events-auto"
        style={getTooltipPosition()}
      >
        <Card className="bg-slate-800 text-white p-4 max-w-sm shadow-2xl border border-purple-500/30 relative">
          {step.arrow && <div className={getArrowStyle()} />}
          
          <div className="flex items-start justify-between mb-3">
            <h3 className="font-semibold text-lg">{step.title}</h3>
            <Button
              onClick={onClose}
              size="sm"
              className="p-1 h-auto bg-transparent hover:bg-slate-700 text-gray-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <p className="text-gray-300 mb-4 text-sm leading-relaxed">
            {step.description}
          </p>
          
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-400">
              {currentTutorialStep + 1} de {tutorialSteps.length}
            </div>
            
            <div className="flex gap-2">
              {currentTutorialStep > 0 && (
                <Button
                  onClick={prevStep}
                  size="sm"
                  className="bg-slate-700 hover:bg-slate-600 text-white"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Anterior
                </Button>
              )}
              
              <Button
                onClick={nextStep}
                size="sm"
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                {currentTutorialStep === tutorialSteps.length - 1 ? 'Finalizar' : 'Próximo'}
                {currentTutorialStep < tutorialSteps.length - 1 && (
                  <ArrowRight className="h-4 w-4 ml-1" />
                )}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
};

export default TutorialOverlay;
