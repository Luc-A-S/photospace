
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { X, ArrowRight, ArrowLeft, Play, Lightbulb } from 'lucide-react';

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  target: string;
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: string;
}

interface TutorialProps {
  isOpen: boolean;
  onClose: () => void;
  currentStep: string;
  onStepComplete: (stepId: string) => void;
}

const tutorialSteps: TutorialStep[] = [
  {
    id: 'welcome',
    title: 'Bem-vindo ao PhotoSpace! 👋',
    description: 'Vamos te guiar através do processo de criação de fotos profissionais em poucos passos simples.',
    target: '',
    position: 'center'
  },
  {
    id: 'photoType',
    title: 'Escolha o Tipo de Foto',
    description: 'Primeiro, selecione o formato desejado para suas fotos (3x4, 5x7, etc.)',
    target: 'photo-type-selector',
    position: 'bottom'
  },
  {
    id: 'upload',
    title: 'Faça Upload das Imagens',
    description: 'Clique no botão para selecionar múltiplas imagens do seu dispositivo.',
    target: 'upload-button',
    position: 'bottom'
  },
  {
    id: 'edit',
    title: 'Edite e Ajuste',
    description: 'Ajuste cada imagem individualmente - posição, zoom e recorte.',
    target: 'edit-button',
    position: 'top'
  },
  {
    id: 'background',
    title: 'Remova o Fundo',
    description: 'Use ferramentas profissionais para remover o fundo das suas fotos.',
    target: 'background-removal',
    position: 'top'
  },
  {
    id: 'quantity',
    title: 'Defina Quantidades',
    description: 'Escolha quantas cópias de cada foto você quer no PDF final.',
    target: 'quantity-selector',
    position: 'top'
  },
  {
    id: 'generate',
    title: 'Gere o PDF',
    description: 'Finalize clicando em "Gerar PDF" para criar seu documento pronto para impressão!',
    target: 'generate-button',
    position: 'top'
  }
];

const Tutorial: React.FC<TutorialProps> = ({ isOpen, onClose, currentStep, onStepComplete }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  const currentTutorialStep = tutorialSteps[currentStepIndex];

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      // Auto-advance based on current app step
      const stepIndex = tutorialSteps.findIndex(step => step.id === currentStep);
      if (stepIndex !== -1 && stepIndex !== currentStepIndex) {
        setCurrentStepIndex(stepIndex);
      }
    }
  }, [isOpen, currentStep, currentStepIndex]);

  const nextStep = () => {
    if (currentStepIndex < tutorialSteps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
      onStepComplete(currentTutorialStep.id);
    } else {
      onClose();
    }
  };

  const prevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const skipTutorial = () => {
    onClose();
  };

  if (!isOpen || !isVisible) return null;

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none">
      {/* Overlay with spotlight effect */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto">
        {currentTutorialStep.target && (
          <div className="tutorial-spotlight" data-target={currentTutorialStep.target} />
        )}
      </div>

      {/* Tutorial card */}
      <div className={`absolute pointer-events-auto transition-all duration-500 ${
        currentTutorialStep.position === 'center' 
          ? 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'
          : 'top-20 right-6'
      }`}>
        <Card className="bg-gradient-to-br from-purple-900/95 to-blue-900/95 backdrop-blur-xl border-purple-400/50 p-6 max-w-sm shadow-2xl animate-scale-in">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-r from-purple-500 to-blue-500 rounded-full p-2">
                <Lightbulb className="h-4 w-4 text-white" />
              </div>
              <span className="text-xs text-purple-300 font-medium">
                Passo {currentStepIndex + 1} de {tutorialSteps.length}
              </span>
            </div>
            <Button
              onClick={onClose}
              size="sm"
              className="bg-transparent hover:bg-white/10 text-white p-1 h-6 w-6"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>

          <h3 className="text-lg font-semibold text-white mb-2">
            {currentTutorialStep.title}
          </h3>
          
          <p className="text-gray-300 text-sm mb-4 leading-relaxed">
            {currentTutorialStep.description}
          </p>

          {/* Progress bar */}
          <div className="mb-4">
            <div className="bg-gray-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentStepIndex + 1) / tutorialSteps.length) * 100}%` }}
              />
            </div>
          </div>

          <div className="flex justify-between items-center">
            <Button
              onClick={skipTutorial}
              size="sm"
              className="bg-transparent hover:bg-white/10 text-gray-300 text-xs"
            >
              Pular Tutorial
            </Button>

            <div className="flex gap-2">
              {currentStepIndex > 0 && (
                <Button
                  onClick={prevStep}
                  size="sm"
                  className="bg-gray-600 hover:bg-gray-700 text-white"
                >
                  <ArrowLeft className="h-3 w-3 mr-1" />
                  Anterior
                </Button>
              )}
              
              <Button
                onClick={nextStep}
                size="sm"
                className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white"
              >
                {currentStepIndex === tutorialSteps.length - 1 ? 'Finalizar' : 'Próximo'}
                {currentStepIndex < tutorialSteps.length - 1 && <ArrowRight className="h-3 w-3 ml-1" />}
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Animated pointer for specific targets */}
      {currentTutorialStep.target && (
        <div className="tutorial-pointer" data-target={currentTutorialStep.target}>
          <div className="animate-bounce">
            <div className="bg-gradient-to-r from-purple-500 to-blue-500 rounded-full p-2 shadow-lg">
              <Play className="h-3 w-3 text-white" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tutorial;
