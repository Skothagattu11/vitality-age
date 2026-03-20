// Chat service for supplement/food follow-up questions
// Calls the same chat-about-scan edge function with toolContext='supplement'

import { supabase } from '@/integrations/supabase/client';
import type { ScanResult } from '@/types/supplementStacker';
import type { ChatMessage } from '@/types/skinScanner';
import { getSessionId } from '@/utils/stackerSync';
import { RateLimitError } from '@/services/chatService';

export { RateLimitError } from '@/services/chatService';

export interface SupplementChatResponse {
  reply: string;
  remaining: number;
  limit: number;
  resetsAt: string | null;
}

export async function sendSupplementChatMessage(params: {
  message: string;
  scanResult: ScanResult;
  history: ChatMessage[];
}): Promise<SupplementChatResponse> {
  const sessionId = getSessionId();
  const session = await supabase.auth.getSession();
  const userId = session.data.session?.user?.id || undefined;

  const { data, error } = await supabase.functions.invoke('chat-about-scan', {
    body: {
      message: params.message,
      scanResult: params.scanResult,
      history: params.history.slice(-10).map(m => ({ role: m.role, content: m.content })),
      sessionId,
      userId,
      toolContext: 'supplement',
    },
  });

  if (error) {
    throw new Error(`Chat failed: ${error.message}`);
  }

  if (data?.error) {
    if (data.error === 'Rate limit exceeded') {
      throw new RateLimitError(data.remaining ?? 0, data.limit ?? 5, data.resetsAt ?? null);
    }
    throw new Error(data.error);
  }

  return data as SupplementChatResponse;
}
