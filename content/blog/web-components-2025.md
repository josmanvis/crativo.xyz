---
title: "Web Components in 2025: Finally Ready for Primetime?"
excerpt: I've been skeptical of Web Components for years. Here's why I'm reconsidering.
category: deep-dives
publishedAt: 2025-01-25
tags:
  - Web Components
  - JavaScript
  - Architecture
  - Standards
coverImage: /blog/web-components-2025.svg
featured: false
---

# Web Components in 2025: Finally Ready for Primetime?

I've been dismissive of Web Components for years. Every time someone asked "why not use Web Components instead of React," I had a list of reasons: Shadow DOM is weird, no SSR story, tooling is lacking, the DX is rough.

But in 2025, I'm reconsidering. Not because Web Components have suddenly become amazing—they still have quirks. But the ecosystem has matured, browser support is complete, and there are legitimate use cases where they make more sense than framework components.

Let me give you an honest assessment.

## What Web Components Are (Quick Refresher)

Web Components are three browser standards working together:

**Custom Elements:** Define your own HTML tags
```javascript
class MyButton extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `<button>Click me</button>`;
  }
}
customElements.define('my-button', MyButton);
```

**Shadow DOM:** Encapsulated styles and markup
```javascript
class MyCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <style>
        /* These styles don't leak out */
        .card { border: 1px solid gray; padding: 1rem; }
      </style>
      <div class="card"><slot></slot></div>
    `;
  }
}
```

**HTML Templates:** Inert, cloneable HTML chunks
```html
<template id="my-template">
  <style>...</style>
  <div class="content">...</div>
</template>
```

Together, they let you create reusable, encapsulated components using browser-native APIs.

## What's Actually Improved

### Browser Support Is Complete

In 2020, you needed polyfills. In 2025, you don't. All modern browsers fully support:
- Custom Elements v1
- Shadow DOM v1
- HTML Templates
- Form-associated custom elements
- Element internals API

Even Safari, historically the slowest to adopt, has full support.

### Form Integration Works

This was a major pain point. Custom elements couldn't participate in forms—no validation, no form data submission.

Now they can:

```javascript
class MyInput extends HTMLElement {
  static formAssociated = true;
  
  constructor() {
    super();
    this.internals = this.attachInternals();
    this.attachShadow({ mode: 'open' });
    
    this.shadowRoot.innerHTML = `
      <input type="text" />
    `;
    
    this.shadowRoot.querySelector('input').addEventListener('input', e => {
      this.internals.setFormValue(e.target.value);
    });
  }
  
  get validity() { return this.internals.validity; }
  get validationMessage() { return this.internals.validationMessage; }
}
```

Your custom input now:
- Appears in FormData
- Participates in form validation
- Gets reset with the form
- Responds to `:invalid` CSS selectors

This was a blocker. It's not anymore.

### Declarative Shadow DOM

You can now define Shadow DOM in HTML, no JavaScript required:

```html
<my-card>
  <template shadowrootmode="open">
    <style>
      .card { border: 1px solid gray; }
    </style>
    <div class="card">
      <slot></slot>
    </div>
  </template>
  Card content here
</my-card>
```

This enables SSR. The component renders correctly before JavaScript loads. The browser instantiates the shadow root from the template automatically.

### The Library Ecosystem

You don't have to write vanilla Web Components. Libraries smooth the rough edges:

**Lit** (from Google):
```javascript
import { LitElement, html, css } from 'lit';

class MyButton extends LitElement {
  static properties = {
    variant: { type: String },
  };
  
  static styles = css`
    button { padding: 0.5rem 1rem; }
    .primary { background: blue; color: white; }
  `;
  
  render() {
    return html`
      <button class="${this.variant}">
        <slot></slot>
      </button>
    `;
  }
}
```

Lit adds reactive properties, efficient rendering, and better ergonomics while staying close to the platform.

**Stencil** (from Ionic) compiles to Web Components from a familiar syntax:
```tsx
@Component({
  tag: 'my-button',
  styleUrl: 'my-button.css',
  shadow: true,
})
export class MyButton {
  @Prop() variant: string;
  
  render() {
    return (
      <button class={this.variant}>
        <slot></slot>
      </button>
    );
  }
}
```

## Where Web Components Make Sense

### 1. Design Systems That Span Frameworks

This is the killer use case. If your organization uses React, Vue, Angular, and vanilla JS across different teams/projects, Web Components work everywhere:

```html
<!-- Works in React -->
<my-button variant="primary">Click</my-button>

<!-- Works in Vue -->
<my-button variant="primary">Click</my-button>

<!-- Works in Angular -->
<my-button variant="primary">Click</my-button>

<!-- Works in plain HTML -->
<my-button variant="primary">Click</my-button>
```

No framework-specific versions. No wrapper libraries. One component, use it everywhere.

Companies like Adobe (Spectrum), Salesforce (Lightning), and Microsoft (Fluent) use Web Components for exactly this reason.

### 2. Third-Party Embeds

Building a widget that customers embed on their sites? Web Components provide encapsulation:

```html
<!-- Customer's page -->
<link rel="stylesheet" href="their-styles.css">

<your-chat-widget api-key="xyz123"></your-chat-widget>

<script src="your-widget.js"></script>
```

Shadow DOM ensures their CSS can't break your widget, and your CSS can't affect their page. Perfect isolation.

### 3. Progressive Enhancement

Web Components can enhance existing HTML without replacing it:

```html
<lazy-image src="photo.jpg" alt="A photo">
  <img src="placeholder.jpg" alt="A photo" />
</lazy-image>
```

If JavaScript fails, users see the placeholder. If it loads, the component enhances with lazy loading, blur-up effects, etc.

### 4. Long-Lived Projects

Frameworks come and go. Remember jQuery plugins? Angular 1? Web Components are browser standards—they'll work in 20 years.

If you're building something that needs to last, standards have advantages over frameworks.

## Where Web Components Don't Make Sense

### 1. React-Only Apps

If your whole app is React, Web Components add friction:
- Passing complex props (objects, arrays) requires serialization
- Event handling is different (`addEventListener` vs. `onEvent`)
- No JSX integration
- React's ecosystem is larger

Use React components. Don't fight your framework.

### 2. SSR-Heavy Applications

Declarative Shadow DOM helps, but the story is still rougher than framework SSR. If you're building a Next.js app optimized for SEO and first-paint, React components are easier.

### 3. Highly Interactive Applications

State management in Web Components is primitive compared to React/Vue. For complex apps with lots of state, derived data, and interactions, framework tools (Redux, signals, stores) are more ergonomic.

## The DX Reality Check

Let's be honest about the developer experience gaps:

**Hot Module Replacement:** Frameworks have great HMR. Web Components... it varies. Lit has decent support, but it's not as seamless.

**DevTools:** React DevTools and Vue DevTools are excellent. Browser DevTools for Web Components are improving but not as polished.

**TypeScript:** TypeScript support exists but requires more setup. Framework components have first-class TS support.

**Testing:** Frameworks have Testing Library, Cypress component testing, etc. Web Component testing is more DIY.

These gaps are real. They're smaller than they were, but they exist.

## My Recommendation

**Use Web Components when:**
- You're building a design system for multiple frameworks
- You're building embeddable widgets
- Framework agnosticism is a requirement
- You value long-term stability over short-term DX

**Use framework components when:**
- You're building a single-framework application
- You need advanced state management
- Developer experience is a priority
- You're optimizing for team velocity

**My approach:** I build applications in React or Solid. I build shared design system components in Web Components (using Lit). This gives me framework flexibility where it matters and great DX where I spend most of my time.

## Getting Started

If you want to try Web Components:

1. **Start with Lit.** The DX is good enough that you won't hate it.
2. **Build one component.** A button, a card, something simple.
3. **Use it in an existing project.** See how it integrates with your framework.
4. **Evaluate honestly.** Does the encapsulation help? Does the DX hurt?

Web Components aren't the future of all frontend development. But they're a legitimate tool for specific use cases. In 2025, they're mature enough to use confidently—if the use case fits.

---

*The Lit team has excellent tutorials. Start there if you're curious.*
