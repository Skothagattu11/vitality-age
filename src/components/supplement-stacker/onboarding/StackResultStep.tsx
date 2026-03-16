import type { StackOption, InteractionNote } from '@/types/supplementStacker';
import { TimeSlotCard } from '../shared/TimeSlotCard';

interface StackResultStepProps {
  stackOptions: StackOption[];
  interactions: InteractionNote[];
  selectedOption: 'simple' | 'optimal';
  onSelectOption: (option: 'simple' | 'optimal') => void;
  onComplete: () => void;
  onBack: () => void;
}

export function StackResultStep({ stackOptions, interactions, selectedOption, onSelectOption, onComplete, onBack }: StackResultStepProps) {
  return (
    <div className="flex flex-col flex-1">
      <div className="mb-2">
        <div className="text-[11px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'hsl(var(--ss-accent))' }}>
          Your Stack
        </div>
        <h2 className="ss-heading text-xl mb-1">Choose Your Plan</h2>
        <p className="text-[13px] leading-relaxed" style={{ color: 'hsl(var(--ss-text-secondary))' }}>
          We've built 2 options based on your schedule and supplements.
        </p>
      </div>

      <div className="flex-1 mt-4 space-y-3 overflow-y-auto" style={{ maxHeight: 'calc(100dvh - 300px)' }}>
        {/* Interaction notes */}
        {interactions.length > 0 && (
          <div className="space-y-1.5 mb-4">
            {interactions.map((note, i) => (
              <div
                key={i}
                className="flex items-start gap-2 px-3 py-2.5 rounded-lg text-[11px] leading-relaxed"
                style={{
                  background: note.type === 'synergy' ? 'hsl(var(--ss-good) / 0.08)' : note.type === 'warning' ? 'hsl(var(--ss-danger) / 0.08)' : 'hsl(var(--ss-warn) / 0.08)',
                  border: `1px solid ${note.type === 'synergy' ? 'hsl(var(--ss-good) / 0.2)' : note.type === 'warning' ? 'hsl(var(--ss-danger) / 0.2)' : 'hsl(var(--ss-warn) / 0.2)'}`,
                  color: note.type === 'synergy' ? 'hsl(var(--ss-good))' : note.type === 'warning' ? 'hsl(var(--ss-danger))' : 'hsl(var(--ss-warn))',
                }}
              >
                <span className="flex-shrink-0 mt-0.5">
                  {note.type === 'synergy' ? '\u2728' : note.type === 'warning' ? '\u26A0\uFE0F' : '\u2194\uFE0F'}
                </span>
                <span>{note.message}</span>
              </div>
            ))}
          </div>
        )}

        {/* Stack options */}
        {stackOptions.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => onSelectOption(option.id)}
            className="w-full text-left rounded-xl p-4 transition-all active:scale-[0.98]"
            style={{
              background: 'hsl(var(--ss-surface))',
              border: `1.5px solid ${selectedOption === option.id ? 'hsl(var(--ss-accent))' : 'hsl(var(--ss-border))'}`,
              boxShadow: selectedOption === option.id ? '0 0 0 1px hsl(var(--ss-accent))' : 'var(--ss-shadow-sm)',
            }}
          >
            <div className="flex items-start justify-between mb-1">
              <h3 className="text-sm font-bold" style={{ color: 'hsl(var(--ss-text))' }}>
                {option.name}
              </h3>
              {option.isRecommended && (
                <span className="text-[9px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded"
                      style={{ background: 'hsl(var(--ss-accent-soft))', color: 'hsl(var(--ss-accent))' }}>
                  Recommended
                </span>
              )}
            </div>
            <p className="text-[11px] mb-3" style={{ color: 'hsl(var(--ss-text-muted))' }}>
              {option.description}
            </p>
            <div className="space-y-1">
              {option.slots.map((slot, i) => (
                <TimeSlotCard key={i} slot={slot} />
              ))}
            </div>
          </button>
        ))}
      </div>

      <div className="pt-4 flex gap-2">
        <button type="button" onClick={onBack}
          className="flex-1 py-3 rounded-xl text-sm font-medium transition-all active:scale-[0.97]"
          style={{ background: 'transparent', color: 'hsl(var(--ss-text-secondary))', border: '1px solid hsl(var(--ss-border))' }}>
          Back
        </button>
        <button type="button" onClick={onComplete}
          className="flex-1 py-3 rounded-xl text-sm font-semibold text-white transition-all active:scale-[0.97]"
          style={{ background: 'hsl(var(--ss-accent))' }}>
          Save Stack
        </button>
      </div>
    </div>
  );
}
