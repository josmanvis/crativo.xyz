---
title: "Clawdbot: Your AI Assistant in Your Pocket (Not Just Another Chatbot)"
excerpt: I've been running an AI assistant through WhatsApp for months. Here's why Clawdbot is the bridge I didn't know I needed.
category: deep-dives
publishedAt: 2026-01-26
tags:
  - AI
  - Automation
  - CLI Tools
  - Node.js
coverImage: /blog/clawdbot-ai-assistant-in-your-pocket.svg
featured: false
---

# Clawdbot: Your AI Assistant in Your Pocket (Not Just Another Chatbot)

I have an AI assistant that I can text from my phone. Not a web interface I need to log into. Not an app with a subscription modal. Just... iMessage. Or WhatsApp. Or Telegram.

I text it like I text a friend. "Hey, what's the weather?" "Remind me about the standup in 30 minutes." "Check if there are any critical PRs waiting for review." It responds. It remembers context. It can actually *do things*.

This isn't some hypothetical future. I've been running this setup for months using [Clawdbot](https://github.com/clawdbot/clawdbot), and it's changed how I think about AI assistants.

## The Problem With AI Interfaces

Every AI product wants you to use *their* interface:

- ChatGPT has its web app and mobile app
- Claude has its web interface
- Gemini lives in Google's ecosystem
- Your company's AI lives in Slack

So you end up with five different chat apps, five different logins, five different contexts. None of them talk to each other. None of them integrate with your actual life.

And the worst part? None of them can *do* anything beyond answer questions. They're glorified search engines with personality.

## What Clawdbot Actually Is

Clawdbot is a gateway. It sits between messaging platforms (WhatsApp, Telegram, Discord, iMessage) and AI agents. You send a message through any of those platforms, Clawdbot routes it to an AI agent, and the response comes back through the same channel.

```
WhatsApp / Telegram / Discord / iMessage
        │
        ▼
  ┌───────────────────────────┐
  │          Gateway          │
  │                           │
  │   - Routes messages       │
  │   - Manages sessions      │
  │   - Handles media         │
  │   - Runs tools            │
  └───────────────────────────┘
        │
        ▼
    AI Agent (Pi, Claude, etc.)
```

But here's the magic: the AI isn't limited to answering questions. It can execute tools. Read files. Search the web. Control your computer. Send messages. Set reminders. Check your calendar.

## My Actual Setup

I run Clawdbot on my Mac. The gateway runs as a daemon, always listening. When I text my WhatsApp "assistant" number:

1. WhatsApp Web receives the message
2. Clawdbot intercepts it via the Baileys library
3. Message gets routed to a Pi agent (Claude under the hood)
4. The agent has access to dozens of tools: file operations, web search, calendar, reminders, terminal commands, and more
5. Response flows back through WhatsApp

```bash
# Install
npm install -g clawdbot@latest

# Onboard (sets up daemon + services)
clawdbot onboard --install-daemon

# Link WhatsApp (shows QR code)
clawdbot channels login

# Done. Text your assistant.
```

That's it. Four commands. Now I have an AI assistant in my pocket.

## Tools That Actually Work

The game-changer isn't the chat interface. It's the tools.

```typescript
// Example of what the AI can actually do:

// Read any file on my machine
tools.read("/Users/jose/project/src/index.ts")

// Search the web
tools.web_search("Next.js 15 release notes")

// Execute shell commands
tools.exec("git status")

// Set reminders (via system cron)
tools.cron({
  action: "add",
  text: "Review PR for auth refactor",
  schedule: "in 2 hours"
})

// Send messages to other platforms
tools.message({
  action: "send",
  target: "slack:engineering",
  message: "Build passed ✓"
})
```

When I'm on my phone and realize I forgot something at the office, I text: "What files did I edit today?" The AI checks my git history and tells me.

When I'm walking the dog and need to deploy: "Deploy the staging branch." It runs the commands.

When I'm in a meeting: "What's on my calendar tomorrow?" Done.

## The Multi-Platform Magic

WhatsApp is my primary channel because my phone always has it open. But the same setup works across:

- **Telegram**: Create a bot via BotFather, add the token to Clawdbot config
- **Discord**: Add a bot to your server, same deal
- **iMessage**: Works directly if you're on macOS (no additional setup)
- **Slack/Mattermost**: Via plugins

Different channels, same assistant, shared context.

```json
{
  "channels": {
    "whatsapp": {
      "enabled": true,
      "allowFrom": ["+1555123456"]
    },
    "telegram": {
      "enabled": true,
      "token": "your-bot-token"
    },
    "discord": {
      "enabled": true,
      "token": "your-bot-token"
    }
  }
}
```

## Sessions and Memory

One thing that surprised me: the AI actually maintains context. Each conversation thread becomes a "session" with its own history.

DMs to my assistant are one session. A group chat where I tag it is a separate session. Work stuff stays separate from personal stuff.

And with the right setup (workspace files like `MEMORY.md`), the AI can persist important information across sessions:

```markdown
# MEMORY.md

## User Preferences
- Prefers terse responses, no filler
- Timezone: EST
- Default git branch: main

## Active Projects
- crativo.xyz: Next.js portfolio site
- qortr: Room booking app (beta)
```

Next time I say "deploy crativo," it knows what I mean.

## The Node System (This Is Wild)

Clawdbot has this concept of "nodes" - paired devices that extend the assistant's capabilities.

My iPhone is a node. My Mac is a node. They connect to the gateway and expose device-specific features:

- **Camera**: "Take a photo" actually takes a photo from my phone's camera
- **Screen recording**: "Record my screen for 30 seconds"
- **Location**: "Where am I?" returns GPS coordinates
- **Canvas**: Render web views directly on devices

```bash
# On the node device (iPhone/Android)
# Pair with the gateway
clawdbot pair --gateway ws://192.168.1.100:18789
```

Now my AI can text me AND control my devices. We're living in the future.

## Automation (Cron Jobs for AI)

Here's where it gets useful for real work. Clawdbot supports cron jobs - scheduled tasks that the AI executes automatically.

```json
{
  "cron": {
    "jobs": [
      {
        "id": "daily-summary",
        "schedule": "0 9 * * *",
        "text": "Check my calendar, unread emails, and pending PRs. Give me a morning summary."
      },
      {
        "id": "deploy-check",
        "schedule": "*/30 * * * *",
        "text": "Check if the main branch build passed. If it did and there are changes, deploy to staging."
      }
    ]
  }
}
```

Every morning at 9 AM, I get a WhatsApp message with my day's overview. Every 30 minutes, the AI checks if anything needs deploying.

No more forgetting. No more checking dashboards. The AI just handles it.

## The Heartbeat System

For less rigid scheduling, there's the heartbeat system. The gateway periodically pings the AI with a "heartbeat" check. The AI can:

1. Do nothing (respond with `HEARTBEAT_OK`)
2. Check a few things proactively (emails, calendar, weather)
3. Reach out if something needs attention

```markdown
# HEARTBEAT.md

On heartbeat, check:
- [ ] Any urgent unread emails?
- [ ] Calendar events in next 2 hours?
- [ ] Any @mentions I missed?

If nothing urgent, reply HEARTBEAT_OK.
```

It's like having an assistant who occasionally checks in: "Hey, just wanted to let you know you have a meeting in 30 minutes."

## Skills (Composable Capabilities)

Tools are low-level. Skills are higher-level capabilities - collections of tools and instructions for specific tasks.

I have skills for:

- **Apple Reminders**: Create, list, complete reminders via `remindctl`
- **GitHub**: Check PRs, issues, CI status via the `gh` CLI
- **Weather**: Current conditions and forecasts
- **Project management**: Interact with my Planka board

```markdown
# SKILL.md (simplified)

Name: github
Description: Interact with GitHub repos

## Common Commands
- `gh pr list`: Show open PRs
- `gh issue list`: Show issues
- `gh run list`: Show CI runs

## Examples
"What PRs need review?" → gh pr list --search "review-requested:@me"
```

The AI reads the skill file, understands the available tools, and uses them appropriately.

## Security (Because This Is Terrifying)

Yes, I'm giving an AI access to my computer. Yes, this is terrifying. Here's how I mitigate:

### 1. Allowlists

```json
{
  "channels": {
    "whatsapp": {
      "allowFrom": ["+1555123456"]  // Only my number
    }
  }
}
```

Only messages from my phone number get processed. Random people can't just text my assistant.

### 2. Gateway Token

```bash
clawdbot gateway --token my-secret-token
```

All client connections must authenticate. No token, no access.

### 3. Elevated Permissions

Dangerous operations (system commands, file deletion) require explicit confirmation. The AI asks before running anything destructive.

### 4. Local-First

The gateway binds to `127.0.0.1` by default. External access requires explicit configuration (Tailscale, SSH tunnel).

Is it perfectly secure? No. But I'm careful about what I enable, and the convenience is worth the calculated risk.

## What I Actually Use It For

Daily:

- **Morning briefing**: Calendar, weather, unread messages
- **Quick lookups**: "What's the syntax for CSS container queries?"
- **Git operations**: "What changed since yesterday?" "Push to main"
- **Reminders**: "Remind me to call the dentist at 3pm"

Weekly:

- **Project management**: "What's in my AI To-Do list on Planka?"
- **Blog writing**: "Write an article about [topic]" (it does the research and drafting)
- **Code review**: "Check the open PRs for security issues"

The key insight: an AI that can *act* is 10x more useful than an AI that can only *answer*.

## Why Not Just Use ChatGPT/Claude Directly?

Three reasons:

1. **Tools**: ChatGPT can't run `git push`. Claude can't check my calendar. Clawdbot-connected agents can.

2. **Integration**: I don't want another app. I want AI in the apps I already use. Texting is universal.

3. **Control**: My data, my machine, my rules. I know exactly what tools are available and what the AI can access.

## Getting Started

If this sounds useful to you:

```bash
# Install
npm install -g clawdbot@latest

# Run the setup wizard
clawdbot onboard

# Link a channel (WhatsApp, Telegram, etc.)
clawdbot channels login

# Start the gateway (or use the daemon)
clawdbot gateway
```

The [documentation](https://docs.clawd.bot) is solid. The [Discord community](https://discord.com/invite/clawd) is helpful.

Fair warning: there's a learning curve. This isn't a polished consumer product. It's a power tool for people who like to tinker.

## The Future of AI Assistants

I don't think the future of AI is more chatbots or bigger context windows. I think it's integration.

AI that lives in your existing tools. AI that can see what you see. AI that can do what you can do. AI that's *there* when you need it, not hidden behind a browser tab.

Clawdbot isn't the only way to build this future, but it's the closest I've found to actually living in it.

---

*The space lobster in my pocket has become surprisingly indispensable. EXFOLIATE! EXFOLIATE!* 🦞
