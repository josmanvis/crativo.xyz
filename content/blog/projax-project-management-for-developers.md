---
title: Building Projax - A Developer's Project Dashboard
excerpt: How I built a cross-platform project management tool with CLI, TUI, desktop app, and VS Code extension.
category: tools
publishedAt: 2025-01-10
tags:
  - TypeScript
  - CLI
  - VS Code
  - Monorepo
  - Developer Tools
featured: true
---

# Building Projax: A Developer's Project Dashboard

My `~/Developer` folder is a graveyard of good intentions. **213 projects** at last count. Two hundred and thirteen folders accumulated over eight years of side projects, client work, hackathons, tutorials, "quick tests," 3am ideas, and things I was "definitely going to get back to."

I counted them. I actually sat down and ran `ls -la ~/Developer | wc -l` and stared at the number.

The names don't even make sense anymore:

```
ace/
analytics-dashboard-v2/
bb-redux-thing/
client-portal-OLD/
crativo.xyz/
demo-for-mike/
express-test/
floatnote/
hmm-test/
josetunes/
keyboard-experiment/
lolwut/
new-portfolio/
new-portfolio-2/
new-portfolio-FINAL/
on24-hackathon-2023/
pizzatime/
projax/
qortr/
quick-api-test/
react-experiments/
spicy-meatball/
tauri-test/
test123/
thing/
thing2/
thing3-final/
thing3-final-ACTUAL/
too-bored/
vids-matrix-driven-css/
wedding-site/
wtf-delete-this/
xylophone-api/
zzz-archive/
...
```

What the hell is `spicy-meatball`? I have absolutely no memory of creating this. It has 47 commits. Forty-seven commits of code I wrote, apparently for something called spicy-meatball, with commit messages like "fix the thing" and "ok this works now" and "WHY." Past me was not a helpful documentarian.

Why do I have `thing`, `thing2`, `thing3-final`, AND `thing3-final-ACTUAL`? What happened between thing3-final and thing3-final-ACTUAL that was so significant it needed a whole new folder? The git history reveals nothing—both have initial commits dated the same day, three years ago.

`demo-for-mike`—I don't know anyone named Mike. Did I? Was there a Mike? The project is a React dashboard with fake data for a company called "Acme Corp." I have no memory of Mike or Acme Corp.

`xylophone-api` contains a REST API that returns... xylophone sounds? It has 12 endpoints and a comprehensive test suite. It is the most well-documented project in my entire folder. I have never played a xylophone in my life.

`wedding-site` is concerning because I'm not married and haven't been engaged. It's a full-featured wedding RSVP system with meal selection, plus-one handling, and a custom seating chart algorithm. It's actually quite good. Whose wedding was this for?

This is the archaeology of a developer's life. Every folder is a time capsule from a version of me that had different priorities, different interests, sometimes apparently different friends named Mike who needed dashboards.

## The Problem (Beyond the Existential Crisis)

The naming chaos is philosophical. The practical problem is worse.

I'd be working on a new project—let's say qortr, my current focus—and I'd need to check something on one of my other apps. Basic questions:

- **"Is floatnote's dev server running?"** I could check Activity Monitor. Or run `lsof -i :3000`. Or just try to start it and see if the port is taken. None of these tell me which project.

- **"Did I push my last changes to josetunes?"** Open the folder, run `git status`, check remote. But wait, which folder? I have josetunes in ~/Developer but also a backup in ~/Projects from when I reorganized two years ago. Are they the same? Different commits? I need to check both.

- **"What port does the wedding site run on?"** Open package.json, find the dev script, trace through to the vite config, find the port. Or was it in .env? Or hardcoded somewhere? Or maybe it just uses the default and I need to remember what Vite's default is.

- **"Which of my projects have uncommitted changes?"** This one's fun. I could write a bash script to iterate through directories and run git status. I have written this script. I've written it at least four times, in different places, with slightly different output formats. I can never find any of them when I need them.

- **"Is it safe to delete analytics-dashboard-v2?"** Well, when did I last touch it? Is there anything unique in there? Did I ever push it anywhere? Is there a v3 somewhere that superseded it? The only way to know is to open it, poke around, read old code, and hope I remember context from three years ago.

Multiply this by 213 projects. Multiply that by every time I sit down to code. I was spending 15-20 minutes some days just figuring out the state of my own machine before I could start actual work.

I needed a dashboard. Not a notes app where I manually track stuff. Not a spreadsheet. An actual system that scans my projects and tells me what's going on.

So I built projax.

## The False Starts

Before I built it right, I built it wrong several times.

### Attempt 1: The Bash Script

```bash
#!/bin/bash
for dir in ~/Developer/*/; do
  if [ -d "$dir/.git" ]; then
    echo "=== $dir ==="
    cd "$dir"
    git status --short
    cd ..
  fi
done
```

This worked, sort of. It showed me git status for everything. But:
- No port detection
- No filtering (show me only dirty repos)
- No interactivity
- Slow (running git 213 times serially takes a while)
- The output was a wall of text

I used this for about a week before the limitations drove me crazy.

### Attempt 2: The Node Script

```javascript
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const devDir = path.join(process.env.HOME, 'Developer');

fs.readdirSync(devDir).forEach(name => {
  const projectPath = path.join(devDir, name);
  const packageJsonPath = path.join(projectPath, 'package.json');
  
  if (fs.existsSync(packageJsonPath)) {
    const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    console.log(`${name}: ${pkg.description || 'No description'}`);
    
    // Check git
    try {
      const status = execSync('git status --porcelain', { cwd: projectPath, encoding: 'utf-8' });
      if (status.trim()) {
        console.log('  ⚠️  Uncommitted changes');
      }
    } catch (e) {
      // Not a git repo
    }
  }
});
```

Better! Now I had:
- Package metadata
- Git status
- Filtering capability

But still problems:
- No port detection
- No way to act on projects (open, run scripts)
- Still just a script I had to run manually
- I kept editing it for new features and breaking it

### Attempt 3: The Electron App

I thought: "I need a real app. With a GUI. Something that lives in my menu bar and shows me project status at a glance."

I spent a weekend building an Electron app. It had:
- Tray icon with project count
- Dropdown showing all projects
- Color coding for git status
- Click to open in VS Code

It was 200MB and used 300MB of RAM to show me a list of folders. The irony of building a bloated app to manage my projects—many of which were experiments in reducing bloat—was not lost on me.

I used it for two days before the RAM usage bothered me too much.

### Attempt 4: The CLI (That Actually Worked)

I stepped back. What did I actually need?

1. **Scan directories and detect projects** — The core logic
2. **Multiple ways to access that data** — CLI for quick queries, TUI for browsing, GUI for extended use
3. **Shared foundation** — Don't rebuild detection logic for each interface

This was the architecture insight: separate the *what* (project detection) from the *how* (presentation). Build a core package that does all the heavy lifting, then build thin interfaces on top.

## Architecture: Monorepo With Shared Core

```
projax/
├── packages/
│   ├── core/              # The brain
│   │   ├── src/
│   │   │   ├── scanner.ts      # Directory traversal
│   │   │   ├── analyzers/      # Per-ecosystem analysis
│   │   │   │   ├── node.ts     # package.json parsing
│   │   │   │   ├── rust.ts     # Cargo.toml parsing
│   │   │   │   ├── python.ts   # pyproject.toml parsing
│   │   │   │   └── go.ts       # go.mod parsing
│   │   │   ├── git.ts          # Git operations
│   │   │   ├── ports.ts        # Port detection & monitoring
│   │   │   ├── cache.ts        # Result caching
│   │   │   └── types.ts        # Shared interfaces
│   │   └── package.json
│   │
│   ├── cli/               # `projax` command
│   │   ├── src/
│   │   │   ├── commands/
│   │   │   │   ├── list.ts
│   │   │   │   ├── info.ts
│   │   │   │   ├── run.ts
│   │   │   │   ├── ports.ts
│   │   │   │   └── status.ts
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   ├── tui/               # Interactive terminal UI
│   │   ├── src/
│   │   │   ├── App.tsx
│   │   │   ├── components/
│   │   │   │   ├── ProjectList.tsx
│   │   │   │   ├── ProjectDetail.tsx
│   │   │   │   └── StatusBar.tsx
│   │   │   └── index.tsx
│   │   └── package.json
│   │
│   ├── api/               # REST API (for web/desktop)
│   │   ├── src/
│   │   │   ├── server.ts
│   │   │   └── routes/
│   │   └── package.json
│   │
│   ├── desktop/           # Electron menu bar app
│   │   ├── src/
│   │   │   ├── main.ts
│   │   │   ├── tray.ts
│   │   │   └── renderer/
│   │   └── package.json
│   │
│   └── vscode/            # VS Code extension
│       ├── src/
│       │   ├── extension.ts
│       │   ├── providers/
│       │   └── commands/
│       └── package.json
│
├── pnpm-workspace.yaml
├── tsconfig.base.json
└── package.json
```

The monorepo structure means:

1. **`@projax/core`** is the foundation. It has zero dependencies on any interface. You could use it in a web app, a CLI, an Electron app, whatever.

2. **Each interface package** depends on `@projax/core` and adds its own presentation layer. They're thin wrappers.

3. **Type safety flows through everything.** The `Project` interface is defined once in core, and TypeScript ensures all interfaces handle projects consistently.

4. **One commit can touch everything.** If I add a new field to project detection, I can update the CLI output, TUI display, and VS Code extension in the same commit. No coordination overhead.

## The Core: Project Detection

The `@projax/core` package is where the real work happens. Let me walk through it in detail.

### The Project Interface

```typescript
// packages/core/src/types.ts

export interface Project {
  // ====== Identity ======
  name: string;                    // From package.json name or folder name
  path: string;                    // Absolute path
  relativePath: string;            // Relative to scan root
  
  // ====== Ecosystem ======
  type: ProjectType;               // 'node' | 'rust' | 'python' | 'go' | 'unknown'
  framework?: Framework;           // 'react' | 'vue' | 'svelte' | 'next' | etc
  packageManager?: PackageManager; // 'npm' | 'yarn' | 'pnpm' | 'bun' | 'cargo' | 'pip'
  
  // ====== Scripts & Commands ======
  scripts: Record<string, string>; // All available scripts
  mainScript?: string;             // Primary dev script ('dev', 'start', etc)
  buildScript?: string;            // Build command
  testScript?: string;             // Test command
  
  // ====== Ports ======
  configuredPorts: number[];       // Ports defined in config
  conventionalPorts: number[];     // Ports assumed by convention
  runningPorts: number[];          // Ports currently in use by this project
  
  // ====== Testing ======
  hasTests: boolean;
  testFramework?: TestFramework;
  testDirectory?: string;
  
  // ====== Git ======
  isGitRepo: boolean;
  gitBranch?: string;
  gitStatus: GitStatus;
  uncommittedFiles: number;
  untrackedFiles: number;
  lastCommitHash?: string;
  lastCommitMessage?: string;
  lastCommitDate?: Date;
  hasRemote: boolean;
  aheadOfRemote: number;
  behindRemote: number;
  
  // ====== Metadata ======
  description?: string;
  version?: string;
  author?: string;
  license?: string;
  homepage?: string;
  repository?: string;
  
  // ====== Stats ======
  createdAt: Date;                 // Folder creation time
  lastModified: Date;              // Most recent file change
  sizeOnDisk?: number;             // Bytes (optional, expensive to calculate)
  
  // ====== Dependencies ======
  dependencies: Dependency[];
  devDependencies: Dependency[];
  peerDependencies: Dependency[];
}

export type ProjectType = 'node' | 'rust' | 'python' | 'go' | 'ruby' | 'unknown';
export type PackageManager = 'npm' | 'yarn' | 'pnpm' | 'bun' | 'cargo' | 'pip' | 'poetry' | 'gem';
export type GitStatus = 'clean' | 'dirty' | 'untracked' | 'conflict' | 'not-a-repo';
export type Framework = 'react' | 'vue' | 'svelte' | 'angular' | 'next' | 'nuxt' | 'remix' | 'astro' | 'solid' | 'express' | 'fastify' | 'nest' | 'tauri' | 'electron';
export type TestFramework = 'jest' | 'vitest' | 'mocha' | 'ava' | 'tap' | 'pytest' | 'cargo-test' | 'rspec';

export interface Dependency {
  name: string;
  version: string;
  isLocal: boolean;      // workspace: or file: dependency
  isOutdated?: boolean;  // Optional, expensive to check
}
```

This is the contract. Every interface knows exactly what data it can expect from a project.

### The Scanner

Scanning 213 projects needs to be fast. I use a two-pass approach:

**Pass 1: Discovery** — Find all project roots quickly. Don't analyze yet.

**Pass 2: Analysis** — Analyze discovered projects in parallel.

```typescript
// packages/core/src/scanner.ts

import { readdir, stat } from 'fs/promises';
import path from 'path';
import pLimit from 'p-limit';

const PROJECT_MARKERS = [
  'package.json',      // Node.js
  'Cargo.toml',        // Rust
  'pyproject.toml',    // Python (modern)
  'setup.py',          // Python (legacy)
  'go.mod',            // Go
  'Gemfile',           // Ruby
];

const IGNORE_DIRS = new Set([
  'node_modules',
  '.git',
  'dist',
  'build',
  '.next',
  '.nuxt',
  'target',          // Rust
  '__pycache__',     // Python
  '.venv',
  'venv',
  'vendor',
  '.cache',
  'coverage',
]);

interface ScanOptions {
  maxDepth?: number;
  concurrency?: number;
  includeHidden?: boolean;
}

export async function scanDirectory(
  rootPath: string,
  options: ScanOptions = {}
): Promise<Project[]> {
  const { maxDepth = 4, concurrency = 10, includeHidden = false } = options;
  
  // Pass 1: Discover project roots
  const projectPaths: string[] = [];
  
  async function discover(currentPath: string, depth: number) {
    if (depth > maxDepth) return;
    
    let entries;
    try {
      entries = await readdir(currentPath, { withFileTypes: true });
    } catch (error) {
      // Permission denied or other access error
      return;
    }
    
    // Check if this directory is a project root
    const hasMarker = PROJECT_MARKERS.some(marker =>
      entries.some(e => e.name === marker && e.isFile())
    );
    
    if (hasMarker) {
      projectPaths.push(currentPath);
      // Don't descend into project directories
      // (we don't want to find node_modules/*/package.json)
      return;
    }
    
    // Recurse into subdirectories
    const subdirs = entries.filter(e => {
      if (!e.isDirectory()) return false;
      if (IGNORE_DIRS.has(e.name)) return false;
      if (!includeHidden && e.name.startsWith('.')) return false;
      return true;
    });
    
    await Promise.all(
      subdirs.map(entry =>
        discover(path.join(currentPath, entry.name), depth + 1)
      )
    );
  }
  
  await discover(rootPath, 0);
  
  // Pass 2: Analyze discovered projects in parallel
  const limit = pLimit(concurrency);
  
  const projects = await Promise.all(
    projectPaths.map(projectPath =>
      limit(() => analyzeProject(projectPath, rootPath))
    )
  );
  
  return projects.filter((p): p is Project => p !== null);
}

async function analyzeProject(
  projectPath: string,
  rootPath: string
): Promise<Project | null> {
  try {
    // Detect project type and delegate to specific analyzer
    const type = await detectProjectType(projectPath);
    
    const baseProject: Partial<Project> = {
      path: projectPath,
      relativePath: path.relative(rootPath, projectPath),
      name: path.basename(projectPath),
      type,
    };
    
    // Get ecosystem-specific data
    const ecosystemData = await analyzeByType(projectPath, type);
    
    // Get git data
    const gitData = await analyzeGit(projectPath);
    
    // Get port data
    const portData = await analyzePorts(projectPath, ecosystemData.scripts || {});
    
    // Get file stats
    const statsData = await analyzeStats(projectPath);
    
    return {
      ...baseProject,
      ...ecosystemData,
      ...gitData,
      ...portData,
      ...statsData,
    } as Project;
  } catch (error) {
    console.error(`Error analyzing ${projectPath}:`, error);
    return null;
  }
}

async function detectProjectType(projectPath: string): Promise<ProjectType> {
  const entries = await readdir(projectPath);
  
  if (entries.includes('package.json')) return 'node';
  if (entries.includes('Cargo.toml')) return 'rust';
  if (entries.includes('pyproject.toml') || entries.includes('setup.py')) return 'python';
  if (entries.includes('go.mod')) return 'go';
  if (entries.includes('Gemfile')) return 'ruby';
  
  return 'unknown';
}
```

Scanning my 213 projects takes about 1.2 seconds on my M1 MacBook Pro. Most of that time is git operations (checking status, branch, remote). The filesystem stuff is nearly instant with the parallel approach.

### Node.js Analysis

The most complex analyzer is for Node.js projects because there's so much variety in how people configure them:

```typescript
// packages/core/src/analyzers/node.ts

import { readFile } from 'fs/promises';
import path from 'path';

interface PackageJson {
  name?: string;
  version?: string;
  description?: string;
  scripts?: Record<string, string>;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  author?: string | { name: string; email?: string };
  license?: string;
  homepage?: string;
  repository?: string | { url: string };
}

export async function analyzeNodeProject(
  projectPath: string
): Promise<Partial<Project>> {
  const packageJsonPath = path.join(projectPath, 'package.json');
  const content = await readFile(packageJsonPath, 'utf-8');
  const pkg: PackageJson = JSON.parse(content);
  
  // Detect package manager
  const packageManager = await detectPackageManager(projectPath);
  
  // Detect framework
  const framework = detectFramework(pkg);
  
  // Parse scripts
  const scripts = pkg.scripts || {};
  const mainScript = findMainScript(scripts);
  const buildScript = findBuildScript(scripts);
  const testScript = findTestScript(scripts);
  
  // Detect test framework
  const testFramework = detectTestFramework(pkg, projectPath);
  
  // Parse author
  const author = typeof pkg.author === 'string' 
    ? pkg.author 
    : pkg.author?.name;
  
  // Parse repository
  const repository = typeof pkg.repository === 'string'
    ? pkg.repository
    : pkg.repository?.url?.replace(/^git\+/, '').replace(/\.git$/, '');
  
  return {
    name: pkg.name || path.basename(projectPath),
    type: 'node',
    framework,
    packageManager,
    scripts,
    mainScript,
    buildScript,
    testScript,
    hasTests: !!testScript || await hasTestFiles(projectPath),
    testFramework,
    description: pkg.description,
    version: pkg.version,
    author,
    license: pkg.license,
    homepage: pkg.homepage,
    repository,
    dependencies: parseDependencies(pkg.dependencies),
    devDependencies: parseDependencies(pkg.devDependencies),
    peerDependencies: parseDependencies(pkg.peerDependencies),
  };
}

async function detectPackageManager(projectPath: string): Promise<PackageManager> {
  const entries = await readdir(projectPath);
  
  // Check lock files in order of preference
  if (entries.includes('pnpm-lock.yaml')) return 'pnpm';
  if (entries.includes('bun.lockb')) return 'bun';
  if (entries.includes('yarn.lock')) return 'yarn';
  if (entries.includes('package-lock.json')) return 'npm';
  
  // Check for packageManager field in package.json
  try {
    const pkgPath = path.join(projectPath, 'package.json');
    const pkg = JSON.parse(await readFile(pkgPath, 'utf-8'));
    if (pkg.packageManager) {
      const pm = pkg.packageManager.split('@')[0];
      if (['npm', 'yarn', 'pnpm', 'bun'].includes(pm)) {
        return pm as PackageManager;
      }
    }
  } catch {}
  
  return 'npm'; // Default
}

function detectFramework(pkg: PackageJson): Framework | undefined {
  const allDeps = {
    ...pkg.dependencies,
    ...pkg.devDependencies,
  };
  
  // Order matters - check more specific frameworks first
  if (allDeps['next']) return 'next';
  if (allDeps['nuxt']) return 'nuxt';
  if (allDeps['@remix-run/node'] || allDeps['@remix-run/react']) return 'remix';
  if (allDeps['astro']) return 'astro';
  if (allDeps['@nestjs/core']) return 'nest';
  if (allDeps['@tauri-apps/api']) return 'tauri';
  if (allDeps['electron']) return 'electron';
  if (allDeps['solid-js']) return 'solid';
  if (allDeps['svelte']) return 'svelte';
  if (allDeps['vue']) return 'vue';
  if (allDeps['@angular/core']) return 'angular';
  if (allDeps['react']) return 'react';
  if (allDeps['fastify']) return 'fastify';
  if (allDeps['express']) return 'express';
  
  return undefined;
}

function findMainScript(scripts: Record<string, string>): string | undefined {
  // Priority order for "the thing you run to develop"
  const candidates = [
    'dev',
    'start:dev',
    'develop',
    'serve',
    'start',
    'watch',
  ];
  
  for (const name of candidates) {
    if (scripts[name]) return name;
  }
  
  // Check for any script that includes common dev server commands
  for (const [name, command] of Object.entries(scripts)) {
    if (
      command.includes('vite') ||
      command.includes('next dev') ||
      command.includes('webpack serve') ||
      command.includes('nodemon')
    ) {
      return name;
    }
  }
  
  return undefined;
}

function detectTestFramework(
  pkg: PackageJson,
  projectPath: string
): TestFramework | undefined {
  const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
  
  if (allDeps['vitest']) return 'vitest';
  if (allDeps['jest']) return 'jest';
  if (allDeps['mocha']) return 'mocha';
  if (allDeps['ava']) return 'ava';
  if (allDeps['tap'] || allDeps['@tapjs/core']) return 'tap';
  
  return undefined;
}
```

### Port Detection: The Nightmare

This is the feature that took the longest to get right. Ports can be defined in so many places:

1. **Script arguments:** `vite --port 3001`
2. **Config files:** `vite.config.ts`, `next.config.js`, `webpack.config.js`
3. **Environment files:** `.env`, `.env.local`, `.env.development`
4. **Hardcoded in source:** `app.listen(8080)`
5. **Convention:** Vite defaults to 5173, Next.js to 3000, etc.

And that's just Node.js. Rust projects have different conventions, Python projects have Flask/Django defaults, etc.

```typescript
// packages/core/src/ports.ts

import { readFile } from 'fs/promises';
import path from 'path';
import { parse as parseEnv } from 'dotenv';

export interface PortInfo {
  configuredPorts: number[];
  conventionalPorts: number[];
  runningPorts: number[];
}

export async function analyzePorts(
  projectPath: string,
  scripts: Record<string, string>
): Promise<PortInfo> {
  const configuredPorts: Set<number> = new Set();
  const conventionalPorts: Set<number> = new Set();
  
  // 1. Check scripts for explicit ports
  const scriptPorts = extractPortsFromScripts(scripts);
  scriptPorts.forEach(p => configuredPorts.add(p));
  
  // 2. Check config files
  const configPorts = await extractPortsFromConfigs(projectPath);
  configPorts.forEach(p => configuredPorts.add(p));
  
  // 3. Check environment files
  const envPorts = await extractPortsFromEnv(projectPath);
  envPorts.forEach(p => configuredPorts.add(p));
  
  // 4. Apply conventions if no explicit ports found
  if (configuredPorts.size === 0) {
    const conventional = getConventionalPorts(projectPath, scripts);
    conventional.forEach(p => conventionalPorts.add(p));
  }
  
  // 5. Check which ports are currently running
  const allPorts = [...configuredPorts, ...conventionalPorts];
  const runningPorts = await checkRunningPorts(projectPath, allPorts);
  
  return {
    configuredPorts: Array.from(configuredPorts),
    conventionalPorts: Array.from(conventionalPorts),
    runningPorts,
  };
}

function extractPortsFromScripts(scripts: Record<string, string>): number[] {
  const ports: number[] = [];
  
  for (const script of Object.values(scripts)) {
    // --port 3000, --port=3000, -p 3000, -p=3000
    const portMatches = script.matchAll(/(?:--port|--PORT|-p)[=\s]+(\d+)/gi);
    for (const match of portMatches) {
      const port = parseInt(match[1]);
      if (port > 0 && port < 65536) {
        ports.push(port);
      }
    }
    
    // PORT=3000 (inline env)
    const envMatches = script.matchAll(/\bPORT[=](\d+)/g);
    for (const match of envMatches) {
      ports.push(parseInt(match[1]));
    }
  }
  
  return ports;
}

async function extractPortsFromConfigs(projectPath: string): Promise<number[]> {
  const ports: number[] = [];
  
  // Vite config
  try {
    const viteConfig = await readConfigFile(projectPath, [
      'vite.config.ts',
      'vite.config.js',
      'vite.config.mjs',
    ]);
    if (viteConfig) {
      const portMatch = viteConfig.match(/port\s*:\s*(\d+)/);
      if (portMatch) ports.push(parseInt(portMatch[1]));
    }
  } catch {}
  
  // Next.js (usually in package.json scripts, but can be in next.config.js)
  try {
    const nextConfig = await readConfigFile(projectPath, [
      'next.config.js',
      'next.config.mjs',
      'next.config.ts',
    ]);
    if (nextConfig) {
      // Next.js port is typically in scripts, not config
    }
  } catch {}
  
  // Webpack dev server
  try {
    const webpackConfig = await readConfigFile(projectPath, [
      'webpack.config.js',
      'webpack.config.ts',
    ]);
    if (webpackConfig) {
      const portMatch = webpackConfig.match(/port\s*:\s*(\d+)/);
      if (portMatch) ports.push(parseInt(portMatch[1]));
    }
  } catch {}
  
  return ports;
}

async function extractPortsFromEnv(projectPath: string): Promise<number[]> {
  const ports: number[] = [];
  const envFiles = ['.env', '.env.local', '.env.development', '.env.development.local'];
  
  for (const envFile of envFiles) {
    try {
      const content = await readFile(path.join(projectPath, envFile), 'utf-8');
      const parsed = parseEnv(content);
      
      // Check common port variable names
      const portVars = ['PORT', 'DEV_PORT', 'SERVER_PORT', 'API_PORT', 'VITE_PORT'];
      for (const varName of portVars) {
        if (parsed[varName]) {
          const port = parseInt(parsed[varName]);
          if (port > 0 && port < 65536) {
            ports.push(port);
          }
        }
      }
    } catch {}
  }
  
  return ports;
}

function getConventionalPorts(
  projectPath: string,
  scripts: Record<string, string>
): number[] {
  const scriptText = Object.values(scripts).join(' ').toLowerCase();
  
  // Framework defaults
  if (scriptText.includes('vite')) return [5173];
  if (scriptText.includes('next')) return [3000];
  if (scriptText.includes('nuxt')) return [3000];
  if (scriptText.includes('react-scripts')) return [3000];
  if (scriptText.includes('vue-cli-service')) return [8080];
  if (scriptText.includes('angular')) return [4200];
  if (scriptText.includes('svelte')) return [5000];
  if (scriptText.includes('astro')) return [4321];
  if (scriptText.includes('remix')) return [3000];
  if (scriptText.includes('webpack-dev-server')) return [8080];
  if (scriptText.includes('express') || scriptText.includes('node ')) return [3000];
  
  return [];
}

async function checkRunningPorts(
  projectPath: string,
  candidatePorts: number[]
): Promise<number[]> {
  if (candidatePorts.length === 0) return [];
  
  const running: number[] = [];
  
  try {
    // Get all listening ports and their PIDs
    const { stdout } = await execa('lsof', [
      '-i',
      '-P',
      '-n',
      '-sTCP:LISTEN',
    ]);
    
    const lines = stdout.split('\n');
    
    for (const port of candidatePorts) {
      // Check if this port is in use
      const portPattern = new RegExp(`:${port}\\s`);
      const portLine = lines.find(line => portPattern.test(line));
      
      if (portLine) {
        // Found a process on this port, check if it's from our project
        const parts = portLine.split(/\s+/);
        const pid = parseInt(parts[1]);
        
        // Get the working directory of the process
        try {
          const { stdout: cwd } = await execa('lsof', ['-p', String(pid), '-Fn']);
          if (cwd.includes(projectPath)) {
            running.push(port);
          }
        } catch {
          // Can't determine, assume it might be ours
          running.push(port);
        }
      }
    }
  } catch {
    // lsof failed, fall back to simpler check
    for (const port of candidatePorts) {
      try {
        const { stdout } = await execa('lsof', ['-i', `:${port}`]);
        if (stdout.trim()) {
          running.push(port);
        }
      } catch {}
    }
  }
  
  return running;
}
```

This is probably the most-revised code in projax. Every time I think I've covered all cases, I find a project that does something different.

### Git Analysis

Git operations are the slowest part of scanning. I optimized by:

1. Running git commands in parallel across projects
2. Using `--porcelain` output for easier parsing
3. Batching operations where possible

```typescript
// packages/core/src/git.ts

import { execa } from 'execa';
import path from 'path';

export interface GitInfo {
  isGitRepo: boolean;
  gitBranch?: string;
  gitStatus: GitStatus;
  uncommittedFiles: number;
  untrackedFiles: number;
  lastCommitHash?: string;
  lastCommitMessage?: string;
  lastCommitDate?: Date;
  hasRemote: boolean;
  aheadOfRemote: number;
  behindRemote: number;
}

export async function analyzeGit(projectPath: string): Promise<GitInfo> {
  // Check if it's a git repo
  const gitDir = path.join(projectPath, '.git');
  const isGitRepo = await exists(gitDir);
  
  if (!isGitRepo) {
    return {
      isGitRepo: false,
      gitStatus: 'not-a-repo',
      uncommittedFiles: 0,
      untrackedFiles: 0,
      hasRemote: false,
      aheadOfRemote: 0,
      behindRemote: 0,
    };
  }
  
  // Run git commands in parallel
  const [statusResult, branchResult, logResult, remoteResult] = await Promise.allSettled([
    execa('git', ['status', '--porcelain=v1'], { cwd: projectPath }),
    execa('git', ['branch', '--show-current'], { cwd: projectPath }),
    execa('git', ['log', '-1', '--format=%H|%s|%aI'], { cwd: projectPath }),
    execa('git', ['remote'], { cwd: projectPath }),
  ]);
  
  // Parse status
  let uncommittedFiles = 0;
  let untrackedFiles = 0;
  let hasConflict = false;
  
  if (statusResult.status === 'fulfilled') {
    const lines = statusResult.value.stdout.split('\n').filter(Boolean);
    for (const line of lines) {
      const status = line.substring(0, 2);
      if (status.includes('?')) {
        untrackedFiles++;
      } else if (status.includes('U') || status === 'AA' || status === 'DD') {
        hasConflict = true;
        uncommittedFiles++;
      } else {
        uncommittedFiles++;
      }
    }
  }
  
  // Parse branch
  const gitBranch = branchResult.status === 'fulfilled'
    ? branchResult.value.stdout.trim()
    : undefined;
  
  // Parse last commit
  let lastCommitHash: string | undefined;
  let lastCommitMessage: string | undefined;
  let lastCommitDate: Date | undefined;
  
  if (logResult.status === 'fulfilled' && logResult.value.stdout) {
    const [hash, message, date] = logResult.value.stdout.split('|');
    lastCommitHash = hash;
    lastCommitMessage = message;
    lastCommitDate = new Date(date);
  }
  
  // Parse remote
  const hasRemote = remoteResult.status === 'fulfilled' &&
    remoteResult.value.stdout.trim().length > 0;
  
  // Get ahead/behind if we have a remote
  let aheadOfRemote = 0;
  let behindRemote = 0;
  
  if (hasRemote && gitBranch) {
    try {
      const { stdout } = await execa(
        'git',
        ['rev-list', '--left-right', '--count', `origin/${gitBranch}...HEAD`],
        { cwd: projectPath }
      );
      const [behind, ahead] = stdout.split('\t').map(Number);
      aheadOfRemote = ahead || 0;
      behindRemote = behind || 0;
    } catch {
      // Remote branch might not exist
    }
  }
  
  // Determine overall status
  let gitStatus: GitStatus;
  if (hasConflict) {
    gitStatus = 'conflict';
  } else if (uncommittedFiles > 0) {
    gitStatus = 'dirty';
  } else if (untrackedFiles > 0) {
    gitStatus = 'untracked';
  } else {
    gitStatus = 'clean';
  }
  
  return {
    isGitRepo: true,
    gitBranch,
    gitStatus,
    uncommittedFiles,
    untrackedFiles,
    lastCommitHash,
    lastCommitMessage,
    lastCommitDate,
    hasRemote,
    aheadOfRemote,
    behindRemote,
  };
}
```

## The CLI: Quick Access

The CLI is for quick queries. No setup, no GUI, just answers.

```bash
# Basic listing
$ projax list
● floatnote              ~/Developer/floatnote
● josetunes              ~/Developer/josetunes  
● qortr           [3000] ~/Developer/qortr
○ spicy-meatball         ~/Developer/spicy-meatball

# Filter by git status
$ projax list --dirty
● qortr           [3000] ~/Developer/qortr
  3 uncommitted files

# Filter by what's running
$ projax list --running
● qortr           [3000] ~/Developer/qortr
● api-server      [8080] ~/Developer/api-server

# Detailed info
$ projax info qortr
╭─────────────────────────────────────────╮
│ qortr                                   │
├─────────────────────────────────────────┤
│ Path:        ~/Developer/qortr          │
│ Type:        Node.js (Next.js)          │
│ Package Mgr: pnpm                       │
│                                         │
│ Scripts:                                │
│   dev      → next dev (port 3000) ●     │
│   build    → next build                 │
│   start    → next start                 │
│   lint     → eslint .                   │
│   test     → vitest                     │
│                                         │
│ Git:                                    │
│   Branch:  main                         │
│   Status:  3 uncommitted files          │
│   Remote:  2 ahead, 0 behind            │
│                                         │
│ Last modified: 2 hours ago              │
╰─────────────────────────────────────────╯

# Run scripts from anywhere
$ projax run qortr dev
> pnpm dev
> in ~/Developer/qortr

  ▲ Next.js 14.0.4
  - Local: http://localhost:3000
  
# See port usage
$ projax ports
PORT   PROJECT          PID      COMMAND
3000   qortr            12345    node
5173   floatnote        12346    vite
8080   api-server       12347    node

# Find projects by dependency
$ projax search react
● qortr           react@18.2.0
● floatnote       react@18.2.0
● thing3-final    react@17.0.2
```

The implementation uses Commander.js for argument parsing, chalk for colors, and cli-table3 for formatted output. Nothing fancy—the CLI is intentionally simple.

## The Terminal UI: Full Dashboard

Sometimes I want to browse, not query. The TUI is built with Ink—React, but for the terminal.

```typescript
// packages/tui/src/App.tsx

import React, { useState, useEffect, useMemo } from 'react';
import { Box, Text, useInput, useApp, useFocus } from 'ink';
import { scanDirectory, type Project } from '@projax/core';
import { ProjectList } from './components/ProjectList';
import { ProjectDetail } from './components/ProjectDetail';
import { StatusBar } from './components/StatusBar';
import { FilterBar } from './components/FilterBar';

type View = 'list' | 'detail';
type Filter = 'all' | 'dirty' | 'running' | 'node' | 'rust' | 'python';

export function App() {
  const { exit } = useApp();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [view, setView] = useState<View>('list');
  const [filter, setFilter] = useState<Filter>('all');
  const [search, setSearch] = useState('');
  
  // Load projects
  useEffect(() => {
    const scanPath = process.env.PROJAX_PATH || 
                     process.env.HOME + '/Developer';
    
    scanDirectory(scanPath)
      .then(setProjects)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);
  
  // Filter and search
  const filteredProjects = useMemo(() => {
    let result = projects;
    
    // Apply filter
    switch (filter) {
      case 'dirty':
        result = result.filter(p => p.gitStatus === 'dirty');
        break;
      case 'running':
        result = result.filter(p => p.runningPorts.length > 0);
        break;
      case 'node':
        result = result.filter(p => p.type === 'node');
        break;
      case 'rust':
        result = result.filter(p => p.type === 'rust');
        break;
      case 'python':
        result = result.filter(p => p.type === 'python');
        break;
    }
    
    // Apply search
    if (search) {
      const lower = search.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(lower) ||
        p.description?.toLowerCase().includes(lower)
      );
    }
    
    return result;
  }, [projects, filter, search]);
  
  const selectedProject = filteredProjects[selectedIndex];
  
  // Keyboard handling
  useInput((input, key) => {
    if (input === 'q' || (key.ctrl && input === 'c')) {
      exit();
    }
    
    if (view === 'list') {
      if (key.upArrow || input === 'k') {
        setSelectedIndex(i => Math.max(0, i - 1));
      }
      if (key.downArrow || input === 'j') {
        setSelectedIndex(i => Math.min(filteredProjects.length - 1, i + 1));
      }
      if (key.return || input === 'l') {
        setView('detail');
      }
      if (input === 'o') {
        // Open in VS Code
        openInEditor(selectedProject.path);
      }
      if (input === 'r') {
        // Run dev script
        runProject(selectedProject);
      }
      if (input === '/') {
        // Start search
        // (Would show search input)
      }
      if (input === 'f') {
        // Cycle filter
        cycleFilter();
      }
    }
    
    if (view === 'detail') {
      if (key.escape || input === 'h' || input === 'q') {
        setView('list');
      }
    }
  });
  
  if (loading) {
    return (
      <Box flexDirection="column" padding={1}>
        <Text>
          <Text color="cyan">⠋</Text> Scanning projects...
        </Text>
      </Box>
    );
  }
  
  if (error) {
    return (
      <Box flexDirection="column" padding={1}>
        <Text color="red">Error: {error}</Text>
      </Box>
    );
  }
  
  return (
    <Box flexDirection="column" height="100%">
      {/* Header */}
      <Box borderStyle="single" borderBottom paddingX={1}>
        <Text bold>Projax</Text>
        <Text> — </Text>
        <Text color="cyan">{filteredProjects.length}</Text>
        <Text> projects</Text>
        {filter !== 'all' && (
          <Text color="yellow"> [{filter}]</Text>
        )}
      </Box>
      
      {/* Main content */}
      <Box flexGrow={1}>
        {view === 'list' ? (
          <ProjectList
            projects={filteredProjects}
            selectedIndex={selectedIndex}
          />
        ) : (
          <ProjectDetail project={selectedProject} />
        )}
      </Box>
      
      {/* Status bar */}
      <StatusBar
        project={selectedProject}
        view={view}
      />
    </Box>
  );
}
```

The TUI is great for exploring. I use it when I'm trying to remember what's where, or when I want to see the big picture of my project landscape.

## The VS Code Extension

This is the interface I use most—projax right in my editor sidebar.

The extension adds:
- A tree view of all projects
- Status indicators (dirty, running)
- Click to open project
- Right-click to run scripts
- Auto-refresh on file changes

It also works in Cursor, Windsurf, and other VS Code forks, which is where I actually spend most of my time.

```typescript
// packages/vscode/src/ProjectsProvider.ts

import * as vscode from 'vscode';
import { scanDirectory, type Project } from '@projax/core';

export class ProjectsProvider implements vscode.TreeDataProvider<ProjectTreeItem> {
  private _onDidChangeTreeData = new vscode.EventEmitter<ProjectTreeItem | undefined>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;
  
  private projects: Project[] = [];
  private watcher: vscode.FileSystemWatcher | undefined;
  
  constructor(private context: vscode.ExtensionContext) {
    this.refresh();
    this.setupWatcher();
  }
  
  private setupWatcher() {
    // Watch for changes to project files
    this.watcher = vscode.workspace.createFileSystemWatcher(
      '**/package.json',
      false, // create
      false, // change
      false  // delete
    );
    
    const refresh = debounce(() => this.refresh(), 1000);
    
    this.watcher.onDidCreate(refresh);
    this.watcher.onDidChange(refresh);
    this.watcher.onDidDelete(refresh);
  }
  
  async refresh() {
    const config = vscode.workspace.getConfiguration('projax');
    const scanPath = config.get<string>('scanPath') || 
                     process.env.HOME + '/Developer';
    
    try {
      this.projects = await scanDirectory(scanPath, {
        maxDepth: config.get<number>('maxDepth') || 4,
      });
      this._onDidChangeTreeData.fire(undefined);
    } catch (error) {
      vscode.window.showErrorMessage(`Projax: ${error}`);
    }
  }
  
  getTreeItem(element: ProjectTreeItem): vscode.TreeItem {
    return element;
  }
  
  getChildren(element?: ProjectTreeItem): ProjectTreeItem[] {
    if (element) {
      // Scripts as children of project
      return Object.entries(element.project.scripts).map(
        ([name, command]) => new ScriptTreeItem(element.project, name, command)
      );
    }
    
    // Top-level: all projects
    return this.projects.map(p => new ProjectTreeItem(p));
  }
}

class ProjectTreeItem extends vscode.TreeItem {
  constructor(public readonly project: Project) {
    super(
      project.name,
      Object.keys(project.scripts).length > 0
        ? vscode.TreeItemCollapsibleState.Collapsed
        : vscode.TreeItemCollapsibleState.None
    );
    
    // Icon based on status
    if (project.runningPorts.length > 0) {
      this.iconPath = new vscode.ThemeIcon('pulse', new vscode.ThemeColor('charts.green'));
    } else if (project.gitStatus === 'dirty') {
      this.iconPath = new vscode.ThemeIcon('circle-filled', new vscode.ThemeColor('charts.yellow'));
    } else {
      this.iconPath = new vscode.ThemeIcon('circle-outline');
    }
    
    // Description
    const parts: string[] = [];
    if (project.framework) parts.push(project.framework);
    if (project.runningPorts.length > 0) {
      parts.push(`[${project.runningPorts.join(', ')}]`);
    }
    this.description = parts.join(' ');
    
    // Tooltip
    this.tooltip = new vscode.MarkdownString();
    this.tooltip.appendMarkdown(`**${project.name}**\n\n`);
    this.tooltip.appendMarkdown(`${project.path}\n\n`);
    if (project.description) {
      this.tooltip.appendMarkdown(`${project.description}\n\n`);
    }
    this.tooltip.appendMarkdown(`Type: ${project.type}`);
    if (project.framework) {
      this.tooltip.appendMarkdown(` (${project.framework})`);
    }
    this.tooltip.appendMarkdown('\n\n');
    this.tooltip.appendMarkdown(`Git: ${project.gitStatus}`);
    if (project.uncommittedFiles > 0) {
      this.tooltip.appendMarkdown(` (${project.uncommittedFiles} files)`);
    }
    
    // Click action
    this.command = {
      command: 'projax.openProject',
      title: 'Open Project',
      arguments: [project],
    };
    
    this.contextValue = 'project';
  }
}
```

## Lessons from Building Projax

After six months of using and iterating on projax:

### 1. Build for Yourself First

I'm the primary user. Every feature exists because I wanted it. There's no guessing about requirements—if something annoys me, I fix it. If I never use a feature, I remove it.

This is the opposite of most product development, where you're trying to anticipate user needs. Here, I *am* the user. The feedback loop is instant.

### 2. Monorepos Are Worth It

The setup cost was maybe 4 hours—configuring pnpm workspaces, TypeScript project references, shared configs. Since then, I've added three new interface packages (TUI, desktop, web) without rewriting any core logic.

The mental model is simple: `@projax/core` is the truth, everything else is presentation.

### 3. The Boring Parts Are the Hardest

Port detection seemed trivial. "Just parse the scripts, find --port, done." Then I discovered:
- Vite configs with server.port
- Next.js using 3000 by default
- Environment variables
- Ports in docker-compose.yml
- Ports in .env.local that override .env
- Projects with multiple services on multiple ports

I've spent more time on port detection than any other feature. It's still not perfect.

### 4. 213 Projects Is a Lot

Scanning 213 projects takes 1.2 seconds. Running `git status` on 213 repos takes 8 seconds. Checking running ports against 213 possible locations takes 3 seconds.

Performance matters when you're doing 200+ operations. I batch, parallelize, and cache aggressively.

### 5. The CLI Is Underrated

I thought I'd mostly use the VS Code extension. In practice, I use the CLI just as much. `projax run foo dev` is faster than finding foo in the sidebar and clicking.

Different interfaces for different contexts. Sometimes I want a mouse, sometimes I want keystrokes.

### 6. Naming Things Is Hard (Obviously)

I still have no idea what `spicy-meatball` was for. Projax doesn't solve the naming problem—it just makes it easier to *find* things despite the names.

Maybe the real solution is better naming discipline. But probably not. 3am me is going to keep creating `thing2` and `hmm-test`.

---

*Try projax with `npm install -g @projax/cli && projax scan ~/Developer`. Or install the VS Code extension. Or don't—build your own version that solves your exact problems. That's kind of the point.*
