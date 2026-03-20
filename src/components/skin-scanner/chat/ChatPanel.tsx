import { useState, useRef, useEffect, useCallback } from 'react';
import type { ChatMessage, ChatRateLimit } from '@/types/skinScanner';

// ── Lightweight markdown → JSX (bold, bullets, line breaks) ──
function renderMarkdown(text: string) {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Bullet line: * item or - item
    if (/^[\*\-]\s+/.test(trimmed)) {
      const content = trimmed.replace(/^[\*\-]\s+/, '');
      elements.push(
        <div key={i} className="flex items-start gap-1.5 mt-1">
          <span className="mt-[7px] w-[4px] h-[4px] rounded-full flex-shrink-0" style={{ background: 'currentColor', opacity: 0.4 }} />
          <span>{renderInline(content)}</span>
        </div>
      );
    } else if (trimmed === '') {
      // Empty line → spacer
      if (i > 0 && i < lines.length - 1) {
        elements.push(<div key={i} className="h-1.5" />);
      }
    } else {
      // Normal paragraph
      if (i > 0) elements.push(<div key={`br-${i}`} className="h-1" />);
      elements.push(<span key={i}>{renderInline(trimmed)}</span>);
    }
  }

  return <>{elements}</>;
}

// Inline: **bold** → <strong>
function renderInline(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  const regex = /\*\*(.+?)\*\*/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    parts.push(<strong key={match.index} className="font-semibold">{match[1]}</strong>);
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length === 1 ? parts[0] : <>{parts}</>;
}

// ── Default quick suggestion pills (skincare fallback) ──
const DEFAULT_SUGGESTIONS = ['Any better alternatives?', 'Is this safe for daily use?'];

// ── Single Message Bubble ──
function MessageBubble({ msg }: { msg: ChatMessage }) {
  const isUser = msg.role === 'user';
  return (
    <div
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-[ssChatFadeIn_0.25s_ease_both]`}
    >
      {/* Assistant avatar */}
      {!isUser && (
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mr-2 mt-1"
          style={{ background: 'hsl(var(--ss-accent2-soft))' }}
        >
          <svg className="w-3 h-3" style={{ color: 'hsl(var(--ss-accent2))' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
          </svg>
        </div>
      )}
      <div
        className="max-w-[80%] px-3.5 py-2.5 rounded-2xl text-[12.5px] leading-relaxed"
        style={{
          background: isUser ? 'hsl(var(--ss-accent2))' : 'hsl(var(--ss-surface))',
          color: isUser ? '#fff' : 'hsl(var(--ss-text))',
          border: isUser ? 'none' : '1px solid hsl(var(--ss-border-soft))',
          borderBottomRightRadius: isUser ? '6px' : undefined,
          borderBottomLeftRadius: !isUser ? '6px' : undefined,
          boxShadow: isUser ? '0 2px 8px hsl(var(--ss-accent2) / 0.3)' : 'var(--ss-shadow-sm)',
        }}
      >
        {isUser ? msg.content : renderMarkdown(msg.content)}
      </div>
    </div>
  );
}

// ── Typing Indicator ──
function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div
        className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mr-2 mt-1"
        style={{ background: 'hsl(var(--ss-accent2-soft))' }}
      >
        <svg className="w-3 h-3" style={{ color: 'hsl(var(--ss-accent2))' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
        </svg>
      </div>
      <div
        className="flex items-center gap-1.5 px-4 py-3 rounded-2xl"
        style={{
          background: 'hsl(var(--ss-surface))',
          border: '1px solid hsl(var(--ss-border-soft))',
          borderBottomLeftRadius: '6px',
        }}
      >
        {[0, 1, 2].map(i => (
          <span
            key={i}
            className="w-[5px] h-[5px] rounded-full"
            style={{
              background: 'hsl(var(--ss-text-muted))',
              animation: `ssChatDot 1.2s ease infinite ${i * 0.2}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

// ── Main ChatPanel (FAB + floating window) ──

interface ChatPanelProps {
  productName: string;
  assistantLabel?: string;
  suggestions?: string[];
  emptyStateHint?: string;
  messages: ChatMessage[];
  rateLimit: ChatRateLimit | null;
  isAuthenticated: boolean;
  isTyping: boolean;
  errorMessage: string | null;
  onSendMessage: (message: string) => void;
}

export function ChatPanel({
  productName,
  assistantLabel = 'Ingredient Assistant',
  suggestions: suggestionsProp,
  emptyStateHint = 'Why an ingredient was flagged, safer alternatives, how to layer with other products...',
  messages,
  rateLimit,
  isAuthenticated,
  isTyping,
  errorMessage,
  onSendMessage,
}: ChatPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const limit = rateLimit ?? { remaining: isAuthenticated ? 20 : 5, limit: isAuthenticated ? 20 : 5, resetsAt: null };
  const isLimited = limit.remaining <= 0;
  const hasUnread = messages.length > 0 && !isOpen;

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const handleSend = useCallback((text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg || isTyping || isLimited) return;
    onSendMessage(msg);
    setInput('');
  }, [input, isTyping, isLimited, onSendMessage]);

  const suggestions = suggestionsProp ?? DEFAULT_SUGGESTIONS;

  return (
    <>
      {/* ── Backdrop (dims page when chat is open) ── */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[199] animate-[ssChatBackdropIn_0.2s_ease_both]"
          style={{ background: 'hsl(0 0% 0% / 0.3)', backdropFilter: 'blur(2px)' }}
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* ── Floating Chat Window ── */}
      {isOpen && (
        <div
          className="fixed z-[200] animate-[ssChatWindowIn_0.3s_cubic-bezier(0.22,1,0.36,1)_both]"
          style={{
            bottom: 'calc(24px + env(safe-area-inset-bottom, 0px))',
            right: '16px',
            left: '16px',
            maxWidth: '420px',
            marginLeft: 'auto',
            borderRadius: '1.25rem',
            overflow: 'hidden',
            background: 'hsl(var(--ss-bg))',
            border: '1px solid hsl(var(--ss-border))',
            boxShadow: '0 12px 48px -8px hsl(0 0% 0% / 0.25), 0 0 0 1px hsl(var(--ss-border-soft))',
          }}
        >
          {/* Header */}
          <div
            className="flex items-center gap-3 px-4 py-3"
            style={{
              borderBottom: '1px solid hsl(var(--ss-border-soft))',
              background: 'hsl(var(--ss-surface))',
            }}
          >
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                background: 'linear-gradient(135deg, hsl(var(--ss-accent2)), hsl(var(--ss-accent)))',
              }}
            >
              <svg className="w-4 h-4" style={{ color: '#fff' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[13px] font-semibold block truncate" style={{ color: 'hsl(var(--ss-text))' }}>
                {productName}
              </span>
              <span className="text-[10px]" style={{ color: 'hsl(var(--ss-text-muted))' }}>
                {assistantLabel}
              </span>
            </div>
            <span
              className="ss-font-mono text-[9px] font-bold px-2 py-1 rounded-full flex-shrink-0"
              style={{
                background: isLimited ? 'hsl(var(--ss-danger) / 0.1)' : 'hsl(var(--ss-accent2) / 0.1)',
                color: isLimited ? 'hsl(var(--ss-danger))' : 'hsl(var(--ss-accent2))',
              }}
            >
              {limit.remaining}/{limit.limit}
            </span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors active:scale-95"
              style={{ background: 'hsl(var(--ss-surface-raised))' }}
            >
              <svg className="w-4 h-4" style={{ color: 'hsl(var(--ss-text-muted))' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6 6 18" /><path d="m6 6 12 12" />
              </svg>
            </button>
          </div>

          {/* Message list */}
          <div
            ref={listRef}
            className="px-3 py-3 space-y-3 overflow-y-auto scrollbar-thin"
            style={{ height: '52vh', maxHeight: '400px', minHeight: '200px' }}
          >
            {messages.length === 0 && !isTyping && (
              <div className="text-center py-8">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3"
                  style={{
                    background: 'linear-gradient(135deg, hsl(var(--ss-accent2-soft)), hsl(var(--ss-accent-soft, var(--ss-accent2-soft))))',
                  }}
                >
                  <svg className="w-6 h-6" style={{ color: 'hsl(var(--ss-accent2))' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                </div>
                <p className="text-[12px] font-semibold" style={{ color: 'hsl(var(--ss-text))' }}>
                  Ask about this product
                </p>
                <p className="text-[10.5px] mt-1 px-4 leading-relaxed" style={{ color: 'hsl(var(--ss-text-muted))' }}>
                  {emptyStateHint}
                </p>
              </div>
            )}
            {messages.map(msg => (
              <MessageBubble key={msg.id} msg={msg} />
            ))}
            {isTyping && <TypingIndicator />}
            {errorMessage && !isTyping && (
              <div className="flex justify-start animate-[ssChatFadeIn_0.25s_ease_both]">
                <div
                  className="max-w-[85%] px-3.5 py-2.5 rounded-2xl text-[11.5px] leading-relaxed"
                  style={{
                    background: 'hsl(var(--ss-danger) / 0.08)',
                    color: 'hsl(var(--ss-danger))',
                    border: '1px solid hsl(var(--ss-danger) / 0.15)',
                    borderBottomLeftRadius: '6px',
                  }}
                >
                  {errorMessage}
                </div>
              </div>
            )}
          </div>

          {/* Quick suggestions (only when empty) */}
          {messages.length === 0 && !isTyping && (
            <div
              className="px-3 pb-2.5 flex flex-wrap gap-1.5"
              style={{ borderTop: '1px solid hsl(var(--ss-border-soft) / 0.5)' }}
            >
              <div className="w-full pt-2.5 pb-1">
                <span className="text-[9px] font-bold uppercase tracking-[0.12em]" style={{ color: 'hsl(var(--ss-text-muted))' }}>
                  Try asking
                </span>
              </div>
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSend(s)}
                  className="text-[10.5px] font-medium px-3 py-1.5 rounded-full transition-all active:scale-95"
                  style={{
                    background: 'hsl(var(--ss-accent2-soft))',
                    color: 'hsl(var(--ss-accent2))',
                    border: '1px solid hsl(var(--ss-accent2) / 0.12)',
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Rate limit warning */}
          {isLimited && (
            <div
              className="px-4 py-2.5 text-center text-[11px]"
              style={{
                background: 'hsl(var(--ss-danger) / 0.06)',
                color: 'hsl(var(--ss-danger))',
                borderTop: '1px solid hsl(var(--ss-danger) / 0.12)',
              }}
            >
              {isAuthenticated
                ? `Message limit reached. Resets ${limit.resetsAt ? 'in ' + Math.ceil((limit.resetsAt - Date.now()) / 60000) + 'm' : 'soon'}.`
                : 'Free messages used. Sign in for 20 messages/hr.'}
            </div>
          )}

          {/* Input bar */}
          <div
            className="flex items-center gap-2 px-3 py-2.5"
            style={{
              borderTop: '1px solid hsl(var(--ss-border-soft))',
              background: 'hsl(var(--ss-surface))',
            }}
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value.slice(0, 200))}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder={isLimited ? 'Limit reached' : 'Ask about ingredients...'}
              disabled={isLimited}
              className="flex-1 bg-transparent text-[12.5px] outline-none placeholder:text-[hsl(var(--ss-text-muted))]"
              style={{ color: 'hsl(var(--ss-text))' }}
            />
            <span
              className="ss-font-mono text-[9px] flex-shrink-0"
              style={{
                color: 'hsl(var(--ss-text-muted))',
                opacity: input.length > 0 ? 1 : 0,
                transition: 'opacity 0.15s',
              }}
            >
              {input.length}/200
            </span>
            <button
              type="button"
              onClick={() => handleSend()}
              disabled={!input.trim() || isTyping || isLimited}
              className="w-8 h-8 rounded-xl flex items-center justify-center transition-all flex-shrink-0 active:scale-90"
              style={{
                background: input.trim() && !isTyping && !isLimited
                  ? 'hsl(var(--ss-accent2))'
                  : 'hsl(var(--ss-border-soft))',
                color: input.trim() && !isTyping && !isLimited
                  ? '#fff'
                  : 'hsl(var(--ss-text-muted))',
                boxShadow: input.trim() && !isTyping && !isLimited
                  ? '0 2px 8px hsl(var(--ss-accent2) / 0.3)'
                  : 'none',
                cursor: input.trim() && !isTyping && !isLimited ? 'pointer' : 'default',
              }}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* ── FAB Button ── */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="fixed z-[200] flex items-center justify-center transition-all active:scale-90 animate-[ssChatFabIn_0.4s_cubic-bezier(0.34,1.56,0.64,1)_0.6s_both]"
          style={{
            bottom: 'calc(24px + env(safe-area-inset-bottom, 0px))',
            right: '16px',
            width: '56px',
            height: '56px',
            borderRadius: '1rem',
            background: 'linear-gradient(135deg, hsl(var(--ss-accent2)), hsl(var(--ss-accent)))',
            color: '#fff',
            boxShadow: '0 4px 20px -2px hsl(var(--ss-accent2) / 0.4), 0 0 0 1px hsl(var(--ss-accent2) / 0.1)',
          }}
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          {/* Unread dot */}
          {hasUnread && (
            <span
              className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold animate-[ssChatPulse_2s_ease_infinite]"
              style={{
                background: 'hsl(var(--ss-danger))',
                color: '#fff',
                boxShadow: '0 0 8px hsl(var(--ss-danger) / 0.5)',
              }}
            >
              {messages.filter(m => m.role === 'assistant').length}
            </span>
          )}
        </button>
      )}

      {/* ── Animations ── */}
      <style>{`
        @keyframes ssChatWindowIn {
          from { opacity: 0; transform: translateY(16px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes ssChatBackdropIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes ssChatFabIn {
          from { opacity: 0; transform: scale(0.5); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes ssChatFadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes ssChatDot {
          0%, 60%, 100% { opacity: 0.3; transform: translateY(0); }
          30% { opacity: 1; transform: translateY(-3px); }
        }
        @keyframes ssChatPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.15); }
        }
      `}</style>
    </>
  );
}
