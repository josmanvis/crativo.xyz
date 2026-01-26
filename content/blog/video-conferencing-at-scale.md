---
title: "Video Conferencing at Scale: What I Learned at ON24"
excerpt: "Building video infrastructure for enterprise clients taught me things no tutorial covers. Real-time media is a different beast."
category: deep-dives
publishedAt: 2024-12-03
tags:
  - Video
  - WebRTC
  - Performance
  - Enterprise
coverImage: /blog/video-conferencing-at-scale.svg
featured: false
seo:
  title: "Video Conferencing at Scale | Enterprise WebRTC Development"
  description: "Real-world lessons from building enterprise video conferencing software at ON24. WebRTC, scaling challenges, and performance optimization."
  keywords: ["video conferencing development", "WebRTC at scale", "enterprise video software", "ON24", "real-time media"]
---

# Video Conferencing at Scale: What I Learned at ON24

Working on video conferencing at ON24 has been humbling. You think you understand web development, then you try to stream video to 10,000 concurrent users and watch your assumptions crumble.

Real-time media is a different beast. Here's what I've learned building enterprise video infrastructure.

## The Scale Is Different

When you're building a video chat app for a hackathon, you might have 10 users. Maybe 100 if it goes viral on Product Hunt.

Enterprise video conferencing means:
- **Thousands of concurrent viewers** per event
- **Global audience** across every timezone
- **Enterprise networks** with aggressive firewalls
- **Zero tolerance for downtime** during a CEO's keynote

The technical challenges compound at scale in ways that aren't obvious until you're there.

## WebRTC Is Great Until It Isn't

WebRTC gives you peer-to-peer video "for free." That works great for 1:1 calls. For large-scale events? It's a starting point, not a solution.

### The Mesh Problem

In a mesh topology, each participant sends video to every other participant:

```
Participants: n
Connections: n * (n-1)

5 users:  20 connections
10 users: 90 connections
50 users: 2,450 connections
```

At around 4-5 participants, most devices struggle. At 20, it's hopeless.

### SFU to the Rescue

A Selective Forwarding Unit sits in the middle:

```
Before (Mesh):
A ← → B
A ← → C
B ← → C

After (SFU):
A → SFU → B, C
B → SFU → A, C
C → SFU → A, B
```

Each participant uploads one stream, and the SFU distributes it. This scales much better, but now you need server infrastructure.

### Simulcast for Bandwidth

With simulcast, each sender produces multiple quality levels:

```javascript
const sender = pc.getSenders()[0];
const params = sender.getParameters();
params.encodings = [
  { rid: 'high', maxBitrate: 2_500_000 },
  { rid: 'medium', maxBitrate: 500_000, scaleResolutionDownBy: 2 },
  { rid: 'low', maxBitrate: 150_000, scaleResolutionDownBy: 4 }
];
await sender.setParameters(params);
```

The SFU selects which quality to forward based on each viewer's bandwidth. Someone on 5G gets HD. Someone on hotel WiFi gets potato quality. Everyone stays connected.

## Latency Matters More Than Quality

Counterintuitive but true: users tolerate 720p but won't tolerate 2-second delay.

Interactive video (where viewers can ask questions, react, participate) needs under 500ms latency. Preferably under 200ms. At 2+ seconds, "live" feels like watching a recording.

We optimize for latency before quality:

```javascript
const constraints = {
  video: {
    width: { ideal: 1280, max: 1920 },
    height: { ideal: 720, max: 1080 },
    frameRate: { ideal: 24, max: 30 }
  },
  audio: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true
  }
};
```

30fps at 720p is usually better than 60fps at 1080p. The bandwidth savings reduce latency.

## Enterprise Networks Are Hostile

Corporate IT departments don't trust WebRTC:

- Symmetric NAT that breaks peer connections
- Firewalls blocking UDP traffic
- Proxy servers that don't understand WebSocket
- VPNs that add 200ms latency

### TURN Servers Are Essential

TURN (Traversal Using Relays around NAT) acts as a relay when direct connections fail:

```javascript
const config = {
  iceServers: [
    { urls: 'stun:stun.example.com:3478' },
    {
      urls: 'turn:turn.example.com:443?transport=tcp',
      username: 'user',
      credential: 'pass'
    }
  ]
};
```

Key insight: use port 443 with TCP. It looks like HTTPS to firewalls. They let it through.

### Connection State Management

Users connect from everywhere. Their connection state constantly changes:

```javascript
pc.onconnectionstatechange = () => {
  switch (pc.connectionState) {
    case 'connected':
      showStatus('Connected');
      break;
    case 'disconnected':
      showStatus('Reconnecting...');
      attemptReconnect();
      break;
    case 'failed':
      showStatus('Connection failed');
      fallbackToHLS();
      break;
  }
};
```

Always have a fallback. When WebRTC fails, HLS streaming keeps the show running.

## Audio Is Harder Than Video

Video can be choppy. Audio must be perfect. A few dropped frames in video? Barely noticeable. A few dropped audio samples? Everyone hears it.

### Echo Cancellation Is Dark Magic

When speaker audio feeds back into the microphone, you get echo. Acoustic Echo Cancellation (AEC) is supposed to handle this, but:

- It fails with Bluetooth headphones
- It fails with certain speaker/mic distances
- It fails when people use external speakers

We added manual echo detection and muting as a fallback:

```javascript
const audioContext = new AudioContext();
const analyser = audioContext.createAnalyser();

function detectEcho() {
  const data = new Uint8Array(analyser.frequencyBinCount);
  analyser.getByteFrequencyData(data);
  
  // If output matches input with delay, likely echo
  const correlationScore = calculateCorrelation(inputData, data, 150);
  if (correlationScore > 0.8) {
    muteOutput();
    showWarning('Echo detected. Please use headphones.');
  }
}
```

### Audio Levels Vary Wildly

Some users have their mic at 100%. Some whisper. Some have construction outside.

Automatic Gain Control (AGC) helps, but we also implemented:
- Server-side audio normalization
- Per-user volume controls for moderators
- Noise gate to cut audio below threshold

## Monitoring Is Essential

You can't fix what you can't measure. We track:

```javascript
const stats = await pc.getStats();
stats.forEach(report => {
  if (report.type === 'inbound-rtp' && report.kind === 'video') {
    metrics.record({
      packetsLost: report.packetsLost,
      jitter: report.jitter,
      framesDecoded: report.framesDecoded,
      framesDropped: report.framesDropped
    });
  }
});
```

Key metrics:
- **Packet loss > 2%:** Quality degradation visible
- **Jitter > 50ms:** Audio starts breaking up
- **Frames dropped > 5%:** Video is stuttering

We alert on these before users complain. Usually.

## Things That Surprised Me

### Browser Differences Are Real

The same WebRTC code behaves differently:
- Chrome is forgiving
- Firefox is strict about spec compliance
- Safari... Safari is Safari

We test on all three. We have Safari-specific workarounds. I won't elaborate on the workarounds.

### Mobile Is a Different World

- Battery drain is real at high quality
- Background tabs stop sending video
- iOS has severe WebRTC limitations
- Cellular networks add unpredictable latency

Mobile often gets a completely different code path.

### Recording Is Its Own Challenge

Recording live streams for later viewing seems simple. It's not:
- Transcoding for storage
- Handling dropped frames
- Syncing audio/video after connection issues
- Storage costs at scale

We process thousands of hours of recordings weekly. It's a pipeline unto itself.

## What I'd Tell Past Me

1. **Start with TURN from day one.** Don't assume STUN will work.
2. **Build reconnection logic early.** Connections will drop.
3. **Log everything.** Debugging video issues without logs is impossible.
4. **Test on terrible networks.** Chrome DevTools network throttling is essential.
5. **Users blame you, not their WiFi.** Design for that reality.

## The Satisfaction

For all the complexity, there's something magical about real-time video. When thousands of people watch a live event, ask questions, and interact—all through software you helped build—it feels real in a way that async applications don't.

The challenges are endless. The problems are hard. I wouldn't trade it for CRUD apps.

---

*Currently building video experiences at ON24. Yes, I've debugged WebRTC on Christmas Eve. Yes, it was a TURN server issue.*
