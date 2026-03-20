// src/types/skinScanner.ts

// ── Ingredient Types ──

export interface IngredientEntry {
  name: string;
  purpose: string;
  safety: 'good' | 'moderate' | 'bad';
  compatibility: 'beneficial' | 'neutral' | 'caution' | 'avoid';
  detail: string;
  dose: string | null;
  flagReason: string | null;
}

export type RoutineCategory = 'cleanser' | 'toner' | 'serum' | 'treatment' | 'eyeCream' | 'moisturizer' | 'spf';

export interface ApplicationInstructions {
  timeOfDay: 'AM' | 'PM' | 'both';
  routineStep: string;
  routineCategory: RoutineCategory;
  amount: string;
  waitTime: string | null;
  tips: string[];
}

// ── Scan Result ──

export interface SkinScanResult {
  productName: string;
  brand: string | null;
  safetyScore: number;         // 1-10
  compatibilityScore: number;  // 0-100
  compatibilityConfidence: 'full' | 'partial' | 'generic';
  verdict: string;
  applicationInstructions: ApplicationInstructions;
  ingredients: {
    heroActives: IngredientEntry[];
    supporting: IngredientEntry[];
    baseFiller: IngredientEntry[];
    watchOut: IngredientEntry[];
  };
  unknownIngredients: { name: string; rawText: string }[];
  detectedType: 'skincare' | 'cosmetic' | 'unknown';
  scannedAt: number;
}

// ── Routine ──

export interface RoutineProduct {
  id: string;
  scanResult: SkinScanResult;
  routineCategory: RoutineCategory;
  sortOrder: number;
  addedAt: number;
}

// ── Research ──

export interface ResearchedIngredient {
  name: string;
  chemicalClass: string;
  origin: 'synthetic' | 'natural' | 'bioidentical';
  functionInProduct: string;
  safetyProfile: string;
  regulatoryStatus: string;
  skinTypeRelevance: string;
  sources: { title: string; url: string }[];
  researchedAt: number;
  safety: IngredientEntry['safety'];
  compatibility: IngredientEntry['compatibility'];
  tier: 'heroActives' | 'supporting' | 'baseFiller' | 'watchOut';
}

// ── Skin Profile ──

export interface SkinProfile {
  skinType: string | null;
  sensitivity: string | null;
  concerns: string[];
  allergies: string[];
  ageRange: string | null;
  routineComplexity: string | null;
  onboardingComplete: boolean;
}

// ── Chat ──

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface ChatSession {
  productName: string;
  messages: ChatMessage[];
  startedAt: number;
}

export interface ChatRateLimit {
  remaining: number;
  limit: number;
  resetsAt: number | null; // null for guest (lifetime cap)
}

// ── App State ──

export type SkinScannerScreen = 'home' | 'routine' | 'profile' | 'results';

export interface SkinScannerState {
  skinProfile: SkinProfile;
  scanHistory: SkinScanResult[];
  amRoutine: RoutineProduct[];
  pmRoutine: RoutineProduct[];
  researchCache: Record<string, ResearchedIngredient>;
  hasAccount: boolean;
  currentScreen: SkinScannerScreen;
}
