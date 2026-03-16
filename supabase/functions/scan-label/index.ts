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
  return `You are an expert nutritionist and supplement analyst. Analyze this image and auto-detect what it contains:

A) **Supplement Facts label** — analyze ingredient quality, forms, doses, bioavailability
B) **Nutrition Facts label** — extract exact nutritional values from the panel
C) **Photo of food** (fruit, vegetables, meal, snack, etc.) — identify the food and provide USDA-based nutrition estimates per standard serving

The user's mode hint is "${modeHint}" but ALWAYS analyze what you actually see in the image. If the user selected "supplement" but the image shows an apple, treat it as food.

Return a JSON object with this EXACT structure:

{
  "detectedType": "supplement" | "food_label" | "food_photo",
  "productName": "Name of product or food",
  "brand": "Brand name or null",
  "score": number,
  "verdict": "One sentence summary",
  "servingAlert": "Serving note or null",
  "findings": [
    {
      "name": "Ingredient or Nutrient Name",
      "status": "good" | "warn" | "bad",
      "detail": "Brief explanation",
      "dose": "Amount with unit or null",
      "absorbed": "Absorption info or null",
      "tag": "Tag or null"
    }
  ],
  "nutrients": [
    {
      "name": "Nutrient Name",
      "amount": number,
      "unit": "mg" | "mcg" | "IU" | "g",
      "dailyValuePct": number,
      "form": "Form name or null",
      "quality": "good" | "moderate" | "poor"
    }
  ],
  "macros": {
    "calories": number,
    "protein": number,
    "carbs": number,
    "fat": number,
    "fiber": number
  }
}

=== RULES BY TYPE ===

**For SUPPLEMENT FACTS labels (type A):**
- Score 0-100: Start at 50. +5 quality forms, +3 good doses, +5 clean label. -5 poor forms, -8 fillers, -3 underdosing.
- Analyze EVERY ingredient on the label
- findings status: "good" = quality form/proper dose, "warn" = suboptimal form, "bad" = filler/underdosed
- tag values: "Quality Form", "Low Bioavail", "Filler", "Underdosed", "Overdosed", or null
- Extract all vitamins/minerals into nutrients array with dailyValuePct

**For NUTRITION FACTS labels (type B):**
- score: 0 (not applicable for food labels)
- Extract exact values from the panel into macros and nutrients
- findings: highlight notable nutrients ("good" >= 15% DV, "warn" 5-14% DV, "bad" high sugar/sodium/trans fat)

**For FOOD PHOTOS (type C):**
- score: 0 (not applicable)
- Identify the food item(s) visible in the image
- productName: descriptive name like "Guava (Fresh)" or "Red Apple (Medium)"
- verdict: serving description like "1 medium guava (55g)" or "1 medium apple (182g)"
- macros: MUST have real non-zero values from USDA data. NEVER return all zeros.
- nutrients: include key vitamins/minerals the food is known for (e.g., guava is high in Vitamin C, fiber)
- findings: highlight what makes this food nutritionally notable
  - "good": Rich in vitamins, minerals, fiber, antioxidants
  - "warn": Moderate sugar content, etc.
  - "bad": Only if genuinely concerning (e.g., very high sugar)

CRITICAL: For food photos, you MUST provide real nutritional data. An apple has ~95 calories, 25g carbs, 4.4g fiber. A guava has ~37 calories per fruit, 8g carbs, 3g fiber, 228mg Vitamin C. Never return zeros for real food.

Return ONLY valid JSON, no markdown or explanation.`;
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
          temperature: 0.1,
          maxOutputTokens: 8192,
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
      _macros: {
        calories: typeof parsed.macros?.calories === "number" ? parsed.macros.calories : 0,
        protein: typeof parsed.macros?.protein === "number" ? parsed.macros.protein : 0,
        carbs: typeof parsed.macros?.carbs === "number" ? parsed.macros.carbs : 0,
        fat: typeof parsed.macros?.fat === "number" ? parsed.macros.fat : 0,
        fiber: typeof parsed.macros?.fiber === "number" ? parsed.macros.fiber : 0,
      },
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
