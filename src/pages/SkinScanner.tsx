import { useState, useEffect } from 'react';
import { useSkinScanner } from '@/hooks/useSkinScanner';
import { SkinProfileWizard } from '@/components/skin-scanner/onboarding/SkinProfileWizard';
import { SkinScannerApp } from '@/components/skin-scanner/SkinScannerApp';

export default function SkinScanner() {
  const scanner = useSkinScanner();

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
        {!scanner.state.skinProfile.onboardingComplete ? (
          <SkinProfileWizard scanner={scanner} />
        ) : (
          <SkinScannerApp scanner={scanner} isDark={isDark} onToggleTheme={toggleTheme} />
        )}
      </div>
    </div>
  );
}
