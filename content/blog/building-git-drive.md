---
title: "Building git-drive: Turn Any External Drive Into a Git Backup"
excerpt: "I built git-drive to solve a simple problem: backing up my code to external drives without the cloud. Here's how it works and what I learned building it."
category: tutorials
publishedAt: 2026-02-26
tags:
  - git
  - cli
  - nodejs
  - typescript
  - open-source
coverImage: /blog/building-git-drive.svg
featured: true
seo:
  title: "git-drive: Turn Any External Drive Into a Git Remote Backup"
  description: "A deep dive into building git-drive, a CLI tool that turns any external drive into a git remote for local backups. Learn about the architecture, challenges, and implementation."
  keywords: ["git backup", "external drive git", "git remote", "cli tool", "nodejs cli", "typescript"]
---

# Building git-drive: Turn Any External Drive Into a Git Backup

Cloud backups are great. GitHub, GitLab, Bitbucket—they've saved my code more times than I can count. But sometimes you just want a local backup. Maybe you're on a plane. Maybe your internet is down. Maybe you're paranoid about someone else's servers.

I kept finding myself manually copying `.git` folders to external drives. It worked, but it was tedious and error-prone. So I built `git-drive`—a tool that turns any external drive into a proper git remote.

```bash
npm install -g git-drive
git-drive init
git-drive link
git push git-drive main
```

That's it. Your code is now backed up to an external drive, with full git history, branches, and everything else you expect from a remote.

## The Problem I Was Trying to Solve

I have a lot of code. Some of it's on GitHub, some on private servers, some... nowhere. The "nowhere" category worried me.

The manual approach looked like this:
1. Plug in external drive
2. Navigate to the right folder
3. Copy the entire project
4. Hope I didn't miss anything

This is not a backup strategy. This is a recipe for disaster.

What I wanted was something that treated my external drive like a real git remote:
- `git push git-drive main` should just work
- Full history, not just a snapshot
- Multiple repos on the same drive
- A way to see what's on each drive

## How It Works

Git-drive creates a `.git-drive` directory on your external drive. Inside, it stores bare git repositories—just like what GitHub has on their servers, but on a drive you can hold in your hand.

```
/Volumes/MyDrive/
└── .git-drive/
    ├── my-project.git/
    ├── another-repo.git/
    └── work-stuff.git/
```

When you run `git-drive link`, it:
1. Creates a bare repo on the drive (if it doesn't exist)
2. Adds the drive as a git remote called `git-drive`
3. Records metadata about the link

Then `git push git-drive main` pushes your code to the drive. Standard git, nothing magical.

## The Architecture

I structured git-drive as a monorepo with three packages:

```
git-drive/
├── packages/
│   ├── cli/       # The npm package users install
│   ├── server/    # Express API for the web UI
│   └── ui/        # React web interface
├── package.json
└── pnpm-workspace.yaml
```

### The CLI

The CLI is the main entry point. I used TypeScript with Node.js and the `prompts` library for interactive menus:

```typescript
// src/commands/init.ts
export async function init(args: string[]): Promise<void> {
  let drivePath: string;

  const rawPath = args[0];

  if (!rawPath) {
    // No argument provided - prompt user to select a drive
    const drives = await listDrives();

    if (drives.length === 0) {
      throw new GitDriveError(
        "No external drives found. Please connect a drive and try again."
      );
    }

    const { selectedDrive } = await prompts({
      type: "select",
      name: "selectedDrive",
      message: "Select a drive to initialize git-drive:",
      choices: drives.map((d: any) => ({
        title: `${d.filesystem} (${d.mounted}) - ${Math.round((d.available / d.blocks) * 100)}% free`,
        value: d.mounted,
      })),
    });

    drivePath = resolve(selectedDrive);
  }
  // ... create .git-drive directory
}
```

The `node-disk-info` package handles drive detection across platforms. It works on macOS, Windows, and Linux—though each platform has its quirks.

### The Auto-Server Feature

Here's something I'm proud of: the CLI automatically starts the server in the background when needed.

```typescript
// Commands that need the server
if (!NO_SERVER_COMMANDS.includes(command)) {
  await ensureServerRunning();
}
```

So when you run `git-drive link`, it:
1. Checks if the server is running on port 4483
2. If not, spawns it in the background
3. Waits for it to be ready
4. Then proceeds with the command

This means users don't have to think about running a separate server process. It just works.

### The Web UI

The CLI is great for quick operations, but sometimes you want to browse. The web UI (React + Tailwind) provides a visual interface:

![Git Drive Web UI - Drive List](/blog/images/git-drive-web-ui.png)

You can:
- See all connected drives at a glance
- Browse repositories and their contents
- View commit history with diffs
- Push changes directly from the UI
- Search repos with fuzzy matching

The commit viewer shows full diffs:

```tsx
function CommitViewer() {
  const { mountpoint, repoName, hash } = useParams();
  const [commit, setCommit] = useState<any>(null);

  useEffect(() => {
    axios.get(`/api/drives/${mountpoint}/repos/${repoName}/commits/${hash}`)
      .then(({ data }) => setCommit(data));
  }, [mountpoint, repoName, hash]);

  return (
    <div className="space-y-6">
      {/* Commit header with author, message, date */}
      {/* Diff viewer with syntax highlighting */}
    </div>
  );
}
```

## Technical Challenges

### Detecting Drives Cross-Platform

Different operating systems report drives differently. macOS uses `/Volumes/`, Windows uses drive letters, Linux uses `/mnt/` or `/media/`. The `node-disk-info` package abstracts this, but I still had to handle edge cases:

```typescript
// Filter out system drives
const drives = await listDrives();
const externalDrives = drives.filter(d => !d.isSystem);
```

### Multiple Drives

What happens when you have three external drives plugged in? Git-drive handles this by:
1. Storing config in `~/.git-drive/config.json` with the current drive path
2. Allowing users to specify which drive to use
3. Showing a menu when multiple drives are available

### The Git Operations

I'm just shelling out to git. It's not elegant, but it's reliable:

```typescript
import { execSync } from 'child_process';

export function isGitRepo(dir: string): boolean {
  try {
    execSync('git rev-parse --git-dir', { cwd: dir, stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}
```

Could I use a git library like `isomorphic-git`? Sure. But git is already installed on every developer's machine, and the CLI is battle-tested. Sometimes the simple solution is the right one.

### The Push Log

One feature I added that I'm particularly happy with: push logs. Every time you push to git-drive, it records:
- Who pushed (git username)
- When
- From which computer
- The source directory

```json
{
  "user": "Jose",
  "computer": "MacBook-Pro",
  "localDir": "/Users/jose/Developer/my-project",
  "date": "2026-02-26T08:30:00Z",
  "mode": "push"
}
```

This shows up in the web UI's history view, so you can see exactly when and where each push came from.

## What I Learned

### 1. Start with the CLI, Add UI Later

I built the CLI first. The web UI came later as a nice-to-have. This was the right call. The CLI is the core experience; everything else is enhancement.

### 2. Bare Repositories Are Simple

I overestimated how complex git bare repos would be. They're just... git repositories without a working directory. Everything I already knew about git applied.

```bash
git init --bare my-repo.git
```

That's it. That's a remote.

### 3. Cross-Platform is Hard

I developed on macOS. Windows users immediately found issues. Path separators, drive detection, permissions—each platform has its own opinions. The `node-disk-info` package helped, but I still had users reporting edge cases I never encountered.

### 4. Auto-Start is a UX Win

The auto-server feature was a late addition. Initially, users had to run `git-drive server` in a separate terminal. That's annoying. Making the CLI manage the server itself made the whole experience feel more polished.

## The CLI in Action

Here's what the CLI looks like:

![Git Drive CLI Menu](/blog/images/git-drive-cli.png)

```
git-drive - Turn any external drive into a git remote backup for your code

Commands:
  init                 Initialize git-drive on an external drive
  link                 Link current repo to a drive
  push                 Push current repo to drive
  list                 Show connected drives and their status
  status               Show detailed status of drives and repos
  server, start, ui    Start the git-drive web UI server

Options:
  -v, -V, --version    Show version number
  -h, --help           Show this help message
```

## Publishing to npm

Publishing git-drive was straightforward:

```bash
npm publish --access public
```

The package is scoped (not really, just `git-drive`), so it's publicly available:

```bash
npm install -g git-drive
```

I set up GitHub Actions to automatically publish on new releases. The CI builds the TypeScript, runs any tests, and publishes to npm using a token stored in repository secrets.

## Future Plans

Git-drive is functional, but there's more to do:

- **Encryption**: Encrypt repos on the drive for sensitive projects
- **Compression**: Reduce storage footprint
- **Incremental Sync**: Only push changed objects
- **Restore Command**: Easily restore from a drive to a new machine
- **Better Windows Support**: More testing and fixes for Windows edge cases

## Wrapping Up

Git-drive solves a specific problem: local git backups on external drives. It's not replacing GitHub. It's not replacing cloud backups. It's a complement—another tool in the toolbox.

The whole project is open source at [github.com/josmanvis/git-drive](https://github.com/josmanvis/git-drive). Issues and PRs welcome.

Sometimes the best tools are the ones that scratch your own itch. This one scratched mine. Maybe it'll scratch yours too.

---

*Install it: `npm install -g git-drive`*