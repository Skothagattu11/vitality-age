import { useState } from 'react';
import type { useSupplementStacker } from '@/hooks/useSupplementStacker';
import type { SupplementTiming, StackOption } from '@/types/supplementStacker';
import { SUPPLEMENT_CATEGORIES, getCatalogSupplement } from '@/utils/supplementCatalog';
import { SupplementRow } from '../shared/SupplementRow';
import { TimeSlotCard } from '../shared/TimeSlotCard';

interface StackScreenProps {
  stacker: ReturnType<typeof useSupplementStacker>;
}

type StackView = 'saved' | 'editing' | 'results';

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

export function StackScreen({ stacker }: StackScreenProps) {
  const { state, toggleSupplement, removeSupplement, addSupplement, setSelectedStack, generateStacks } = stacker;
  const [customName, setCustomName] = useState('');
  const [customTiming, setCustomTiming] = useState<SupplementTiming>('after-breakfast');
  const selectedIds = new Set(state.supplements.map(s => s.id));
  const selectedStack = state.stackOptions.find(o => o.id === state.selectedStackOption);

  // View state: show saved stack, editing supplements, or picking from results
  const hasStack = state.stackOptions.length > 0 && selectedStack && selectedStack.slots.length > 0;
  const [view, setView] = useState<StackView>(hasStack ? 'saved' : 'editing');
  const [pendingSelection, setPendingSelection] = useState<string>(state.selectedStackOption);

  const addCustom = () => {
    if (!customName.trim()) return;
    const id = `custom-${customName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
    const timingLabel = TIMING_OPTIONS.find(t => t.value === customTiming)?.label || customTiming;
    addSupplement({
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

  const handleGenerate = () => {
    generateStacks();
    setPendingSelection(state.selectedStackOption);
    setView('results');
  };

  const handleSaveSelection = () => {
    setSelectedStack(pendingSelection as 'simple' | 'optimal');
    setView('saved');
  };

  // ── SAVED VIEW: Show the active stack ──
  if (view === 'saved' && hasStack) {
    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'hsl(var(--ss-text-muted))' }}>
              Active Stack
            </div>
            <div className="text-base font-semibold" style={{ color: 'hsl(var(--ss-text))' }}>
              {selectedStack.name}
            </div>
          </div>
          <span
            className="ss-font-mono text-[11px] font-semibold px-2.5 py-1 rounded-full"
            style={{ background: 'hsl(var(--ss-accent-soft))', color: 'hsl(var(--ss-accent))' }}
          >
            {selectedStack.slots.length} slots
          </span>
        </div>

        {/* Description */}
        <p className="text-[12px] mb-4" style={{ color: 'hsl(var(--ss-text-secondary))' }}>
          {selectedStack.description}
        </p>

        {/* Interaction alerts */}
        {state.interactions.length > 0 && (
          <div className="mb-4">
            {state.interactions.map((note, i) => (
              <div
                key={i}
                className="flex items-start gap-2 px-3 py-2.5 rounded-lg text-[11px] leading-relaxed mb-1.5"
                style={{
                  background: note.type === 'synergy' ? 'hsl(var(--ss-good) / 0.08)' : 'hsl(var(--ss-warn) / 0.08)',
                  border: `1px solid ${note.type === 'synergy' ? 'hsl(var(--ss-good) / 0.2)' : 'hsl(var(--ss-warn) / 0.2)'}`,
                  color: note.type === 'synergy' ? 'hsl(var(--ss-good))' : 'hsl(var(--ss-warn))',
                }}
              >
                <span className="flex-shrink-0">{note.type === 'synergy' ? '\u2728' : '\u2194\uFE0F'}</span>
                <span>{note.message}</span>
              </div>
            ))}
          </div>
        )}

        {/* Time slots */}
        <div className="text-[11px] font-semibold uppercase tracking-wider mb-2" style={{ color: 'hsl(var(--ss-text-muted))' }}>
          Daily Schedule
        </div>
        <div className="mb-4">
          {selectedStack.slots.map((slot, i) => (
            <TimeSlotCard key={i} slot={slot} />
          ))}
        </div>

        {/* Supplements list */}
        <div className="text-[11px] font-semibold uppercase tracking-wider mb-2" style={{ color: 'hsl(var(--ss-text-muted))' }}>
          Supplements ({state.supplements.length})
        </div>
        <div className="ss-card p-3 mb-5">
          {state.supplements.map((supp) => (
            <div key={supp.id} className="flex items-center gap-2.5 py-2 border-b last:border-b-0" style={{ borderColor: 'hsl(var(--ss-border-soft))' }}>
              <span className="text-[12px] font-medium flex-1" style={{ color: 'hsl(var(--ss-text))' }}>{supp.name}</span>
              <span className="text-[10px]" style={{ color: 'hsl(var(--ss-text-muted))' }}>{supp.dose}</span>
            </div>
          ))}
        </div>

        {/* Create new stack button */}
        <button
          type="button"
          onClick={() => setView('editing')}
          className="w-full py-3 rounded-xl text-sm font-semibold transition-all active:scale-[0.97]"
          style={{ background: 'hsl(var(--ss-surface))', color: 'hsl(var(--ss-accent))', border: '1.5px solid hsl(var(--ss-accent))' }}
        >
          Create New Stack
        </button>

        <p className="text-[10px] text-center mt-2" style={{ color: 'hsl(var(--ss-text-muted))' }}>
          This will replace your current stack
        </p>
      </div>
    );
  }

  // ── RESULTS VIEW: Pick from generated options ──
  if (view === 'results' && state.stackOptions.length > 0) {
    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'hsl(var(--ss-text-muted))' }}>
              Choose Your Plan
            </div>
            <div className="text-base font-semibold" style={{ color: 'hsl(var(--ss-text))' }}>
              Select a stack to save
            </div>
          </div>
          <button
            type="button"
            onClick={() => setView('editing')}
            className="text-[12px] font-medium px-3 py-1.5 rounded-lg transition-all active:scale-[0.95]"
            style={{ background: 'hsl(var(--ss-surface))', color: 'hsl(var(--ss-text-secondary))', border: '1px solid hsl(var(--ss-border))' }}
          >
            Back
          </button>
        </div>

        {/* Interaction alerts */}
        {state.interactions.length > 0 && (
          <div className="mb-4">
            {state.interactions.map((note, i) => (
              <div
                key={i}
                className="flex items-start gap-2 px-3 py-2.5 rounded-lg text-[11px] leading-relaxed mb-1.5"
                style={{
                  background: note.type === 'synergy' ? 'hsl(var(--ss-good) / 0.08)' : 'hsl(var(--ss-warn) / 0.08)',
                  border: `1px solid ${note.type === 'synergy' ? 'hsl(var(--ss-good) / 0.2)' : 'hsl(var(--ss-warn) / 0.2)'}`,
                  color: note.type === 'synergy' ? 'hsl(var(--ss-good))' : 'hsl(var(--ss-warn))',
                }}
              >
                <span className="flex-shrink-0">{note.type === 'synergy' ? '\u2728' : '\u2194\uFE0F'}</span>
                <span>{note.message}</span>
              </div>
            ))}
          </div>
        )}

        {/* Stack option cards */}
        <div className="space-y-3 mb-5">
          {state.stackOptions.map((opt) => {
            const isSelected = pendingSelection === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setPendingSelection(opt.id)}
                className="w-full text-left rounded-xl p-4 transition-all active:scale-[0.98]"
                style={{
                  background: 'hsl(var(--ss-surface))',
                  border: `1.5px solid ${isSelected ? 'hsl(var(--ss-accent))' : 'hsl(var(--ss-border))'}`,
                  boxShadow: isSelected ? '0 0 16px hsl(var(--ss-accent) / 0.15)' : 'var(--ss-shadow-sm)',
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[14px] font-semibold" style={{ color: 'hsl(var(--ss-text))' }}>
                    {opt.name}
                  </span>
                  {opt.isRecommended && (
                    <span
                      className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                      style={{ background: 'hsl(var(--ss-accent))', color: '#fff' }}
                    >
                      Recommended
                    </span>
                  )}
                  {isSelected && (
                    <svg className="w-5 h-5 ml-auto flex-shrink-0" style={{ color: 'hsl(var(--ss-accent))' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6 9 17l-5-5"/>
                    </svg>
                  )}
                </div>
                <p className="text-[11px] mb-3" style={{ color: 'hsl(var(--ss-text-secondary))' }}>
                  {opt.description}
                </p>
                <div className="space-y-1">
                  {opt.slots.map((slot, i) => (
                    <TimeSlotCard key={i} slot={slot} />
                  ))}
                </div>
              </button>
            );
          })}
        </div>

        {/* Save button */}
        <button
          type="button"
          onClick={handleSaveSelection}
          className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all active:scale-[0.97]"
          style={{ background: 'hsl(var(--ss-accent))' }}
        >
          Save Stack
        </button>
      </div>
    );
  }

  // ── EDITING VIEW: Supplement catalog + generate ──
  return (
    <div>
      {/* Header with back option if coming from saved view */}
      {hasStack && (
        <div className="flex items-center justify-between mb-4">
          <div className="text-base font-semibold" style={{ color: 'hsl(var(--ss-text))' }}>
            Build New Stack
          </div>
          <button
            type="button"
            onClick={() => setView('saved')}
            className="text-[12px] font-medium px-3 py-1.5 rounded-lg transition-all active:scale-[0.95]"
            style={{ background: 'hsl(var(--ss-surface))', color: 'hsl(var(--ss-text-secondary))', border: '1px solid hsl(var(--ss-border))' }}
          >
            Cancel
          </button>
        </div>
      )}

      {/* Supplement grid by category */}
      {SUPPLEMENT_CATEGORIES.map((cat) => (
        <div key={cat.label} className="mb-4">
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
                  onClick={() => toggleSupplement({
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

      {/* Custom input with timing dropdown */}
      <div className="mb-5">
        <div className="text-[11px] font-semibold uppercase tracking-wider mb-2" style={{ color: 'hsl(var(--ss-text-muted))' }}>
          Add Custom
        </div>
        <div className="space-y-2">
          <input
            type="text"
            placeholder="Supplement name"
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addCustom()}
            className="w-full px-3 py-2.5 rounded-lg text-[13px]"
            style={{ background: 'hsl(var(--ss-surface-raised))', border: '1px solid hsl(var(--ss-border))', color: 'hsl(var(--ss-text))' }}
          />
          <div className="flex gap-2">
            <select
              value={customTiming}
              onChange={(e) => setCustomTiming(e.target.value as SupplementTiming)}
              className="flex-1 px-3 py-2.5 rounded-lg text-[13px] appearance-none"
              style={{ background: 'hsl(var(--ss-surface-raised))', border: '1px solid hsl(var(--ss-border))', color: 'hsl(var(--ss-text))' }}
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
              style={{ background: 'hsl(var(--ss-accent-soft))', color: 'hsl(var(--ss-accent))', border: '1px solid hsl(var(--ss-accent) / 0.2)' }}
            >
              + Add
            </button>
          </div>
        </div>
      </div>

      {/* Current supplements */}
      <div className="text-[11px] font-semibold uppercase tracking-wider mb-2" style={{ color: 'hsl(var(--ss-text-muted))' }}>
        Your Supplements ({state.supplements.length})
      </div>
      {state.supplements.length === 0 ? (
        <p className="text-sm py-4 text-center" style={{ color: 'hsl(var(--ss-text-muted))' }}>
          No supplements added yet.
        </p>
      ) : (
        <div className="mb-5">
          {state.supplements.map((supp) => (
            <SupplementRow
              key={supp.id}
              name={supp.name}
              dose={supp.dose}
              onRemove={() => removeSupplement(supp.id)}
            />
          ))}
        </div>
      )}

      {/* Generate button */}
      {state.supplements.length > 0 && (
        <button
          type="button"
          onClick={handleGenerate}
          className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all active:scale-[0.97] mb-3"
          style={{ background: 'hsl(var(--ss-accent))' }}
        >
          Generate Stack
        </button>
      )}
    </div>
  );
}
