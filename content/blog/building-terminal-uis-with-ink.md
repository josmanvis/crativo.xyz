---
title: "Building Beautiful Terminal UIs with Ink: React for the Command Line"
publishedAt: 2024-03-20
description: "A deep dive into building interactive terminal applications with Ink. From basic components to complex state management, learn to create CLI tools that feel like native apps."
tags: ["cli", "terminal", "ink", "react", "tui", "developer-tools"]
coverImage: /blog/terminal-ink.svg
featured: true
readingTime: "20 min"
---

# Building Beautiful Terminal UIs with Ink: React for the Command Line

Terminal applications have a reputation for being ugly. Walls of text, cryptic flags, and output that looks like it's from 1985. But it doesn't have to be that way.

When I built `pubsafe`, a security scanning CLI, I wanted something that felt modern—real-time updates, interactive prompts, and visual feedback that actually helped users understand what was happening. Plain `console.log` wasn't going to cut it.

Enter Ink: React for the terminal. Write components, manage state, and render to the terminal instead of the DOM. If you know React, you already know 80% of Ink.

This is everything I've learned building production CLI tools with Ink.

## Why Ink?

Before Ink, building interactive CLI tools meant wrestling with:

- **Raw ANSI codes**: `\x1b[32m` for green, `\x1b[0m` to reset... ugh
- **Cursor management**: Manually tracking where you are on screen
- **State updates**: Clearing and re-rendering everything on every change
- **Input handling**: Reading keystrokes, managing focus

Ink abstracts all of this. You write declarative components, and Ink handles the terminal rendering:

```tsx
import { render, Text, Box } from 'ink';

function App() {
  return (
    <Box flexDirection="column" padding={1}>
      <Text color="green">✓ All checks passed</Text>
      <Text dimColor>Scanned 42 files in 1.2s</Text>
    </Box>
  );
}

render(<App />);
```

That's it. Color, layout, and rendering handled automatically.

## Getting Started

```bash
mkdir my-cli && cd my-cli
npm init -y
npm install ink react
npm install -D typescript @types/react tsx
```

Basic `tsconfig.json`:

```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "target": "ES2022",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "outDir": "dist"
  },
  "include": ["src"]
}
```

Create `src/cli.tsx`:

```tsx
#!/usr/bin/env node
import { render } from 'ink';
import App from './App.js';

render(<App />);
```

And `src/App.tsx`:

```tsx
import { Text } from 'ink';

export default function App() {
  return <Text>Hello from Ink! 🎨</Text>;
}
```

Run it:

```bash
npx tsx src/cli.tsx
```

## Core Concepts

### The Box Component

`Box` is Ink's `div`. It supports flexbox layout:

```tsx
import { Box, Text } from 'ink';

function Dashboard() {
  return (
    <Box flexDirection="column" width={60}>
      {/* Header */}
      <Box borderStyle="round" paddingX={2}>
        <Text bold>System Status</Text>
      </Box>
      
      {/* Content - horizontal layout */}
      <Box marginTop={1}>
        <Box width="50%">
          <Text>CPU: 45%</Text>
        </Box>
        <Box width="50%">
          <Text>Memory: 2.1GB</Text>
        </Box>
      </Box>
      
      {/* Footer - right aligned */}
      <Box marginTop={1} justifyContent="flex-end">
        <Text dimColor>Last updated: just now</Text>
      </Box>
    </Box>
  );
}
```

Flexbox in the terminal. It actually works.

### The Text Component

`Text` handles all your text needs:

```tsx
import { Text } from 'ink';

function StyledText() {
  return (
    <>
      {/* Colors */}
      <Text color="green">Success</Text>
      <Text color="red">Error</Text>
      <Text color="#ff6b6b">Custom hex color</Text>
      <Text color="rgb(255, 107, 107)">RGB works too</Text>
      
      {/* Background colors */}
      <Text backgroundColor="yellow" color="black"> Warning </Text>
      
      {/* Styles */}
      <Text bold>Bold text</Text>
      <Text italic>Italic text</Text>
      <Text underline>Underlined</Text>
      <Text strikethrough>Deprecated</Text>
      <Text dimColor>Muted/dim text</Text>
      <Text inverse>Inverted colors</Text>
      
      {/* Combinations */}
      <Text bold color="cyan" underline>Styled heading</Text>
    </>
  );
}
```

### Static Content

Sometimes you want output that doesn't re-render. Logs, for example:

```tsx
import { render, Static, Box, Text } from 'ink';
import { useState, useEffect } from 'react';

function BuildOutput() {
  const [logs, setLogs] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState('Starting...');

  useEffect(() => {
    // Simulate build steps
    const steps = ['Compiling...', 'Bundling...', 'Optimizing...', 'Done!'];
    steps.forEach((step, i) => {
      setTimeout(() => {
        setLogs(prev => [...prev, `[${new Date().toISOString()}] ${step}`]);
        setCurrentStep(steps[i + 1] || 'Complete');
      }, i * 1000);
    });
  }, []);

  return (
    <>
      {/* Static logs - won't re-render */}
      <Static items={logs}>
        {(log, index) => (
          <Text key={index} dimColor>{log}</Text>
        )}
      </Static>
      
      {/* Dynamic status - re-renders */}
      <Box marginTop={1}>
        <Text color="cyan">→ {currentStep}</Text>
      </Box>
    </>
  );
}
```

`Static` is perfect for build output, download progress, or any streaming content where you want to keep a history.

## Handling User Input

### The useInput Hook

```tsx
import { useInput, useApp, Text, Box } from 'ink';
import { useState } from 'react';

function InteractiveMenu() {
  const { exit } = useApp();
  const [selected, setSelected] = useState(0);
  const options = ['Build', 'Test', 'Deploy', 'Exit'];

  useInput((input, key) => {
    if (key.upArrow) {
      setSelected(prev => Math.max(0, prev - 1));
    }
    if (key.downArrow) {
      setSelected(prev => Math.min(options.length - 1, prev + 1));
    }
    if (key.return) {
      if (options[selected] === 'Exit') {
        exit();
      } else {
        console.log(`Selected: ${options[selected]}`);
      }
    }
    if (input === 'q') {
      exit();
    }
  });

  return (
    <Box flexDirection="column">
      <Text bold marginBottom={1}>What would you like to do?</Text>
      {options.map((option, i) => (
        <Text key={option} color={i === selected ? 'cyan' : undefined}>
          {i === selected ? '❯ ' : '  '}{option}
        </Text>
      ))}
      <Text dimColor marginTop={1}>↑/↓ to navigate, Enter to select, q to quit</Text>
    </Box>
  );
}
```

### Text Input

For text input, use `ink-text-input`:

```tsx
import { Box, Text } from 'ink';
import TextInput from 'ink-text-input';
import { useState } from 'react';

function SearchBox() {
  const [query, setQuery] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return <Text>Searching for: {query}</Text>;
  }

  return (
    <Box>
      <Text>Search: </Text>
      <TextInput
        value={query}
        onChange={setQuery}
        onSubmit={() => setSubmitted(true)}
        placeholder="Enter search term..."
      />
    </Box>
  );
}
```

### Select Input

For selection menus, `ink-select-input`:

```tsx
import SelectInput from 'ink-select-input';

function ProjectSelector() {
  const items = [
    { label: 'my-app', value: 'my-app' },
    { label: 'my-lib', value: 'my-lib' },
    { label: 'my-cli', value: 'my-cli' },
  ];

  const handleSelect = (item: { label: string; value: string }) => {
    console.log(`Selected: ${item.value}`);
  };

  return (
    <SelectInput
      items={items}
      onSelect={handleSelect}
      indicatorComponent={({ isSelected }) => (
        <Text color={isSelected ? 'cyan' : undefined}>
          {isSelected ? '❯ ' : '  '}
        </Text>
      )}
    />
  );
}
```

## Real-World Example: pubsafe

Let me walk through how I built `pubsafe`, my pre-publish security scanner. It scans a project for sensitive files and shows results in real-time.

### The Main App

```tsx
// src/App.tsx
import { Box, Text, useApp } from 'ink';
import { useState, useEffect } from 'react';
import { Scanner } from './Scanner.js';
import { Results } from './Results.js';
import { scan } from './core/scanner.js';
import type { ScanResult } from './types.js';

interface Props {
  directory: string;
  fix?: boolean;
}

export default function App({ directory, fix }: Props) {
  const { exit } = useApp();
  const [phase, setPhase] = useState<'scanning' | 'results'>('scanning');
  const [results, setResults] = useState<ScanResult | null>(null);
  const [currentFile, setCurrentFile] = useState('');

  useEffect(() => {
    const runScan = async () => {
      const result = await scan(directory, {
        onProgress: (file) => setCurrentFile(file),
      });
      setResults(result);
      setPhase('results');
    };

    runScan().catch((err) => {
      console.error(err);
      exit();
    });
  }, [directory, exit]);

  if (phase === 'scanning') {
    return <Scanner currentFile={currentFile} />;
  }

  return (
    <Results
      results={results!}
      onFix={fix ? handleFix : undefined}
      onExit={exit}
    />
  );
}
```

### The Scanner Component

Shows real-time progress with a spinner:

```tsx
// src/Scanner.tsx
import { Box, Text } from 'ink';
import Spinner from 'ink-spinner';

interface Props {
  currentFile: string;
}

export function Scanner({ currentFile }: Props) {
  return (
    <Box flexDirection="column" padding={1}>
      <Box>
        <Text color="cyan">
          <Spinner type="dots" />
        </Text>
        <Text> Scanning for sensitive files...</Text>
      </Box>
      
      <Box marginTop={1} marginLeft={2}>
        <Text dimColor>
          {currentFile ? `Checking: ${truncatePath(currentFile)}` : 'Starting...'}
        </Text>
      </Box>
    </Box>
  );
}

function truncatePath(path: string, maxLen = 50): string {
  if (path.length <= maxLen) return path;
  return '...' + path.slice(-maxLen + 3);
}
```

### The Results Component

Shows findings with color-coded severity:

```tsx
// src/Results.tsx
import { Box, Text, useInput, useApp } from 'ink';
import type { ScanResult, Finding } from './types.js';

interface Props {
  results: ScanResult;
  onFix?: () => void;
  onExit: () => void;
}

export function Results({ results, onFix, onExit }: Props) {
  const { exit } = useApp();
  
  useInput((input, key) => {
    if (input === 'f' && onFix) {
      onFix();
    }
    if (input === 'q' || key.escape) {
      onExit();
    }
  });

  const { safe, warnings, dangers } = results;

  return (
    <Box flexDirection="column" padding={1}>
      {/* Header */}
      <Box borderStyle="round" paddingX={2} marginBottom={1}>
        <Text bold>pubsafe</Text>
        <Text dimColor> — Pre-publish security scan</Text>
      </Box>

      {/* Dangerous files */}
      {dangers.length > 0 && (
        <Section title="🚨 EXPOSED" color="red" items={dangers} />
      )}

      {/* Warnings */}
      {warnings.length > 0 && (
        <Section title="⚠️  WARNINGS" color="yellow" items={warnings} />
      )}

      {/* Safe files */}
      {safe.length > 0 && (
        <Box marginTop={1}>
          <Text color="green">✓ {safe.length} sensitive files properly ignored</Text>
        </Box>
      )}

      {/* Summary */}
      <Box marginTop={1} paddingTop={1} borderStyle="single" borderTop borderBottom={false} borderLeft={false} borderRight={false}>
        {dangers.length === 0 ? (
          <Text color="green" bold>All clear! Safe to publish.</Text>
        ) : (
          <Text color="red" bold>
            ⚠️  {dangers.length} file(s) will be published with sensitive data!
          </Text>
        )}
      </Box>

      {/* Actions */}
      <Box marginTop={1}>
        {onFix && dangers.length > 0 && (
          <Text dimColor>[f] Fix automatically  </Text>
        )}
        <Text dimColor>[q] Quit</Text>
      </Box>
    </Box>
  );
}

function Section({ title, color, items }: { title: string; color: string; items: Finding[] }) {
  return (
    <Box flexDirection="column" marginTop={1}>
      <Text color={color} bold>{title}</Text>
      {items.map((item, i) => (
        <Box key={i} marginLeft={2}>
          <Text color={color}>✗ </Text>
          <Text>{item.file}</Text>
          <Text dimColor> — {item.reason}</Text>
        </Box>
      ))}
    </Box>
  );
}
```

## Advanced Patterns

### Measuring Terminal Size

```tsx
import { useStdout } from 'ink';

function ResponsiveLayout() {
  const { stdout } = useStdout();
  const width = stdout?.columns || 80;
  const height = stdout?.rows || 24;

  // Adjust layout based on terminal size
  const isNarrow = width < 60;

  return (
    <Box flexDirection={isNarrow ? 'column' : 'row'}>
      <Sidebar width={isNarrow ? '100%' : '30%'} />
      <Content width={isNarrow ? '100%' : '70%'} />
    </Box>
  );
}
```

### Focus Management

For complex UIs with multiple interactive elements:

```tsx
import { useFocus, useFocusManager, Box, Text } from 'ink';

function FocusableInput({ id, label }: { id: string; label: string }) {
  const { isFocused } = useFocus({ id });

  return (
    <Box>
      <Text color={isFocused ? 'cyan' : undefined}>
        {isFocused ? '❯ ' : '  '}
        {label}
      </Text>
    </Box>
  );
}

function Form() {
  const { focusNext, focusPrevious } = useFocusManager();

  useInput((input, key) => {
    if (key.tab) {
      if (key.shift) {
        focusPrevious();
      } else {
        focusNext();
      }
    }
  });

  return (
    <Box flexDirection="column">
      <FocusableInput id="name" label="Name" />
      <FocusableInput id="email" label="Email" />
      <FocusableInput id="submit" label="Submit" />
      <Text dimColor marginTop={1}>Tab to navigate</Text>
    </Box>
  );
}
```

### Tables

For structured data, `ink-table`:

```tsx
import Table from 'ink-table';

function ProcessList() {
  const data = [
    { pid: '1234', name: 'node', cpu: '12%', memory: '150MB' },
    { pid: '5678', name: 'chrome', cpu: '45%', memory: '2.1GB' },
    { pid: '9012', name: 'vscode', cpu: '8%', memory: '800MB' },
  ];

  return <Table data={data} />;
}
```

### Progress Bars

Custom progress bar component:

```tsx
import { Box, Text } from 'ink';

interface Props {
  percent: number;
  width?: number;
  showPercent?: boolean;
}

function ProgressBar({ percent, width = 40, showPercent = true }: Props) {
  const filled = Math.round((percent / 100) * width);
  const empty = width - filled;

  return (
    <Box>
      <Text color="cyan">
        {'█'.repeat(filled)}
        {'░'.repeat(empty)}
      </Text>
      {showPercent && (
        <Text dimColor> {percent.toFixed(0)}%</Text>
      )}
    </Box>
  );
}

// Usage
function DownloadProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(p => Math.min(100, p + 1));
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <Box flexDirection="column">
      <Text>Downloading package...</Text>
      <ProgressBar percent={progress} />
    </Box>
  );
}
```

## Testing Ink Apps

Ink provides `ink-testing-library` for testing:

```tsx
import { render } from 'ink-testing-library';
import App from './App.js';

describe('App', () => {
  it('shows scanning message initially', () => {
    const { lastFrame } = render(<App directory="." />);
    expect(lastFrame()).toContain('Scanning');
  });

  it('responds to keyboard input', () => {
    const { stdin, lastFrame } = render(<InteractiveMenu />);
    
    // Simulate down arrow
    stdin.write('\u001B[B');
    expect(lastFrame()).toContain('❯ Test');
    
    // Simulate enter
    stdin.write('\r');
    expect(lastFrame()).toContain('Selected: Test');
  });
});
```

## Building for Distribution

For a publishable CLI, structure it like this:

```
my-cli/
├── src/
│   ├── cli.tsx           # Entry point with shebang
│   ├── App.tsx           # Main component
│   └── components/       # UI components
├── bin/
│   └── my-cli.js         # Built entry point
├── package.json
└── tsconfig.json
```

`package.json`:

```json
{
  "name": "my-cli",
  "version": "1.0.0",
  "bin": {
    "my-cli": "./bin/my-cli.js"
  },
  "files": ["bin", "dist"],
  "scripts": {
    "build": "tsup src/cli.tsx --format esm --outDir bin --no-splitting",
    "prepublishOnly": "npm run build"
  }
}
```

Add the shebang in `src/cli.tsx`:

```tsx
#!/usr/bin/env node
import { render } from 'ink';
import meow from 'meow';
import App from './App.js';

const cli = meow(`
  Usage
    $ my-cli [directory]

  Options
    --fix  Automatically fix issues

  Examples
    $ my-cli .
    $ my-cli ./my-project --fix
`, {
  importMeta: import.meta,
  flags: {
    fix: {
      type: 'boolean',
      default: false,
    },
  },
});

render(<App directory={cli.input[0] || '.'} fix={cli.flags.fix} />);
```

## Performance Tips

### Avoid Unnecessary Re-renders

Same rules as React:
- Memoize expensive computations
- Use `React.memo` for pure components
- Keep state local when possible

```tsx
import { memo, useMemo } from 'react';

const FileList = memo(function FileList({ files }: { files: string[] }) {
  const sortedFiles = useMemo(
    () => [...files].sort((a, b) => a.localeCompare(b)),
    [files]
  );

  return (
    <Box flexDirection="column">
      {sortedFiles.map(file => (
        <Text key={file}>{file}</Text>
      ))}
    </Box>
  );
});
```

### Throttle Updates

For high-frequency updates (like progress), throttle:

```tsx
import { useRef, useCallback } from 'react';

function useThrottledState<T>(initialValue: T, delay = 100) {
  const [value, setValue] = useState(initialValue);
  const lastUpdate = useRef(0);

  const throttledSetValue = useCallback((newValue: T) => {
    const now = Date.now();
    if (now - lastUpdate.current >= delay) {
      setValue(newValue);
      lastUpdate.current = now;
    }
  }, [delay]);

  return [value, throttledSetValue] as const;
}
```

## Wrapping Up

Ink transforms CLI development. Instead of fighting ANSI codes and cursor positioning, you write components. The mental model of React translates perfectly to terminal UIs.

Key takeaways:

1. **Box + Text = Layout** — Flexbox works in the terminal
2. **useInput for interactivity** — Handle keyboard input declaratively
3. **Static for logs** — Keep a history without re-rendering
4. **ink-\* packages** — Don't reinvent spinners, tables, selects
5. **Test with ink-testing-library** — Yes, you can test CLIs

The terminal is having a renaissance. Tools like `lazygit`, `btop`, and `k9s` prove that CLI tools can be beautiful and usable. With Ink, building them is actually enjoyable.

---

*What CLI tools would you build with Ink? I'm always looking for new project ideas.*
