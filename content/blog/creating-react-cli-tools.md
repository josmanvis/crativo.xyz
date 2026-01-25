---
title: Creating CLI Tools for React Development
excerpt: How I built ace, a CLI tool for bootstrapping React applications with sensible defaults.
category: tools
publishedAt: 2024-10-05
tags:
  - Node.js
  - CLI
  - NPM
  - Tooling
coverImage: /blog/cli-tools.svg
---

# Creating CLI Tools for React Development

I've started enough React projects to know exactly what I want: TypeScript, a specific folder structure, ESLint configured just so, styled-components, a few utility functions I always copy-paste. Every time I ran `create-react-app` or `vite create`, I'd spend the next 30 minutes getting things how I like them.

So I built **ace**—a CLI that creates React projects exactly the way I want. Along the way, I learned a lot about building command-line tools in Node.js.

## Why Build Your Own CLI?

The honest answer: it's faster to learn the tooling once and automate than to do the same setup a hundred times.

But there's a secondary benefit—understanding. Before building ace, `npx create-react-app` was a magic incantation. Now I know exactly what it does: download a template, copy files, run `npm install`, maybe do some string replacement. No mystery.

If you've ever wanted to understand how CLIs work, building one is the best teacher.

## Anatomy of a CLI

A CLI is just a Node.js script with some conventions:

```
ace/
├── bin/
│   └── ace.js          # Entry point
├── src/
│   ├── commands/
│   │   ├── create.ts   # `ace create` command
│   │   ├── add.ts      # `ace add` command
│   │   └── dev.ts      # `ace dev` command
│   ├── templates/      # Project templates
│   ├── utils/
│   │   ├── files.ts    # File system helpers
│   │   ├── prompt.ts   # User input
│   │   └── format.ts   # Output formatting
│   └── index.ts
├── package.json
└── tsconfig.json
```

The magic is in `package.json`:

```json
{
  "name": "ace",
  "version": "1.0.0",
  "bin": {
    "ace": "./bin/ace.js"
  },
  "files": [
    "bin",
    "dist",
    "templates"
  ]
}
```

The `bin` field tells npm to create an executable symlink when the package is installed globally. When someone runs `npx ace`, npm:

1. Downloads the package
2. Looks at the `bin` field
3. Runs `./bin/ace.js`

The entry point needs a shebang:

```javascript
#!/usr/bin/env node

require('../dist/index.js');
```

That's it. The shebang tells the OS to use Node.js to execute the script.

## Commander: The CLI Framework

You could parse `process.argv` yourself, but that's tedious. Commander.js is the standard library for CLI argument parsing:

```typescript
// src/index.ts
import { Command } from 'commander';
import { create } from './commands/create';
import { add } from './commands/add';

const program = new Command();

program
  .name('ace')
  .description('CLI for bootstrapping React applications')
  .version('1.0.0');

program
  .command('create <name>')
  .description('Create a new React application')
  .option('-t, --template <template>', 'Template to use', 'default')
  .option('--typescript', 'Use TypeScript', true)
  .option('--no-typescript', 'Use JavaScript')
  .option('--git', 'Initialize git repository', true)
  .option('--no-git', 'Skip git initialization')
  .option('-p, --package-manager <pm>', 'Package manager to use', 'npm')
  .action(create);

program
  .command('add <component>')
  .description('Add a component or feature')
  .option('-d, --directory <dir>', 'Target directory')
  .action(add);

program.parse();
```

Commander gives you:
- Automatic `--help` generation
- Argument and option parsing
- Type coercion
- Subcommands

Running `ace --help` now shows:

```
Usage: ace [options] [command]

CLI for bootstrapping React applications

Options:
  -V, --version               output the version number
  -h, --help                  display help for command

Commands:
  create [options] <name>     Create a new React application
  add [options] <component>   Add a component or feature
  help [command]              display help for command
```

## Interactive Prompts with Inquirer

Sometimes you want to ask the user questions rather than requiring flags. Inquirer handles this beautifully:

```typescript
// src/commands/create.ts
import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';

interface CreateOptions {
  template: string;
  typescript: boolean;
  git: boolean;
  packageManager: string;
}

export async function create(name: string, options: CreateOptions) {
  // If options weren't provided via flags, ask interactively
  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'template',
      message: 'Which template would you like to use?',
      choices: [
        { name: 'Default (Vite + React)', value: 'default' },
        { name: 'With Router', value: 'router' },
        { name: 'Full Stack (Express API)', value: 'fullstack' },
        { name: 'Desktop (Tauri)', value: 'tauri' },
      ],
      when: !options.template || options.template === 'default',
      default: 'default',
    },
    {
      type: 'list',
      name: 'packageManager',
      message: 'Which package manager?',
      choices: ['npm', 'yarn', 'pnpm', 'bun'],
      when: !options.packageManager,
      default: 'npm',
    },
    {
      type: 'confirm',
      name: 'git',
      message: 'Initialize a git repository?',
      when: options.git === undefined,
      default: true,
    },
  ]);

  const config = { ...options, ...answers };
  
  console.log();
  console.log(chalk.cyan('Creating project:'), chalk.bold(name));
  console.log();

  await executeCreate(name, config);
}
```

Inquirer supports various prompt types:
- `input` — Free text
- `confirm` — Yes/no
- `list` — Single selection
- `checkbox` — Multi selection
- `password` — Hidden input

The `when` option is powerful—prompts only appear if the condition is true. This lets you use flags to skip interactive mode entirely:

```bash
# Interactive
ace create my-app

# Non-interactive (for CI/scripts)
ace create my-app --template=router --package-manager=pnpm --no-git
```

## Progress Indicators with Ora

Long operations need feedback. Ora creates those nice spinners:

```typescript
import ora from 'ora';

async function executeCreate(name: string, config: Config) {
  const spinner = ora();

  // Step 1: Copy template
  spinner.start('Copying template files...');
  await copyTemplate(name, config.template);
  spinner.succeed('Template files copied');

  // Step 2: Customize
  spinner.start('Customizing project...');
  await customizeProject(name, config);
  spinner.succeed('Project customized');

  // Step 3: Install dependencies
  spinner.start('Installing dependencies...');
  try {
    await installDependencies(name, config.packageManager);
    spinner.succeed('Dependencies installed');
  } catch (error) {
    spinner.fail('Failed to install dependencies');
    throw error;
  }

  // Step 4: Initialize git
  if (config.git) {
    spinner.start('Initializing git repository...');
    await initGit(name);
    spinner.succeed('Git repository initialized');
  }

  // Done!
  console.log();
  console.log(chalk.green('✨ Project created successfully!'));
  console.log();
  console.log('Next steps:');
  console.log(chalk.cyan(`  cd ${name}`));
  console.log(chalk.cyan(`  ${config.packageManager} run dev`));
  console.log();
}
```

The output looks like:

```
✔ Template files copied
✔ Project customized
⠋ Installing dependencies...
```

## File System Operations

The core of a scaffolding CLI is copying and modifying files:

```typescript
// src/utils/files.ts
import fs from 'fs-extra';
import path from 'path';
import { glob } from 'glob';

export async function copyTemplate(
  projectName: string,
  templateName: string
): Promise<void> {
  const templateDir = path.join(__dirname, '..', 'templates', templateName);
  const targetDir = path.join(process.cwd(), projectName);

  // Check if directory exists
  if (await fs.pathExists(targetDir)) {
    throw new Error(`Directory ${projectName} already exists`);
  }

  // Copy all files
  await fs.copy(templateDir, targetDir);
}

export async function replaceInFile(
  filePath: string,
  replacements: Record<string, string>
): Promise<void> {
  let content = await fs.readFile(filePath, 'utf-8');
  
  for (const [pattern, replacement] of Object.entries(replacements)) {
    content = content.replace(new RegExp(pattern, 'g'), replacement);
  }
  
  await fs.writeFile(filePath, content);
}

export async function replaceInAllFiles(
  directory: string,
  replacements: Record<string, string>,
  extensions: string[] = ['.ts', '.tsx', '.js', '.jsx', '.json', '.html', '.md']
): Promise<void> {
  const pattern = `**/*{${extensions.join(',')}}`;
  const files = await glob(pattern, { cwd: directory, absolute: true });
  
  await Promise.all(
    files.map(file => replaceInFile(file, replacements))
  );
}
```

For project customization, I use placeholder tokens in templates:

```json
// templates/default/package.json
{
  "name": "{{PROJECT_NAME}}",
  "version": "0.0.1",
  "description": "{{PROJECT_DESCRIPTION}}",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  }
}
```

Then replace them:

```typescript
async function customizeProject(name: string, config: Config) {
  const projectDir = path.join(process.cwd(), name);
  
  await replaceInAllFiles(projectDir, {
    '{{PROJECT_NAME}}': name,
    '{{PROJECT_DESCRIPTION}}': `A React application created with ace`,
    '{{AUTHOR}}': await getGitUser(),
  });
}

async function getGitUser(): Promise<string> {
  try {
    const { stdout } = await execa('git', ['config', 'user.name']);
    return stdout.trim();
  } catch {
    return '';
  }
}
```

## Running Shell Commands with Execa

You'll need to run external commands—`npm install`, `git init`, etc. Execa is the modern way to do this:

```typescript
import { execa, ExecaError } from 'execa';

async function installDependencies(
  projectName: string,
  packageManager: string
): Promise<void> {
  const projectDir = path.join(process.cwd(), projectName);
  
  const commands: Record<string, [string, string[]]> = {
    npm: ['npm', ['install']],
    yarn: ['yarn', ['install']],
    pnpm: ['pnpm', ['install']],
    bun: ['bun', ['install']],
  };

  const [cmd, args] = commands[packageManager];
  
  try {
    await execa(cmd, args, {
      cwd: projectDir,
      stdio: 'pipe', // Capture output, don't print to console
    });
  } catch (error) {
    if (error instanceof ExecaError) {
      console.error(chalk.red('Installation failed:'));
      console.error(error.stderr);
    }
    throw error;
  }
}

async function initGit(projectName: string): Promise<void> {
  const projectDir = path.join(process.cwd(), projectName);
  
  await execa('git', ['init'], { cwd: projectDir });
  await execa('git', ['add', '.'], { cwd: projectDir });
  await execa('git', ['commit', '-m', 'Initial commit from ace'], { cwd: projectDir });
}
```

The `stdio: 'pipe'` option is important—it captures output so you can process it or hide it. Use `stdio: 'inherit'` when you want the command's output to appear directly in the terminal.

## Colorful Output with Chalk

Chalk makes terminal output readable:

```typescript
import chalk from 'chalk';

console.log(chalk.green('✓'), 'Success');
console.log(chalk.red('✗'), 'Error');
console.log(chalk.yellow('⚠'), 'Warning');
console.log(chalk.cyan('→'), chalk.bold('my-app'));
console.log(chalk.dim('Hint: run npm start'));

// Compose colors
const error = chalk.bold.red;
const warning = chalk.hex('#FFA500');
const info = chalk.blue.underline;

console.log(error('Something went wrong'));
console.log(warning('Deprecated feature'));
console.log(info('https://example.com/docs'));
```

A tip: establish a consistent visual language. I use:
- Green (✓) for success
- Red (✗) for errors
- Yellow (⚠) for warnings
- Cyan (→) for actions
- Bold for emphasis
- Dim for secondary information

## Error Handling

CLIs should fail gracefully:

```typescript
import chalk from 'chalk';

function handleError(error: unknown): never {
  console.error();
  
  if (error instanceof Error) {
    console.error(chalk.red('Error:'), error.message);
    
    if (process.env.DEBUG) {
      console.error();
      console.error(chalk.dim(error.stack));
    }
  } else {
    console.error(chalk.red('An unknown error occurred'));
  }
  
  console.error();
  console.error(chalk.dim('If this looks like a bug, please report it:'));
  console.error(chalk.dim('https://github.com/yourusername/ace/issues'));
  console.error();
  
  process.exit(1);
}

// In your main entry point
async function main() {
  try {
    await program.parseAsync();
  } catch (error) {
    handleError(error);
  }
}

main();
```

The `DEBUG` environment variable is a nice touch—users can run `DEBUG=1 ace create my-app` to see stack traces.

## Testing CLIs

CLI testing is tricky because you're testing side effects—files created, commands run, output printed. I use a combination of unit tests and integration tests:

```typescript
// src/__tests__/create.test.ts
import { vol } from 'memfs';
import { create } from '../commands/create';

// Mock the file system
jest.mock('fs-extra', () => require('memfs').fs);

// Mock execa
jest.mock('execa', () => ({
  execa: jest.fn().mockResolvedValue({ stdout: '', stderr: '' }),
}));

describe('create command', () => {
  beforeEach(() => {
    vol.reset();
  });

  it('creates project directory', async () => {
    await create('my-app', {
      template: 'default',
      typescript: true,
      git: false,
      packageManager: 'npm',
    });

    expect(vol.existsSync('/my-app')).toBe(true);
    expect(vol.existsSync('/my-app/package.json')).toBe(true);
  });

  it('replaces placeholders in files', async () => {
    await create('my-app', {
      template: 'default',
      typescript: true,
      git: false,
      packageManager: 'npm',
    });

    const packageJson = JSON.parse(
      vol.readFileSync('/my-app/package.json', 'utf-8')
    );
    expect(packageJson.name).toBe('my-app');
  });
});
```

For integration tests, I actually run the CLI and check the results:

```typescript
// test/integration.test.ts
import { execa } from 'execa';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';

describe('ace CLI', () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'ace-test-'));
  });

  afterEach(async () => {
    await fs.remove(tempDir);
  });

  it('creates a working project', async () => {
    await execa('npx', ['ace', 'create', 'test-app', '--no-git'], {
      cwd: tempDir,
    });

    const projectDir = path.join(tempDir, 'test-app');
    
    // Check files exist
    expect(await fs.pathExists(path.join(projectDir, 'package.json'))).toBe(true);
    expect(await fs.pathExists(path.join(projectDir, 'src', 'App.tsx'))).toBe(true);
    
    // Check it builds
    await execa('npm', ['run', 'build'], { cwd: projectDir });
    expect(await fs.pathExists(path.join(projectDir, 'dist'))).toBe(true);
  }, 60000); // Long timeout for npm install
});
```

## Publishing to NPM

Once your CLI works locally, publishing is straightforward:

```bash
# Login to npm (first time only)
npm login

# Publish
npm publish

# Or if you're using a scoped package
npm publish --access public
```

A few tips:

1. **Use `np` for releases:** It handles version bumping, git tags, and publishing in one command.

2. **Test the installed version:** After publishing, test with `npx ace@latest create test-app` to make sure everything packaged correctly.

3. **Add a prepublish script:** Ensure the CLI builds before publishing.

```json
{
  "scripts": {
    "build": "tsc",
    "prepublishOnly": "npm run build"
  }
}
```

4. **Document your CLI:** A good README with usage examples is essential. Show what the CLI does, don't just describe it.

## What I Use Ace For

A year later, ace is the first thing I run when starting any React project. It creates:

- Vite with React and TypeScript
- My preferred folder structure (`src/components`, `src/hooks`, `src/utils`, `src/types`)
- ESLint with my configuration
- Prettier
- styled-components set up with a theme
- A few utility hooks I always use (`useLocalStorage`, `useDebounce`)
- Vitest for testing
- GitHub Actions workflow for CI

It saves me 30+ minutes every time. But more importantly, every project starts consistent. I know where things are, I know how things work.

---

*ace is available on npm. But honestly, you should build your own—the process of deciding what goes in your ideal project setup is more valuable than the tool itself.*
