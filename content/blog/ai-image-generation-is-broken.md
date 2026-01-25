---
title: "AI Image Generation Is Broken (And How I Use It Anyway)"
excerpt: DALL-E gives me nightmares, Midjourney costs too much, and Stable Diffusion requires a PhD. Here's how I actually use AI images.
category: deep-dives
publishedAt: 2025-01-05
tags:
  - AI
  - Design
  - Image Generation
  - Tools
coverImage: /blog/ai-image-generation-is-broken.svg
featured: false
---

# AI Image Generation Is Broken (And How I Use It Anyway)

I've spent hundreds of dollars and countless hours trying to get AI to generate usable images. The results? A folder of nightmare creatures with seven fingers, corporate stock photos that look AI-generated from a mile away, and exactly three images I've actually used.

But I keep using these tools. Because when they work, they're magic. The problem is, they almost never work.

Here's my brutally honest take on AI image generation in 2025—what's broken, what's tolerable, and how I actually use it despite everything.

## The Current State: A Disaster Tour

### DALL-E 3

**The good:** It understands language pretty well. Say "a cat wearing a tiny cowboy hat sitting in a saloon" and you'll get something close.

**The bad:** 
- Corporate stock photo aesthetic baked in
- Humans look like plastic
- Text generation is broken (always has been)
- Expensive for high volume

**The ugly:** Those hands. Those damn hands.

### Midjourney

**The good:** Legitimately beautiful aesthetic output. Best-looking images of the bunch.

**The bad:**
- Discord-only interface (seriously, it's 2025)
- $30/month minimum for decent usage
- Limited control over output
- Aesthetic is so distinctive it screams "AI-generated"

**The ugly:** Try getting a specific composition. The AI does what it wants.

### Stable Diffusion

**The good:**
- Free and open source
- Runs locally (privacy!)
- Infinite customization
- Community models for any style

**The bad:**
- Setup is a nightmare
- VRAM requirements are brutal
- Quality varies wildly
- You'll spend more time configuring than creating

**The ugly:** Installing dependencies on Windows. I've seen developers cry.

## What AI Image Generation Is Actually Good For

After burning through tokens and subscriptions, here's where I actually get value:

### 1. Concept Exploration (Not Final Art)

AI is great at "show me 10 different directions for this idea."

```
Prompt: "minimalist logo concepts for a productivity app, 
geometric shapes, single color, abstract, variations"
```

Generate 20 variations, find one interesting direction, then either:
- Hand it to a real designer as a reference
- Recreate it properly in Figma
- Use it as inspiration, not the final asset

### 2. Placeholder Content

Mockups, prototypes, presentations. Anywhere you need "a picture of [thing]" that isn't going to be the final version.

```
Prompt: "hero image for a travel website, aerial view of 
tropical beach, warm lighting, editorial photography style"
```

Good enough for a client mockup. Replace with real photography later.

### 3. Blog Cover Images (With Heavy Caveats)

Guilty as charged—some of my blog images are AI-generated. But I have rules:

- Abstract/illustrative only (no fake photos)
- Heavy post-processing
- Never pretend it's real
- Simple compositions that hide AI artifacts

### 4. Social Media Content (Low Stakes)

Quick memes, reaction images, one-off posts. Anything where "pretty good" is good enough and nobody's looking closely.

### 5. Texture and Pattern Generation

This is actually where AI shines. Need a seamless texture? Tileable pattern? Background gradient?

```
Prompt: "seamless geometric pattern, dark blue and gold, 
art deco style, tileable texture"
```

Run it through a pattern maker, clean up edges, done.

## My Actual Workflow (What Works)

Here's how I generate images that are actually usable:

### Step 1: Use The Right Tool

| Need | Tool | Why |
|------|------|-----|
| Quick concept | DALL-E 3 | Best language understanding |
| Beautiful aesthetic | Midjourney | Just looks better |
| Specific control | Stable Diffusion | Full customization |
| Local/private | Stable Diffusion | Runs on your machine |

### Step 2: Prompt Like You Mean It

Bad prompt:
```
"a mountain landscape"
```

Usable prompt:
```
"dramatic mountain landscape at golden hour, jagged peaks 
emerging from clouds, foreground wildflowers in focus, 
style of Ansel Adams photography, high contrast black and 
white, panoramic composition, no people"
```

The specificity matters:
- **Subject**: What's in the image
- **Style**: Photography, illustration, painting, etc.
- **Mood**: Lighting, atmosphere, emotion
- **Composition**: Framing, perspective, depth
- **Technical**: Resolution, aspect ratio, quality level
- **Negatives**: What you DON'T want

### Step 3: Generate More Than You Need

My ratio: Generate 20, like 4, use 1.

AI generation is cheap (or free locally). The curation is where you add value.

### Step 4: Post-Process Everything

I never use AI images raw. At minimum:
- Color correction
- Cropping to hide weird edges
- Sharpening or blur to unify style
- Adding text/overlays to mask artifacts

With Stable Diffusion, I often:
- Inpaint problem areas
- Use img2img to refine
- Composite multiple generations

### Step 5: Be Honest About It

If it's AI-generated, don't pretend otherwise. The aesthetic is recognizable. People can tell. It's less cringe to own it than to get caught.

## The Stable Diffusion Setup (If You're Brave)

Fine, you want local control. Here's the least painful setup in 2025:

### Option A: ComfyUI (Power Users)

Node-based interface. Steep learning curve. Maximum control.

```bash
# Clone the repo
git clone https://github.com/comfyanonymous/ComfyUI
cd ComfyUI

# Install dependencies
pip install -r requirements.txt

# Download a model (e.g., SDXL)
# Put it in models/checkpoints/

# Run
python main.py
```

### Option B: Automatic1111 (More User-Friendly)

Web UI that's become the community standard.

```bash
# Clone
git clone https://github.com/AUTOMATIC1111/stable-diffusion-webui
cd stable-diffusion-webui

# Run (handles dependencies)
./webui.sh  # Mac/Linux
webui-user.bat  # Windows
```

### Option C: Fooocus (Easiest)

If you want Midjourney-like simplicity with local running:

```bash
git clone https://github.com/lllyasviel/Fooocus
cd Fooocus
python launch.py
```

### Hardware Reality Check

For SDXL (current best quality):
- **Minimum**: 8GB VRAM (slow)
- **Comfortable**: 12GB VRAM
- **Fast**: 16GB+ VRAM

Mac users: M1/M2/M3 works via MPS. Slower than NVIDIA but usable.

## The Tools I Actually Pay For

**Midjourney ($30/month)**: For when I need beautiful and don't have time. Discord interface sucks but output quality is worth it.

**ChatGPT Plus ($20/month)**: Includes DALL-E 3. Good enough for quick concepts.

**Nothing else**: Stable Diffusion is free. Most other services are repackaging open models at markup.

## Advanced Techniques That Actually Help

### ControlNet (Stable Diffusion)

Control image composition using input images:
- Canny edge detection: Match shapes
- Depth maps: Match spatial layout  
- Pose detection: Match human poses

This is how you get specific compositions instead of AI lottery.

### Negative Prompts

Tell the AI what to avoid:
```
Negative: "blurry, low quality, distorted hands, 
extra fingers, watermark, text, deformed, ugly, 
mutated, duplicate"
```

Sounds obvious but makes a huge difference.

### Inpainting

Fix specific areas without regenerating everything:
1. Generate base image
2. Mask problem area (hands, faces, etc.)
3. Regenerate just that section
4. Repeat until acceptable

### Upscaling

AI images often lack detail at full resolution. Upscalers help:
- Real-ESRGAN: Best general purpose
- GFPGAN: Face-specific
- Topaz Gigapixel AI: Commercial, very good

## The Copyright Elephant

Let's address it: AI images exist in a legal gray zone.

**For personal projects:** Use freely, nobody cares.

**For client work:** Disclose that it's AI-generated. Some clients have policies.

**For commercial products:** Consult a lawyer. Seriously. The legal landscape is evolving.

**For selling as art:** Ethically questionable, legally unclear.

My approach: Use AI for internal work, concepts, and low-stakes content. For anything client-facing or revenue-generating, either get proper licensing or use real photography/illustration.

## What I Actually Use

After all that, here's my honest breakdown:

| Use Case | Solution |
|----------|----------|
| Blog covers | DALL-E 3 + heavy editing |
| Concepts for designers | Midjourney |
| Prototypes/mockups | Whatever's fastest |
| Textures/patterns | Stable Diffusion |
| Social media | Midjourney or DALL-E |
| Client deliverables | Real photography/illustration |

## The Future (My Prediction)

In 2-3 years:
- Video generation will be the new battleground
- Image quality will plateau (diminishing returns)
- Ethical/legal frameworks will solidify
- Most generation will move to device-local
- The "AI aesthetic" will become dated

The tools will get better. But the fundamental challenges—consistency, control, authenticity—won't fully go away.

## The Bottom Line

AI image generation is powerful, frustrating, and not ready to replace real creative work. Use it for:
- Speed and iteration
- Concepts and exploration
- Low-stakes content
- Texture and pattern work

Don't use it for:
- Final professional deliverables (usually)
- Anything pretending to be real photography
- Work where quality and authenticity matter

The technology is impressive. The output is inconsistent. The workflow is tedious. And yet, I keep using it—because when it works, it works.

Just expect to generate 50 images to find the one that doesn't have nightmare hands.

---

*AI image generation is a tool, not magic. Treat it like any other tool: know its limitations, work around them, and never trust the first result.*
