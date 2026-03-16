import type { ScanResult } from '@/types/supplementStacker';
import type { ScanMode } from './ScanSheet';

interface ScanResultsProps {
  result: ScanResult;
  scanMode: ScanMode;
  onAddToStack: () => void;
  onAddToCart: () => void;
}

function scoreColor(score: number): string {
  if (score >= 70) return 'var(--ss-good)';
  if (score >= 40) return 'var(--ss-warn)';
  return 'var(--ss-danger)';
}

// Demo macros for food mode (in real implementation AI extracts these)
const FOOD_MACROS = { calories: 120, protein: '22g', carbs: '7g', fat: '0g' };

export function ScanResults({ result, scanMode, onAddToStack, onAddToCart }: ScanResultsProps) {
  const goodFindings = result.findings.filter(f => f.status === 'good');
  const isFood = scanMode === 'food';

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
          <div className="ss-font-mono text-[28px] font-bold" style={{ color: `hsl(${scoreColor(result.score)})` }}>
            {result.score}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold truncate" style={{ color: 'hsl(var(--ss-text))' }}>
            {result.productName}
          </div>
          <div className="text-[11px]" style={{ color: 'hsl(var(--ss-text-secondary))' }}>
            {result.verdict}
          </div>
        </div>
      </div>

      {/* Serving alert (supplement mode) */}
      {result.servingAlert && (
        <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg text-[11px] leading-relaxed mb-3"
             style={{ background: 'hsl(var(--ss-warn) / 0.08)', border: '1px solid hsl(var(--ss-warn) / 0.2)', color: 'hsl(var(--ss-warn))' }}>
          <span className="flex-shrink-0">{'\u26A0\uFE0F'}</span>
          <span>{result.servingAlert}</span>
        </div>
      )}

      {/* Macro grid (food mode only) */}
      {isFood && (
        <div className="grid grid-cols-4 gap-1.5 mb-3">
          {[
            { val: FOOD_MACROS.calories, label: 'Calories' },
            { val: FOOD_MACROS.protein, label: 'Protein' },
            { val: FOOD_MACROS.carbs, label: 'Carbs' },
            { val: FOOD_MACROS.fat, label: 'Fat' },
          ].map((m) => (
            <div key={m.label} className="text-center py-2.5 rounded-lg"
                 style={{ background: 'hsl(var(--ss-surface-raised))' }}>
              <div className="ss-font-mono text-[14px] font-bold" style={{ color: 'hsl(var(--ss-text))' }}>{m.val}</div>
              <div className="text-[9px]" style={{ color: 'hsl(var(--ss-text-muted))' }}>{m.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Findings */}
      <div className="text-[11px] font-semibold uppercase tracking-wider mb-2" style={{ color: 'hsl(var(--ss-text-muted))' }}>
        {isFood ? 'Nutrients' : 'Findings'} ({result.findings.length})
      </div>
      <div className="space-y-1.5 mb-4">
        {result.findings.map((finding, i) => (
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
                  <span className={`ml-1.5 inline-block px-1.5 py-0.5 rounded text-[9px] font-semibold ss-badge-${finding.status}`}>
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
