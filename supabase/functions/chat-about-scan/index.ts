import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// ── Rate limit constants ──
const GUEST_LIMIT = 5;        // lifetime
const AUTH_LIMIT = 20;         // per hour
const AUTH_WINDOW_MS = 60 * 60 * 1000; // 1 hour

// ── System prompt builder ──
function buildSystemPrompt(
  scanResult: Record<string, unknown>,
  profileContext: Record<string, unknown>,
  toolContext: string,
): string {
  if (toolContext === "supplement") {
    return `You are a supplement and nutrition expert embedded in a product scanner app. The user just scanned a supplement or food label and is asking follow-up questions.

SCANNED PRODUCT:
${JSON.stringify(scanResult, null, 2)}

RULES:
- Only answer questions about this product's ingredients, supplement science, dosing, bioavailability, and nutrition.
- If the user asks anything unrelated to supplements, nutrition, or this product, respond with: "I can only help with questions about your scanned products and supplement ingredients. Try asking about a specific ingredient, dosing, or alternative product."
- Keep answers concise: 2-4 sentences max. Use bullet points for lists.
- Never provide medical advice. For medical concerns say "consult a healthcare provider."
- Reference specific findings from the scan when relevant (quality forms, bioavailability, fillers, doses).
- Be direct and helpful, not verbose.`;
  }

  return `You are a skincare ingredient expert embedded in a product scanner app. The user just scanned a product and is asking follow-up questions.

SCANNED PRODUCT:
${JSON.stringify(scanResult, null, 2)}

USER'S SKIN PROFILE:
${JSON.stringify(profileContext, null, 2)}

RULES:
- Only answer questions about this product's ingredients, skincare science, routines, and related products.
- If the user asks anything unrelated to skincare, ingredients, or this product, respond with: "I can only help with questions about your scanned products and skincare ingredients. Try asking about a specific ingredient, safety concern, or alternative product."
- Keep answers concise: 2-4 sentences max. Use bullet points for lists.
- Never provide medical advice. For medical concerns say "consult a dermatologist."
- Reference specific ingredients from the scan when relevant.
- Be direct and helpful, not verbose.`;
}

// ── Extract text from Gemini response ──
function extractTextFromResponse(geminiData: Record<string, unknown>): string | null {
  const candidates = geminiData.candidates as Array<Record<string, unknown>> | undefined;
  if (!candidates || candidates.length === 0) return null;
  const content = candidates[0].content as Record<string, unknown> | undefined;
  if (!content) return null;
  const parts = content.parts as Array<Record<string, unknown>> | undefined;
  if (!parts || parts.length === 0) return null;

  let resultText: string | null = null;
  for (const part of parts) {
    if (part.thought) continue;
    if (typeof part.text === "string") resultText = part.text;
  }
  return resultText;
}

// ── Rate limiting ──
interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  limit: number;
  resetsAt: string | null;
}

async function checkAndIncrementRateLimit(
  supabase: ReturnType<typeof createClient>,
  identifier: string,
  identifierType: "guest" | "user",
): Promise<RateLimitResult> {
  const limit = identifierType === "guest" ? GUEST_LIMIT : AUTH_LIMIT;

  // Get or create rate limit row
  const { data: existing } = await supabase
    .from("chat_rate_limits")
    .select("*")
    .eq("identifier", identifier)
    .eq("identifier_type", identifierType)
    .single();

  if (!existing) {
    // First message — create row and allow
    await supabase.from("chat_rate_limits").insert({
      identifier,
      identifier_type: identifierType,
      message_count: 1,
      window_start: new Date().toISOString(),
    });
    return { allowed: true, remaining: limit - 1, limit, resetsAt: null };
  }

  let messageCount = existing.message_count ?? 0;
  let windowStart = new Date(existing.window_start);

  // For authenticated users, check if window has expired and reset
  if (identifierType === "user") {
    const now = Date.now();
    const windowAge = now - windowStart.getTime();
    if (windowAge > AUTH_WINDOW_MS) {
      // Window expired — reset
      messageCount = 0;
      windowStart = new Date();
    }
  }

  // Check if over limit
  if (messageCount >= limit) {
    const resetsAt = identifierType === "user"
      ? new Date(windowStart.getTime() + AUTH_WINDOW_MS).toISOString()
      : null;
    return { allowed: false, remaining: 0, limit, resetsAt };
  }

  // Increment
  const newCount = messageCount + 1;
  await supabase
    .from("chat_rate_limits")
    .update({
      message_count: newCount,
      window_start: windowStart.toISOString(),
    })
    .eq("identifier", identifier)
    .eq("identifier_type", identifierType);

  const remaining = limit - newCount;
  const resetsAt = identifierType === "user"
    ? new Date(windowStart.getTime() + AUTH_WINDOW_MS).toISOString()
    : null;

  return { allowed: true, remaining, limit, resetsAt };
}

// ── Main handler ──

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (!GEMINI_API_KEY) {
    return new Response(JSON.stringify({ error: "GEMINI_API_KEY not configured" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json();
    const {
      message,
      scanResult,
      skinProfile,
      history,
      sessionId,
      userId,
      toolContext: rawToolContext,
    } = body as {
      message: string;
      scanResult: Record<string, unknown>;
      skinProfile?: Record<string, unknown>;
      history: Array<{ role: string; content: string }>;
      sessionId: string;
      userId?: string;
      toolContext?: string;
    };
    const toolContext = rawToolContext || "skincare";

    // Validate input
    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return new Response(JSON.stringify({ error: "Message is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (message.length > 200) {
      return new Response(JSON.stringify({ error: "Message too long (max 200 characters)" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!scanResult || !sessionId) {
      return new Response(JSON.stringify({ error: "scanResult and sessionId are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── Rate limiting ──
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    const identifier = userId || sessionId;
    const identifierType = userId ? "user" : "guest";

    const rateCheck = await checkAndIncrementRateLimit(supabase, identifier, identifierType as "guest" | "user");

    if (!rateCheck.allowed) {
      return new Response(JSON.stringify({
        error: "Rate limit exceeded",
        remaining: 0,
        limit: rateCheck.limit,
        resetsAt: rateCheck.resetsAt,
      }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── Build Gemini conversation ──
    const systemPrompt = buildSystemPrompt(scanResult, skinProfile || {}, toolContext);

    // Build contents array: system instruction + history + new message
    const contents: Array<{ role: string; parts: Array<{ text: string }> }> = [];

    // Add conversation history (last 10 turns)
    const trimmedHistory = Array.isArray(history) ? history.slice(-10) : [];
    for (const turn of trimmedHistory) {
      contents.push({
        role: turn.role === "assistant" ? "model" : "user",
        parts: [{ text: turn.content }],
      });
    }

    // Add the new user message
    contents.push({
      role: "user",
      parts: [{ text: message.trim() }],
    });

    // ── Call Gemini ──
    const geminiResponse = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: systemPrompt }],
        },
        contents,
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 512,
          thinkingConfig: { thinkingBudget: 0 },
        },
      }),
    });

    if (!geminiResponse.ok) {
      const errText = await geminiResponse.text();
      console.error("Gemini API error:", geminiResponse.status, errText);
      return new Response(JSON.stringify({ error: "AI response failed" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const geminiData = await geminiResponse.json();
    const reply = extractTextFromResponse(geminiData);

    if (!reply) {
      console.error("Empty Gemini response:", JSON.stringify(geminiData));
      return new Response(JSON.stringify({ error: "Empty AI response" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({
      reply: reply.trim(),
      remaining: rateCheck.remaining,
      limit: rateCheck.limit,
      resetsAt: rateCheck.resetsAt,
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
