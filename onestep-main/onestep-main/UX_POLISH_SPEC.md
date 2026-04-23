# ONE THING — UX Polish Spec (Post-Activation Pass)
**Date:** 2026-04-22
**Scope:** CTA clarity, button contrast, visual hierarchy — not a redesign
**File to change:** `app/page.tsx` only

---

## 1. CTA Copy

**Current:** `Start — choose your category`
**Problem:** The em-dash construction reads as two thoughts. "Choose your category" describes a step in the process, not the outcome. Mild cognitive friction — user pauses to parse what happens next.

**Options (ranked):**

1. `Pick your one thing` ← **Recommended**
2. `Choose and begin`
3. `Start with one thing`

**Recommendation: "Pick your one thing"**
Mirrors the product name, is calm and action-forward, reinforces the core value prop (focus on one thing), and uses natural language. No hype, no imperative urgency.

**Rule applied:** 3–5 words, action-oriented, calm tone. ✓

---

## 2. Button Contrast & Readability

**Current:** `bg-[#111] text-white text-sm font-medium px-7 py-3.5 rounded-full`
**Problem:** `text-sm` (14px) on dark background with `font-medium` is low-contrast at small sizes. Padding feels tight relative to the surrounding whitespace. On mobile, tap target is borderline.

**Keep the black button.** Change:

| Property | Before | After |
|---|---|---|
| Font size | `text-sm` | `text-base` |
| Font weight | `font-medium` | `font-semibold` |
| Vertical padding | `py-3.5` | `py-4` |
| Horizontal padding | `px-7` | `px-8` |

**After (Tailwind):**
```
bg-[#111] text-white text-base font-semibold px-8 py-4 rounded-full hover:bg-[#333] transition-colors
```

No designer input required — this is a pure code change.

---

## 3. Visual Hierarchy

**Problem:** The headline, subhead, and CTA sit at roughly equal visual weight. The user's eye doesn't land anywhere decisive.

**3 micro-changes only:**

**A. Increase headline weight**
- Before: `text-4xl font-bold` (or equivalent)
- After: `text-5xl font-extrabold` on desktop, keep `text-4xl` on mobile (`sm:text-5xl`)
- *Pure code change*

**B. Add whitespace above the hero CTA**
- Before: CTA button directly follows subheadline with standard margin
- After: Add `mt-10` (was likely `mt-6` or `mt-4`) above the CTA link in the hero
- Creates a visual breath before the action — signals "this is the moment"
- *Pure code change*

**C. Reduce footer visual weight**
- Before: Footer text at default `text-sm` or `text-xs`
- After: Add `text-gray-400` (if not already) and `font-light` to footer links/text
- Keeps footer present but stops it from competing with the CTA
- *Pure code change*

---

## 4. Implementation Notes

- **Estimate:** < 20 min of dev work. Both CTA buttons (hero + pricing section) are identical — change one, copy to the other.
- **File:** `app/page.tsx` only — no other files needed.
- **No new dependencies.**
- **Mobile-first check:** `text-base` on button is safe at all sizes. Verify `sm:text-5xl` headline doesn't clip on 320px screens (check with dev tools at iPhone SE width).
- **Designer input required:** None. All changes are spacing, weight, and copy — within existing design system.
- **Both CTAs:** Apply identical changes to the hero CTA (line ~35) and the pricing section CTA (line ~103).

---

## Summary of Changes

| Area | Before | After |
|---|---|---|
| CTA copy | "Start — choose your category" | "Pick your one thing" |
| Button font | `text-sm font-medium` | `text-base font-semibold` |
| Button padding | `px-7 py-3.5` | `px-8 py-4` |
| Headline size | current | +1 step on desktop (`sm:text-5xl`) |
| Hero CTA spacing | standard margin | `mt-10` above CTA |
| Footer | default weight | `text-gray-400 font-light` |
