import { useState, useMemo } from 'react';
import type { useSupplementStacker } from '@/hooks/useSupplementStacker';
import type { useNutritionPlans, NutritionPlan } from '@/hooks/useNutritionPlans';
import { generateICS, downloadICS } from '@/utils/icsGenerator';

interface HomeScreenProps {
  stacker: ReturnType<typeof useSupplementStacker>;
  nutritionPlans: ReturnType<typeof useNutritionPlans>;
}

function barColor(pct: number): string {
  if (pct >= 80) return 'var(--ss-good)';
  if (pct >= 40) return 'var(--ss-warn)';
  return 'var(--ss-danger)';
}

export function HomeScreen({ stacker, nutritionPlans }: HomeScreenProps) {
  const { state } = stacker;
  const selectedStack = state.stackOptions.find(o => o.id === state.selectedStackOption);
  const slots = selectedStack?.slots ?? [];

  const [checkedSlots, setCheckedSlots] = useState<Set<number>>(new Set());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [itemsExpanded, setItemsExpanded] = useState(false);
  const [nutritionExpanded, setNutritionExpanded] = useState(false);

  const toggleCheck = (index: number) => {
    setCheckedSlots(prev => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const handleExport = () => {
    if (!selectedStack) return;
    const ics = generateICS(selectedStack, state.schedule);
    downloadICS(ics, `supplement-stack-${state.selectedStackOption}.ics`);
  };

  // Date navigation
  const navigateDate = (offset: number) => {
    setSelectedDate(prev => {
      const d = new Date(prev);
      d.setDate(d.getDate() + offset);
      return d;
    });
    setItemsExpanded(false);
    setNutritionExpanded(false);
  };

  const isToday = useMemo(() => {
    const now = new Date();
    return selectedDate.toDateString() === now.toDateString();
  }, [selectedDate]);

  const dateLabel = useMemo(() => {
    if (isToday) return 'Today';
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (selectedDate.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  }, [selectedDate, isToday]);

  const currentPlan = nutritionPlans.getPlan(selectedDate);

  const completedCount = checkedSlots.size;
  const totalSlots = slots.length;

  return (
    <div>
      {/* Greeting */}
      <p className="text-sm font-medium mb-4" style={{ color: 'hsl(var(--ss-text-secondary))' }}>
        {getGreeting()}, here's your daily stack.
      </p>

      {/* Stats row */}
      <div className="flex gap-2 mb-4">
        <StatCard value={state.supplements.length} label="Supplements" />
        <StatCard value={totalSlots} label="Daily Slots" />
        <StatCard value={`${completedCount}/${totalSlots}`} label="Today" />
      </div>

      {/* ── Nutrition Plan Section ── */}
      <div className="text-[11px] font-semibold uppercase tracking-wider mb-2.5" style={{ color: 'hsl(var(--ss-text-muted))' }}>
        Nutrition Plan
      </div>

      {/* Date navigator */}
      <div className="flex items-center justify-between mb-3 rounded-xl px-3 py-2"
           style={{ background: 'hsl(var(--ss-surface))', border: '1px solid hsl(var(--ss-border-soft))' }}>
        <button
          type="button"
          onClick={() => navigateDate(-1)}
          className="w-8 h-8 rounded-lg flex items-center justify-center border-none cursor-pointer"
          style={{ background: 'hsl(var(--ss-surface-raised))', color: 'hsl(var(--ss-text-secondary))' }}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6"/>
          </svg>
        </button>
        <div className="text-center">
          <div className="text-[13px] font-semibold" style={{ color: 'hsl(var(--ss-text))' }}>{dateLabel}</div>
          <div className="ss-font-mono text-[10px]" style={{ color: 'hsl(var(--ss-text-muted))' }}>
            {nutritionPlans.toDateKey(selectedDate)}
          </div>
        </div>
        <button
          type="button"
          onClick={() => navigateDate(1)}
          disabled={isToday}
          className="w-8 h-8 rounded-lg flex items-center justify-center border-none cursor-pointer"
          style={{
            background: 'hsl(var(--ss-surface-raised))',
            color: 'hsl(var(--ss-text-secondary))',
            opacity: isToday ? 0.3 : 1,
          }}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m9 18 6-6-6-6"/>
          </svg>
        </button>
      </div>

      {/* Saved plan display */}
      {currentPlan ? (
        <SavedPlanCard
          plan={currentPlan}
          itemsExpanded={itemsExpanded}
          nutritionExpanded={nutritionExpanded}
          onToggleItems={() => setItemsExpanded(!itemsExpanded)}
          onToggleNutrition={() => setNutritionExpanded(!nutritionExpanded)}
          onDelete={() => nutritionPlans.deletePlan(selectedDate)}
        />
      ) : (
        <div className="rounded-xl p-5 text-center mb-4"
             style={{ background: 'hsl(var(--ss-surface))', border: '1px solid hsl(var(--ss-border-soft))' }}>
          <svg className="w-8 h-8 mx-auto mb-2" style={{ color: 'hsl(var(--ss-text-muted))' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
          </svg>
          <p className="text-[12px]" style={{ color: 'hsl(var(--ss-text-muted))' }}>
            No nutrition plan saved for this date.
          </p>
          <p className="text-[10px] mt-1" style={{ color: 'hsl(var(--ss-text-muted))' }}>
            Scan items, add to cart, then save as plan.
          </p>
        </div>
      )}

      {/* ── Supplement Schedule Section ── */}
      <div className="text-[11px] font-semibold uppercase tracking-wider mb-2.5 mt-5" style={{ color: 'hsl(var(--ss-text-muted))' }}>
        Today's Schedule
      </div>

      {slots.length === 0 ? (
        <div className="ss-card p-6 text-center">
          <p className="text-sm" style={{ color: 'hsl(var(--ss-text-muted))' }}>
            No stack generated yet. Go to Stack tab to build one.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {slots.map((slot, i) => {
            const isDone = checkedSlots.has(i);
            const isPM = slot.time.includes('PM') && !slot.time.startsWith('12');
            return (
              <button
                key={i}
                type="button"
                onClick={() => toggleCheck(i)}
                className={`w-full flex items-center gap-3 p-3.5 rounded-xl text-left relative transition-all active:scale-[0.98] ${isDone ? 'opacity-50' : ''}`}
                style={{
                  background: 'hsl(var(--ss-surface))',
                  border: '1px solid hsl(var(--ss-border-soft))',
                  boxShadow: 'var(--ss-shadow-sm)',
                }}
              >
                <div
                  className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r"
                  style={{ background: isPM ? 'hsl(var(--ss-accent2))' : 'hsl(var(--ss-accent))' }}
                />
                <span
                  className="ss-font-mono text-[13px] font-semibold min-w-[48px] text-center"
                  style={{ color: isPM ? 'hsl(var(--ss-accent2))' : 'hsl(var(--ss-accent))' }}
                >
                  {slot.time.replace(':00', '')}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-semibold" style={{ color: 'hsl(var(--ss-text))' }}>
                    {slot.label.charAt(0).toUpperCase() + slot.label.slice(1)}
                  </div>
                  <div className={`text-[11px] leading-snug ${isDone ? 'line-through' : ''}`} style={{ color: 'hsl(var(--ss-text-secondary))' }}>
                    {slot.supplements.join(', ')}
                  </div>
                </div>
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all"
                  style={{
                    background: isDone ? 'hsl(var(--ss-accent))' : 'transparent',
                    border: `2px solid ${isDone ? 'hsl(var(--ss-accent))' : 'hsl(var(--ss-border))'}`,
                  }}
                >
                  {isDone && (
                    <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6 9 17l-5-5"/>
                    </svg>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Export to Calendar */}
      {selectedStack && slots.length > 0 && (
        <>
          <div className="text-[11px] font-semibold uppercase tracking-wider mt-5 mb-2" style={{ color: 'hsl(var(--ss-text-muted))' }}>
            Export to Calendar
          </div>
          <div className="ss-card p-3 mb-4">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleExport}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-[12px] font-semibold transition-all active:scale-[0.97]"
                style={{ background: 'hsl(var(--ss-accent-soft))', color: 'hsl(var(--ss-accent))', border: '1px solid hsl(var(--ss-accent) / 0.2)' }}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                Google Calendar
              </button>
              <button
                type="button"
                onClick={handleExport}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-[12px] font-semibold transition-all active:scale-[0.97]"
                style={{ background: 'hsl(var(--ss-surface))', color: 'hsl(var(--ss-text-secondary))', border: '1px solid hsl(var(--ss-border))' }}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                Download .ics
              </button>
            </div>
          </div>
        </>
      )}

      {/* Tip */}
      {slots.length > 0 && (
        <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg mt-2 text-[11px] leading-relaxed"
             style={{ background: 'hsl(var(--ss-accent-soft))', border: '1px solid hsl(var(--ss-accent) / 0.15)', color: 'hsl(var(--ss-accent))' }}>
          <span className="flex-shrink-0 mt-0.5">&#x1F4A1;</span>
          <span>Tap each reminder when you take your supplements to track your daily progress.</span>
        </div>
      )}
    </div>
  );
}

/* ── Saved Plan Card ── */

function SavedPlanCard({
  plan,
  itemsExpanded,
  nutritionExpanded,
  onToggleItems,
  onToggleNutrition,
  onDelete,
}: {
  plan: NutritionPlan;
  itemsExpanded: boolean;
  nutritionExpanded: boolean;
  onToggleItems: () => void;
  onToggleNutrition: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="space-y-2 mb-4">
      {/* Items dropdown */}
      <div className="rounded-xl overflow-hidden"
           style={{ background: 'hsl(var(--ss-surface))', border: '1px solid hsl(var(--ss-border-soft))' }}>
        <button
          type="button"
          onClick={onToggleItems}
          className="w-full flex items-center justify-between px-3.5 py-2.5 border-none cursor-pointer"
          style={{ background: 'transparent' }}
        >
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'hsl(var(--ss-text-muted))' }}>
              Items ({plan.items.length})
            </span>
            {!itemsExpanded && (
              <div className="flex -space-x-1.5">
                {plan.items.slice(0, 4).map((item) => (
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
                {plan.items.length > 4 && (
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold border-2"
                    style={{
                      background: 'hsl(var(--ss-surface-raised))',
                      borderColor: 'hsl(var(--ss-surface))',
                      color: 'hsl(var(--ss-text-muted))',
                    }}
                  >
                    +{plan.items.length - 4}
                  </div>
                )}
              </div>
            )}
          </div>
          <svg
            className="w-4 h-4 transition-transform"
            style={{ color: 'hsl(var(--ss-text-muted))', transform: itemsExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          >
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>

        {itemsExpanded && (
          <div style={{ borderTop: '1px solid hsl(var(--ss-border-soft))' }}>
            {plan.items.map((item, i) => (
              <div key={item.id}
                   className="flex items-center gap-2.5 px-3.5 py-2.5"
                   style={{ borderBottom: i < plan.items.length - 1 ? '1px solid hsl(var(--ss-border-soft) / 0.5)' : 'none' }}>
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
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Nutrition dropdown */}
      <div className="rounded-xl overflow-hidden"
           style={{ background: 'hsl(var(--ss-surface))', border: '1px solid hsl(var(--ss-border-soft))' }}>
        <button
          type="button"
          onClick={onToggleNutrition}
          className="w-full flex items-center justify-between px-3.5 py-2.5 border-none cursor-pointer"
          style={{ background: 'transparent' }}
        >
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'hsl(var(--ss-text-muted))' }}>
              Nutrition
            </span>
            {!nutritionExpanded && (
              <span className="ss-font-mono text-[10px] font-medium" style={{ color: 'hsl(var(--ss-text-secondary))' }}>
                {plan.totals.calories} cal &middot; {plan.totals.protein}g protein
              </span>
            )}
          </div>
          <svg
            className="w-4 h-4 transition-transform"
            style={{ color: 'hsl(var(--ss-text-muted))', transform: nutritionExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          >
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>

        {nutritionExpanded && (
          <div style={{ borderTop: '1px solid hsl(var(--ss-border-soft))' }}>
            {/* Macro grid */}
            <div className="grid grid-cols-5" style={{ borderBottom: '1px solid hsl(var(--ss-border-soft))' }}>
              <MacroCell value={plan.totals.calories} label="Cal" />
              <MacroCell value={`${plan.totals.protein}g`} label="Protein" />
              <MacroCell value={`${plan.totals.carbs}g`} label="Carbs" />
              <MacroCell value={`${plan.totals.fat}g`} label="Fat" />
              <MacroCell value={`${plan.totals.fiber}g`} label="Fiber" last />
            </div>
          </div>
        )}
      </div>

      {/* Delete plan */}
      <button
        type="button"
        onClick={onDelete}
        className="w-full py-2 rounded-xl text-[10px] font-semibold transition-all active:scale-[0.97] border-none cursor-pointer"
        style={{ background: 'hsl(var(--ss-danger) / 0.08)', color: 'hsl(var(--ss-danger))' }}
      >
        Delete Plan
      </button>
    </div>
  );
}

/* ── Helper Components ── */

function MacroCell({ value, label, last }: { value: string | number; label: string; last?: boolean }) {
  return (
    <div className="text-center py-3"
         style={{ borderRight: last ? 'none' : '1px solid hsl(var(--ss-border-soft))' }}>
      <div className="ss-font-mono text-[14px] font-bold" style={{ color: 'hsl(var(--ss-text))' }}>{value}</div>
      <div className="text-[9px] mt-0.5" style={{ color: 'hsl(var(--ss-text-muted))' }}>{label}</div>
    </div>
  );
}

function StatCard({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="flex-1 p-3.5 rounded-xl text-center"
         style={{ background: 'hsl(var(--ss-surface))', border: '1px solid hsl(var(--ss-border-soft))', boxShadow: 'var(--ss-shadow-sm)' }}>
      <div className="ss-font-mono text-xl font-semibold" style={{ color: 'hsl(var(--ss-accent))' }}>
        {value}
      </div>
      <div className="text-[10px] font-medium mt-0.5" style={{ color: 'hsl(var(--ss-text-muted))' }}>
        {label}
      </div>
    </div>
  );
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}
