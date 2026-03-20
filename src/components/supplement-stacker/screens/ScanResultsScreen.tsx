import { useState, useEffect, useCallback } from 'react';
import type { ScanResult, NutrientEntry, CartItem } from '@/types/supplementStacker';
import type { ChatMessage, ChatRateLimit } from '@/types/skinScanner';
import type { ScanMode } from '../scanner/ScanSheet';
import { ScanResults } from '../scanner/ScanResults';
import { ChatPanel } from '@/components/skin-scanner/chat/ChatPanel';
import { sendSupplementChatMessage, RateLimitError } from '@/services/supplementChatService';

interface ScanResultsScreenProps {
  result: ScanResult;
  scanMode: ScanMode;
  macros?: { calories: number; protein: number; carbs: number; fat: number; fiber: number };
  nutrients?: NutrientEntry[];
  isAuthenticated: boolean;
  onBack: () => void;
  onAddToStack: (findings: ScanResult['findings']) => void;
  onAddToCart: (item: CartItem) => void;
}

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

export function SupplementScanResultsScreen({
  result,
  scanMode,
  macros,
  nutrients,
  isAuthenticated,
  onBack,
  onAddToStack,
  onAddToCart,
}: ScanResultsScreenProps) {
  // ── Chat state ──
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatRateLimit, setChatRateLimit] = useState<ChatRateLimit | null>(null);
  const [chatTyping, setChatTyping] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const [addedToStack, setAddedToStack] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  // Reset chat when product changes
  useEffect(() => {
    setChatMessages([]);
    setChatRateLimit(null);
    setChatError(null);
  }, [result.productName]);

  const handleChatSend = useCallback(async (message: string) => {
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      role: 'user',
      content: message,
      timestamp: Date.now(),
    };
    setChatMessages(prev => [...prev, userMsg]);
    setChatError(null);
    setChatTyping(true);

    try {
      const response = await sendSupplementChatMessage({
        message,
        scanResult: result,
        history: [...chatMessages, userMsg],
      });

      const assistantMsg: ChatMessage = {
        id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        role: 'assistant',
        content: response.reply,
        timestamp: Date.now(),
      };
      setChatMessages(prev => [...prev, assistantMsg]);
      setChatRateLimit({
        remaining: response.remaining,
        limit: response.limit,
        resetsAt: response.resetsAt ? new Date(response.resetsAt).getTime() : null,
      });
    } catch (err) {
      if (err instanceof RateLimitError) {
        setChatRateLimit({
          remaining: 0,
          limit: err.limit,
          resetsAt: err.resetsAt ? new Date(err.resetsAt).getTime() : null,
        });
        setChatError('Message limit reached.');
      } else {
        setChatError('Something went wrong. Try again.');
      }
    } finally {
      setChatTyping(false);
    }
  }, [result, chatMessages]);

  const handleAddToStack = () => {
    onAddToStack(result.findings);
    setAddedToStack(true);
    setTimeout(() => setAddedToStack(false), 2000);
  };

  const handleAddToCart = () => {
    const cartItem = buildCartItem(result, scanMode, nutrients, macros);
    onAddToCart(cartItem);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const goodFindings = result.findings.filter(f => f.status === 'good');
  const badFindings = result.findings.filter(f => f.status === 'bad');
  const warnFindings = result.findings.filter(f => f.status === 'warn');
  const isFood = scanMode === 'food';

  // Build chat suggestions based on supplement scan
  const chatSuggestions: string[] = [];
  if (badFindings.length > 0) chatSuggestions.push(`Why is ${badFindings[0].name} flagged?`);
  if (warnFindings.length > 0) chatSuggestions.push(`Is ${warnFindings[0].name} a concern?`);
  chatSuggestions.push('Any better alternatives?');
  if (goodFindings.length > 0) chatSuggestions.push('What makes this supplement good?');

  return (
    <div className="min-h-dvh" style={{ background: 'hsl(var(--ss-bg))' }}>
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 text-[13px] font-medium transition-opacity active:opacity-60"
          style={{ color: 'hsl(var(--ss-text-secondary))' }}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
          Back
        </button>
        <span
          className="text-[10px] font-semibold uppercase tracking-widest"
          style={{ color: 'hsl(var(--ss-text-muted))' }}
        >
          Scan Report
        </span>
      </div>

      <div className="px-5 pb-10">
        {/* ── Scan Results (reuse existing component) ── */}
        <ScanResults
          result={result}
          scanMode={scanMode}
          macros={macros}
          nutrients={nutrients}
          onAddToStack={handleAddToStack}
          onAddToCart={handleAddToCart}
        />

        {/* Feedback badges */}
        {(addedToStack || addedToCart) && (
          <div
            className="mt-3 text-center text-[12px] font-semibold py-2 rounded-xl"
            style={{
              background: 'hsl(var(--ss-good) / 0.1)',
              color: 'hsl(var(--ss-good))',
              border: '1px solid hsl(var(--ss-good) / 0.2)',
              animation: 'ssResultFadeUp 0.3s ease both',
            }}
          >
            {addedToStack ? 'Added to stack!' : 'Added to cart!'}
          </div>
        )}

        {/* Scan another */}
        <button
          type="button"
          onClick={onBack}
          className="w-full py-3 rounded-xl text-[12px] font-semibold transition-all active:scale-[0.97] mt-3"
          style={{
            background: 'hsl(var(--ss-surface-raised))',
            color: 'hsl(var(--ss-text-secondary))',
            border: '1px solid hsl(var(--ss-border))',
          }}
        >
          Scan Another
        </button>
      </div>

      {/* ── Chat FAB + Floating Window ── */}
      <ChatPanel
        productName={result.productName}
        assistantLabel={isFood ? 'Nutrition Assistant' : 'Supplement Assistant'}
        suggestions={chatSuggestions.slice(0, 3)}
        emptyStateHint={isFood
          ? 'Ask about macros, daily values, healthier alternatives...'
          : 'Ask about ingredient quality, dosing, bioavailability, better alternatives...'}
        messages={chatMessages}
        rateLimit={chatRateLimit}
        isAuthenticated={isAuthenticated}
        isTyping={chatTyping}
        errorMessage={chatError}
        onSendMessage={handleChatSend}
      />

      {/* ── Animations ── */}
      <style>{`
        @keyframes ssResultFadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
