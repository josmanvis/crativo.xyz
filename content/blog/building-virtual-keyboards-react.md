---
title: Building Virtual Keyboards in React
excerpt: Lessons learned from creating too-bored, a configurable virtual keyboard for kiosk applications.
category: tutorials
publishedAt: 2024-12-15
tags:
  - React
  - TypeScript
  - NPM
  - Kiosk
featured: true
---

# Building Virtual Keyboards in React

When building kiosk applications at Retail Business Services, I needed a reliable virtual keyboard solution. After evaluating existing options, I decided to build my own—and published it as **too-bored** on npm.

## The Challenge

Touch-based input devices like kiosks and tablets need on-screen keyboards. But most solutions were either too heavy, not customizable enough, or didn't work well with React's state management.

## Key Requirements

- **Lightweight** - Kiosk devices often have limited resources
- **Customizable layouts** - QWERTY, numeric, and custom layouts
- **React-friendly** - Seamless integration with controlled components
- **Accessible** - Screen reader support and keyboard navigation

## The Solution

```typescript
import TooBored from 'too-bored';

export function KioskInput() {
  const [value, setValue] = useState('');

  return (
    <div>
      <input value={value} readOnly />
      <TooBored
        onChange={setValue}
        layout="qwerty"
        theme="dark"
      />
    </div>
  );
}
```

## Lessons Learned

1. **State management matters** - Using controlled components simplified the API
2. **CSS-in-JS for theming** - Made it easy to support light/dark modes
3. **TypeScript from day one** - Caught bugs early and improved DX

The package is available on [npm](https://www.npmjs.com/package/too-bored) if you need a virtual keyboard for your React project.
