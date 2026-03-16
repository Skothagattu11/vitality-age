import { useState, useEffect } from 'react';
import { useSupplementStacker } from '@/hooks/useSupplementStacker';
import { OnboardingWizard } from '@/components/supplement-stacker/onboarding/OnboardingWizard';
import { SupplementStackerApp } from '@/components/supplement-stacker/SupplementStackerApp';

// Register test utils on window (dev only)
import('@/utils/stackerIntegrationTest').catch(() => {});

export default function SupplementStacker() {
  const stacker = useSupplementStacker();

  const [isDark, setIsDark] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('ss-theme') === 'dark';
  });

  useEffect(() => {
    localStorage.setItem('ss-theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const toggleTheme = () => setIsDark(d => !d);

  return (
    <div className={`supplement-stacker min-h-dvh ${isDark ? 'dark' : ''}`}
         style={{ background: 'hsl(var(--ss-bg))' }}>
      <div className="max-w-[420px] mx-auto">
        {!stacker.state.onboardingComplete ? (
          <OnboardingWizard stacker={stacker} />
        ) : (
          <SupplementStackerApp stacker={stacker} isDark={isDark} onToggleTheme={toggleTheme} />
        )}
      </div>
    </div>
  );
}
