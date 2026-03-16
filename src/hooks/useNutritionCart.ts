import { useState, useCallback, useMemo } from 'react';
import type { CartItem } from '@/types/supplementStacker';

const CART_KEY = 'entropy-age-nutrition-cart';

// FDA Recommended Daily Values for % DV calculation
const DAILY_VALUES: Record<string, number> = {
  'Vitamin A': 900,       // mcg RAE
  'Vitamin C': 90,        // mg
  'Vitamin D': 20,        // mcg
  'Vitamin E': 15,        // mg
  'Vitamin K': 120,       // mcg
  'Vitamin B6': 1.7,      // mg
  'B12': 2.4,             // mcg
  'Thiamin': 1.2,         // mg
  'Riboflavin': 1.3,      // mg
  'Niacin': 16,           // mg
  'Folate': 400,          // mcg DFE
  'Biotin': 30,           // mcg
  'Pantothenic Acid': 5,  // mg
  'Calcium': 1300,        // mg
  'Iron': 18,             // mg
  'Magnesium': 420,       // mg
  'Zinc': 11,             // mg
  'Selenium': 55,         // mcg
  'Copper': 0.9,          // mg
  'Manganese': 2.3,       // mg
  'Chromium': 35,         // mcg
  'Molybdenum': 45,       // mcg
  'Potassium': 2600,      // mg
  'Sodium': 2300,         // mg
  'Phosphorus': 1250,     // mg
  'Iodine': 150,          // mcg
  'Choline': 550,         // mg
  'Omega-3': 1100,        // mg (ALA)
  'Boron': 150,           // mcg (no official DV, using common reference)
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

    // Sort: nutrients with DV% first (highest first), then others alphabetically
    nutrients.sort((a, b) => {
      if (a.dailyValuePct > 0 && b.dailyValuePct === 0) return -1;
      if (a.dailyValuePct === 0 && b.dailyValuePct > 0) return 1;
      if (a.dailyValuePct !== b.dailyValuePct) return b.dailyValuePct - a.dailyValuePct;
      return a.name.localeCompare(b.name);
    });

    return {
      calories: Math.round(calories),
      protein: Math.round(protein * 10) / 10,
      carbs: Math.round(carbs * 10) / 10,
      fat: Math.round(fat * 10) / 10,
      fiber: Math.round(fiber * 10) / 10,
      nutrients,
    };
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
  // Vitamins
  if (n.includes('vitamin a') || n === 'retinol' || n.includes('beta-carotene') || n.includes('beta carotene')) return 'Vitamin A';
  if (n.includes('vitamin c') || n.includes('ascorbic')) return 'Vitamin C';
  if (n.includes('vitamin d')) return 'Vitamin D';
  if (n.includes('vitamin e') || n.includes('tocopherol')) return 'Vitamin E';
  if (n.includes('vitamin k') || n.includes('phylloquinone') || n.includes('menaquinone')) return 'Vitamin K';
  if (n.includes('b12') || n.includes('cobalamin') || n.includes('cyanocobalamin')) return 'B12';
  if (n.includes('b6') || n.includes('pyridoxine')) return 'Vitamin B6';
  if (n.includes('thiamin') || n.includes('vitamin b1') || n === 'b1') return 'Thiamin';
  if (n.includes('riboflavin') || n.includes('vitamin b2') || n === 'b2') return 'Riboflavin';
  if (n.includes('niacin') || n.includes('vitamin b3') || n === 'b3') return 'Niacin';
  if (n.includes('folate') || n.includes('folic')) return 'Folate';
  if (n.includes('biotin') || n.includes('vitamin b7') || n === 'b7') return 'Biotin';
  if (n.includes('pantothenic') || n.includes('vitamin b5') || n === 'b5') return 'Pantothenic Acid';
  // Minerals
  if (n.includes('calcium')) return 'Calcium';
  if (n.includes('iron') && !n.includes('environ')) return 'Iron';
  if (n.includes('magnesium')) return 'Magnesium';
  if (n.includes('zinc')) return 'Zinc';
  if (n.includes('selenium')) return 'Selenium';
  if (n.includes('copper')) return 'Copper';
  if (n.includes('manganese')) return 'Manganese';
  if (n.includes('chromium')) return 'Chromium';
  if (n.includes('molybdenum')) return 'Molybdenum';
  if (n.includes('potassium')) return 'Potassium';
  if (n.includes('sodium')) return 'Sodium';
  if (n.includes('phosphorus') || n.includes('phosphorous')) return 'Phosphorus';
  if (n.includes('iodine')) return 'Iodine';
  if (n.includes('choline')) return 'Choline';
  if (n.includes('boron')) return 'Boron';
  // Fatty acids
  if (n.includes('omega') || n.includes('dha') || n.includes('epa') || n.includes('fish oil')) return 'Omega-3';
  // Return cleaned-up original
  return name.split('(')[0].trim();
}
