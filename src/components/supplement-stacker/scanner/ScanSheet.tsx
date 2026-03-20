import { useState, useRef, useCallback } from 'react';
import type { ScanResult, CartItem, NutrientEntry } from '@/types/supplementStacker';
import { scanLabel, type ScanApiResponse } from '@/services/geminiScanService';
import { ImageUpload } from './ImageUpload';
import { ScanResults } from './ScanResults';

const SCAN_START_MESSAGES = [
  'Analyzing label...',
  'Reading nutrition info...',
  'Identifying ingredients...',
  'Detecting food item...',
];

export type ScanMode = 'supplement' | 'food';

interface ScanSheetProps {
  open: boolean;
  onClose: () => void;
  onAddScanResult: (result: ScanResult) => void;
  onAddToStack: (findings: ScanResult['findings']) => void;
  onAddToCart: (item: CartItem) => void;
  onScanComplete?: (result: ScanResult, mode: ScanMode, nutrients?: NutrientEntry[], macros?: { calories: number; protein: number; carbs: number; fat: number; fiber: number }) => void;
}

type ScanState = 'upload' | 'analyzing' | 'results' | 'error';

// Build a CartItem from AI scan result + extracted nutrients
function buildCartItem(
  result: ScanResult,
  mode: ScanMode,
  nutrients?: NutrientEntry[],
  macros?: { calories: number; protein: number; carbs: number; fat: number; fiber: number },
): CartItem {
  return {
    id: `cart-${Date.now()}`,
    productName: result.productName,
    type: mode,
    servingSize: mode === 'food' ? '1 serving' : undefined,
    score: mode === 'supplement' ? result.score : undefined,
    scanResult: mode === 'supplement' ? result : undefined,
    nutrients: nutrients || [],
    macros: macros || { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 },
    addedAt: Date.now(),
  };
}


export function ScanSheet({ open, onClose, onAddScanResult, onAddToStack, onAddToCart, onScanComplete }: ScanSheetProps) {
  const [scanState, setScanState] = useState<ScanState>('upload');
  const [scanMode, setScanMode] = useState<ScanMode>('supplement');
  const [result, setResult] = useState<ScanResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  // Store extracted nutrients/macros from API (not part of ScanResult type)
  const extractedNutrients = useRef<NutrientEntry[] | undefined>();
  const extractedMacros = useRef<{ calories: number; protein: number; carbs: number; fat: number; fiber: number } | undefined>();

  if (!open) return null;

  const handleImageSelected = async (file: File, _preview: string) => {
    setScanState('analyzing');
    setErrorMsg(null);
    extractedNutrients.current = undefined;
    extractedMacros.current = undefined;

    try {
      const data = await scanLabel(file, scanMode);
      // Auto-switch mode based on what AI actually detected
      let effectiveMode = scanMode;
      if (data._detectedType) {
        effectiveMode = data._detectedType === 'supplement' ? 'supplement' : 'food';
        if (effectiveMode !== scanMode) {
          setScanMode(effectiveMode);
        }
      }
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

      // If full-page callback is provided, navigate to full-page results
      if (onScanComplete) {
        onScanComplete(scanResult, effectiveMode, data._nutrients, data._macros);
        onClose();
        resetState();
        return;
      }
      setScanState('results');
    } catch (err) {
      console.error('Scan failed:', err);
      setErrorMsg(err instanceof Error ? err.message : 'Failed to analyze label. Please try again.');
      setScanState('error');
    }
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
            <div className="flex flex-col items-center py-10 text-center">
              {/* Pulsing scan icon */}
              <div className="relative w-16 h-16 mb-4">
                <div className="absolute inset-0 rounded-full animate-ping opacity-20"
                     style={{ background: 'hsl(var(--ss-accent))' }} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg className="w-8 h-8" style={{ color: 'hsl(var(--ss-accent))' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><line x1="7" y1="12" x2="17" y2="12"/>
                  </svg>
                </div>
              </div>
              <p className="text-sm font-medium" style={{ color: 'hsl(var(--ss-text))' }}>Scanning...</p>
              <p className="text-[11px] mt-1" style={{ color: 'hsl(var(--ss-text-muted))' }}>
                {scanMode === 'supplement'
                  ? 'Checking ingredients, forms, and doses'
                  : 'Extracting nutrition facts and daily values'}
              </p>
            </div>
          )}

          {/* Error */}
          {scanState === 'error' && (
            <div className="flex flex-col items-center py-10 text-center">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3"
                   style={{ background: 'hsl(var(--ss-danger) / 0.1)' }}>
                <svg className="w-6 h-6" style={{ color: 'hsl(var(--ss-danger))' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
              </div>
              <p className="text-sm font-semibold mb-1" style={{ color: 'hsl(var(--ss-text))' }}>Analysis Failed</p>
              <p className="text-[11px] leading-relaxed mb-4 px-4" style={{ color: 'hsl(var(--ss-text-muted))' }}>
                {errorMsg || 'Could not analyze the label. Make sure the image is clear and try again.'}
              </p>
              <button
                type="button"
                onClick={resetState}
                className="px-6 py-2.5 rounded-xl text-[12px] font-semibold transition-all active:scale-[0.97]"
                style={{ background: 'hsl(var(--ss-accent))', color: '#fff' }}
              >
                Try Again
              </button>
            </div>
          )}

          {/* Results */}
          {scanState === 'results' && result && (
            <>
              <ScanResults
                result={result}
                scanMode={scanMode}
                macros={extractedMacros.current}
                nutrients={extractedNutrients.current}
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
