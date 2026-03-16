// src/types/supplementStacker.ts

export interface Supplement {
  id: string;
  name: string;
  dose: string;
  form?: 'capsule' | 'tablet' | 'powder' | 'liquid' | 'gummy';
  isCustom: boolean;
  timing?: 'morning' | 'midday' | 'evening' | 'any';
  withFood?: boolean;
  notes?: string;
}

export interface UserSchedule {
  wakeTime: string;    // "06:30"
  breakfastTime: string;
  lunchTime: string;
  bedTime: string;
  workoutTime?: string;
}

export type SupplementTiming =
  | 'empty-stomach'
  | 'before-breakfast'
  | 'after-breakfast'
  | 'after-lunch'
  | 'before-dinner'
  | 'after-dinner'
  | 'before-workout'
  | 'after-workout';

export interface UserActivity {
  workType: string;     // "9-to-5 office" | "Remote" | etc.
  workStartTime: string; // "09:00"
  workEndTime: string;   // "17:00"
  sports: string[];     // ["Morning gym", "Running", etc.]
  workoutTime: string;
}

export type OnboardingStep = 'welcome' | 'schedule' | 'activity' | 'supplements' | 'stack-result';

export interface TimeSlot {
  time: string;         // "7:30 AM"
  label: string;        // "with breakfast"
  supplements: string[];
  reason: string;
}

export interface StackOption {
  id: 'simple' | 'optimal';
  name: string;
  description: string;
  slots: TimeSlot[];
  isRecommended: boolean;
}

export interface InteractionNote {
  type: 'synergy' | 'separate' | 'warning';
  message: string;
  supplements: string[];
}

export interface ScanFinding {
  name: string;
  status: 'good' | 'warn' | 'bad';
  detail: string;
  dose?: string;
  absorbed?: string;
  tag?: string;
}

export interface ScanResult {
  productName: string;
  brand?: string;
  score: number;          // 0-100
  verdict: string;
  findings: ScanFinding[];
  servingAlert?: string;
}

// ── Nutrition Cart Types ──

export interface NutrientEntry {
  name: string;           // "Vitamin D3"
  amount: number;         // 50
  unit: string;           // "mcg"
  dailyValuePct: number;  // 250
  form?: string;          // "Cholecalciferol"
  quality?: 'good' | 'moderate' | 'poor';
}

export interface CartItem {
  id: string;
  productName: string;
  type: 'supplement' | 'food';
  servingSize?: string;
  score?: number;                // supplement quality score 0-100
  scanResult?: ScanResult;
  nutrients: NutrientEntry[];
  macros: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
  addedAt: number;               // Date.now()
}

export type AppScreen = 'home' | 'stack' | 'profile';

export interface SupplementStackerState {
  // Onboarding
  onboardingComplete: boolean;
  currentOnboardingStep: OnboardingStep;
  schedule: UserSchedule;
  activity: UserActivity;

  // Stack
  supplements: Supplement[];
  selectedStackOption: 'simple' | 'optimal';
  stackOptions: StackOption[];
  interactions: InteractionNote[];

  // App
  currentScreen: AppScreen;
  hasAccount: boolean;
  reminderMethod?: 'gcal' | 'apple' | 'ics';

  // Scan history
  scanResults: ScanResult[];
}
