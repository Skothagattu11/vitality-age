# Video Generation Specifications for Entropy Age Tutorials

Use these prompts with AI video generation tools (Runway, Pika, Kling, etc.) to create tutorial animations.

## Technical Specifications

| Property | Value |
|----------|-------|
| **Resolution** | 720x540 (4:3) or 854x480 (16:9) |
| **Duration** | 3-4 seconds (will loop) |
| **Format** | MP4 (H.264) |
| **Frame Rate** | 24-30 fps |
| **Background** | Solid light gray (#F5F5F5) or soft gradient |
| **Style** | Minimalist human silhouette, dark gray/black figure |
| **File Size Target** | Under 500KB each |

## Output Files

Place all generated videos in: `public/videos/`

```
public/
└── videos/
    ├── sit-to-stand.mp4
    ├── wall-sit.mp4
    ├── balance.mp4
    ├── march.mp4
    ├── overhead-reach.mp4
    └── cross-legged.mp4
```

---

## 1. Sit-to-Stand Test

**Filename:** `sit-to-stand.mp4`

**Prompt:**
```
Minimalist dark silhouette of a person performing a sit-to-stand exercise. Side profile view. Person starts seated on a simple chair with arms crossed over chest, stands up fully straight, then sits back down smoothly. Clean light gray background. Smooth looping animation. Fitness tutorial style. No face details, simple human form.
```

**Key Frames:**
1. Seated position - arms crossed on chest, back straight
2. Transitioning up - leaning forward slightly
3. Standing fully upright - arms still crossed
4. Lowering back down
5. Return to seated (seamless loop back to frame 1)

**Camera:** Side profile (90°), static, full body visible with chair

**Timing:** ~1.5s up, ~1.5s down

---

## 2. Wall Sit

**Filename:** `wall-sit.mp4`

**Prompt:**
```
Minimalist dark silhouette of a person in wall sit position. Side profile view. Person has back flat against wall, thighs parallel to ground at 90 degrees, arms relaxed at sides. Subtle breathing movement - slight chest rise and fall. Clean light gray background. Simple human form silhouette. Fitness tutorial demonstration.
```

**Key Frames:**
1. Static wall sit position held throughout
2. Subtle breathing motion (chest rises slightly)
3. Optional: slight muscle tension indication

**Camera:** Side profile (90°), static, showing wall and floor clearly

**Timing:** Continuous hold with subtle 2-second breathing cycle

**Important:** Emphasize the 90° angle at knees, thighs parallel to floor

---

## 3. Single-Leg Balance

**Filename:** `balance.mp4`

**Prompt:**
```
Minimalist dark silhouette of a person balancing on one leg. Front-facing view. Person stands on left leg with right leg lifted and bent at knee, arms extended horizontally to sides for balance. Subtle natural wobble/sway motion. Clean light gray background. Simple human form. Fitness balance test demonstration.
```

**Key Frames:**
1. Balanced position - one leg up, arms out
2. Subtle sway left
3. Return to center
4. Subtle sway right
5. Return to center (loop)

**Camera:** Front view, slight low angle, full body visible

**Timing:** Gentle 3-4 second sway cycle

**Important:** Show the lifted leg clearly bent, arms horizontal for balance

---

## 4. March in Place (High Knees)

**Filename:** `march.mp4`

**Prompt:**
```
Minimalist dark silhouette of a person marching in place with high knees. Front-facing view slightly angled. Person alternates lifting knees to hip height with opposite arm swing. Energetic but controlled movement. Clean light gray background. Simple human form silhouette. Fitness cardio exercise demonstration.
```

**Key Frames:**
1. Left knee up at hip height, right arm forward
2. Transition down
3. Right knee up at hip height, left arm forward
4. Transition down (loop)

**Camera:** Front view with slight 3/4 angle, full body, static

**Timing:** ~0.6-0.8 seconds per step (moderate pace, not too fast)

**Important:** Knees should reach hip height, show arm swing coordination

---

## 5. Overhead Reach (Wall)

**Filename:** `overhead-reach.mp4`

**Prompt:**
```
Minimalist dark silhouette of a person doing overhead arm reach against a wall. Side profile view. Person stands with back and head against wall, then raises both arms overhead trying to touch the wall behind them while keeping back flat. Clean light gray background with simple wall indication. Fitness mobility stretch demonstration.
```

**Key Frames:**
1. Standing against wall, arms at sides, back flat
2. Arms raising upward along the wall
3. Arms fully extended overhead, touching or reaching toward wall
4. Arms lowering back down
5. Return to start (loop)

**Camera:** Side profile (90°), static, showing wall contact clearly

**Timing:** ~2s arms up, hold 0.5s, ~1.5s arms down

**Important:** Back must stay flat against wall throughout, show the reaching motion clearly

---

## 6. Cross-Legged Sit (Floor)

**Filename:** `cross-legged.mp4`

**Prompt:**
```
Minimalist dark silhouette of a person sitting cross-legged on the floor in meditation pose. Front-facing view slightly from above. Person sits with straight spine, legs crossed, hands resting on knees. Subtle breathing movement - gentle rise and fall of chest/shoulders. Clean light gray background. Simple human form. Yoga seated position demonstration.
```

**Key Frames:**
1. Seated cross-legged, spine straight, hands on knees
2. Subtle inhale - slight chest/shoulder rise
3. Subtle exhale - return to neutral
4. Continuous gentle breathing cycle

**Camera:** Front view, slightly elevated angle (15-20° from above), showing full seated pose

**Timing:** 3-4 second breathing cycle, very subtle movement

**Important:** Emphasize straight spine, relaxed but proper posture

---

## Style Guidelines

### DO:
- Keep figures as simple silhouettes (no facial features)
- Use smooth, fluid movements
- Ensure seamless looping (end frame matches start frame)
- Maintain consistent figure size across all videos
- Keep backgrounds clean and minimal

### DON'T:
- Add text or labels (we handle that in the UI)
- Use complex backgrounds or environments
- Make movements too fast or jerky
- Include multiple people
- Add sound/audio (videos will be muted)

---

## Color Palette (if not using pure silhouette)

| Element | Color |
|---------|-------|
| Background | `#F5F5F5` (light gray) or `#FAFAFA` |
| Figure | `#374151` (dark gray) or `#1F2937` |
| Accent (optional) | `#00BCD4` (brand cyan) for indicators |
| Props (chair/wall) | `#E5E7EB` (medium gray) |

---

## Testing Checklist

After generating, verify each video:

- [ ] Loops seamlessly without jump/glitch
- [ ] Figure is clearly visible and centered
- [ ] Movement is smooth (no jitter)
- [ ] File size is under 500KB
- [ ] Aspect ratio is correct
- [ ] Exercise form is accurate to the test requirements

---

## Alternative: Lottie Animations

If you prefer vector animations, you can also generate Lottie JSON files using tools like:
- LottieFiles (lottiefiles.com)
- Jitter
- After Effects with Bodymovin

Place them in `public/animations/` with `.json` extension and let me know - the component supports both formats.
