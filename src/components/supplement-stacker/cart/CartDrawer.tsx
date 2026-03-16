import { useState } from 'react';
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
  onSavePlan?: () => void;
}

function barColor(pct: number): string {
  if (pct >= 80) return 'var(--ss-good)';
  if (pct >= 40) return 'var(--ss-warn)';
  return 'var(--ss-danger)';
}

export function CartDrawer({ open, onClose, items, totals, gaps, onRemoveItem, onClearCart, onSavePlan }: CartDrawerProps) {
  const [itemsExpanded, setItemsExpanded] = useState(false);

  if (!open) return null;

  // Show ALL nutrients that have data, sorted by DV% (highest first)
  const allNutrients = totals.nutrients.filter(n => n.totalAmount > 0);

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

      {/* Drawer */}
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
              {/* Items dropdown — above nutrition */}
              <div className="rounded-xl overflow-hidden mb-4"
                   style={{ background: 'hsl(var(--ss-surface))', border: '1px solid hsl(var(--ss-border-soft))' }}>
                <button
                  type="button"
                  onClick={() => setItemsExpanded(!itemsExpanded)}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 border-none cursor-pointer"
                  style={{ background: 'transparent' }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'hsl(var(--ss-text-muted))' }}>
                      Items ({items.length})
                    </span>
                    {/* Show small avatars when collapsed */}
                    {!itemsExpanded && (
                      <div className="flex -space-x-1.5">
                        {items.slice(0, 4).map((item) => (
                          <div
                            key={item.id}
                            className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] border-2"
                            style={{
                              background: item.type === 'food' ? 'hsl(var(--ss-good) / 0.15)' : 'hsl(var(--ss-accent) / 0.15)',
                              borderColor: 'hsl(var(--ss-surface))',
                            }}
                          >
                            {item.type === 'food' ? '\uD83C\uDF4E' : '\uD83D\uDC8A'}
                          </div>
                        ))}
                        {items.length > 4 && (
                          <div
                            className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold border-2"
                            style={{
                              background: 'hsl(var(--ss-surface-raised))',
                              borderColor: 'hsl(var(--ss-surface))',
                              color: 'hsl(var(--ss-text-muted))',
                            }}
                          >
                            +{items.length - 4}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <svg
                    className="w-4 h-4 transition-transform"
                    style={{
                      color: 'hsl(var(--ss-text-muted))',
                      transform: itemsExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                    }}
                    viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  >
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </button>

                {itemsExpanded && (
                  <div style={{ borderTop: '1px solid hsl(var(--ss-border-soft))' }}>
                    {items.map((item, i) => (
                      <div key={item.id}
                           className="flex items-center gap-2.5 px-3.5 py-2.5"
                           style={{ borderBottom: i < items.length - 1 ? '1px solid hsl(var(--ss-border-soft) / 0.5)' : 'none' }}>
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-[14px] flex-shrink-0"
                          style={{ background: item.type === 'food' ? 'hsl(var(--ss-good) / 0.12)' : 'hsl(var(--ss-accent) / 0.12)' }}
                        >
                          {item.type === 'food' ? '\uD83C\uDF4E' : '\uD83D\uDC8A'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[11px] font-medium truncate" style={{ color: 'hsl(var(--ss-text))' }}>
                            {item.productName}
                          </div>
                          <div className="text-[9px]" style={{ color: 'hsl(var(--ss-text-muted))' }}>
                            {item.type === 'supplement'
                              ? `Supplement${item.score ? ` \u2022 ${item.score}/100` : ''}`
                              : `${Math.round(item.macros.calories)} cal \u2022 ${Math.round(item.macros.protein)}g protein`
                            }
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => onRemoveItem(item.id)}
                          className="w-[22px] h-[22px] rounded-md flex items-center justify-center text-[11px] flex-shrink-0 border-none cursor-pointer"
                          style={{ background: 'hsl(var(--ss-danger) / 0.1)', color: 'hsl(var(--ss-danger))' }}
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                    <div className="px-3.5 py-2" style={{ borderTop: '1px solid hsl(var(--ss-border-soft))' }}>
                      <button
                        type="button"
                        onClick={onClearCart}
                        className="w-full py-1.5 rounded-lg text-[10px] font-semibold transition-all active:scale-[0.97] border-none cursor-pointer"
                        style={{ background: 'hsl(var(--ss-danger) / 0.08)', color: 'hsl(var(--ss-danger))' }}
                      >
                        Clear All
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Macro totals */}
              <SectionLabel>Daily Totals</SectionLabel>
              <div className="rounded-xl overflow-hidden mb-4"
                   style={{ background: 'hsl(var(--ss-surface))', border: '1px solid hsl(var(--ss-border-soft))' }}>
                <div className="grid grid-cols-5" style={{ borderBottom: '1px solid hsl(var(--ss-border-soft))' }}>
                  <MacroCell value={totals.calories} label="Cal" />
                  <MacroCell value={`${totals.protein}g`} label="Protein" />
                  <MacroCell value={`${totals.carbs}g`} label="Carbs" />
                  <MacroCell value={`${totals.fat}g`} label="Fat" />
                  <MacroCell value={`${totals.fiber}g`} label="Fiber" last />
                </div>

                {/* All vitamin / mineral bars — dynamic */}
                {allNutrients.length > 0 && (
                  <div className="px-3.5 py-3 space-y-2">
                    {allNutrients.map((n) => {
                      const pct = n.dailyValuePct;
                      const capped = Math.min(pct, 100);
                      const color = barColor(pct);
                      return (
                        <div key={n.name} className="flex items-center gap-2">
                          <span className="w-[76px] text-[10px] font-medium flex-shrink-0 truncate"
                                style={{ color: 'hsl(var(--ss-text-secondary))' }}>
                            {n.name}
                          </span>
                          <div className="flex-1 h-[5px] rounded-[3px] overflow-hidden"
                               style={{ background: 'hsl(var(--ss-surface-raised))' }}>
                            <div
                              className="h-full rounded-[3px] transition-all duration-500"
                              style={{ width: `${capped}%`, background: `hsl(${color})` }}
                            />
                          </div>
                          <span className="ss-font-mono text-[10px] font-semibold w-[44px] text-right flex-shrink-0"
                                style={{ color: `hsl(${color})` }}>
                            {pct > 0 ? `${pct}%` : `${n.totalAmount}${n.unit}`}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Gap alert */}
              {gaps.length > 0 && (
                <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl text-[11px] leading-relaxed mb-4"
                     style={{ background: 'hsl(var(--ss-warn) / 0.08)', border: '1px solid hsl(var(--ss-warn) / 0.15)', color: 'hsl(var(--ss-warn))' }}>
                  <span className="flex-shrink-0">{'\u26A0\uFE0F'}</span>
                  <span>
                    <strong>Gaps:</strong> {gaps.map(g => `${g.name} (${g.dailyValuePct}%)`).join(', ')} below 50% DV.
                  </span>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pb-4">
                <button
                  type="button"
                  onClick={onSavePlan}
                  disabled={!onSavePlan}
                  className="flex-1 py-2.5 rounded-xl text-[12px] font-semibold transition-all active:scale-[0.97]"
                  style={{ background: 'hsl(var(--ss-good))', color: '#fff', opacity: onSavePlan ? 1 : 0.5 }}
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

function MacroCell({ value, label, last }: { value: string | number; label: string; last?: boolean }) {
  return (
    <div className="text-center py-3"
         style={{ borderRight: last ? 'none' : '1px solid hsl(var(--ss-border-soft))' }}>
      <div className="ss-font-mono text-[14px] font-bold" style={{ color: 'hsl(var(--ss-text))' }}>{value}</div>
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
