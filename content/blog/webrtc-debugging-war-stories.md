---
title: "WebRTC Debugging War Stories: Hard-Won Lessons from Production Video Conferencing"
date: "2025-01-25"
description: "Real debugging techniques and war stories from building enterprise video conferencing features. ICE failures, codec negotiations, and the dark arts of WebRTC troubleshooting."
tags: ["webrtc", "debugging", "video", "real-time", "production"]
coverImage: /blog/webrtc-debugging.svg
featured: true
readingTime: "18 min"
---

# WebRTC Debugging War Stories: Hard-Won Lessons from Production Video Conferencing

WebRTC is one of those technologies that seems simple until it isn't. The "it just works" demos hide a complex reality: negotiating codecs across browsers, handling network transitions, dealing with corporate firewalls that block everything, and debugging issues that only reproduce on specific devices in specific network conditions.

After years of building video conferencing features used by thousands of concurrent users, I've accumulated a toolkit of debugging techniques and war stories. This isn't a WebRTC tutorial—it's a survival guide for when things go wrong in production.

## The Anatomy of a WebRTC Connection

Before we dive into debugging, let's establish the mental model. A WebRTC connection involves:

1. **Signaling** - Exchanging session descriptions (SDP) and ICE candidates
2. **ICE Gathering** - Finding network paths between peers
3. **DTLS Handshake** - Establishing encrypted transport
4. **Media Flow** - Actual audio/video transmission

Problems can occur at any layer, and they often manifest in confusing ways. A codec negotiation failure might look like a network issue. A TURN server misconfiguration might work fine for 90% of users but fail completely for the other 10%.

```typescript
// The idealized flow
const pc = new RTCPeerConnection(config);

pc.onicecandidate = (event) => {
  if (event.candidate) {
    signaling.send({ type: 'candidate', candidate: event.candidate });
  }
};

pc.ontrack = (event) => {
  remoteVideo.srcObject = event.streams[0];
};

// Reality: Each of these steps can fail in creative ways
```

## War Story #1: The iOS Safari Nightmare

**The Problem**: Video worked perfectly on Chrome, Firefox, and desktop Safari. But iOS Safari users reported intermittent black screens—video would start, freeze after 5-10 seconds, and never recover.

**The Investigation**: The iOS Safari console is notoriously unhelpful for WebRTC debugging. We added extensive logging:

```typescript
class ConnectionMonitor {
  private pc: RTCPeerConnection;
  private stats: RTCStatsReport[] = [];

  constructor(pc: RTCPeerConnection) {
    this.pc = pc;
    this.startMonitoring();
  }

  private async startMonitoring() {
    setInterval(async () => {
      const stats = await this.pc.getStats();
      this.stats.push(stats);
      this.analyzeStats(stats);
    }, 1000);
  }

  private analyzeStats(stats: RTCStatsReport) {
    stats.forEach((report) => {
      if (report.type === 'inbound-rtp' && report.kind === 'video') {
        const packetsLost = report.packetsLost || 0;
        const packetsReceived = report.packetsReceived || 0;
        const lossRate = packetsLost / (packetsLost + packetsReceived);
        
        if (lossRate > 0.1) {
          console.warn(`High packet loss: ${(lossRate * 100).toFixed(1)}%`);
        }
        
        // The key insight
        if (report.framesDecoded === this.lastFramesDecoded) {
          console.error('Frame decode stall detected');
          this.emitDiagnostic('DECODE_STALL');
        }
        this.lastFramesDecoded = report.framesDecoded;
      }
    });
  }
}
```

**The Root Cause**: iOS Safari has aggressive power management. When the device is on battery and the tab isn't in focus (even briefly), Safari can suspend the video decoder. The peer connection stays "connected" but frames stop being decoded.

**The Fix**: We implemented decoder stall detection and automatic track replacement:

```typescript
async function recoverFromDecodeStall(pc: RTCPeerConnection) {
  // Request a keyframe from the sender
  const senders = pc.getSenders();
  for (const sender of senders) {
    if (sender.track?.kind === 'video') {
      const params = sender.getParameters();
      // Force encoder to generate keyframe
      params.encodings?.forEach(enc => {
        enc.scaleResolutionDownBy = enc.scaleResolutionDownBy || 1;
      });
      await sender.setParameters(params);
    }
  }
  
  // For severe cases, renegotiate
  if (consecutiveStalls > 3) {
    await renegotiateConnection(pc);
  }
}
```

**Lesson**: Never trust connection state alone. Monitor actual media flow with getStats() and implement recovery mechanisms.

## War Story #2: The Corporate Firewall Gauntlet

**The Problem**: Enterprise customers reported that video calls would connect but with terrible quality—pixelated video, choppy audio, or complete failure for some participants.

**The Investigation**: Corporate networks often have:
- Symmetric NAT (the strictest type)
- Firewalls blocking UDP entirely
- Deep packet inspection that interferes with STUN
- Proxy servers for all traffic

```typescript
// Comprehensive ICE configuration for hostile networks
const config: RTCConfiguration = {
  iceServers: [
    // STUN servers (free, but won't work behind symmetric NAT)
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    
    // TURN servers (essential for enterprise)
    {
      urls: [
        'turn:turn.example.com:443?transport=tcp',
        'turn:turn.example.com:3478?transport=udp',
        'turns:turn.example.com:443?transport=tcp', // TLS - looks like HTTPS
      ],
      username: 'user',
      credential: 'pass',
    },
  ],
  
  // Aggressive ICE gathering
  iceCandidatePoolSize: 10,
  
  // Force relay for testing
  // iceTransportPolicy: 'relay',
};
```

**The Secret Weapon: TURNS on Port 443**

Many enterprise firewalls allow HTTPS traffic (TCP 443) but block everything else. TURNS (TURN over TLS) on port 443 is indistinguishable from HTTPS to most firewalls:

```typescript
// TURNS configuration that survives most firewalls
{
  urls: 'turns:turn.example.com:443?transport=tcp',
  username: generateTurnCredentials().username,
  credential: generateTurnCredentials().password,
}
```

**Diagnosing ICE Failures**:

```typescript
function diagnoseICEFailure(pc: RTCPeerConnection): ICEDiagnostic {
  return new Promise((resolve) => {
    const candidates: RTCIceCandidate[] = [];
    const failedPairs: string[] = [];

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        candidates.push(event.candidate);
        console.log('ICE Candidate:', {
          type: event.candidate.type, // host, srflx, relay
          protocol: event.candidate.protocol, // udp, tcp
          address: event.candidate.address,
          port: event.candidate.port,
        });
      }
    };

    pc.onicecandidateerror = (event) => {
      console.error('ICE Error:', {
        errorCode: event.errorCode,
        errorText: event.errorText,
        url: event.url,
      });
    };

    pc.oniceconnectionstatechange = () => {
      if (pc.iceConnectionState === 'failed') {
        resolve({
          candidates,
          hasHostCandidates: candidates.some(c => c.type === 'host'),
          hasRelayCandidates: candidates.some(c => c.type === 'relay'),
          recommendation: getRecommendation(candidates),
        });
      }
    };
  });
}

function getRecommendation(candidates: RTCIceCandidate[]): string {
  const hasHost = candidates.some(c => c.type === 'host');
  const hasSrflx = candidates.some(c => c.type === 'srflx');
  const hasRelay = candidates.some(c => c.type === 'relay');

  if (!hasHost) {
    return 'No local network access. Check local firewall/antivirus.';
  }
  if (!hasSrflx) {
    return 'STUN failed. Likely behind symmetric NAT. TURN required.';
  }
  if (!hasRelay) {
    return 'TURN failed. Check TURN server credentials and firewall rules.';
  }
  return 'All candidate types gathered but connection failed. Check peer connectivity.';
}
```

**Lesson**: Always have TURNS on port 443 as a fallback. It's your escape hatch for hostile networks.

## War Story #3: The Phantom Echo

**The Problem**: Users on certain Android devices reported severe echo. The echo cancellation was enabled, but it wasn't working.

**The Investigation**: Chrome on Android has excellent echo cancellation... when it works. The issue was that some OEMs modify the audio stack in ways that break Chrome's echo canceller:

```typescript
// The naive approach
const stream = await navigator.mediaDevices.getUserMedia({
  audio: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
  },
  video: true,
});

// The problem: these are "hints", not guarantees
const track = stream.getAudioTracks()[0];
const settings = track.getSettings();
console.log('Actual settings:', settings);
// Sometimes echoCancellation is false despite requesting true
```

**The Fix**: We implemented a multi-layered approach:

```typescript
class AudioProcessingPipeline {
  private audioContext: AudioContext;
  private source: MediaStreamAudioSourceNode;
  private destination: MediaStreamAudioDestinationNode;

  async initialize(inputStream: MediaStream) {
    this.audioContext = new AudioContext();
    this.source = this.audioContext.createMediaStreamSource(inputStream);
    this.destination = this.audioContext.createMediaStreamDestination();

    // Check if browser AEC is actually working
    const track = inputStream.getAudioTracks()[0];
    const settings = track.getSettings();

    if (!settings.echoCancellation) {
      console.warn('Browser AEC disabled, enabling software fallback');
      await this.enableSoftwareAEC();
    }

    // Always add noise gate for extra protection
    const noiseGate = await this.createNoiseGate();
    
    this.source
      .connect(noiseGate)
      .connect(this.destination);

    return this.destination.stream;
  }

  private async createNoiseGate(): AudioWorkletNode {
    await this.audioContext.audioWorklet.addModule('/audio-worklet/noise-gate.js');
    return new AudioWorkletNode(this.audioContext, 'noise-gate', {
      parameterData: {
        threshold: -50, // dB
        attack: 0.001,  // seconds
        release: 0.1,   // seconds
      },
    });
  }

  private async enableSoftwareAEC() {
    // Load WebAssembly-based echo canceller
    // This is a fallback for broken browser implementations
    await this.audioContext.audioWorklet.addModule('/audio-worklet/aec.js');
    // ... implementation details
  }
}
```

**The Real Solution**: We built a device capability database that tracked which device/browser combinations had working AEC. For problematic devices, we'd show a warning and suggest using headphones:

```typescript
const PROBLEMATIC_DEVICES = new Map([
  ['SM-A515F', { aec: 'broken', recommendation: 'Use headphones' }],
  ['Redmi Note 9', { aec: 'partial', recommendation: 'Check for Chrome updates' }],
  // ... hundreds more entries
]);

function getDeviceCapabilities(): DeviceCapabilities {
  const ua = navigator.userAgent;
  const model = extractDeviceModel(ua);
  
  return PROBLEMATIC_DEVICES.get(model) || { aec: 'unknown', recommendation: null };
}
```

**Lesson**: Trust but verify. Browser APIs are "best effort" on mobile. Always check actual settings and have fallbacks.

## War Story #4: The Bandwidth Cliff

**The Problem**: Video quality would be fine, then suddenly drop to potato quality and stay there, even when network conditions improved.

**The Investigation**: WebRTC has built-in bandwidth estimation (BWE), but it's conservative. Once it decides bandwidth is low, it's slow to recover:

```typescript
// Monitor actual bandwidth vs estimated
async function monitorBandwidth(pc: RTCPeerConnection) {
  let previousBytesSent = 0;
  let previousTimestamp = Date.now();

  setInterval(async () => {
    const stats = await pc.getStats();
    
    stats.forEach((report) => {
      if (report.type === 'outbound-rtp' && report.kind === 'video') {
        const now = Date.now();
        const bytesSent = report.bytesSent;
        const bitrate = 8 * (bytesSent - previousBytesSent) / (now - previousTimestamp) * 1000;
        
        console.log('Actual bitrate:', Math.round(bitrate / 1000), 'kbps');
        console.log('Target bitrate:', report.targetBitrate);
        console.log('Available bandwidth:', report.availableOutgoingBitrate);
        
        // Detect stuck-low scenario
        if (report.availableOutgoingBitrate < 500000 && report.qualityLimitationReason === 'bandwidth') {
          console.warn('BWE stuck low, considering reset');
        }
        
        previousBytesSent = bytesSent;
        previousTimestamp = now;
      }
    });
  }, 2000);
}
```

**The Fix**: Implement proactive bandwidth probing and encoder parameter manipulation:

```typescript
class AdaptiveBitrateController {
  private pc: RTCPeerConnection;
  private targetBitrate: number;
  private minBitrate = 150_000;  // 150 kbps floor
  private maxBitrate = 2_500_000; // 2.5 mbps ceiling

  async probeBandwidth() {
    const sender = this.pc.getSenders().find(s => s.track?.kind === 'video');
    if (!sender) return;

    const params = sender.getParameters();
    if (!params.encodings?.[0]) return;

    // Temporarily increase bitrate to probe available bandwidth
    const currentMax = params.encodings[0].maxBitrate || this.maxBitrate;
    
    // Probe at 1.5x current, capped at max
    params.encodings[0].maxBitrate = Math.min(currentMax * 1.5, this.maxBitrate);
    await sender.setParameters(params);

    // After 3 seconds, check if we could sustain higher bitrate
    setTimeout(async () => {
      const stats = await this.pc.getStats();
      const qualityLimited = this.checkQualityLimitation(stats);
      
      if (!qualityLimited) {
        // Success! Keep the higher bitrate
        console.log('Bandwidth probe successful, maintaining higher bitrate');
      } else {
        // Revert
        params.encodings[0].maxBitrate = currentMax;
        await sender.setParameters(params);
      }
    }, 3000);
  }

  // Call this periodically to recover from stuck-low states
  async attemptRecovery() {
    const stats = await this.pc.getStats();
    const bwe = this.extractBWE(stats);
    
    if (bwe < 500_000 && Date.now() - this.lastRecoveryAttempt > 30_000) {
      console.log('Attempting BWE recovery');
      await this.probeBandwidth();
      this.lastRecoveryAttempt = Date.now();
    }
  }
}
```

**Lesson**: WebRTC's automatic bandwidth adaptation isn't always enough. Monitor it and be prepared to intervene.

## The Essential Debugging Toolkit

After countless debugging sessions, here's my go-to toolkit:

### 1. chrome://webrtc-internals

The most powerful debugging tool for Chrome/Chromium browsers:

```
chrome://webrtc-internals
```

This shows:
- All active peer connections
- ICE candidate gathering and selection
- Codec negotiation (SDP offer/answer)
- Real-time statistics graphs
- Event logs

### 2. The Stats Reporter

Every production WebRTC app needs a stats reporter that phones home diagnostics:

```typescript
class WebRTCDiagnostics {
  async gatherDiagnostics(pc: RTCPeerConnection): Promise<DiagnosticReport> {
    const stats = await pc.getStats();
    const report: DiagnosticReport = {
      timestamp: Date.now(),
      connectionState: pc.connectionState,
      iceConnectionState: pc.iceConnectionState,
      iceGatheringState: pc.iceGatheringState,
      signalingState: pc.signalingState,
      streams: [],
    };

    stats.forEach((stat) => {
      if (stat.type === 'candidate-pair' && stat.state === 'succeeded') {
        report.selectedCandidatePair = {
          localType: stat.localCandidateType,
          remoteType: stat.remoteCandidateType,
          protocol: stat.protocol,
          rtt: stat.currentRoundTripTime,
        };
      }

      if (stat.type === 'inbound-rtp') {
        report.streams.push({
          kind: stat.kind,
          packetsReceived: stat.packetsReceived,
          packetsLost: stat.packetsLost,
          jitter: stat.jitter,
          framesDecoded: stat.framesDecoded,
          framesDropped: stat.framesDropped,
        });
      }

      if (stat.type === 'outbound-rtp') {
        report.streams.push({
          kind: stat.kind,
          packetsSent: stat.packetsSent,
          retransmittedPackets: stat.retransmittedPacketsSent,
          qualityLimitationReason: stat.qualityLimitationReason,
          encoderImplementation: stat.encoderImplementation,
        });
      }
    });

    return report;
  }

  // Send to your analytics backend
  async reportDiagnostics(report: DiagnosticReport) {
    await fetch('/api/webrtc-diagnostics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(report),
    });
  }
}
```

### 3. Synthetic Connection Testing

Before a user joins a call, verify their connection can actually work:

```typescript
async function preflightCheck(): Promise<PreflightResult> {
  const result: PreflightResult = {
    canConnect: false,
    candidateTypes: [],
    selectedProtocol: null,
    rtt: null,
    warnings: [],
  };

  const pc1 = new RTCPeerConnection(config);
  const pc2 = new RTCPeerConnection(config);

  // Simple loopback test
  pc1.onicecandidate = (e) => e.candidate && pc2.addIceCandidate(e.candidate);
  pc2.onicecandidate = (e) => e.candidate && pc1.addIceCandidate(e.candidate);

  const dataChannel = pc1.createDataChannel('test');
  
  return new Promise(async (resolve) => {
    const timeout = setTimeout(() => {
      result.warnings.push('Connection timeout');
      cleanup();
      resolve(result);
    }, 10000);

    dataChannel.onopen = async () => {
      result.canConnect = true;
      
      // Measure RTT
      const start = performance.now();
      dataChannel.send('ping');
      dataChannel.onmessage = () => {
        result.rtt = performance.now() - start;
        cleanup();
        resolve(result);
      };
    };

    pc2.ondatachannel = (e) => {
      e.channel.onmessage = (msg) => e.channel.send('pong');
    };

    const offer = await pc1.createOffer();
    await pc1.setLocalDescription(offer);
    await pc2.setRemoteDescription(offer);
    const answer = await pc2.createAnswer();
    await pc2.setLocalDescription(answer);
    await pc1.setRemoteDescription(answer);

    function cleanup() {
      clearTimeout(timeout);
      pc1.close();
      pc2.close();
    }
  });
}
```

## Debugging Checklist

When a WebRTC issue is reported, I run through this checklist:

1. **Signaling**
   - Are SDP offers/answers being exchanged correctly?
   - Are ICE candidates reaching the other peer?
   - Is the signaling channel (WebSocket/etc) stable?

2. **ICE**
   - What candidate types are being gathered? (host/srflx/relay)
   - Is a candidate pair being selected?
   - Check for ICE disconnected/failed states

3. **Media**
   - Is the local stream actually capturing? (check video.srcObject)
   - Are tracks being added to the peer connection?
   - Check getStats() for actual packet flow

4. **Network**
   - Is the user behind a restrictive firewall?
   - Are TURN servers accessible?
   - What's the round-trip time?

5. **Encoding/Decoding**
   - Check qualityLimitationReason
   - Look for encoder/decoder implementation (hardware vs software)
   - Monitor frame drops and decode stalls

## Final Thoughts

WebRTC debugging is part science, part art, and part endurance sport. The technology works remarkably well when it works, but when it fails, the failures are often subtle and environment-specific.

The key insights I've learned:

1. **Never trust connection state alone** — monitor actual media flow
2. **TURNS on 443 is your best friend** — it survives most firewalls
3. **Build device/browser capability databases** — track what works where
4. **Implement automatic recovery** — don't wait for users to refresh
5. **Collect diagnostics proactively** — you need data to debug production issues

WebRTC will only become more important as real-time communication becomes standard. The engineers who can debug these systems will be increasingly valuable.

---

*Next up: I'll be writing about building scalable SFU architectures for multi-party video calls. Follow along for more real-time media engineering content.*
