import { useState, useEffect, useCallback, useMemo } from 'react';
import type { CartItem } from '@/types/supplementStacker';
import { supabase } from '@/integrations/supabase/client';

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

function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function useNutritionPlans() {
  // Always start empty — restored only for authenticated users
  const [plans, setPlans] = useState<Record<string, NutritionPlan>>({});
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // On mount: restore from localStorage only if authenticated, wipe if guest
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        localStorage.removeItem(PLANS_KEY);
        return;
      }
      setIsAuthenticated(true);
      const stored = localStorage.getItem(PLANS_KEY);
      if (stored) {
        try { setPlans(JSON.parse(stored)); } catch { /* ignore */ }
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
      if (event === 'SIGNED_OUT') {
        localStorage.removeItem(PLANS_KEY);
        setPlans({});
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const persist = (next: Record<string, NutritionPlan>) => {
    setPlans(next);
    if (isAuthenticated) {
      localStorage.setItem(PLANS_KEY, JSON.stringify(next));
    }
  };

  const savePlan = useCallback((items: CartItem[], totals: { calories: number; protein: number; carbs: number; fat: number; fiber: number }) => {
    const dateKey = toDateKey(new Date());
    setPlans(prev => {
      const next = {
        ...prev,
        [dateKey]: { date: dateKey, items, totals, savedAt: Date.now() },
      };
      if (isAuthenticated) localStorage.setItem(PLANS_KEY, JSON.stringify(next));
      return next;
    });
    return dateKey;
  }, [isAuthenticated]);

  const getPlan = useCallback((date: Date): NutritionPlan | null => {
    const key = toDateKey(date);
    return plans[key] || null;
  }, [plans]);

  const deletePlan = useCallback((date: Date) => {
    const key = toDateKey(date);
    setPlans(prev => {
      const next = { ...prev };
      delete next[key];
      if (isAuthenticated) localStorage.setItem(PLANS_KEY, JSON.stringify(next));
      return next;
    });
  }, [isAuthenticated]);

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
