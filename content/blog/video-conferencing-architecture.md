---
title: Architecting Video Conferencing Features at Scale
excerpt: How we built attendee management, hand raise, and virtual backgrounds for thousands of concurrent users.
category: deep-dives
publishedAt: 2024-11-20
tags:
  - React
  - WebRTC
  - OpenTok
  - Video
featured: true
coverImage: /blog/video-conferencing.svg
---

# Architecting Video Conferencing Features at Scale

At ON24, I work on the frontend team building video conferencing features for enterprise webinars and virtual events. Our platform handles events with thousands of concurrent attendees, real-time video, interactive features like Q&A and polling, and integrations with every marketing tool imaginable.

When I joined, I thought video conferencing was a "solved problem." Zoom works, Google Meet works, how hard could it be?

Three years later, I understand why the big players have thousands of engineers working on this. Video at scale is a masterclass in distributed systems, real-time synchronization, and graceful degradation. Here's what I've learned building features that work for 10,000 concurrent users.

## The Stack

Our video platform is built on:

- **React.js** for the UI layer (functional components, hooks everywhere)
- **TypeScript** for type safety (essential at our codebase size)
- **Vonage (OpenTok)** for WebRTC infrastructure
- **Styled Components** for styling (CSS-in-JS fits our component model)
- **Redux + Redux Toolkit** for state management (yes, Redux—more on that later)
- **WebSockets** for real-time features

The choice of Redux over newer alternatives like Zustand or Jotai wasn't arbitrary. With 20+ engineers touching the codebase, Redux's explicit actions and reducers create a traceable history. When something breaks, we can replay actions to reproduce bugs. That debuggability is worth the boilerplate.

## WebRTC: Harder Than It Looks

WebRTC is the technology that makes browser-based video possible. In theory, it's peer-to-peer—browser to browser, no server in between. In practice, almost nothing works that way at scale.

### The NAT Problem

Most devices are behind NATs (Network Address Translation)—your laptop doesn't have a public IP, your router does. For two browsers to connect, they need to discover each other's real addresses. This is called "ICE" (Interactive Connectivity Establishment), and it involves:

1. **STUN servers** — Tell you your public IP
2. **TURN servers** — Relay traffic when direct connection fails
3. **Signaling** — Exchange connection metadata via a server

We use Vonage's infrastructure for this, but I've debugged enough connection issues to understand the plumbing:

```typescript
// Simplified connection establishment
async function establishConnection(sessionId: string, token: string) {
  const session = OT.initSession(API_KEY, sessionId);
  
  session.on('sessionConnected', () => {
    console.log('Connected to session');
  });
  
  session.on('streamCreated', (event) => {
    // Another participant's video is available
    const subscriber = session.subscribe(event.stream, 'video-container', {
      insertMode: 'append',
      width: '100%',
      height: '100%',
    });
    
    subscriber.on('videoEnabled', () => {
      // Video is now flowing
    });
    
    subscriber.on('videoDisabled', (reason) => {
      // reason: 'quality', 'subscribeToVideo', 'publishVideo'
      handleVideoDisabled(reason);
    });
  });
  
  session.connect(token, (error) => {
    if (error) {
      handleConnectionError(error);
    }
  });
}
```

### Quality Adaptation

Network conditions vary wildly. A participant might be on fiber one moment and switch to 3G the next (laptop to phone handoff). The video system needs to adapt:

```typescript
session.on('signal:qualityWarning', (event) => {
  const { reason, target } = JSON.parse(event.data);
  
  if (reason === 'bandwidth') {
    // Reduce video resolution
    publisher.setPreferredResolution({ width: 640, height: 480 });
  }
  
  if (reason === 'cpu') {
    // Reduce frame rate
    publisher.setPreferredFrameRate(15);
  }
});

// Monitor quality metrics
subscriber.on('audioLevelUpdated', (event) => {
  const level = event.audioLevel;
  // 0-1 scale, use for audio level indicators
});

const stats = await subscriber.getStats();
// {
//   video: { packetsLost: 12, bytesReceived: 1234567, frameRate: 24 },
//   audio: { packetsLost: 0, bytesReceived: 123456 }
// }
```

At ON24's scale, we have dedicated infrastructure teams monitoring these metrics across millions of connections. Frontend gets callbacks and needs to react appropriately—show quality indicators, suggest troubleshooting, gracefully degrade.

## Feature Deep Dive: Hand Raise

One of the more interesting features I built was a "hand raise" system for large webinars. Sounds trivial—user clicks button, hand icon appears. But consider:

- 5,000 attendees
- Any of them can raise their hand
- The presenter needs to see a manageable queue
- Everyone needs to see the same order
- It needs to feel instant
- It needs to work when some participants have bad connections

### The Synchronization Problem

If Alice raises her hand at 10:00:00.000 and Bob raises his at 10:00:00.001, Alice should appear first in the queue. Always. For everyone.

But Alice's "raise hand" message might take 100ms to reach the server. Bob's might take 50ms. If we timestamp on the server, Bob appears first even though Alice clicked first.

Solution: client-side timestamps with server reconciliation.

```typescript
// Client sends timestamp with the action
function raiseHand() {
  const clientTimestamp = Date.now();
  
  socket.emit('hand:raise', {
    participantId: myId,
    timestamp: clientTimestamp,
  });
  
  // Optimistic update
  dispatch(handRaised({ participantId: myId, timestamp: clientTimestamp }));
}

// Server reconciles
// hand-raise-handler.ts (server)
function handleHandRaise(socket, data) {
  const { participantId, timestamp } = data;
  const serverTimestamp = Date.now();
  
  // Use client timestamp but bound it to prevent clock skew abuse
  const normalizedTimestamp = Math.min(
    timestamp,
    serverTimestamp + MAX_CLOCK_SKEW
  );
  
  // Store and broadcast
  state.raisedHands.set(participantId, normalizedTimestamp);
  
  broadcastToRoom(socket.roomId, 'hand:raised', {
    participantId,
    timestamp: normalizedTimestamp,
    queue: getSortedQueue(state.raisedHands),
  });
}
```

### The Queue UI

The presenter sees a sorted list of raised hands. With 5,000 attendees, potentially hundreds might raise hands. We don't render all of them:

```typescript
// Virtualized hand raise queue
function HandRaiseQueue() {
  const raisedHands = useSelector(selectRaisedHandsSorted);
  
  // Only render what's visible
  return (
    <VirtualList
      itemCount={raisedHands.length}
      itemSize={48}
      height={400}
      renderItem={({ index, style }) => {
        const hand = raisedHands[index];
        return (
          <HandRaiseItem
            key={hand.participantId}
            participant={hand}
            position={index + 1}
            style={style}
            onDismiss={() => dismissHand(hand.participantId)}
            onSpotlight={() => spotlightUser(hand.participantId)}
          />
        );
      }}
    />
  );
}
```

React-window handles the virtualization. We only render ~10 items at a time regardless of how many hands are raised.

### Conflict Resolution

What if someone lowers their hand at the same moment the presenter dismisses it? Both sides think they initiated the action. We use Last-Write-Wins with causality tracking:

```typescript
interface HandState {
  raised: boolean;
  lastUpdated: number;
  updatedBy: 'participant' | 'presenter';
}

function handleHandUpdate(current: HandState, incoming: HandState): HandState {
  // Later timestamp wins
  if (incoming.lastUpdated > current.lastUpdated) {
    return incoming;
  }
  
  // Same timestamp: presenter wins
  if (incoming.lastUpdated === current.lastUpdated) {
    return incoming.updatedBy === 'presenter' ? incoming : current;
  }
  
  return current;
}
```

## Feature Deep Dive: Virtual Backgrounds

Virtual backgrounds—replacing your real background with an image—is table stakes for video calls now. But doing it performantly in the browser is a journey.

### The Naive Approach

Use TensorFlow.js with BodyPix model to segment person from background:

```typescript
import * as bodyPix from '@tensorflow-models/body-pix';

async function applyVirtualBackground(
  video: HTMLVideoElement,
  backgroundImage: HTMLImageElement
): Promise<HTMLCanvasElement> {
  const net = await bodyPix.load();
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  
  async function processFrame() {
    // Segment the person
    const segmentation = await net.segmentPerson(video);
    
    // Draw background
    ctx.drawImage(backgroundImage, 0, 0);
    
    // Draw masked video (only the person)
    const mask = bodyPix.toMask(segmentation);
    ctx.globalCompositeOperation = 'destination-in';
    ctx.putImageData(mask, 0, 0);
    ctx.globalCompositeOperation = 'source-over';
    ctx.drawImage(video, 0, 0);
    
    requestAnimationFrame(processFrame);
  }
  
  processFrame();
  return canvas;
}
```

This works. It also uses 80% CPU and your laptop catches fire.

### Optimizations That Matter

**1. Resolution Reduction**

Segmentation doesn't need full resolution. Process at 640x360, display at 1280x720:

```typescript
const segmentation = await net.segmentPerson(video, {
  internalResolution: 'medium', // 'low' | 'medium' | 'high' | 'full'
  segmentationThreshold: 0.7,
});
```

**2. Skip Frames**

30fps segmentation is overkill. 15fps is usually imperceptible:

```typescript
let frameCount = 0;
let lastSegmentation: ImageData;

function processFrame() {
  frameCount++;
  
  if (frameCount % 2 === 0) {
    // Use cached segmentation on odd frames
    applyMask(lastSegmentation);
  } else {
    // New segmentation on even frames
    lastSegmentation = await net.segmentPerson(video);
    applyMask(lastSegmentation);
  }
  
  requestAnimationFrame(processFrame);
}
```

**3. Web Worker Offloading**

Move segmentation to a Web Worker so it doesn't block the main thread:

```typescript
// main.ts
const worker = new Worker(new URL('./segmentation.worker.ts', import.meta.url));

worker.onmessage = (e) => {
  const { maskData } = e.data;
  applyMaskToCanvas(maskData);
};

function sendFrameToWorker(imageData: ImageData) {
  worker.postMessage({ imageData }, [imageData.data.buffer]);
}

// segmentation.worker.ts
import * as bodyPix from '@tensorflow-models/body-pix';

let net: bodyPix.BodyPix;

self.onmessage = async (e) => {
  if (!net) {
    net = await bodyPix.load();
  }
  
  const segmentation = await net.segmentPerson(e.data.imageData);
  const mask = bodyPix.toMask(segmentation);
  
  self.postMessage({ maskData: mask }, [mask.data.buffer]);
};
```

**4. Hardware Acceleration**

On devices with good GPUs, use WebGL for compositing:

```typescript
import { GlslPipeline } from '@pattaya/glsl-pipeline';

const pipeline = new GlslPipeline({
  fragmentShader: `
    precision mediump float;
    
    uniform sampler2D uVideo;
    uniform sampler2D uBackground;
    uniform sampler2D uMask;
    
    varying vec2 vTexCoord;
    
    void main() {
      float mask = texture2D(uMask, vTexCoord).r;
      vec4 video = texture2D(uVideo, vTexCoord);
      vec4 bg = texture2D(uBackground, vTexCoord);
      
      gl_FragColor = mix(bg, video, mask);
    }
  `
});
```

GPU compositing is nearly free compared to CPU canvas operations.

### Feature Detection

Not all devices can handle virtual backgrounds. We detect capabilities and offer appropriate options:

```typescript
async function detectVirtualBackgroundSupport(): Promise<{
  supported: boolean;
  quality: 'high' | 'medium' | 'low' | 'none';
}> {
  // Check for WebGL 2
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl2');
  
  if (!gl) {
    return { supported: false, quality: 'none' };
  }
  
  // Check GPU capabilities
  const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
  const renderer = debugInfo
    ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
    : '';
  
  // Intel integrated = medium, dedicated GPU = high, unknown = low
  const quality = renderer.includes('Intel')
    ? 'medium'
    : renderer.includes('NVIDIA') || renderer.includes('AMD')
    ? 'high'
    : 'low';
  
  // Benchmark actual performance
  const benchmark = await runSegmentationBenchmark();
  
  if (benchmark.fps < 10) {
    return { supported: false, quality: 'none' };
  }
  
  return { supported: true, quality };
}
```

We show a warning if we detect low-end hardware and suggest blur (cheaper) over image replacement.

## State Management at Scale

With features like hand raise, chat, Q&A, polls, video status, and more, state management gets complex. Our Redux store has ~50 slices.

### Structure

```typescript
// store/index.ts
const rootReducer = combineReducers({
  // Core
  session: sessionReducer,
  participants: participantsReducer,
  
  // Video
  video: videoReducer,
  publishers: publishersReducer,
  subscribers: subscribersReducer,
  
  // Interactive features
  chat: chatReducer,
  qa: qaReducer,
  polls: pollsReducer,
  handRaise: handRaiseReducer,
  
  // UI state
  ui: uiReducer,
  notifications: notificationsReducer,
  
  // ... many more
});
```

### Selectors for Performance

With thousands of participants, naive selectors are expensive:

```typescript
// Bad: runs on every state change
const selectParticipant = (state, id) =>
  state.participants.list.find(p => p.id === id);

// Good: normalized state + memoized selector
const selectParticipant = (state, id) =>
  state.participants.byId[id];

// With Reselect for derived data
const selectOnlineParticipants = createSelector(
  [(state) => state.participants.byId, (state) => state.participants.ids],
  (byId, ids) => ids.filter(id => byId[id].status === 'online').map(id => byId[id])
);
```

### Batching WebSocket Updates

WebSocket messages can arrive faster than React can render. We batch them:

```typescript
let pendingUpdates: Update[] = [];
let batchTimeout: NodeJS.Timeout | null = null;

socket.on('participant:update', (update) => {
  pendingUpdates.push(update);
  
  if (!batchTimeout) {
    batchTimeout = setTimeout(() => {
      // Dispatch all updates at once
      dispatch(participantsBatchUpdate(pendingUpdates));
      pendingUpdates = [];
      batchTimeout = null;
    }, 16); // ~1 frame
  }
});
```

## Lessons Learned

Three years building video features at scale taught me:

**1. Everything is a race condition.** Assume messages arrive out of order, connections drop mid-action, and state can be stale. Design for it.

**2. Optimistic updates are essential.** Users can't wait 200ms for a "hand raised" confirmation. Update locally, reconcile later.

**3. Measure everything.** We have dashboards for connection quality, feature usage, error rates by browser/OS. Without metrics, you're flying blind.

**4. Graceful degradation wins.** When virtual backgrounds are too heavy, offer blur. When video fails, fall back to audio. Never let a non-critical feature break the core experience.

**5. Browser differences are real.** Safari's WebRTC implementation is different from Chrome's. Firefox has its own quirks. Test everywhere.

---

*ON24 powers thousands of webinars daily. If you've attended a B2B virtual event recently, there's a decent chance you experienced features I helped build.*
