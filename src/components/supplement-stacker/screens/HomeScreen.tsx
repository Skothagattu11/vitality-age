import { useState } from 'react';
import type { useSupplementStacker } from '@/hooks/useSupplementStacker';
import { generateICS, downloadICS } from '@/utils/icsGenerator';

interface HomeScreenProps {
  stacker: ReturnType<typeof useSupplementStacker>;
}

export function HomeScreen({ stacker }: HomeScreenProps) {
  const { state } = stacker;
  const selectedStack = state.stackOptions.find(o => o.id === state.selectedStackOption);
  const slots = selectedStack?.slots ?? [];

  // Track which reminders are "checked off" for today (ephemeral, resets on reload)
  const [checkedSlots, setCheckedSlots] = useState<Set<number>>(new Set());

  const toggleCheck = (index: number) => {
    setCheckedSlots(prev => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const handleExport = () => {
    if (!selectedStack) return;
    const ics = generateICS(selectedStack, state.schedule);
    downloadICS(ics, `supplement-stack-${state.selectedStackOption}.ics`);
  };

  const completedCount = checkedSlots.size;
  const totalSlots = slots.length;

  return (
    <div>
      {/* Greeting */}
      <p className="text-sm font-medium mb-4" style={{ color: 'hsl(var(--ss-text-secondary))' }}>
        {getGreeting()}, here's your daily stack.
      </p>

      {/* Stats row */}
      <div className="flex gap-2 mb-4">
        <StatCard value={state.supplements.length} label="Supplements" />
        <StatCard value={totalSlots} label="Daily Slots" />
        <StatCard value={`${completedCount}/${totalSlots}`} label="Today" />
      </div>

      {/* Today's schedule */}
      <div className="text-[11px] font-semibold uppercase tracking-wider mb-2.5" style={{ color: 'hsl(var(--ss-text-muted))' }}>
        Today's Schedule
      </div>

      {slots.length === 0 ? (
        <div className="ss-card p-6 text-center">
          <p className="text-sm" style={{ color: 'hsl(var(--ss-text-muted))' }}>
            No stack generated yet. Go to Stack tab to build one.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {slots.map((slot, i) => {
            const isDone = checkedSlots.has(i);
            const isPM = slot.time.includes('PM') && !slot.time.startsWith('12');
            return (
              <button
                key={i}
                type="button"
                onClick={() => toggleCheck(i)}
                className={`w-full flex items-center gap-3 p-3.5 rounded-xl text-left relative transition-all active:scale-[0.98] ${isDone ? 'opacity-50' : ''}`}
                style={{
                  background: 'hsl(var(--ss-surface))',
                  border: '1px solid hsl(var(--ss-border-soft))',
                  boxShadow: 'var(--ss-shadow-sm)',
                }}
              >
                {/* Left accent bar */}
                <div
                  className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r"
                  style={{ background: isPM ? 'hsl(var(--ss-accent2))' : 'hsl(var(--ss-accent))' }}
                />

                {/* Time */}
                <span
                  className="ss-font-mono text-[13px] font-semibold min-w-[48px] text-center"
                  style={{ color: isPM ? 'hsl(var(--ss-accent2))' : 'hsl(var(--ss-accent))' }}
                >
                  {slot.time.replace(':00', '')}
                </span>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-semibold" style={{ color: 'hsl(var(--ss-text))' }}>
                    {slot.label.charAt(0).toUpperCase() + slot.label.slice(1)}
                  </div>
                  <div className={`text-[11px] leading-snug ${isDone ? 'line-through' : ''}`} style={{ color: 'hsl(var(--ss-text-secondary))' }}>
                    {slot.supplements.join(', ')}
                  </div>
                </div>

                {/* Checkbox */}
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all"
                  style={{
                    background: isDone ? 'hsl(var(--ss-accent))' : 'transparent',
                    border: `2px solid ${isDone ? 'hsl(var(--ss-accent))' : 'hsl(var(--ss-border))'}`,
                  }}
                >
                  {isDone && (
                    <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6 9 17l-5-5"/>
                    </svg>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Export to Calendar — only when active stack exists */}
      {selectedStack && slots.length > 0 && (
        <>
          <div className="text-[11px] font-semibold uppercase tracking-wider mt-5 mb-2" style={{ color: 'hsl(var(--ss-text-muted))' }}>
            Export to Calendar
          </div>
          <div className="ss-card p-3 mb-4">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleExport}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-[12px] font-semibold transition-all active:scale-[0.97]"
                style={{ background: 'hsl(var(--ss-accent-soft))', color: 'hsl(var(--ss-accent))', border: '1px solid hsl(var(--ss-accent) / 0.2)' }}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                Google Calendar
              </button>
              <button
                type="button"
                onClick={handleExport}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-[12px] font-semibold transition-all active:scale-[0.97]"
                style={{ background: 'hsl(var(--ss-surface))', color: 'hsl(var(--ss-text-secondary))', border: '1px solid hsl(var(--ss-border))' }}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                Download .ics
              </button>
            </div>
          </div>
        </>
      )}

      {/* Tip */}
      {slots.length > 0 && (
        <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg mt-2 text-[11px] leading-relaxed"
             style={{ background: 'hsl(var(--ss-accent-soft))', border: '1px solid hsl(var(--ss-accent) / 0.15)', color: 'hsl(var(--ss-accent))' }}>
          <span className="flex-shrink-0 mt-0.5">&#x1F4A1;</span>
          <span>Tap each reminder when you take your supplements to track your daily progress.</span>
        </div>
      )}
    </div>
  );
}

function StatCard({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="flex-1 p-3.5 rounded-xl text-center"
         style={{ background: 'hsl(var(--ss-surface))', border: '1px solid hsl(var(--ss-border-soft))', boxShadow: 'var(--ss-shadow-sm)' }}>
      <div className="ss-font-mono text-xl font-semibold" style={{ color: 'hsl(var(--ss-accent))' }}>
        {value}
      </div>
      <div className="text-[10px] font-medium mt-0.5" style={{ color: 'hsl(var(--ss-text-muted))' }}>
        {label}
      </div>
    </div>
  );
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}
