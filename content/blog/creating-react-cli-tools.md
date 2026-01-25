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
---

# Creating CLI Tools for React Development

Every developer has their preferred project setup. I got tired of manually configuring new React projects, so I built **ace**—a CLI tool that scaffolds React apps the way I like them.

## Why Build a CLI?

- **Consistency** - Same setup across all projects
- **Speed** - New project in seconds, not minutes
- **Learning** - Great way to understand Node.js tooling

## Getting Started

```bash
npx ace create my-app
cd my-app
npm start
```

## How It Works

The CLI uses a few key packages:

```typescript
import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';

const program = new Command();

program
  .command('create <name>')
  .description('Create a new React application')
  .action(async (name) => {
    const spinner = ora('Creating project...').start();

    await copyTemplate(name);
    await installDependencies(name);

    spinner.succeed(chalk.green('Project created!'));
  });
```

## Project Structure

Ace creates projects with:
- TypeScript configuration
- ESLint + Prettier
- Jest for testing
- Styled Components
- Folder structure I prefer

## Publishing to NPM

Publishing was straightforward:

```bash
npm login
npm publish
```

The package is available at [npmjs.com/package/ace](https://www.npmjs.com/package/ace).
