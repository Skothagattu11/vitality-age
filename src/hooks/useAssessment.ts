import { useState, useEffect, useCallback } from 'react';
import { AssessmentData, TOTAL_STEPS } from '@/types/assessment';

const STORAGE_KEY = 'entropy-age-assessment';

const initialData: AssessmentData = {
  userProfile: null,
  sitToStand: null,
  wallSit: null,
  balance: null,
  marchRecovery: null,
  overheadReach: null,
  crossLegged: null,
  integration: null,
  recoveryContext: null,
  currentStep: 0,
};

export function useAssessment() {
  const [data, setData] = useState<AssessmentData>(() => {
    if (typeof window === 'undefined') return initialData;
    
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return initialData;
      }
    }
    return initialData;
  });

  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('entropy-age-onboarding-seen') === 'true';
  });

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  const updateData = useCallback(<K extends keyof AssessmentData>(
    key: K,
    value: AssessmentData[K]
  ) => {
    setData(prev => ({ ...prev, [key]: value }));
  }, []);

  const goToStep = useCallback((step: number) => {
    setData(prev => ({ ...prev, currentStep: Math.max(0, Math.min(step, TOTAL_STEPS)) }));
  }, []);

  const nextStep = useCallback(() => {
    setData(prev => ({ 
      ...prev, 
      currentStep: Math.min(prev.currentStep + 1, TOTAL_STEPS) 
    }));
  }, []);

  const prevStep = useCallback(() => {
    setData(prev => ({ 
      ...prev, 
      currentStep: Math.max(prev.currentStep - 1, 0) 
    }));
  }, []);

  const reset = useCallback(() => {
    setData(initialData);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const markOnboardingSeen = useCallback(() => {
    setHasSeenOnboarding(true);
    localStorage.setItem('entropy-age-onboarding-seen', 'true');
  }, []);

  const progress = (data.currentStep / (TOTAL_STEPS - 1)) * 100;

  return {
    data,
    updateData,
    goToStep,
    nextStep,
    prevStep,
    reset,
    progress,
    hasSeenOnboarding,
    markOnboardingSeen,
  };
}
