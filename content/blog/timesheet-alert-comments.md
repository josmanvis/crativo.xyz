---
title: "I Built an App to Nag Me About Timesheets (and It Takes Screenshots)"
excerpt: "Nobody remembers what they did on Tuesday when the timesheet is due on Friday. So I built a little macOS app that interrupts on a schedule, asks what you're doing, and saves the answer, with a screenshot."
category: devtools
publishedAt: "2026-08-28"
tags:
  - macos
  - swift
  - productivity
  - side-project
featured: false
---

There's a special kind of dread that arrives on Friday afternoons. The timesheet is due. It's empty. And you're sitting there trying to reconstruct your week from Slack scrollback, git logs and vibes.

"What did I do Tuesday morning?" Nobody knows. Not even Tuesday-morning me.

So I built **Timesheet Alert Comments**, a small macOS app with one job: ask me what I'm working on *while I'm working on it*, and write it down.

## How it works

**Periodic alerts.** On a schedule, the app pops up and asks for a quick note about what you're doing. Not a full form. Just a line.

**Easy commenting.** Type a few words: "fixing the hand-raise reconnect bug," "PR review for the attendee list," "meeting that could've been an email." Hit enter, back to work in seconds.

**Auto screenshots.** This is the part I love. When the alert fires, the app **captures your screen** at that moment and attaches it to the entry. So when your note just says "debugging," Friday-you can look at the screenshot and see *exactly* what you were debugging.

**Markdown logs.** Everything is saved as Markdown, either as one big log or one file per entry. Plain text. Greppable. Readable in any editor. No database, no lock-in.

## Why screenshots are the killer feature

Notes written in the moment are short and full of context only *you* had at the time. "Fixed the thing" means something at 10:14 a.m. and nothing at 4:50 p.m. on Friday.

A screenshot captures the context your note left out: the file you had open, the ticket on the other monitor, the error message. It turns a vague log into an actual record of your day.

(Yes, screenshots of your screen are sensitive. They stay local, on your machine, in your log folder. That's the point: it's a memory aid for you, not a surveillance tool for anyone else.)

## Why Markdown

I could have built a database and a fancy dashboard. But the whole goal was **less friction**, and Markdown is the lowest-friction format there is:

- open it in any editor
- search it with `grep`
- paste chunks straight into a timesheet or a standup update
- keep it in a folder that syncs however you already sync folders

A tool that saves text you can read without the tool will outlive the tool.

## Installing it

I wanted it to be easy to install, so there are three ways:

```bash
# Homebrew
brew install josmanvis/timesheet-alert-comments/timesheet-alert-comments

# or the quick installer
curl -sL https://raw.githubusercontent.com/josmanvis/timesheet-alert-comments/main/install.sh | bash
```

Or grab the `.dmg` or `.pkg` from the GitHub releases page if you prefer clicking things.

## The real lesson

Most productivity tools fail because they ask you to change how you work. This one just asks for **five seconds, a few times a day**, and handles the rest.

That's the pattern I keep coming back to with my own tools: find the annoying moment, and make the smallest possible thing that removes it. In this case, the annoying moment was Friday at 4:50 p.m. Now Friday-me just opens a Markdown file and copies.
