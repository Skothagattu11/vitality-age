import { useState, useEffect, useCallback, useRef } from 'react';
import type {
  SkinScannerState,
  SkinProfile,
  SkinScanResult,
  RoutineProduct,
  ResearchedIngredient,
  SkinScannerScreen,
} from '@/types/skinScanner';
import { saveSkinScannerState, loadSkinScannerState, claimSkinScannerSession, type SkinScannerRemoteState } from '@/utils/skinScannerSync';
import { supabase } from '@/integrations/supabase/client';

export type { SkinScannerRemoteState } from '@/utils/skinScannerSync';

const STORAGE_KEY = 'entropy-age-skin-scanner';

// Global flag to prevent useEffect from re-persisting state during logout
let isLoggingOut = false;
export function setSkinScannerLoggingOut() { isLoggingOut = true; }

const initialState: SkinScannerState = {
  skinProfile: {
    skinType: null,
    sensitivity: null,
    concerns: [],
    allergies: [],
    ageRange: null,
    routineComplexity: null,
    onboardingComplete: false,
  },
  scanHistory: [],
  amRoutine: [],
  pmRoutine: [],
  researchCache: {},
  hasAccount: false,
  currentScreen: 'home',
};

function loadState(): SkinScannerState {
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

export function useSkinScanner() {
  const [state, setState] = useState<SkinScannerState>(loadState);
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
      saveSkinScannerState(state).catch(() => {
        // Silently fail — localStorage is the primary store
      });
    }, 500);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [state]);

  // Callback ref for remote hydration (set by SkinScannerApp)
  const onRemoteLoad = useRef<((remote: SkinScannerRemoteState) => void) | null>(null);

  const setOnRemoteLoad = useCallback((cb: (remote: SkinScannerRemoteState) => void) => {
    onRemoteLoad.current = cb;
  }, []);

  // On mount: try loading from Supabase (may have newer data from another device)
  useEffect(() => {
    loadSkinScannerState().then((remote) => {
      if (remote && remote.skinProfile.onboardingComplete) {
        setState(prev => ({
          ...prev,
          skinProfile: remote.skinProfile,
          scanHistory: remote.scanHistory,
          amRoutine: remote.amRoutine,
          pmRoutine: remote.pmRoutine,
          researchCache: remote.researchCache,
          hasAccount: prev.hasAccount,
          currentScreen: prev.currentScreen,
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
        claimSkinScannerSession().then((remote) => {
          if (remote && remote.skinScanner.skinProfile.onboardingComplete) {
            setState(prev => ({
              ...prev,
              ...remote.skinScanner,
              hasAccount: true,
              currentScreen: prev.currentScreen,
            }));
            onRemoteLoad.current?.(remote);
          }
        }).catch(() => {});
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const updateSkinProfile = useCallback((updates: Partial<SkinProfile>) => {
    setState(prev => ({
      ...prev,
      skinProfile: { ...prev.skinProfile, ...updates },
    }));
  }, []);

  const completeOnboarding = useCallback(() => {
    setState(prev => ({
      ...prev,
      skinProfile: { ...prev.skinProfile, onboardingComplete: true },
    }));
  }, []);

  const addScanResult = useCallback((result: SkinScanResult) => {
    setState(prev => ({
      ...prev,
      scanHistory: [result, ...prev.scanHistory].slice(0, 50),
    }));
  }, []);

  const addToRoutine = useCallback((product: RoutineProduct, routine: 'am' | 'pm') => {
    setState(prev => ({
      ...prev,
      ...(routine === 'am'
        ? { amRoutine: [...prev.amRoutine, product] }
        : { pmRoutine: [...prev.pmRoutine, product] }),
    }));
  }, []);

  const removeFromRoutine = useCallback((productId: string, routine: 'am' | 'pm') => {
    setState(prev => ({
      ...prev,
      ...(routine === 'am'
        ? { amRoutine: prev.amRoutine.filter(p => p.id !== productId) }
        : { pmRoutine: prev.pmRoutine.filter(p => p.id !== productId) }),
    }));
  }, []);

  const addResearch = useCallback((key: string, research: ResearchedIngredient) => {
    setState(prev => ({
      ...prev,
      researchCache: { ...prev.researchCache, [key]: research },
    }));
  }, []);

  const setScreen = useCallback((screen: SkinScannerScreen) => {
    setState(prev => ({ ...prev, currentScreen: screen }));
  }, []);

  const setHasAccount = useCallback((hasAccount: boolean) => {
    setState(prev => ({ ...prev, hasAccount }));
  }, []);

  const reset = useCallback(() => {
    setState(initialState);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return {
    state,
    userProfile,
    updateSkinProfile,
    completeOnboarding,
    addScanResult,
    addToRoutine,
    removeFromRoutine,
    addResearch,
    setScreen,
    setHasAccount,
    setOnRemoteLoad,
    reset,
  };
}
