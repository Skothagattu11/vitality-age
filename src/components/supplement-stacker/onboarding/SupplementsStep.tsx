import { useState } from 'react';
import type { Supplement, SupplementTiming } from '@/types/supplementStacker';
import { SUPPLEMENT_CATALOG, SUPPLEMENT_CATEGORIES, getCatalogSupplement } from '@/utils/supplementCatalog';
import { SupplementRow } from '../shared/SupplementRow';

interface SupplementsStepProps {
  supplements: Supplement[];
  onToggle: (supplement: Supplement) => void;
  onRemove: (id: string) => void;
  onNext: () => void;
  onBack: () => void;
}

const TIMING_OPTIONS: { value: SupplementTiming; label: string }[] = [
  { value: 'empty-stomach', label: 'Empty stomach' },
  { value: 'before-breakfast', label: 'Before breakfast' },
  { value: 'after-breakfast', label: 'After breakfast' },
  { value: 'after-lunch', label: 'After lunch' },
  { value: 'before-dinner', label: 'Before dinner' },
  { value: 'after-dinner', label: 'After dinner' },
  { value: 'before-workout', label: 'Before workout' },
  { value: 'after-workout', label: 'After workout' },
];

export function SupplementsStep({ supplements, onToggle, onRemove, onNext, onBack }: SupplementsStepProps) {
  const [customName, setCustomName] = useState('');
  const [customTiming, setCustomTiming] = useState<SupplementTiming>('after-breakfast');
  const selectedIds = new Set(supplements.map(s => s.id));

  const addCustom = () => {
    if (!customName.trim()) return;
    const id = `custom-${customName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
    const timingLabel = TIMING_OPTIONS.find(t => t.value === customTiming)?.label || customTiming;
    onToggle({
      id,
      name: customName.trim(),
      dose: timingLabel,
      isCustom: true,
      timing: customTiming === 'after-breakfast' || customTiming === 'before-breakfast' || customTiming === 'empty-stomach'
        ? 'morning'
        : customTiming === 'after-lunch' ? 'midday'
        : 'evening',
    });
    setCustomName('');
    setCustomTiming('after-breakfast');
  };

  return (
    <div className="flex flex-col flex-1">
      <div className="mb-2">
        <div className="text-[11px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'hsl(var(--ss-accent))' }}>
          Step 3 of 4
        </div>
        <h2 className="ss-heading text-xl mb-1">Your Supplements</h2>
        <p className="text-[13px] leading-relaxed" style={{ color: 'hsl(var(--ss-text-secondary))' }}>
          Select what you take or want to start. You can also add custom ones.
        </p>
      </div>

      <div className="flex-1 mt-4 space-y-5 overflow-y-auto" style={{ maxHeight: 'calc(100dvh - 280px)' }}>
        {/* Categories with grid layout */}
        {SUPPLEMENT_CATEGORIES.map((cat) => (
          <div key={cat.label}>
            <div className="text-[11px] font-semibold uppercase tracking-wider mb-2" style={{ color: 'hsl(var(--ss-text-muted))' }}>
              {cat.label}
            </div>
            <div className="grid grid-cols-3 gap-2">
              {cat.ids.map((id) => {
                const catalog = getCatalogSupplement(id);
                if (!catalog) return null;
                const isActive = selectedIds.has(id);
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => onToggle({
                      id: catalog.id,
                      name: catalog.name,
                      dose: catalog.defaultDose,
                      isCustom: false,
                      timing: catalog.timing === 'any' ? undefined : catalog.timing,
                      withFood: catalog.withFood,
                    })}
                    className="flex flex-col items-center gap-1.5 p-3 rounded-xl text-center transition-all active:scale-[0.95]"
                    style={{
                      background: isActive ? 'hsl(var(--ss-accent-soft))' : 'hsl(var(--ss-surface))',
                      border: `1.5px solid ${isActive ? 'hsl(var(--ss-accent))' : 'hsl(var(--ss-border))'}`,
                    }}
                  >
                    <span className="text-xl leading-none">{catalog.icon}</span>
                    <span
                      className="text-[11px] font-medium leading-tight"
                      style={{ color: isActive ? 'hsl(var(--ss-accent))' : 'hsl(var(--ss-text-secondary))' }}
                    >
                      {catalog.name}
                    </span>
                    {isActive && (
                      <svg className="w-3.5 h-3.5" style={{ color: 'hsl(var(--ss-accent))' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 6 9 17l-5-5"/>
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {/* Custom supplement input */}
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wider mb-2" style={{ color: 'hsl(var(--ss-text-muted))' }}>
            Add Custom
          </div>
          <div className="space-y-2 mb-3">
            <input
              type="text"
              placeholder="Supplement name"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addCustom()}
              className="w-full px-3 py-2.5 rounded-lg text-[13px]"
              style={{
                background: 'hsl(var(--ss-surface-raised))',
                border: '1px solid hsl(var(--ss-border))',
                color: 'hsl(var(--ss-text))',
              }}
            />
            <div className="flex gap-2">
              <select
                value={customTiming}
                onChange={(e) => setCustomTiming(e.target.value as SupplementTiming)}
                className="flex-1 px-3 py-2.5 rounded-lg text-[13px] appearance-none"
                style={{
                  background: 'hsl(var(--ss-surface-raised))',
                  border: '1px solid hsl(var(--ss-border))',
                  color: 'hsl(var(--ss-text))',
                }}
              >
                {TIMING_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={addCustom}
                disabled={!customName.trim()}
                className="px-4 py-2.5 rounded-lg text-sm font-semibold transition-all active:scale-[0.95] disabled:opacity-40"
                style={{
                  background: 'hsl(var(--ss-accent-soft))',
                  color: 'hsl(var(--ss-accent))',
                  border: '1px solid hsl(var(--ss-accent) / 0.2)',
                }}
              >
                + Add
              </button>
            </div>
          </div>
        </div>

        {/* Selected supplements list */}
        {supplements.length > 0 && (
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider mb-2" style={{ color: 'hsl(var(--ss-text-muted))' }}>
              Your Stack ({supplements.length})
            </div>
            {supplements.map((supp) => (
              <SupplementRow
                key={supp.id}
                name={supp.name}
                dose={supp.dose}
                onRemove={() => onRemove(supp.id)}
              />
            ))}
          </div>
        )}
      </div>

      <div className="pt-4 flex gap-2">
        <button type="button" onClick={onBack}
          className="flex-1 py-3 rounded-xl text-sm font-medium transition-all active:scale-[0.97]"
          style={{ background: 'transparent', color: 'hsl(var(--ss-text-secondary))', border: '1px solid hsl(var(--ss-border))' }}>
          Back
        </button>
        <button type="button" onClick={onNext}
          disabled={supplements.length === 0}
          className="flex-1 py-3 rounded-xl text-sm font-semibold text-white transition-all active:scale-[0.97] disabled:opacity-40"
          style={{ background: 'hsl(var(--ss-accent))' }}>
          Build My Stack
        </button>
      </div>
    </div>
  );
}
