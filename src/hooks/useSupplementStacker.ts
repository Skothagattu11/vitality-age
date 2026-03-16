import { useState, useEffect, useCallback, useRef } from 'react';
import type {
  SupplementStackerState,
  Supplement,
  UserSchedule,
  UserActivity,
  OnboardingStep,
  AppScreen,
  ScanResult,
} from '@/types/supplementStacker';
import { generateStackOptions, getInteractions } from '@/utils/stackEngine';
import { supabase } from '@/integrations/supabase/client';
import { saveStackerState, loadStackerState, claimSession, type RemoteState } from '@/utils/stackerSync';

const STORAGE_KEY = 'entropy-age-supplement-stacker';

// Global flag to prevent useEffect from re-persisting state during logout
let isLoggingOut = false;
export function setLoggingOut() { isLoggingOut = true; }

const initialSchedule: UserSchedule = {
  wakeTime: '06:30',
  breakfastTime: '07:30',
  lunchTime: '12:30',
  bedTime: '22:30',
};

const initialActivity: UserActivity = {
  workType: '',
  workStartTime: '09:00',
  workEndTime: '17:00',
  sports: [],
  workoutTime: '',
};

const initialState: SupplementStackerState = {
  onboardingComplete: false,
  currentOnboardingStep: 'welcome',
  schedule: initialSchedule,
  activity: initialActivity,
  supplements: [],
  selectedStackOption: 'optimal',
  stackOptions: [],
  interactions: [],
  currentScreen: 'home',
  hasAccount: false,
  scanResults: [],
};

function loadState(): SupplementStackerState {
  if (typeof window === 'undefined') return initialState;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return { ...initialState, ...JSON.parse(stored) };
    } catch {
      return initialState;
    }
  }
  return initialState;
}

export interface UserProfile {
  email: string;
  name: string;
}

export function useSupplementStacker() {
  const [state, setState] = useState<SupplementStackerState>(loadState);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Persist to localStorage on every change (skip during logout)
  useEffect(() => {
    if (isLoggingOut) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  // Debounced save to Supabase (500ms after last change)
  useEffect(() => {
    if (isLoggingOut) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      saveStackerState(state).catch(() => {
        // Silently fail — localStorage is the primary store
      });
    }, 500);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [state]);

  // Callback ref for nutrition hydration (set by SupplementStackerApp)
  const onRemoteLoad = useRef<((remote: RemoteState) => void) | null>(null);

  const setOnRemoteLoad = useCallback((cb: (remote: RemoteState) => void) => {
    onRemoteLoad.current = cb;
  }, []);

  // On mount: try loading from Supabase (may have newer data from another device)
  useEffect(() => {
    loadStackerState().then((remote) => {
      if (remote && remote.stacker.onboardingComplete) {
        setState(prev => ({
          ...prev,
          ...remote.stacker,
          hasAccount: prev.hasAccount,
          currentScreen: prev.currentScreen,
          currentOnboardingStep: prev.currentOnboardingStep,
        }));
        onRemoteLoad.current?.(remote);
      }
    }).catch(() => {});
  }, []);

  // Sync hasAccount with Supabase auth session + claim anonymous data on login
  useEffect(() => {
    const extractProfile = (session: any): UserProfile | null => {
      if (!session?.user) return null;
      const user = session.user;
      const meta = user.user_metadata || {};
      return {
        email: user.email || '',
        name: meta.full_name || meta.name || user.email?.split('@')[0] || '',
      };
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setState(prev => ({ ...prev, hasAccount: true }));
        setUserProfile(extractProfile(session));
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const isLoggedIn = !!session;
      setState(prev => ({ ...prev, hasAccount: isLoggedIn }));
      setUserProfile(isLoggedIn ? extractProfile(session) : null);

      // On sign-in, claim the anonymous session and load any existing user data
      if (event === 'SIGNED_IN' && session) {
        claimSession().then((remote) => {
          if (remote && remote.stacker.onboardingComplete) {
            setState(prev => ({
              ...prev,
              ...remote.stacker,
              hasAccount: true,
              currentScreen: prev.currentScreen,
              currentOnboardingStep: prev.currentOnboardingStep,
            }));
            onRemoteLoad.current?.(remote);
          }
        }).catch(() => {});
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const updateSchedule = useCallback((schedule: UserSchedule) => {
    setState(prev => ({ ...prev, schedule }));
  }, []);

  const updateActivity = useCallback((activity: UserActivity) => {
    setState(prev => ({ ...prev, activity }));
  }, []);

  const addSupplement = useCallback((supplement: Supplement) => {
    setState(prev => ({
      ...prev,
      supplements: [...prev.supplements.filter(s => s.id !== supplement.id), supplement],
    }));
  }, []);

  const removeSupplement = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      supplements: prev.supplements.filter(s => s.id !== id),
    }));
  }, []);

  const toggleSupplement = useCallback((supplement: Supplement) => {
    setState(prev => {
      const exists = prev.supplements.some(s => s.id === supplement.id);
      return {
        ...prev,
        supplements: exists
          ? prev.supplements.filter(s => s.id !== supplement.id)
          : [...prev.supplements, supplement],
      };
    });
  }, []);

  const setSelectedStack = useCallback((option: 'simple' | 'optimal') => {
    setState(prev => ({ ...prev, selectedStackOption: option }));
  }, []);

  const generateStacks = useCallback(() => {
    setState(prev => {
      const stackOptions = generateStackOptions(prev.supplements, prev.schedule);
      const interactions = getInteractions(prev.supplements);
      return { ...prev, stackOptions, interactions };
    });
  }, []);

  const completeOnboarding = useCallback(() => {
    setState(prev => {
      const stackOptions = generateStackOptions(prev.supplements, prev.schedule);
      const interactions = getInteractions(prev.supplements);
      return {
        ...prev,
        onboardingComplete: true,
        stackOptions,
        interactions,
      };
    });
  }, []);

  const setOnboardingStep = useCallback((step: OnboardingStep) => {
    setState(prev => ({ ...prev, currentOnboardingStep: step }));
  }, []);

  const setScreen = useCallback((screen: AppScreen) => {
    setState(prev => ({ ...prev, currentScreen: screen }));
  }, []);

  const addScanResult = useCallback((result: ScanResult) => {
    setState(prev => ({
      ...prev,
      scanResults: [result, ...prev.scanResults],
    }));
  }, []);

  const setHasAccount = useCallback((hasAccount: boolean) => {
    setState(prev => ({ ...prev, hasAccount }));
  }, []);

  const setReminderMethod = useCallback((method: 'gcal' | 'apple' | 'ics') => {
    setState(prev => ({ ...prev, reminderMethod: method }));
  }, []);

  const reset = useCallback(() => {
    setState(initialState);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return {
    state,
    userProfile,
    updateSchedule,
    updateActivity,
    addSupplement,
    removeSupplement,
    toggleSupplement,
    setSelectedStack,
    generateStacks,
    completeOnboarding,
    setOnboardingStep,
    setScreen,
    addScanResult,
    setHasAccount,
    setReminderMethod,
    setOnRemoteLoad,
    reset,
  };
}
