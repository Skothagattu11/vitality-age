import { useState } from 'react';
import type { useSkinScanner } from '@/hooks/useSkinScanner';
import type { SkinScanResult, RoutineProduct } from '@/types/skinScanner';
import { scanSkinLabel } from '@/services/skinScanService';
import { ImageUpload } from '@/components/supplement-stacker/scanner/ImageUpload';

type ScanState = 'upload' | 'analyzing' | 'results' | 'error';

interface ScanSheetProps {
  open: boolean;
  onClose: () => void;
  scanner: ReturnType<typeof useSkinScanner>;
}

function scoreColor(score: number, max: number): string {
  const pct = score / max;
  if (pct >= 0.7) return 'hsl(var(--ss-good))';
  if (pct >= 0.4) return 'hsl(var(--ss-warn))';
  return 'hsl(var(--ss-danger))';
}

function SkinScanResults({
  result,
  onAddToRoutine,
  onScanAnother,
}: {
  result: SkinScanResult;
  onAddToRoutine: (routine: 'am' | 'pm') => void;
  onScanAnother: () => void;
}) {
  const totalIngredients =
    result.ingredients.heroActives.length +
    result.ingredients.supporting.length +
    result.ingredients.baseFiller.length +
    result.ingredients.watchOut.length;

  const watchOutCount = result.ingredients.watchOut.length;

  return (
    <div>
      {/* Product header */}
      <div className="mb-4">
        <h3 className="ss-heading text-base">{result.productName}</h3>
        {result.brand && (
          <p className="text-[11px] mt-0.5" style={{ color: 'hsl(var(--ss-text-muted))' }}>
            {result.brand}
          </p>
        )}
      </div>

      {/* Dual score display */}
      <div className="flex gap-3 mb-4">
        <div
          className="flex-1 rounded-xl p-3 text-center"
          style={{ background: 'hsl(var(--ss-surface))', border: '1px solid hsl(var(--ss-border))' }}
        >
          <p className="text-[10px] font-medium mb-1" style={{ color: 'hsl(var(--ss-text-muted))' }}>
            Safety
          </p>
          <p className="ss-font-mono text-2xl font-bold" style={{ color: scoreColor(result.safetyScore, 10) }}>
            {result.safetyScore}
          </p>
          <p className="text-[10px]" style={{ color: 'hsl(var(--ss-text-muted))' }}>/10</p>
        </div>
        <div
          className="flex-1 rounded-xl p-3 text-center"
          style={{ background: 'hsl(var(--ss-surface))', border: '1px solid hsl(var(--ss-border))' }}
        >
          <p className="text-[10px] font-medium mb-1" style={{ color: 'hsl(var(--ss-text-muted))' }}>
            Compatibility
          </p>
          <p className="ss-font-mono text-2xl font-bold" style={{ color: scoreColor(result.compatibilityScore, 100) }}>
            {result.compatibilityScore}
          </p>
          <p className="text-[10px]" style={{ color: 'hsl(var(--ss-text-muted))' }}>/100</p>
        </div>
      </div>

      {/* Confidence badge */}
      <div className="flex justify-center mb-3">
        <span
          className="text-[10px] font-medium px-2.5 py-1 rounded-full"
          style={{
            background: result.compatibilityConfidence === 'full'
              ? 'hsl(var(--ss-good) / 0.12)'
              : result.compatibilityConfidence === 'partial'
                ? 'hsl(var(--ss-warn) / 0.12)'
                : 'hsl(var(--ss-text-muted) / 0.12)',
            color: result.compatibilityConfidence === 'full'
              ? 'hsl(var(--ss-good))'
              : result.compatibilityConfidence === 'partial'
                ? 'hsl(var(--ss-warn))'
                : 'hsl(var(--ss-text-muted))',
          }}
        >
          {result.compatibilityConfidence === 'full' ? 'Full profile match' :
           result.compatibilityConfidence === 'partial' ? 'Partial profile match' :
           'Generic analysis'}
        </span>
      </div>

      {/* Verdict */}
      <div
        className="rounded-xl p-3 mb-4 text-[12px] leading-relaxed"
        style={{ background: 'hsl(var(--ss-surface))', border: '1px solid hsl(var(--ss-border))', color: 'hsl(var(--ss-text))' }}
      >
        {result.verdict}
      </div>

      {/* Ingredient summary */}
      <div
        className="flex items-center justify-between rounded-xl px-3 py-2.5 mb-4 text-[11px]"
        style={{ background: 'hsl(var(--ss-surface))', border: '1px solid hsl(var(--ss-border))' }}
      >
        <span style={{ color: 'hsl(var(--ss-text-secondary))' }}>
          {totalIngredients} ingredient{totalIngredients !== 1 ? 's' : ''} analyzed
        </span>
        {watchOutCount > 0 && (
          <span style={{ color: 'hsl(var(--ss-danger))' }}>
            {watchOutCount} to watch
          </span>
        )}
      </div>

      {/* Application info */}
      <div
        className="rounded-xl p-3 mb-4 text-[11px]"
        style={{ background: 'hsl(var(--ss-surface))', border: '1px solid hsl(var(--ss-border))' }}
      >
        <div className="flex items-center gap-2 mb-1.5">
          <svg className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'hsl(var(--ss-accent))' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
          <span style={{ color: 'hsl(var(--ss-text))' }}>
            {result.applicationInstructions.timeOfDay === 'AM' ? 'Morning' :
             result.applicationInstructions.timeOfDay === 'PM' ? 'Evening' : 'AM & PM'}
            {' \u2022 '}
            {result.applicationInstructions.routineStep}
          </span>
        </div>
        <p style={{ color: 'hsl(var(--ss-text-muted))' }}>
          Amount: {result.applicationInstructions.amount}
          {result.applicationInstructions.waitTime && ` \u2022 Wait: ${result.applicationInstructions.waitTime}`}
        </p>
      </div>

      {/* Add to routine buttons */}
      <div className="flex gap-2 mb-2">
        {(result.applicationInstructions.timeOfDay === 'AM' || result.applicationInstructions.timeOfDay === 'both') && (
          <button
            type="button"
            onClick={() => onAddToRoutine('am')}
            className="flex-1 py-2.5 rounded-xl text-[12px] font-semibold transition-all active:scale-[0.97]"
            style={{ background: 'hsl(var(--ss-accent))', color: '#fff', boxShadow: '0 2px 10px hsl(var(--ss-accent) / 0.35)' }}
          >
            Add to AM Routine
          </button>
        )}
        {(result.applicationInstructions.timeOfDay === 'PM' || result.applicationInstructions.timeOfDay === 'both') && (
          <button
            type="button"
            onClick={() => onAddToRoutine('pm')}
            className="flex-1 py-2.5 rounded-xl text-[12px] font-semibold transition-all active:scale-[0.97]"
            style={{
              background: result.applicationInstructions.timeOfDay === 'both' ? 'hsl(var(--ss-surface-raised))' : 'hsl(var(--ss-accent))',
              color: result.applicationInstructions.timeOfDay === 'both' ? 'hsl(var(--ss-text))' : '#fff',
              border: '1px solid hsl(var(--ss-border))',
            }}
          >
            Add to PM Routine
          </button>
        )}
      </div>

      {/* Scan another */}
      <button
        type="button"
        onClick={onScanAnother}
        className="w-full py-2.5 rounded-xl text-[12px] font-semibold transition-all active:scale-[0.97] mt-2"
        style={{ background: 'hsl(var(--ss-surface-raised))', color: 'hsl(var(--ss-text-secondary))', border: '1px solid hsl(var(--ss-border))' }}
      >
        Scan Another
      </button>
    </div>
  );
}

export function ScanSheet({ open, onClose, scanner }: ScanSheetProps) {
  const [scanState, setScanState] = useState<ScanState>('upload');
  const [result, setResult] = useState<SkinScanResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!open) return null;

  const handleImageSelected = async (file: File, _preview: string) => {
    setScanState('analyzing');
    setErrorMsg(null);

    try {
      const data = await scanSkinLabel(file, scanner.state.skinProfile);
      setResult(data);
      scanner.addScanResult(data);
      setScanState('results');
    } catch (err) {
      console.error('Skin scan failed:', err);
      setErrorMsg(err instanceof Error ? err.message : 'Failed to analyze label. Please try again.');
      setScanState('error');
    }
  };

  const handleAddToRoutine = (routine: 'am' | 'pm') => {
    if (!result) return;
    const product: RoutineProduct = {
      id: `routine-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      scanResult: result,
      routineCategory: result.applicationInstructions.routineCategory,
      sortOrder: routine === 'am' ? scanner.state.amRoutine.length : scanner.state.pmRoutine.length,
      addedAt: Date.now(),
    };
    scanner.addToRoutine(product, routine);
    onClose();
    resetState();
  };

  const resetState = () => {
    setScanState('upload');
    setResult(null);
    setErrorMsg(null);
  };

  const handleClose = () => {
    onClose();
    resetState();
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
            <h2 className="ss-heading text-lg">Scan Skincare Label</h2>
            <button
              onClick={handleClose}
              className="w-[30px] h-[30px] rounded-full flex items-center justify-center text-sm"
              style={{ background: 'hsl(var(--ss-surface-raised))', color: 'hsl(var(--ss-text-secondary))' }}
            >
              &times;
            </button>
          </div>

          {/* Upload */}
          {scanState === 'upload' && (
            <ImageUpload
              onImageSelected={handleImageSelected}
              label="Upload skincare product label"
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
              <p className="text-sm font-medium" style={{ color: 'hsl(var(--ss-text))' }}>Analyzing...</p>
              <p className="text-[11px] mt-1" style={{ color: 'hsl(var(--ss-text-muted))' }}>
                Checking ingredients, safety, and compatibility with your skin profile
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
            <SkinScanResults
              result={result}
              onAddToRoutine={handleAddToRoutine}
              onScanAnother={resetState}
            />
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
