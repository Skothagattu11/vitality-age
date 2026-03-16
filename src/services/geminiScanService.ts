// Secure label scanning via Supabase Edge Function
// Gemini API key stays server-side as a Supabase secret

import { supabase } from '@/integrations/supabase/client';
import type { ScanResult, NutrientEntry } from '@/types/supplementStacker';

export type ScanMode = 'supplement' | 'food';

export interface ScanApiResponse extends ScanResult {
  _detectedType?: 'supplement' | 'food_label' | 'food_photo';
  _nutrients?: NutrientEntry[];
  _macros?: { calories: number; protein: number; carbs: number; fat: number; fiber: number };
}

// Call the scan-label Edge Function via Supabase client
export async function scanLabel(file: File, mode: ScanMode): Promise<ScanApiResponse> {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('mode', mode);

  // Use supabase.functions.invoke for automatic auth header injection
  const { data, error } = await supabase.functions.invoke('scan-label', {
    body: formData,
  });

  if (error) {
    throw new Error(`Scan failed: ${error.message}`);
  }

  const parsed = data as Record<string, unknown>;

  // Normalize response to match our types
  return {
    _detectedType: ['supplement', 'food_label', 'food_photo'].includes(parsed.detectedType as string)
      ? parsed.detectedType as 'supplement' | 'food_label' | 'food_photo'
      : undefined,
    productName: (parsed.productName as string) || 'Unknown Product',
    brand: (parsed.brand as string) || undefined,
    score: typeof parsed.score === 'number' ? Math.max(0, Math.min(100, parsed.score)) : 0,
    verdict: (parsed.verdict as string) || 'Analysis complete',
    servingAlert: (parsed.servingAlert as string) || undefined,
    findings: Array.isArray(parsed.findings)
      ? parsed.findings.map((f: Record<string, unknown>) => ({
          name: (f.name as string) || 'Unknown',
          status: ['good', 'warn', 'bad'].includes(f.status as string) ? f.status as 'good' | 'warn' | 'bad' : 'warn',
          detail: (f.detail as string) || '',
          dose: (f.dose as string) || undefined,
          absorbed: (f.absorbed as string) || undefined,
          tag: (f.tag as string) || undefined,
        }))
      : [],
    _nutrients: Array.isArray(parsed._nutrients)
      ? (parsed._nutrients as Record<string, unknown>[]).map((n: Record<string, unknown>) => ({
          name: (n.name as string) || 'Unknown',
          amount: typeof n.amount === 'number' ? n.amount : 0,
          unit: (n.unit as string) || 'mg',
          dailyValuePct: typeof n.dailyValuePct === 'number' ? n.dailyValuePct : 0,
          form: (n.form as string) || undefined,
          quality: ['good', 'moderate', 'poor'].includes(n.quality as string) ? n.quality as 'good' | 'moderate' | 'poor' : undefined,
        }))
      : [],
    _macros: {
      calories: typeof (parsed._macros as Record<string, unknown>)?.calories === 'number' ? (parsed._macros as Record<string, number>).calories : 0,
      protein: typeof (parsed._macros as Record<string, unknown>)?.protein === 'number' ? (parsed._macros as Record<string, number>).protein : 0,
      carbs: typeof (parsed._macros as Record<string, unknown>)?.carbs === 'number' ? (parsed._macros as Record<string, number>).carbs : 0,
      fat: typeof (parsed._macros as Record<string, unknown>)?.fat === 'number' ? (parsed._macros as Record<string, number>).fat : 0,
      fiber: typeof (parsed._macros as Record<string, unknown>)?.fiber === 'number' ? (parsed._macros as Record<string, number>).fiber : 0,
    },
  };
}
