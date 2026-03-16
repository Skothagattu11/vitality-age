

## Plan

Two things need to happen:

### 1. Fix HubPage.tsx build errors
The `ease` property `[0.25, 0.46, 0.45, 0.94]` (a cubic bezier array) needs to be cast properly for framer-motion's TypeScript types. The fix is to assert the arrays `as [number, number, number, number]` (a tuple) on lines 241 and 250.

### 2. Create/update the scan-label Edge Function
The edge function already exists at `supabase/functions/scan-label/index.ts` with the correct implementation. The only missing piece is registering it in `supabase/config.toml` with `verify_jwt = false` so it deploys properly.

### Changes

| File | Change |
|------|--------|
| `src/components/HubPage.tsx` | Cast `ease` arrays as tuples on lines 241 and 250 |
| `supabase/config.toml` | Add `[functions.scan-label]` with `verify_jwt = false` |

