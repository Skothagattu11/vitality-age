

# Performance Optimization Plan: Instant Landing Page Load

## The Core Problem

Right now, when a user visits your app, they see a **loading screen** (the `#initial-loader` with "Loading your assessment..." text, animated spinner, and fun facts) while React and all JavaScript bundles download, parse, and execute. Only after React fully mounts does the actual landing page appear. This creates a noticeable delay, especially on mobile or slower connections.

## Root Causes Identified

1. **The static HTML shows a "loading" screen, not the actual landing page.** The `index.html` contains a branded loader with a spinner and "Loading your assessment..." text instead of the real landing page UI. Users see a loading state when they should see the app.

2. **Lazy loading the Index page adds an extra round-trip.** `App.tsx` uses `lazy(() => import("./pages/Index"))`, meaning React loads, then fetches the Index chunk, then renders -- two sequential waits instead of one.

3. **CSS is not available until JavaScript processes it.** The full Tailwind CSS is bundled inside JS. The critical inline styles in `index.html` don't match the actual landing page design, so there's a visual "flash" when React takes over.

4. **Heavy dependencies block interactivity.** `framer-motion` is imported in `SetupPage.tsx` at the top level (not dynamically), and multiple Radix UI components are eagerly loaded even though they're only needed on step 2+.

5. **Console warning: Tailwind CDN in production.** There's a `cdn.tailwindcss.com` script being loaded somewhere, which adds unnecessary weight and generates warnings.

## The Strategy: Show the Real App Instantly

Instead of showing a loading screen, **render the actual landing page as static HTML** in `index.html` so users see the real UI before any JavaScript loads. Then React silently "hydrates" over it.

### Step-by-step changes:

### 1. Replace the loader with the actual landing page HTML

Replace the entire `#initial-loader` content in `index.html` with a static version of the real `LandingPage` component -- the star icon, "Entropy Age" title, "Functional Biological Age (No Bloodwork)" subtitle, description text, "Start Assessment" button, feature badges, and footer. Style it with inline CSS that matches your Tailwind design tokens.

This means users see the **finished landing page** the instant the HTML arrives -- zero wait.

### 2. Make the static "Start Assessment" button work before React loads

Add a small inline script that attaches a click handler to the static button. When clicked, it sets `window.__userClickedStart = true` (which your code already checks) and shows a brief transition state. When React mounts, it picks up this flag and navigates to step 1.

### 3. Stop lazy-loading the Index/Landing page

Change `App.tsx` to directly import `Index` instead of using `lazy()`. The landing page is the critical path -- it should be in the main bundle, not a separate chunk. Keep lazy loading for `NotFound` and everything else.

### 4. Simplify the React mount transition

Instead of a fade-out animation on the loader, React simply replaces the static HTML instantly (it already does this). Remove the `removeInitialLoader` logic and the opacity transition -- they add unnecessary delay.

### 5. Remove the Tailwind CDN script

Find and remove any reference to `cdn.tailwindcss.com` that's causing the console warning and adding load time.

### 6. Optimize font loading

Add `<link rel="preload">` for the Inter font (referenced in Tailwind config) or switch to system fonts to eliminate the font-loading delay.

## Technical Details

### Files to modify:

| File | Change |
|---|---|
| `index.html` | Replace `#initial-loader` with static landing page HTML matching `LandingPage.tsx` design. Add click handler for CTA button. Remove fun-facts script. |
| `src/App.tsx` | Direct import `Index` instead of `lazy()`. Remove `removeInitialLoader()`, `PageLoader`, and `ContentReady` wrapper complexity. Keep lazy loading for `NotFound` only. |
| `src/main.tsx` | Simplify to standard React mount (remove loader transition logic). |
| `src/components/LandingPage.tsx` | No changes needed -- React will render over the static HTML seamlessly. |

### What stays the same:
- All lazy loading for assessment steps (2-10) stays as-is -- those are correctly deferred
- Predictive prefetching in `Assessment.tsx` stays
- All SEO metadata, JSON-LD, OG tags stay
- The Vite chunk splitting config stays

### Expected Result

- **First Contentful Paint**: Near-instant (just HTML + inline CSS)
- **Time to Interactive**: As soon as JS loads (button works even before React)
- **No loading screen**: Users see the actual app immediately
- **No layout shift**: Static HTML matches React output exactly

