import { useState } from 'react';
import type { useSkinScanner } from '@/hooks/useSkinScanner';
import type { RoutineProduct, RoutineCategory } from '@/types/skinScanner';

interface RoutineScreenProps {
  scanner: ReturnType<typeof useSkinScanner>;
}

const CATEGORY_LABELS: Record<RoutineCategory, string> = {
  cleanser: 'Cleanser',
  toner: 'Toner',
  serum: 'Serum',
  treatment: 'Treatment',
  eyeCream: 'Eye Cream',
  moisturizer: 'Moisturizer',
  spf: 'SPF',
};

function safetyColor(score: number): string {
  if (score >= 7) return 'var(--ss-good)';
  if (score >= 4) return 'var(--ss-warn)';
  return 'var(--ss-danger)';
}

function compatibilityColor(score: number): string {
  if (score >= 70) return 'var(--ss-good)';
  if (score >= 40) return 'var(--ss-warn)';
  return 'var(--ss-danger)';
}

// ── Conflict detection ──

interface ConflictWarning {
  message: string;
  severity: 'warn' | 'danger';
}

function hasIngredientCategory(product: RoutineProduct, keywords: string[]): boolean {
  const allIngredients = [
    ...product.scanResult.ingredients.heroActives,
    ...product.scanResult.ingredients.supporting,
    ...product.scanResult.ingredients.baseFiller,
    ...product.scanResult.ingredients.watchOut,
  ];
  return allIngredients.some(ing =>
    keywords.some(kw => ing.name.toLowerCase().includes(kw.toLowerCase()) || ing.purpose.toLowerCase().includes(kw.toLowerCase()))
  );
}

function detectConflicts(products: RoutineProduct[], routineType: 'am' | 'pm'): ConflictWarning[] {
  const warnings: ConflictWarning[] = [];

  const retinolProducts = products.filter(p => hasIngredientCategory(p, ['retinol', 'retinoid', 'tretinoin', 'adapalene', 'retinal']));
  const acidProducts = products.filter(p => hasIngredientCategory(p, ['aha', 'bha', 'glycolic', 'salicylic', 'lactic', 'mandelic']));
  const exfoliants = products.filter(p => hasIngredientCategory(p, ['exfoliant', 'exfoliating', 'peel', 'glycolic', 'salicylic', 'lactic', 'aha', 'bha']));
  const sunSensitizing = products.filter(p => hasIngredientCategory(p, ['retinol', 'retinoid', 'tretinoin', 'aha', 'glycolic', 'lactic', 'vitamin c', 'ascorbic']));
  const hasSPF = products.some(p => p.routineCategory === 'spf');

  // Retinol + AHA/BHA conflict
  if (retinolProducts.length > 0 && acidProducts.length > 0) {
    warnings.push({
      message: 'Retinol + AHA/BHA detected — can cause irritation. Use on alternate nights.',
      severity: 'warn',
    });
  }

  // Multiple exfoliants
  if (exfoliants.length > 1) {
    warnings.push({
      message: 'Multiple exfoliants detected — over-exfoliation risk.',
      severity: 'warn',
    });
  }

  // No SPF in AM with sun-sensitizing actives
  if (routineType === 'am' && sunSensitizing.length > 0 && !hasSPF) {
    warnings.push({
      message: 'Sun-sensitizing actives without SPF — add a sunscreen to your AM routine.',
      severity: 'danger',
    });
  }

  return warnings;
}

export function RoutineScreen({ scanner }: RoutineScreenProps) {
  const { state, removeFromRoutine } = scanner;
  const [activeTab, setActiveTab] = useState<'am' | 'pm'>('am');

  const products = activeTab === 'am' ? state.amRoutine : state.pmRoutine;
  const sortedProducts = [...products].sort((a, b) => a.sortOrder - b.sortOrder);
  const conflicts = detectConflicts(sortedProducts, activeTab);

  return (
    <div>
      {/* Tab toggle */}
      <div
        className="flex rounded-xl p-1 mb-4"
        style={{ background: 'hsl(var(--ss-surface))', border: '1px solid hsl(var(--ss-border-soft))' }}
      >
        <button
          type="button"
          onClick={() => setActiveTab('am')}
          className="flex-1 py-2 rounded-lg text-[13px] font-semibold transition-all"
          style={{
            background: activeTab === 'am' ? 'hsl(var(--ss-accent))' : 'transparent',
            color: activeTab === 'am' ? '#fff' : 'hsl(var(--ss-text-secondary))',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          <span className="flex items-center justify-center gap-1.5">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
            </svg>
            AM Routine
          </span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('pm')}
          className="flex-1 py-2 rounded-lg text-[13px] font-semibold transition-all"
          style={{
            background: activeTab === 'pm' ? 'hsl(var(--ss-accent2, var(--ss-accent)))' : 'transparent',
            color: activeTab === 'pm' ? '#fff' : 'hsl(var(--ss-text-secondary))',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          <span className="flex items-center justify-center gap-1.5">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
            </svg>
            PM Routine
          </span>
        </button>
      </div>

      {/* Conflict warnings */}
      {conflicts.length > 0 && (
        <div className="space-y-2 mb-4">
          {conflicts.map((conflict, i) => (
            <div
              key={i}
              className="flex items-start gap-2 px-3.5 py-2.5 rounded-xl text-[11px] leading-relaxed"
              style={{
                background: `hsl(var(--ss-${conflict.severity === 'danger' ? 'danger' : 'warn'}) / 0.08)`,
                border: `1px solid hsl(var(--ss-${conflict.severity === 'danger' ? 'danger' : 'warn'}) / 0.15)`,
                color: `hsl(var(--ss-${conflict.severity === 'danger' ? 'danger' : 'warn'}))`,
              }}
            >
              <svg className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
                <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
              <span>{conflict.message}</span>
            </div>
          ))}
        </div>
      )}

      {/* Product list */}
      {sortedProducts.length === 0 ? (
        <div className="rounded-xl p-8 text-center" style={{ background: 'hsl(var(--ss-surface))', border: '1px solid hsl(var(--ss-border-soft))' }}>
          <svg
            className="w-12 h-12 mx-auto mb-3"
            style={{ color: 'hsl(var(--ss-text-muted))' }}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
          <p className="text-[13px] font-medium mb-1" style={{ color: 'hsl(var(--ss-text-secondary))' }}>
            Your {activeTab === 'am' ? 'AM' : 'PM'} routine is empty
          </p>
          <p className="text-[11px] leading-relaxed" style={{ color: 'hsl(var(--ss-text-muted))' }}>
            Scan a product and add it here.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {sortedProducts.map((product, stepIndex) => {
            const scan = product.scanResult;
            const instructions = scan.applicationInstructions;
            return (
              <div
                key={product.id}
                className="rounded-xl overflow-hidden"
                style={{
                  background: 'hsl(var(--ss-surface))',
                  border: '1px solid hsl(var(--ss-border-soft))',
                  boxShadow: 'var(--ss-shadow-sm)',
                }}
              >
                <div className="p-3.5">
                  {/* Step label */}
                  <div className="text-[10px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'hsl(var(--ss-accent))' }}>
                    Step {stepIndex + 1} — {CATEGORY_LABELS[product.routineCategory] || product.routineCategory}
                  </div>

                  {/* Product name + scores + delete */}
                  <div className="flex items-center gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-semibold truncate" style={{ color: 'hsl(var(--ss-text))' }}>
                        {scan.productName}
                      </div>
                      {scan.brand && (
                        <div className="text-[10px] truncate" style={{ color: 'hsl(var(--ss-text-muted))' }}>
                          {scan.brand}
                        </div>
                      )}
                    </div>

                    {/* Mini dual scores */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <span
                        className="ss-font-mono text-[10px] font-bold px-1.5 py-0.5 rounded"
                        style={{
                          background: `hsl(${safetyColor(scan.safetyScore)} / 0.12)`,
                          color: `hsl(${safetyColor(scan.safetyScore)})`,
                        }}
                      >
                        {scan.safetyScore}
                      </span>
                      <span
                        className="ss-font-mono text-[10px] font-bold px-1.5 py-0.5 rounded"
                        style={{
                          background: `hsl(${compatibilityColor(scan.compatibilityScore)} / 0.12)`,
                          color: `hsl(${compatibilityColor(scan.compatibilityScore)})`,
                        }}
                      >
                        {scan.compatibilityScore}
                      </span>
                    </div>

                    {/* Delete button */}
                    <button
                      type="button"
                      onClick={() => removeFromRoutine(product.id, activeTab)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all active:scale-[0.9]"
                      style={{
                        background: 'hsl(var(--ss-danger) / 0.08)',
                        border: 'none',
                        cursor: 'pointer',
                      }}
                      aria-label={`Remove ${scan.productName}`}
                    >
                      <svg className="w-3.5 h-3.5" style={{ color: 'hsl(var(--ss-danger))' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                      </svg>
                    </button>
                  </div>

                  {/* Application instructions */}
                  <div className="flex items-center gap-3 mt-2.5 pt-2.5" style={{ borderTop: '1px solid hsl(var(--ss-border-soft) / 0.5)' }}>
                    {instructions.amount && (
                      <div className="flex items-center gap-1">
                        <svg className="w-3 h-3" style={{ color: 'hsl(var(--ss-text-muted))' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 2a10 10 0 1 0 10 10H12V2z"/>
                        </svg>
                        <span className="text-[10px]" style={{ color: 'hsl(var(--ss-text-secondary))' }}>
                          {instructions.amount}
                        </span>
                      </div>
                    )}
                    {instructions.waitTime && (
                      <div className="flex items-center gap-1">
                        <svg className="w-3 h-3" style={{ color: 'hsl(var(--ss-text-muted))' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                        </svg>
                        <span className="text-[10px]" style={{ color: 'hsl(var(--ss-text-secondary))' }}>
                          Wait {instructions.waitTime}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Routine summary */}
      {sortedProducts.length > 0 && (
        <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg mt-4 text-[11px] leading-relaxed"
             style={{ background: 'hsl(var(--ss-accent-soft))', border: '1px solid hsl(var(--ss-accent) / 0.15)', color: 'hsl(var(--ss-accent))' }}>
          <span className="flex-shrink-0 mt-0.5">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>
          </span>
          <span>Apply products in the order shown — thinnest consistency first, thickest last.</span>
        </div>
      )}
    </div>
  );
}
