import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// ── Structured prompts for Gemini Vision ──

const SUPPLEMENT_PROMPT = `You are an expert supplement analyst. Analyze this supplement label image and return a JSON object with this exact structure:

{
  "productName": "Brand Product Name",
  "brand": "Brand Name",
  "score": 0-100,
  "verdict": "One sentence quality summary",
  "servingAlert": "Serving size note if relevant, or null",
  "findings": [
    {
      "name": "Ingredient Name (Form)",
      "status": "good" | "warn" | "bad",
      "detail": "Brief explanation of quality/concern",
      "dose": "Amount with unit",
      "absorbed": "Estimated absorption %",
      "tag": "Quality Form" | "Low Bioavail" | "Filler" | "Underdosed" | "Overdosed" | null
    }
  ],
  "nutrients": [
    {
      "name": "Nutrient Name",
      "amount": number,
      "unit": "mg" | "mcg" | "IU" | "g",
      "dailyValuePct": number,
      "form": "Specific form name or null",
      "quality": "good" | "moderate" | "poor"
    }
  ],
  "macros": { "calories": 0, "protein": 0, "carbs": 0, "fat": 0, "fiber": 0 }
}

Scoring rules:
- Start at 50. Add points for: quality forms (+5 each), good doses (+3 each), clean label (+5).
- Subtract for: poor forms (-5 each), fillers (-8 each), underdosing (-3 each), missing key nutrients (-2 each).
- Cap at 0-100.

For findings, analyze EVERY ingredient visible on the label. Flag:
- "good": Quality form, proper dose, beneficial ingredient
- "warn": Suboptimal form, borderline dose, or minor concern
- "bad": Harmful filler, severely underdosed, or problematic ingredient

For nutrients array, extract every vitamin/mineral with exact amounts from the Supplement Facts panel. Convert IU to mcg/mg where standard (e.g., Vitamin D: 1 IU = 0.025 mcg). Calculate dailyValuePct based on FDA daily values.

Return ONLY valid JSON, no markdown or explanation.`;

const FOOD_PROMPT = `You are an expert nutritionist. Analyze this nutrition facts label image and return a JSON object with this exact structure:

{
  "productName": "Product Name",
  "brand": "Brand Name or null",
  "score": 0,
  "verdict": "Serving size description (e.g., '1 cup (227g) per serving')",
  "servingAlert": null,
  "findings": [
    {
      "name": "Nutrient Name",
      "status": "good" | "warn" | "bad",
      "detail": "X% Daily Value",
      "dose": "Amount with unit"
    }
  ],
  "nutrients": [
    {
      "name": "Nutrient Name",
      "amount": number,
      "unit": "mg" | "mcg" | "g",
      "dailyValuePct": number,
      "form": null,
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

For findings, list the most notable nutrients:
- "good": >= 15% DV or notably high protein/fiber
- "warn": 5-14% DV or moderate amounts
- "bad": Added sugars > 10g, sodium > 20% DV, trans fat > 0

For nutrients array, extract ALL vitamins and minerals from the label with exact amounts. Calculate dailyValuePct based on FDA daily values.

For macros, extract exact values from the Nutrition Facts panel. Use grams for protein/carbs/fat/fiber, calories as-is.

Return ONLY valid JSON, no markdown or explanation.`;

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
    const prompt = mode === "food" ? FOOD_PROMPT : SUPPLEMENT_PROMPT;

    // Call Gemini Flash Vision
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
          maxOutputTokens: 4096,
          responseMimeType: "application/json",
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

    // Extract the JSON from Gemini response
    const rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) {
      console.error("No text in Gemini response:", JSON.stringify(geminiData));
      return new Response(JSON.stringify({ error: "Empty AI response" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Parse — Gemini with responseMimeType should return clean JSON,
    // but strip markdown fences just in case
    let parsed;
    try {
      const cleaned = rawText.replace(/^```json?\s*\n?/i, "").replace(/\n?```\s*$/i, "").trim();
      parsed = JSON.parse(cleaned);
    } catch (parseErr) {
      console.error("JSON parse error:", parseErr, "Raw:", rawText);
      return new Response(JSON.stringify({ error: "Failed to parse AI response" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate and normalize the response to match ScanResult shape
    const scanResult = {
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
