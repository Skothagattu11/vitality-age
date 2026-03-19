// Secure skin label scanning via Supabase Edge Functions
// API keys stay server-side as Supabase secrets

import { supabase } from '@/integrations/supabase/client';
import type { SkinScanResult, SkinProfile, ResearchedIngredient, IngredientEntry } from '@/types/skinScanner';

// Call the scan-skincare-label Edge Function via Supabase client
export async function scanSkinLabel(file: File, skinProfile: SkinProfile): Promise<SkinScanResult> {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('skinProfile', JSON.stringify(skinProfile));

  const { data, error } = await supabase.functions.invoke('scan-skincare-label', {
    body: formData,
  });

  if (error) {
    throw new Error(`Skin scan failed: ${error.message}`);
  }

  const parsed = data as Record<string, unknown>;

  // Normalize response to match our types with defensive parsing
  return {
    productName: (parsed.productName as string) || 'Unknown Product',
    brand: (parsed.brand as string) || null,
    safetyScore: typeof parsed.safetyScore === 'number' ? Math.max(1, Math.min(10, parsed.safetyScore)) : 5,
    compatibilityScore: typeof parsed.compatibilityScore === 'number' ? Math.max(0, Math.min(100, parsed.compatibilityScore)) : 50,
    compatibilityConfidence: ['full', 'partial', 'generic'].includes(parsed.compatibilityConfidence as string)
      ? parsed.compatibilityConfidence as 'full' | 'partial' | 'generic'
      : 'generic',
    verdict: (parsed.verdict as string) || 'Analysis complete',
    applicationInstructions: normalizeApplicationInstructions(parsed.applicationInstructions as Record<string, unknown>),
    ingredients: normalizeIngredients(parsed.ingredients as Record<string, unknown>),
    unknownIngredients: Array.isArray(parsed.unknownIngredients)
      ? parsed.unknownIngredients.map((u: Record<string, unknown>) => ({
          name: (u.name as string) || 'Unknown',
          rawText: (u.rawText as string) || '',
        }))
      : [],
    detectedType: ['skincare', 'cosmetic', 'unknown'].includes(parsed.detectedType as string)
      ? parsed.detectedType as 'skincare' | 'cosmetic' | 'unknown'
      : 'unknown',
    scannedAt: Date.now(),
  };
}

// Call the research-ingredients Edge Function via Supabase client
export async function researchIngredients(
  ingredients: { name: string; rawText: string }[],
  skinProfile: SkinProfile,
): Promise<ResearchedIngredient[]> {
  const { data, error } = await supabase.functions.invoke('research-ingredients', {
    body: { ingredients, skinProfile },
  });

  if (error) {
    throw new Error(`Ingredient research failed: ${error.message}`);
  }

  if (!Array.isArray(data)) {
    return [];
  }

  return data.map((item: Record<string, unknown>) => ({
    name: (item.name as string) || 'Unknown',
    chemicalClass: (item.chemicalClass as string) || 'Unknown',
    origin: ['synthetic', 'natural', 'bioidentical'].includes(item.origin as string)
      ? item.origin as 'synthetic' | 'natural' | 'bioidentical'
      : 'synthetic',
    functionInProduct: (item.functionInProduct as string) || '',
    safetyProfile: (item.safetyProfile as string) || '',
    regulatoryStatus: (item.regulatoryStatus as string) || '',
    skinTypeRelevance: (item.skinTypeRelevance as string) || '',
    sources: Array.isArray(item.sources)
      ? item.sources.map((s: Record<string, unknown>) => ({
          title: (s.title as string) || '',
          url: (s.url as string) || '',
        }))
      : [],
    researchedAt: typeof item.researchedAt === 'number' ? item.researchedAt : Date.now(),
    safety: ['good', 'moderate', 'bad'].includes(item.safety as string)
      ? item.safety as IngredientEntry['safety']
      : 'moderate',
    compatibility: ['beneficial', 'neutral', 'caution', 'avoid'].includes(item.compatibility as string)
      ? item.compatibility as IngredientEntry['compatibility']
      : 'neutral',
    tier: ['heroActives', 'supporting', 'baseFiller', 'watchOut'].includes(item.tier as string)
      ? item.tier as 'heroActives' | 'supporting' | 'baseFiller' | 'watchOut'
      : 'supporting',
  }));
}

function normalizeIngredientEntry(f: Record<string, unknown>): IngredientEntry {
  return {
    name: (f.name as string) || 'Unknown',
    purpose: (f.purpose as string) || '',
    safety: ['good', 'moderate', 'bad'].includes(f.safety as string)
      ? f.safety as 'good' | 'moderate' | 'bad'
      : 'moderate',
    compatibility: ['beneficial', 'neutral', 'caution', 'avoid'].includes(f.compatibility as string)
      ? f.compatibility as 'beneficial' | 'neutral' | 'caution' | 'avoid'
      : 'neutral',
    detail: (f.detail as string) || '',
    dose: (f.dose as string) || null,
    flagReason: (f.flagReason as string) || null,
  };
}

function normalizeIngredients(raw: Record<string, unknown> | undefined | null): SkinScanResult['ingredients'] {
  const empty: SkinScanResult['ingredients'] = {
    heroActives: [],
    supporting: [],
    baseFiller: [],
    watchOut: [],
  };

  if (!raw || typeof raw !== 'object') return empty;

  return {
    heroActives: Array.isArray(raw.heroActives)
      ? raw.heroActives.map((f: Record<string, unknown>) => normalizeIngredientEntry(f))
      : [],
    supporting: Array.isArray(raw.supporting)
      ? raw.supporting.map((f: Record<string, unknown>) => normalizeIngredientEntry(f))
      : [],
    baseFiller: Array.isArray(raw.baseFiller)
      ? raw.baseFiller.map((f: Record<string, unknown>) => normalizeIngredientEntry(f))
      : [],
    watchOut: Array.isArray(raw.watchOut)
      ? raw.watchOut.map((f: Record<string, unknown>) => normalizeIngredientEntry(f))
      : [],
  };
}

function normalizeApplicationInstructions(raw: Record<string, unknown> | undefined | null): SkinScanResult['applicationInstructions'] {
  const defaults: SkinScanResult['applicationInstructions'] = {
    timeOfDay: 'both',
    routineStep: 'Apply as directed',
    routineCategory: 'treatment',
    amount: 'As directed',
    waitTime: null,
    tips: [],
  };

  if (!raw || typeof raw !== 'object') return defaults;

  return {
    timeOfDay: ['AM', 'PM', 'both'].includes(raw.timeOfDay as string)
      ? raw.timeOfDay as 'AM' | 'PM' | 'both'
      : 'both',
    routineStep: (raw.routineStep as string) || 'Apply as directed',
    routineCategory: ['cleanser', 'toner', 'serum', 'treatment', 'eyeCream', 'moisturizer', 'spf'].includes(raw.routineCategory as string)
      ? raw.routineCategory as SkinScanResult['applicationInstructions']['routineCategory']
      : 'treatment',
    amount: (raw.amount as string) || 'As directed',
    waitTime: (raw.waitTime as string) || null,
    tips: Array.isArray(raw.tips)
      ? raw.tips.filter((t: unknown) => typeof t === 'string')
      : [],
  };
}
