---
title: "Voice AI in 2025: Why Siri Still Sucks"
excerpt: Whisper, ElevenLabs, and voice cloning are incredible. So why does asking Siri to set a timer still fail? The state of voice AI explained.
category: deep-dives
publishedAt: 2025-01-20
tags:
  - AI
  - Voice
  - Whisper
  - ElevenLabs
coverImage: /blog/voice-ai-2025-why-siri-still-sucks.svg
featured: false
---

# Voice AI in 2025: Why Siri Still Sucks

I can clone anyone's voice with 30 seconds of audio. I can generate audiobooks that sound perfectly human. I can transcribe hour-long meetings with near-perfect accuracy.

But ask Siri to "play that song I was listening to yesterday" and she'll confidently play something I've never heard in my life.

The state of voice AI in 2025 is bizarre. The underlying technology is incredible. The products we interact with daily are still broken. Let me explain why, and what actually works.

## The Technology: What's Actually Possible

### Speech-to-Text (STT)

**Whisper** (OpenAI) changed everything. Before Whisper, accurate transcription required:
- Expensive commercial APIs
- Specific accents and clear audio
- Careful preprocessing

Now:

```python
import whisper

model = whisper.load_model("large-v3")
result = model.transcribe("meeting.mp3")
print(result["text"])
```

That's it. Works with accents, background noise, multiple speakers. Local, free, incredibly accurate.

**Accuracy comparison (my testing):**
| Service | Clean Audio | Background Noise | Accents |
|---------|-------------|------------------|---------|
| Whisper Large | 98% | 92% | 95% |
| Google Cloud STT | 96% | 85% | 88% |
| Siri (on-device) | 89% | 72% | 75% |
| Amazon Transcribe | 94% | 88% | 85% |

Whisper wins almost every benchmark. It's also open source and runs locally.

### Text-to-Speech (TTS)

**ElevenLabs** produces speech that's indistinguishable from human:

```python
from elevenlabs import generate, play

audio = generate(
    text="Hello, this is AI-generated speech.",
    voice="Rachel",
    model="eleven_multilingual_v2"
)
play(audio)
```

The quality is stunning. Emotional range, natural pacing, no robotic artifacts.

**Other notable options:**
- **Azure Neural Voices**: Good quality, cheaper at scale
- **Coqui TTS**: Open source, decent quality
- **Bark**: Open source, multilingual, can do non-speech sounds

### Voice Cloning

This is where it gets wild. With 30 seconds to 3 minutes of sample audio, you can clone any voice:

```python
from elevenlabs import clone, generate

cloned_voice = clone(
    name="My Voice Clone",
    files=["sample1.mp3", "sample2.mp3"]
)

audio = generate(
    text="I never actually said this.",
    voice=cloned_voice
)
```

Ethical implications aside (and there are many), the technology works. Professional voiceover quality from a few samples.

## So Why Does Siri Suck?

Given all this incredible tech, why do voice assistants still fail at basic tasks?

### 1. They're Not Using the Best Models

Siri runs mostly on-device for privacy. That means:
- Smaller models (can't fit GPT-4 on your phone)
- Limited context (can't remember what you said 5 minutes ago)
- Older architecture (Apple moves slowly)

Apple values privacy over capability. That's a legitimate choice, but it means Siri will always lag behind.

### 2. Intent Understanding is Hard

Voice assistants have to:
1. Transcribe speech (easy now)
2. Understand intent (hard)
3. Map to available actions (harder)
4. Execute reliably (hardest)

"Play that song from yesterday" requires:
- Knowing what "yesterday" means in context
- Accessing your listening history
- Figuring out which song you meant
- Having playback rights for that song

The transcription is fine. Everything else falls apart.

### 3. Walled Gardens

Siri can't:
- Access most third-party apps meaningfully
- Remember context across sessions
- Learn your preferences over time

It's deliberately constrained for privacy/security/business reasons.

### 4. Latency Requirements

Voice assistants need instant responses. Users won't wait 5 seconds like they do for ChatGPT. This means:
- Can't use the best models
- Limited reasoning time
- Aggressive response caching

Fast beats smart in voice UI.

## What Actually Works (My Setup)

Here's how I use voice AI productively:

### Transcription: Whisper Locally

I run Whisper for all my transcription needs:

```bash
# Install
pip install openai-whisper

# Transcribe anything
whisper recording.m4a --model large-v3 --output_format txt
```

Use cases:
- Meeting notes
- Voice memos to text
- Podcast transcripts
- Interview processing

**For real-time transcription:**
```python
import whisper
import sounddevice as sd
import numpy as np

model = whisper.load_model("base")  # Smaller for speed

def callback(indata, frames, time, status):
    # Process audio chunks in real-time
    audio_chunk = np.squeeze(indata)
    result = model.transcribe(audio_chunk, fp16=False)
    print(result["text"], end=" ", flush=True)

with sd.InputStream(callback=callback):
    print("Listening...")
    sd.sleep(60000)  # Listen for 60 seconds
```

### Voice Generation: ElevenLabs

For anything that needs natural speech:

```python
from elevenlabs import Voice, VoiceSettings, generate
import os

os.environ["ELEVEN_API_KEY"] = "your-key"

# Custom voice settings for consistency
my_voice_settings = VoiceSettings(
    stability=0.5,      # Lower = more expressive
    similarity_boost=0.8,
    style=0.0,
    use_speaker_boost=True
)

def speak(text: str, voice: str = "Rachel"):
    audio = generate(
        text=text,
        voice=Voice(
            voice_id=voice,
            settings=my_voice_settings
        ),
        model="eleven_multilingual_v2"
    )
    return audio
```

Use cases:
- Audiobook generation
- Video narration
- Accessibility features
- Content creation

### Personal Assistant: Custom Build

I gave up on Siri for complex tasks. Instead:

```python
# My janky but working personal assistant

import whisper
from openai import OpenAI
from elevenlabs import generate, play

whisper_model = whisper.load_model("base")
openai_client = OpenAI()

def listen() -> str:
    # Record audio...
    audio = record_audio(duration=5)
    result = whisper_model.transcribe(audio)
    return result["text"]

def think(text: str) -> str:
    response = openai_client.chat.completions.create(
        model="gpt-4-turbo",
        messages=[
            {"role": "system", "content": "You are a helpful assistant. Be concise."},
            {"role": "user", "content": text}
        ]
    )
    return response.choices[0].message.content

def speak(text: str):
    audio = generate(text=text, voice="Rachel")
    play(audio)

# Main loop
while True:
    print("Listening...")
    query = listen()
    print(f"You: {query}")
    
    response = think(query)
    print(f"Assistant: {response}")
    
    speak(response)
```

It's slower than Siri (2-3 seconds latency) but actually understands what I want.

## Real-Time Voice: The New Frontier

The next wave is real-time voice-to-voice AI:

**GPT-4o Voice** (when available):
- Direct audio input/output
- No text intermediary
- Sub-second latency
- Emotional understanding

**Current state:**
- Still in limited preview
- Latency varies (sometimes fast, sometimes not)
- Quality is impressive when it works

This is what makes Siri feel ancient. The technology for natural voice conversation exists—Apple/Google just haven't shipped it to consumers yet.

## Voice Cloning Ethics

Let's address the elephant: voice cloning is dangerous.

**Already happening:**
- Scam calls using cloned family member voices
- Fake celebrity endorsements
- Political misinformation

**Protections:**
- ElevenLabs requires consent acknowledgment
- Detection tools exist (but lag behind creation)
- Some jurisdictions passing laws

**My personal rules:**
- Only clone my own voice
- Never clone without explicit consent
- Never use for deception

The technology is incredible. Use it responsibly.

## Building Voice Features

If you're adding voice to your product:

### STT Pipeline

```typescript
// Next.js API route for transcription
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI();

export async function POST(req: Request) {
  const formData = await req.formData();
  const audioFile = formData.get('audio') as File;
  
  const transcription = await openai.audio.transcriptions.create({
    file: audioFile,
    model: 'whisper-1',
    response_format: 'verbose_json',
    timestamp_granularities: ['word']
  });
  
  return NextResponse.json({
    text: transcription.text,
    words: transcription.words
  });
}
```

### TTS Pipeline

```typescript
// Streaming TTS for lower latency
import { ElevenLabsClient } from 'elevenlabs';

const client = new ElevenLabsClient();

export async function streamSpeech(text: string): Promise<ReadableStream> {
  const audio = await client.generate({
    text,
    voice: 'Rachel',
    model_id: 'eleven_turbo_v2',  // Faster, slightly lower quality
    stream: true
  });
  
  return audio;
}
```

### Cost Comparison

| Service | Transcription | Generation |
|---------|---------------|------------|
| OpenAI Whisper API | $0.006/min | N/A |
| Whisper Local | Free (compute) | N/A |
| ElevenLabs | N/A | $0.30/1k chars |
| Azure Speech | $1/hr | $16/1M chars |
| Google Speech | $1.44/hr | $16/1M chars |

For heavy usage, local Whisper + Azure TTS is the cost-effective combo.

## The Future

**2025-2026 predictions:**

1. **Real-time voice-to-voice** becomes standard (GPT-4o style)
2. **On-device quality** improves significantly (Apple Silicon gets better)
3. **Voice cloning** faces regulation
4. **Multimodal** voice + vision AI in phones
5. **Siri** maybe, finally, stops sucking (I'll believe it when I see it)

The gap between what's possible and what we can use daily will shrink. But it'll take time.

## The Bottom Line

Voice AI technology is incredible:
- Whisper: Best-in-class transcription, free and local
- ElevenLabs: Human-quality synthesis
- Voice cloning: Spooky good (and spooky dangerous)

Voice AI products are still lacking:
- Siri: Reliable for timers, useless for anything complex
- Alexa: Same story
- Google Assistant: Slightly better, still frustrating

If you need reliable voice AI today:
1. Use Whisper for transcription
2. Use ElevenLabs/Azure for generation
3. Build your own assistant for complex tasks
4. Accept that Siri won't suddenly get good

The technology exists. The products will catch up. Eventually.

Maybe.

I'm still not holding my breath for Siri.

---

*The best voice AI is the one you build yourself. The second best is accepting that consumer assistants are for timers and weather.*
