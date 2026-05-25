---
title: "Color in CSS: The OKLCH Revolution"
date: "2026-05-25"
description: "Why you should abandon HEX, RGB, and HSL for OKLCH, the perceptually uniform color space built for the modern web."
coverImage: "/blog/oklch-color-revolution.svg"
---

# Color in CSS: The OKLCH Revolution

Stop using HEX. Stop using RGB. And yes, stop using HSL.

I know, it sounds dramatic. You've spent years memorizing hex codes. You know that `#FFFFFF` is white and `#000000` is black, and you can probably guess that `#FF0000` is red. But here is the uncomfortable truth: you are using tools designed for machines, not for human eyes. 

The way we define color on the web has been fundamentally broken since the beginning. We've been mixing red, green, and blue light like we're programming cathode-ray tube monitors in the 1990s. 

It is time for a revolution. It is time for OKLCH.

## The Problem: Machines vs. Human Perception

Let's look at the "old way." 

Imagine you are building a design system. You have a primary brand color, a nice deep blue: `#2563EB`. Now you need a hover state for your buttons. It needs to be slightly lighter. 

How do you do that in hex? You can't. You have to open a color picker, drag a slider, and copy a new hex code. 

"Ah," you say, "I use HSL for that!"

HSL (Hue, Saturation, Lightness) was supposed to be the human-friendly alternative. Let's take two colors in HSL that have the exact same lightness value (50%) and saturation (100%), but different hues: pure blue and pure yellow.

```css
.box-1 {
  background-color: hsl(240, 100%, 50%); /* Blue */
}

.box-2 {
  background-color: hsl(60, 100%, 50%); /* Yellow */
}
```

If lightness is 50% for both, they should appear equally bright to the human eye, right? 

Wrong. The blue looks incredibly dark, almost illegible with black text. The yellow is blindingly bright. 

![HSL vs OKLCH](/blog/oklch-color-revolution-inline.svg)

This happens because HSL is not *perceptually uniform*. It calculates lightness mathematically based on the RGB color wheel, completely ignoring how human eyes actually perceive light. Our eyes are much more sensitive to green and yellow light than to blue light. HSL doesn't care.

This makes programmatically generating color palettes an absolute nightmare. If you want a consistent set of warning, success, and error colors with the same perceived contrast against text, you can't just set them all to `50%` lightness in HSL. You have to eyeball every single one.

## The Solution: OKLCH

Enter OKLCH. It stands for:
- **L**: Lightness (perceived brightness)
- **C**: Chroma (intensity/saturation)
- **H**: Hue (the actual color)

OKLCH is perceptually uniform. If you set two OKLCH colors to 70% lightness, they will look exactly equally bright to the human eye, regardless of the hue.

Let's rewrite our previous example:

```css
.box-1 {
  background-color: oklch(70% 0.15 260); /* Blue */
}

.box-2 {
  background-color: oklch(70% 0.15 100); /* Yellow */
}
```

Now, both colors have the same perceived lightness. If you put white text on both, the contrast ratio will be almost identical. 

### Why this changes everything

Because OKLCH is predictable, we can finally manipulate colors in CSS safely.

Do you want a hover state that is 10% lighter? Just use the `color-mix()` function or CSS variables to adjust the lightness, knowing that it won't suddenly turn your color into a neon nightmare.

```css
:root {
  --brand-h: 260;
  --brand-c: 0.15;
  --brand-base-l: 60%;
  
  --color-primary: oklch(var(--brand-base-l) var(--brand-c) var(--brand-h));
  --color-primary-hover: oklch(calc(var(--brand-base-l) + 10%) var(--brand-c) var(--brand-h));
  --color-primary-active: oklch(calc(var(--brand-base-l) - 5%) var(--brand-c) var(--brand-h));
}

button {
  background: var(--color-primary);
}

button:hover {
  background: var(--color-primary-hover);
}
```

This is elegant. It's pragmatic. It works perfectly every time.

### The P3 Color Space

There is another massive advantage to OKLCH. It gives you access to the P3 color space.

Modern screens (like the one you are probably using right now) can display about 50% more colors than the old sRGB color space. When you use HEX or HSL, you are artificially limiting your website to sRGB. You are literally leaving colors on the table.

OKLCH isn't bounded by sRGB. If you push the Chroma value high enough, you get access to incredibly vibrant, neon colors that simply cannot be expressed in HEX.

```css
.vibrant-pink {
  /* This pink is impossible in HEX */
  color: oklch(70% 0.35 340);
}
```

## How to migrate today

You don't need to rewrite your entire codebase. You can start using OKLCH today for new components.

Browsers have excellent support for OKLCH right now. All evergreen browsers support it. If you need to support ancient browsers, you can use a PostCSS plugin to transpile OKLCH down to RGB fallbacks, but for most modern applications, you can just ship it.

Here is a pragmatic approach to building a modern color system:

1. **Stop defining hardcoded hex values in your components.**
2. **Define a set of base hues and chromas for your semantic colors.**
3. **Use CSS variables for lightness to generate your scales.**

```css
:root {
  /* Define the core DNA of the colors */
  --hue-brand: 250;
  --hue-success: 140;
  --hue-danger: 25;
  
  --chroma-vibrant: 0.2;
  --chroma-muted: 0.05;
  
  /* Generate scales entirely through lightness */
  --bg-surface: oklch(98% var(--chroma-muted) var(--hue-brand));
  --text-main: oklch(20% var(--chroma-muted) var(--hue-brand));
  
  --btn-danger: oklch(60% var(--chroma-vibrant) var(--hue-danger));
}

@media (prefers-color-scheme: dark) {
  :root {
    /* Dark mode is literally just inverting the lightness */
    --bg-surface: oklch(15% var(--chroma-muted) var(--hue-brand));
    --text-main: oklch(95% var(--chroma-muted) var(--hue-brand));
  }
}
```

Look at that dark mode implementation. We didn't need to define 50 new hex variables. We just inverted the lightness. Because OKLCH is perceptually uniform, the contrast ratios are perfectly preserved.

## Stop living in the past

We are building applications in an era of HDR displays, dynamic theming, and algorithmic design systems. Hardcoding `#FF0000` is the equivalent of using `<font color="red">`. 

It is time to embrace a color space designed for human perception. Start using OKLCH, and you'll wonder how you ever lived without it.
