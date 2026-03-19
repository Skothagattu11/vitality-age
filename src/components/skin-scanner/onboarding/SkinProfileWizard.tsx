import { useState } from 'react';
import type { useSkinScanner } from '@/hooks/useSkinScanner';

interface StepConfig {
  key: 'skinType' | 'sensitivity' | 'concerns' | 'allergies' | 'ageRange' | 'routineComplexity';
  question: string;
  tooltip: string;
  options: string[];
  multiSelect?: boolean;
  maxSelections?: number;
  allowCustom?: boolean;
}

const STEPS: StepConfig[] = [
  {
    key: 'skinType',
    question: 'Skin Type',
    tooltip: 'Oily: shiny by midday, larger pores. Dry: tight after washing, may flake. Combo: oily T-zone, dry cheeks. Normal: balanced. Sensitive: reacts easily.',
    options: ['Oily', 'Dry', 'Combination', 'Normal', 'Sensitive'],
  },
  {
    key: 'sensitivity',
    question: 'Sensitivity Level',
    tooltip: 'Low: rarely reacts to new products. Medium: occasional redness or irritation. High: often stinging, redness, or breakouts from new products.',
    options: ['Low', 'Medium', 'High'],
  },
  {
    key: 'concerns',
    question: 'Top Concerns',
    tooltip: 'Pick up to 4 so we prioritize ingredients that address them.',
    options: ['Acne & Breakouts', 'Aging & Fine Lines', 'Hyperpigmentation', 'Dryness', 'Redness & Rosacea', 'Large Pores', 'Dullness', 'Dark Circles', 'Sun Damage', 'Texture & Scarring'],
    multiSelect: true,
    maxSelections: 4,
  },
  {
    key: 'allergies',
    question: 'Known Allergies',
    tooltip: 'Common allergens: fragrances, parabens, sulfates, essential oils, lanolin, retinoids. Select any that cause reactions.',
    options: ['Fragrances', 'Parabens', 'Sulfates', 'Essential Oils', 'Lanolin', 'Retinoids', 'AHA/BHA Acids', 'Niacinamide'],
    multiSelect: true,
    allowCustom: true,
  },
  {
    key: 'ageRange',
    question: 'Age Range',
    tooltip: '20s: prevention & hydration. 30s-40s: cell turnover slows. 50+: barrier support & richer formulations.',
    options: ['Under 20', '20-29', '30-39', '40-49', '50-59', '60+'],
  },
  {
    key: 'routineComplexity',
    question: 'Current Routine',
    tooltip: 'Helps us tailor how detailed the application instructions are.',
    options: ['Minimal (1-2)', 'Basic (3-4)', 'Moderate (5-6)', 'Extensive (7+)'],
  },
];

interface SkinProfileWizardProps {
  scanner: ReturnType<typeof useSkinScanner>;
}

export function SkinProfileWizard({ scanner }: SkinProfileWizardProps) {
  const { state, updateSkinProfile, completeOnboarding } = scanner;
  const [showWelcome, setShowWelcome] = useState(true);
  const [expandedTooltip, setExpandedTooltip] = useState<string | null>(null);
  const [customInput, setCustomInput] = useState('');
  const [customAllergies, setCustomAllergies] = useState<string[]>([]);

  const getSelected = (step: StepConfig): string | string[] | null => {
    const val = state.skinProfile[step.key];
    if (step.multiSelect) return Array.isArray(val) ? val : [];
    return val as string | null;
  };

  const handleOptionClick = (step: StepConfig, option: string) => {
    if (step.multiSelect) {
      const current = Array.isArray(state.skinProfile[step.key]) ? (state.skinProfile[step.key] as string[]) : [];
      if (current.includes(option)) {
        updateSkinProfile({ [step.key]: current.filter(v => v !== option) });
      } else {
        if (step.maxSelections && current.length >= step.maxSelections) return;
        updateSkinProfile({ [step.key]: [...current, option] });
      }
    } else {
      const current = state.skinProfile[step.key];
      updateSkinProfile({ [step.key]: current === option ? null : option });
    }
  };

  const handleCustomAdd = () => {
    const trimmed = customInput.trim();
    if (!trimmed) return;
    if (customAllergies.includes(trimmed)) return;
    setCustomAllergies(prev => [...prev, trimmed]);
    const current = Array.isArray(state.skinProfile.allergies) ? state.skinProfile.allergies : [];
    updateSkinProfile({ allergies: [...current, trimmed] });
    setCustomInput('');
  };

  const handleCustomRemove = (val: string) => {
    setCustomAllergies(prev => prev.filter(v => v !== val));
    const current = Array.isArray(state.skinProfile.allergies) ? state.skinProfile.allergies : [];
    updateSkinProfile({ allergies: current.filter(a => a !== val) });
  };

  const isSelected = (step: StepConfig, option: string): boolean => {
    const val = getSelected(step);
    if (val === null) return false;
    if (Array.isArray(val)) return val.includes(option);
    return val === option;
  };

  const answeredCount = STEPS.filter(s => {
    const val = state.skinProfile[s.key];
    if (Array.isArray(val)) return val.length > 0;
    return val !== null;
  }).length;

  if (showWelcome) {
    return (
      <div className="flex flex-col min-h-dvh p-5">
        <div className="flex-1 flex flex-col items-center justify-center text-center px-2">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
               style={{ background: 'hsl(var(--ss-accent) / 0.1)' }}>
            <svg className="w-8 h-8" style={{ color: 'hsl(var(--ss-accent))' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/>
            </svg>
          </div>
          <h1 className="text-2xl font-semibold mb-2" style={{ color: 'hsl(var(--ss-text))' }}>Skin Scanner</h1>
          <p className="text-sm mb-1" style={{ color: 'hsl(var(--ss-text-secondary))' }}>Understand what's in your skincare products</p>
          <p className="text-sm leading-relaxed max-w-xs mt-2" style={{ color: 'hsl(var(--ss-text-muted))' }}>
            Answer a few quick questions about your skin for personalized safety and compatibility scores.
          </p>
          <div className="text-left mt-6 space-y-2.5 w-full max-w-xs">
            {[
              { icon: 'M9 12l2 2 4-4M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z', text: 'Personalized ingredient compatibility' },
              { icon: 'M12 9v4l3 3M22 12A10 10 0 1 1 12 2a10 10 0 0 1 10 10z', text: 'Allergy and sensitivity flags' },
              { icon: 'M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2zM22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z', text: 'Science-backed ingredient analysis' },
            ].map(f => (
              <div key={f.text} className="flex items-center gap-3">
                <svg className="w-4 h-4 flex-shrink-0" style={{ color: 'hsl(var(--ss-accent))' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d={f.icon}/>
                </svg>
                <span className="text-sm" style={{ color: 'hsl(var(--ss-text-secondary))' }}>{f.text}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="pt-4 space-y-3">
          <button type="button" onClick={() => setShowWelcome(false)}
            className="w-full py-3.5 rounded-xl text-sm font-semibold text-white transition-all active:scale-[0.97]"
            style={{ background: 'hsl(var(--ss-accent))' }}>
            Set Up My Profile
          </button>
          <button type="button" onClick={completeOnboarding}
            className="w-full py-2 text-[13px] font-medium transition-opacity hover:opacity-70"
            style={{ color: 'hsl(var(--ss-text-muted))' }}>
            Skip — I'll scan without personalization
          </button>
        </div>
      </div>
    );
  }

  // All questions on one scrollable page
  return (
    <div className="min-h-dvh p-5 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <button type="button" onClick={() => setShowWelcome(true)}
          className="flex items-center gap-1 text-sm font-medium"
          style={{ color: 'hsl(var(--ss-text-secondary))' }}>
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6"/>
          </svg>
          Back
        </button>
        <span className="text-[11px] font-medium" style={{ color: 'hsl(var(--ss-text-muted))' }}>
          {answeredCount}/{STEPS.length} answered
        </span>
      </div>

      <h2 className="text-lg font-semibold mb-1" style={{ color: 'hsl(var(--ss-text))' }}>Your Skin Profile</h2>
      <p className="text-[12px] mb-5" style={{ color: 'hsl(var(--ss-text-muted))' }}>
        Skip any you're unsure about — you can always update later.
      </p>

      {/* All questions stacked */}
      <div className="space-y-4">
        {STEPS.map((step) => {
          const isExpanded = expandedTooltip === step.key;
          return (
            <div key={step.key} className="rounded-xl p-3.5"
                 style={{ background: 'hsl(var(--ss-surface))', border: '1px solid hsl(var(--ss-border-soft))' }}>
              {/* Question header + tooltip toggle */}
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[13px] font-semibold" style={{ color: 'hsl(var(--ss-text))' }}>
                  {step.question}
                  {step.multiSelect && step.maxSelections && (
                    <span className="font-normal text-[11px] ml-1.5" style={{ color: 'hsl(var(--ss-text-muted))' }}>
                      (up to {step.maxSelections})
                    </span>
                  )}
                </span>
                <button type="button" onClick={() => setExpandedTooltip(isExpanded ? null : step.key)}
                  className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 transition-all"
                  style={{
                    background: isExpanded ? 'hsl(var(--ss-accent))' : 'hsl(var(--ss-surface-raised))',
                    color: isExpanded ? '#fff' : 'hsl(var(--ss-text-muted))',
                    border: `1px solid ${isExpanded ? 'hsl(var(--ss-accent))' : 'hsl(var(--ss-border))'}`,
                  }}>
                  i
                </button>
              </div>

              {/* Tooltip */}
              {isExpanded && (
                <div className="mb-2.5 px-2.5 py-2 rounded-lg text-[11px] leading-relaxed"
                     style={{ background: 'hsl(var(--ss-accent) / 0.06)', color: 'hsl(var(--ss-text-secondary))' }}>
                  {step.tooltip}
                </div>
              )}

              {/* Options as chips */}
              <div className="flex flex-wrap gap-1.5">
                {step.options.map(option => (
                  <button key={option} type="button" onClick={() => handleOptionClick(step, option)}
                    className="px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all active:scale-[0.96]"
                    style={{
                      background: isSelected(step, option) ? 'hsl(var(--ss-accent))' : 'hsl(var(--ss-surface-raised))',
                      color: isSelected(step, option) ? '#fff' : 'hsl(var(--ss-text))',
                      border: `1px solid ${isSelected(step, option) ? 'hsl(var(--ss-accent))' : 'hsl(var(--ss-border-soft))'}`,
                    }}>
                    {option}
                  </button>
                ))}
              </div>

              {/* Custom allergies input */}
              {step.allowCustom && (
                <div className="mt-2.5">
                  {customAllergies.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {customAllergies.map(val => (
                        <span key={val} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium"
                              style={{ background: 'hsl(var(--ss-accent) / 0.1)', color: 'hsl(var(--ss-accent))' }}>
                          {val}
                          <button type="button" onClick={() => handleCustomRemove(val)} className="hover:opacity-70">
                            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                            </svg>
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-1.5">
                    <input type="text" value={customInput} onChange={e => setCustomInput(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleCustomAdd(); } }}
                      placeholder="Other ingredient..."
                      className="flex-1 px-2.5 py-1.5 rounded-lg text-[12px] outline-none"
                      style={{ background: 'hsl(var(--ss-surface-raised))', color: 'hsl(var(--ss-text))', border: '1px solid hsl(var(--ss-border-soft))' }}
                    />
                    <button type="button" onClick={handleCustomAdd} disabled={!customInput.trim()}
                      className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-white disabled:opacity-30"
                      style={{ background: 'hsl(var(--ss-accent))' }}>
                      Add
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Save button — sticky at bottom */}
      <div className="sticky bottom-0 pt-4 pb-2 -mx-5 px-5"
           style={{ background: 'linear-gradient(to top, hsl(var(--ss-bg)) 70%, transparent)' }}>
        <button type="button" onClick={completeOnboarding}
          className="w-full py-3.5 rounded-xl text-sm font-semibold text-white transition-all active:scale-[0.97]"
          style={{ background: 'hsl(var(--ss-accent))', boxShadow: '0 2px 12px hsl(var(--ss-accent) / 0.35)' }}>
          {answeredCount > 0 ? `Save Profile (${answeredCount}/${STEPS.length})` : 'Continue Without Profile'}
        </button>
      </div>
    </div>
  );
}
