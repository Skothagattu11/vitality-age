# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Entropy Age (Vitality Age) is a functional biological age assessment web app. Users complete 5 physical tests (sit-to-stand, wall sit, balance, march recovery, mobility) and receive a "functional age" estimate compared to their chronological age. Data stays local in localStorage.

## Commands

```bash
npm install          # Install dependencies
npm run dev          # Start dev server on port 8080
npm run build        # Production build
npm run lint         # ESLint
npm run test         # Run tests (vitest)
npm run test:watch   # Tests in watch mode
npm run preview      # Preview production build
```

## Architecture

### Tech Stack
- **Framework**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS with shadcn/ui components
- **State**: React hooks + localStorage persistence
- **Animations**: Framer Motion
- **Charts**: Recharts
- **Data fetching**: TanStack Query (available but not used - app is client-only)

### Application Flow

The app is a single-page multi-step wizard:

```
Step 0: LandingPage       → Introduction
Step 1: SetupPage         → User profile (age, fitness level, injuries)
Steps 2-7: Test Steps     → Physical assessments with timers
Step 8: IntegrationStep   → Energy/coordination self-assessment
Step 9: RecoveryContextStep → Recovery habits
Step 10: ResultsPage      → Calculated functional age + drivers
```

### Core Files

| File | Purpose |
|------|---------|
| `src/components/Assessment.tsx` | Main wizard controller, step rendering, state management |
| `src/hooks/useAssessment.ts` | Assessment state hook with localStorage persistence |
| `src/types/assessment.ts` | All TypeScript types for assessment data |
| `src/utils/scoring.ts` | Age calculation algorithm with weighted scoring |

### Component Patterns

**Step Components** (`src/components/steps/`):
- Each test step follows the same pattern: `TutorialPanel` (left) + input card (right)
- Props: `onComplete(result)`, `onSkip(skipData)`, `onBack()`
- Uses `StepWrapper` for consistent navigation buttons

**UI Components** (`src/components/ui/`):
- shadcn/ui components, not modified directly
- Add new components via `npx shadcn-ui@latest add <component>`

### State Flow

```
useAssessment hook (localStorage-backed)
    ↓
Assessment.tsx (step controller)
    ↓
Step components call updateData() → triggers localStorage save
    ↓
ResultsPage receives data → calculateResults() from scoring.ts
```

### Scoring Algorithm (`src/utils/scoring.ts`)

Each test contributes an age offset (positive = older, negative = younger):
- Raw performance → age-adjusted benchmarks → offset score
- Skipped tests incur a penalty (+3 years)
- Final functional age = chronological age + total offset (capped 18-100)
- Top 3 drivers calculated by normalized impact

## Design System

**Colors** (defined in `src/index.css`):
- Primary: Electric Cyan `hsl(189 100% 50%)` / `#00BCD4`
- Secondary: Vivid Violet `hsl(262 83% 58%)` / `#7C3AED`
- Uses CSS custom properties for light/dark themes

**Typography**: Inter font via Tailwind config

**Custom Classes** (in `src/index.css`):
- `.gradient-text` - Cyan-to-violet gradient text
- `.glass-card` - Frosted glass effect
- `.glow-card` - Glowing card with shadow
- `.animate-glow-pulse` - Pulsing glow animation

## Path Aliases

`@/*` maps to `./src/*` (configured in `tsconfig.json` and `vite.config.ts`)

## Testing

Tests use Vitest with React Testing Library. Setup in `src/test/setup.ts` includes `matchMedia` mock.

```bash
npm run test              # Single run
npm run test:watch        # Watch mode
```
