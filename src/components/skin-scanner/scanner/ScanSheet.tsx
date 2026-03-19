import { useState } from 'react';
import type { useSkinScanner } from '@/hooks/useSkinScanner';
import type { SkinScanResult } from '@/types/skinScanner';
import { scanSkinLabel } from '@/services/skinScanService';
import { ImageUpload } from '@/components/supplement-stacker/scanner/ImageUpload';

type ScanState = 'upload' | 'analyzing' | 'error';

interface ScanSheetProps {
  open: boolean;
  onClose: () => void;
  scanner: ReturnType<typeof useSkinScanner>;
  onScanComplete: (result: SkinScanResult) => void;
}

export function ScanSheet({ open, onClose, scanner, onScanComplete }: ScanSheetProps) {
  const [scanState, setScanState] = useState<ScanState>('upload');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!open) return null;

  const handleImageSelected = async (file: File, _preview: string) => {
    setScanState('analyzing');
    setErrorMsg(null);

    try {
      const data = await scanSkinLabel(file, scanner.state.skinProfile);
      scanner.addScanResult(data);
      resetState();
      onScanComplete(data);
    } catch (err) {
      console.error('Skin scan failed:', err);
      setErrorMsg(err instanceof Error ? err.message : 'Failed to analyze label. Please try again.');
      setScanState('error');
    }
  };

  const resetState = () => {
    setScanState('upload');
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
