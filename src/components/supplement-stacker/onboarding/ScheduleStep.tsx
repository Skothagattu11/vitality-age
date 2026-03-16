import type { UserSchedule } from '@/types/supplementStacker';
import { TimePicker } from '../shared/TimePicker';

const SunIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
  </svg>
);

const CoffeeIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><line x1="6" x2="6" y1="2" y2="4"/><line x1="10" x2="10" y1="2" y2="4"/><line x1="14" x2="14" y1="2" y2="4"/>
  </svg>
);

const UtensilsIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/>
  </svg>
);

const MoonIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
  </svg>
);

interface ScheduleStepProps {
  schedule: UserSchedule;
  onUpdate: (schedule: UserSchedule) => void;
  onNext: () => void;
  onBack: () => void;
}

export function ScheduleStep({ schedule, onUpdate, onNext, onBack }: ScheduleStepProps) {
  const update = (key: keyof UserSchedule, value: string) => {
    onUpdate({ ...schedule, [key]: value });
  };

  return (
    <div className="flex flex-col flex-1">
      <div className="mb-2">
        <div className="text-[11px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'hsl(var(--ss-accent))' }}>
          Step 1 of 4
        </div>
        <h2 className="ss-heading text-xl mb-1">Your Daily Schedule</h2>
        <p className="text-[13px] leading-relaxed" style={{ color: 'hsl(var(--ss-text-secondary))' }}>
          We'll time your supplements around your routine for best absorption.
        </p>
      </div>

      <div className="flex-1 mt-4">
        <TimePicker icon={<SunIcon />} label="Wake up" value={schedule.wakeTime} onChange={(v) => update('wakeTime', v)} />
        <TimePicker icon={<CoffeeIcon />} label="Breakfast" value={schedule.breakfastTime} onChange={(v) => update('breakfastTime', v)} />
        <TimePicker icon={<UtensilsIcon />} label="Lunch" value={schedule.lunchTime} onChange={(v) => update('lunchTime', v)} />
        <TimePicker icon={<MoonIcon />} label="Bedtime" value={schedule.bedTime} onChange={(v) => update('bedTime', v)} />
      </div>

      <div className="pt-4 flex gap-2">
        <button type="button" onClick={onBack}
          className="flex-1 py-3 rounded-xl text-sm font-medium transition-all active:scale-[0.97]"
          style={{ background: 'transparent', color: 'hsl(var(--ss-text-secondary))', border: '1px solid hsl(var(--ss-border))' }}>
          Back
        </button>
        <button type="button" onClick={onNext}
          className="flex-1 py-3 rounded-xl text-sm font-semibold text-white transition-all active:scale-[0.97]"
          style={{ background: 'hsl(var(--ss-accent))' }}>
          Next
        </button>
      </div>
    </div>
  );
}
