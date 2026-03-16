import { useState } from 'react';

interface ReminderPromptModalProps {
  open: boolean;
  onSelectMethod: (method: 'gcal' | 'apple' | 'ics') => void;
  onCreateAccount: () => void;
  onSkip: () => void;
}

const METHODS = [
  { id: 'gcal' as const, icon: '\uD83D\uDCC5', iconBg: 'rgba(66,133,244,0.1)', name: 'Google Calendar', desc: 'Download .ics for Google Calendar' },
  { id: 'apple' as const, icon: '\uD83C\uDF4E', iconBg: 'hsl(var(--ss-surface-raised))', name: 'Apple Calendar', desc: 'Download .ics for Apple Calendar' },
  { id: 'ics' as const, icon: '\uD83D\uDCE5', iconBg: 'hsl(var(--ss-accent2-soft))', name: 'Download .ics File', desc: 'Works with any calendar app' },
];

export function ReminderPromptModal({ open, onSelectMethod, onCreateAccount, onSkip }: ReminderPromptModalProps) {
  const [selected, setSelected] = useState<'gcal' | 'apple' | 'ics'>('gcal');

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-5"
         style={{ background: 'hsl(0 0% 0% / 0.35)', backdropFilter: 'blur(6px)' }}>
      <div className="w-full max-w-[360px] rounded-2xl p-6"
           style={{ background: 'hsl(var(--ss-bg))', border: '1px solid hsl(var(--ss-border))', boxShadow: 'var(--ss-shadow-lg)' }}>
        <h2 className="ss-heading text-lg mb-1.5">Set Daily Reminders?</h2>
        <p className="text-[13px] leading-relaxed mb-5" style={{ color: 'hsl(var(--ss-text-secondary))' }}>
          Never miss a supplement window. Pick your calendar and we'll create recurring reminders.
        </p>

        {/* Method selector */}
        <div className="space-y-2 mb-5">
          {METHODS.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => { setSelected(m.id); onSelectMethod(m.id); }}
              className="w-full flex items-center gap-3 p-3.5 rounded-xl text-left transition-all active:scale-[0.98]"
              style={{
                background: selected === m.id ? 'hsl(var(--ss-accent-soft))' : 'hsl(var(--ss-surface))',
                border: `1px solid ${selected === m.id ? 'hsl(var(--ss-accent))' : 'hsl(var(--ss-border))'}`,
              }}
            >
              <span className="w-9 h-9 rounded-lg flex items-center justify-center text-base flex-shrink-0" style={{ background: m.iconBg }}>
                {m.icon}
              </span>
              <div className="flex-1">
                <div className="text-[13px] font-semibold" style={{ color: 'hsl(var(--ss-text))' }}>{m.name}</div>
                <div className="text-[10px]" style={{ color: 'hsl(var(--ss-text-muted))' }}>{m.desc}</div>
              </div>
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all"
                style={{
                  background: selected === m.id ? 'hsl(var(--ss-accent))' : 'transparent',
                  border: `2px solid ${selected === m.id ? 'hsl(var(--ss-accent))' : 'hsl(var(--ss-border))'}`,
                }}
              >
                {selected === m.id && (
                  <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6 9 17l-5-5"/>
                  </svg>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* CTA */}
        <button
          type="button"
          onClick={onCreateAccount}
          className="w-full py-3.5 rounded-xl text-sm font-semibold text-white transition-all active:scale-[0.97] mb-3"
          style={{ background: 'hsl(var(--ss-accent))' }}
        >
          Set Reminders & Create Account
        </button>

        {/* Warning */}
        <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg text-[11px] leading-relaxed mb-3"
             style={{ background: 'hsl(var(--ss-warn) / 0.08)', border: '1px solid hsl(var(--ss-warn) / 0.15)', color: 'hsl(var(--ss-warn))' }}>
          <span className="flex-shrink-0">{'\u26A0\uFE0F'}</span>
          <span>Without an account, your stack will be lost when you close this page.</span>
        </div>

        {/* Skip */}
        <button
          type="button"
          onClick={onSkip}
          className="w-full py-2.5 text-[13px] font-medium bg-transparent border-none cursor-pointer"
          style={{ color: 'hsl(var(--ss-text-muted))' }}
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}
