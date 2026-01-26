---
title: "WebRTC Demystified: Building Real-Time Apps in the Browser"
excerpt: The most powerful API nobody understands. Let's fix that.
category: deep-dives
publishedAt: 2026-01-26
tags:
  - WebRTC
  - Real-time
  - Video
  - JavaScript
coverImage: /blog/webrtc-demystified-real-time-browser.svg
featured: false
---

I've spent years working on video conferencing platforms, and nothing frustrates me more than watching developers treat WebRTC like black magic. It's not. It's just poorly explained.

Let me fix that.

## The Mental Model You Actually Need

WebRTC lets browsers talk directly to each other—video, audio, and arbitrary data—without routing everything through your server. That last part is crucial. Your server is still involved, but only for coordination, not for the actual media streams.

Think of it like introducing two people at a party:

1. You (the server) help them find each other
2. You facilitate the initial handshake
3. Then you step away and let them have a conversation

That "stepping away" is what makes WebRTC special. Your server bandwidth doesn't scale with video resolution or participant count. The browsers handle it peer-to-peer.

## The Core APIs (There Are Really Just Three)

Everything in WebRTC revolves around these three pieces:

```typescript
// 1. RTCPeerConnection - The actual connection
const peerConnection = new RTCPeerConnection(config);

// 2. MediaStream - Video/audio from camera or screen
const stream = await navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
});

// 3. RTCDataChannel - Arbitrary data (games, files, whatever)
const dataChannel = peerConnection.createDataChannel("chat");
```

That's it. Everything else is just configuration and event handling.

## The Signaling Dance (Where Everyone Gets Confused)

Here's where WebRTC articles usually lose people. The connection setup requires exchanging "offers" and "answers" between peers, plus ICE candidates. Everyone overcomplicates this.

Here's the flow, simplified:

```typescript
// PEER A (the caller)
async function callPeer() {
  const pc = new RTCPeerConnection(iceServers);
  
  // Add your local stream
  const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
  stream.getTracks().forEach(track => pc.addTrack(track, stream));
  
  // Create offer and set it locally
  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);
  
  // Send this offer to Peer B via your signaling server
  signalingServer.send({ type: 'offer', sdp: offer.sdp });
  
  // Listen for ICE candidates and send them too
  pc.onicecandidate = (event) => {
    if (event.candidate) {
      signalingServer.send({ type: 'ice', candidate: event.candidate });
    }
  };
  
  // When you receive the answer, set it
  signalingServer.onmessage = async (msg) => {
    if (msg.type === 'answer') {
      await pc.setRemoteDescription({ type: 'answer', sdp: msg.sdp });
    }
    if (msg.type === 'ice') {
      await pc.addIceCandidate(msg.candidate);
    }
  };
  
  // When remote stream arrives
  pc.ontrack = (event) => {
    remoteVideo.srcObject = event.streams[0];
  };
}
```

```typescript
// PEER B (receiving the call)
async function answerCall(offer) {
  const pc = new RTCPeerConnection(iceServers);
  
  // Add your local stream
  const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
  stream.getTracks().forEach(track => pc.addTrack(track, stream));
  
  // Set the received offer
  await pc.setRemoteDescription({ type: 'offer', sdp: offer.sdp });
  
  // Create and send answer
  const answer = await pc.createAnswer();
  await pc.setLocalDescription(answer);
  signalingServer.send({ type: 'answer', sdp: answer.sdp });
  
  // Same ICE handling as Peer A
  pc.onicecandidate = (event) => {
    if (event.candidate) {
      signalingServer.send({ type: 'ice', candidate: event.candidate });
    }
  };
  
  pc.ontrack = (event) => {
    remoteVideo.srcObject = event.streams[0];
  };
}
```

The signaling server can be anything—WebSocket, Firebase, even HTTP polling if you hate yourself. It just needs to pass messages between the two peers.

## ICE Candidates: The NAT Busting Magic

Most people are behind routers with NAT (Network Address Translation). Your browser doesn't know its public IP address. ICE servers help browsers discover how to reach each other.

Two types:

```typescript
const config = {
  iceServers: [
    // STUN - Helps discover your public IP (free, Google provides these)
    { urls: 'stun:stun.l.google.com:19302' },
    
    // TURN - Relay server when direct connection fails (you usually pay for these)
    {
      urls: 'turn:your-turn-server.com:3478',
      username: 'user',
      credential: 'pass'
    }
  ]
};
```

**STUN** is free because it just tells you your public IP. Google runs free STUN servers.

**TURN** costs money because it relays your actual video/audio when peer-to-peer fails (strict corporate firewalls, symmetric NAT, etc.). About 10-15% of connections need TURN fallback.

If you're building something serious, budget for a TURN server. Twilio, Metered, or roll your own with coturn.

## DataChannels: The Hidden Gem

Everyone focuses on video chat, but `RTCDataChannel` is arguably more interesting. It gives you a low-latency, bidirectional pipe between browsers with optional reliability.

```typescript
// Create a data channel (caller side)
const channel = peerConnection.createDataChannel("game", {
  ordered: false,     // Don't wait for packet ordering (faster)
  maxRetransmits: 0   // No retries (even faster, but lossy)
});

channel.onopen = () => {
  channel.send(JSON.stringify({ type: 'player_move', x: 100, y: 200 }));
};

channel.onmessage = (event) => {
  const data = JSON.parse(event.data);
  handleGameEvent(data);
};
```

This is perfect for:
- Multiplayer games (way lower latency than WebSocket through your server)
- File sharing
- Collaborative editing
- Chat alongside video calls

You can even send binary data:

```typescript
channel.send(new Uint8Array([1, 2, 3, 4]));
```

## The Gotchas Nobody Tells You

### 1. Permissions Are Awkward

```typescript
// Users MUST interact with the page before you can request media
// This won't work on page load:
await navigator.mediaDevices.getUserMedia({ video: true }); // FAIL

// Put it in a click handler:
button.onclick = async () => {
  await navigator.mediaDevices.getUserMedia({ video: true }); // Works
};
```

### 2. Track Lifecycle Is Tricky

```typescript
// When someone mutes their video, the track still exists
track.enabled = false;  // Muted, but track is still there

// vs actually removing the track
stream.removeTrack(track);  // Gone
```

### 3. Connection State Machine Is Complex

```typescript
peerConnection.onconnectionstatechange = () => {
  switch (peerConnection.connectionState) {
    case 'new':        // Just created
    case 'connecting': // Negotiating
    case 'connected':  // Good!
    case 'disconnected': // Temporary loss, might recover
    case 'failed':     // Dead, need to restart
    case 'closed':     // Explicitly closed
  }
};
```

### 4. Renegotiation Happens

When tracks are added/removed mid-call, you need to renegotiate:

```typescript
peerConnection.onnegotiationneeded = async () => {
  const offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offer);
  signalingServer.send({ type: 'offer', sdp: offer.sdp });
};
```

## A Complete Minimal Example

Here's a working video call setup in about 100 lines:

```typescript
// signaling.ts - WebSocket wrapper
class Signaling {
  private ws: WebSocket;
  
  constructor(url: string) {
    this.ws = new WebSocket(url);
  }
  
  send(data: object) {
    this.ws.send(JSON.stringify(data));
  }
  
  onMessage(handler: (data: any) => void) {
    this.ws.onmessage = (e) => handler(JSON.parse(e.data));
  }
}

// webrtc.ts - The actual connection
export async function createVideoCall(signaling: Signaling, localVideo: HTMLVideoElement, remoteVideo: HTMLVideoElement) {
  const pc = new RTCPeerConnection({
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
  });
  
  // Get local media
  const stream = await navigator.mediaDevices.getUserMedia({ 
    video: { width: 1280, height: 720 }, 
    audio: true 
  });
  localVideo.srcObject = stream;
  stream.getTracks().forEach(track => pc.addTrack(track, stream));
  
  // Handle remote stream
  pc.ontrack = (e) => { remoteVideo.srcObject = e.streams[0]; };
  
  // ICE candidates
  pc.onicecandidate = (e) => {
    if (e.candidate) signaling.send({ type: 'ice', candidate: e.candidate });
  };
  
  // Handle incoming messages
  signaling.onMessage(async (msg) => {
    if (msg.type === 'offer') {
      await pc.setRemoteDescription({ type: 'offer', sdp: msg.sdp });
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      signaling.send({ type: 'answer', sdp: answer.sdp });
    }
    if (msg.type === 'answer') {
      await pc.setRemoteDescription({ type: 'answer', sdp: msg.sdp });
    }
    if (msg.type === 'ice') {
      await pc.addIceCandidate(msg.candidate);
    }
  });
  
  return {
    call: async () => {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      signaling.send({ type: 'offer', sdp: offer.sdp });
    },
    hangup: () => {
      pc.close();
      stream.getTracks().forEach(t => t.stop());
    }
  };
}
```

## Should You Build This Yourself?

Honestly? Probably not for production.

WebRTC is conceptually simple but operationally complex. You need:
- TURN servers for reliability ($$)
- Proper error handling for every edge case
- Simulcast for scalability
- SFU architecture for group calls
- Recording capabilities

For production, look at:
- **Livekit** (open source SFU, excellent)
- **Daily.co** (simple API, quick to ship)
- **Twilio Video** (enterprise grade, expensive)
- **100ms** (great for interactive features)

But you should absolutely understand how it works. When something breaks at 2 AM (and it will), you need to know whether it's ICE negotiation failing, TURN server misconfigured, or a track lifecycle issue.

## The Bottom Line

WebRTC is the most powerful real-time API in the browser. It lets you build video calls, multiplayer games, file sharing, and collaborative apps—all peer-to-peer.

The core is simple:
1. **RTCPeerConnection** - The connection
2. **MediaStream** - Video/audio
3. **RTCDataChannel** - Arbitrary data
4. **Signaling** - Your server coordinates, then steps away

Stop treating it like magic. It's just an API—a powerful one, but an API nonetheless.

Now go build something cool.
