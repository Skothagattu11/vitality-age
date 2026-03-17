import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// ── Single smart prompt that auto-detects image content ──

function buildPrompt(modeHint: string): string {
  return `Analyze this image. Auto-detect: A) Supplement Facts label, B) Nutrition Facts label, C) Food photo. Mode hint: "${modeHint}" — override if image differs.

Return JSON:
{"detectedType":"supplement"|"food_label"|"food_photo","productName":"string","brand":"string|null","score":number,"verdict":"string","servingAlert":"string|null","findings":[{"name":"string","status":"good"|"warn"|"bad","detail":"string","dose":"string|null","absorbed":"string|null","tag":"string|null"}],"nutrients":[{"name":"string","amount":number,"unit":"mg"|"mcg"|"IU"|"g","dailyValuePct":number,"form":"string|null","quality":"good"|"moderate"|"poor"}],"macros":{"calories":number,"protein":number,"carbs":number,"fat":number,"fiber":number}}

Rules:
- Supplements: score 0-100 (start 50, ±quality/forms/doses/fillers). Analyze every ingredient. tags: "Quality Form","Low Bioavail","Filler","Underdosed","Overdosed",null
- Food labels: score=0. Extract exact values from panel.
- Food photos: score=0. Use USDA data per standard serving. NEVER return zero macros for real food.
- nutrients MUST include all non-zero: Vitamin A,C,D,E,K,B6,B12,Thiamin,Riboflavin,Niacin,Folate,Biotin,Pantothenic Acid,Calcium,Iron,Magnesium,Zinc,Selenium,Copper,Potassium,Sodium,Phosphorus,Iodine,Choline,Omega-3(DHA+EPA mg).
- Fish/eggs: always include Omega-3.
- findings: "good"=quality/≥15%DV, "warn"=suboptimal/5-14%DV, "bad"=filler/high sugar/sodium.

JSON only, no markdown.`;
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
    if (part.thought) continue; // Skip thinking/reasoning parts
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
    const mode = (formData.get("mode") as string) || "supplement";

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

    // Convert to base64 for Gemini
    const { base64, mimeType } = await imageToBase64(imageFile);
    const prompt = buildPrompt(mode);

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
          maxOutputTokens: 4096,
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

    // Validate and normalize the response to match ScanResult shape
    const scanResult = {
      detectedType: parsed.detectedType || "supplement",
      productName: parsed.productName || "Unknown Product",
      brand: parsed.brand || undefined,
      score: typeof parsed.score === "number" ? Math.max(0, Math.min(100, parsed.score)) : 0,
      verdict: parsed.verdict || "Analysis complete",
      servingAlert: parsed.servingAlert || undefined,
      findings: Array.isArray(parsed.findings)
        ? parsed.findings.map((f: Record<string, unknown>) => ({
            name: f.name || "Unknown",
            status: ["good", "warn", "bad"].includes(f.status as string) ? f.status : "warn",
            detail: f.detail || "",
            dose: f.dose || undefined,
            absorbed: f.absorbed || undefined,
            tag: f.tag || undefined,
          }))
        : [],
      // Extended fields for CartItem building (not in ScanResult type but passed through)
      _nutrients: Array.isArray(parsed.nutrients)
        ? parsed.nutrients.map((n: Record<string, unknown>) => ({
            name: n.name || "Unknown",
            amount: typeof n.amount === "number" ? n.amount : 0,
            unit: n.unit || "mg",
            dailyValuePct: typeof n.dailyValuePct === "number" ? n.dailyValuePct : 0,
            form: n.form || undefined,
            quality: ["good", "moderate", "poor"].includes(n.quality as string) ? n.quality : undefined,
          }))
        : [],
      _macros: (() => {
        const m = (parsed.macros || {}) as Record<string, unknown>;
        return {
          calories: typeof m.calories === "number" ? m.calories : 0,
          protein: typeof m.protein === "number" ? m.protein : 0,
          carbs: typeof m.carbs === "number" ? m.carbs : 0,
          fat: typeof m.fat === "number" ? m.fat : 0,
          fiber: typeof m.fiber === "number" ? m.fiber : 0,
        };
      })(),
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
