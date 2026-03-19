// src/utils/stackerSync.ts
// Syncs supplement stacker state + nutrition data to/from Supabase.
// Guest users get a session_id stored in localStorage.
// On sign-in, the anonymous session is claimed by setting user_id.

import { supabase } from '@/integrations/supabase/client';
import type { SupplementStackerState } from '@/types/supplementStacker';
import type { CartItem } from '@/types/supplementStacker';
import type { NutritionPlan } from '@/hooks/useNutritionPlans';

const SESSION_KEY = 'entropy-age-stacker-session-id';

export interface RemoteState {
  stacker: Partial<SupplementStackerState>;
  nutritionCart: CartItem[];
  nutritionPlans: Record<string, NutritionPlan>;
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

/** Save the current stacker state + nutrition data to Supabase */
export async function saveStackerState(
  state: SupplementStackerState,
  nutritionCart?: CartItem[],
  nutritionPlans?: Record<string, NutritionPlan>,
): Promise<void> {
  const sessionId = getSessionId();
  const session = await supabase.auth.getSession();
  const userId = session.data.session?.user?.id || null;

  const row: Record<string, unknown> = {
    session_id: sessionId,
    user_id: userId,
    schedule: state.schedule as any,
    activity: state.activity as any,
    supplements: state.supplements as any,
    selected_stack_option: state.selectedStackOption,
    stack_options: state.stackOptions as any,
    interactions: state.interactions as any,
    scan_results: state.scanResults as any,
    reminder_method: state.reminderMethod || null,
    onboarding_complete: state.onboardingComplete,
  };

  if (nutritionCart !== undefined) {
    row.nutrition_cart = nutritionCart as any;
  }
  if (nutritionPlans !== undefined) {
    row.nutrition_plans = nutritionPlans as any;
  }

  await supabase
    .from('supplement_stacker_sessions')
    .upsert(row as any, { onConflict: 'session_id' });
}

/** Load stacker state + nutrition data from Supabase */
export async function loadStackerState(): Promise<RemoteState | null> {
  // First try loading by authenticated user_id
  const session = await supabase.auth.getSession();
  const userId = session.data.session?.user?.id;

  if (userId) {
    const { data } = await supabase
      .from('supplement_stacker_sessions')
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
    .from('supplement_stacker_sessions')
    .select('*')
    .eq('session_id', sessionId)
    .single();

  if (data) return mapRowToRemoteState(data);
  return null;
}

/** Claim an anonymous session for the newly authenticated user */
export async function claimSession(): Promise<RemoteState | null> {
  const session = await supabase.auth.getSession();
  const userId = session.data.session?.user?.id;
  if (!userId) return null;

  const sessionId = getSessionId();

  // Claim the current anonymous session
  await supabase
    .from('supplement_stacker_sessions')
    .update({ user_id: userId })
    .eq('session_id', sessionId);

  // Check if the user has an older saved session
  const { data } = await supabase
    .from('supplement_stacker_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
    .limit(1)
    .single();

  if (data) return mapRowToRemoteState(data);
  return null;
}

function mapRowToRemoteState(row: any): RemoteState {
  return {
    stacker: {
      schedule: row.schedule,
      activity: row.activity,
      supplements: row.supplements,
      selectedStackOption: row.selected_stack_option,
      stackOptions: row.stack_options,
      interactions: row.interactions,
      scanResults: row.scan_results,
      reminderMethod: row.reminder_method || undefined,
      onboardingComplete: row.onboarding_complete,
    },
    nutritionCart: Array.isArray(row.nutrition_cart) ? row.nutrition_cart : [],
    nutritionPlans: row.nutrition_plans && typeof row.nutrition_plans === 'object' && !Array.isArray(row.nutrition_plans)
      ? row.nutrition_plans
      : {},
  };
}
