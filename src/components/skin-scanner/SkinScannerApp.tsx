import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { useSkinScanner } from '@/hooks/useSkinScanner';
import { BottomNav } from './BottomNav';
import { ScanFAB } from './ScanFAB';
import { ThemeToggle } from '@/components/supplement-stacker/ThemeToggle';
import { ScanSheet } from './scanner/ScanSheet';
import { HomeScreen } from './screens/HomeScreen';
import { RoutineScreen } from './screens/RoutineScreen';
import { ProfileScreen } from './screens/ProfileScreen';

interface SkinScannerAppProps {
  scanner: ReturnType<typeof useSkinScanner>;
  isDark: boolean;
  onToggleTheme: () => void;
}

export function SkinScannerApp({ scanner, isDark, onToggleTheme }: SkinScannerAppProps) {
  const navigate = useNavigate();
  const { state, setScreen } = scanner;
  const [scanOpen, setScanOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Toast auto-dismiss
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 1800);
    return () => clearTimeout(t);
  }, [toast]);

  const renderScreen = () => {
    switch (state.currentScreen) {
      case 'home':
        return <HomeScreen scanner={scanner} />;
      case 'routine':
        return <RoutineScreen scanner={scanner} />;
      case 'profile':
        return <ProfileScreen scanner={scanner} isDark={isDark} onToggleTheme={onToggleTheme} />;
      default:
        return <HomeScreen scanner={scanner} />;
    }
  };

  return (
    <div className="relative min-h-dvh">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-4 pb-3">
        <h1 className="ss-heading text-[22px]">Skin Scanner</h1>
        <div className="flex items-center gap-2">
          <ThemeToggle isDark={isDark} onToggle={onToggleTheme} />

          <button
            onClick={() => navigate('/')}
            className="w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-90"
            style={{ background: 'hsl(var(--ss-surface))', border: '1px solid hsl(var(--ss-border))' }}
            aria-label="Back to hub"
          >
            <svg className="w-4 h-4" style={{ color: 'hsl(var(--ss-text-secondary))' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Guest mode banner */}
      {!state.hasAccount && (
        <div
          className="mx-5 mb-3 flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-[11px] leading-relaxed"
          style={{
            background: 'hsl(var(--ss-warn) / 0.08)',
            border: '1px solid hsl(var(--ss-warn) / 0.15)',
            color: 'hsl(var(--ss-warn))',
          }}
        >
          <span className="flex-shrink-0">{'\u26A0\uFE0F'}</span>
          <span className="flex-1">
            Guest mode — your data will be lost when this session ends.{' '}
            <button
              type="button"
              onClick={() => setScreen('profile')}
              className="font-semibold underline bg-transparent border-none cursor-pointer"
              style={{ color: 'hsl(var(--ss-warn))' }}
            >
              Sign in to save
            </button>
          </span>
        </div>
      )}

      {/* Screen content */}
      <div className="px-5 pb-[calc(64px+env(safe-area-inset-bottom,0px)+24px)]">
        {renderScreen()}
      </div>

      {/* FAB */}
      <ScanFAB onClick={() => setScanOpen(true)} />

      {/* Bottom Nav */}
      <BottomNav currentScreen={state.currentScreen} onNavigate={setScreen} />

      {/* Scan Sheet */}
      <ScanSheet
        open={scanOpen}
        onClose={() => setScanOpen(false)}
        scanner={scanner}
      />

      {/* Toast notification */}
      {toast && (
        <div className="flex justify-center pointer-events-none" style={{ position: 'sticky', top: 0, zIndex: 400 }}>
          <div
            className="px-4 py-2 rounded-xl text-[12px] font-semibold whitespace-nowrap pointer-events-auto"
            style={{
              background: 'hsl(var(--ss-good))',
              color: '#fff',
              boxShadow: '0 4px 20px hsl(var(--ss-good) / 0.35)',
              animation: 'toastIn 0.25s ease',
              marginTop: '4px',
            }}
          >
            {toast}
          </div>
        </div>
      )}

      <style>{`
        @keyframes toastIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
