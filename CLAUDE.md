# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Entropy Age (Vitality Age) is a functional biological age assessment web app. Users complete 5 physical tests (sit-to-stand, wall sit, balance, march recovery, mobility) and receive a "functional age" estimate compared to their chronological age. 100% client-side — data stays in localStorage, no backend or auth.

## Commands

```bash
npm install          # Install dependencies
npm run dev          # Start dev server on port 8080
npm run build        # Production build
npm run build:dev    # Dev build with sourcemaps
npm run lint         # ESLint
npm run test         # Run tests (vitest)
npm run test:watch   # Tests in watch mode
npx vitest run src/path/to/file.test.ts  # Run a single test file
npm run preview      # Preview production build
```

## Architecture

### Tech Stack
- **Framework**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS with shadcn/ui components
- **State**: React hooks + localStorage persistence
- **Animations**: Framer Motion + custom SVG stick-figure animations
- **Charts**: Recharts (results page only)
- **Analytics**: Vercel Analytics (page view tracking)

Note: `@supabase/supabase-js` and `@tanstack/react-query` are installed but unused — the app is fully client-side.

### TypeScript Config

`strictNullChecks` and `noImplicitAny` are **disabled** in `tsconfig.json`. Code does not guard against null/undefined pervasively.

### Application Flow

Single-page multi-step wizard controlled by `Assessment.tsx`:

```
Step 0:  LandingPage          → Introduction (static HTML, no React deps)
Step 1:  SetupPage            → User profile (age, fitness level, injuries)
Step 2:  SitToStandStep       → 30-second chair stand test
Step 3:  WallSitStep          → Wall sit hold test
Step 4:  BalanceStep          → Single-leg balance test
Step 5:  MarchRecoveryStep    → High-knee march + recovery
Step 6:  OverheadReachStep    → Overhead mobility test
Step 7:  CrossLeggedStep      → Floor sit mobility test
Step 8:  IntegrationStep      → Energy/coordination self-assessment
Step 9:  RecoveryContextStep  → Recovery habits questionnaire
Step 10: ResultsPage          → Calculated functional age + drivers + charts
```

### Core Files

| File | Purpose |
|------|---------|
| `src/components/Assessment.tsx` | Main wizard controller, lazy loading orchestrator, step routing |
| `src/hooks/useAssessment.ts` | Assessment state hook with localStorage persistence (`entropy-age-assessment` key) |
| `src/types/assessment.ts` | All TypeScript types for assessment data and results |
| `src/utils/scoring.ts` | Age calculation algorithm with weighted scoring per test |
| `src/components/animations/ExerciseAnimations.tsx` | 6 SVG+Framer Motion stick-figure exercise animations |

### Lazy Loading & Prefetch Strategy

All step components and heavy libraries are lazy-loaded via `React.lazy()` in `Assessment.tsx`. Components are prefetched ahead of when they're needed:

```
Step 0 (Landing)    → prefetch SetupPage + framer-motion (500ms delay)
Step 1 (Setup)      → prefetch first 3 test steps (1s delay)
Step 3 (WallSit)    → prefetch remaining test steps (500ms delay)
Step 7 (CrossLegged)→ prefetch ResultsPage + html2canvas (500ms delay)
```

The landing page is static HTML that renders before React hydrates. It checks `window.__userClickedStart` for early clicks and removes static content after hydration.

### Component Patterns

**Step Components** (`src/components/steps/`):
- Each test step follows the same layout: `TutorialPanel` (left/collapsible on mobile) + input card (right)
- Props: `onComplete(result)`, `onSkip(skipData)`, `onBack()`
- Uses `StepWrapper` for consistent Back/Skip/Next navigation
- To add a new step: copy an existing step (e.g., `BalanceStep.tsx`), update the logic, add its type to `assessment.ts`, add scoring in `scoring.ts`, and wire it into `Assessment.tsx`

**UI Components** (`src/components/ui/`):
- shadcn/ui components — do not modify directly
- Add new ones via `npx shadcn-ui@latest add <component>`

### State Flow

```
useAssessment hook (localStorage key: 'entropy-age-assessment')
    ↓
Assessment.tsx (step controller)
    ↓
Step components call updateData(key, value) → auto-saves to localStorage
    ↓
ResultsPage receives data → calculateResults() from scoring.ts
```

Users can refresh and resume where they left off. `reset()` clears all data.

### Scoring Algorithm (`src/utils/scoring.ts`)

Each test contributes an age offset (positive = older, negative = younger):
- Raw performance → age-adjusted benchmarks → offset score
- Skipped tests incur a penalty (+3 years)
- Fitness level adjustment: beginner +2, intermediate 0, advanced -2
- Final functional age = chronological age + total offset (capped 18-100)
- Top 3 drivers calculated by normalized impact (score / maxPossible), each with a suggestion

## Design System

**Colors** (CSS custom properties in `src/index.css`):
- Primary: Electric Cyan `hsl(189 100% 50%)` / `#00BCD4`
- Secondary: Vivid Violet `hsl(262 83% 58%)` / `#7C3AED`
- Full HSL variable system supports light/dark themes

**Typography**: Inter font via Tailwind config

**Custom Classes** (in `src/index.css`):
- `.gradient-text` — Cyan-to-violet gradient text
- `.glass-card` — Frosted glass effect with backdrop-blur
- `.glow-card` — Card with glowing cyan shadow
- `.animate-glow-pulse` — Pulsing glow animation
- `.animate-fade-in-up` — Fade in with upward slide

**Custom Shadows**: `--shadow-soft`, `--shadow-medium`, `--shadow-glow`, `--shadow-glow-violet`

## Path Aliases

`@/*` maps to `./src/*` (configured in `tsconfig.json` and `vite.config.ts`)

## Testing

Tests use Vitest with React Testing Library. Setup in `src/test/setup.ts` includes `matchMedia` mock.

```bash
npm run test                              # All tests
npm run test:watch                        # Watch mode
npx vitest run src/path/to/file.test.ts   # Single file
```

Note: Test coverage is minimal — primarily `src/test/example.test.ts`. The scoring algorithm in `scoring.ts` has no tests.

## Build & Chunks

Vite is configured with manual chunk splitting in `vite.config.ts`:
- `react-core`: React/ReactDOM (critical path)
- `framer`: Framer Motion (lazy loaded)
- `charts`: Recharts + D3 (results page only)
- `canvas`: html2canvas (screenshot export)
- `radix`: All Radix UI components
