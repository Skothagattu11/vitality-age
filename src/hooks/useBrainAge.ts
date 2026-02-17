import { useState, useEffect, useCallback } from 'react';
import { BrainAgeData, BRAIN_AGE_TOTAL_STEPS } from '@/types/brainAge';

const STORAGE_KEY = 'entropy-brain-age';

const initialData: BrainAgeData = {
  profile: null,
  lightningTap: null,
  colorClash: null,
  memoryMatrix: null,
  focusFilter: null,
  trailSwitch: null,
  currentStep: 0,
};

export function useBrainAge() {
  const [data, setData] = useState<BrainAgeData>(() => {
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

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  const updateData = useCallback(<K extends keyof BrainAgeData>(
    key: K,
    value: BrainAgeData[K]
  ) => {
    setData(prev => ({ ...prev, [key]: value }));
  }, []);

  const goToStep = useCallback((step: number) => {
    setData(prev => ({
      ...prev,
      currentStep: Math.max(0, Math.min(step, BRAIN_AGE_TOTAL_STEPS)),
    }));
  }, []);

  const nextStep = useCallback(() => {
    setData(prev => ({
      ...prev,
      currentStep: Math.min(prev.currentStep + 1, BRAIN_AGE_TOTAL_STEPS),
    }));
  }, []);

  const prevStep = useCallback(() => {
    setData(prev => ({
      ...prev,
      currentStep: Math.max(prev.currentStep - 1, 0),
    }));
  }, []);

  const reset = useCallback(() => {
    setData(initialData);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const progress = (data.currentStep / (BRAIN_AGE_TOTAL_STEPS - 1)) * 100;

  return {
    data,
    updateData,
    goToStep,
    nextStep,
    prevStep,
    reset,
    progress,
  };
}
