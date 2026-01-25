---
title: "Pre-Publish Security Scanning: How I Almost Leaked API Keys (and Built pubsafe)"
date: "2025-01-25"
description: "The story of how I almost published an npm package with sensitive credentials, and the security scanning tool I built to prevent it from happening again."
tags: ["security", "npm", "cli", "devtools", "secrets"]
coverImage: /blog/pubsafe.svg
featured: true
readingTime: "14 min"
---

# Pre-Publish Security Scanning: How I Almost Leaked API Keys (and Built pubsafe)

It was 11 PM on a Friday. I had just finished a new npm package—a utility library I'd been polishing for weeks. Tests passing, documentation written, changelog updated. I ran `npm publish` with the satisfaction of shipping something new.

The next morning, I got an automated email from GitHub: "A secret was detected in a public repository."

My stomach dropped. I opened the email. There it was: my Stripe API key, published to npm, mirrored to the npm CDN, and now sitting in who-knows-how-many `node_modules` folders around the world.

The key was in a `.env.local` file. A file that should never have been published. A file I'd added to `.gitignore` but forgot to add to `.npmignore`. npm doesn't read `.gitignore`—it has its own rules.

I rotated the key immediately. Deprecated that npm version. Published a clean version. But the damage was theoretical—that key had been in the wild for 12 hours.

That's when I built pubsafe.

## The Problem: npm Publishes More Than You Think

When you run `npm publish`, npm includes:
1. Everything in your project root
2. Minus files matched by `.npmignore`
3. Minus some default exclusions (like `node_modules`)

But here's what catches people:
- `.gitignore` is **not** read by npm
- If you have both `.gitignore` and `.npmignore`, only `.npmignore` is used
- The `files` field in `package.json` is a whitelist, but it still publishes `package.json`, `README`, etc.

Common files that leak:
- `.env`, `.env.local`, `.env.development`
- `credentials.json`, `service-account.json`
- SSH private keys (`id_rsa`, `*.pem`)
- API key config files
- Local database files (`*.sqlite`, `*.db`)
- Test fixtures with real data

## The Solution: Scan Before You Ship

pubsafe is a CLI tool that:
1. Scans your project for files that match sensitive patterns
2. Checks if those files are properly excluded from npm
3. Shows you what's safe and what's exposed
4. Optionally fixes your `.npmignore` automatically

```bash
npx pubsafe

# Output:
# 🔍 Scanning for sensitive files...
#
# 🚨 EXPOSED
# ✗ .env — Environment variables (not in .npmignore)
# ✗ config/api-keys.json — API configuration (not in .npmignore)
#
# ⚠️  WARNINGS  
# ✗ test/fixtures/users.json — Test data (may contain PII)
#
# ✓ 3 sensitive files properly ignored
#
# ⚠️  2 file(s) will be published with sensitive data!
#
# [f] Fix automatically  [q] Quit
```

## How pubsafe Works

### 1. Sensitive File Detection

The core is a pattern matcher that identifies potentially sensitive files:

```typescript
// src/patterns.ts
export const SENSITIVE_PATTERNS: Pattern[] = [
  // Environment files
  {
    glob: '**/.env*',
    name: 'Environment variables',
    severity: 'critical',
    description: 'May contain API keys, database passwords, secrets',
  },
  {
    glob: '**/env.local',
    name: 'Local environment',
    severity: 'critical',
  },

  // Credential files
  {
    glob: '**/credentials*.json',
    name: 'Credentials file',
    severity: 'critical',
  },
  {
    glob: '**/service-account*.json',
    name: 'GCP service account',
    severity: 'critical',
  },
  {
    glob: '**/*-key.json',
    name: 'API key file',
    severity: 'critical',
  },

  // SSH/TLS
  {
    glob: '**/id_rsa*',
    name: 'SSH private key',
    severity: 'critical',
  },
  {
    glob: '**/*.pem',
    name: 'PEM certificate/key',
    severity: 'high',
    description: 'May be a private key',
  },
  {
    glob: '**/*.key',
    name: 'Key file',
    severity: 'high',
  },

  // Databases
  {
    glob: '**/*.sqlite*',
    name: 'SQLite database',
    severity: 'high',
    description: 'May contain sensitive data',
  },
  {
    glob: '**/*.db',
    name: 'Database file',
    severity: 'high',
  },

  // Cloud config
  {
    glob: '**/.aws/credentials',
    name: 'AWS credentials',
    severity: 'critical',
  },
  {
    glob: '**/.gcloud/**',
    name: 'GCloud config',
    severity: 'high',
  },

  // Secrets managers
  {
    glob: '**/*.vault',
    name: 'Vault file',
    severity: 'high',
  },
  {
    glob: '**/secrets.yaml',
    name: 'Secrets config',
    severity: 'critical',
  },
  {
    glob: '**/secrets.json',
    name: 'Secrets config',
    severity: 'critical',
  },

  // Test data (lower severity)
  {
    glob: '**/fixtures/**/*.json',
    name: 'Test fixtures',
    severity: 'low',
    description: 'May contain PII or sensitive test data',
  },
  {
    glob: '**/seed/**/*.json',
    name: 'Seed data',
    severity: 'low',
  },

  // Log files
  {
    glob: '**/*.log',
    name: 'Log file',
    severity: 'low',
    description: 'May contain sensitive runtime data',
  },

  // Config that might have secrets
  {
    glob: '**/config.local.*',
    name: 'Local config',
    severity: 'medium',
  },
  {
    glob: '**/settings.local.*',
    name: 'Local settings',
    severity: 'medium',
  },
];
```

### 2. npm Exclusion Checking

Next, we determine what npm will actually publish:

```typescript
// src/npm-check.ts
import { readFile, access } from 'fs/promises';
import { join } from 'path';
import ignore from 'ignore';

export async function getNpmIgnoreRules(projectDir: string): Promise<ignore.Ignore> {
  const ig = ignore();

  // Default npm exclusions
  ig.add([
    'node_modules',
    '.git',
    '.svn',
    '.hg',
    '.lock-wscript',
    '.wafpickle-N',
    '.*.swp',
    '.DS_Store',
    '._*',
    'npm-debug.log',
    '.npmrc',
    'config.gypi',
    '*.orig',
    'package-lock.json',
  ]);

  // Check for .npmignore
  const npmignorePath = join(projectDir, '.npmignore');
  try {
    await access(npmignorePath);
    const content = await readFile(npmignorePath, 'utf-8');
    ig.add(content);
  } catch {
    // No .npmignore, check for .gitignore
    // npm uses .gitignore if no .npmignore exists
    const gitignorePath = join(projectDir, '.gitignore');
    try {
      await access(gitignorePath);
      const content = await readFile(gitignorePath, 'utf-8');
      ig.add(content);
    } catch {
      // No ignore files
    }
  }

  return ig;
}

export async function checkFilesField(projectDir: string): Promise<string[] | null> {
  const pkgPath = join(projectDir, 'package.json');
  try {
    const content = await readFile(pkgPath, 'utf-8');
    const pkg = JSON.parse(content);
    return pkg.files || null;
  } catch {
    return null;
  }
}

export async function willBePublished(
  file: string,
  projectDir: string,
  ig: ignore.Ignore,
  filesField: string[] | null
): Promise<boolean> {
  const relativePath = file.replace(projectDir + '/', '');

  // If files field exists, only those files are published
  if (filesField) {
    const inFilesField = filesField.some(pattern => {
      const fileIg = ignore().add(pattern);
      return !fileIg.ignores(relativePath);
    });

    // But package.json, README, LICENSE are always included
    const alwaysIncluded = ['package.json', 'readme', 'license', 'licence', 'changelog'];
    const isAlwaysIncluded = alwaysIncluded.some(name =>
      relativePath.toLowerCase().startsWith(name)
    );

    if (!inFilesField && !isAlwaysIncluded) {
      return false; // Won't be published
    }
  }

  // Check ignore rules
  return !ig.ignores(relativePath);
}
```

### 3. The Scanner

Bringing it together:

```typescript
// src/scanner.ts
import { glob } from 'glob';
import { SENSITIVE_PATTERNS } from './patterns.js';
import { getNpmIgnoreRules, checkFilesField, willBePublished } from './npm-check.js';

export interface ScanResult {
  safe: Finding[];      // Sensitive files that ARE properly ignored
  warnings: Finding[];  // Low severity or uncertain
  dangers: Finding[];   // Critical files that WILL be published
}

export interface Finding {
  file: string;
  pattern: Pattern;
  reason: string;
}

export async function scan(
  projectDir: string,
  options?: { onProgress?: (file: string) => void }
): Promise<ScanResult> {
  const result: ScanResult = { safe: [], warnings: [], dangers: [] };

  const ig = await getNpmIgnoreRules(projectDir);
  const filesField = await checkFilesField(projectDir);

  // Find all files matching sensitive patterns
  for (const pattern of SENSITIVE_PATTERNS) {
    const matches = await glob(pattern.glob, {
      cwd: projectDir,
      nodir: true,
      dot: true, // Include dotfiles
      ignore: ['**/node_modules/**'],
    });

    for (const match of matches) {
      options?.onProgress?.(match);

      const published = await willBePublished(match, projectDir, ig, filesField);

      const finding: Finding = {
        file: match,
        pattern,
        reason: pattern.description || pattern.name,
      };

      if (!published) {
        result.safe.push(finding);
      } else if (pattern.severity === 'critical' || pattern.severity === 'high') {
        result.dangers.push(finding);
      } else {
        result.warnings.push(finding);
      }
    }
  }

  return result;
}
```

### 4. The Fix

When the user presses 'f', we update `.npmignore`:

```typescript
// src/fix.ts
import { readFile, writeFile, access } from 'fs/promises';
import { join } from 'path';

export async function fixNpmIgnore(
  projectDir: string,
  filesToIgnore: string[]
): Promise<{ added: string[]; alreadyPresent: string[] }> {
  const npmignorePath = join(projectDir, '.npmignore');
  let existingContent = '';

  try {
    await access(npmignorePath);
    existingContent = await readFile(npmignorePath, 'utf-8');
  } catch {
    // File doesn't exist, we'll create it
  }

  const existingLines = new Set(
    existingContent.split('\n').map(line => line.trim()).filter(Boolean)
  );

  const added: string[] = [];
  const alreadyPresent: string[] = [];

  for (const file of filesToIgnore) {
    if (existingLines.has(file)) {
      alreadyPresent.push(file);
    } else {
      added.push(file);
    }
  }

  if (added.length > 0) {
    const newContent = existingContent.trimEnd() + '\n\n# Added by pubsafe\n' + added.join('\n') + '\n';
    await writeFile(npmignorePath, newContent);
  }

  return { added, alreadyPresent };
}
```

## The UI Layer

pubsafe uses Ink for a beautiful terminal experience (see my other article on building terminal UIs with Ink). The key components:

```tsx
// Simplified version of the Results component
function Results({ results }: { results: ScanResult }) {
  const { dangers, warnings, safe } = results;

  return (
    <Box flexDirection="column">
      {/* Dangers - red */}
      {dangers.length > 0 && (
        <>
          <Text color="red" bold>🚨 EXPOSED</Text>
          {dangers.map((d, i) => (
            <Text key={i} color="red">
              ✗ {d.file} — {d.reason}
            </Text>
          ))}
        </>
      )}

      {/* Warnings - yellow */}
      {warnings.length > 0 && (
        <>
          <Text color="yellow" bold>⚠️  WARNINGS</Text>
          {warnings.map((w, i) => (
            <Text key={i} color="yellow">
              ✗ {w.file} — {w.reason}
            </Text>
          ))}
        </>
      )}

      {/* Safe count */}
      <Text color="green">
        ✓ {safe.length} sensitive files properly ignored
      </Text>

      {/* Summary */}
      {dangers.length === 0 ? (
        <Text color="green" bold>All clear! Safe to publish.</Text>
      ) : (
        <Text color="red" bold>
          ⚠️  {dangers.length} file(s) will be published with sensitive data!
        </Text>
      )}
    </Box>
  );
}
```

## Integrating Into Your Workflow

### prepublishOnly Hook

Add to `package.json`:

```json
{
  "scripts": {
    "prepublishOnly": "pubsafe --ci && npm run build && npm test"
  }
}
```

The `--ci` flag exits with code 1 if any dangers are found, blocking the publish.

### GitHub Actions

```yaml
name: Publish

on:
  push:
    tags:
      - 'v*'

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          registry-url: 'https://registry.npmjs.org'
      
      # Security scan before anything else
      - name: Security scan
        run: npx pubsafe --ci
      
      - run: npm ci
      - run: npm test
      - run: npm publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

### Pre-commit Hook

With Husky:

```bash
npx husky add .husky/pre-commit "npx pubsafe --quick"
```

The `--quick` flag skips the interactive UI and just exits with pass/fail.

## Beyond pubsafe: Defense in Depth

pubsafe is one layer. Here's the full defense stack I recommend:

### 1. Use `.npmignore` OR `files`, Not Both

Pick one strategy:

**Whitelist with `files`** (recommended):
```json
{
  "files": ["dist", "README.md", "LICENSE"]
}
```

This explicitly lists what gets published. Everything else is excluded.

**Blacklist with `.npmignore`**:
```
.env*
*.key
*.pem
credentials*
config.local.*
test/
scripts/
```

Don't use both—it gets confusing.

### 2. Always Run `npm pack --dry-run`

Before publishing, see what will be included:

```bash
npm pack --dry-run
# Lists all files and total size
```

Or actually pack and inspect:

```bash
npm pack
tar -tzf your-package-1.0.0.tgz
```

### 3. Use npm Provenance

npm now supports provenance—cryptographic proof that a package came from a specific GitHub repo and workflow:

```bash
npm publish --provenance
```

This doesn't prevent leaks, but it helps consumers trust packages.

### 4. Secret Scanning in CI

Enable GitHub's secret scanning and push protection:

1. Go to repo Settings → Security → Code security and analysis
2. Enable "Secret scanning" and "Push protection"

This catches secrets before they even hit GitHub.

### 5. git-secrets

Install [git-secrets](https://github.com/awslabs/git-secrets) to prevent commits with secrets:

```bash
git secrets --install
git secrets --register-aws

# Scan history
git secrets --scan-history
```

### 6. Rotate Regularly

Even with all precautions, rotate secrets:
- API keys: Every 90 days
- Database passwords: Every 90 days
- Immediately after any suspected exposure

## What I Learned

Building pubsafe taught me several things:

### 1. npm's Rules Are Complicated

The interaction between `.npmignore`, `.gitignore`, and `files` is not intuitive. Even experienced developers get it wrong. pubsafe had to replicate npm's exact logic to be accurate.

### 2. Patterns Aren't Enough

Initially, I just matched filenames. But `config.json` in your `dist/` folder is fine—it's probably documentation. `config.json` in your root with `"apiKey": "sk_live_..."` is not.

Future versions might do content scanning:

```typescript
// Potential future enhancement
async function scanFileContent(filePath: string): Promise<SecretMatch[]> {
  const content = await readFile(filePath, 'utf-8');
  const patterns = [
    /sk_live_[a-zA-Z0-9]{24,}/g,           // Stripe
    /AKIA[A-Z0-9]{16}/g,                   // AWS
    /ghp_[a-zA-Z0-9]{36}/g,               // GitHub PAT
    /-----BEGIN RSA PRIVATE KEY-----/g,   // Private keys
  ];

  // ... match and return
}
```

### 3. Developer Experience Matters

The first version of pubsafe was just JSON output. Nobody used it. Adding the Ink UI with colors, progress, and fix automation made it something people actually ran.

### 4. Defaults Should Be Safe

pubsafe runs in interactive mode by default. It shows you what's happening and asks before changing anything. The `--ci` and `--quick` flags are opt-in for automation.

## Try It

```bash
# Run on your current project
npx pubsafe

# CI mode (exit code 1 if issues found)
npx pubsafe --ci

# Force-fix: patch everything with a single confirmation
npx pubsafe -d ~/Developer --force-fix
npx pubsafe -d ~/Developer -ff
```

### Force-Fix Mode (v1.1.0)

New in v1.1.0: the `--force-fix` (or `-ff`) flag for when you just want to fix everything at once:

```bash
$ pubsafe -d ~/Developer -ff

🔍 Scanning for exposed patterns...

Found 5 exposed pattern(s) across 3 project(s):

  my-api-wrapper
    • .env
    • .env.local

  quick-cli-tool
    • credentials.json

  test-project
    • config.local.json
    • secrets.yaml

Apply all fixes? [y/N] y

⚙️  Applying fixes...

  ✓ my-api-wrapper: added 2 pattern(s)
  ✓ quick-cli-tool: added 1 pattern(s)
  ✓ test-project: added 2 pattern(s)

✓ Fixed 5 pattern(s)
```

No navigating through menus—just scan, confirm once, done. Perfect for cleaning up a bunch of projects at once or running in semi-automated scripts.

Don't be the developer who leaks their API keys to npm. I've been there. It's not fun.

---

*Have you ever accidentally published secrets? What tools do you use to prevent it? I'd love to hear about other approaches.*
