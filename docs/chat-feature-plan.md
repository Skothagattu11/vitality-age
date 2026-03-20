# Skin Scanner Chat Feature — Production Implementation Plan

**Goal:** Add follow-up chat interface after scanning a product, powered by Gemini 2.5 Flash with scan result as conversation context.

**Architecture:** Edge function handles multi-turn Gemini conversation with rate limiting. Chat UI is a collapsible panel at bottom of ScanResultsScreen. Guests get 5 messages lifetime, authenticated users get 20/hr.

---

## Types (`src/types/skinScanner.ts`)

```typescript
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface ChatSession {
  productName: string;
  scanResult: SkinScanResult;
  messages: ChatMessage[];
  startedAt: number;
}

export interface ChatRateLimit {
  remaining: number;
  limit: number;
  resetsAt: number | null; // null for guest (lifetime cap)
}
```

## Edge Function: `chat-about-scan`

**Request:**
```typescript
{
  message: string;
  scanResult: SkinScanResult;
  skinProfile: SkinProfile;
  history: { role: string; content: string }[];
  sessionId: string;
  userId?: string;
}
```

**Rate limiting:**
- Table: `chat_rate_limits` (identifier, identifier_type, message_count, window_start)
- Guest: message_count < 5 (lifetime)
- Auth: message_count < 20 within 1-hour rolling window

**Context guardrails (system prompt):**
- Only skincare/ingredient questions about the scanned product
- 2-4 sentence answers, no medical advice
- Reference specific ingredients from scan

**Gemini config:** temperature 0.3, max 512 output tokens, thinking disabled, last 10 turns

**Response:**
```typescript
{ reply: string; remaining: number; limit: number; resetsAt: string | null }
```

## Chat Service (`src/services/chatService.ts`)

Wraps `supabase.functions.invoke('chat-about-scan')`, trims history to last 10.

## Chat UI Components

- `ChatPanel.tsx` — collapsible drawer, expand/collapse, message list + input
- `ChatMessage.tsx` — bubble (user right/accent, assistant left/surface)
- `ChatInput.tsx` — input bar, 200 char limit, send button
- `QuickSuggestions.tsx` — 3 contextual starter pills based on scan result

## State (`useSkinScanner.ts`)

New state: `activeChatSession: ChatSession | null`, `chatRateLimit: ChatRateLimit | null`
New methods: `startChatSession()`, `addChatMessage()`, `updateChatRateLimit()`, `clearChatSession()`
Chat resets on new product scan. Messages in localStorage only (not synced to Supabase).

## DB Migration

```sql
create table if not exists public.chat_rate_limits (
  id uuid default gen_random_uuid() primary key,
  identifier text not null,
  identifier_type text not null check (identifier_type in ('guest', 'user')),
  message_count integer default 0,
  window_start timestamptz default now(),
  created_at timestamptz default now(),
  unique(identifier, identifier_type)
);
alter table public.chat_rate_limits enable row level security;
```

## Implementation Order

| Step | What | Files |
|------|------|-------|
| 1 | Types | `src/types/skinScanner.ts` |
| 2 | Chat UI (mock) | `src/components/skin-scanner/chat/` |
| 3 | Integration | `ScanResultsScreen.tsx` |
| 4 | DB migration | Supabase SQL |
| 5 | Edge function | `supabase/functions/chat-about-scan/index.ts` |
| 6 | Chat service | `src/services/chatService.ts` |
| 7 | Hook updates | `src/hooks/useSkinScanner.ts` |
| 8 | Wire real API | Replace mocks with real calls |

## Security

| Concern | Mitigation |
|---------|------------|
| Prompt injection | Scan result as structured JSON in system message |
| Off-topic abuse | System prompt constrains to skincare only |
| Rate abuse (guest) | 5 lifetime, server-side by session_id |
| Rate abuse (auth) | 20/hr rolling window, server-side by user_id |
| Token cost | 512 max output, 200 char input, 10 turn history |
| Session spoofing | Rate limits enforced server-side |
