---
title: "Building Zombie Donkeys 2069: A Gassy Retro Boomer Shooter"
excerpt: "How I built a multiplayer web FPS with Babylon.js, WebRTC, and a very specific focus on donkey purification and cheek jiggling physics."
category: deep-dives
publishedAt: 2026-04-12
tags:
  - Game Dev
  - Babylon.js
  - WebRTC
  - TypeScript
coverImage: /blog/zombie-donkeys-2069.svg
featured: true
---

# Building Zombie Donkeys 2069: A Gassy Retro Boomer Shooter

The year is 2069. The digital abyss has been corrupted by "Bad Vibes," transforming the once-noble donkey population into mindless, nibbling zombies. 

I decided to document the process of building this web-based multiplayer FPS, mostly because it involves some of the most ridiculous physics I've ever had to implement: **Cheek Jiggling.**

## The Tech Stack

- **Engine:** Babylon.js (for that chunky retro software-rendered feel)
- **Networking:** Peer-to-Peer (WebRTC) for state sync, using Socket.io for signaling.
- **Frontend:** Vite + TypeScript.
- **Backend:** Node.js (Signaling only).

## The Bio-Gaster and F-BOMBS

Instead of bullets, I wanted something more "purifying." Enter the **Bio-Gaster**. It's a methane-powered purification unit that blasts bad vibes out of donkeys, turning them into flying rainbow unicorns.

The technical challenge here was making the hit detection feel generous. I ended up using invisible 3D cylinder hitboxes instead of the 2D billboard sprites to ensure that even a near-miss with a gas cloud would trigger a transformation.

## That Specific Aesthetic

To get the "Boomer Shooter" vibe, I did three things:
1. **Hardware Scaling:** I dropped the resolution by 4x to get those chunky pixels.
2. **Dynamic Texturing:** Every wall and floor texture is procedurally generated with noise to look like 90s stone and metal.
3. **Billboarding:** All enemies and pickups are 2D sprites that always face the camera, just like the original Doom.

## The Future of Gaseous Combat

Zombie Donkeys 2069 features a global scoreboard, multiple difficulty levels (from "Gentle Breeze" to "Gassy Hell"), and a progression system where you rank up as an elite Ass-sassin.

Check out the live game at [zombie-donkeys.vercel.app](https://zombie-donkeys.vercel.app).

From jose with love. ❤️
