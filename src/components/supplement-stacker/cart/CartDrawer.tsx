import type { CartItem } from '@/types/supplementStacker';
import type { CartTotals, NutrientTotal } from '@/hooks/useNutritionCart';

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
  items: CartItem[];
  totals: CartTotals;
  gaps: NutrientTotal[];
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
}

// Key nutrients to always show in the progress bars
const TRACKED_NUTRIENTS = ['Vitamin D', 'B12', 'Calcium', 'Zinc', 'Iron', 'Magnesium', 'Omega-3', 'Vitamin C'];

function barColor(pct: number): string {
  if (pct >= 80) return 'var(--ss-good)';
  if (pct >= 40) return 'var(--ss-warn)';
  return 'var(--ss-danger)';
}

export function CartDrawer({ open, onClose, items, totals, gaps, onRemoveItem, onClearCart }: CartDrawerProps) {
  // Build nutrient map for consistent ordering
  const nutrientMap: Record<string, NutrientTotal> = {};
  for (const n of totals.nutrients) {
    nutrientMap[n.name] = n;
  }

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[300]"
        style={{
          background: 'hsl(0 0% 0% / 0.35)',
          backdropFilter: 'blur(4px)',
        }}
        onClick={onClose}
      />

      {/* Drawer — constrained to app width like ScanSheet */}
      <div
        className="fixed inset-0 z-[301] flex justify-center"
        style={{ pointerEvents: 'none' }}
      >
        <div
          className="w-full max-w-[420px] h-full flex flex-col overflow-y-auto"
          style={{
            background: 'hsl(var(--ss-bg))',
            pointerEvents: 'auto',
          }}
        >
        {/* Header */}
        <div className="flex items-center gap-3 px-5 pt-4 pb-3 border-b flex-shrink-0"
             style={{ borderColor: 'hsl(var(--ss-border-soft))' }}>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: 'hsl(var(--ss-surface))', border: '1px solid hsl(var(--ss-border))' }}
          >
            <svg className="w-4 h-4" style={{ color: 'hsl(var(--ss-text-secondary))' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6"/>
            </svg>
          </button>
          <h2 className="ss-heading text-lg flex-1">Nutrition Cart</h2>
          <span
            className="ss-font-mono text-[12px] font-semibold px-2.5 py-1 rounded-full"
            style={{ background: 'hsl(var(--ss-accent))', color: '#fff' }}
          >
            {items.length} item{items.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <EmptyCart />
          ) : (
            <>
              {/* Macro totals */}
              <SectionLabel>Overall Nutrition</SectionLabel>
              <div className="rounded-xl overflow-hidden mb-4"
                   style={{ background: 'hsl(var(--ss-surface))', border: '1px solid hsl(var(--ss-border-soft))' }}>
                <div className="grid grid-cols-4" style={{ borderBottom: '1px solid hsl(var(--ss-border-soft))' }}>
                  <MacroCell value={totals.calories} label="Calories" />
                  <MacroCell value={`${totals.protein}g`} label="Protein" />
                  <MacroCell value={`${totals.carbs}g`} label="Carbs" />
                  <MacroCell value={`${totals.fat}g`} label="Fat" />
                </div>
                <div className="flex items-center justify-between px-3.5 py-2.5"
                     style={{ borderBottom: '1px solid hsl(var(--ss-border-soft))' }}>
                  <span className="text-[11px]" style={{ color: 'hsl(var(--ss-text-muted))' }}>Fiber</span>
                  <span className="ss-font-mono text-[12px] font-semibold" style={{ color: 'hsl(var(--ss-text-secondary))' }}>
                    {totals.fiber}g
                  </span>
                </div>

                {/* Vitamin / mineral bars */}
                <div className="px-3.5 py-3 space-y-2.5">
                  {TRACKED_NUTRIENTS.map((name) => {
                    const n = nutrientMap[name];
                    const pct = n?.dailyValuePct || 0;
                    const capped = Math.min(pct, 100);
                    const color = barColor(pct);
                    return (
                      <div key={name} className="flex items-center gap-2">
                        <span className="w-[72px] text-[11px] font-medium flex-shrink-0"
                              style={{ color: 'hsl(var(--ss-text-secondary))' }}>
                          {name}
                        </span>
                        <div className="flex-1 h-[6px] rounded-[3px] overflow-hidden"
                             style={{ background: 'hsl(var(--ss-surface-raised))' }}>
                          <div
                            className="h-full rounded-[3px] transition-all duration-500"
                            style={{ width: `${capped}%`, background: `hsl(${color})` }}
                          />
                        </div>
                        <span className="ss-font-mono text-[11px] font-semibold w-[36px] text-right flex-shrink-0"
                              style={{ color: `hsl(${color})` }}>
                          {pct}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Gap alert */}
              {gaps.length > 0 && (
                <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl text-[11px] leading-relaxed mb-4"
                     style={{ background: 'hsl(var(--ss-warn) / 0.08)', border: '1px solid hsl(var(--ss-warn) / 0.15)', color: 'hsl(var(--ss-warn))' }}>
                  <span className="flex-shrink-0">{'\u26A0\uFE0F'}</span>
                  <span>
                    <strong>Gaps:</strong> {gaps.map(g => `${g.name} (${g.dailyValuePct}%)`).join(', ')} below 50% DV.
                    Consider adding foods or supplements to fill these.
                  </span>
                </div>
              )}

              {/* Item list */}
              <SectionLabel>Items</SectionLabel>
              <div className="rounded-xl overflow-hidden mb-4"
                   style={{ background: 'hsl(var(--ss-surface))', border: '1px solid hsl(var(--ss-border-soft))' }}>
                {items.map((item, i) => (
                  <div key={item.id}
                       className="flex items-center gap-2.5 px-3.5 py-2.5"
                       style={{ borderBottom: i < items.length - 1 ? '1px solid hsl(var(--ss-border-soft))' : 'none' }}>
                    <div
                      className="w-9 h-9 rounded-[10px] flex items-center justify-center text-[16px] flex-shrink-0"
                      style={{ background: item.type === 'food' ? 'hsl(var(--ss-good) / 0.12)' : 'hsl(var(--ss-accent) / 0.12)' }}
                    >
                      {item.type === 'food' ? '\uD83C\uDF4E' : '\uD83D\uDC8A'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[12px] font-medium truncate" style={{ color: 'hsl(var(--ss-text))' }}>
                        {item.productName}
                      </div>
                      <div className="text-[10px]" style={{ color: 'hsl(var(--ss-text-muted))' }}>
                        {item.type === 'supplement'
                          ? `Supplement${item.score ? ` \u2022 ${item.score}/100` : ''}`
                          : 'Food \u2022 1 serving'
                        }
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => onRemoveItem(item.id)}
                      className="w-[26px] h-[26px] rounded-[7px] flex items-center justify-center text-[13px] flex-shrink-0 border-none cursor-pointer"
                      style={{ background: 'hsl(var(--ss-danger) / 0.1)', color: 'hsl(var(--ss-danger))' }}
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="flex gap-2 pb-4">
                <button
                  type="button"
                  onClick={onClearCart}
                  className="flex-1 py-2.5 rounded-xl text-[12px] font-semibold transition-all active:scale-[0.97]"
                  style={{ background: 'hsl(var(--ss-danger) / 0.08)', color: 'hsl(var(--ss-danger))', border: '1px solid hsl(var(--ss-danger) / 0.15)' }}
                >
                  Clear Cart
                </button>
                <button
                  type="button"
                  className="flex-1 py-2.5 rounded-xl text-[12px] font-semibold transition-all active:scale-[0.97]"
                  style={{ background: 'hsl(var(--ss-good))', color: '#fff' }}
                >
                  Save as Plan
                </button>
              </div>
            </>
          )}
        </div>
        </div>
      </div>
    </>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[11px] font-semibold uppercase tracking-wider mb-2"
         style={{ color: 'hsl(var(--ss-text-muted))' }}>
      {children}
    </div>
  );
}

function MacroCell({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="text-center py-3"
         style={{ borderRight: '1px solid hsl(var(--ss-border-soft))' }}>
      <div className="ss-font-mono text-[16px] font-bold" style={{ color: 'hsl(var(--ss-text))' }}>{value}</div>
      <div className="text-[9px] mt-0.5" style={{ color: 'hsl(var(--ss-text-muted))' }}>{label}</div>
    </div>
  );
}

function EmptyCart() {
  return (
    <div className="text-center py-16">
      <svg className="w-12 h-12 mx-auto mb-3" style={{ color: 'hsl(var(--ss-text-muted))' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
      </svg>
      <h3 className="text-[15px] font-semibold mb-1" style={{ color: 'hsl(var(--ss-text))' }}>Cart is empty</h3>
      <p className="text-[12px] leading-relaxed" style={{ color: 'hsl(var(--ss-text-muted))' }}>
        Scan supplement or food labels and add items<br />to see your daily nutrition totals here.
      </p>
    </div>
  );
}
