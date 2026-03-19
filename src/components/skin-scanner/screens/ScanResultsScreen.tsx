import { useState, useEffect } from 'react';
import type { useSkinScanner } from '@/hooks/useSkinScanner';
import type { SkinScanResult, IngredientEntry, RoutineProduct } from '@/types/skinScanner';

// ── Score helpers ──

function safetyColor(score: number): string {
  if (score >= 7) return 'var(--ss-good)';
  if (score >= 4) return 'var(--ss-warn)';
  return 'var(--ss-danger)';
}

function compatColor(score: number): string {
  if (score >= 70) return 'var(--ss-good)';
  if (score >= 40) return 'var(--ss-warn)';
  return 'var(--ss-danger)';
}

function safetyLabel(score: number): string {
  if (score >= 7) return 'Safe';
  if (score >= 4) return 'Moderate';
  return 'Caution';
}

function compatLabel(score: number): string {
  if (score >= 70) return 'Great fit';
  if (score >= 40) return 'Okay fit';
  return 'Poor fit';
}

function statusDot(safety: IngredientEntry['safety']): string {
  if (safety === 'good') return 'var(--ss-good)';
  if (safety === 'moderate') return 'var(--ss-warn)';
  return 'var(--ss-danger)';
}

// ── SVG Arc Gauge ──

function ScoreGauge({
  value,
  max,
  color,
  label,
  sublabel,
  delay = 0,
}: {
  value: number;
  max: number;
  color: string;
  label: string;
  sublabel: string;
  delay?: number;
}) {
  const [animated, setAnimated] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 80 + delay);
    return () => clearTimeout(t);
  }, [delay]);

  const radius = 52;
  const stroke = 7;
  const circumference = 2 * Math.PI * radius;
  const gap = circumference * 0.25; // leave a 25% gap at the bottom
  const usable = circumference - gap;
  const fill = animated ? (value / max) * usable : 0;

  return (
    <div className="flex flex-col items-center" style={{ animationDelay: `${delay}ms` }}>
      <div className="relative" style={{ width: 120, height: 120 }}>
        <svg width="120" height="120" viewBox="0 0 120 120" className="block">
          {/* Background arc */}
          <circle
            cx="60" cy="60" r={radius}
            fill="none"
            stroke="hsl(var(--ss-border-soft))"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${usable} ${gap}`}
            strokeDashoffset={-gap / 2}
            transform="rotate(90 60 60)"
          />
          {/* Value arc */}
          <circle
            cx="60" cy="60" r={radius}
            fill="none"
            stroke={`hsl(${color})`}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${fill} ${circumference - fill}`}
            strokeDashoffset={-gap / 2}
            transform="rotate(90 60 60)"
            style={{
              transition: 'stroke-dasharray 1s cubic-bezier(0.34, 1.56, 0.64, 1)',
              filter: `drop-shadow(0 0 6px hsl(${color} / 0.4))`,
            }}
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="ss-font-mono font-bold leading-none"
            style={{ fontSize: 28, color: `hsl(${color})` }}
          >
            {value}
          </span>
          <span
            className="text-[10px] font-medium mt-0.5"
            style={{ color: 'hsl(var(--ss-text-muted))' }}
          >
            /{max}
          </span>
        </div>
      </div>
      <div className="text-center mt-1">
        <div className="text-[11px] font-bold uppercase tracking-widest" style={{ color: `hsl(${color})` }}>
          {label}
        </div>
        <div className="text-[10px] font-medium" style={{ color: 'hsl(var(--ss-text-muted))' }}>
          {sublabel}
        </div>
      </div>
    </div>
  );
}

// ── Ingredient Row ──

function IngredientRow({ ing }: { ing: IngredientEntry }) {
  const [open, setOpen] = useState(false);
  const dot = statusDot(ing.safety);

  return (
    <button
      type="button"
      onClick={() => setOpen(!open)}
      className="w-full text-left px-3 py-2.5 transition-colors"
      style={{
        background: open ? 'hsl(var(--ss-surface-raised))' : 'transparent',
        borderBottom: '1px solid hsl(var(--ss-border-soft) / 0.5)',
      }}
    >
      <div className="flex items-center gap-2.5">
        <span
          className="w-[7px] h-[7px] rounded-full flex-shrink-0"
          style={{ background: `hsl(${dot})`, boxShadow: `0 0 4px hsl(${dot} / 0.4)` }}
        />
        <span className="text-[12.5px] font-medium flex-1" style={{ color: 'hsl(var(--ss-text))' }}>
          {ing.name}
        </span>
        <span
          className="text-[9px] font-semibold px-2 py-[3px] rounded-full flex-shrink-0"
          style={{
            background: `hsl(${dot} / 0.08)`,
            color: `hsl(${dot})`,
          }}
        >
          {ing.purpose}
        </span>
        <svg
          className="w-3 h-3 flex-shrink-0 transition-transform"
          style={{
            color: 'hsl(var(--ss-text-muted))',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
          strokeLinecap="round" strokeLinejoin="round"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </div>
      {open && (
        <div className="mt-2 ml-[19px] text-[11px] leading-relaxed" style={{ color: 'hsl(var(--ss-text-secondary))' }}>
          {ing.detail}
          {ing.flagReason && (
            <p className="mt-1.5 font-semibold" style={{ color: 'hsl(var(--ss-danger))' }}>
              {ing.flagReason}
            </p>
          )}
        </div>
      )}
    </button>
  );
}

// ── Ingredient Tier Section ──

function IngredientTier({
  label,
  items,
  color,
  defaultOpen,
  delay = 0,
}: {
  label: string;
  items: IngredientEntry[];
  color: string;
  defaultOpen?: boolean;
  delay?: number;
}) {
  const [open, setOpen] = useState(defaultOpen ?? false);
  if (items.length === 0) return null;

  return (
    <div
      className="rounded-2xl overflow-hidden ss-result-tier"
      style={{
        background: 'hsl(var(--ss-surface))',
        border: '1px solid hsl(var(--ss-border-soft))',
        borderLeft: `3px solid hsl(${color})`,
        boxShadow: 'var(--ss-shadow-sm)',
        animationDelay: `${delay}ms`,
      }}
    >
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left"
      >
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: `hsl(${color} / 0.1)` }}
        >
          <span
            className="ss-font-mono text-[14px] font-bold"
            style={{ color: `hsl(${color})` }}
          >
            {items.length}
          </span>
        </div>
        <span className="text-[13px] font-semibold flex-1" style={{ color: 'hsl(var(--ss-text))' }}>
          {label}
        </span>
        <svg
          className="w-4 h-4 flex-shrink-0 transition-transform"
          style={{
            color: `hsl(${color})`,
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
          strokeLinecap="round" strokeLinejoin="round"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      {open && (
        <div>
          {items.map((ing, i) => (
            <IngredientRow key={i} ing={ing} />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main Results Screen ──

interface ScanResultsScreenProps {
  scanner: ReturnType<typeof useSkinScanner>;
  result: SkinScanResult;
  onBack: () => void;
}

export function ScanResultsScreen({ scanner, result, onBack }: ScanResultsScreenProps) {
  const [showVerdict, setShowVerdict] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [addedRoutine, setAddedRoutine] = useState<'am' | 'pm' | null>(null);

  const handleAddToRoutine = (routine: 'am' | 'pm') => {
    const product: RoutineProduct = {
      id: `routine-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      scanResult: result,
      routineCategory: result.applicationInstructions.routineCategory,
      sortOrder: routine === 'am' ? scanner.state.amRoutine.length : scanner.state.pmRoutine.length,
      addedAt: Date.now(),
    };
    scanner.addToRoutine(product, routine);
    setAddedRoutine(routine);
    setTimeout(() => setAddedRoutine(null), 2000);
  };

  const totalIngredients =
    result.ingredients.heroActives.length +
    result.ingredients.supporting.length +
    result.ingredients.baseFiller.length +
    result.ingredients.watchOut.length;

  return (
    <div className="min-h-dvh" style={{ background: 'hsl(var(--ss-bg))' }}>
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 text-[13px] font-medium transition-opacity active:opacity-60"
          style={{ color: 'hsl(var(--ss-text-secondary))' }}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
          Back
        </button>
        <span
          className="text-[10px] font-semibold uppercase tracking-widest"
          style={{ color: 'hsl(var(--ss-text-muted))' }}
        >
          Scan Report
        </span>
      </div>

      <div className="px-5 pb-10">
        {/* ── Product Hero ── */}
        <div className="ss-result-hero mt-2 mb-6" style={{ animationDelay: '0ms' }}>
          <h1
            className="text-[22px] font-bold leading-tight tracking-tight"
            style={{ color: 'hsl(var(--ss-text))', fontFamily: 'var(--ss-font-display)' }}
          >
            {result.productName}
          </h1>
          <div className="flex items-center gap-2.5 mt-1.5">
            {result.brand && (
              <span className="text-[12px] font-medium" style={{ color: 'hsl(var(--ss-text-secondary))' }}>
                {result.brand}
              </span>
            )}
            <span
              className="text-[9px] font-bold px-2 py-[3px] rounded-full uppercase tracking-wider"
              style={{
                background: result.compatibilityConfidence === 'full' ? 'hsl(var(--ss-good) / 0.1)' :
                  result.compatibilityConfidence === 'partial' ? 'hsl(var(--ss-warn) / 0.1)' : 'hsl(var(--ss-text-muted) / 0.1)',
                color: result.compatibilityConfidence === 'full' ? 'hsl(var(--ss-good))' :
                  result.compatibilityConfidence === 'partial' ? 'hsl(var(--ss-warn))' : 'hsl(var(--ss-text-muted))',
              }}
            >
              {result.compatibilityConfidence === 'full' ? 'Personalized' :
                result.compatibilityConfidence === 'partial' ? 'Partial Profile' : 'Generic'}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1">
            <span className="ss-font-mono text-[10px]" style={{ color: 'hsl(var(--ss-text-muted))' }}>
              {totalIngredients} ingredients analyzed
            </span>
          </div>
        </div>

        {/* ── Score Gauges ── */}
        <div
          className="flex items-center justify-center gap-6 rounded-2xl px-5 py-6 mb-5"
          style={{
            background: 'hsl(var(--ss-surface))',
            border: '1px solid hsl(var(--ss-border-soft))',
            boxShadow: 'var(--ss-shadow-md)',
          }}
        >
          <ScoreGauge
            value={result.safetyScore}
            max={10}
            color={safetyColor(result.safetyScore)}
            label={safetyLabel(result.safetyScore)}
            sublabel="Safety Score"
            delay={200}
          />
          <div className="w-px h-20" style={{ background: 'hsl(var(--ss-border))' }} />
          <ScoreGauge
            value={result.compatibilityScore}
            max={100}
            color={compatColor(result.compatibilityScore)}
            label={compatLabel(result.compatibilityScore)}
            sublabel="Compatibility"
            delay={400}
          />
        </div>

        {/* ── Verdict ── */}
        <div className="ss-result-tier" style={{ animationDelay: '300ms' }}>
          <button
            type="button"
            onClick={() => setShowVerdict(!showVerdict)}
            className="w-full flex items-center gap-3 rounded-2xl px-4 py-3.5 mb-4 text-left transition-all"
            style={{
              background: showVerdict ? 'hsl(var(--ss-accent) / 0.06)' : 'hsl(var(--ss-surface))',
              border: `1px solid ${showVerdict ? 'hsl(var(--ss-accent) / 0.2)' : 'hsl(var(--ss-border-soft))'}`,
              boxShadow: 'var(--ss-shadow-sm)',
            }}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: 'hsl(var(--ss-accent) / 0.1)' }}
            >
              <svg className="w-4 h-4" style={{ color: 'hsl(var(--ss-accent))' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
              </svg>
            </div>
            <span className="text-[13px] font-semibold flex-1" style={{ color: 'hsl(var(--ss-text))' }}>
              Verdict
            </span>
            <svg
              className="w-4 h-4 flex-shrink-0 transition-transform"
              style={{
                color: 'hsl(var(--ss-text-muted))',
                transform: showVerdict ? 'rotate(180deg)' : 'rotate(0deg)',
              }}
              viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
              strokeLinecap="round" strokeLinejoin="round"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
          {showVerdict && (
            <div
              className="rounded-2xl px-4 py-3.5 -mt-2 mb-4 text-[12px] leading-relaxed"
              style={{
                background: 'hsl(var(--ss-accent) / 0.04)',
                border: '1px solid hsl(var(--ss-accent) / 0.12)',
                color: 'hsl(var(--ss-text-secondary))',
              }}
            >
              {result.verdict}
            </div>
          )}
        </div>

        {/* ── Section Label: Ingredients ── */}
        <div
          className="flex items-center gap-2 mb-3 ss-result-tier"
          style={{ animationDelay: '350ms' }}
        >
          <div className="text-[10px] font-bold uppercase tracking-[0.15em]" style={{ color: 'hsl(var(--ss-text-muted))' }}>
            Ingredients
          </div>
          <div className="flex-1 h-px" style={{ background: 'hsl(var(--ss-border))' }} />
        </div>

        {/* ── Ingredient Tiers ── */}
        <div className="space-y-3 mb-5">
          <IngredientTier
            label="Watch Out"
            items={result.ingredients.watchOut}
            color="var(--ss-danger)"
            defaultOpen={true}
            delay={400}
          />
          <IngredientTier
            label="Hero Actives"
            items={result.ingredients.heroActives}
            color="var(--ss-good)"
            defaultOpen={true}
            delay={500}
          />
          <IngredientTier
            label="Supporting"
            items={result.ingredients.supporting}
            color="var(--ss-accent)"
            delay={600}
          />
          <IngredientTier
            label="Base & Fillers"
            items={result.ingredients.baseFiller}
            color="var(--ss-text-muted)"
            delay={700}
          />
        </div>

        {/* ── Application Instructions ── */}
        <div className="ss-result-tier" style={{ animationDelay: '600ms' }}>
          <button
            type="button"
            onClick={() => setShowInstructions(!showInstructions)}
            className="w-full flex items-center gap-3 rounded-2xl px-4 py-3.5 mb-4 text-left transition-all"
            style={{
              background: showInstructions ? 'hsl(var(--ss-accent) / 0.06)' : 'hsl(var(--ss-surface))',
              border: `1px solid ${showInstructions ? 'hsl(var(--ss-accent) / 0.2)' : 'hsl(var(--ss-border-soft))'}`,
              boxShadow: 'var(--ss-shadow-sm)',
            }}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: 'hsl(var(--ss-accent) / 0.1)' }}
            >
              <svg className="w-4 h-4" style={{ color: 'hsl(var(--ss-accent))' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <div className="flex-1">
              <span className="text-[13px] font-semibold block" style={{ color: 'hsl(var(--ss-text))' }}>
                How to Apply
              </span>
              <span className="text-[10px]" style={{ color: 'hsl(var(--ss-text-muted))' }}>
                {result.applicationInstructions.timeOfDay === 'AM' ? 'Morning' :
                  result.applicationInstructions.timeOfDay === 'PM' ? 'Evening' : 'AM & PM'}
                {' \u2022 '}
                {result.applicationInstructions.routineStep}
              </span>
            </div>
            <svg
              className="w-4 h-4 flex-shrink-0 transition-transform"
              style={{
                color: 'hsl(var(--ss-text-muted))',
                transform: showInstructions ? 'rotate(180deg)' : 'rotate(0deg)',
              }}
              viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
              strokeLinecap="round" strokeLinejoin="round"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
          {showInstructions && (
            <div
              className="rounded-2xl px-4 py-3.5 -mt-2 mb-4 space-y-2"
              style={{
                background: 'hsl(var(--ss-surface))',
                border: '1px solid hsl(var(--ss-border-soft))',
                color: 'hsl(var(--ss-text-secondary))',
              }}
            >
              <div className="flex items-center gap-2 text-[12px]">
                <span className="font-semibold" style={{ color: 'hsl(var(--ss-text))' }}>Amount:</span>
                {result.applicationInstructions.amount}
              </div>
              {result.applicationInstructions.waitTime && (
                <div className="flex items-center gap-2 text-[12px]">
                  <span className="font-semibold" style={{ color: 'hsl(var(--ss-text))' }}>Wait Time:</span>
                  {result.applicationInstructions.waitTime}
                </div>
              )}
              {result.applicationInstructions.tips.length > 0 && (
                <div className="pt-1 space-y-1.5">
                  {result.applicationInstructions.tips.map((tip, i) => (
                    <div key={i} className="flex items-start gap-2 text-[11px] leading-relaxed">
                      <span className="mt-0.5 w-1 h-1 rounded-full flex-shrink-0" style={{ background: 'hsl(var(--ss-accent))' }} />
                      {tip}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Action Buttons ── */}
        <div className="ss-result-tier space-y-2.5" style={{ animationDelay: '700ms' }}>
          <div className="flex gap-2.5">
            {(result.applicationInstructions.timeOfDay === 'AM' || result.applicationInstructions.timeOfDay === 'both') && (
              <button
                type="button"
                onClick={() => handleAddToRoutine('am')}
                className="flex-1 py-3.5 rounded-2xl text-[13px] font-semibold transition-all active:scale-[0.97]"
                style={{
                  background: addedRoutine === 'am' ? 'hsl(var(--ss-good))' : 'hsl(var(--ss-accent))',
                  color: '#fff',
                  boxShadow: '0 4px 16px hsl(var(--ss-accent) / 0.3)',
                }}
              >
                {addedRoutine === 'am' ? 'Added!' : 'Add to AM Routine'}
              </button>
            )}
            {(result.applicationInstructions.timeOfDay === 'PM' || result.applicationInstructions.timeOfDay === 'both') && (
              <button
                type="button"
                onClick={() => handleAddToRoutine('pm')}
                className="flex-1 py-3.5 rounded-2xl text-[13px] font-semibold transition-all active:scale-[0.97]"
                style={{
                  background: addedRoutine === 'pm' ? 'hsl(var(--ss-good))' :
                    result.applicationInstructions.timeOfDay === 'both' ? 'hsl(var(--ss-surface-raised))' : 'hsl(var(--ss-accent))',
                  color: addedRoutine === 'pm' ? '#fff' :
                    result.applicationInstructions.timeOfDay === 'both' ? 'hsl(var(--ss-text))' : '#fff',
                  border: '1px solid hsl(var(--ss-border))',
                  boxShadow: result.applicationInstructions.timeOfDay === 'both' ? 'none' : '0 4px 16px hsl(var(--ss-accent) / 0.3)',
                }}
              >
                {addedRoutine === 'pm' ? 'Added!' : 'Add to PM Routine'}
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={onBack}
            className="w-full py-3 rounded-2xl text-[12px] font-semibold transition-all active:scale-[0.97]"
            style={{
              background: 'hsl(var(--ss-surface-raised))',
              color: 'hsl(var(--ss-text-secondary))',
              border: '1px solid hsl(var(--ss-border))',
            }}
          >
            Scan Another Product
          </button>
        </div>
      </div>

      {/* ── Animations ── */}
      <style>{`
        .ss-result-hero {
          animation: ssResultFadeUp 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .ss-result-tier {
          animation: ssResultFadeUp 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        @keyframes ssResultFadeUp {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
