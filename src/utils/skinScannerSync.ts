// src/utils/skinScannerSync.ts
// Syncs skin scanner state to/from Supabase.
// Guest users get a session_id stored in localStorage.
// On sign-in, the anonymous session is claimed by setting user_id.

import { supabase } from '@/integrations/supabase/client';
import type { SkinScannerState, SkinScanResult, RoutineProduct, ResearchedIngredient, SkinProfile } from '@/types/skinScanner';

const SESSION_KEY = 'entropy-age-skin-scanner-session-id';

export interface SkinScannerRemoteState {
  skinProfile: SkinProfile;
  scanHistory: SkinScanResult[];
  amRoutine: RoutineProduct[];
  pmRoutine: RoutineProduct[];
  researchCache: Record<string, ResearchedIngredient>;
  onboardingComplete: boolean;
}

/** Get or create a persistent anonymous session ID */
export function getSessionId(): string {
  let id = localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

/** Save the current skin scanner state to Supabase */
export async function saveSkinScannerState(state: SkinScannerState): Promise<void> {
  const sessionId = getSessionId();
  const session = await supabase.auth.getSession();
  const userId = session.data.session?.user?.id || null;

  const row: Record<string, unknown> = {
    session_id: sessionId,
    user_id: userId,
    skin_profile: state.skinProfile as any,
    scan_history: state.scanHistory as any,
    am_routine: state.amRoutine as any,
    pm_routine: state.pmRoutine as any,
    research_cache: state.researchCache as any,
    onboarding_complete: state.skinProfile.onboardingComplete,
  };

  await supabase
    .from('skin_scanner_sessions')
    .upsert(row, { onConflict: 'session_id' });
}

/** Load skin scanner state from Supabase */
export async function loadSkinScannerState(): Promise<SkinScannerRemoteState | null> {
  // First try loading by authenticated user_id
  const session = await supabase.auth.getSession();
  const userId = session.data.session?.user?.id;

  if (userId) {
    const { data } = await supabase
      .from('skin_scanner_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();

    if (data) return mapRowToRemoteState(data);
  }

  // Fall back to anonymous session_id
  const sessionId = getSessionId();
  const { data } = await supabase
    .from('skin_scanner_sessions')
    .select('*')
    .eq('session_id', sessionId)
    .single();

  if (data) return mapRowToRemoteState(data);
  return null;
}

/** Claim an anonymous session for the newly authenticated user */
export async function claimSkinScannerSession(): Promise<SkinScannerRemoteState | null> {
  const session = await supabase.auth.getSession();
  const userId = session.data.session?.user?.id;
  if (!userId) return null;

  const sessionId = getSessionId();

  // Claim the current anonymous session
  await supabase
    .from('skin_scanner_sessions')
    .update({ user_id: userId })
    .eq('session_id', sessionId);

  // Check if the user has an older saved session
  const { data } = await supabase
    .from('skin_scanner_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
    .limit(1)
    .single();

  if (data) return mapRowToRemoteState(data);
  return null;
}

function mapRowToRemoteState(row: any): SkinScannerRemoteState {
  return {
    skinProfile: row.skin_profile && typeof row.skin_profile === 'object'
      ? row.skin_profile
      : { skinType: null, sensitivity: null, concerns: [], allergies: [], ageRange: null, routineComplexity: null, onboardingComplete: false },
    scanHistory: Array.isArray(row.scan_history) ? row.scan_history : [],
    amRoutine: Array.isArray(row.am_routine) ? row.am_routine : [],
    pmRoutine: Array.isArray(row.pm_routine) ? row.pm_routine : [],
    researchCache: row.research_cache && typeof row.research_cache === 'object' && !Array.isArray(row.research_cache)
      ? row.research_cache
      : {},
    onboardingComplete: row.onboarding_complete ?? false,
  };
}
