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

My `~/Developer` folder is a graveyard of good intentions. Twenty-seven projects at last count—side projects, experiments, half-finished ideas, tutorials I followed once, things I was "definitely going to get back to."

Every few weeks I'd open Terminal, `cd ~/Developer`, and stare at the list:

```
ace/
crativo.xyz/
floatnote/
josetunes/
on24-hackathon-2023/
projax/
qortr/
react-experiments/
tauri-test/
too-bored/
vids-matrix-driven-css/
work-notes/
...
```

Which ones have uncommitted changes? What was that one running on port 3001? Did I ever push the last update to josetunes? Is that experiment folder safe to delete?

I'd open each project, check `git status`, read through `package.json`, maybe run `lsof -i :3000` to figure out what's using ports. Twenty minutes later, I still wouldn't know the state of my projects.

So I built **projax**—a project dashboard that shows me everything at a glance.

## The Core Insight

Every project on my machine shares patterns:

- They have a `package.json` (or `Cargo.toml`, or `pyproject.toml`)
- They define scripts to run
- They have dev server ports (explicit or conventional)
- They're Git repositories (usually)
- They've been modified at some point (or haven't)

Projax scans a directory tree, detects projects, extracts metadata, and presents it in various interfaces—CLI, terminal UI, VS Code extension, desktop app. Same data, different access patterns.

## Architecture: Monorepo With Shared Core

The key architectural decision was putting all interfaces in a single monorepo sharing a core package:

```
projax/
├── packages/
│   ├── core/              # Project detection & analysis
│   │   ├── src/
│   │   │   ├── scanner.ts      # Directory scanning
│   │   │   ├── analyzers/      # Per-ecosystem analyzers
│   │   │   │   ├── node.ts
│   │   │   │   ├── rust.ts
│   │   │   │   └── python.ts
│   │   │   ├── git.ts          # Git status
│   │   │   ├── ports.ts        # Port detection
│   │   │   └── types.ts
│   │   └── package.json
│   ├── cli/               # Command-line interface
│   ├── tui/               # Terminal UI (Ink)
│   ├── api/               # REST API for desktop/web
│   ├── desktop/           # Electron menu bar app
│   └── vscode/            # VS Code extension
├── pnpm-workspace.yaml
└── package.json
```

Benefits of this structure:

1. **Single source of truth** — Project detection logic lives in one place
2. **Type sharing** — TypeScript interfaces are defined once, used everywhere
3. **Atomic commits** — Feature that spans CLI + extension is one commit
4. **Consistent behavior** — All interfaces agree on what a "project" is

## The Core Package: Project Detection

The heart of projax is the `@projax/core` package. It scans directories and builds a data model:

```typescript
// packages/core/src/types.ts
export interface Project {
  // Identity
  name: string;
  path: string;
  
  // Ecosystem
  type: 'node' | 'rust' | 'python' | 'go' | 'unknown';
  packageManager?: 'npm' | 'yarn' | 'pnpm' | 'bun' | 'cargo' | 'pip';
  
  // Scripts
  scripts: Record<string, string>;
  mainScript?: string; // 'dev', 'start', 'serve', etc.
  
  // Ports
  ports: number[];
  runningOnPorts: number[];
  
  // Testing
  hasTests: boolean;
  testCommand?: string;
  testFramework?: 'jest' | 'vitest' | 'mocha' | 'pytest' | 'cargo-test';
  
  // Git
  gitBranch?: string;
  gitStatus: 'clean' | 'dirty' | 'untracked' | 'not-a-repo';
  uncommittedChanges: number;
  lastCommitDate?: Date;
  
  // Metadata
  description?: string;
  version?: string;
  lastModified: Date;
  
  // Dependencies
  dependencies: string[];
  devDependencies: string[];
}
```

### The Scanner

Scanning is recursive but smart—we stop descending when we find a project root:

```typescript
// packages/core/src/scanner.ts
import { readdir, stat } from 'fs/promises';
import path from 'path';

const PROJECT_MARKERS = [
  'package.json',
  'Cargo.toml',
  'pyproject.toml',
  'go.mod',
];

const IGNORE_DIRS = [
  'node_modules',
  '.git',
  'dist',
  'build',
  'target',
  '.next',
  '__pycache__',
];

export async function scanDirectory(
  rootPath: string,
  maxDepth: number = 3
): Promise<Project[]> {
  const projects: Project[] = [];
  
  async function scan(currentPath: string, depth: number) {
    if (depth > maxDepth) return;
    
    const entries = await readdir(currentPath, { withFileTypes: true });
    
    // Check if this is a project root
    const isProject = PROJECT_MARKERS.some(marker =>
      entries.some(e => e.name === marker && e.isFile())
    );
    
    if (isProject) {
      const project = await analyzeProject(currentPath);
      projects.push(project);
      // Don't descend into project directories
      return;
    }
    
    // Recurse into subdirectories
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      if (IGNORE_DIRS.includes(entry.name)) continue;
      if (entry.name.startsWith('.')) continue;
      
      await scan(path.join(currentPath, entry.name), depth + 1);
    }
  }
  
  await scan(rootPath, 0);
  return projects;
}
```

### Ecosystem-Specific Analyzers

Different project types need different analysis:

```typescript
// packages/core/src/analyzers/node.ts
export async function analyzeNodeProject(projectPath: string): Promise<Partial<Project>> {
  const packageJsonPath = path.join(projectPath, 'package.json');
  const content = await readFile(packageJsonPath, 'utf-8');
  const pkg = JSON.parse(content);
  
  // Detect package manager from lock files
  const packageManager = await detectPackageManager(projectPath);
  
  // Extract scripts
  const scripts = pkg.scripts || {};
  const mainScript = findMainScript(scripts);
  
  // Detect ports from scripts and config files
  const ports = await detectPorts(projectPath, scripts);
  
  // Detect test setup
  const { hasTests, testCommand, testFramework } = await detectTestSetup(projectPath, pkg);
  
  return {
    name: pkg.name || path.basename(projectPath),
    type: 'node',
    packageManager,
    scripts,
    mainScript,
    ports,
    hasTests,
    testCommand,
    testFramework,
    description: pkg.description,
    version: pkg.version,
    dependencies: Object.keys(pkg.dependencies || {}),
    devDependencies: Object.keys(pkg.devDependencies || {}),
  };
}

async function detectPackageManager(projectPath: string): Promise<string> {
  const lockFiles = {
    'pnpm-lock.yaml': 'pnpm',
    'yarn.lock': 'yarn',
    'bun.lockb': 'bun',
    'package-lock.json': 'npm',
  };
  
  for (const [file, manager] of Object.entries(lockFiles)) {
    if (await exists(path.join(projectPath, file))) {
      return manager;
    }
  }
  
  return 'npm';
}

function findMainScript(scripts: Record<string, string>): string | undefined {
  // Priority order for "the thing you run to develop"
  const candidates = ['dev', 'start', 'serve', 'develop', 'watch'];
  
  for (const candidate of candidates) {
    if (scripts[candidate]) return candidate;
  }
  
  return undefined;
}
```

### Port Detection: The Hard Part

Figuring out which ports a project uses is surprisingly tricky. Some are explicit:

```json
{
  "scripts": {
    "dev": "vite --port 3000"
  }
}
```

Some are in config files:

```typescript
// vite.config.ts
export default {
  server: { port: 3001 }
}
```

Some are in environment files:

```env
PORT=8080
```

And some are convention:

- Vite defaults to 5173
- Next.js defaults to 3000
- Create React App defaults to 3000

I built a port detector that tries all of these:

```typescript
// packages/core/src/ports.ts
export async function detectPorts(
  projectPath: string,
  scripts: Record<string, string>
): Promise<number[]> {
  const ports: Set<number> = new Set();
  
  // Check scripts for explicit ports
  for (const script of Object.values(scripts)) {
    const matches = script.match(/--port[=\s]+(\d+)/g);
    if (matches) {
      matches.forEach(m => {
        const port = parseInt(m.replace(/\D/g, ''));
        if (port) ports.add(port);
      });
    }
  }
  
  // Check vite.config
  const vitePort = await parseViteConfig(projectPath);
  if (vitePort) ports.add(vitePort);
  
  // Check next.config
  const nextPort = await parseNextConfig(projectPath);
  if (nextPort) ports.add(nextPort);
  
  // Check .env files
  const envPorts = await parseEnvFiles(projectPath);
  envPorts.forEach(p => ports.add(p));
  
  // Apply conventions if nothing explicit
  if (ports.size === 0) {
    const conventionalPort = getConventionalPort(projectPath, scripts);
    if (conventionalPort) ports.add(conventionalPort);
  }
  
  return Array.from(ports);
}

function getConventionalPort(
  projectPath: string,
  scripts: Record<string, string>
): number | undefined {
  const scriptString = Object.values(scripts).join(' ');
  
  if (scriptString.includes('vite')) return 5173;
  if (scriptString.includes('next')) return 3000;
  if (scriptString.includes('react-scripts')) return 3000;
  if (scriptString.includes('webpack-dev-server')) return 8080;
  
  return undefined;
}
```

I also detect which ports are currently in use:

```typescript
export async function getRunningPorts(): Promise<Map<number, number>> {
  // Maps port -> PID
  const portToPid = new Map<number, number>();
  
  try {
    // macOS/Linux
    const { stdout } = await execa('lsof', ['-i', '-P', '-n']);
    const lines = stdout.split('\n').slice(1);
    
    for (const line of lines) {
      const parts = line.split(/\s+/);
      const pid = parseInt(parts[1]);
      const address = parts[8];
      
      const portMatch = address?.match(/:(\d+)$/);
      if (portMatch) {
        const port = parseInt(portMatch[1]);
        portToPid.set(port, pid);
      }
    }
  } catch {
    // Fallback for Windows or if lsof not available
  }
  
  return portToPid;
}
```

This lets projax show not just "this project can run on port 3000" but "this project IS running on port 3000 right now."

## The CLI

The CLI is the simplest interface—quick access from anywhere:

```bash
# List all projects
projax list

# Get info about a project
projax info floatnote

# Run a script from anywhere
projax run josetunes dev

# See what's using ports
projax ports

# Find projects with uncommitted changes
projax status
```

Built with Commander.js + chalk + ora:

```typescript
// packages/cli/src/commands/list.ts
import { Command } from 'commander';
import chalk from 'chalk';
import { scanDirectory, type Project } from '@projax/core';

export const list = new Command('list')
  .description('List all projects')
  .option('-p, --path <path>', 'Directory to scan', process.env.HOME + '/Developer')
  .option('--dirty', 'Only show projects with uncommitted changes')
  .option('--running', 'Only show projects with running dev servers')
  .option('-s, --sort <field>', 'Sort by field', 'name')
  .action(async (options) => {
    const projects = await scanDirectory(options.path);
    
    let filtered = projects;
    
    if (options.dirty) {
      filtered = filtered.filter(p => p.gitStatus === 'dirty');
    }
    
    if (options.running) {
      filtered = filtered.filter(p => p.runningOnPorts.length > 0);
    }
    
    filtered.sort((a, b) => {
      if (options.sort === 'modified') {
        return b.lastModified.getTime() - a.lastModified.getTime();
      }
      return a.name.localeCompare(b.name);
    });
    
    for (const project of filtered) {
      printProject(project);
    }
  });

function printProject(project: Project) {
  const status = project.gitStatus === 'dirty'
    ? chalk.yellow('●')
    : chalk.green('●');
  
  const running = project.runningOnPorts.length > 0
    ? chalk.cyan(` [${project.runningOnPorts.join(', ')}]`)
    : '';
  
  console.log(`${status} ${chalk.bold(project.name)}${running}`);
  console.log(`  ${chalk.dim(project.path)}`);
  
  if (project.description) {
    console.log(`  ${project.description}`);
  }
  
  console.log();
}
```

The `projax run` command is my favorite—run scripts from anywhere:

```bash
# Instead of:
cd ~/Developer/floatnote && npm run dev

# Just:
projax run floatnote dev
```

```typescript
// packages/cli/src/commands/run.ts
export const run = new Command('run')
  .description('Run a script in a project')
  .argument('<project>', 'Project name')
  .argument('[script]', 'Script to run', 'dev')
  .action(async (projectName, script) => {
    const projects = await scanDirectory(process.env.HOME + '/Developer');
    const project = projects.find(p => 
      p.name === projectName || 
      p.path.endsWith(projectName)
    );
    
    if (!project) {
      console.error(chalk.red(`Project not found: ${projectName}`));
      process.exit(1);
    }
    
    if (!project.scripts[script]) {
      console.error(chalk.red(`Script not found: ${script}`));
      console.log('Available scripts:', Object.keys(project.scripts).join(', '));
      process.exit(1);
    }
    
    const pm = project.packageManager || 'npm';
    const cmd = pm === 'npm' ? 'npm run' : pm;
    
    console.log(chalk.dim(`> ${cmd} ${script}`));
    console.log(chalk.dim(`> in ${project.path}`));
    console.log();
    
    await execa(pm, pm === 'npm' ? ['run', script] : [script], {
      cwd: project.path,
      stdio: 'inherit',
    });
  });
```

## The Terminal UI

For a richer experience, I built a TUI with Ink—React for the terminal:

```typescript
// packages/tui/src/App.tsx
import React, { useState, useEffect } from 'react';
import { Box, Text, useInput, useApp } from 'ink';
import { scanDirectory, type Project } from '@projax/core';

export function App() {
  const { exit } = useApp();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    scanDirectory(process.env.HOME + '/Developer')
      .then(setProjects)
      .finally(() => setLoading(false));
  }, []);
  
  useInput((input, key) => {
    if (input === 'q') exit();
    
    if (key.upArrow || input === 'k') {
      setSelectedIndex(i => Math.max(0, i - 1));
    }
    
    if (key.downArrow || input === 'j') {
      setSelectedIndex(i => Math.min(projects.length - 1, i + 1));
    }
    
    if (key.return) {
      const project = projects[selectedIndex];
      // Open in terminal or editor
    }
  });
  
  if (loading) {
    return <Text>Scanning projects...</Text>;
  }
  
  return (
    <Box flexDirection="column">
      <Box marginBottom={1}>
        <Text bold>Projax</Text>
        <Text> — {projects.length} projects</Text>
      </Box>
      
      {projects.map((project, i) => (
        <ProjectRow
          key={project.path}
          project={project}
          selected={i === selectedIndex}
        />
      ))}
      
      <Box marginTop={1}>
        <Text dimColor>j/k: navigate • enter: open • q: quit</Text>
      </Box>
    </Box>
  );
}

function ProjectRow({ project, selected }: { project: Project; selected: boolean }) {
  const bg = selected ? 'blue' : undefined;
  
  return (
    <Box backgroundColor={bg}>
      <Text color={project.gitStatus === 'dirty' ? 'yellow' : 'green'}>●</Text>
      <Text bold={selected}> {project.name}</Text>
      {project.runningOnPorts.length > 0 && (
        <Text color="cyan"> [{project.runningOnPorts.join(', ')}]</Text>
      )}
    </Box>
  );
}
```

The TUI lets me quickly navigate, see status at a glance, and act on projects.

## The VS Code Extension

This is where projax shines for daily use. The extension adds a sidebar view:

```typescript
// packages/vscode/src/extension.ts
import * as vscode from 'vscode';
import { scanDirectory, type Project } from '@projax/core';

export function activate(context: vscode.ExtensionContext) {
  const provider = new ProjectsProvider();
  
  vscode.window.registerTreeDataProvider('projaxProjects', provider);
  
  context.subscriptions.push(
    vscode.commands.registerCommand('projax.refresh', () => provider.refresh()),
    vscode.commands.registerCommand('projax.openProject', openProject),
    vscode.commands.registerCommand('projax.runScript', runScript),
  );
}

class ProjectsProvider implements vscode.TreeDataProvider<ProjectItem> {
  private _onDidChangeTreeData = new vscode.EventEmitter<ProjectItem | undefined>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;
  
  private projects: Project[] = [];
  
  constructor() {
    this.refresh();
  }
  
  async refresh() {
    const workspacePath = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    const scanPath = workspacePath || process.env.HOME + '/Developer';
    
    this.projects = await scanDirectory(scanPath);
    this._onDidChangeTreeData.fire(undefined);
  }
  
  getTreeItem(element: ProjectItem): vscode.TreeItem {
    return element;
  }
  
  getChildren(): ProjectItem[] {
    return this.projects.map(p => new ProjectItem(p));
  }
}

class ProjectItem extends vscode.TreeItem {
  constructor(public readonly project: Project) {
    super(project.name, vscode.TreeItemCollapsibleState.None);
    
    this.description = project.gitStatus === 'dirty' 
      ? '●' 
      : undefined;
    
    this.tooltip = [
      project.path,
      project.description,
      project.runningOnPorts.length > 0 
        ? `Running on: ${project.runningOnPorts.join(', ')}`
        : undefined,
    ].filter(Boolean).join('\n');
    
    this.contextValue = 'project';
    
    this.command = {
      command: 'projax.openProject',
      title: 'Open Project',
      arguments: [project],
    };
  }
}
```

The extension shows all my projects in the sidebar, indicates which have uncommitted changes, and lets me click to open them. Works in Cursor and Windsurf too since they're VS Code forks.

## What I Learned

Building projax reinforced some lessons:

**1. Monorepos are worth the setup.** Yes, configuring pnpm workspaces and TypeScript project references takes an afternoon. But after that, adding a new interface package is trivial, and sharing code between CLI/extension/desktop just works.

**2. Build for yourself first.** Projax solves my exact problems because I'm the primary user. I don't have feature requests—I have itches to scratch.

**3. CLIs are underrated UI.** Sometimes I want a GUI, sometimes I want to type `projax run foo dev` without leaving my terminal. Having both means I use the tool more.

**4. The boring parts matter.** Port detection sounds trivial until you realize there are 15 different ways a port might be specified. The polish is in those details.

---

*Try it with `npm install -g @projax/cli` then `projax scan ~/Developer`. The VS Code extension is on the marketplace as "Projax".*
