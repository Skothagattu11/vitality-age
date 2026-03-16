import { useState, useRef } from 'react';
import type { ScanResult, CartItem, NutrientEntry } from '@/types/supplementStacker';
import { scanLabel, type ScanApiResponse } from '@/services/geminiScanService';
import { ImageUpload } from './ImageUpload';
import { ScanResults } from './ScanResults';

export type ScanMode = 'supplement' | 'food';

interface ScanSheetProps {
  open: boolean;
  onClose: () => void;
  onAddScanResult: (result: ScanResult) => void;
  onAddToStack: (findings: ScanResult['findings']) => void;
  onAddToCart: (item: CartItem) => void;
}

type ScanState = 'upload' | 'analyzing' | 'results';

const DEMO_SUPPLEMENT: ScanResult = {
  productName: 'Nature\'s Best Multi',
  brand: 'Nature\'s Best',
  score: 72,
  verdict: 'Good quality with minor concerns',
  servingAlert: 'Serving size is 2 capsules — check if label values are per capsule or per serving.',
  findings: [
    { name: 'Vitamin D3 (Cholecalciferol)', status: 'good', detail: 'Preferred D3 form, well-absorbed', dose: '2,000 IU', absorbed: '~90%', tag: 'Quality Form' },
    { name: 'Magnesium Oxide', status: 'warn', detail: 'Poorly absorbed form — glycinate or citrate preferred', dose: '400mg', absorbed: '~4%', tag: 'Low Bioavail' },
    { name: 'Zinc Picolinate', status: 'good', detail: 'Excellent bioavailable form', dose: '15mg', absorbed: '~60%' },
    { name: 'Titanium Dioxide', status: 'bad', detail: 'Unnecessary filler — potential gut irritant', tag: 'Filler' },
    { name: 'Vitamin B12 (Methylcobalamin)', status: 'good', detail: 'Active form — good absorption', dose: '1,000mcg', absorbed: '~80%' },
  ],
};

const DEMO_FOOD: ScanResult = {
  productName: 'Fage Total 0% Greek Yogurt',
  brand: 'Fage',
  score: 0,
  verdict: '1 cup (227g) per serving',
  findings: [
    { name: 'Protein', status: 'good', detail: '44% Daily Value', dose: '22g' },
    { name: 'Calcium', status: 'good', detail: '15% Daily Value', dose: '200mg' },
    { name: 'Vitamin B12', status: 'good', detail: '50% Daily Value', dose: '1.2mcg' },
    { name: 'Potassium', status: 'warn', detail: '6% Daily Value', dose: '280mg' },
    { name: 'Phosphorus', status: 'good', detail: '20% Daily Value', dose: '230mg' },
  ],
};

const DEMO_FOOD_NUTRIENTS: NutrientEntry[] = [
  { name: 'Calcium', amount: 200, unit: 'mg', dailyValuePct: 15 },
  { name: 'Vitamin B12', amount: 1.2, unit: 'mcg', dailyValuePct: 50 },
  { name: 'Potassium', amount: 280, unit: 'mg', dailyValuePct: 6 },
  { name: 'Phosphorus', amount: 230, unit: 'mg', dailyValuePct: 20 },
];

const DEMO_SUPP_NUTRIENTS: NutrientEntry[] = [
  { name: 'Vitamin D3', amount: 50, unit: 'mcg', dailyValuePct: 250 },
  { name: 'Magnesium', amount: 16, unit: 'mg', dailyValuePct: 4 },
  { name: 'Zinc', amount: 15, unit: 'mg', dailyValuePct: 136 },
  { name: 'Vitamin B12', amount: 1000, unit: 'mcg', dailyValuePct: 41667 },
];

// Build a CartItem from scan result + extracted nutrients
function buildCartItem(
  result: ScanResult,
  mode: ScanMode,
  nutrients?: NutrientEntry[],
  macros?: { calories: number; protein: number; carbs: number; fat: number; fiber: number },
): CartItem {
  const fallbackNutrients = mode === 'food' ? DEMO_FOOD_NUTRIENTS : DEMO_SUPP_NUTRIENTS;
  const fallbackMacros = mode === 'food'
    ? { calories: 120, protein: 22, carbs: 7, fat: 0, fiber: 0 }
    : { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };

  return {
    id: `cart-${Date.now()}`,
    productName: result.productName,
    type: mode,
    servingSize: mode === 'food' ? '1 serving' : undefined,
    score: mode === 'supplement' ? result.score : undefined,
    scanResult: mode === 'supplement' ? result : undefined,
    nutrients: nutrients && nutrients.length > 0 ? nutrients : fallbackNutrients,
    macros: macros || fallbackMacros,
    addedAt: Date.now(),
  };
}


export function ScanSheet({ open, onClose, onAddScanResult, onAddToStack, onAddToCart }: ScanSheetProps) {
  const [scanState, setScanState] = useState<ScanState>('upload');
  const [scanMode, setScanMode] = useState<ScanMode>('supplement');
  const [result, setResult] = useState<ScanResult | null>(null);
  // Store extracted nutrients/macros from API (not part of ScanResult type)
  const extractedNutrients = useRef<NutrientEntry[] | undefined>();
  const extractedMacros = useRef<{ calories: number; protein: number; carbs: number; fat: number; fiber: number } | undefined>();

  if (!open) return null;

  const handleImageSelected = async (file: File, _preview: string) => {
    setScanState('analyzing');
    extractedNutrients.current = undefined;
    extractedMacros.current = undefined;

    try {
      const data = await scanLabel(file, scanMode);
      // Store extended fields before stripping them
      extractedNutrients.current = data._nutrients;
      extractedMacros.current = data._macros;
      // Strip extended fields to get clean ScanResult
      const scanResult: ScanResult = {
        productName: data.productName,
        brand: data.brand,
        score: data.score,
        verdict: data.verdict,
        findings: data.findings,
        servingAlert: data.servingAlert,
      };
      setResult(scanResult);
      onAddScanResult(scanResult);
      setScanState('results');
      return;
    } catch (err) {
      console.warn('Scan API unavailable, using demo data:', err);
    }

    // Demo fallback
    await new Promise(r => setTimeout(r, 2000));
    const demoResult = scanMode === 'supplement' ? { ...DEMO_SUPPLEMENT } : { ...DEMO_FOOD };
    if (scanMode === 'supplement') {
      demoResult.productName = file.name.replace(/\.[^/.]+$/, '') || demoResult.productName;
    }
    setResult(demoResult);
    onAddScanResult(demoResult);
    setScanState('results');
  };

  const handleAddToStack = () => {
    if (result) {
      onAddToStack(result.findings);
      onClose();
      resetState();
    }
  };

  const handleAddToCart = () => {
    if (result) {
      const cartItem = buildCartItem(result, scanMode, extractedNutrients.current, extractedMacros.current);
      onAddToCart(cartItem);
      onClose();
      resetState();
    }
  };

  const resetState = () => {
    setScanState('upload');
    setResult(null);
  };

  const handleClose = () => {
    onClose();
    resetState();
  };

  const switchMode = (mode: ScanMode) => {
    setScanMode(mode);
    if (scanState === 'results') {
      resetState();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end justify-center"
      style={{ background: 'hsl(0 0% 0% / 0.3)', backdropFilter: 'blur(4px)' }}
      onClick={handleClose}
    >
      <div
        className="w-full max-w-[420px] max-h-[88dvh] rounded-t-[20px] overflow-y-auto"
        style={{ background: 'hsl(var(--ss-bg))', border: '1px solid hsl(var(--ss-border))', animation: 'sheetUp 0.3s cubic-bezier(0.32,0.72,0,1)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="w-9 h-1 rounded-full mx-auto mt-2.5 mb-4" style={{ background: 'hsl(var(--ss-border))' }} />

        <div className="px-5 pb-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="ss-heading text-lg">Scan Label</h2>
            <button
              onClick={handleClose}
              className="w-[30px] h-[30px] rounded-full flex items-center justify-center text-sm"
              style={{ background: 'hsl(var(--ss-surface-raised))', color: 'hsl(var(--ss-text-secondary))' }}
            >
              &times;
            </button>
          </div>

          {/* Mode toggle */}
          <div
            className="flex gap-[3px] p-[3px] rounded-[10px] mb-4"
            style={{ background: 'hsl(var(--ss-surface))' }}
          >
            <button
              type="button"
              onClick={() => switchMode('supplement')}
              className="flex-1 py-2 rounded-[8px] text-[12px] font-semibold transition-all border-none cursor-pointer"
              style={{
                background: scanMode === 'supplement' ? 'hsl(var(--ss-accent))' : 'transparent',
                color: scanMode === 'supplement' ? '#fff' : 'hsl(var(--ss-text-muted))',
                boxShadow: scanMode === 'supplement' ? '0 2px 10px hsl(var(--ss-accent) / 0.35)' : 'none',
              }}
            >
              Supplement
            </button>
            <button
              type="button"
              onClick={() => switchMode('food')}
              className="flex-1 py-2 rounded-[8px] text-[12px] font-semibold transition-all border-none cursor-pointer"
              style={{
                background: scanMode === 'food' ? 'hsl(var(--ss-accent))' : 'transparent',
                color: scanMode === 'food' ? '#fff' : 'hsl(var(--ss-text-muted))',
                boxShadow: scanMode === 'food' ? '0 2px 10px hsl(var(--ss-accent) / 0.35)' : 'none',
              }}
            >
              Food Label
            </button>
          </div>

          {/* Upload */}
          {scanState === 'upload' && (
            <ImageUpload
              onImageSelected={handleImageSelected}
              label={scanMode === 'supplement' ? 'Upload supplement label' : 'Upload nutrition facts label'}
            />
          )}

          {/* Analyzing */}
          {scanState === 'analyzing' && (
            <div className="flex flex-col items-center py-12 text-center">
              <div className="w-10 h-10 border-2 rounded-full animate-spin mb-4"
                   style={{ borderColor: 'hsl(var(--ss-border))', borderTopColor: 'hsl(var(--ss-accent))' }} />
              <p className="text-sm font-medium" style={{ color: 'hsl(var(--ss-text))' }}>Analyzing label...</p>
              <p className="text-[11px] mt-1" style={{ color: 'hsl(var(--ss-text-muted))' }}>
                {scanMode === 'supplement'
                  ? 'Checking ingredients, forms, and doses'
                  : 'Extracting nutrition facts and daily values'}
              </p>
            </div>
          )}

          {/* Results */}
          {scanState === 'results' && result && (
            <>
              <ScanResults
                result={result}
                scanMode={scanMode}
                onAddToStack={handleAddToStack}
                onAddToCart={handleAddToCart}
              />
              <button
                type="button"
                onClick={resetState}
                className="w-full py-2.5 rounded-xl text-[12px] font-semibold transition-all active:scale-[0.97] mt-2"
                style={{ background: 'hsl(var(--ss-surface-raised))', color: 'hsl(var(--ss-text-secondary))', border: '1px solid hsl(var(--ss-border))' }}
              >
                Scan Another
              </button>
            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes sheetUp {
          from { transform: translateY(100%); }
          to { transform: none; }
        }
      `}</style>
    </div>
  );
}
