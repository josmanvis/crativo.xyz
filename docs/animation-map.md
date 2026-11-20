# crativo.xyz — Animation Map (Tier 2)

Confirmed in the Invention Gate. Visual tokens live in [`DESIGN.md`](../DESIGN.md).

## Global

```yaml
tier: 2
easing_language: "fast, light, detented: snaps into place like a tactile switch"
ease_primary:    "cubic-bezier(0.2, 0, 0, 1)"      # hover, press, focus
ease_reveal:     "cubic-bezier(0.16, 1, 0.3, 1)"    # content entering
ease_transition: "cubic-bezier(0.76, 0, 0.24, 1)"   # page shutter
ease_step:       "steps(n)"                         # counters, HUD readouts
scroll_behavior: lenis (smoothWheel only, syncTouch: false — native touch scroll untouched)
page_transitions: ink shutter (clip-path) driven by intercepted internal link clicks
signature_interaction: Status Overlay HUD
reduced_motion: every animation becomes an instant state change; shutter disabled
```

**Signature statement.** When the pointer rests on any project, post or link — or a
section scrolls into focus — the brand's *hidden-state-made-legible* idea shows up in a
fixed monospace HUD strip at the bottom edge. It reports that element's real data
(`P-17 · FLX2 STATUS OVERLAY · SWIFT · 2026`), its characters tick in with stepped
timing, and a vermilion LED marks the live field. On touch devices it reports the
section in focus and scroll position, so nothing depends on hover.

Implementation: `src/components/system/Hud.tsx` + `src/lib/hud.ts`. Any element opts in
with `data-hud="text"`; sections opt in with `data-hud-section="text"`.

## Reveal vocabulary (`src/components/system/MotionDirector.tsx`)

| Attribute | Motion | Purpose |
|---|---|---|
| `data-reveal="rule"` | `scaleX 0→1`, origin left, 0.9s reveal | Hairlines draw like a pen plotter: structure appears before content |
| `data-reveal="mask"` | `clip-path inset(0 0 100% 0) → inset(0)` | Headlines rise out of their rule |
| `data-reveal="up"` | `opacity 0→1`, `y 16→0`, 0.7s reveal | Blocks settle into a detent |
| `data-reveal="count"` | integer ticks `0→n` with `steps()` | Numbers read like a 7-segment display powering up |
| `data-reveal="wordmark"` | wrapper `scaleX 0.58→1` + letters power on with stepped opacity | Condensed type "opens" as the instrument switches on |
| `data-reveal-load` | Run on page load instead of on scroll | Above-the-fold content |

All tweens are `transform`, `opacity` or `clip-path`. Everything lives in one
`gsap.context` per route and is reverted on navigation.

## Pages

| Page | Section | Type | Notes |
|---|---|---|---|
| **Home** | Hero wordmark | load | `wordmark`, then lede `mask`, spec values `count` |
| | Project index | scroll_reveal | Row rules `rule` (batched), monitor panel swaps with a 240ms clip-path wipe |
| | Writing | scroll_reveal | Header `mask`, rows `rule` |
| | Contact strip | static | Hover arrow detent only |
| **Projects** | Header + index | load / scroll | Same index component as home |
| **Project detail** | Title | load | `mask` |
| | Display bezel | scroll_reveal | `clip-path` wipe |
| | Features / metrics | scroll_reveal | Rules draw, metrics `count` |
| **Blog index** | Header | load | `mask` |
| | Post rows | scroll_reveal | `rule` batched |
| **Post** | Header | load | `mask` |
| | Body | static | Prose never animates; HUD shows `§ n/N` + progress |
| **About** | Mode switch | interaction | Two-position switch, thumb translates with `ease_primary` |
| | Timeline / skills | scroll_reveal | `rule`, proficiency meters fill segment-by-segment (`steps`) |
| **Contact** | Form | interaction | Focus LED; on submit the HUD reports `TX … SENT` |
| **404** | Title | load | `mask` |

## Page transition

1. Internal link click (no modifier keys, different pathname) is intercepted.
2. Ink shutter wipes up from the bottom (`clip-path`, 320ms, `ease_transition`) with the
   destination path in mono.
3. `router.push`, scroll reset.
4. Pathname change → shutter exits through the top (420ms).
Back/forward navigation and reduced motion skip the shutter.
