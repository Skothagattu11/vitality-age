

# Fix: Eliminate the Blank Flash on Page Load

## The Problem

The static landing page HTML is placed **inside** `<div id="root">`. When React calls `createRoot(root).render(<App />)`, it **wipes everything inside `#root`** and replaces it with React's output. But React takes a moment to initialize, parse components, and render -- during that moment, the screen goes completely blank.

The sequence users see:
1. Browser loads HTML -- static landing page appears (good)
2. JavaScript bundle downloads and executes
3. `createRoot` wipes `#root` content -- **screen goes blank** (bad)
4. React finishes rendering -- landing page reappears (delayed)
5. If user refreshes during step 2-3, they see blank again

## The Fix

Move the static HTML **outside** of `#root` so React never touches it. Then hide the static HTML only **after** React has finished its first render.

### Changes

**1. `index.html` -- Move static content outside `#root`**

- Move the entire `<div id="static-landing">` block to be a **sibling** of `#root`, not a child
- Keep `#root` as an empty div (React's mount point)
- The static landing sits on top visually and is removed once React is ready

Structure becomes:
```
<body>
  <div id="static-landing" class="static-landing">
    <!-- all the static HTML stays exactly as-is -->
  </div>
  <div id="root"></div>
  <!-- scripts -->
</body>
```

**2. `src/main.tsx` -- Remove static HTML after React renders**

After React mounts, remove `#static-landing`:
```typescript
createRoot(document.getElementById("root")!).render(<App />);

// Remove static HTML now that React has rendered
const staticEl = document.getElementById("static-landing");
if (staticEl) staticEl.remove();
```

**3. `index.html` -- Add CSS to layer them correctly**

Add to the inline styles:
```css
#static-landing { position: relative; z-index: 100; }
#root:empty { display: none; }
#root:not(:empty) ~ #static-landing { display: none; }
```

Wait -- since `#static-landing` comes before `#root` in the new layout, the CSS sibling selector won't work backwards. Instead, we handle removal purely in JS (step 2 above), and position them so `#static-landing` covers the screen until removed.

**4. Move `<noscript>` and SEO content blocks outside `#root` too**

These should not be inside React's mount point.

### Files to modify

| File | What changes |
|---|---|
| `index.html` | Move `#static-landing`, `#seo-content`, and `<noscript>` outside of `#root`. Keep `#root` empty. |
| `src/main.tsx` | After `render()`, remove `#static-landing` from DOM. |

### What stays the same
- All the static HTML content (no changes to the landing page markup)
- All inline CSS styles
- All SEO metadata, JSON-LD, OG tags
- All React components (LandingPage, Assessment, etc.)
- The pre-hydration click handler script
- The `window.__userClickedStart` logic in Assessment.tsx

### Expected result
- User types URL -- static landing page appears **instantly** from HTML
- JavaScript loads in background -- static page remains visible the entire time
- React mounts inside the empty `#root` -- no blank flash because static HTML is untouched
- After React renders, the static HTML is removed and React takes over seamlessly
- No more blank screen at any point in the loading sequence
