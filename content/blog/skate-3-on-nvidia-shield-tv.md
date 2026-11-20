---
title: "Porting a Skate 3 Recompilation to Android TV: Reading the Build, Not the README"
excerpt: "A community project runs Skate 3 natively on Android phones. My Shield TV is the wrong Android version, the wrong CPU and has no touchscreen. On paper, it's dead. In the code, it's two version checks and a manifest."
category: deep-dives
publishedAt: "2026-11-06"
tags:
  - android
  - tv
  - skateboarding
  - gaming
  - side-project
featured: false
---

I skate, I build TV apps, and Skate 3 is one of the best skateboarding games ever made. So when I saw a community project running Skate 3 natively on Android, my brain immediately went: *could this run on my NVIDIA Shield, on the big TV, with a controller?*

The result is **Skate3-shieldtv**: a patch set that builds the upstream **Skate3-Mobile** project into an installable Android TV app, with a proper tile in the TV launcher.

Important upfront: this repo contains **only patches, build tooling and docs**. It ships **no game content of any kind**. You need your own legally obtained Xbox 360 copy, exactly as upstream requires. And it is **not known to work yet**. More on that below.

## First, a correction

The upstream project often gets described as "Skate 3 in the browser." It isn't. There's no browser build and no WebAssembly. What it does is **static recompilation**: the Xbox 360's PowerPC executable is translated ahead of time into native ARM64 code, with the console's GPU emulated on top of Vulkan.

So a quick web wrapper wasn't an option. There's nothing to point a WebView at. The only way onto a Shield is a native Android build.

## On paper, the Shield is dead

Upstream targets **Android 13** phones and handhelds and lists **ARMv8.2** with some newer CPU features as a requirement. The Shield TV runs **Android 11** on an **ARMv8.0** Cortex-A57, with no touchscreen.

That's two out of four requirements failed. Most people would stop reading here.

## In the code, it's a different story

So I did what I'd do with any spec that seems suspicious: **checked what the build actually enforces**, not what the README says.

**The Android 13 requirement is real, but it's just two version checks.** One is the install-time `minSdkVersion`. The other is a separate runtime check at launch that refuses to start below Android 13. Neither one exists because the app *uses* Android 13 features. Scanning the project's own code turned up only one version-sensitive API call, and it dates back to Android 8. Lowering both gates to Android 11 is a safe edit.

**The ARMv8.2 requirement is a paper spec.** The compatibility runtime compiles with plain `-march=armv8-a`, the ARMv8.0 baseline, and there are no half-precision or dot-product intrinsics in the source. The README described the hardware the author tested on, not what the build needs.

**The touchscreen was already optional** in the manifest.

The one hard requirement that *can't* be checked ahead of time is a specific Vulkan GPU feature (`geometryShader`), which only the device itself can confirm on first launch.

## Seven small patches

The patch script makes **seven exact-match edits** to the upstream clone. Each one **fails loudly** if upstream has changed, instead of quietly producing a broken app:

| Change | Why |
|---|---|
| `minSdkVersion` 33 → 30 | the install-time gate |
| runtime check `< 33` → `< 30` | the second, independent gate |
| new app ID | disables the in-app updater |
| add `LEANBACK_LAUNCHER` | gives the app a real Android TV tile |
| add a 320 × 180 banner | required for that tile to render |
| declare leanback, drop portrait requirements | TV form factor |
| `sensorLandscape` → `landscape` | a TV has no orientation sensor |

My favorite is the **app ID change**, because it looks cosmetic and isn't. Upstream's auto-updater only recognizes its own package name. Rename it and the updater switches off, which matters, because otherwise the app would offer to "update" your working Shield build to the official Android 13 build that can't run on this hardware.

And the TV launcher banner is **original flat artwork** (gradient, angled bars, plain type), not game art.

## Building it

It's all wrapped in `make`, starting with a check that the Shield is even a viable target before you spend time building:

```bash
make probe SHIELD_IP=192.168.1.42   # is this device worth trying?
make bootstrap                      # clone upstream
make patch                          # apply the Shield patches + banner
make build SKATE3_GAME_DATA_ROOT=/path/to/your/game ...
make install SHIELD_IP=192.168.1.42
```

The project also needs the Xbox 360 version specifically. There's no PC version of Skate 3, and a PS3 copy won't work, because the whole pipeline is built around the Xbox 360 executable and GPU.

## Honest status

Nobody has run this renderer on the Shield's Maxwell-generation Tegra GPU yet. So the first milestone is simply **booting**. If the device turns out not to expose the required Vulkan feature, the fallback is running the desktop build on a PC and streaming it to the Shield.

All the game-side engineering belongs to upstream. This project only adds the TV adaptation.

## The lesson I keep relearning

Requirements in a README describe what someone tested, not always what the code needs. When a project says "not supported," the build files, manifests and version checks will tell you *why*, and sometimes the answer is "for no technical reason at all."

Read the build, not the brochure. Then go skate, in real life or on the big screen.
