---
title: "From jQuery to React: A 20-Year JavaScript Journey"
excerpt: "I started coding when jQuery was revolutionary. Here's how JavaScript development changed, and what stayed the same."
category: career
publishedAt: 2024-09-28
tags:
  - JavaScript
  - React
  - Career
  - History
coverImage: /blog/jquery-to-react-journey.svg
featured: false
seo:
  title: "JavaScript Evolution: From jQuery to React | 20 Year Retrospective"
  description: "A senior developer's perspective on JavaScript's evolution from jQuery to React and beyond. 20 years of web development history."
  keywords: ["JavaScript history", "jQuery to React", "web development evolution", "JavaScript career", "frontend development"]
---

# From jQuery to React: A 20-Year JavaScript Journey

I wrote my first JavaScript in 2005. I was 13, building a terrible website, and discovered you could make things happen on click without reloading the page.

Mind = blown.

Two decades later, I've lived through jQuery, Backbone, Angular (the first one), React, and whatever we're supposed to be excited about this week. Here's what that journey taught me.

## The Before Times (2005-2006)

JavaScript was a mess. No, worse than you're imagining.

```javascript
// Checking if something exists
if (document.getElementById('myDiv') != null) {
  // This might work in IE
  // Or it might not
  // Who knows
}

// Event handling (if you were lucky)
element.attachEvent('onclick', handler); // IE
element.addEventListener('click', handler); // Firefox
```

Cross-browser compatibility meant writing everything twice. Internet Explorer 6 was everywhere and actively hostile to web standards.

My first "framework" was a 200-line utility file that wrapped common operations:

```javascript
function $(id) {
  return document.getElementById(id);
}

function addClass(el, className) {
  if (el.classList) {
    el.classList.add(className);
  } else {
    el.className += ' ' + className;
  }
}
```

Yes, I invented my own mini-jQuery. So did everyone else.

## The jQuery Revolution (2006-2012)

jQuery changed everything.

```javascript
// Before jQuery
var elements = document.querySelectorAll('.item');
for (var i = 0; i < elements.length; i++) {
  elements[i].style.display = 'none';
}

// After jQuery
$('.item').hide();
```

It wasn't just shorter. It was *consistent*. jQuery handled the browser differences. You wrote code once, it worked everywhere.

I remember the first time I used jQuery's AJAX:

```javascript
$.ajax({
  url: '/api/data',
  success: function(data) {
    $('#result').html(data);
  }
});
```

No XMLHttpRequest boilerplate. No browser sniffing. It just worked.

For about five years, jQuery *was* JavaScript for most developers. Every job posting required it. Every tutorial used it.

## The MV* Era (2010-2015)

As apps got complex, jQuery spaghetti became unmanageable. Enter Backbone.js:

```javascript
var TodoView = Backbone.View.extend({
  tagName: 'li',
  events: {
    'click .toggle': 'toggleComplete'
  },
  render: function() {
    this.$el.html(this.template(this.model.toJSON()));
    return this;
  }
});
```

Separation of concerns! Models! Views! Events that made sense!

I remember thinking Backbone was the future. Then Angular 1.x showed up:

```html
<div ng-app="myApp" ng-controller="MainCtrl">
  <input ng-model="name">
  <p>Hello, {{name}}!</p>
</div>
```

Two-way data binding felt like magic. The view updated automatically when data changed. The data updated when the view changed. It was beautiful.

It was also a performance nightmare for complex apps. And the digest cycle was an endless source of bugs:

```javascript
// "Why isn't this updating?"
$scope.data = newData;

// "Oh right, I'm in a callback outside Angular's zone"
$scope.$apply(function() {
  $scope.data = newData;
});
```

## The React Era (2015-Present)

When React came out, I was skeptical. JSX looked wrong:

```jsx
function Button({ label, onClick }) {
  return (
    <button className="btn" onClick={onClick}>
      {label}
    </button>
  );
}
```

HTML in JavaScript? Components everywhere? One-way data flow?

Then I built something non-trivial with it.

The clarity was stunning. No more wondering where state lived. No more chasing event handlers through spaghetti code. Components were self-contained, testable, composable.

```jsx
function TodoApp() {
  const [todos, setTodos] = useState([]);
  
  return (
    <div>
      <TodoInput onAdd={(text) => setTodos([...todos, { text, done: false }])} />
      <TodoList todos={todos} onToggle={handleToggle} />
    </div>
  );
}
```

I could look at this and understand it immediately. That was revolutionary.

## What Changed

### Tooling

2005: Open a text file. Write code. Open browser.

2025: Node.js, npm, webpack/Vite/esbuild, Babel/SWC, TypeScript, ESLint, Prettier, Jest, Playwright...

The productivity gains are real. TypeScript alone has saved me thousands of hours of debugging. But the barrier to entry is higher.

### Complexity

A "simple" React app now involves:
- JSX transpilation
- Module bundling
- Hot module replacement
- Code splitting
- Tree shaking

We've traded runtime complexity for build-time complexity. Whether that's a good trade depends on your perspective.

### Community

The JavaScript community exploded. There are tutorials, courses, conferences, podcasts, YouTube channels, Twitter threads, and documentation for everything.

There's also fatigue. Framework churn. "You're not using Signals? That's so 2024." It's exhausting if you let it be.

## What Stayed the Same

### The DOM Is Still There

Under all the abstractions, we're still manipulating the DOM. React's virtual DOM, Svelte's compilation, Solid's signals—they all eventually call `appendChild` and `setAttribute`.

Understanding the DOM never stops being useful.

### JavaScript Is Still JavaScript

Prototypes, closures, event loop, async/await—the fundamentals haven't changed that much. I still use knowledge from 2005 daily.

```javascript
// This still trips people up
for (var i = 0; i < 5; i++) {
  setTimeout(() => console.log(i), 100);
}
// Logs: 5, 5, 5, 5, 5

// Understanding closures still matters
for (let i = 0; i < 5; i++) {
  setTimeout(() => console.log(i), 100);
}
// Logs: 0, 1, 2, 3, 4
```

### Users Want Fast, Working Software

No one cares what framework you used. They care if the button works when they click it.

2005 me understood this. Sometimes 2025 me forgets it in pursuit of architectural elegance.

## What I've Learned

### Learn Fundamentals First

I'm glad I understood vanilla JavaScript before jQuery. And vanilla DOM before React. The abstractions make more sense when you know what they're abstracting.

### Don't Chase Every New Thing

I skipped Angular 2+ entirely. Didn't hurt my career. Some frameworks stick. Most don't. Invest in the survivors.

### The Best Framework Is Productivity

Vue, React, Svelte, Solid—they all solve the same problems differently. The "best" one is whichever lets your team ship quality software fastest.

For me, that's React. For you, it might be different. That's fine.

### Experience Compounds

Understanding why Backbone existed helps me appreciate React. Understanding jQuery's limitations helps me appreciate TypeScript. The history matters.

## Looking Forward

I have no idea what 2035 will look like. Maybe we'll all be writing Rust that compiles to WebAssembly. Maybe AI will write all the code. Maybe React will still be there.

What I do know: JavaScript isn't going anywhere. The web isn't going anywhere. And there will always be more to learn.

20 years in, I'm still that 13-year-old marveling at what happens on click.

---

*Started coding at 13. Still coding at 34. Still learning something new every week.*
