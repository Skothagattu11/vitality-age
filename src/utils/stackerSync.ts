// src/utils/stackerSync.ts
// Syncs supplement stacker state to/from Supabase.
// Guest users get a session_id stored in localStorage.
// On login, the anonymous session is claimed by setting user_id.

import { supabase } from '@/integrations/supabase/client';
import type { SupplementStackerState } from '@/types/supplementStacker';

const SESSION_KEY = 'entropy-age-stacker-session-id';

/** Get or create a persistent anonymous session ID */
export function getSessionId(): string {
  let id = localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

/** Save the current stacker state to Supabase */
export async function saveStackerState(state: SupplementStackerState): Promise<void> {
  const sessionId = getSessionId();
  const session = await supabase.auth.getSession();
  const userId = session.data.session?.user?.id || null;

  const row = {
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

  await supabase
    .from('supplement_stacker_sessions')
    .upsert(row, { onConflict: 'session_id' });
}

/** Load stacker state from Supabase for the current user or session */
export async function loadStackerState(): Promise<Partial<SupplementStackerState> | null> {
  // First try loading by authenticated user_id (may have data from a previous session)
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

    if (data) return mapRowToState(data);
  }

  // Fall back to anonymous session_id
  const sessionId = getSessionId();
  const { data } = await supabase
    .from('supplement_stacker_sessions')
    .select('*')
    .eq('session_id', sessionId)
    .single();

  if (data) return mapRowToState(data);
  return null;
}

/** Claim an anonymous session for the newly authenticated user */
export async function claimSession(): Promise<Partial<SupplementStackerState> | null> {
  const session = await supabase.auth.getSession();
  const userId = session.data.session?.user?.id;
  if (!userId) return null;

  const sessionId = getSessionId();

  // Claim the current anonymous session
  await supabase
    .from('supplement_stacker_sessions')
    .update({ user_id: userId })
    .eq('session_id', sessionId);

  // Check if the user has an older saved session (from a previous device/browser)
  const { data } = await supabase
    .from('supplement_stacker_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
    .limit(1)
    .single();

  if (data) return mapRowToState(data);
  return null;
}

function mapRowToState(row: any): Partial<SupplementStackerState> {
  return {
    schedule: row.schedule,
    activity: row.activity,
    supplements: row.supplements,
    selectedStackOption: row.selected_stack_option,
    stackOptions: row.stack_options,
    interactions: row.interactions,
    scanResults: row.scan_results,
    reminderMethod: row.reminder_method || undefined,
    onboardingComplete: row.onboarding_complete,
  };
}
