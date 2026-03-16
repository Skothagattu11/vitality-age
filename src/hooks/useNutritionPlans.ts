import { useState, useCallback, useMemo } from 'react';
import type { CartItem } from '@/types/supplementStacker';

const PLANS_KEY = 'entropy-age-nutrition-plans';

export interface NutritionPlan {
  date: string; // YYYY-MM-DD
  items: CartItem[];
  totals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
  savedAt: number;
}

function loadPlans(): Record<string, NutritionPlan> {
  if (typeof window === 'undefined') return {};
  const stored = localStorage.getItem(PLANS_KEY);
  if (stored) {
    try { return JSON.parse(stored); } catch { return {}; }
  }
  return {};
}

function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function useNutritionPlans() {
  const [plans, setPlans] = useState<Record<string, NutritionPlan>>(loadPlans);

  const persist = (next: Record<string, NutritionPlan>) => {
    setPlans(next);
    localStorage.setItem(PLANS_KEY, JSON.stringify(next));
  };

  const savePlan = useCallback((items: CartItem[], totals: { calories: number; protein: number; carbs: number; fat: number; fiber: number }) => {
    const dateKey = toDateKey(new Date());
    setPlans(prev => {
      const next = {
        ...prev,
        [dateKey]: { date: dateKey, items, totals, savedAt: Date.now() },
      };
      localStorage.setItem(PLANS_KEY, JSON.stringify(next));
      return next;
    });
    return dateKey;
  }, []);

  const getPlan = useCallback((date: Date): NutritionPlan | null => {
    const key = toDateKey(date);
    return plans[key] || null;
  }, [plans]);

  const deletePlan = useCallback((date: Date) => {
    const key = toDateKey(date);
    setPlans(prev => {
      const next = { ...prev };
      delete next[key];
      localStorage.setItem(PLANS_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  // Get all dates that have plans, sorted newest first
  const planDates = useMemo(() => {
    return Object.keys(plans).sort((a, b) => b.localeCompare(a));
  }, [plans]);

  const hasPlanForToday = useMemo(() => {
    return !!plans[toDateKey(new Date())];
  }, [plans]);

  // Hydrate plans from remote (Supabase) data on login
  const hydratePlans = useCallback((remotePlans: Record<string, NutritionPlan>) => {
    if (Object.keys(remotePlans).length > 0) {
      persist(remotePlans);
    }
  }, []);

  return {
    plans,
    savePlan,
    getPlan,
    deletePlan,
    planDates,
    hasPlanForToday,
    hydratePlans,
    toDateKey,
  };
}
