// Chat service for ingredient follow-up questions
// Calls the chat-about-scan Supabase Edge Function

import { supabase } from '@/integrations/supabase/client';
import type { SkinScanResult, SkinProfile, ChatMessage } from '@/types/skinScanner';
import { getSessionId } from '@/utils/skinScannerSync';

export interface ChatResponse {
  reply: string;
  remaining: number;
  limit: number;
  resetsAt: string | null;
}

export interface ChatError {
  error: string;
  remaining?: number;
  limit?: number;
  resetsAt?: string | null;
}

export async function sendChatMessage(params: {
  message: string;
  scanResult: SkinScanResult;
  skinProfile: SkinProfile;
  history: ChatMessage[];
}): Promise<ChatResponse> {
  const sessionId = getSessionId();
  const session = await supabase.auth.getSession();
  const userId = session.data.session?.user?.id || undefined;

  const { data, error } = await supabase.functions.invoke('chat-about-scan', {
    body: {
      message: params.message,
      scanResult: params.scanResult,
      skinProfile: params.skinProfile,
      history: params.history.slice(-10).map(m => ({ role: m.role, content: m.content })),
      sessionId,
      userId,
    },
  });

  if (error) {
    throw new Error(`Chat failed: ${error.message}`);
  }

  // Handle rate limit response (edge function returns 429 as data with error field)
  if (data?.error) {
    const chatError = data as ChatError;
    if (chatError.error === 'Rate limit exceeded') {
      throw new RateLimitError(chatError.remaining ?? 0, chatError.limit ?? 5, chatError.resetsAt ?? null);
    }
    throw new Error(chatError.error);
  }

  return data as ChatResponse;
}

export class RateLimitError extends Error {
  remaining: number;
  limit: number;
  resetsAt: string | null;

  constructor(remaining: number, limit: number, resetsAt: string | null) {
    super('Rate limit exceeded');
    this.name = 'RateLimitError';
    this.remaining = remaining;
    this.limit = limit;
    this.resetsAt = resetsAt;
  }
}
