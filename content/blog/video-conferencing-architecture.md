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
---

# Architecting Video Conferencing Features at Scale

At ON24, I've worked on video conferencing features used by thousands of concurrent users. Here's what I've learned about building real-time features at scale.

## The Stack

Our video platform is built on:
- **React.js** for the UI layer
- **OpenTok (Vonage)** for WebRTC
- **Styled Components** for styling
- **Redux** for state management

## Hand Raise Feature

One of the more interesting features was implementing a "hand raise" system that works reliably with 1000+ attendees.

```typescript
interface HandRaiseState {
  raisedHands: Map<string, number>; // participantId -> timestamp
  queue: string[]; // ordered by raise time
}

function raiseHand(participantId: string) {
  const timestamp = Date.now();
  dispatch({
    type: 'RAISE_HAND',
    payload: { participantId, timestamp }
  });

  // Sync with other participants via WebSocket
  socket.emit('hand:raise', { participantId, timestamp });
}
```

## Key Challenges

1. **Synchronization** - All clients need to see the same queue order
2. **Latency** - Hand raises must feel instant
3. **Scale** - The system must handle thousands of participants

## Virtual Backgrounds

We also implemented virtual backgrounds using TensorFlow.js for body segmentation:

```typescript
async function applyVirtualBackground(
  videoElement: HTMLVideoElement,
  backgroundImage: string
) {
  const segmentation = await bodySegmentation.segmentPeople(videoElement);
  // Composite the background with the segmented person
}
```

## Takeaways

- Real-time features require careful state synchronization
- WebRTC is powerful but has browser quirks
- Performance testing at scale is essential
