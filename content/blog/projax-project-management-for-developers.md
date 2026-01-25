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
coverImage: /blog/projax.svg
---

# Building Projax: A Developer's Project Dashboard

My Developer folder has too many projects. Years of side projects, client work, experiments, and half-finished ideas. The problem isn't the number—it's losing track of them.

What's running right now? Which projects have uncommitted changes? Did I ever push that thing I was working on last week? These questions should be instant to answer, but they're not.

I needed a dashboard. Not Notion, not a spreadsheet—a tool that actually scans my projects and tells me what's happening.

## The Problem

When you have dozens of projects, basic questions become annoying:

**"Is my dev server running?"** — I could check Activity Monitor, or `lsof -i :3000`, or try to start it and see if the port is taken. None of these tell me *which* project.

**"Which repos have uncommitted changes?"** — I could write a bash script to iterate through directories and run git status. I've done this. I've lost the script multiple times.

**"What port does this project use?"** — Open package.json, find the dev script, trace through to the config. Or check .env. Or maybe it's hardcoded somewhere.

The answer to each question requires context-switching into that project. Multiply by dozens of projects, and you're burning 10-15 minutes just figuring out the state of your machine before you can start working.

## Failed Attempts

### The Bash Script

```bash
#!/bin/bash
for dir in ~/Developer/*/; do
  if [ -d "$dir/.git" ]; then
    echo "=== $dir ==="
    cd "$dir" && git status --short
  fi
done
```

Works, but no port detection, no filtering, and the output is a wall of text.

### The Node Script

Added package.json parsing and better formatting. Still no interactivity, still just a script I'd forget about.

### The Electron App

200MB, 300MB RAM, just to show a list of folders. The irony was painful.

### The Solution

Stop rewriting the same logic for each interface. Build a core package that does the heavy lifting, then thin interfaces on top.

## Architecture

```
projax/
├── packages/
│   ├── core/              # The brain - scanning and analysis
│   ├── cli/               # `projax` command
│   ├── tui/               # Interactive terminal UI
│   ├── desktop/           # Electron menu bar app
│   └── vscode/            # VS Code extension
├── pnpm-workspace.yaml
└── tsconfig.base.json
```

The monorepo structure means:

1. **`@projax/core`** has zero dependencies on any interface. Use it in a CLI, a desktop app, a web app—doesn't matter.
2. **Each interface** is a thin wrapper over core.
3. **One commit** can update all interfaces together.

## The Core: Project Detection

### The Project Interface

```typescript
export interface Project {
  // Identity
  name: string;
  path: string;
  
  // Ecosystem
  type: 'node' | 'rust' | 'python' | 'go' | 'unknown';
  framework?: 'react' | 'vue' | 'next' | 'svelte' | 'express' | 'tauri';
  packageManager?: 'npm' | 'yarn' | 'pnpm' | 'bun';
  
  // Scripts
  scripts: Record<string, string>;
  mainScript?: string;
  
  // Ports
  configuredPorts: number[];
  runningPorts: number[];
  
  // Git
  isGitRepo: boolean;
  gitBranch?: string;
  gitStatus: 'clean' | 'dirty' | 'untracked';
  uncommittedFiles: number;
  hasRemote: boolean;
  aheadOfRemote: number;
  behindRemote: number;
  
  // Metadata
  description?: string;
  version?: string;
  lastModified: Date;
}
```

This is the contract. Every interface knows what to expect.

### The Scanner

Two-pass approach for speed:

**Pass 1: Discovery** — Find all project roots quickly (look for package.json, Cargo.toml, etc.)

**Pass 2: Analysis** — Analyze discovered projects in parallel

```typescript
const PROJECT_MARKERS = [
  'package.json',
  'Cargo.toml',
  'pyproject.toml',
  'go.mod',
];

const IGNORE_DIRS = new Set([
  'node_modules',
  '.git',
  'dist',
  'build',
  'target',
  '.next',
]);

export async function scanDirectory(
  rootPath: string,
  options: { maxDepth?: number; concurrency?: number } = {}
): Promise<Project[]> {
  const { maxDepth = 4, concurrency = 10 } = options;
  
  // Pass 1: Find project roots
  const projectPaths: string[] = [];
  
  async function discover(currentPath: string, depth: number) {
    if (depth > maxDepth) return;
    
    const entries = await readdir(currentPath, { withFileTypes: true });
    
    // Is this a project root?
    const hasMarker = PROJECT_MARKERS.some(marker =>
      entries.some(e => e.name === marker && e.isFile())
    );
    
    if (hasMarker) {
      projectPaths.push(currentPath);
      return; // Don't descend into projects
    }
    
    // Recurse into subdirectories
    const subdirs = entries.filter(e => 
      e.isDirectory() && 
      !IGNORE_DIRS.has(e.name) && 
      !e.name.startsWith('.')
    );
    
    await Promise.all(
      subdirs.map(e => discover(path.join(currentPath, e.name), depth + 1))
    );
  }
  
  await discover(rootPath, 0);
  
  // Pass 2: Analyze in parallel
  const limit = pLimit(concurrency);
  const projects = await Promise.all(
    projectPaths.map(p => limit(() => analyzeProject(p)))
  );
  
  return projects.filter(Boolean);
}
```

Scanning my projects takes about 1 second. Most of that is git operations.

### Port Detection

This is the feature that took the longest. Ports can be defined in:

1. Script arguments: `vite --port 3001`
2. Config files: `vite.config.ts`
3. Environment files: `.env`
4. Convention: Vite defaults to 5173, Next to 3000

```typescript
export async function analyzePorts(
  projectPath: string,
  scripts: Record<string, string>
): Promise<PortInfo> {
  const configuredPorts: Set<number> = new Set();
  
  // Check scripts for explicit ports
  for (const script of Object.values(scripts)) {
    const matches = script.matchAll(/(?:--port|-p)[=\s]+(\d+)/gi);
    for (const match of matches) {
      configuredPorts.add(parseInt(match[1]));
    }
  }
  
  // Check config files
  const configPorts = await extractPortsFromConfigs(projectPath);
  configPorts.forEach(p => configuredPorts.add(p));
  
  // Check env files
  const envPorts = await extractPortsFromEnv(projectPath);
  envPorts.forEach(p => configuredPorts.add(p));
  
  // Apply conventions if nothing found
  const conventionalPorts = configuredPorts.size === 0
    ? getConventionalPorts(scripts)
    : [];
  
  // Check what's actually running
  const allPorts = [...configuredPorts, ...conventionalPorts];
  const runningPorts = await checkRunningPorts(allPorts);
  
  return { configuredPorts: [...configuredPorts], conventionalPorts, runningPorts };
}

function getConventionalPorts(scripts: Record<string, string>): number[] {
  const text = Object.values(scripts).join(' ').toLowerCase();
  
  if (text.includes('vite')) return [5173];
  if (text.includes('next')) return [3000];
  if (text.includes('nuxt')) return [3000];
  if (text.includes('angular')) return [4200];
  if (text.includes('astro')) return [4321];
  
  return [];
}
```

I've revised this code a dozen times. Every time I think I've covered all cases, I find a project that does something different.

### Git Analysis

```typescript
export async function analyzeGit(projectPath: string): Promise<GitInfo> {
  const isGitRepo = await exists(path.join(projectPath, '.git'));
  
  if (!isGitRepo) {
    return { isGitRepo: false, gitStatus: 'not-a-repo', uncommittedFiles: 0 };
  }
  
  // Run git commands in parallel
  const [status, branch, remote] = await Promise.allSettled([
    execa('git', ['status', '--porcelain'], { cwd: projectPath }),
    execa('git', ['branch', '--show-current'], { cwd: projectPath }),
    execa('git', ['remote'], { cwd: projectPath }),
  ]);
  
  // Parse results
  let uncommittedFiles = 0;
  if (status.status === 'fulfilled') {
    uncommittedFiles = status.value.stdout.split('\n').filter(Boolean).length;
  }
  
  const gitBranch = branch.status === 'fulfilled' 
    ? branch.value.stdout.trim() 
    : undefined;
  
  const hasRemote = remote.status === 'fulfilled' && 
    remote.value.stdout.trim().length > 0;
  
  return {
    isGitRepo: true,
    gitBranch,
    gitStatus: uncommittedFiles > 0 ? 'dirty' : 'clean',
    uncommittedFiles,
    hasRemote,
    aheadOfRemote: 0, // Would need additional git calls
    behindRemote: 0,
  };
}
```

## The CLI

For quick queries from anywhere:

```bash
# List all projects
$ projax list
● qortr           [3000] ~/Developer/qortr
● floatnote              ~/Developer/floatnote
○ api-test               ~/Developer/api-test

# Only dirty repos
$ projax list --dirty

# What's running right now
$ projax list --running

# Details on a project
$ projax info qortr

# Run a project's dev script
$ projax run qortr dev

# Port usage
$ projax ports
PORT   PROJECT          PID
3000   qortr            12345
5173   floatnote        12346
```

Implementation uses Commander.js, chalk for colors, cli-table3 for tables. Nothing fancy.

## The TUI

For browsing when I want to explore. Built with Ink—React for the terminal.

```tsx
export function App() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selected, setSelected] = useState(0);
  const [filter, setFilter] = useState<'all' | 'dirty' | 'running'>('all');
  
  useInput((input, key) => {
    if (key.upArrow) setSelected(i => Math.max(0, i - 1));
    if (key.downArrow) setSelected(i => Math.min(projects.length - 1, i + 1));
    if (input === 'o') openInEditor(projects[selected].path);
    if (input === 'r') runProject(projects[selected]);
    if (input === 'f') cycleFilter();
  });
  
  const filtered = useMemo(() => {
    switch (filter) {
      case 'dirty': return projects.filter(p => p.gitStatus === 'dirty');
      case 'running': return projects.filter(p => p.runningPorts.length > 0);
      default: return projects;
    }
  }, [projects, filter]);
  
  return (
    <Box flexDirection="column">
      <Header count={filtered.length} filter={filter} />
      <ProjectList projects={filtered} selected={selected} />
      <StatusBar />
    </Box>
  );
}
```

Vim bindings (j/k), filtering, open in editor, run scripts. All from the terminal.

## The VS Code Extension

This is the interface I use most. Project list in the sidebar, status indicators, click to open, right-click to run scripts.

```typescript
export class ProjectsProvider implements vscode.TreeDataProvider<ProjectItem> {
  private projects: Project[] = [];
  
  constructor() {
    this.refresh();
    this.watchForChanges();
  }
  
  async refresh() {
    const scanPath = vscode.workspace
      .getConfiguration('projax')
      .get<string>('scanPath') || '~/Developer';
    
    this.projects = await scanDirectory(scanPath);
    this._onDidChangeTreeData.fire(undefined);
  }
  
  getTreeItem(element: ProjectItem): vscode.TreeItem {
    const item = new vscode.TreeItem(element.project.name);
    
    // Icon based on status
    if (element.project.runningPorts.length > 0) {
      item.iconPath = new vscode.ThemeIcon('pulse');
    } else if (element.project.gitStatus === 'dirty') {
      item.iconPath = new vscode.ThemeIcon('circle-filled');
    }
    
    // Port in description
    if (element.project.runningPorts.length > 0) {
      item.description = `[${element.project.runningPorts.join(', ')}]`;
    }
    
    return item;
  }
}
```

Works in VS Code, Cursor, and other forks.

## Lessons

### Build for yourself first

I'm the primary user. Every feature exists because I wanted it. If something annoys me, I fix it. If I never use a feature, I remove it.

### Monorepos are worth the setup

4 hours to configure pnpm workspaces and TypeScript project references. Since then, I've added three new interface packages without touching core logic.

### The boring parts are hardest

Port detection seemed trivial. "Parse scripts, find --port, done." Then I discovered Vite configs, env files, docker-compose, multiple services per project. I've spent more time on port detection than any other feature.

### Different interfaces for different contexts

I thought I'd mostly use the VS Code extension. I use the CLI just as much. `projax run foo dev` is faster than finding foo in the sidebar.

### Performance matters at scale

Scanning 50+ projects means 50+ git operations. Parallel execution and caching are essential.

---

The code is messy in places. The port detection still misses edge cases. But it works, and it saves me time every day. That's what matters for a dev tool.
