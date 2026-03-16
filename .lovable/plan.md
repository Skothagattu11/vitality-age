

# Fix: Cross-Legged Sit — Sync Animation with Description

## What's Wrong

The cross-legged animation currently draws both legs going **outward** from the hips (left leg to x=50, right leg to x=150). This looks like a wide-legged or butterfly sit, not a cross-legged position. The legs never actually cross each other.

Meanwhile, the description correctly says "Sit on the floor with legs crossed" and the test measures hip mobility for cross-legged sitting.

## What "Cross-Legged Sit" Actually Is

This is the classic "criss-cross applesauce" position — sitting on the floor with each shin crossing in front of the other, ankles tucked under opposite knees. Back straight, hands on knees. It tests hip internal rotation and adductor flexibility.

## The Fix

### 1. Redraw the Cross-Legged Animation (AnimationPlaceholder.tsx)

Replace the `CrossLeggedAnimation` SVG with legs that **actually cross**:
- Left thigh goes from hip toward the right, left shin tucks under the right knee
- Right thigh goes from hip toward the left, right shin sits on top of the left
- Feet are tucked near opposite hips (not splayed outward)
- Keep the subtle breathing motion (gentle y-axis bob)
- Keep the spine alignment indicator

### 2. Refine the Tutorial Description (CrossLeggedStep.tsx)

Update the description and steps to be clearer:
- Description: "Sit on the floor with your legs crossed — one shin in front of the other, ankles tucked under opposite knees."
- Step 1: "Sit on the floor and cross your legs (one shin in front of the other)"
- Step 2: "Keep your back straight — avoid slouching"  
- Step 3: "Hold for a few seconds and notice any tightness in your hips"

### 3. Update the "How it works" text

Refine the measure description to be more specific:
- Measure: "Hip internal rotation and adductor flexibility — your ability to sit comfortably with legs crossed on the floor."

### 4. Update the animation label

Change the label under the animation from "Sit with straight spine" to "Cross legs, sit tall with straight spine"

## Files to Change

| File | Change |
|---|---|
| `src/components/AnimationPlaceholder.tsx` | Redraw the `CrossLeggedAnimation` SVG so legs actually cross in front of each other. Update the label text. |
| `src/components/steps/CrossLeggedStep.tsx` | Update tutorial description, steps, and "How it works" measure text for clarity. |

## What Stays the Same

- The 4 answer options (yes-relaxed, yes-stiff, only-briefly, not-at-all) — these are correct
- The scoring logic — unchanged
- The type definitions — unchanged
- All other animations — unchanged

