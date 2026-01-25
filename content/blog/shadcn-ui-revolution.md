---
title: "The shadcn/ui Approach: Why Copy-Paste Beats npm install"
excerpt: shadcn/ui flipped the component library model. Here's why that matters.
category: deep-dives
publishedAt: 2025-01-25
tags:
  - React
  - UI
  - Design Systems
  - Tailwind
coverImage: /blog/shadcn-ui-revolution.svg
featured: false
---

# The shadcn/ui Approach: Why Copy-Paste Beats npm install

Component libraries follow a predictable model: install the package, import the component, customize with props and CSS overrides. Material UI, Chakra, Ant Design—they all work this way.

Then shadcn/ui came along and said: "What if we don't install anything? What if you just... copy the code?"

This sounded backwards to me. Isn't the whole point of libraries to avoid copying code?

But I've used shadcn/ui for six months now, and I get it. The model makes sense. Let me explain why.

## The Traditional Model's Problems

When you `npm install` a component library, you get:

1. **Someone else's opinions baked in.** The library authors decided how props work, what's customizable, what isn't.

2. **Version lock-in.** Upgrading might break things. Not upgrading means missing fixes.

3. **Bundle overhead.** You ship the library's code even if you only use 10% of it.

4. **Fighting the abstraction.** Ever tried to customize a Material UI component beyond what props allow? You end up with `!important` overrides and `sx` prop gymnastics.

5. **Black box debugging.** When something breaks, you're debugging into node_modules.

These problems are manageable. But they're real, and everyone who's built production React apps has felt them.

## The shadcn/ui Model

shadcn/ui takes a different approach. You don't install it as a dependency. You copy components into your codebase:

```bash
npx shadcn-ui@latest add button
```

This creates a file in your project:

```tsx
// components/ui/button.tsx
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium...",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground...",
        outline: "border border-input bg-background hover:bg-accent...",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
```

That's it. That's your button now. You own it.

## Why This Is Better

### 1. Full Control

Want to add a new variant? Edit the file:

```tsx
variants: {
  variant: {
    // existing variants...
    brand: "bg-brand text-white hover:bg-brand/90",
  },
}
```

No library update needed. No forking. Just edit your code.

### 2. No Abstraction Layer

The implementation is right there. When something behaves unexpectedly, you can read the code. When you want to change behavior, you change the code.

You're not fighting an abstraction—you own the abstraction.

### 3. No Version Mismatch

The code in your repo is the code that runs. No wondering if you're on the right library version. No waiting for patches.

### 4. Smaller Bundles

You only have the components you use. No tree-shaking hopes—you literally don't have the code for components you didn't copy.

### 5. Learning Tool

Reading shadcn/ui components taught me patterns I didn't know:
- `class-variance-authority` for variant management
- `Slot` from Radix for the `asChild` pattern
- Thoughtful TypeScript patterns

When you copy code, you're forced to understand it (at least a little).

## The Dependencies

shadcn/ui isn't zero-dependencies. You need:

- **Tailwind CSS** — The styling foundation
- **Radix UI** — Headless primitives (Dialog, Dropdown, etc.)
- **class-variance-authority** — Variant management
- **clsx + tailwind-merge** — ClassName merging

These are dependencies you install. But they're utilities, not UI opinions. Radix gives you accessible primitives; you control the styling.

```json
{
  "dependencies": {
    "@radix-ui/react-dialog": "^1.0.0",
    "@radix-ui/react-dropdown-menu": "^2.0.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.0.0"
  }
}
```

## Setting It Up

Initialize shadcn/ui in your project:

```bash
npx shadcn-ui@latest init
```

It asks you about:
- Style (New York vs. Default)
- Base color
- CSS variables for theming
- Path aliases

Then add components as needed:

```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add dropdown-menu
```

Each command copies the component code into your project.

## The Real-World Workflow

Here's how I actually use shadcn/ui:

**1. Bootstrap with defaults:**
```bash
npx shadcn-ui@latest add button card input dialog
```

**2. Customize the theme:**
Edit `globals.css` to set your color palette:
```css
:root {
  --primary: 220 90% 56%;
  --secondary: 215 20% 65%;
  --accent: 142 76% 36%;
  /* ... */
}
```

**3. Modify components as needed:**
```tsx
// Added my own variant
const buttonVariants = cva("...", {
  variants: {
    variant: {
      // ...existing
      success: "bg-green-600 text-white hover:bg-green-700",
    },
  },
});
```

**4. Build on top:**
```tsx
// components/ui/submit-button.tsx
import { Button } from "./button";
import { Loader2 } from "lucide-react";

function SubmitButton({ loading, children, ...props }) {
  return (
    <Button disabled={loading} {...props}>
      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </Button>
  );
}
```

## Updating Components

"But what about updates?" you ask.

You can re-run the add command to get the latest version:

```bash
npx shadcn-ui@latest add button --overwrite
```

But here's the thing: you probably don't want automatic updates. If you've customized a component, you don't want your changes overwritten.

The shadcn/ui model embraces this: once you copy the code, it's yours. Updates are opt-in and manual. This is a feature, not a bug.

For genuinely new components or major improvements, you can:
1. Check the shadcn/ui GitHub for changes
2. Manually merge updates you want
3. Or just use the updated version and re-apply customizations

## When Not to Use shadcn/ui

It's not perfect for every situation:

**Large teams with design systems:** If you have 50 developers and a dedicated design system team, you probably want a versioned package with proper governance. Copy-paste doesn't scale to enterprise design system management.

**Non-Tailwind projects:** shadcn/ui is Tailwind-first. If you're using CSS Modules, styled-components, or vanilla CSS, this isn't your tool.

**Rapid prototyping with unfamiliar components:** If you need a complex component you've never used (rich text editor, data grid), a battle-tested library with documentation might be better than copy-paste-and-figure-it-out.

## The Philosophy Matters

shadcn/ui represents a philosophical shift. Traditional libraries say "trust us, use our abstraction." shadcn/ui says "here's good code, make it yours."

This resonates with how I've always felt about component libraries: I want the 80% head start, but I don't want to be locked in when I need the 20% customization.

The genius of shadcn/ui is finding a middle path. It's not "build everything from scratch" and it's not "surrender control to a library." It's "start with proven patterns, own the result."

I'm convinced this model will spread. We're already seeing similar approaches emerge in other ecosystems. The npm-install-everything era isn't over, but it's being questioned—and that's healthy.

---

*shadcn/ui is by @shadcn. The documentation and component collection are excellent. Worth browsing even if you don't use it—the patterns are educational.*
