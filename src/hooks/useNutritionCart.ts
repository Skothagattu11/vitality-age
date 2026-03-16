import { useState, useCallback, useMemo } from 'react';
import type { CartItem } from '@/types/supplementStacker';

const CART_KEY = 'entropy-age-nutrition-cart';

// Recommended Daily Values for progress bar calculation
const DAILY_VALUES: Record<string, number> = {
  'Vitamin D': 20,       // mcg
  'B12': 2.4,            // mcg
  'Calcium': 1300,       // mg
  'Zinc': 11,            // mg
  'Iron': 18,            // mg
  'Magnesium': 420,      // mg
  'Omega-3': 1100,       // mg
  'Vitamin C': 90,       // mg
  'Potassium': 2600,     // mg
  'Folate': 400,         // mcg
};

export interface NutrientTotal {
  name: string;
  totalAmount: number;
  unit: string;
  dailyValuePct: number;
}

export interface CartTotals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  nutrients: NutrientTotal[];
}

function loadCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(CART_KEY);
  if (stored) {
    try { return JSON.parse(stored); } catch { return []; }
  }
  return [];
}

export function useNutritionCart() {
  const [items, setItems] = useState<CartItem[]>(loadCart);

  const persist = (next: CartItem[]) => {
    setItems(next);
    localStorage.setItem(CART_KEY, JSON.stringify(next));
  };

  const addItem = useCallback((item: CartItem) => {
    setItems(prev => {
      const next = [...prev, item];
      localStorage.setItem(CART_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems(prev => {
      const next = prev.filter(i => i.id !== id);
      localStorage.setItem(CART_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const clearCart = useCallback(() => {
    persist([]);
  }, []);

  // Aggregate all nutrition data
  const totals = useMemo<CartTotals>(() => {
    let calories = 0, protein = 0, carbs = 0, fat = 0, fiber = 0;
    const nutrientMap: Record<string, { amount: number; unit: string }> = {};

    for (const item of items) {
      calories += item.macros.calories;
      protein += item.macros.protein;
      carbs += item.macros.carbs;
      fat += item.macros.fat;
      fiber += item.macros.fiber;

      for (const n of item.nutrients) {
        // Normalize nutrient name for aggregation
        const key = normalizeNutrientName(n.name);
        if (!nutrientMap[key]) {
          nutrientMap[key] = { amount: 0, unit: n.unit };
        }
        nutrientMap[key].amount += n.amount;
      }
    }

    const nutrients: NutrientTotal[] = Object.entries(nutrientMap).map(([name, { amount, unit }]) => {
      const dv = DAILY_VALUES[name];
      const pct = dv ? Math.round((amount / dv) * 100) : 0;
      return { name, totalAmount: Math.round(amount * 10) / 10, unit, dailyValuePct: pct };
    });

    // Sort: highest DV% first
    nutrients.sort((a, b) => b.dailyValuePct - a.dailyValuePct);

    return { calories, protein, carbs, fat, fiber, nutrients };
  }, [items]);

  // Find nutrients below 50% DV
  const gaps = useMemo(() => {
    return totals.nutrients.filter(n => n.dailyValuePct > 0 && n.dailyValuePct < 50);
  }, [totals]);

  return {
    items,
    count: items.length,
    totals,
    gaps,
    addItem,
    removeItem,
    clearCart,
  };
}

function normalizeNutrientName(name: string): string {
  const n = name.toLowerCase().trim();
  if (n.includes('vitamin d')) return 'Vitamin D';
  if (n.includes('b12') || n.includes('cobalamin')) return 'B12';
  if (n.includes('calcium')) return 'Calcium';
  if (n.includes('zinc')) return 'Zinc';
  if (n.includes('iron')) return 'Iron';
  if (n.includes('magnesium')) return 'Magnesium';
  if (n.includes('omega')) return 'Omega-3';
  if (n.includes('vitamin c') || n.includes('ascorbic')) return 'Vitamin C';
  if (n.includes('potassium')) return 'Potassium';
  if (n.includes('folate') || n.includes('folic')) return 'Folate';
  if (n.includes('vitamin k')) return 'Vitamin K';
  if (n.includes('phosphorus')) return 'Phosphorus';
  // Return cleaned-up original
  return name.split('(')[0].trim();
}
