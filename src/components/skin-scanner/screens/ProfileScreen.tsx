import { useState } from 'react';
import type { useSkinScanner } from '@/hooks/useSkinScanner';
import { setSkinScannerLoggingOut } from '@/hooks/useSkinScanner';
import { supabase } from '@/integrations/supabase/client';
import { SignupModal } from '@/components/supplement-stacker/modals/SignupModal';

interface ProfileScreenProps {
  scanner: ReturnType<typeof useSkinScanner>;
  isDark: boolean;
  onToggleTheme: () => void;
}

const PROFILE_FIELDS: { key: keyof Pick<ReturnType<typeof useSkinScanner>['state']['skinProfile'], 'skinType' | 'sensitivity' | 'concerns' | 'allergies' | 'ageRange' | 'routineComplexity'>; label: string }[] = [
  { key: 'skinType', label: 'Skin Type' },
  { key: 'sensitivity', label: 'Sensitivity' },
  { key: 'concerns', label: 'Concerns' },
  { key: 'allergies', label: 'Allergies' },
  { key: 'ageRange', label: 'Age Range' },
  { key: 'routineComplexity', label: 'Routine Complexity' },
];

function formatProfileValue(value: unknown): string {
  if (value === null || value === undefined || value === '') return 'Not set';
  if (Array.isArray(value)) return value.length > 0 ? value.join(', ') : 'Not set';
  return String(value);
}

export function ProfileScreen({ scanner, isDark, onToggleTheme }: ProfileScreenProps) {
  const { state, userProfile, setHasAccount } = scanner;
  const [showSignup, setShowSignup] = useState(false);

  const handleSignupSuccess = () => {
    setShowSignup(false);
    setHasAccount(true);
  };

  const handleLogout = () => {
    if (!confirm('This will sign you out and clear all local data. Continue?')) return;
    setSkinScannerLoggingOut();
    supabase.auth.signOut().catch(() => {});
    localStorage.clear();
    window.location.href = '/skin-scanner';
  };

  const totalScans = state.scanHistory.length;
  const amCount = state.amRoutine.length;
  const pmCount = state.pmRoutine.length;

  return (
    <div>
      {/* Avatar row */}
      <div className="flex items-center gap-3 mb-5">
        <div
          className="w-11 h-11 rounded-full flex items-center justify-center text-base font-bold text-white flex-shrink-0"
          style={{ background: 'hsl(var(--ss-accent))' }}
        >
          {userProfile?.name ? userProfile.name.charAt(0).toUpperCase() : state.hasAccount ? 'U' : '?'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-base font-semibold truncate" style={{ color: 'hsl(var(--ss-text))' }}>
            {userProfile?.name || (state.hasAccount ? 'Your Account' : 'Guest Mode')}
          </div>
          <div className="text-[11px] truncate" style={{ color: 'hsl(var(--ss-text-muted))' }}>
            {userProfile?.email || (state.hasAccount ? 'Data saved to your account' : 'Data stored locally only')}
          </div>
        </div>
        {state.hasAccount ? (
          <button
            type="button"
            onClick={handleLogout}
            className="px-4 py-2 rounded-lg text-[12px] font-semibold transition-all active:scale-[0.95] flex-shrink-0"
            style={{ background: 'hsl(var(--ss-danger) / 0.1)', color: 'hsl(var(--ss-danger))', border: '1px solid hsl(var(--ss-danger) / 0.2)' }}
          >
            Log Out
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setShowSignup(true)}
            className="px-4 py-2 rounded-lg text-[12px] font-semibold transition-all active:scale-[0.95] flex-shrink-0"
            style={{ background: 'hsl(var(--ss-accent))', color: '#fff' }}
          >
            Sign In
          </button>
        )}
      </div>

      {/* Guest warning */}
      {!state.hasAccount && (
        <div
          className="flex items-start gap-2 px-3.5 py-3 rounded-xl text-[12px] leading-relaxed mb-4"
          style={{
            background: 'hsl(var(--ss-warn) / 0.08)',
            border: '1px solid hsl(var(--ss-warn) / 0.15)',
            color: 'hsl(var(--ss-warn))',
          }}
        >
          <span className="flex-shrink-0">{'\u26A0\uFE0F'}</span>
          <span>
            You're not signed in. Your scans, routines, and profile will be lost when you close this page.
            Create an account to save everything.
          </span>
        </div>
      )}

      {/* Skin Profile summary */}
      <div className="text-[11px] font-semibold uppercase tracking-wider mb-2" style={{ color: 'hsl(var(--ss-text-muted))' }}>
        Skin Profile
      </div>
      <div className="ss-card p-4 mb-4">
        {PROFILE_FIELDS.map((field, i) => {
          const value = state.skinProfile[field.key];
          const displayValue = formatProfileValue(value);
          const isSet = displayValue !== 'Not set';
          return (
            <div
              key={field.key}
              className="flex items-center justify-between py-3 border-b last:border-b-0"
              style={{ borderColor: 'hsl(var(--ss-border-soft))' }}
            >
              <div className="flex items-center gap-2.5">
                <span style={{ color: 'hsl(var(--ss-text-muted))' }}>
                  <ProfileFieldIcon index={i} />
                </span>
                <span className="text-[13px] font-medium" style={{ color: 'hsl(var(--ss-text))' }}>
                  {field.label}
                </span>
              </div>
              <span
                className="text-[12px] font-medium max-w-[50%] truncate text-right"
                style={{ color: isSet ? 'hsl(var(--ss-text-secondary))' : 'hsl(var(--ss-text-muted))' }}
              >
                {displayValue}
              </span>
            </div>
          );
        })}
      </div>

      {/* Scan stats */}
      <div className="text-[11px] font-semibold uppercase tracking-wider mb-2" style={{ color: 'hsl(var(--ss-text-muted))' }}>
        Stats
      </div>
      <div className="flex gap-2 mb-4">
        <StatCard value={totalScans} label="Total Scans" />
        <StatCard value={amCount} label="AM Products" />
        <StatCard value={pmCount} label="PM Products" />
      </div>

      {/* Theme toggle */}
      <div className="text-[11px] font-semibold uppercase tracking-wider mb-2" style={{ color: 'hsl(var(--ss-text-muted))' }}>
        Preferences
      </div>
      <div className="ss-card p-4 mb-4">
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-medium" style={{ color: 'hsl(var(--ss-text))' }}>Dark Mode</span>
          <button
            type="button"
            onClick={onToggleTheme}
            className="w-10 h-[22px] rounded-full relative transition-all cursor-pointer"
            style={{ background: isDark ? 'hsl(var(--ss-accent))' : 'hsl(var(--ss-border))' }}
          >
            <div
              className="absolute w-[18px] h-[18px] rounded-full bg-white top-[2px] transition-transform"
              style={{
                left: '2px',
                transform: isDark ? 'translateX(18px)' : 'translateX(0)',
                boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
              }}
            />
          </button>
        </div>
      </div>

      {/* Logout button (logged in) */}
      {state.hasAccount && (
        <button
          type="button"
          onClick={handleLogout}
          className="w-full py-3 rounded-xl text-sm font-medium transition-all active:scale-[0.97] mb-4"
          style={{ background: 'hsl(var(--ss-danger) / 0.08)', color: 'hsl(var(--ss-danger))', border: '1px solid hsl(var(--ss-danger) / 0.15)' }}
        >
          Log Out
        </button>
      )}

      {/* Reset Everything — guest only */}
      {!state.hasAccount && (
        <button
          type="button"
          onClick={() => {
            if (confirm('This will clear all your scans, routines, and profile. Continue?')) {
              setSkinScannerLoggingOut();
              localStorage.clear();
              window.location.href = '/skin-scanner';
            }
          }}
          className="w-full py-3 rounded-xl text-sm font-medium transition-all active:scale-[0.97] mb-4"
          style={{ background: 'hsl(var(--ss-danger) / 0.08)', color: 'hsl(var(--ss-danger))', border: '1px solid hsl(var(--ss-danger) / 0.15)' }}
        >
          Reset Everything
        </button>
      )}

      {/* Footer note */}
      <p className="text-[10px] text-center leading-relaxed py-4" style={{ color: 'hsl(var(--ss-text-muted))' }}>
        {state.hasAccount
          ? 'Your data is synced to your account.'
          : 'Your data is stored locally on this device.'}
        <br />
        Not medical advice — consult a dermatologist for skin conditions.
      </p>

      {/* Signup modal */}
      <SignupModal
        open={showSignup}
        onSuccess={handleSignupSuccess}
        onSkip={() => setShowSignup(false)}
        onClose={() => setShowSignup(false)}
      />
    </div>
  );
}

function StatCard({ value, label }: { value: number; label: string }) {
  return (
    <div
      className="flex-1 p-3.5 rounded-xl text-center"
      style={{ background: 'hsl(var(--ss-surface))', border: '1px solid hsl(var(--ss-border-soft))', boxShadow: 'var(--ss-shadow-sm)' }}
    >
      <div className="ss-font-mono text-xl font-semibold" style={{ color: 'hsl(var(--ss-accent))' }}>
        {value}
      </div>
      <div className="text-[10px] font-medium mt-0.5" style={{ color: 'hsl(var(--ss-text-muted))' }}>
        {label}
      </div>
    </div>
  );
}

function ProfileFieldIcon({ index }: { index: number }) {
  const icons = [
    // Skin Type - droplet
    <svg key="0" className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
    </svg>,
    // Sensitivity - shield
    <svg key="1" className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>,
    // Concerns - target
    <svg key="2" className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
    </svg>,
    // Allergies - alert triangle
    <svg key="3" className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>,
    // Age Range - calendar
    <svg key="4" className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
    </svg>,
    // Routine Complexity - layers
    <svg key="5" className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>
    </svg>,
  ];
  return icons[index] || icons[0];
}
