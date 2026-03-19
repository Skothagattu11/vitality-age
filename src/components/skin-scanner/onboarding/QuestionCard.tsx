import { useState } from 'react';

export interface QuestionCardProps {
  question: string;
  tooltip: string;
  options: string[];
  selected: string | string[] | null;
  multiSelect?: boolean;
  maxSelections?: number;
  allowCustom?: boolean;
  customValues?: string[];
  onSelect: (value: string | string[] | null) => void;
  onCustomAdd?: (value: string) => void;
  onCustomRemove?: (value: string) => void;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}

export function QuestionCard({
  question,
  tooltip,
  options,
  selected,
  multiSelect = false,
  maxSelections,
  allowCustom = false,
  customValues = [],
  onSelect,
  onCustomAdd,
  onCustomRemove,
  onNext,
  onBack,
  onSkip,
}: QuestionCardProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [customInput, setCustomInput] = useState('');

  const isSelected = (option: string): boolean => {
    if (selected === null) return false;
    if (Array.isArray(selected)) return selected.includes(option);
    return selected === option;
  };

  const isNotSureSelected = selected === null && !Array.isArray(selected);
  // Distinguish between "nothing selected yet" and "explicitly chose not sure"
  // We track "not sure" as a special null state — if selected is null AND we have
  // no array, it could be initial or explicit. We'll use a sentinel approach:
  // For single-select: null means not sure was chosen if the user clicked it.
  // For multi-select: empty array [] means nothing chosen yet, null means not sure.
  const hasSelection =
    selected !== null
      ? Array.isArray(selected)
        ? selected.length > 0 || customValues.length > 0
        : true
      : false;

  const handleOptionClick = (option: string) => {
    if (multiSelect) {
      const currentArr = Array.isArray(selected) ? selected : [];
      if (currentArr.includes(option)) {
        const next = currentArr.filter(v => v !== option);
        onSelect(next.length > 0 ? next : []);
      } else {
        if (maxSelections && currentArr.length >= maxSelections) return;
        onSelect([...currentArr, option]);
      }
    } else {
      onSelect(option === selected ? null : option);
    }
  };

  const handleNotSure = () => {
    onSelect(null);
  };

  const handleCustomAdd = () => {
    const trimmed = customInput.trim();
    if (!trimmed || !onCustomAdd) return;
    if (customValues.includes(trimmed)) return;
    onCustomAdd(trimmed);
    setCustomInput('');
  };

  const handleCustomKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCustomAdd();
    }
  };

  const canProceed = hasSelection || selected === null || customValues.length > 0;

  return (
    <div className="flex flex-col flex-1">
      {/* Question header */}
      <div className="mb-6">
        <div className="flex items-start gap-2 mb-1">
          <h2
            className="text-lg font-semibold flex-1"
            style={{ color: 'hsl(var(--ss-text))' }}
          >
            {question}
          </h2>
          <button
            type="button"
            onClick={() => setShowTooltip(!showTooltip)}
            className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all"
            style={{
              background: showTooltip
                ? 'hsl(var(--ss-accent))'
                : 'hsl(var(--ss-surface-raised))',
              color: showTooltip
                ? 'white'
                : 'hsl(var(--ss-text-secondary))',
              border: `1px solid ${showTooltip ? 'hsl(var(--ss-accent))' : 'hsl(var(--ss-border))'}`,
            }}
            aria-label="Show info"
          >
            i
          </button>
        </div>

        {/* Expandable tooltip info section */}
        <div
          className="overflow-hidden transition-all duration-200"
          style={{
            maxHeight: showTooltip ? '200px' : '0px',
            opacity: showTooltip ? 1 : 0,
          }}
        >
          <div
            className="mt-2 px-3 py-2.5 rounded-lg text-[13px] leading-relaxed"
            style={{
              background: 'hsl(var(--ss-accent) / 0.08)',
              color: 'hsl(var(--ss-text-secondary))',
              border: '1px solid hsl(var(--ss-accent) / 0.15)',
            }}
          >
            {tooltip}
          </div>
        </div>
      </div>

      {/* Options grid */}
      <div className="flex flex-wrap gap-2 mb-4">
        {options.map(option => (
          <button
            key={option}
            type="button"
            onClick={() => handleOptionClick(option)}
            className="px-4 py-2.5 rounded-xl text-sm font-medium transition-all active:scale-[0.96]"
            style={{
              background: isSelected(option)
                ? 'hsl(var(--ss-accent))'
                : 'hsl(var(--ss-surface-raised))',
              color: isSelected(option)
                ? 'white'
                : 'hsl(var(--ss-text))',
              border: `1.5px solid ${
                isSelected(option)
                  ? 'hsl(var(--ss-accent))'
                  : 'hsl(var(--ss-border))'
              }`,
              boxShadow: isSelected(option)
                ? '0 2px 8px hsl(var(--ss-accent) / 0.25)'
                : 'none',
            }}
          >
            {option}
          </button>
        ))}

        {/* "I'm not sure" option */}
        <button
          type="button"
          onClick={handleNotSure}
          className="px-4 py-2.5 rounded-xl text-sm font-medium transition-all active:scale-[0.96]"
          style={{
            background:
              selected === null && isNotSureSelected
                ? 'hsl(var(--ss-text-muted) / 0.15)'
                : 'hsl(var(--ss-surface-raised))',
            color: 'hsl(var(--ss-text-secondary))',
            border: `1.5px solid ${
              selected === null && isNotSureSelected
                ? 'hsl(var(--ss-text-muted) / 0.3)'
                : 'hsl(var(--ss-border-soft))'
            }`,
            fontStyle: 'italic',
          }}
        >
          I'm not sure
        </button>
      </div>

      {/* Custom values display (for allergies etc.) */}
      {allowCustom && customValues.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {customValues.map(val => (
            <span
              key={val}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm"
              style={{
                background: 'hsl(var(--ss-accent) / 0.12)',
                color: 'hsl(var(--ss-accent))',
                border: '1px solid hsl(var(--ss-accent) / 0.25)',
              }}
            >
              {val}
              <button
                type="button"
                onClick={() => onCustomRemove?.(val)}
                className="ml-0.5 hover:opacity-70 transition-opacity"
                aria-label={`Remove ${val}`}
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Custom input field */}
      {allowCustom && (
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={customInput}
            onChange={e => setCustomInput(e.target.value)}
            onKeyDown={handleCustomKeyDown}
            placeholder="Other (type and press Enter)"
            className="flex-1 px-3 py-2.5 rounded-xl text-sm outline-none transition-all"
            style={{
              background: 'hsl(var(--ss-surface-raised))',
              color: 'hsl(var(--ss-text))',
              border: '1.5px solid hsl(var(--ss-border))',
            }}
            onFocus={e => {
              e.currentTarget.style.borderColor = 'hsl(var(--ss-accent))';
            }}
            onBlur={e => {
              e.currentTarget.style.borderColor = 'hsl(var(--ss-border))';
            }}
          />
          <button
            type="button"
            onClick={handleCustomAdd}
            disabled={!customInput.trim()}
            className="px-3 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-[0.96] disabled:opacity-40"
            style={{
              background: 'hsl(var(--ss-accent))',
              color: 'white',
            }}
          >
            Add
          </button>
        </div>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Footer navigation */}
      <div className="pt-4 space-y-3">
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onBack}
            className="px-5 py-3 rounded-xl text-sm font-semibold transition-all active:scale-[0.97]"
            style={{
              background: 'hsl(var(--ss-surface-raised))',
              color: 'hsl(var(--ss-text-secondary))',
              border: '1px solid hsl(var(--ss-border))',
            }}
          >
            Back
          </button>
          <button
            type="button"
            onClick={onNext}
            disabled={!canProceed}
            className="flex-1 py-3 rounded-xl text-sm font-semibold text-white transition-all active:scale-[0.97] disabled:opacity-40"
            style={{ background: 'hsl(var(--ss-accent))' }}
          >
            Next
          </button>
        </div>
        <button
          type="button"
          onClick={onSkip}
          className="w-full py-2 text-[13px] font-medium transition-opacity hover:opacity-70"
          style={{ color: 'hsl(var(--ss-text-muted))' }}
        >
          Skip this question
        </button>
      </div>
    </div>
  );
}
