---
title: "DevTools Console Utilities You Didn't Know Existed"
excerpt: Hidden console commands that will make you feel like a debugging wizard. $_, $0, debug(), monitor() - the secret sauce Chrome didn't tell you about.
category: deep-dives
publishedAt: 2025-01-26
tags:
  - DevTools
  - JavaScript
  - Debugging
  - Chrome
coverImage: /blog/devtools-console-utilities.svg
featured: true
---

# DevTools Console Utilities You Didn't Know Existed

I've been using Chrome DevTools for over a decade. I thought I knew it well. Then I discovered the Console Utilities API and realized I'd been doing everything the hard way.

These aren't regular JavaScript methods. They're DevTools-only magic commands that exist solely in the console. You can't use them in your code. They're debugging superpowers.

Let me show you what you've been missing.

## $_ - Your Last Result

Every expression you evaluate in the console stores its result in `$_`. Think of it as "that thing I just calculated."

```javascript
// Calculate something
2 + 2
// Returns: 4

// Use it immediately
$_ * 10
// Returns: 40

// It updates after each expression
['apple', 'banana', 'cherry'].filter(f => f.startsWith('b'))
// Returns: ['banana']

$_.length
// Returns: 1
```

This is incredibly useful when you're exploring data:

```javascript
// Fetch some data
await fetch('/api/users').then(r => r.json())
// Returns: [{id: 1, name: 'Jose'}, ...]

// Now explore it without fetching again
$_.filter(u => u.active)
$_.map(u => u.email)
$_.length
```

No more assigning to temporary variables. `$_` is always there, holding your last result.

## $0 through $4 - Your Element History

Here's one that genuinely changed how I debug CSS: `$0` is always the currently selected element in the Elements panel.

Click on any element in the Elements tab, then switch to Console:

```javascript
$0
// Returns: <div class="header">...</div>

$0.classList.add('debug')
// Instantly adds the class

$0.style.border = '2px solid red'
// Outlines it

getComputedStyle($0).display
// Returns: "flex"
```

But wait, there's more. Chrome remembers your last 5 selected elements:

- `$0` - Currently selected
- `$1` - Previously selected
- `$2` - Two selections ago
- `$3` - Three selections ago
- `$4` - Four selections ago

This is perfect for comparing elements:

```javascript
// Select Element A, then Element B

$0.getBoundingClientRect().width
// Width of Element B

$1.getBoundingClientRect().width
// Width of Element A (still accessible!)

// Compare their computed styles
getComputedStyle($0).fontSize === getComputedStyle($1).fontSize
```

## $() and $$() - Better querySelector

You know `document.querySelector()` and `document.querySelectorAll()`. The console has shorter versions:

```javascript
// Instead of document.querySelector('#header')
$('#header')

// Instead of document.querySelectorAll('.item')
$$('.item')
```

But `$$()` is better than querySelectorAll in one key way: it returns an actual Array, not a NodeList:

```javascript
// querySelectorAll returns a NodeList - no array methods
document.querySelectorAll('img').map(i => i.src)
// TypeError: .map is not a function

// $$() returns an Array - everything works
$$('img').map(i => i.src)
// Returns: ['image1.jpg', 'image2.jpg', ...]
```

Both also accept a second parameter for scope:

```javascript
// Find all links inside the nav
$$('a', document.querySelector('nav'))

// Find the first button in the sidebar
$('button', $('#sidebar'))
```

## $x() - XPath Queries

Sometimes CSS selectors can't express what you need. XPath can.

```javascript
// Find all paragraphs on the page
$x('//p')

// Find all paragraphs that contain links
$x('//p[a]')

// Find elements with specific text content
$x('//*[contains(text(), "Error")]')

// Find the parent of an element
$x('//span[@class="price"]/parent::*')
```

XPath is powerful for content-based selection that CSS can't do:

```javascript
// Find all buttons that say "Submit"
$x('//button[text()="Submit"]')

// Find all elements with a data attribute containing "user"
$x('//*[contains(@data-id, "user")]')
```

## debug() and undebug() - Breakpoints Without the UI

Want to pause execution when a specific function is called? You can set a breakpoint in Sources, or:

```javascript
// Break whenever handleClick is called
debug(handleClick)

// Now click the button - debugger opens automatically
```

To remove the breakpoint:

```javascript
undebug(handleClick)
```

This is fantastic for third-party code. You can't easily navigate to where `react-router` handles navigation, but you can:

```javascript
debug(history.push)
```

Now whenever anything calls `history.push()`, you'll break right there.

## monitor() and unmonitor() - Watch Function Calls

Similar to `debug()`, but instead of breaking, it logs:

```javascript
function calculateTotal(items) {
  return items.reduce((sum, i) => sum + i.price, 0);
}

monitor(calculateTotal)
```

Now every time `calculateTotal` is called:

```
function calculateTotal called with arguments: [Array(3)]
```

You see exactly what's being passed, without adding console.log to the source.

```javascript
unmonitor(calculateTotal)
```

## monitorEvents() - Watch DOM Events

This is the one that blew my mind. You can watch all events on any element:

```javascript
// Watch all events on the document
monitorEvents(document)
```

Now every click, scroll, keypress, mousemove - everything gets logged. That's usually too much, so filter it:

```javascript
// Just mouse events
monitorEvents(document, 'mouse')

// Just keyboard events  
monitorEvents($0, 'key')

// Multiple event types
monitorEvents(window, ['resize', 'scroll'])
```

Available event groups:
- `mouse` - click, dblclick, mousedown, mouseup, mouseover, mouseout, mousemove, mousewheel
- `key` - keydown, keyup, keypress, textInput
- `touch` - touchstart, touchmove, touchend, touchcancel  
- `control` - resize, scroll, zoom, focus, blur, select, change, submit, reset

This is invaluable when you're not sure what events an element is receiving:

```javascript
monitorEvents($('#weird-dropdown'), 'mouse')
// Click around, see exactly what fires

unmonitorEvents($('#weird-dropdown'), 'mouse')
```

## getEventListeners() - See All Attached Listeners

Ever wonder what's listening to an element?

```javascript
getEventListeners($0)
// Returns: {click: Array(2), mouseenter: Array(1)}
```

You get an object with all event types and their listeners. Expand it to see the actual functions:

```javascript
getEventListeners($0).click[0].listener
// Returns: ƒ handleClick(e) { ... }

getEventListeners($0).click[0].useCapture
// Returns: false
```

This is how you debug "why is this element doing that when I click it." No more guessing.

## copy() - Copy Anything to Clipboard

```javascript
copy($0)
// Copies the element's HTML to clipboard

copy(await fetch('/api/data').then(r => r.json()))
// Copies the JSON response

copy($$('a').map(a => a.href).join('\n'))
// Copies all links on the page, one per line
```

I use this constantly for extracting data from pages.

## keys() and values() - Quick Object Inspection

```javascript
const user = { name: 'Jose', role: 'developer', team: 'platform' }

keys(user)
// Returns: ['name', 'role', 'team']

values(user)
// Returns: ['Jose', 'developer', 'platform']
```

It's just a shorthand for `Object.keys()` and `Object.values()`, but in the console, every keystroke saved adds up.

## queryObjects() - Find All Instances

This one's wild. You can find all objects in memory that were created by a specific constructor:

```javascript
queryObjects(Promise)
// Returns: Array of all Promise instances in memory

queryObjects(HTMLImageElement)
// Returns: All img elements (including detached ones!)
```

This is useful for debugging memory leaks. If you create React components and they're not getting garbage collected:

```javascript
queryObjects(MyComponent)
// See how many instances exist
```

## table() - Pretty Print Arrays and Objects

```javascript
const users = [
  { name: 'Jose', score: 95 },
  { name: 'Maria', score: 87 },
  { name: 'Carlos', score: 92 }
]

table(users)
```

This renders a beautiful table in the console. Much easier to scan than the default object tree.

You can also specify which columns to show:

```javascript
table(users, ['name'])
// Only shows the name column
```

## inspect() - Jump to Element or Source

```javascript
// Jump to element in Elements panel
inspect($0)

// Jump to function definition in Sources
inspect(handleClick)
```

No more manually searching through the DOM or source files. Point and go.

## Putting It All Together

Here's a real debugging session using these tools:

```javascript
// 1. Something's wrong with buttons in the sidebar
monitorEvents($('#sidebar'), 'click')

// 2. Click around, see events are firing
// 3. Select the problematic button in Elements (now it's $0)

getEventListeners($0)
// Hmm, there's a click listener but also one on parent

getEventListeners($0.parentElement)
// Parent has stopPropagation - that's the bug!

// 4. Find out what function is doing it
getEventListeners($0.parentElement).click[0].listener
// Copy it, search in Sources

// 5. Clean up
unmonitorEvents($('#sidebar'))
```

In 60 seconds, you've identified a bug that might have taken 20 minutes with console.log.

## The Catch

Remember: these only work in the DevTools console. If you try to use `$0` or `monitor()` in your actual code, you'll get reference errors. They're debugging tools, not programming APIs.

Also, some are Chrome-specific. Firefox has its own console utilities with slightly different names. But the core concepts are the same.

## Why Aren't These Documented Better?

I have no idea. These utilities have existed for years, but they're buried in the [Chrome DevTools docs](https://developer.chrome.com/docs/devtools/console/utilities) where nobody looks. Most developers learn DevTools through osmosis and YouTube videos, and these rarely come up.

Now you know. Use them. Your debugging sessions will never be the same.

---

*The Console Utilities API has been stable for years. These aren't experimental features that might disappear. Learn them, use them, love them.*
