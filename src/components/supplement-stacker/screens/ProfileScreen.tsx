import { useState } from 'react';
import type { useSupplementStacker } from '@/hooks/useSupplementStacker';
import { SignupModal } from '../modals/SignupModal';

interface ProfileScreenProps {
  stacker: ReturnType<typeof useSupplementStacker>;
  isDark: boolean;
  onToggleTheme: () => void;
}

export function ProfileScreen({ stacker, isDark, onToggleTheme }: ProfileScreenProps) {
  const { state, userProfile, setHasAccount, reset } = stacker;
  const selectedStack = state.stackOptions.find(o => o.id === state.selectedStackOption);
  const [showSignup, setShowSignup] = useState(false);

  const handleSignupSuccess = () => {
    setShowSignup(false);
    setHasAccount(true);
  };

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
        {!state.hasAccount && (
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
            You're not signed in. Your stack, schedule, and preferences will be lost when you close this page.
            Create an account to save everything.
          </span>
        </div>
      )}

      {/* Active stack summary */}
      <div className="text-[11px] font-semibold uppercase tracking-wider mb-2" style={{ color: 'hsl(var(--ss-text-muted))' }}>
        Active Stack
      </div>
      <div className="ss-card p-4 mb-4">
        {selectedStack ? (
          <>
            <div className="text-sm font-semibold mb-2" style={{ color: 'hsl(var(--ss-text))' }}>
              {selectedStack.name}
            </div>
            {selectedStack.slots.map((slot, i) => (
              <div key={i} className="flex items-center gap-2.5 py-2 border-b last:border-b-0" style={{ borderColor: 'hsl(var(--ss-border-soft))' }}>
                <span className="ss-font-mono text-[11px] font-medium flex-shrink-0" style={{ color: 'hsl(var(--ss-accent))' }}>
                  {slot.time}
                </span>
                <span className="text-[11px] flex-1" style={{ color: 'hsl(var(--ss-text-secondary))' }}>
                  {slot.supplements.join(', ')}
                </span>
              </div>
            ))}
          </>
        ) : (
          <p className="text-sm text-center py-2" style={{ color: 'hsl(var(--ss-text-muted))' }}>
            No stack generated yet
          </p>
        )}
      </div>

      {/* Schedule preferences */}
      <div className="text-[11px] font-semibold uppercase tracking-wider mb-2" style={{ color: 'hsl(var(--ss-text-muted))' }}>
        Schedule
      </div>
      <div className="ss-card p-4 mb-4">
        <PrefRow icon={<ClockIcon />} label="Wake up" value={formatTime(state.schedule.wakeTime)} />
        <PrefRow icon={<CoffeeIcon />} label="Breakfast" value={formatTime(state.schedule.breakfastTime)} />
        <PrefRow icon={<UtensilsIcon />} label="Lunch" value={formatTime(state.schedule.lunchTime)} />
        <PrefRow icon={<MoonIcon />} label="Bedtime" value={formatTime(state.schedule.bedTime)} />
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

      {/* Reset */}
      <button
        type="button"
        onClick={() => {
          if (confirm('This will clear your entire stack and settings. Continue?')) {
            reset();
          }
        }}
        className="w-full py-3 rounded-xl text-sm font-medium transition-all active:scale-[0.97] mb-4"
        style={{ background: 'hsl(var(--ss-danger) / 0.08)', color: 'hsl(var(--ss-danger))', border: '1px solid hsl(var(--ss-danger) / 0.15)' }}
      >
        Reset Everything
      </button>

      {/* Footer note */}
      <p className="text-[10px] text-center leading-relaxed py-4" style={{ color: 'hsl(var(--ss-text-muted))' }}>
        Your data is stored locally on this device.
        <br />
        Not medical advice — consult a healthcare provider.
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

function PrefRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-3 border-b last:border-b-0" style={{ borderColor: 'hsl(var(--ss-border-soft))' }}>
      <div className="flex items-center gap-2.5">
        <span style={{ color: 'hsl(var(--ss-text-muted))' }}>{icon}</span>
        <span className="text-[13px] font-medium" style={{ color: 'hsl(var(--ss-text))' }}>{label}</span>
      </div>
      <span className="ss-font-mono text-xs font-medium" style={{ color: 'hsl(var(--ss-text-secondary))' }}>{value}</span>
    </div>
  );
}

function formatTime(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const displayH = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${displayH}:${(m || 0).toString().padStart(2, '0')} ${period}`;
}

// Small inline icons
const ClockIcon = () => (
  <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);
const CoffeeIcon = () => (
  <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/>
  </svg>
);
const UtensilsIcon = () => (
  <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/>
  </svg>
);
const MoonIcon = () => (
  <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
  </svg>
);
