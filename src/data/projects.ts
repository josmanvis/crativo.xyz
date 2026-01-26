import { Project } from "@/types/project";

export const categories = [
  "All",
  "Apps",
  "Libraries",
  "Tools",
  "Kiosks",
] as const;

export const projects: Project[] = [
  // Apps - Real Projects
  {
    id: "qortr",
    title: "Qortr",
    description:
      "Modern room booking platform for businesses with instant booking, team management, and smart analytics.",
    category: "Apps",
    techStack: ["Next.js", "PostgreSQL", "Prisma", "WebSockets", "REST API", "OAuth 2.0"],
    imageUrl: "/projects/qortr.svg",
    href: "/projects/qortr",
    year: 2024,
    metrics: [
      { label: "Daily Bookings", value: "1,000+" },
      { label: "Teams", value: "2,400+" },
      { label: "Uptime SLA", value: "99.9%" },
      { label: "Price", value: "Free" },
    ],
    longDescription: `You know what's absolutely wild? In 2024, people are still using spreadsheets to book meeting rooms. SPREADSHEETS. Like it's 1997 and we just discovered Excel.

I watched a coworker spend 15 minutes trying to figure out if "Conference Room B" was available at 2pm. She had three browser tabs open, was cross-referencing a Google Sheet, and eventually just walked to the room to check if anyone was in it. That's when I knew something had to change.

**The Problem That Drove Me Insane**

Every room booking solution I found fell into one of two categories:

1. **Enterprise behemoths** that charge per seat, per room, per month, per square foot, per breath you take in the building. Want to add a new meeting room? That's a sales call. Want to integrate with your calendar? That's the premium tier. Want to NOT want to throw your laptop out the window? Sorry, that's the enterprise plan.

2. **"Free" solutions** that are actually just Google Sheets with a prettier font. They work until two people book the same room at the same time, and then it's Thunderdome.

I wanted something in between. Something that was actually free (not "free trial" free, not "free for up to 3 users" free — actually free), but also didn't suck.

So I built it.

**The Journey: From Frustration to 2,400+ Teams**

The first version of Qortr was embarrassingly simple. A list of rooms. A calendar. A "Book" button. I built it in a weekend using Next.js because I was already neck-deep in React at work and didn't want to context-switch.

I showed it to exactly three people. All of them said some version of "cool, but can it do X?" where X was something I hadn't thought of.

*"Can it show me which rooms have a whiteboard?"*

Amenity filters. Added.

*"Can it handle different locations?"*

Multi-location support. Added.

*"Can it stop my coworker from booking the good conference room every single day at 2pm?"*

Fair booking policies. Added. (This one sparked some workplace drama, apparently.)

**What It Actually Does**

**Browse Rooms** — The rooms page shows you everything available with filters for capacity (need a room for 20? we got you), amenities (WiFi, projector, video conferencing, air conditioning, coffee machine, parking, accessibility), and location. Search by name or description. Sort by newest. Real-time availability — if someone books a room while you're looking at it, you'll see it update instantly.

**Instant Booking** — No approval workflows. No "request pending" limbo. You click "Book," you get a confirmation. The room is yours. The whole point is that booking a meeting room should take less time than deciding where to order lunch.

**Team Management** — Invite your whole team. Manage permissions. Share spaces seamlessly. Some people can book anything; some people can only book certain rooms. Admins see everything; regular users see what they need.

**The Developer Experience**

I'm a developer, so I built the developer experience I wished existed.

Full REST API with JSON responses. Every booking, every room, every user — accessible programmatically. Want to build a Slack bot that books rooms? Go for it. Want to integrate with your custom dashboard? Here's the endpoint.

Webhook events for real-time updates. When a booking is created, modified, or cancelled, you get a POST to your URL. Build automations without polling.

OAuth 2.0 authentication because it's 2024 and API keys alone aren't security.

Rate limiting and pagination built-in because I've debugged enough runaway scripts to know that if you don't build guardrails, someone WILL write a loop that calls your API 10,000 times in a minute.

**The Technical Stuff I'm Proud Of**

The real-time availability system was the hardest part. Here's the problem: you have hundreds of rooms across multiple locations, potentially thousands of users, and everyone needs to see the same truth at the same time.

I went with a combination of database-level locking (Postgres row-level locks via Prisma transactions) for writes, and WebSocket broadcasts for reads. When someone books a room:

1. The booking request hits the API
2. We acquire a lock on that room's time slot
3. We check for conflicts (is anyone else already booked?)
4. If clear, we create the booking and release the lock
5. We broadcast the update to all connected clients

Steps 2-4 happen in a transaction. If anything fails, everything rolls back. No half-booked rooms. No race conditions where two people think they got the room.

The tricky part was handling the edge cases:
- What if someone's WebSocket connection drops and they miss an update?
- What if the broadcast fails after the booking succeeds?
- What if a user is on a slow connection and their view is 30 seconds out of date?

The answer to all of these: optimistic UI with server reconciliation. The client assumes actions succeed, but always verifies with the server before committing. If there's a mismatch, we show a friendly "This room was just booked by someone else" message instead of a cryptic error.

**The Numbers**

- **1,000+ daily bookings** — People are actually using this thing
- **2,400+ teams** — From small startups to medium-sized companies
- **99.9% uptime SLA** — I take reliability seriously (and PagerDuty takes my sleep schedule seriously)
- **100% free** — No premium tiers. No "enterprise" upsells. Just... free.

**Why Free?**

Because room booking software shouldn't cost money. It's a solved problem. The algorithms aren't novel. The infrastructure isn't expensive. The only reason existing solutions charge hundreds of dollars per month is because they can.

I run Qortr on a $20/month server. The database costs another $15. That's it. Those numbers could 10x and I'd still be profitable on zero revenue because I don't have a sales team, I don't have a marketing budget, and I don't have investors demanding growth at all costs.

The business model is: there isn't one. I built this because I was annoyed, I shared it because other people were annoyed too, and I keep it running because it's satisfying to see the booking counter tick up.

**What's Next**

I have a Notion board full of feature requests. Some of them are good:
- Calendar sync (Google Calendar, Outlook)
- Mobile app (it's responsive, but a native app would be nicer)
- Recurring bookings (weekly standups shouldn't require 52 separate bookings)
- Room displays (a tablet outside the room showing current/upcoming bookings)

Some of them are... creative:
- *"Can you add a feature where the room automatically unlocks when I arrive?"* (Sir, this is a web app, not a smart lock company)
- *"Can you integrate with my company's time tracking software?"* (Why?)
- *"Can the room change color based on who booked it?"* (I... what?)

I'll get to the good ones eventually. For now, the core experience is solid, the API is comprehensive, and 2,400+ teams seem to agree that it doesn't suck.

That's really all I wanted.`,
    links: [
      { label: "Website", url: "https://www.qortr.com", icon: "external" },
    ],
    gallery: [],
    features: [
      { icon: "⚡", title: "Instant Booking", description: "See availability in real-time. Book with one tap. No waiting, no approval workflows, no conflicts." },
      { icon: "🔍", title: "Smart Filters", description: "Filter by capacity, amenities, location. Find the perfect room for your 20-person presentation or 2-person 1:1." },
      { icon: "👥", title: "Team Management", description: "Invite your team, manage permissions, share spaces seamlessly across your organization." },
      { icon: "🔐", title: "Verified & Secure", description: "All spaces are verified. SOC 2 compliant. GDPR ready. Your data stays yours." },
      { icon: "🔌", title: "REST API", description: "Full API with webhooks, OAuth 2.0, rate limiting. Build integrations, automate workflows." },
      { icon: "💰", title: "100% Free", description: "No premium tiers. No per-seat pricing. No hidden fees. Actually, genuinely free." },
    ],
    previews: [
      { type: "screenshot", src: "/previews/qortr-landing.jpg", alt: "Qortr landing page", caption: "Book spaces, not headaches — the landing page that started it all" },
      { type: "screenshot", src: "/previews/qortr-rooms.jpg", alt: "Qortr room browser", caption: "Browse rooms with filters for capacity, amenities, and location" },
      { type: "screenshot", src: "/previews/qortr-signin.jpg", alt: "Qortr sign-in page", caption: "Clean authentication — 2,400+ teams trust Qortr" },
    ],
    codeSnippet: {
      language: "typescript",
      filename: "BookingAPI.ts",
      code: `// The booking endpoint that handles 1000+ requests/day
// Optimistic locking prevents double-bookings

async function createBooking(req: BookingRequest): Promise<Booking> {
  return await prisma.$transaction(async (tx) => {
    // Check for conflicts with row-level locking
    const conflicts = await tx.booking.findFirst({
      where: {
        roomId: req.roomId,
        status: 'confirmed',
        OR: [
          { startTime: { lt: req.endTime }, endTime: { gt: req.startTime } }
        ]
      },
      lock: { mode: 'forUpdate' }
    });

    if (conflicts) {
      throw new ConflictError('Room is no longer available');
    }

    // Create the booking
    const booking = await tx.booking.create({
      data: {
        ...req,
        status: 'confirmed',
        confirmationCode: generateCode()
      }
    });

    // Notify via websocket (the fun part)
    await broadcastRoomUpdate(req.roomId);
    
    return booking;
  });
}`,
    },
  },
  {
    id: "snaptask",
    title: "SnapTask",
    description:
      "Mobile-first task management platform with real-time messaging, push notifications, and cross-platform support.",
    category: "Apps",
    techStack: ["React Native", "Ruby on Rails", "SendGrid"],
    imageUrl: "/projects/snaptask.svg",
    href: "/projects/snaptask",
    year: 2017,
    metrics: [
      { label: "Platform", value: "iOS/Android" },
      { label: "Features", value: "Real-time" },
    ],
    longDescription: `2017 was a weird time for mobile development. React Native was still the new kid, and half the internet was convinced it was a fad. "Just learn Swift," they said. "Cross-platform never works," they said.

I didn't listen. And honestly? It was a gamble that paid off.

**The Origin Story**

SnapTask started because my team was using three different apps to manage work: Slack for chat, Trello for tasks, and email for... I don't know, suffering? The context switching was killing us. Every time I needed to check on a task, I'd lose 10 minutes falling down a Slack rabbit hole.

The pitch was simple: What if your tasks and your team chat lived in the same place?

**React Native Before It Was Cool**

This was React Native 0.44. There was no Expo. There was no Flipper. There was just you, the Metro bundler, and your faith in the JavaScript gods.

I remember spending three days debugging an issue where the app would crash on Android but only on Samsung devices. Only Samsungs. The culprit? A font that Samsung's version of Android didn't like. The fix? A different font. That's it. Three days.

But here's the thing — we shipped ONE codebase to both app stores. While our competitors were maintaining two separate apps with two separate teams, we were iterating twice as fast with half the people.

**The Architecture That Worked**

The backend was Ruby on Rails because in 2017, Rails was still the "get shit done" framework. (It still is, but people are weird about it now.)

- **ActionCable** for real-time updates — messages, task changes, notifications
- **SendGrid** for email because building email infrastructure is a fool's errand
- **Push notifications** through a unified service that handled both APNs and FCM

The real magic was the sync engine. Every action was optimistic on the client, with a queue of pending changes that would reconcile with the server. You could go offline on the subway, complete a bunch of tasks, and everything would sync when you emerged from the underground.

**What I'd Do Differently**

TypeScript. Dear god, TypeScript. We had JavaScript everywhere, and the number of "undefined is not a function" errors I debugged still haunts me. Also, I'd use GraphQL instead of REST. The over-fetching on mobile was real.

But for 2017? We crushed it. The app was fast, the users were happy, and I learned more about mobile development in one year than I had in the previous five.`,
    links: [
      { label: "Website", url: "https://snaptaskapp.com", icon: "external" },
    ],
    gallery: [],
    codeSnippet: {
      language: "javascript",
      filename: "OfflineSync.js",
      code: `// The offline-first sync engine that saved us countless support tickets
class SyncEngine {
  constructor() {
    this.queue = new PersistentQueue('pending-actions');
    this.isOnline = NetInfo.isConnected;
    
    // Attempt sync whenever we come back online
    NetInfo.addEventListener(state => {
      if (state.isConnected && !this.isOnline) {
        this.processQueue();
      }
      this.isOnline = state.isConnected;
    });
  }

  async performAction(action) {
    // Optimistically apply the action locally
    await this.applyLocally(action);
    
    // Queue for server sync
    await this.queue.push({
      ...action,
      timestamp: Date.now(),
      retries: 0
    });

    // Try to sync immediately if online
    if (this.isOnline) {
      this.processQueue();
    }
  }

  async processQueue() {
    const pending = await this.queue.peek();
    if (!pending) return;

    try {
      await api.sync(pending);
      await this.queue.pop();
      this.processQueue(); // Process next
    } catch (err) {
      if (pending.retries < 3) {
        pending.retries++;
        // Exponential backoff
        setTimeout(() => this.processQueue(), 1000 * pending.retries);
      }
    }
  }
}`,
    },
  },
  {
    id: "stopshop-kiosk",
    title: "Stop & Shop Kiosk",
    description:
      "Interactive kiosk software for grocery stores with product lookup, voice shopping list, and store navigation.",
    category: "Kiosks",
    techStack: ["React.js", "Express.js", "Node.js", "IBM Watson"],
    imageUrl: "/projects/stopshop-kiosk.svg",
    href: "/projects/stopshop-kiosk",
    year: 2021,
    metrics: [
      { label: "Brand", value: "Stop & Shop" },
      { label: "AI", value: "Watson/Dialogflow" },
    ],
    longDescription: `Picture this: It's 2021, and I'm standing in a Stop & Shop in Massachusetts, watching an elderly woman try to find canned tomatoes. She's been wandering for ten minutes. An employee finally points her to aisle 7. She walks to aisle 7. The tomatoes are in aisle 9. The employee was wrong.

This happens thousands of times a day, in thousands of stores. And that's the problem we were trying to solve.

**The Innovation Lab**

I was working at Retail Business Services, the tech arm of Ahold Delhaize (they own Stop & Shop, Giant, Food Lion, and a bunch of other grocery chains). We had this thing called the Innovation Lab — basically a team of developers who got to build experimental stuff that might one day make it into actual stores.

The kiosk project was our baby.

**Voice-First in a Grocery Store**

Here's something nobody tells you about voice interfaces: they're amazing in quiet rooms and absolutely terrible in grocery stores. You've got refrigerator hum, announcement systems, screaming children, and that one guy who's always on speakerphone.

We tested three different speech-to-text services:
- **IBM Watson**: Great accuracy, but the latency was rough
- **Google Dialogflow**: Fast, but struggled with product names
- **Microsoft LUIS**: Middle ground, what we ended up using for intent recognition

The trick was combining them. Watson for the initial transcription (it handled accents better), then LUIS for figuring out what the person actually wanted.

*"Where are the San Marzano tomatoes?"*

That's easy. But what about:

*"You know those uh... the red things for pasta... not sauce, the actual... you cook them... my wife usually gets them..."*

That's a real query we logged. The system figured out they wanted tomatoes. I'm still proud of that.

**The Virtual Keyboard Nobody Wanted (That Everyone Needed)**

Touch screen keyboards suck. There, I said it. But when you're building a kiosk, you need one. So I built **too-bored** — a React virtual keyboard that doesn't make you want to throw the screen across the room.

Big keys. Haptic feedback simulation (screen flash on tap). Auto-capitalization. Swipe to delete. All the stuff that makes typing on glass slightly less painful.

It's now an npm package that other teams at RBS use. Sometimes the side project becomes the main project.

**The Map Feature That Almost Killed Me**

Every store has a different layout. There are 400+ Stop & Shop locations. We needed to show where products are on a map, and the maps had to be accurate to the specific store.

My solution: A store map editor that let managers drag and drop aisles, and a product database that mapped items to aisle locations. When the API returned "Aisle 9, Section B, Shelf 3," the kiosk would actually show you where that was.

The edge cases were brutal. What happens when a store remodels? What if the same product is in two places (seasonal display + regular location)? What if the store is out of stock?

We solved most of them. The remodel thing still haunts me.`,
    links: [],
    gallery: [],
    codeSnippet: {
      language: "javascript",
      filename: "VoiceIntent.js",
      code: `// The voice processing pipeline that handled 50+ intents
// Including my favorite: "where's the bathroom" (not a product, but people ask)

class VoiceProcessor {
  async processUtterance(audioBuffer) {
    // Step 1: Transcribe with Watson (best accuracy for accents)
    const transcript = await watson.speechToText(audioBuffer);
    
    // Step 2: Intent classification with LUIS
    const intent = await luis.predict(transcript);
    
    // Step 3: Entity extraction (product names are tricky)
    const entities = await this.extractEntities(transcript, intent);
    
    // Step 4: Handle the intent
    switch (intent.topIntent) {
      case 'FindProduct':
        return this.handleProductSearch(entities.product);
      
      case 'AddToList':
        return this.handleAddToList(entities.product, entities.quantity);
      
      case 'StoreInfo':
        return this.handleStoreInfo(entities.infoType);
      
      case 'Bathroom': // Yes, this is a real intent
        return { 
          response: "Restrooms are located at the front of the store, near customer service.",
          showMap: true,
          highlight: 'restrooms'
        };
      
      default:
        return this.handleFallback(transcript);
    }
  }

  async extractEntities(transcript, intent) {
    // Product name extraction is HARD
    // "San Marzano tomatoes" vs "tomatoes" vs "the red ones"
    const productMention = await this.fuzzyProductMatch(transcript);
    return {
      product: productMention,
      quantity: this.extractQuantity(transcript) || 1
    };
  }
}`,
    },
  },
  {
    id: "innovation-portal",
    title: "Innovation Portal",
    description:
      "Internal platform for submitting and tracking innovative ideas from pilot to production at Retail Business Services.",
    category: "Apps",
    techStack: ["React.js", "Node.js", "Express.js"],
    imageUrl: "/projects/innovation-portal.svg",
    href: "/projects/innovation-portal",
    year: 2020,
    metrics: [
      { label: "Company", value: "Ahold Delhaize" },
      { label: "Workflow", value: "Pilot to Prod" },
    ],
    longDescription: `Big companies have a problem: good ideas die in email threads.

Someone has a brilliant idea. They tell their manager. The manager says "write it up." They write a doc. The doc goes to a committee. The committee meets monthly. By the time anyone approves anything, the person who had the idea has either left the company or forgotten why they cared.

This is the Innovation Death Spiral, and I watched it kill dozens of genuinely good ideas at Retail Business Services.

**Breaking the Spiral**

The Innovation Portal was our answer. Instead of emailing ideas into the void, employees could submit them directly to a platform where they'd be visible, trackable, and — this is the key part — accountable.

Every idea got a status:
- **Submitted**: Fresh out of someone's brain
- **In Review**: Someone's actually looking at it
- **Pilot**: We're testing it in a real store
- **Production**: It's live, everywhere

And every status change was logged. No more "I submitted this idea six months ago and never heard back." The system sent automatic updates. Managers couldn't hide.

**The Unexpected Politics**

Building the tech was easy. The politics? That was the real project.

Turns out, some managers didn't WANT visibility into their review process. They liked the ambiguity. "We're still evaluating it" is a great way to say "I haven't looked at it and I don't plan to."

We solved this with gentle public shaming. The dashboard showed average review time by department. Suddenly, being the slowest team to review ideas was embarrassing. Review times dropped by 60% in three months.

**Teaching While Building**

This project had another dimension: I was responsible for training co-ops (college students doing internships) on React, Node, and modern web development.

Every feature was a learning opportunity. "Hey, we need to add comments to ideas. You've never built a real-time feature? Great, you're about to learn WebSockets."

Some of those co-ops are now senior engineers at major tech companies. I still get LinkedIn messages from them. That part might be more rewarding than the portal itself.

**The Features That Mattered**

- **Anonymous submission mode**: Sometimes the best ideas come from people who don't want to rock the boat
- **Cross-department visibility**: An idea from IT might solve a problem that Marketing has been fighting for years
- **Pilot tracking**: Real metrics from real stores, not just "we think this might work"
- **The "Champion" system**: Every idea that moved past review got assigned an advocate who was responsible for pushing it forward

**What Happened to It?**

Last I heard, the portal was still running and had processed over 200 ideas, with 30+ making it to production pilots. Not every idea was a winner, but the ones that were? Some of them are now standard features in stores across the country.

Not bad for a side project that started because I was frustrated with email.`,
    links: [],
    gallery: [],
    codeSnippet: {
      language: "typescript",
      filename: "IdeaWorkflow.ts",
      code: `// The state machine that prevented ideas from getting "lost"
// Every transition is logged, and managers get reminders

interface Idea {
  id: string;
  title: string;
  stage: IdeaStage;
  submittedBy: User;
  champion?: User;
  stageHistory: StageTransition[];
  daysInCurrentStage: number;
}

const STAGE_SLA = {
  submitted: 7,    // 7 days to begin review
  review: 14,      // 14 days to make a decision
  pilot: 90,       // 90 days to complete pilot
} as const;

class IdeaWorkflow {
  async transitionStage(idea: Idea, newStage: IdeaStage, actor: User) {
    // Validate the transition is allowed
    if (!this.canTransition(idea.stage, newStage)) {
      throw new InvalidTransitionError(idea.stage, newStage);
    }

    // Log the transition (this is how we track accountability)
    const transition: StageTransition = {
      from: idea.stage,
      to: newStage,
      actor: actor.id,
      timestamp: new Date(),
      daysInPreviousStage: idea.daysInCurrentStage
    };

    await prisma.idea.update({
      where: { id: idea.id },
      data: {
        stage: newStage,
        daysInCurrentStage: 0,
        champion: newStage === 'pilot' ? actor.id : idea.champion,
        stageHistory: { push: transition }
      }
    });

    // Notify relevant parties
    await this.notifyStageChange(idea, transition);
    
    // If moving to pilot, create pilot tracking record
    if (newStage === 'pilot') {
      await this.initializePilot(idea);
    }
  }

  // The "gentle public shaming" feature
  async getReviewMetrics(departmentId: string) {
    const ideas = await prisma.idea.findMany({
      where: { 
        stage: 'review',
        department: departmentId 
      }
    });

    return {
      averageDaysInReview: this.calculateAverage(ideas, 'daysInCurrentStage'),
      overdueCount: ideas.filter(i => i.daysInCurrentStage > STAGE_SLA.review).length,
      // This metric goes on the public dashboard 😈
      ranking: await this.getDepartmentRanking(departmentId)
    };
  }
}`,
    },
  },

  // Libraries - Real NPM Packages
  {
    id: "too-bored",
    title: "too-bored",
    description:
      "Configurable React.js virtual keyboard component used in retail kiosk applications.",
    category: "Libraries",
    techStack: ["React.js", "TypeScript", "NPM"],
    imageUrl: "/projects/too-bored.svg",
    href: "/projects/too-bored",
    year: 2019,
    metrics: [
      { label: "Used in", value: "Beer Kiosk" },
      { label: "Platform", value: "npm" },
    ],
    longDescription: `The name is a pun. "Keyboard" → "too-bored." I'm not sorry.

**Why Build Another Virtual Keyboard?**

Because every virtual keyboard on npm was either:
1. Abandoned since 2016
2. Designed for desktop (tiny keys, no touch optimization)
3. Impossible to style
4. All of the above

I was building kiosk applications for grocery stores. Big touch screens. Fingers of all sizes. Environments where people are in a hurry and slightly annoyed that they have to type anything at all.

The existing solutions weren't cutting it.

**The Design Philosophy**

**Fat fingers first.** Every key is at least 48x48 pixels. I don't care if it means fewer keys per row. If grandma can't hit the 'E' key, the keyboard is broken.

**Visual feedback matters.** When you tap a key, you need to KNOW you tapped it. The key lights up, scales down slightly, and there's a subtle ripple effect. No lag. No guessing.

**Layouts are data.** Want a numeric keypad? Pass a different layout array. Want a keyboard with only letters and a big "SEARCH" button? That's a layout. Want emoji? (Please don't, but) that's also a layout.

**The Beer Kiosk Problem**

The immediate use case was the Beer Kiosk at Stop & Shop. Customers needed to search for beers by name. And beer names are WILD:

- "Lawson's Sip of Sunshine"
- "Heady Topper"
- "Pliny the Elder"
- "Weihenstephaner Hefeweissbier"

Try typing "Weihenstephaner" on a bad virtual keyboard. I'll wait.

too-bored handled this with:
- **Predictive suggestions** that appeared above the keyboard
- **Fuzzy matching** so "weihen" would find "Weihenstephaner"
- **Recent searches** because beer people are creatures of habit

**The Part I'm Proudest Of**

Accessibility. Most virtual keyboards are accessibility nightmares. too-bored announces every key press to screen readers, supports full keyboard navigation (ironically), and works with switch devices.

A kiosk in a grocery store serves EVERYONE. Including people who can't see the screen, or who use alternative input devices, or who need more time. The keyboard had to work for all of them.

**Where It Lives Now**

The company's internal npm registry. It's used in at least four different kiosk applications across RBS brands. Every time I visit a Stop & Shop and see someone typing on a kiosk, I wonder if they're using my keyboard.

They probably don't appreciate how big those keys are. But I do.`,
    links: [
      { label: "npm", url: "https://www.npmjs.com/~vivalavisca", icon: "package" },
    ],
    gallery: [],
    codeSnippet: {
      language: "typescript",
      filename: "Keyboard.tsx",
      code: `// The layout system that makes too-bored actually configurable
// Every key is an object, every row is an array, every layout is rows

interface KeyConfig {
  key: string;
  display?: string;      // What to show (default: key)
  width?: number;        // Multiplier (default: 1)
  action?: 'backspace' | 'enter' | 'shift' | 'space' | 'clear';
}

const QWERTY_LAYOUT: KeyConfig[][] = [
  ['1','2','3','4','5','6','7','8','9','0'].map(k => ({ key: k })),
  ['q','w','e','r','t','y','u','i','o','p'].map(k => ({ key: k })),
  ['a','s','d','f','g','h','j','k','l'].map(k => ({ key: k })),
  [
    { key: 'shift', display: '⇧', width: 1.5, action: 'shift' },
    ...['z','x','c','v','b','n','m'].map(k => ({ key: k })),
    { key: 'backspace', display: '⌫', width: 1.5, action: 'backspace' }
  ],
  [
    { key: 'space', display: 'SPACE', width: 5, action: 'space' },
    { key: 'enter', display: 'SEARCH', width: 2, action: 'enter' }
  ]
];

export function Keyboard({ 
  onInput, 
  layout = QWERTY_LAYOUT,
  theme = 'dark'
}: KeyboardProps) {
  const [shifted, setShifted] = useState(false);

  const handleKey = (config: KeyConfig) => {
    switch (config.action) {
      case 'shift':
        setShifted(s => !s);
        break;
      case 'backspace':
        onInput({ type: 'backspace' });
        break;
      case 'enter':
        onInput({ type: 'submit' });
        break;
      case 'space':
        onInput({ type: 'char', char: ' ' });
        break;
      default:
        const char = shifted ? config.key.toUpperCase() : config.key;
        onInput({ type: 'char', char });
        if (shifted) setShifted(false);
    }
  };

  return (
    <div className={\`keyboard keyboard--\${theme}\`} role="application" aria-label="Virtual keyboard">
      {layout.map((row, i) => (
        <div key={i} className="keyboard__row">
          {row.map((config, j) => (
            <Key 
              key={j} 
              config={config} 
              shifted={shifted}
              onPress={() => handleKey(config)} 
            />
          ))}
        </div>
      ))}
    </div>
  );
}`,
    },
  },
  {
    id: "gappa-comments",
    title: "gappa-comments",
    description:
      "Fully-responsive, configurable threaded comment component with user tagging support.",
    category: "Libraries",
    techStack: ["React.js", "TypeScript", "NPM"],
    imageUrl: "/projects/gappa-comments.svg",
    href: "/projects/gappa-comments",
    year: 2019,
    metrics: [
      { label: "Features", value: "Threading+Tags" },
      { label: "Platform", value: "npm" },
    ],
    longDescription: `"Gappa" is a Hindi/Urdu word that means "chat" or "gossip." It's what my grandmother called it when the aunties would gather and talk for hours. Seemed fitting for a comments component.

**The Problem With Comments**

Building a comment section sounds easy. Text box, submit button, list of comments. Done, right?

Wrong. So wrong.

First, you need threading. Someone replies to a comment, someone replies to that reply, and suddenly you have a 47-level deep conversation about whether water is wet. How deep do you let it go? How do you render it? Indentation? Lines? Collapse after N levels?

Then you need @mentions. Someone types "@" and they expect to see a list of people they can tag. That list needs to be searchable, keyboard-navigable, and it needs to work on mobile where people fat-finger everything.

Then you need editing. And deletion. And moderation. And spam prevention. And emoji reactions. And...

You see where this is going.

**Why I Built It**

The Innovation Portal needed comments. Ideas needed discussion. And every comment library I found either:
- Didn't support threading
- Had @mentions that only worked half the time
- Was so opinionated about styling that it looked terrible in our app
- Required a specific backend structure that didn't match ours

So I built gappa-comments from scratch.

**The Threading Algorithm**

I'm unreasonably proud of this part. Comments are stored flat in the database (just parent_id references), but rendered as a tree. The algorithm builds the tree in O(n) time, handles orphans gracefully, and can limit depth without losing comments.

The collapse behavior is smart: if a thread is deeper than 4 levels, the deep comments collapse into a "View X more replies" button. But if YOU wrote one of those deep comments, it stays expanded so you can see your own contribution.

**The @Mention System**

Type "@" and a dropdown appears. But not immediately — there's a 150ms debounce so we're not querying on every keystroke. The dropdown is positioned intelligently (above if you're near the bottom of the viewport, below otherwise).

The really tricky part: preserving mentions when editing. If you write "Hey @Sarah, check this out" and then edit the comment, the @Sarah mention needs to stay linked. We store mentions as markup in the comment body and parse them on render.

**What I Learned**

- **Virtualization matters**: Comments can get long. A discussion with 200 comments will destroy your scroll performance if you render them all. We virtualize: only the visible comments (plus a buffer) are in the DOM.

- **Optimistic updates with rollback**: Post a comment, see it immediately. If the server rejects it (spam filter, whatever), it smoothly disappears with a toast explaining why.

- **Accessibility is hard but important**: Every interactive element is keyboard accessible. Screen readers announce new comments. The threading structure is described semantically.

**Where It Lives Now**

Still running in the Innovation Portal. Thousands of comments, hundreds of @mentions, and a surprising amount of threading that I never anticipated. Turns out people have a lot of opinions about grocery store innovation.`,
    links: [
      { label: "npm", url: "https://www.npmjs.com/~vivalavisca", icon: "package" },
    ],
    gallery: [],
    codeSnippet: {
      language: "typescript",
      filename: "ThreadedComments.tsx",
      code: `// The O(n) tree-building algorithm I'm unreasonably proud of
// Handles 1000+ comments without breaking a sweat

interface FlatComment {
  id: string;
  parentId: string | null;
  content: string;
  author: User;
  createdAt: Date;
}

interface CommentNode extends FlatComment {
  children: CommentNode[];
  depth: number;
}

function buildCommentTree(
  comments: FlatComment[], 
  currentUserId: string,
  maxDepth = 4
): CommentNode[] {
  // O(n) tree building with a map
  const map = new Map<string, CommentNode>();
  const roots: CommentNode[] = [];

  // First pass: create nodes
  for (const comment of comments) {
    map.set(comment.id, { ...comment, children: [], depth: 0 });
  }

  // Second pass: link parents and children
  for (const comment of comments) {
    const node = map.get(comment.id)!;
    
    if (comment.parentId) {
      const parent = map.get(comment.parentId);
      if (parent) {
        node.depth = parent.depth + 1;
        parent.children.push(node);
      } else {
        // Orphan comment (parent was deleted) - treat as root
        roots.push(node);
      }
    } else {
      roots.push(node);
    }
  }

  // Sort children by date
  const sortChildren = (nodes: CommentNode[]) => {
    nodes.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    nodes.forEach(n => sortChildren(n.children));
  };
  sortChildren(roots);

  return roots;
}

// The smart collapse logic: your comments always show
function shouldCollapse(
  node: CommentNode, 
  maxDepth: number, 
  currentUserId: string
): boolean {
  if (node.depth <= maxDepth) return false;
  if (node.author.id === currentUserId) return false;
  if (hasDescendantByUser(node, currentUserId)) return false;
  return true;
}`,
    },
  },

  // Tools - Real CLI Tools
  {
    id: "ace-cli",
    title: "ace",
    description:
      "Node.js-based CLI for bootstrapping React applications and quickly scaffolding views and components.",
    category: "Tools",
    techStack: ["Node.js", "CLI", "NPM"],
    imageUrl: "/projects/ace-cli.svg",
    href: "/projects/ace-cli",
    year: 2019,
    metrics: [
      { label: "Team", value: "Innovation Lab" },
      { label: "Platform", value: "npm" },
    ],
    longDescription: `Every team eventually builds their own scaffolding CLI. It's like a rite of passage. "We should have a consistent project structure," someone says, and three weeks later there's a CLI that everyone forgets exists.

Ace was different. People actually used it.

**The Problem We Were Solving**

The Innovation Lab was churning out projects. Kiosks, internal tools, experimental apps — we were shipping something new every few months. And every single project started the same way:

1. Create-react-app
2. Delete half the boilerplate
3. Add our standard folder structure
4. Copy the auth setup from the last project
5. Copy the API client from the last project
6. Set up the testing framework
7. Realize we forgot something
8. Copy more stuff

It took 2-3 hours to get a new project to the point where you could actually write features. And invariably, each project was slightly different because someone forgot a step or "improved" something.

**Ace Fixed This**

\`ace init my-project --template kiosk\`

That's it. Two minutes later, you have a fully configured project with:
- Our standard folder structure
- Auth already wired up
- API client configured
- Testing ready to go
- CI/CD pipeline configured
- README with the team's conventions

But the init command was just the beginning.

**The Generators Were The Secret Sauce**

\`ace generate view Dashboard --route /dashboard\`

This creates:
- \`src/views/Dashboard/index.tsx\` — the main component
- \`src/views/Dashboard/Dashboard.test.tsx\` — testing boilerplate
- \`src/views/Dashboard/Dashboard.module.css\` — scoped styles
- Updates \`src/App.tsx\` to add the route

\`ace generate component Button --props variant,size,disabled\`

Creates a component with those props already typed, a Storybook story, and tests that cover the basic prop variations.

**The Templates Were Opinionated (And That Was The Point)**

We didn't try to support every possible use case. Ace generated code that matched OUR conventions:
- Functional components (no classes)
- CSS Modules (no CSS-in-JS)
- React Testing Library (no Enzyme)
- Specific folder structure

If you didn't like our conventions, Ace wasn't for you. But if you were on our team, following our conventions, Ace saved you hours every week.

**The Training Tool Nobody Expected**

Here's the thing I didn't anticipate: Ace became a teaching tool.

New developers would run \`ace generate\` and get a perfectly structured component. They'd look at the generated code and learn our patterns. "Oh, this is how we handle async loading states. This is how we structure tests. This is how we name things."

The generated code was documentation. And unlike actual documentation, it was always up to date because the generators enforced it.

**What I'd Change Now**

Templates would be configurable files, not code. We hardcoded a lot of structure that should have been in template files. Adding a new generator meant writing JavaScript, when it should have been editing a template.

Also: TypeScript from day one. Ace was written in JavaScript because it was 2019 and I was stubborn. The lack of types bit us more than once.`,
    links: [
      { label: "npm", url: "https://www.npmjs.com/~vivalavisca", icon: "package" },
    ],
    gallery: [],
    codeSnippet: {
      language: "typescript",
      filename: "generate.ts",
      code: `// The generator that saved our team hundreds of hours
// Simple concept: templates + data = files

interface GeneratorConfig {
  name: string;
  templates: TemplateFile[];
  prompts?: Prompt[];
  transforms?: Transform[];
}

const componentGenerator: GeneratorConfig = {
  name: 'component',
  prompts: [
    { name: 'props', message: 'Props (comma-separated):', type: 'input' }
  ],
  templates: [
    {
      path: 'src/components/{{pascalCase name}}/index.tsx',
      content: \`import styles from './{{pascalCase name}}.module.css';

interface {{pascalCase name}}Props {
  {{#each props}}
  {{this}}: string;
  {{/each}}
}

export function {{pascalCase name}}({ {{#each props}}{{this}}{{#unless @last}}, {{/unless}}{{/each}} }: {{pascalCase name}}Props) {
  return (
    <div className={styles.root}>
      {/* TODO: Implement {{pascalCase name}} */}
    </div>
  );
}
\`
    },
    {
      path: 'src/components/{{pascalCase name}}/{{pascalCase name}}.test.tsx',
      content: \`import { render, screen } from '@testing-library/react';
import { {{pascalCase name}} } from './index';

describe('{{pascalCase name}}', () => {
  it('renders without crashing', () => {
    render(<{{pascalCase name}} {{#each props}}{{this}}="test" {{/each}}/>);
  });

  {{#each props}}
  it('accepts {{this}} prop', () => {
    render(<{{pascalCase ../name}} {{this}}="custom-value" />);
    // TODO: Add assertion for {{this}}
  });
  {{/each}}
});
\`
    },
    {
      path: 'src/components/{{pascalCase name}}/{{pascalCase name}}.module.css',
      content: \`.root {
  /* TODO: Add styles for {{pascalCase name}} */
}
\`
    }
  ]
};

async function generate(generatorName: string, name: string, options: Record<string, unknown>) {
  const generator = generators[generatorName];
  const answers = await promptForMissing(generator.prompts, options);
  
  const data = {
    name,
    ...answers,
    props: answers.props?.split(',').map((p: string) => p.trim()) || []
  };

  for (const template of generator.templates) {
    const path = render(template.path, data);
    const content = render(template.content, data);
    await writeFile(path, content);
    console.log(\`✓ Created \${path}\`);
  }
}`,
    },
  },
  {
    id: "ticketcloud",
    title: "TicketCloud",
    description:
      "Powerful support ticket system built as the first app for MiPortal online operating system.",
    category: "Kiosks",
    techStack: ["PHP5", "jQuery", "JavaScript", "XML"],
    imageUrl: "/projects/ticketcloud.svg",
    href: "/projects/ticketcloud",
    year: 2014,
    metrics: [
      { label: "Platform", value: "MiPortal" },
      { label: "Type", value: "SaaS" },
    ],
    longDescription: `2014. PHP5. jQuery. XML for data exchange.

I know. I KNOW. But hear me out.

**The Wild Ambition of MiPortal**

MiPortal was insane. The idea was to build an "online operating system" — a web-based platform where businesses could run their entire operation. Think Google Workspace, but if it was built by a college student in the Dominican Republic who had more ambition than experience.

The core concept: every application runs in a "window" within the browser. Multiple windows, draggable, resizable, minimizable. Like Windows 95, but in a browser, and it's 2014 so this was actually kind of impressive.

TicketCloud was the flagship application. If MiPortal was the operating system, TicketCloud was the Microsoft Word — the app that proved the platform worked.

**Building a Ticket System From Scratch**

No frameworks. No libraries (except jQuery, which was basically oxygen in 2014). Just raw PHP, raw SQL, and a lot of hope.

The ticket lifecycle:
1. Customer submits a ticket (or emails it in — we had email parsing!)
2. System auto-assigns based on category rules
3. Agent works the ticket, adding internal notes and public replies
4. Resolution, customer feedback, close

Sounds simple. It wasn't.

**The Features That Made It Work**

**Smart Assignment**: Tickets went to the right person automatically. Billing issues to billing. Technical issues to tech. The rule engine was surprisingly sophisticated for something a 20-year-old built in a dorm room.

**SLA Tracking**: Overdue tickets glowed red. Managers got alerts. There was accountability.

**Cross-Installation Sync**: This was the cool part. A company could have multiple MiPortal installations (one per office, maybe), and tickets could sync between them. Customer creates a ticket in Miami, agent responds from the Santo Domingo office.

The sync used XML because REST wasn't a thing yet (or at least, I hadn't heard of it). We had a custom XML schema for tickets. Looking back, it was insane. At the time, it felt cutting-edge.

**The Technical Horrors I Committed**

SQL injection was... not well prevented. I learned about prepared statements about six months after launch. We were lucky nobody exploited it.

The codebase had no tests. Zero. Manual testing only. Every deploy was a prayer.

Version control was "copy the folder and add a date to the name." We lost code more than once.

**What I Learned**

Everything. I learned everything on this project.

How to build a real product. How to deal with actual users who find bugs you never imagined. How to deploy and maintain software over time. How to debug production issues at 2am because someone can't see their tickets.

TicketCloud was held together with duct tape and determination. It was my first real software project. And despite all its flaws, it worked. Businesses used it. Tickets got resolved. Customers got helped.

That's more than most first projects can say.`,
    links: [],
    gallery: [],
    codeSnippet: {
      language: "php",
      filename: "TicketHandler.php",
      code: `<?php
// This is ACTUAL 2014-ERA CODE (slightly cleaned up)
// Don't judge me. We all started somewhere.

class TicketHandler {
    private $db;
    
    public function createTicket($data) {
        // 2014 me didn't know about prepared statements yet
        // THIS IS BAD DON'T DO THIS
        $title = mysql_real_escape_string($data['title']);
        $body = mysql_real_escape_string($data['body']);
        $email = mysql_real_escape_string($data['email']);
        
        // Auto-assign based on category
        $category = $this->categorize($title . ' ' . $body);
        $assignee = $this->getAssigneeForCategory($category);
        
        $sql = "INSERT INTO tickets (title, body, email, category, assignee, status, created_at)
                VALUES ('$title', '$body', '$email', '$category', '$assignee', 'open', NOW())";
        
        mysql_query($sql);
        $ticketId = mysql_insert_id();
        
        // Send confirmation email
        $this->sendConfirmation($email, $ticketId, $title);
        
        // Notify the assignee
        $this->notifyAgent($assignee, $ticketId);
        
        // If multi-installation, sync to master
        if (defined('SYNC_MASTER') && SYNC_MASTER) {
            $this->syncToMaster($ticketId);
        }
        
        return $ticketId;
    }
    
    // The XML sync that kept me up at night
    private function syncToMaster($ticketId) {
        $ticket = $this->getTicket($ticketId);
        
        $xml = new SimpleXMLElement('<ticket/>');
        $xml->addChild('id', $ticket['id']);
        $xml->addChild('title', htmlspecialchars($ticket['title']));
        $xml->addChild('body', htmlspecialchars($ticket['body']));
        $xml->addChild('status', $ticket['status']);
        $xml->addChild('source_installation', INSTALLATION_ID);
        
        $ch = curl_init(MASTER_SYNC_URL);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $xml->asXML());
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/xml']);
        curl_exec($ch);
        curl_close($ch);
        
        // Error handling? What's that?
        // (2014 me was optimistic)
    }
}`,
    },
  },

  // PROJAX - Project Management Tool
  {
    id: "projax",
    title: "PROJAX",
    description:
      "Cross-platform project management dashboard for managing local development projects across different tech stacks.",
    category: "Tools",
    techStack: ["Node.js", "Electron", "Express.js", "CLI"],
    imageUrl: "/projects/projax.svg",
    href: "/projects/projax",
    year: 2024,
    metrics: [
      { label: "npm Downloads", value: "8,700+" },
      { label: "Monthly", value: "1,750+" },
    ],
    longDescription: `I have too many projects. Like, way too many.

My Developer folder is a graveyard of good intentions. Half-finished ideas, client work from 2019, experiments that made sense at 2am, and at least three folders called "test" that I'm afraid to delete.

At last count: 50+ projects. Most of them have some combination of uncommitted changes, running dev servers, or dependencies that haven't been updated since the Obama administration.

**The Breaking Point**

I was working on a project when my port got stolen. Not by a hacker — by MYSELF. I had a dev server running on port 3000 from some project I'd forgotten about, and when I tried to start my current project, it just failed silently.

Fifteen minutes of debugging later: "Oh, right, I left that other thing running from Tuesday."

This happened at least once a week. I needed a system.

**What Projax Does**

Think of it as Mission Control for your local development environment.

\`projax list\` shows every project, what's running, what has uncommitted changes, and what port each thing is using. At a glance, I can see:

- **qortr** — Running on port 3000, 3 uncommitted files
- **crativo.xyz** — Running on port 3001, clean
- **that-thing-from-tuesday** — Not running, but has 47 uncommitted files (oops)

\`projax run my-project\` starts the dev server with smart port allocation. If 3000 is taken, it finds the next available port and remembers it.

\`projax status\` gives me the big picture: total projects, how many are dirty, what's consuming ports.

**The Multiple Interfaces Were Intentional**

CLI for quick queries. \`projax list --dirty\` when I'm in the terminal and just need to know.

TUI (terminal UI) for browsing. Full-screen interface with vim keybindings. \`j\` and \`k\` to navigate, \`o\` to open in editor, \`r\` to run.

Desktop app for when I'm feeling fancy. Lives in the menu bar, shows me what's running at a glance.

VS Code extension because I live in VS Code and switching to terminal is friction.

All of them share the same core library. Write the detection logic once, render it four different ways.

**The Port Detection Rabbit Hole**

I thought port detection would be easy. It was not.

Ports can be configured in:
- package.json scripts (\`--port 3000\`)
- Config files (vite.config.ts, next.config.js)
- .env files
- Hardcoded in source code
- Or just... the framework default

Vite defaults to 5173. Next.js defaults to 3000. Angular defaults to 4200. Every framework has its own opinion, and my job was to figure out what each project was doing.

The detection algorithm is now about 400 lines of code and handles like 90% of cases. The other 10%? Projects where someone got creative with port configuration. Those people are agents of chaos.

**The Git Integration That Kept Growing**

It started as "show me uncommitted changes." Simple, right?

Then: "Actually, show me if I'm ahead or behind the remote."

Then: "Show me the branch name."

Then: "Show me the last commit message."

Now Projax knows more about my git repos than I do. Which is actually the point.

**What's Next**

I want to add:
- Automatic dependency update checking
- "Archive" detection (projects that haven't been touched in 6 months)
- One-click cleanup (delete node_modules to reclaim disk space)
- Quick switching between projects in the TUI

But honestly? It already does what I need. My port conflicts are gone. My uncommitted changes are visible. I can find projects I forgot existed.

**The Numbers**

8,700+ npm downloads and counting. Turns out other developers have messy Developer folders too.

Sometimes the best tool is the one that solves YOUR problem, exactly the way YOU need it solved.`,
    links: [
      { label: "Website", url: "https://projax.dev", icon: "external" },
    ],
    gallery: [],
    features: [
      { icon: "📋", title: "Project List", description: "See all your projects at a glance — what's running, what has uncommitted changes, what port each is using." },
      { icon: "🚀", title: "Smart Port Allocation", description: "Automatically finds available ports. Never fight with 'port already in use' again." },
      { icon: "🔍", title: "Git Status", description: "Branch name, uncommitted files, ahead/behind remote — without cd-ing into each folder." },
      { icon: "🖥️", title: "Multiple Interfaces", description: "CLI for quick queries, TUI for browsing, desktop app for always-on monitoring, VS Code extension for IDE integration." },
      { icon: "⚡", title: "Zero Config", description: "Point it at your Developer folder and it figures everything out. No setup required." },
      { icon: "🧹", title: "Cleanup Tools", description: "Find and delete old node_modules to reclaim disk space." },
    ],
    previews: [
      { type: "demo", src: "/previews/projax-1.svg", alt: "Projax CLI demo", caption: "Your entire Developer folder at a glance" },
    ],
    codeSnippet: {
      language: "typescript",
      filename: "PortDetector.ts",
      code: `// The port detection that handles 90% of cases
// (The other 10% are crimes against configuration)

interface PortInfo {
  configured: number[];    // Explicitly set in config
  conventional: number[];  // Framework defaults
  running: number[];       // Currently bound
}

async function detectPorts(projectPath: string): Promise<PortInfo> {
  const pkg = await readPackageJson(projectPath);
  const scripts = pkg?.scripts || {};
  
  const configured: Set<number> = new Set();
  
  // 1. Check scripts for --port arguments
  for (const script of Object.values(scripts)) {
    const match = script.match(/--port[=\s]+(\d+)/i);
    if (match) configured.add(parseInt(match[1]));
  }
  
  // 2. Check config files
  const configPorts = await Promise.all([
    extractFromViteConfig(projectPath),
    extractFromNextConfig(projectPath),
    extractFromWebpackConfig(projectPath),
  ]);
  configPorts.flat().forEach(p => configured.add(p));
  
  // 3. Check .env files
  const envPorts = await extractFromEnvFiles(projectPath);
  envPorts.forEach(p => configured.add(p));
  
  // 4. Apply convention if nothing configured
  let conventional: number[] = [];
  if (configured.size === 0) {
    conventional = inferFromFramework(scripts);
  }
  
  // 5. Check what's actually running
  const allPorts = [...configured, ...conventional];
  const running = await checkRunningPorts(allPorts, projectPath);
  
  return {
    configured: [...configured],
    conventional,
    running
  };
}

function inferFromFramework(scripts: Record<string, string>): number[] {
  const text = JSON.stringify(scripts).toLowerCase();
  
  if (text.includes('vite')) return [5173];
  if (text.includes('next')) return [3000];
  if (text.includes('nuxt')) return [3000];
  if (text.includes('angular')) return [4200];
  if (text.includes('gatsby')) return [8000];
  if (text.includes('astro')) return [4321];
  if (text.includes('remix')) return [3000];
  
  // Generic Node.js
  if (text.includes('node ') || text.includes('nodemon')) return [3000];
  
  return [];
}

async function checkRunningPorts(ports: number[], projectPath: string): Promise<number[]> {
  const running: number[] = [];
  
  for (const port of ports) {
    try {
      // lsof tells us what's using the port
      const { stdout } = await exec(\`lsof -i :\${port} -t\`);
      if (stdout.trim()) {
        // Check if it's OUR project
        const pid = parseInt(stdout.trim().split('\\n')[0]);
        const cwd = await getProcessCwd(pid);
        if (cwd.includes(projectPath)) {
          running.push(port);
        }
      }
    } catch {
      // Port not in use
    }
  }
  
  return running;
}`,
    },
  },

  // More Libraries - NPM Packages
  {
    id: "zeebra",
    title: "zeebra",
    description:
      "Performant z-index management library with virtual z-stack recycling for complex UI layering.",
    category: "Libraries",
    techStack: ["TypeScript", "React", "NPM"],
    imageUrl: "/projects/zeebra.svg",
    href: "/projects/zeebra",
    year: 2024,
    metrics: [
      { label: "Focus", value: "Performance" },
      { label: "Platform", value: "npm" },
    ],
    longDescription: `\`z-index: 9999\`

We've all done it. Don't lie.

You need a modal to appear above a dropdown. The dropdown is at z-index 10. So you make the modal z-index 100. Then someone adds a tooltip that needs to appear above both. z-index 1000. Then a notification system. z-index 10000. Then another modal that appears OVER the first modal.

Before you know it, you have z-index values that look like phone numbers.

**The Problem Is Worse Than You Think**

Z-index issues are notoriously hard to debug. Elements disappear behind other elements and nobody knows why. Stack contexts are created in ways that seem random. And everyone's solution is "just make the number bigger."

I was debugging a modal that wouldn't appear above a dropdown. The modal had z-index: 9999. The dropdown had z-index: 10. By all logic, the modal should win.

But the dropdown was inside a transformed element. Transforms create new stacking contexts. The modal wasn't even in the same stacking context as the dropdown. The numbers were meaningless.

That's when I decided: I'm never debugging z-index again.

**How Zeebra Works**

Instead of hardcoding z-index values, you ask Zeebra for one:

\`\`\`tsx
const zIndex = useZIndex('modal');
\`\`\`

Zeebra knows that modals should be above dropdowns, which should be above tooltips, which should be above base content. It returns the right value automatically.

When your component unmounts, Zeebra recycles the z-index. This is the "virtual z-stack" part — we're not accumulating infinite z-indices, we're reusing them.

**The Layer Priority System**

You define priorities once:

\`\`\`tsx
<ZIndexProvider priorities={['base', 'dropdown', 'tooltip', 'modal', 'notification']}>
\`\`\`

Every layer gets a priority. Zeebra ensures higher-priority layers always appear above lower-priority ones, even if they're in different parts of the component tree.

The actual z-index values are implementation details. You never see them. You never hardcode them. They just work.

**The Gotchas I Had To Handle**

**Nested stacking contexts**: If a parent creates a new stacking context (opacity, transform, etc.), children are trapped in it. Zeebra detects this and warns you.

**Dynamic content**: A notification appears, then another, then another. Each needs a unique z-index within the notification layer. Zeebra handles sub-prioritization within layers.

**Server rendering**: z-index needs to be consistent between server and client. Zeebra uses deterministic ID generation so hydration doesn't cause flickers.

**Why "Zeebra"?**

Z-index. Z-stack. Zebra has a Z and stripes are like layers.

Look, naming is hard. At least it's memorable.`,
    links: [
      { label: "npm", url: "https://www.npmjs.com/package/zeebra", icon: "package" },
    ],
    gallery: [],
    codeSnippet: {
      language: "typescript",
      filename: "zeebra.tsx",
      code: `// No more z-index: 99999
// Just ask for a layer and trust the system

import { createContext, useContext, useState, useCallback, useEffect } from 'react';

type LayerPriority = 'base' | 'dropdown' | 'tooltip' | 'modal' | 'notification';

interface ZIndexState {
  layers: Map<string, number>;
  allocate: (id: string, priority: LayerPriority) => number;
  release: (id: string) => void;
}

const PRIORITY_RANGES: Record<LayerPriority, [number, number]> = {
  base:         [1, 99],
  dropdown:     [100, 199],
  tooltip:      [200, 299],
  modal:        [300, 399],
  notification: [400, 499],
};

function createZIndexManager(): ZIndexState {
  const layers = new Map<string, number>();
  const usedInRange = new Map<LayerPriority, Set<number>>();

  // Initialize used sets
  for (const priority of Object.keys(PRIORITY_RANGES)) {
    usedInRange.set(priority as LayerPriority, new Set());
  }

  return {
    layers,
    
    allocate(id: string, priority: LayerPriority): number {
      // Already allocated? Return existing
      if (layers.has(id)) return layers.get(id)!;

      const [min, max] = PRIORITY_RANGES[priority];
      const used = usedInRange.get(priority)!;

      // Find first available in range
      for (let z = min; z <= max; z++) {
        if (!used.has(z)) {
          used.add(z);
          layers.set(id, z);
          return z;
        }
      }

      // Range exhausted - this shouldn't happen in practice
      console.warn(\`zeebra: \${priority} layer range exhausted\`);
      return max;
    },
    
    release(id: string): void {
      const z = layers.get(id);
      if (z === undefined) return;

      // Find which priority this belonged to
      for (const [priority, [min, max]] of Object.entries(PRIORITY_RANGES)) {
        if (z >= min && z <= max) {
          usedInRange.get(priority as LayerPriority)!.delete(z);
          break;
        }
      }

      layers.delete(id);
    }
  };
}

// The hook that makes it all easy
export function useZIndex(priority: LayerPriority): number {
  const manager = useContext(ZIndexContext);
  const [id] = useState(() => \`zeebra-\${Math.random().toString(36).slice(2)}\`);
  const [zIndex, setZIndex] = useState<number>(0);

  useEffect(() => {
    const z = manager.allocate(id, priority);
    setZIndex(z);

    return () => manager.release(id);
  }, [id, priority, manager]);

  return zIndex;
}`,
    },
  },
  {
    id: "floatnote",
    title: "floatnote",
    description:
      "Transparent always-on-top drawing and note-taking overlay for macOS with annotation tools.",
    category: "Libraries",
    techStack: ["Electron", "JavaScript", "macOS"],
    imageUrl: "/projects/floatnote.svg",
    href: "/projects/floatnote",
    year: 2024,
    metrics: [
      { label: "npm Downloads", value: "475+" },
      { label: "Platform", value: "macOS" },
    ],
    longDescription: `I was on a video call, trying to explain a UI bug. "No, not that button, the one below it. No, the OTHER one below it. The one that says... no, scroll up... no, too far..."

This happens constantly. Whether it's pair programming, design reviews, or debugging sessions, pointing at things on a shared screen is HARD.

That's when I wished I could just... draw on my screen.

**The Idea**

An invisible overlay that sits on top of everything. Always on top. When you need to annotate something, you draw on it. When you're done, it disappears.

Like one of those football telestrators, but for your Mac.

**Building With Electron (Again)**

I know, I know, Electron apps are big. But for this use case, it's perfect. The app is a transparent, frameless, always-on-top window that covers your entire screen. You can click through it when you're not drawing, and it captures input when you are.

The drawing itself is just canvas operations:
- Freehand drawing with variable stroke width
- Straight lines (hold Shift)
- Circles and rectangles (for highlighting)
- Text annotations
- An eraser

Colors are picked from a floating palette that appears when you hit a hotkey.

**The Transparency Trick**

Making an Electron window transparent is easy. Making it CLICK-THROUGH is harder.

The solution is \`setIgnoreMouseEvents(true, { forward: true })\`. This tells the window to ignore mouse events but forward them to whatever is below. When you want to draw, you toggle this off.

The toggle is a global hotkey. Hit \`Cmd+Shift+D\` and suddenly you can draw. Hit it again and you're back to normal.

**The Screenshot Feature Nobody Expected**

Originally, drawings were ephemeral. Draw, explain, clear, done.

But people kept asking: "Can I save this?" So I added a screenshot feature. It captures your screen WITH your annotations, so you can share a screenshot of exactly what you were pointing at.

This turned out to be the killer feature. Bug reports with arrows pointing at the problem. Design feedback with circles around the issues. Documentation with highlighted areas.

**What I Use It For**

- **Code reviews**: Drawing arrows to show data flow
- **Bug reports**: Circling the broken thing
- **Teaching**: Annotating examples as I explain them
- **Design feedback**: Marking up mockups in real-time

It's become one of those tools I don't think about until I'm on a computer that doesn't have it. Then I REALLY miss it.

**The Traction**

475+ npm downloads since launch. People really do want to draw on their screens.`,
    links: [
      { label: "npm", url: "https://www.npmjs.com/package/floatnote", icon: "package" },
      { label: "GitHub", url: "https://github.com/josmanvis/floatnote", icon: "github" },
    ],
    gallery: [],
    features: [
      { icon: "🎨", title: "Draw Anywhere", description: "Freehand drawing on top of any application. Circles, arrows, text — whatever you need." },
      { icon: "👆", title: "Click-Through", description: "The overlay is invisible until you need it. Cmd+Shift+D toggles draw mode." },
      { icon: "📸", title: "Screenshot + Annotations", description: "Capture your screen WITH your drawings. Perfect for bug reports." },
      { icon: "🎯", title: "Precision Tools", description: "Straight lines with Shift, shapes for highlighting, text for callouts." },
      { icon: "🌈", title: "Color Picker", description: "Quick color palette appears when you need it, disappears when you don't." },
      { icon: "🖥️", title: "macOS Native", description: "Built with Electron, feels like a native app. Lives in your menu bar." },
    ],
    previews: [
      { type: "demo", src: "/previews/floatnote-1.svg", alt: "floatnote annotation demo", caption: "Point at exactly what you mean" },
      { type: "demo", src: "/previews/floatnote-2.svg", alt: "Code review with floatnote", caption: "Perfect for code reviews and debugging" },
    ],
    codeSnippet: {
      language: "typescript",
      filename: "overlay.ts",
      code: `// The transparency + click-through dance
// This is the magic that makes floatnote work

import { BrowserWindow, globalShortcut, screen } from 'electron';

let overlayWindow: BrowserWindow | null = null;
let isDrawMode = false;

function createOverlay() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  overlayWindow = new BrowserWindow({
    width,
    height,
    x: 0,
    y: 0,
    transparent: true,           // See-through
    frame: false,                // No window chrome
    alwaysOnTop: true,           // Always visible
    skipTaskbar: true,           // Don't show in dock
    hasShadow: false,            // No shadow (it's invisible!)
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  // Start in click-through mode
  overlayWindow.setIgnoreMouseEvents(true, { forward: true });

  overlayWindow.loadFile('overlay.html');

  // Global hotkey to toggle draw mode
  globalShortcut.register('CommandOrControl+Shift+D', toggleDrawMode);
}

function toggleDrawMode() {
  isDrawMode = !isDrawMode;

  if (isDrawMode) {
    // Capture mouse events - we're drawing now
    overlayWindow?.setIgnoreMouseEvents(false);
    overlayWindow?.webContents.send('draw-mode', true);
    
    // Show the toolbar
    overlayWindow?.webContents.send('show-toolbar');
  } else {
    // Click-through mode - window is invisible again
    overlayWindow?.setIgnoreMouseEvents(true, { forward: true });
    overlayWindow?.webContents.send('draw-mode', false);
  }
}

// Screenshot with annotations
async function captureWithAnnotations(): Promise<Buffer> {
  // Temporarily hide the toolbar
  overlayWindow?.webContents.send('hide-toolbar');
  
  await sleep(100); // Wait for render
  
  // Capture the SCREEN (not the window)
  const sources = await desktopCapturer.getSources({
    types: ['screen'],
    thumbnailSize: screen.getPrimaryDisplay().size
  });
  
  const screenCapture = sources[0].thumbnail;
  
  // Now capture our overlay
  const overlayCapture = await overlayWindow?.webContents.capturePage();
  
  // Composite them together
  const combined = await compositeImages(screenCapture, overlayCapture);
  
  overlayWindow?.webContents.send('show-toolbar');
  
  return combined.toPNG();
}`,
    },
  },
  {
    id: "pubsafe",
    title: "pubsafe",
    description:
      "CLI tool to check if sensitive files in your coding projects are properly gitignored.",
    category: "Tools",
    techStack: ["Node.js", "TypeScript", "CLI", "Ink"],
    imageUrl: "/projects/pubsafe.svg",
    href: "/projects/pubsafe",
    year: 2025,
    metrics: [
      { label: "npm Downloads", value: "340+" },
      { label: "Focus", value: "Security" },
    ],
    longDescription: `I almost published my Stripe API keys to npm.

It was 11 PM on a Friday. I'd been polishing a library for weeks. Tests passing, docs written, everything looking good. I ran \`npm publish\`, went to bed feeling accomplished.

The next morning: an email from GitHub. "A secret was detected in a public repository."

The key was in a \`.env.local\` file. A file I'd added to \`.gitignore\`. But here's the thing — **npm doesn't read .gitignore**. It has its own rules, and those rules did not exclude my secrets.

I rotated the key immediately. Deprecated that npm version. Panicked for about an hour. Then I started building pubsafe.

**The Problem Is More Common Than You'd Think**

npm's file inclusion rules are... complicated:
- If you have a \`.npmignore\`, it uses that (and ignores \`.gitignore\` entirely)
- If you have a \`files\` field in package.json, it uses that as a whitelist
- But it ALWAYS includes certain files like package.json
- And it has default exclusions for things like node_modules

Most developers don't know these rules. They assume .gitignore applies everywhere. It doesn't.

**What pubsafe Does**

It's simple: scan your project for sensitive files, check if they're properly excluded from npm, and warn you if they're not.

\`\`\`bash
$ npx pubsafe

🔍 Scanning for sensitive files...

🚨 EXPOSED
✗ .env — NOT in .npmignore (will be published!)
✗ config/secrets.json — NOT in .npmignore (will be published!)

⚠️  WARNINGS
✗ test/fixtures/users.json — May contain PII

✓ 3 sensitive files properly ignored

Run 'pubsafe --fix' to add missing entries to .npmignore
\`\`\`

**The Pattern Database**

pubsafe knows what "sensitive" means:
- Environment files: \`.env\`, \`.env.*\`, \`env.local\`
- Credential files: anything with "credentials", "secrets", "keys" in the name
- Key files: \`*.pem\`, \`*.key\`, \`id_rsa\`
- Database files: \`*.sqlite\`, \`*.db\`
- Cloud configs: \`.aws/*\`, \`.gcloud/*\`

Each pattern has a severity level. A \`.env\` file in your root is CRITICAL — that's almost certainly secrets. A \`users.json\` in test fixtures is a WARNING — it might be sensitive, worth checking.

**The Fix Feature**

\`pubsafe --fix\` automatically adds missing entries to your \`.npmignore\`. It's careful about it:
- Creates the file if it doesn't exist
- Adds a comment explaining what was added
- Doesn't duplicate entries

**The CI Integration**

\`pubsafe --ci\` runs in CI mode — no interactive UI, exits with code 1 if any critical issues are found. Add it to your prepublish hook:

\`\`\`json
"prepublishOnly": "pubsafe --ci && npm run build"
\`\`\`

Now you can't accidentally publish secrets. The CI will fail. Your future self will thank you.

**What I Learned From Building It**

1. **npm's file handling is confusing**: I had to read the docs multiple times to understand it. If I didn't get it, others won't either.

2. **Security tools need to be convenient**: If pubsafe was hard to use, nobody would run it. Making it a single npx command was essential.

3. **Fixing is better than warning**: The \`--fix\` flag is the killer feature. People don't want to know about problems, they want problems solved.

Don't publish your secrets. Run pubsafe first.

**Early Traction**

340+ downloads in the first month. Apparently I'm not the only one who's been burned by npm's file inclusion rules.`,
    links: [
      { label: "npm", url: "https://www.npmjs.com/package/pubsafe", icon: "package" },
    ],
    gallery: [],
    features: [
      { icon: "🔍", title: "Smart Detection", description: "Knows what files are sensitive — .env, credentials, keys, databases — and checks if npm will publish them." },
      { icon: "🛡️", title: "Pre-Publish Safety", description: "Run before npm publish to catch exposed secrets. Never wake up to 'secret detected' emails again." },
      { icon: "🔧", title: "Auto-Fix", description: "pubsafe --fix automatically adds missing entries to your .npmignore." },
      { icon: "⚡", title: "Zero Config", description: "npx pubsafe just works. No setup, no config files, no API keys." },
      { icon: "🤖", title: "CI/CD Ready", description: "pubsafe --ci for automated pipelines. Non-zero exit on critical issues." },
      { icon: "📋", title: "Clear Reports", description: "Shows exactly what's exposed, what's safe, and what to do about it." },
    ],
    previews: [
      { type: "demo", src: "/previews/pubsafe-1.svg", alt: "pubsafe scan results", caption: "Catch exposed secrets before npm publish" },
    ],
    codeSnippet: {
      language: "typescript",
      filename: "scanner.ts",
      code: `// The core scanning logic
// Find sensitive files → Check if npm will publish them → Report

interface Pattern {
  glob: string;
  name: string;
  severity: 'critical' | 'warning' | 'info';
}

const SENSITIVE_PATTERNS: Pattern[] = [
  // Critical - definitely secrets
  { glob: '**/.env', name: 'Environment file', severity: 'critical' },
  { glob: '**/.env.*', name: 'Environment file', severity: 'critical' },
  { glob: '**/credentials*.json', name: 'Credentials', severity: 'critical' },
  { glob: '**/secrets*.json', name: 'Secrets file', severity: 'critical' },
  { glob: '**/*.pem', name: 'PEM key', severity: 'critical' },
  { glob: '**/id_rsa*', name: 'SSH key', severity: 'critical' },
  
  // Warnings - might be sensitive
  { glob: '**/fixtures/**/*.json', name: 'Test fixture', severity: 'warning' },
  { glob: '**/*.sqlite*', name: 'SQLite database', severity: 'warning' },
  { glob: '**/*.log', name: 'Log file', severity: 'warning' },
];

async function scan(projectPath: string): Promise<ScanResult> {
  const npmIgnore = await getNpmIgnoreRules(projectPath);
  const result: ScanResult = { exposed: [], ignored: [], warnings: [] };

  for (const pattern of SENSITIVE_PATTERNS) {
    const matches = await glob(pattern.glob, { cwd: projectPath, dot: true });

    for (const file of matches) {
      const willPublish = !npmIgnore.ignores(file);

      if (willPublish) {
        if (pattern.severity === 'critical') {
          result.exposed.push({ file, ...pattern });
        } else {
          result.warnings.push({ file, ...pattern });
        }
      } else {
        result.ignored.push({ file, ...pattern });
      }
    }
  }

  return result;
}

async function getNpmIgnoreRules(projectPath: string): Promise<Ignore> {
  const ig = ignore();

  // npm's default exclusions
  ig.add(['node_modules', '.git', '*.swp', '.DS_Store', 'npm-debug.log']);

  // Check for .npmignore
  const npmignorePath = join(projectPath, '.npmignore');
  if (await exists(npmignorePath)) {
    ig.add(await readFile(npmignorePath, 'utf-8'));
  } else {
    // Fall back to .gitignore if no .npmignore
    const gitignorePath = join(projectPath, '.gitignore');
    if (await exists(gitignorePath)) {
      ig.add(await readFile(gitignorePath, 'utf-8'));
    }
  }

  // Check for "files" field in package.json (whitelist mode)
  const pkg = await readPackageJson(projectPath);
  if (pkg?.files) {
    // In whitelist mode, invert the logic
    // Only files matching the whitelist are included
    return createWhitelistIgnore(pkg.files);
  }

  return ig;
}`,
    },
  },
  {
    id: "toolbench",
    title: "toolbench",
    description:
      "Reusable development tools library for React applications with debugging and console utilities.",
    category: "Libraries",
    techStack: ["React", "TypeScript", "SCSS", "Vite"],
    imageUrl: "/projects/toolbench.svg",
    href: "/projects/toolbench",
    year: 2024,
    metrics: [
      { label: "Framework", value: "React 18+" },
      { label: "Platform", value: "npm" },
    ],
    longDescription: `React DevTools is great. But it's in a separate panel. I have to switch tabs. Sometimes I forget to close it and ship it to production (okay, that only happened once).

I wanted dev tools IN my app. Right there. Visible while I'm looking at the thing I'm debugging.

**The Floating Dev Panel**

Toolbench adds a little floating panel to your app (in development only, obviously). It shows:

- **State**: All useState values, updating in real-time
- **Props**: What's being passed to the current component
- **Renders**: How many times the component has rendered
- **Performance**: Last render time in milliseconds

The panel is draggable, collapsible, and disappears completely in production builds.

**The Console Enhancements**

I added some utilities that make console.log actually useful:

\`\`\`tsx
import { devLog, devTable, devGroup } from 'toolbench';

// Pretty-printed with timestamp and component name
devLog('User clicked button', { userId: 123 });

// Table format for arrays of objects
devTable(users);

// Grouped logs that can be collapsed
devGroup('API Response', () => {
  devLog('Status', response.status);
  devLog('Data', response.data);
});
\`\`\`

All of these NO-OP in production. You can leave them in your code without worrying about console spam in prod.

**The "Why Did This Render?" Feature**

React re-renders are tricky. Sometimes you're not sure WHY something re-rendered. Toolbench tracks this:

\`\`\`tsx
useWhyDidYouRender('MyComponent', { props, state });
\`\`\`

When the component re-renders, it logs exactly what changed. "Re-rendered because props.onClick changed" or "Re-rendered because state.count changed."

This has saved me hours of debugging unnecessary re-renders.

**The Performance Monitor**

A tiny overlay that shows:
- FPS (frames per second)
- Memory usage
- Network requests in flight

It's like the performance tab in Chrome DevTools, but always visible. I use it to catch performance regressions early — if my app drops below 60fps while I'm developing, I notice immediately.

**Why Another Dev Tools Library?**

Because the ones that exist are either too heavy (adding 500KB to your bundle) or too opinionated (forcing a specific debugging workflow).

Toolbench is modular. Import only what you use. The floating panel is like 8KB. The console utilities are tree-shakeable down to individual functions.

And it's designed for MY workflow. I want to see state while looking at my UI. I want to know why things re-render. I want performance visibility without switching tabs.

Maybe your workflow is different. That's fine. But if it's like mine, toolbench might just become your favorite dev dependency.`,
    links: [
      { label: "npm", url: "https://www.npmjs.com/package/toolbench", icon: "package" },
    ],
    gallery: [],
    codeSnippet: {
      language: "typescript",
      filename: "devtools.tsx",
      code: `// The floating dev panel that I can't live without
// Shows state, props, render count, and performance in-app

import { useState, useEffect, useRef } from 'react';

interface DevToolsProps {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  initiallyExpanded?: boolean;
}

export function DevTools({ 
  position = 'bottom-right',
  initiallyExpanded = false 
}: DevToolsProps) {
  const [expanded, setExpanded] = useState(initiallyExpanded);
  const [activePanel, setActivePanel] = useState<'state' | 'perf' | 'renders'>('state');
  const [isDragging, setIsDragging] = useState(false);
  const [pos, setPos] = useState(getInitialPosition(position));
  
  // Don't render in production
  if (process.env.NODE_ENV === 'production') return null;

  return (
    <Draggable position={pos} onDrag={setPos}>
      <div className="toolbench-panel">
        <header className="toolbench-header" onClick={() => setExpanded(e => !e)}>
          <span>🔧 DevTools</span>
          <span>{expanded ? '−' : '+'}</span>
        </header>

        {expanded && (
          <>
            <nav className="toolbench-tabs">
              <Tab active={activePanel === 'state'} onClick={() => setActivePanel('state')}>
                State
              </Tab>
              <Tab active={activePanel === 'perf'} onClick={() => setActivePanel('perf')}>
                Perf
              </Tab>
              <Tab active={activePanel === 'renders'} onClick={() => setActivePanel('renders')}>
                Renders
              </Tab>
            </nav>

            <div className="toolbench-content">
              {activePanel === 'state' && <StatePanel />}
              {activePanel === 'perf' && <PerfPanel />}
              {activePanel === 'renders' && <RenderPanel />}
            </div>
          </>
        )}
      </div>
    </Draggable>
  );
}

// The hook that tracks why components re-render
export function useWhyDidYouRender(componentName: string, props: Record<string, unknown>) {
  const prevProps = useRef(props);

  useEffect(() => {
    if (process.env.NODE_ENV === 'production') return;

    const changes: string[] = [];

    for (const key of Object.keys(props)) {
      if (prevProps.current[key] !== props[key]) {
        changes.push(\`\${key} changed\`);
      }
    }

    if (changes.length > 0) {
      console.log(
        \`%c[\${componentName}] Re-rendered because:\`,
        'color: #f59e0b; font-weight: bold',
        changes.join(', ')
      );
    }

    prevProps.current = props;
  });
}

// Production-safe logging that no-ops in prod
export function devLog(label: string, ...args: unknown[]) {
  if (process.env.NODE_ENV === 'production') return;
  console.log(
    \`%c[\${new Date().toLocaleTimeString()}] \${label}\`,
    'color: #3b82f6',
    ...args
  );
}`,
    },
  },
];
