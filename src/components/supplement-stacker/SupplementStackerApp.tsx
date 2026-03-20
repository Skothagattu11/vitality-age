import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { useSupplementStacker } from '@/hooks/useSupplementStacker';
import { useNutritionCart } from '@/hooks/useNutritionCart';
import { useNutritionPlans } from '@/hooks/useNutritionPlans';
import { saveStackerState } from '@/utils/stackerSync';
import { BottomNav } from './BottomNav';
import { ScanFAB } from './ScanFAB';
import { ThemeToggle } from './ThemeToggle';
import { HomeScreen } from './screens/HomeScreen';
import { StackScreen } from './screens/StackScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { SupplementScanResultsScreen } from './screens/ScanResultsScreen';
import { ScanSheet } from './scanner/ScanSheet';
import type { ScanMode } from './scanner/ScanSheet';
import { CartDrawer } from './cart/CartDrawer';
import type { CartItem, ScanResult, NutrientEntry } from '@/types/supplementStacker';

interface SupplementStackerAppProps {
  stacker: ReturnType<typeof useSupplementStacker>;
  isDark: boolean;
  onToggleTheme: () => void;
}

export function SupplementStackerApp({ stacker, isDark, onToggleTheme }: SupplementStackerAppProps) {
  const navigate = useNavigate();
  const { state, setScreen, addScanResult, addSupplement, setOnRemoteLoad } = stacker;
  const [scanOpen, setScanOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [activeResult, setActiveResult] = useState<{
    result: ScanResult;
    mode: ScanMode;
    nutrients?: NutrientEntry[];
    macros?: { calories: number; protein: number; carbs: number; fat: number; fiber: number };
  } | null>(null);

  const cart = useNutritionCart();
  const nutritionPlans = useNutritionPlans();

  // Register callback to hydrate nutrition data when remote state loads (login / mount)
  useEffect(() => {
    setOnRemoteLoad((remote) => {
      if (remote.nutritionCart.length > 0) cart.hydrateCart(remote.nutritionCart);
      if (Object.keys(remote.nutritionPlans).length > 0) nutritionPlans.hydratePlans(remote.nutritionPlans);
    });
  }, [setOnRemoteLoad]);

  // Debounced save of nutrition data to Supabase when cart or plans change
  useEffect(() => {
    if (!state.hasAccount) return;
    const t = setTimeout(() => {
      saveStackerState(state, cart.items, nutritionPlans.plans).catch(() => {});
    }, 1000);
    return () => clearTimeout(t);
  }, [cart.items, nutritionPlans.plans, state.hasAccount]);

  const handleSavePlan = () => {
    if (cart.items.length === 0) return;
    const dateKey = nutritionPlans.savePlan(cart.items, cart.totals);
    setCartOpen(false);
    setToast(`Plan saved for ${dateKey}`);
  };

  // Toast auto-dismiss
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 1800);
    return () => clearTimeout(t);
  }, [toast]);

  const handleAddFromScan = (findings: { name: string; status: string; dose?: string }[]) => {
    const goodOnes = findings.filter(f => f.status === 'good');
    for (const f of goodOnes) {
      addSupplement({
        id: `scan-${f.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now()}`,
        name: f.name.split('(')[0].trim(),
        dose: f.dose || 'as directed',
        isCustom: false,
      });
    }
  };

  const handleAddToCart = (item: CartItem) => {
    cart.addItem(item);
    setToast(`${item.productName} added to cart`);
  };

  const handleScanComplete = useCallback((
    result: ScanResult,
    mode: ScanMode,
    nutrients?: NutrientEntry[],
    macros?: { calories: number; protein: number; carbs: number; fat: number; fiber: number },
  ) => {
    setActiveResult({ result, mode, nutrients, macros });
  }, []);

  const renderScreen = () => {
    switch (state.currentScreen) {
      case 'home':
        return <HomeScreen stacker={stacker} nutritionPlans={nutritionPlans} />;
      case 'stack':
        return <StackScreen stacker={stacker} />;
      case 'profile':
        return <ProfileScreen stacker={stacker} isDark={isDark} onToggleTheme={onToggleTheme} />;
      default:
        return <HomeScreen stacker={stacker} nutritionPlans={nutritionPlans} />;
    }
  };

  // ── Full-page scan results view ──
  if (activeResult) {
    return (
      <SupplementScanResultsScreen
        result={activeResult.result}
        scanMode={activeResult.mode}
        macros={activeResult.macros}
        nutrients={activeResult.nutrients}
        isAuthenticated={state.hasAccount}
        onBack={() => setActiveResult(null)}
        onAddToStack={(findings) => {
          handleAddFromScan(findings);
          setToast('Added to stack');
        }}
        onAddToCart={(item) => {
          handleAddToCart(item);
        }}
      />
    );
  }

  return (
    <div className="relative min-h-dvh">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-4 pb-3">
        <h1 className="ss-heading text-[22px]">Supplements & Vitamins</h1>
        <div className="flex items-center gap-2">
          {/* Cart icon */}
          <button
            type="button"
            onClick={() => setCartOpen(true)}
            className="w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-90 relative"
            style={{ background: 'hsl(var(--ss-surface))', border: '1px solid hsl(var(--ss-border))' }}
            aria-label="Nutrition Cart"
          >
            <svg className="w-[18px] h-[18px]" style={{ color: 'hsl(var(--ss-text-secondary))' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
            {cart.count > 0 && (
              <span
                className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full flex items-center justify-center ss-font-mono text-[10px] font-bold px-1"
                style={{ background: 'hsl(var(--ss-danger))', color: '#fff' }}
              >
                {cart.count}
              </span>
            )}
          </button>

          <ThemeToggle isDark={isDark} onToggle={onToggleTheme} />

          <button
            onClick={() => navigate('/')}
            className="w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-90"
            style={{ background: 'hsl(var(--ss-surface))', border: '1px solid hsl(var(--ss-border))' }}
            aria-label="Back to hub"
          >
            <svg className="w-4 h-4" style={{ color: 'hsl(var(--ss-text-secondary))' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Guest mode banner */}
      {!state.hasAccount && (
        <div
          className="mx-5 mb-3 flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-[11px] leading-relaxed"
          style={{
            background: 'hsl(var(--ss-warn) / 0.08)',
            border: '1px solid hsl(var(--ss-warn) / 0.15)',
            color: 'hsl(var(--ss-warn))',
          }}
        >
          <span className="flex-shrink-0">{'\u26A0\uFE0F'}</span>
          <span className="flex-1">
            Guest mode — your data will be lost when this session ends.{' '}
            <button
              type="button"
              onClick={() => setScreen('profile')}
              className="font-semibold underline bg-transparent border-none cursor-pointer"
              style={{ color: 'hsl(var(--ss-warn))' }}
            >
              Sign in to save
            </button>
          </span>
        </div>
      )}

      {/* Screen content */}
      <div className="px-5 pb-[calc(64px+env(safe-area-inset-bottom,0px)+24px)]">
        {renderScreen()}
      </div>

      {/* FAB */}
      <ScanFAB onClick={() => setScanOpen(true)} />

      {/* Bottom Nav */}
      <BottomNav currentScreen={state.currentScreen} onNavigate={setScreen} />

      {/* Scan Sheet */}
      <ScanSheet
        open={scanOpen}
        onClose={() => setScanOpen(false)}
        onAddScanResult={addScanResult}
        onAddToStack={handleAddFromScan}
        onAddToCart={handleAddToCart}
        onScanComplete={handleScanComplete}
      />

      {/* Cart Drawer */}
      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        items={cart.items}
        totals={cart.totals}
        gaps={cart.gaps}
        onRemoveItem={cart.removeItem}
        onClearCart={cart.clearCart}
        onSavePlan={cart.items.length > 0 ? handleSavePlan : undefined}
      />

      {/* Toast notification */}
      {toast && (
        <div className="flex justify-center pointer-events-none" style={{ position: 'sticky', top: 0, zIndex: 400 }}>
          <div
            className="px-4 py-2 rounded-xl text-[12px] font-semibold whitespace-nowrap pointer-events-auto"
            style={{
              background: 'hsl(var(--ss-good))',
              color: '#fff',
              boxShadow: '0 4px 20px hsl(var(--ss-good) / 0.35)',
              animation: 'toastIn 0.25s ease',
              marginTop: '4px',
            }}
          >
            {toast}
          </div>
        </div>
      )}

      <style>{`
        @keyframes toastIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
