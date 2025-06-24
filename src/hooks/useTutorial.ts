
import { useState, useEffect } from 'react';

interface UseTutorialReturn {
  isTutorialOpen: boolean;
  currentTutorialStep: string;
  startTutorial: () => void;
  closeTutorial: () => void;
  setTutorialStep: (step: string) => void;
  completeTutorialStep: (stepId: string) => void;
  shouldShowTutorial: boolean;
}

export const useTutorial = (): UseTutorialReturn => {
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [currentTutorialStep, setCurrentTutorialStep] = useState('welcome');
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [hasSeenTutorial, setHasSeenTutorial] = useState(false);

  useEffect(() => {
    // Check if user has seen tutorial before
    const seen = localStorage.getItem('photospace-tutorial-seen');
    if (!seen) {
      setHasSeenTutorial(false);
      // Auto-start tutorial for new users after a short delay
      setTimeout(() => {
        setIsTutorialOpen(true);
      }, 1000);
    } else {
      setHasSeenTutorial(true);
    }
  }, []);

  const startTutorial = () => {
    setIsTutorialOpen(true);
    setCurrentTutorialStep('welcome');
    setCompletedSteps([]);
  };

  const closeTutorial = () => {
    setIsTutorialOpen(false);
    localStorage.setItem('photospace-tutorial-seen', 'true');
    setHasSeenTutorial(true);
  };

  const setTutorialStep = (step: string) => {
    setCurrentTutorialStep(step);
  };

  const completeTutorialStep = (stepId: string) => {
    setCompletedSteps(prev => [...prev, stepId]);
  };

  return {
    isTutorialOpen,
    currentTutorialStep,
    startTutorial,
    closeTutorial,
    setTutorialStep,
    completeTutorialStep,
    shouldShowTutorial: !hasSeenTutorial
  };
};
