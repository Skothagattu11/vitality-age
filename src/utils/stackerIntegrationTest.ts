// src/utils/stackerIntegrationTest.ts
// Run from browser console: import('/src/utils/stackerIntegrationTest.ts').then(m => m.runAllTests())
// Or call window.__runStackerTests() after the app loads

import { supabase } from '@/integrations/supabase/client';
import { getSessionId, saveStackerState, loadStackerState, claimSession } from '@/utils/stackerSync';
import type { SupplementStackerState } from '@/types/supplementStacker';

interface TestResult {
  name: string;
  passed: boolean;
  detail: string;
}

const results: TestResult[] = [];

function log(name: string, passed: boolean, detail: string) {
  results.push({ name, passed, detail });
  console.log(
    `${passed ? '\u2705' : '\u274C'} ${name}`,
    passed ? '' : `\n   ${detail}`
  );
}

// ─── Test 1: Session ID Generation ───
async function testSessionId() {
  const id1 = getSessionId();
  const id2 = getSessionId();
  log(
    '1. Session ID persists across calls',
    id1 === id2 && id1.length === 36,
    `Got "${id1}" then "${id2}"`
  );
}

// ─── Test 2: Guest Save (no auth) ───
async function testGuestSave() {
  const testState: SupplementStackerState = {
    onboardingComplete: true,
    currentOnboardingStep: 'stack-result',
    schedule: { wakeTime: '06:30', breakfastTime: '07:30', lunchTime: '12:30', bedTime: '22:30' },
    activity: { workType: '9-to-5 office', workStartTime: '09:00', workEndTime: '17:00', sports: ['Running'], workoutTime: '07:00' },
    supplements: [
      { id: 'vitamin-d3', name: 'Vitamin D3', dose: '2,000 IU', isCustom: false },
      { id: 'omega-3', name: 'Omega-3 Fish Oil', dose: '1,000mg', isCustom: false },
    ],
    selectedStackOption: 'optimal',
    stackOptions: [],
    interactions: [],
    currentScreen: 'home',
    hasAccount: false,
    scanResults: [],
  };

  try {
    await saveStackerState(testState);
    log('2. Guest save to Supabase', true, 'State saved');
  } catch (err: any) {
    log('2. Guest save to Supabase', false, err.message);
  }
}

// ─── Test 3: Guest Load ───
async function testGuestLoad() {
  try {
    const loaded = await loadStackerState();
    const hasSups = loaded?.stacker.supplements && (loaded.stacker.supplements as any[]).length === 2;
    const isComplete = loaded?.stacker.onboardingComplete === true;
    log(
      '3. Guest load from Supabase',
      !!(hasSups && isComplete),
      `onboardingComplete=${loaded?.stacker.onboardingComplete}, supplements=${JSON.stringify(loaded?.stacker.supplements)}`
    );
  } catch (err: any) {
    log('3. Guest load from Supabase', false, err.message);
  }
}

// ─── Test 4: Verify row exists in DB ───
async function testRowExists() {
  const sessionId = getSessionId();
  const { data, error } = await supabase
    .from('supplement_stacker_sessions')
    .select('id, session_id, user_id, onboarding_complete, supplements')
    .eq('session_id', sessionId)
    .single();

  if (error) {
    log('4. Row exists in supplement_stacker_sessions', false, error.message);
  } else {
    log(
      '4. Row exists in supplement_stacker_sessions',
      data?.onboarding_complete === true && data?.user_id === null,
      `session_id=${data?.session_id}, user_id=${data?.user_id}, onboarding=${data?.onboarding_complete}`
    );
  }
}

// ─── Test 5: Signup (email + password) ───
async function testSignup(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    log(
      '5. Email signup',
      !!data.user,
      `user_id=${data.user?.id}, email=${data.user?.email}`
    );
    return data.user?.id;
  } catch (err: any) {
    log('5. Email signup', false, err.message);
    return null;
  }
}

// ─── Test 6: Claim session after login ───
async function testClaimSession() {
  try {
    const remote = await claimSession();
    log(
      '6. Claim session on login',
      !!remote && remote.onboardingComplete === true,
      `Got back onboardingComplete=${remote?.onboardingComplete}, supplements=${(remote?.supplements as any[])?.length || 0}`
    );
  } catch (err: any) {
    log('6. Claim session on login', false, err.message);
  }
}

// ─── Test 7: Verify user_id is now set on row ───
async function testUserIdSet() {
  const sessionId = getSessionId();
  const { data, error } = await supabase
    .from('supplement_stacker_sessions')
    .select('session_id, user_id')
    .eq('session_id', sessionId)
    .single();

  if (error) {
    log('7. user_id attached to session', false, error.message);
  } else {
    log(
      '7. user_id attached to session',
      data?.user_id !== null,
      `session_id=${data?.session_id}, user_id=${data?.user_id}`
    );
  }
}

// ─── Test 8: Update state while logged in ───
async function testAuthenticatedUpdate() {
  const testState: SupplementStackerState = {
    onboardingComplete: true,
    currentOnboardingStep: 'stack-result',
    schedule: { wakeTime: '07:00', breakfastTime: '08:00', lunchTime: '13:00', bedTime: '23:00' },
    activity: { workType: 'Remote / hybrid', workStartTime: '10:00', workEndTime: '18:00', sports: ['Morning gym', 'Yoga / Pilates'], workoutTime: '06:30' },
    supplements: [
      { id: 'vitamin-d3', name: 'Vitamin D3', dose: '2,000 IU', isCustom: false },
      { id: 'omega-3', name: 'Omega-3 Fish Oil', dose: '1,000mg', isCustom: false },
      { id: 'magnesium-glycinate', name: 'Magnesium Glycinate', dose: '400mg', isCustom: false },
    ],
    selectedStackOption: 'simple',
    stackOptions: [],
    interactions: [],
    currentScreen: 'home',
    hasAccount: true,
    scanResults: [],
  };

  try {
    await saveStackerState(testState);
    const loaded = await loadStackerState();
    const supCount = (loaded?.supplements as any[])?.length || 0;
    log(
      '8. Authenticated save + load',
      supCount === 3 && loaded?.selectedStackOption === 'simple',
      `supplements=${supCount}, stack=${loaded?.selectedStackOption}`
    );
  } catch (err: any) {
    log('8. Authenticated save + load', false, err.message);
  }
}

// ─── Test 9: Sign out ───
async function testSignOut() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    const { data } = await supabase.auth.getSession();
    log('9. Sign out', !data.session, `session=${data.session ? 'still active' : 'cleared'}`);
  } catch (err: any) {
    log('9. Sign out', false, err.message);
  }
}

// ─── Test 10: Sign back in and verify data restored ───
async function testSignInRestore(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;

    const remote = await claimSession();
    const supCount = (remote?.supplements as any[])?.length || 0;
    log(
      '10. Sign in restores previous data',
      supCount === 3 && remote?.onboardingComplete === true,
      `supplements=${supCount}, onboarding=${remote?.onboardingComplete}`
    );
  } catch (err: any) {
    log('10. Sign in restores previous data', false, err.message);
  }
}

// ─── Test 11: Auth state check ───
async function testAuthState() {
  const { data } = await supabase.auth.getSession();
  const user = data.session?.user;
  log(
    '11. Auth state has user info',
    !!user?.email,
    `email=${user?.email}, name=${user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'none'}`
  );
}

// ─── Cleanup ───
async function cleanup() {
  const sessionId = getSessionId();
  await supabase
    .from('supplement_stacker_sessions')
    .delete()
    .eq('session_id', sessionId);

  await supabase.auth.signOut();
  console.log('\n🧹 Cleaned up test data and signed out');
}

// ─── Main runner ───
export async function runAllTests(email?: string, password?: string) {
  const testEmail = email || `test-stacker-${Date.now()}@test.com`;
  const testPassword = password || 'TestPass123!';

  console.log('\n══════════════════════════════════════');
  console.log('  Supplement Stacker Integration Tests');
  console.log('══════════════════════════════════════\n');
  console.log(`Session ID: ${getSessionId()}`);
  console.log(`Test email: ${testEmail}\n`);

  results.length = 0;

  // Guest workflow
  await testSessionId();
  await testGuestSave();
  await testGuestLoad();
  await testRowExists();

  // Auth workflow
  await testSignup(testEmail, testPassword);
  await testClaimSession();
  await testUserIdSet();
  await testAuthenticatedUpdate();

  // Restore workflow
  await testSignOut();
  await testSignInRestore(testEmail, testPassword);
  await testAuthState();

  // Summary
  const passed = results.filter(r => r.passed).length;
  const total = results.length;

  console.log('\n══════════════════════════════════════');
  console.log(`  Results: ${passed}/${total} passed`);
  console.log('══════════════════════════════════════\n');

  if (passed < total) {
    console.log('Failed tests:');
    results.filter(r => !r.passed).forEach(r => {
      console.log(`  ❌ ${r.name}: ${r.detail}`);
    });
  }

  console.log('\nRun cleanup() to remove test data, or leave it for inspection.');
  console.log('To clean up: import("/src/utils/stackerIntegrationTest.ts").then(m => m.cleanup())');

  return { passed, total, results };
}

export { cleanup };

// Attach to window for easy console access
if (typeof window !== 'undefined') {
  (window as any).__runStackerTests = runAllTests;
  (window as any).__cleanupStackerTests = cleanup;
}
