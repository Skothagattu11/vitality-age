import type { ScanResult, NutrientEntry } from '@/types/supplementStacker';
import type { ScanMode } from './ScanSheet';

interface ScanResultsProps {
  result: ScanResult;
  scanMode: ScanMode;
  macros?: { calories: number; protein: number; carbs: number; fat: number; fiber: number };
  nutrients?: NutrientEntry[];
  onAddToStack: () => void;
  onAddToCart: () => void;
}

function scoreColor(score: number): string {
  if (score >= 70) return 'var(--ss-good)';
  if (score >= 40) return 'var(--ss-warn)';
  return 'var(--ss-danger)';
}

function scoreLabel(score: number): string {
  if (score >= 80) return 'Excellent';
  if (score >= 70) return 'Good';
  if (score >= 50) return 'Average';
  if (score >= 30) return 'Below Average';
  return 'Poor';
}

function scoreMessage(score: number, goodCount: number, warnCount: number, badCount: number): string {
  if (score >= 80) return `Top-tier supplement. ${goodCount} quality ingredients with excellent bioavailability.`;
  if (score >= 70) return `Good quality overall. ${goodCount} solid ingredients${warnCount > 0 ? `, ${warnCount} could be improved` : ''}.`;
  if (score >= 50) return `Decent but has room for improvement. ${warnCount} ingredients use suboptimal forms.`;
  if (score >= 30) return `Several concerns found. ${badCount + warnCount} ingredients need attention.`;
  return `Significant quality issues. Consider a better alternative.`;
}

function nutrientQualityColor(quality?: string): string {
  if (quality === 'good') return 'var(--ss-good)';
  if (quality === 'poor') return 'var(--ss-danger)';
  return 'var(--ss-warn)';
}

function dvColor(pct: number): string {
  if (pct >= 20) return 'var(--ss-good)';
  if (pct >= 5) return 'var(--ss-warn)';
  return 'var(--ss-text-muted)';
}

export function ScanResults({ result, scanMode, macros, nutrients, onAddToStack, onAddToCart }: ScanResultsProps) {
  const goodFindings = result.findings.filter(f => f.status === 'good');
  const warnFindings = result.findings.filter(f => f.status === 'warn');
  const badFindings = result.findings.filter(f => f.status === 'bad');
  const isFood = scanMode === 'food';

  // Use real macros from API if available
  const displayMacros = macros || { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };
  const hasMacros = displayMacros.calories > 0 || displayMacros.protein > 0;
  const displayNutrients = nutrients || [];

  return (
    <div>
      {/* Score + product info */}
      <div className="flex items-center gap-3 p-3.5 rounded-xl mb-3"
           style={{ background: 'hsl(var(--ss-surface))', border: '1px solid hsl(var(--ss-border-soft))' }}>
        {isFood ? (
          <div className="w-[44px] h-[44px] rounded-xl flex items-center justify-center text-[22px] flex-shrink-0"
               style={{ background: 'hsl(var(--ss-good) / 0.12)' }}>
            {'\uD83C\uDF4E'}
          </div>
        ) : (
          <div className="flex flex-col items-center flex-shrink-0" style={{ minWidth: '50px' }}>
            <div className="ss-font-mono text-[28px] font-bold leading-none" style={{ color: `hsl(${scoreColor(result.score)})` }}>
              {result.score}
            </div>
            <div className="text-[9px] font-semibold uppercase tracking-wider mt-0.5"
                 style={{ color: `hsl(${scoreColor(result.score)})` }}>
              {scoreLabel(result.score)}
            </div>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold truncate" style={{ color: 'hsl(var(--ss-text))' }}>
            {result.productName}
          </div>
          {result.brand && (
            <div className="text-[10px]" style={{ color: 'hsl(var(--ss-text-muted))' }}>
              {result.brand}
            </div>
          )}
          <div className="text-[11px] mt-0.5" style={{ color: 'hsl(var(--ss-text-secondary))' }}>
            {result.verdict}
          </div>
        </div>
      </div>

      {/* Score summary message (supplement mode) */}
      {!isFood && result.score > 0 && (
        <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg text-[11px] leading-relaxed mb-3"
             style={{
               background: `hsl(${scoreColor(result.score)} / 0.08)`,
               border: `1px solid hsl(${scoreColor(result.score)} / 0.15)`,
               color: `hsl(${scoreColor(result.score)})`,
             }}>
          <span className="flex-shrink-0">
            {result.score >= 70 ? '\u2705' : result.score >= 50 ? '\uD83D\uDFE1' : '\u26A0\uFE0F'}
          </span>
          <span>{scoreMessage(result.score, goodFindings.length, warnFindings.length, badFindings.length)}</span>
        </div>
      )}

      {/* Serving alert */}
      {result.servingAlert && (
        <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg text-[11px] leading-relaxed mb-3"
             style={{ background: 'hsl(var(--ss-warn) / 0.08)', border: '1px solid hsl(var(--ss-warn) / 0.2)', color: 'hsl(var(--ss-warn))' }}>
          <span className="flex-shrink-0">{'\u26A0\uFE0F'}</span>
          <span>{result.servingAlert}</span>
        </div>
      )}

      {/* Macro grid */}
      {hasMacros && (
        <div className="grid grid-cols-5 gap-1.5 mb-3">
          {[
            { val: displayMacros.calories, label: 'Cal', unit: '', decimals: 0 },
            { val: displayMacros.protein, label: 'Protein', unit: 'g', decimals: 1 },
            { val: displayMacros.carbs, label: 'Carbs', unit: 'g', decimals: 1 },
            { val: displayMacros.fat, label: 'Fat', unit: 'g', decimals: 1 },
            { val: displayMacros.fiber, label: 'Fiber', unit: 'g', decimals: 1 },
          ].map((m) => (
            <div key={m.label} className="text-center py-2.5 rounded-lg"
                 style={{ background: 'hsl(var(--ss-surface-raised))' }}>
              <div className="ss-font-mono text-[13px] font-bold" style={{ color: 'hsl(var(--ss-text))' }}>
                {m.decimals === 0 ? Math.round(m.val) : m.val.toFixed(1)}{m.unit}
              </div>
              <div className="text-[8px]" style={{ color: 'hsl(var(--ss-text-muted))' }}>{m.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Findings summary counts */}
      <div className="flex gap-2 mb-3">
        {goodFindings.length > 0 && (
          <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-full"
                style={{ background: 'hsl(var(--ss-good) / 0.1)', color: 'hsl(var(--ss-good))' }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'hsl(var(--ss-good))' }} />
            {goodFindings.length} Good
          </span>
        )}
        {warnFindings.length > 0 && (
          <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-full"
                style={{ background: 'hsl(var(--ss-warn) / 0.1)', color: 'hsl(var(--ss-warn))' }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'hsl(var(--ss-warn))' }} />
            {warnFindings.length} Caution
          </span>
        )}
        {badFindings.length > 0 && (
          <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-full"
                style={{ background: 'hsl(var(--ss-danger) / 0.1)', color: 'hsl(var(--ss-danger))' }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'hsl(var(--ss-danger))' }} />
            {badFindings.length} Issue{badFindings.length > 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Nutrient details table (from _nutrients array) */}
      {displayNutrients.length > 0 && (
        <>
          <div className="text-[11px] font-semibold uppercase tracking-wider mb-2" style={{ color: 'hsl(var(--ss-text-muted))' }}>
            Nutrition Facts ({displayNutrients.length})
          </div>
          <div className="rounded-xl overflow-hidden mb-3" style={{ border: '1px solid hsl(var(--ss-border-soft))' }}>
            {displayNutrients.map((n, i) => (
              <div key={i} className="flex items-center justify-between px-3 py-2"
                   style={{
                     background: i % 2 === 0 ? 'hsl(var(--ss-surface))' : 'transparent',
                     borderBottom: i < displayNutrients.length - 1 ? '1px solid hsl(var(--ss-border-soft) / 0.5)' : 'none',
                   }}>
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ background: `hsl(${nutrientQualityColor(n.quality)})` }}
                  />
                  <span className="text-[11px] font-medium truncate" style={{ color: 'hsl(var(--ss-text))' }}>
                    {n.name}
                    {n.form && (
                      <span className="text-[9px] ml-1" style={{ color: 'hsl(var(--ss-text-muted))' }}>
                        ({n.form})
                      </span>
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="ss-font-mono text-[11px] font-medium" style={{ color: 'hsl(var(--ss-text-secondary))' }}>
                    {n.amount}{n.unit}
                  </span>
                  {n.dailyValuePct > 0 && (
                    <span className="ss-font-mono text-[10px] font-semibold min-w-[36px] text-right" style={{ color: `hsl(${dvColor(n.dailyValuePct)})` }}>
                      {n.dailyValuePct}%
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Findings — grouped by status: bad first, then warn, then good */}
      {result.findings.length > 0 && (
        <>
          <div className="text-[11px] font-semibold uppercase tracking-wider mb-2" style={{ color: 'hsl(var(--ss-text-muted))' }}>
            {isFood ? 'Highlights' : 'Findings'} ({result.findings.length})
          </div>
          <div className="space-y-1.5 mb-4">
            {[...badFindings, ...warnFindings, ...goodFindings].map((finding, i) => (
              <div key={i} className="flex items-start gap-2 p-2.5 rounded-lg"
                   style={{ background: 'hsl(var(--ss-surface))', border: '1px solid hsl(var(--ss-border-soft))' }}>
                <span
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-[6px]"
                  style={{ background: `hsl(${finding.status === 'good' ? 'var(--ss-good)' : finding.status === 'warn' ? 'var(--ss-warn)' : 'var(--ss-danger)'})` }}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold" style={{ color: 'hsl(var(--ss-text))' }}>
                    {finding.name}
                    {finding.tag && (
                      <span
                        className="ml-1.5 inline-block px-1.5 py-0.5 rounded text-[9px] font-semibold"
                        style={{
                          background: `hsl(${finding.status === 'good' ? 'var(--ss-good)' : finding.status === 'warn' ? 'var(--ss-warn)' : 'var(--ss-danger)'} / 0.12)`,
                          color: `hsl(${finding.status === 'good' ? 'var(--ss-good)' : finding.status === 'warn' ? 'var(--ss-warn)' : 'var(--ss-danger)'})`,
                        }}
                      >
                        {finding.tag}
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] mt-0.5 leading-snug" style={{ color: 'hsl(var(--ss-text-secondary))' }}>
                    {finding.detail}
                  </div>
                </div>
                {(finding.dose || finding.absorbed) && (
                  <div className="ss-font-mono text-[11px] text-right flex-shrink-0" style={{ color: 'hsl(var(--ss-text-secondary))' }}>
                    {finding.dose && <div>{finding.dose}</div>}
                    {finding.absorbed && <div className="text-[9px]" style={{ color: 'hsl(var(--ss-text-muted))' }}>{finding.absorbed}</div>}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* Action buttons */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onAddToCart}
          className="flex-1 py-3 rounded-xl text-sm font-semibold transition-all active:scale-[0.97]"
          style={{ background: 'hsl(var(--ss-good))', color: '#fff' }}
        >
          Add to Cart
        </button>
        {!isFood && goodFindings.length > 0 && (
          <button
            type="button"
            onClick={onAddToStack}
            className="flex-1 py-3 rounded-xl text-sm font-semibold transition-all active:scale-[0.97]"
            style={{ background: 'hsl(var(--ss-accent-soft))', color: 'hsl(var(--ss-accent))', border: '1px solid hsl(var(--ss-accent) / 0.2)' }}
          >
            Add to Stack
          </button>
        )}
      </div>
    </div>
  );
}
