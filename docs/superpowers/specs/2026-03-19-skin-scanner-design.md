# Skin Scanner — Design Spec

## Overview

A standalone skincare product ingredient analysis tool at `/skin-scanner`. Users scan product labels to get a dual safety + skin-compatibility score, tiered ingredient breakdowns, personalized application instructions, and can build AM/PM skincare routines with conflict detection. Unknown ingredients can be deep-researched on demand via a larger AI model with web grounding.

## Architecture

- **Route:** `/skin-scanner` — independent tool on HubPage, shared auth with Supplement Stacker
- **AI Backend:** Gemini 2.5 Flash for scanning, Gemini Pro + web grounding for unknown ingredient research
- **Edge Functions:** `scan-skincare-label` (main scan), `research-ingredients` (deep research)
- **State:** `useSkinScanner` hook with localStorage (guest) + Supabase `skin_scanner_sessions` table (logged-in)
- **Image Processing:** Reuses existing `compressImage` utility (max 1024px, JPEG 0.8)

### Data Flow

```
User scans product
  → Image compressed (existing util)
  → Edge Function: scan-skincare-label
  → Gemini Flash analyzes with skin profile context
  → Returns: tiered ingredients, dual score, application instructions, unknown ingredients list
  → User views results, optionally saves to AM/PM routine
  → If unknowns exist: user taps "Research these?"
      → Edge Function: research-ingredients
      → Gemini Pro + web grounding
      → Returns detailed research per ingredient
      → Scores recalculate, unknowns reclassified into tiers
```

## Feature 1: Skin Profile Onboarding

### Questions (5-6, all skippable with "I'm not sure" option)

1. **Skin Type** — Oily / Dry / Combination / Normal / "I'm not sure"
   - Tooltip example: "Oily: Your face feels shiny by midday, especially T-zone. Dry: Skin feels tight after washing, may flake."

2. **Sensitivity Level** — Reacts easily / Sometimes sensitive / Pretty resilient / "I'm not sure"
   - Tooltip example: "Reacts easily: New products often cause redness, stinging, or breakouts within a day."

3. **Top Concerns** (pick up to 3) — Acne & breakouts, Aging & wrinkles, Dark spots & hyperpigmentation, Redness & rosacea, Texture & pores, Dullness, Dryness & flaking
   - Tooltip example: "Texture & pores: Skin feels bumpy or rough, visible enlarged pores, uneven surface."

4. **Known Allergies or Irritants** (optional, multi-select + custom) — Fragrance, Retinol/Retinoids, AHA/BHA acids, Essential oils, Sulfates, None that I know of, Other (free text)
   - Tooltip example: "Not sure? If a product has ever caused burning, rash, or swelling — try to recall what it contained."

5. **Age Range** — Under 20, 20s, 30s, 40s, 50+, Prefer not to say
   - Tooltip example: "This helps tailor active ingredient recommendations — retinol is more relevant for 30+, gentler actives for younger skin."

6. **Current Routine Complexity** — I barely wash my face / Basic cleanser + moisturizer / Multi-step routine / Skincare enthusiast
   - Tooltip example: "This calibrates how detailed application instructions will be. Beginners get simpler steps."

### UX

- Card-per-question layout (same as supplement stacker onboarding)
- Progress dots at top
- "Skip" link on every question
- Each question has an interactive tooltip/info icon that shows examples to help users evaluate their own skin
- Editable from profile/settings screen
- Unanswered questions → AI gives generic scoring for that dimension + note "Complete your profile for personalized scoring"

## Feature 2: Product Scanner

### Dual Scoring System

- **Safety Score (1-10)** — EWG-style hazard rating
  - 1-2: Clean / safe
  - 3-4: Low concern
  - 5-6: Moderate concern
  - 7-8: High concern
  - 9-10: Avoid
  - Based on: ingredient safety data, irritant potential, comedogenicity, allergen status, regulatory flags

- **Compatibility Score (0-100)** — Personalized to skin profile
  - How well this product matches the user's skin type, concerns, and sensitivities
  - Unanswered profile questions reduce confidence, shown as "~75" with note
  - Start at 50, adjust up for beneficial ingredients, down for contraindicated ones

### Scan Results Layout (top to bottom)

1. **Product Header** — product name, brand, dual score displayed side by side
2. **Verdict** — one-line contextual summary (e.g., "Great match for oily, acne-prone skin" or "Contains 2 ingredients that may irritate sensitive skin")
3. **Application Instructions** — personalized based on skin profile and routine complexity:
   - When to apply (AM / PM / both)
   - Position in routine order (e.g., "After cleanser, before moisturizer")
   - Amount to use
   - Wait times if applicable ("Wait 15 min before layering")
   - Skin-profile-specific tips
4. **Ingredient Tiers** (collapsible sections):
   - **Hero Actives** — primary active ingredients with dose/concentration context
   - **Supporting Ingredients** — humectants, antioxidants, skin-conditioning agents
   - **Base/Fillers** — neutral carriers, emulsifiers, preservatives
   - **Watch Out** — flagged for user's skin profile (comedogenic, irritants, allergens)
5. **Unknown Ingredients** (if any) — see Feature 4
6. **Actions** — "Add to AM Routine" / "Add to PM Routine" / "Scan Another"

### Ingredient Row

Each ingredient displays:
- Name
- Purpose tag (e.g., "Exfoliant", "Humectant", "Preservative")
- Safety dot: `"good"` (green), `"moderate"` (yellow), `"bad"` (red) — same enum across all tiers
- Compatibility indicator: `"beneficial"` | `"neutral"` | `"caution"` | `"avoid"` — relative to skin profile
- Expandable detail with full explanation

### TypeScript Types

```typescript
// Shared ingredient shape — all four tiers use this same structure
interface IngredientEntry {
  name: string;
  purpose: string;                                    // e.g., "Exfoliant", "Humectant"
  safety: 'good' | 'moderate' | 'bad';               // maps to green/yellow/red dot
  compatibility: 'beneficial' | 'neutral' | 'caution' | 'avoid';
  detail: string;                                     // full explanation
  dose: string | null;                                // concentration if detectable, null for base/fillers
  flagReason: string | null;                          // only for watchOut tier — why it's flagged
}

interface ApplicationInstructions {
  timeOfDay: 'AM' | 'PM' | 'both';
  routineStep: string;                                // e.g., "After cleanser, before moisturizer"
  routineCategory: 'cleanser' | 'toner' | 'serum' | 'treatment' | 'eyeCream' | 'moisturizer' | 'spf';
  amount: string;
  waitTime: string | null;
  tips: string[];
}

interface SkinScanResult {
  productName: string;
  brand: string | null;
  safetyScore: number;                                // 1-10 (EWG-style)
  compatibilityScore: number;                         // 0-100 (personalized)
  compatibilityConfidence: 'full' | 'partial' | 'generic'; // based on profile completeness
  verdict: string;
  applicationInstructions: ApplicationInstructions;
  ingredients: {
    heroActives: IngredientEntry[];
    supporting: IngredientEntry[];
    baseFiller: IngredientEntry[];
    watchOut: IngredientEntry[];
  };
  unknownIngredients: { name: string; rawText: string }[];
  detectedType: 'skincare' | 'cosmetic' | 'unknown';
  scannedAt: number;                                  // Date.now() timestamp
}

interface RoutineProduct {
  id: string;                                         // unique ID for this routine entry
  scanResult: SkinScanResult;                         // full scan data
  routineCategory: ApplicationInstructions['routineCategory'];
  sortOrder: number;                                  // position in routine
  addedAt: number;
}

interface ResearchedIngredient {
  name: string;
  chemicalClass: string;
  origin: 'synthetic' | 'natural' | 'bioidentical';
  functionInProduct: string;
  safetyProfile: string;
  regulatoryStatus: string;                           // e.g., "EU approved", "FDA GRAS"
  skinTypeRelevance: string;                          // personalized note
  sources: { title: string; url: string }[];
  researchedAt: number;
  // Reclassified values after research
  safety: IngredientEntry['safety'];
  compatibility: IngredientEntry['compatibility'];
  tier: 'heroActives' | 'supporting' | 'baseFiller' | 'watchOut';
}
```

### Edge Function: `scan-skincare-label`

- Accepts: image (FormData), skin profile JSON
- Gemini Flash prompt includes skin profile context for personalized scoring
- Returns structured JSON matching `SkinScanResult` type
- `compatibilityConfidence` reflects how many profile questions were answered: all = `"full"`, some = `"partial"`, none = `"generic"`

### Error & Loading States

**Scanning:**
- Loading: pulsing scan icon animation (same pattern as supplement scanner) with rotating messages: "Reading ingredients...", "Analyzing safety profiles...", "Matching to your skin..."
- Not a product label: if `detectedType === "unknown"`, show "This doesn't look like a skincare product. Try photographing the ingredient list on the back of the product."
- API timeout (>30s): "Analysis is taking longer than expected. Try again with a clearer photo."
- Gemini returns malformed JSON: "Couldn't process this label. Try a different angle or better lighting."
- Generic error: "Something went wrong. Please try again."
- All errors show a "Try Again" button that resets to upload state

**Rate Limiting:**
- Main scan: 20 scans per day (free tier) — generous enough for normal use
- Research: 3 research requests per day (free tier)
- When limit reached: "You've reached today's scan limit. Limits reset at midnight."

## Feature 3: Skincare Routine Builder

### Structure

- **AM Routine** and **PM Routine** as two tabs/sections
- Products displayed in recommended application order:
  1. Cleanser
  2. Toner
  3. Serum / Treatment
  4. Eye cream
  5. Moisturizer
  6. SPF (AM only)
- AI assigns product to correct step based on ingredients and product type when added

### Multiple Products Per Step

Users can have multiple products in the same category (e.g., two serums). They display in order within that category. AI suggests if a category is getting crowded ("You have 3 serums in your PM routine — consider simplifying").

### Conflict Detection

Conflicts are checked **within** each routine (AM or PM) independently. Cross-routine conflicts (e.g., retinol PM + AHA AM) are not flagged since they're applied hours apart.

Inline warnings (not blockers) when adding products:

| Conflict | Warning |
|----------|---------|
| Retinol + AHA/BHA same routine | "Can cause irritation — use on alternate nights" |
| Vitamin C + Niacinamide (high conc.) | "May reduce effectiveness — apply 10 min apart" |
| Multiple exfoliants | "Over-exfoliation risk" |
| No SPF in AM + sun-sensitizing actives | "Your AM routine has actives that increase sun sensitivity — add an SPF" |
| Duplicate active categories | "You already have a retinoid in this routine" |

Conflicts are rechecked dynamically — removing a product clears its associated warnings.

### Routine Product Card

- Step number + product name
- Mini dual score badges
- Application instruction summary (time, amount)
- Tap to expand for full ingredient breakdown
- Delete/remove button

## Feature 4: Unknown Ingredients Deep Research

### Trigger

After scan results, if Gemini flags ingredients with low confidence, they appear in an "Unknown Ingredients" section.

### Flow

1. User taps "Research these ingredients" button
2. Loading state: "Researching X ingredients... This may take a moment"
3. Edge function `research-ingredients` calls Gemini Pro with web grounding
4. Per-ingredient return:
   - **What it is** — chemical class, origin (synthetic / natural / bioidentical)
   - **What it does** — function in this specific product formulation
   - **Safety profile** — studies, regulatory status (EU banned? FDA approved?)
   - **Skin-type relevance** — interaction with user's skin profile
   - **Sources** — links to studies/databases
5. Results replace unknown list inline — ingredients reclassified into proper tier with "Researched" badge
6. Dual scores recalculate with new data

### Score Recalculation

After research completes, a **client-side recalculation** is performed — not another API call. The edge function returns `safety`, `compatibility`, and `tier` for each researched ingredient. The client reclassifies those ingredients into the correct tiers and recomputes the dual scores using simple weighted averages (safety score = average of all ingredient safety values mapped to 1-10; compatibility = weighted by ingredient importance to skin profile). This avoids an extra API call while keeping scores accurate.

### Cost Management

- Separate edge function: `research-ingredients`
- Rate limit: 3 research requests per day (free tier)
- Results cached in `researchCache` state keyed by **lowercase trimmed ingredient name** — reused if same ingredients appear in future scans
- Cached research shared: if ingredient was previously researched, serve cached result immediately

## Feature 5: State & Persistence

### Hook: `useSkinScanner`

Mirrors `useSupplementStacker` pattern.

```typescript
interface SkinScannerState {
  skinProfile: {
    skinType: string | null;
    sensitivity: string | null;
    concerns: string[];
    allergies: string[];
    ageRange: string | null;
    routineComplexity: string | null;
    onboardingComplete: boolean;
  };
  scanHistory: SkinScanResult[];          // capped at 50 most recent, oldest pruned on save
  amRoutine: RoutineProduct[];
  pmRoutine: RoutineProduct[];
  researchCache: Record<string, ResearchedIngredient>;  // key = lowercase trimmed ingredient name
  hasAccount: boolean;
  currentScreen: 'home' | 'routine' | 'profile';
}
```

**Scan history cap:** Max 50 entries. When a new scan is added and history exceeds 50, the oldest entry is removed. This keeps localStorage under ~2MB for this tool.

### Persistence

- **Guest mode:** localStorage key `skin-scanner-state`
- **Logged-in:** Supabase table `skin_scanner_sessions` with JSONB columns:
  - `skin_profile`
  - `scan_history`
  - `am_routine`
  - `pm_routine`
  - `research_cache`
- Same `isLoggingOut` flag pattern to prevent race conditions during logout
- Debounced save (1s) on state change for logged-in users

### Supabase Table: `skin_scanner_sessions`

```sql
CREATE TABLE public.skin_scanner_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,  -- set on login, null for guests
  session_id TEXT,                                            -- random ID for guest sessions, null for logged-in
  skin_profile JSONB NOT NULL DEFAULT '{}',
  scan_history JSONB NOT NULL DEFAULT '[]',
  am_routine JSONB NOT NULL DEFAULT '[]',
  pm_routine JSONB NOT NULL DEFAULT '[]',
  research_cache JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id),
  UNIQUE(session_id)
);
```

**Guest-to-account migration:** When a guest user signs up/logs in, the existing `session_id` row is claimed by setting its `user_id` and clearing `session_id`. Same pattern as supplement stacker's `claimSession()`. LocalStorage data is merged into the Supabase row (remote wins on conflict).

## HubPage Integration

- New card on HubPage with title "Skin Scanner"
- Route: `/skin-scanner`
- Card description: "Scan skincare ingredients, get personalized scores"
- Own page wrapper: `SkinScannerPage.tsx`

## File Structure

```
src/
├── components/skin-scanner/
│   ├── SkinScannerApp.tsx          # Main app shell (mirrors SupplementStackerApp)
│   ├── BottomNav.tsx               # Home / Routine / Profile nav
│   ├── ScanFAB.tsx                 # Floating scan button
│   ├── ThemeToggle.tsx             # Reuse from supplement stacker
│   ├── onboarding/
│   │   ├── SkinProfileWizard.tsx   # Card-per-question onboarding
│   │   └── QuestionCard.tsx        # Reusable question card with tooltip
│   ├── scanner/
│   │   ├── ScanSheet.tsx           # Bottom sheet for scanning
│   │   ├── ImageUpload.tsx         # Reuse from supplement stacker
│   │   └── ScanResults.tsx         # Dual score + tiered ingredients
│   ├── routine/
│   │   ├── RoutineView.tsx         # AM/PM tabs with ordered products
│   │   ├── RoutineProductCard.tsx  # Individual product in routine
│   │   └── ConflictWarning.tsx     # Inline conflict alerts
│   ├── research/
│   │   └── UnknownIngredients.tsx  # Unknown list + research trigger
│   └── screens/
│       ├── HomeScreen.tsx          # Recent scans, quick actions
│       ├── RoutineScreen.tsx       # Full routine view
│       └── ProfileScreen.tsx       # Skin profile editor, settings
├── hooks/
│   └── useSkinScanner.ts           # Main state hook
├── services/
│   └── skinScanService.ts          # API calls to edge functions
├── types/
│   └── skinScanner.ts              # TypeScript types
└── utils/
    └── skinScannerSync.ts          # Supabase sync (mirrors stackerSync)

supabase/functions/
├── scan-skincare-label/
│   └── index.ts                    # Gemini Flash scan
└── research-ingredients/
    └── index.ts                    # Gemini Pro + web grounding

supabase/migrations/
└── 2026XXXX_create_skin_scanner_sessions.sql
```

## Empty States

- **Home Screen (no scans):** "Scan your first skincare product to see how it matches your skin" with a large scan button
- **Routine Screen (empty):** "Your skincare routine is empty. Scan a product and add it to your AM or PM routine." with illustration
- **Scan History (empty):** Hidden section — only shows when there's at least 1 scan
- **Profile (incomplete):** "Complete your skin profile for personalized scores" with progress indicator showing X/6 answered

## Design System

Reuses the supplement stacker CSS custom properties (`--ss-*` variables) for consistent look. Same dark/light theme toggle. Same glassmorphism card patterns, bottom sheet animations, and toast notifications.

## Out of Scope (v1)

- Skin assessment via selfie (Feature B — planned for v2)
- Product purchase recommendations / affiliate links
- Community features / product reviews
- Barcode scanning (label photo only for v1)
- Cross-tool integration (supplement + skincare combined view)
