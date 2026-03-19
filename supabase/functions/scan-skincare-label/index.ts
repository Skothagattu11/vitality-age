import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// ── Skincare analysis prompt ──

function buildPrompt(skinProfile: Record<string, unknown>): string {
  const profileStr = JSON.stringify(skinProfile);
  return `Analyze this skincare product label. Skin profile: ${profileStr}

Return JSON (no markdown):
{"productName":"string","brand":"string|null","safetyScore":1-10,"compatibilityScore":0-100,"compatibilityConfidence":"full"|"partial"|"generic","verdict":"1-2 sentence summary","applicationInstructions":{"timeOfDay":"AM"|"PM"|"both","routineStep":"string","routineCategory":"cleanser"|"toner"|"serum"|"moisturizer"|"sunscreen"|"treatment"|"mask"|"exfoliant"|"eye"|"other","amount":"string","waitTime":"string|null","tips":["max 2 tips"]},"ingredients":{"heroActives":[{"name":"string","purpose":"2-3 words","safety":"good"|"moderate"|"bad","compatibility":"beneficial"|"neutral"|"caution"|"avoid","detail":"1 sentence max","dose":null,"flagReason":null}],"supporting":[],"baseFiller":[],"watchOut":[]},"unknownIngredients":[],"detectedType":"skincare"|"cosmetic"|"unknown"}

Keep it concise:
- safetyScore: 1=safest, 10=worst. Weighted average biased toward worst ingredients.
- compatibilityScore: 0-100 personalized. "full" if profile has type+concerns+sensitivity.
- Limit: max 5 heroActives, 5 supporting, 8 baseFiller, all watchOut items. Skip trivial base ingredients like water.
- purpose: 2-3 words only (e.g. "hydration", "UV protection", "exfoliant")
- detail: 1 short sentence max
- flagReason: only for watchOut items
- verdict: 1-2 sentences, direct
- tips: max 2`;
}

// ── Helper: Convert image File to base64 ──

async function imageToBase64(file: File): Promise<{ base64: string; mimeType: string }> {
  const arrayBuffer = await file.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64 = btoa(binary);
  const mimeType = file.type || "image/jpeg";
  return { base64, mimeType };
}

// ── Extract text from Gemini response (handles thinking model multi-part responses) ──

function extractTextFromResponse(geminiData: Record<string, unknown>): string | null {
  const candidates = geminiData.candidates as Array<Record<string, unknown>> | undefined;
  if (!candidates || candidates.length === 0) return null;

  const content = candidates[0].content as Record<string, unknown> | undefined;
  if (!content) return null;

  const parts = content.parts as Array<Record<string, unknown>> | undefined;
  if (!parts || parts.length === 0) return null;

  // Gemini 2.5 thinking models return multiple parts:
  // - thought parts (with "thought": true) contain reasoning
  // - regular parts contain the actual answer
  // We want the LAST non-thought text part
  let resultText: string | null = null;
  for (const part of parts) {
    if (part.thought) continue;
    if (typeof part.text === "string") {
      resultText = part.text;
    }
  }
  return resultText;
}

// ── Robust JSON extraction ──

function extractJSON(raw: string): Record<string, unknown> {
  // Try direct parse first
  try {
    return JSON.parse(raw);
  } catch { /* continue */ }

  // Strip markdown fences
  const stripped = raw.replace(/^```json?\s*\n?/i, "").replace(/\n?```\s*$/i, "").trim();
  try {
    return JSON.parse(stripped);
  } catch { /* continue */ }

  // Find first { and last } — extract JSON object from surrounding text
  const firstBrace = raw.indexOf("{");
  const lastBrace = raw.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    try {
      return JSON.parse(raw.substring(firstBrace, lastBrace + 1));
    } catch { /* continue */ }
  }

  throw new Error("Could not extract valid JSON from response");
}

// ── Main handler ──

serve(async (req: Request) => {
  // Handle CORS preflight
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
    const formData = await req.formData();
    const imageFile = formData.get("image") as File | null;
    const skinProfileRaw = (formData.get("skinProfile") as string) || "{}";

    if (!imageFile) {
      return new Response(JSON.stringify({ error: "No image provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate file size (10MB max)
    if (imageFile.size > 10 * 1024 * 1024) {
      return new Response(JSON.stringify({ error: "Image too large (max 10MB)" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Parse skin profile
    let skinProfile: Record<string, unknown> = {};
    try {
      skinProfile = JSON.parse(skinProfileRaw);
    } catch {
      console.warn("Invalid skinProfile JSON, using empty profile");
    }

    // Convert to base64 for Gemini
    const { base64, mimeType } = await imageToBase64(imageFile);
    const prompt = buildPrompt(skinProfile);

    // Call Gemini Flash Vision
    // thinkingConfig budget=0 disables thinking for reliable JSON output
    const geminiResponse = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt },
              {
                inline_data: {
                  mime_type: mimeType,
                  data: base64,
                },
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0,
          maxOutputTokens: 2048,
          responseMimeType: "application/json",
          thinkingConfig: { thinkingBudget: 0 },
        },
      }),
    });

    if (!geminiResponse.ok) {
      const errText = await geminiResponse.text();
      console.error("Gemini API error:", geminiResponse.status, errText);
      return new Response(JSON.stringify({ error: "AI analysis failed", detail: errText }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const geminiData = await geminiResponse.json();

    // Extract text from response (handles thinking model multi-part responses)
    const rawText = extractTextFromResponse(geminiData);
    if (!rawText) {
      console.error("No text in Gemini response:", JSON.stringify(geminiData));
      return new Response(JSON.stringify({ error: "Empty AI response" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Robust JSON extraction
    let parsed;
    try {
      parsed = extractJSON(rawText);
    } catch (parseErr) {
      console.error("JSON parse error:", parseErr, "Raw:", rawText.substring(0, 500));
      return new Response(JSON.stringify({ error: "Failed to parse AI response", raw: rawText.substring(0, 200) }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate and normalize the response
    const normSafety = (val: unknown): string => {
      if (val === "good" || val === "moderate" || val === "bad") return val;
      if (typeof val === "number") return val <= 3 ? "good" : val <= 6 ? "moderate" : "bad";
      return "moderate";
    };
    const normCompat = (val: unknown): string => {
      if (["beneficial", "neutral", "caution", "avoid"].includes(val as string)) return val as string;
      if (typeof val === "number") return val >= 70 ? "beneficial" : val >= 40 ? "neutral" : "caution";
      return "neutral";
    };
    const normalizeIngredientList = (list: unknown) =>
      Array.isArray(list)
        ? list.map((ing: Record<string, unknown>) => ({
            name: ing.name || "Unknown",
            purpose: ing.purpose || "",
            safety: normSafety(ing.safety),
            compatibility: normCompat(ing.compatibility),
            detail: ing.detail || "",
            dose: ing.dose || null,
            flagReason: ing.flagReason || null,
          }))
        : [];

    const ingredients = (parsed.ingredients || {}) as Record<string, unknown>;
    const appInstructions = (parsed.applicationInstructions || {}) as Record<string, unknown>;

    const scanResult = {
      productName: parsed.productName || "Unknown Product",
      brand: parsed.brand || null,
      safetyScore: typeof parsed.safetyScore === "number" ? Math.max(1, Math.min(10, parsed.safetyScore)) : 5,
      compatibilityScore: typeof parsed.compatibilityScore === "number" ? Math.max(0, Math.min(100, parsed.compatibilityScore)) : 50,
      compatibilityConfidence: ["full", "partial", "generic"].includes(parsed.compatibilityConfidence as string)
        ? parsed.compatibilityConfidence
        : "generic",
      verdict: parsed.verdict || "Analysis complete",
      applicationInstructions: {
        timeOfDay: ["AM", "PM", "both"].includes(appInstructions.timeOfDay as string) ? appInstructions.timeOfDay : "both",
        routineStep: appInstructions.routineStep || "",
        routineCategory: appInstructions.routineCategory || "other",
        amount: appInstructions.amount || "",
        waitTime: appInstructions.waitTime || null,
        tips: Array.isArray(appInstructions.tips) ? appInstructions.tips : [],
      },
      ingredients: {
        heroActives: normalizeIngredientList(ingredients.heroActives),
        supporting: normalizeIngredientList(ingredients.supporting),
        baseFiller: normalizeIngredientList(ingredients.baseFiller),
        watchOut: normalizeIngredientList(ingredients.watchOut),
      },
      unknownIngredients: Array.isArray(parsed.unknownIngredients)
        ? parsed.unknownIngredients.map((u: Record<string, unknown>) => ({
            name: u.name || "Unknown",
            rawText: u.rawText || "",
          }))
        : [],
      detectedType: ["skincare", "cosmetic", "unknown"].includes(parsed.detectedType as string)
        ? parsed.detectedType
        : "unknown",
    };

    return new Response(JSON.stringify(scanResult), {
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
