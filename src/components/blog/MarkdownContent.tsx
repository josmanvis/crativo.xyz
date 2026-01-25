'use client';

import { useMemo } from 'react';

interface MarkdownContentProps {
  content: string;
}

export default function MarkdownContent({ content }: MarkdownContentProps) {
  const htmlContent = useMemo(() => parseMarkdown(content), [content]);

  return (
    <article
      className="prose prose-invert prose-lg max-w-none
        prose-headings:text-white prose-headings:font-bold
        prose-h1:text-3xl prose-h1:mt-8 prose-h1:mb-4
        prose-h2:text-2xl prose-h2:mt-6 prose-h2:mb-3
        prose-h3:text-xl prose-h3:mt-4 prose-h3:mb-2
        prose-p:text-gray-300 prose-p:leading-relaxed prose-p:my-4
        prose-a:text-blue-400 prose-a:hover:text-blue-300
        prose-strong:text-white
        prose-li:text-gray-300"
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
}

function parseMarkdown(markdown: string): string {
  let html = markdown;

  // Code blocks with language detection
  html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (_, lang, code) => {
    const language = lang || 'text';
    const highlightedCode = highlightSyntax(code.trim(), language);
    return `<div class="bg-gray-900 rounded-lg overflow-hidden my-6 ring-1 ring-white/10">
      <div class="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-gray-800/50">
        <span class="text-gray-400 text-xs font-mono">${language}</span>
      </div>
      <pre class="p-4 overflow-x-auto"><code class="text-sm font-mono text-gray-200 leading-relaxed">${highlightedCode}</code></pre>
    </div>`;
  });

  // Inline code
  html = html.replace(
    /`([^`]+)`/g,
    '<code class="text-pink-400 bg-white/10 px-1.5 py-0.5 rounded text-sm">$1</code>'
  );

  // Headings
  html = html.replace(
    /^### (.*$)/gim,
    '<h3 class="text-xl font-bold text-white mt-6 mb-3">$1</h3>'
  );
  html = html.replace(
    /^## (.*$)/gim,
    '<h2 class="text-2xl font-bold text-white mt-8 mb-4">$1</h2>'
  );
  html = html.replace(
    /^# (.*$)/gim,
    '<h1 class="text-3xl font-bold text-white mt-8 mb-4">$1</h1>'
  );

  // Bold and italic
  html = html.replace(
    /\*\*([^*]+)\*\*/g,
    '<strong class="text-white font-semibold">$1</strong>'
  );
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');

  // Links
  html = html.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-400 hover:text-blue-300 underline">$1</a>'
  );

  // Unordered lists
  html = html.replace(
    /^- (.*)$/gim,
    '<li class="text-gray-300 ml-4">$1</li>'
  );
  html = html.replace(
    /(<li[^>]*>.*<\/li>\n?)+/g,
    '<ul class="list-disc list-inside my-4 space-y-1">$&</ul>'
  );

  // Numbered lists
  html = html.replace(
    /^\d+\. (.*)$/gim,
    '<li class="text-gray-300 ml-4">$1</li>'
  );

  // Paragraphs
  html = html
    .split('\n\n')
    .map((block) => {
      const trimmed = block.trim();
      if (
        trimmed &&
        !trimmed.startsWith('<') &&
        !trimmed.startsWith('#') &&
        !trimmed.startsWith('-') &&
        !trimmed.match(/^\d+\./)
      ) {
        return `<p class="text-gray-300 leading-relaxed my-4">${trimmed}</p>`;
      }
      return block;
    })
    .join('\n');

  return html;
}

function highlightSyntax(code: string, language: string): string {
  let highlighted = escapeHtml(code);

  const keywords: Record<string, string[]> = {
    typescript: [
      'import',
      'export',
      'from',
      'const',
      'let',
      'var',
      'function',
      'return',
      'if',
      'else',
      'interface',
      'type',
      'class',
      'extends',
      'implements',
      'async',
      'await',
      'new',
      'this',
      'true',
      'false',
      'null',
      'undefined',
    ],
    javascript: [
      'import',
      'export',
      'from',
      'const',
      'let',
      'var',
      'function',
      'return',
      'if',
      'else',
      'class',
      'extends',
      'async',
      'await',
      'new',
      'this',
      'true',
      'false',
      'null',
      'undefined',
    ],
    bash: [
      'npm',
      'npx',
      'yarn',
      'pnpm',
      'cd',
      'mkdir',
      'rm',
      'cp',
      'mv',
      'echo',
      'export',
      'sudo',
    ],
  };

  const langKeywords = keywords[language] || keywords.javascript || [];

  // Highlight strings
  highlighted = highlighted.replace(
    /(["'`])(?:(?!\1)[^\\]|\\.)*?\1/g,
    '<span class="text-green-400">$&</span>'
  );

  // Highlight comments
  highlighted = highlighted.replace(
    /(\/\/.*$)/gm,
    '<span class="text-gray-500">$1</span>'
  );
  highlighted = highlighted.replace(
    /(\/\*[\s\S]*?\*\/)/g,
    '<span class="text-gray-500">$1</span>'
  );

  // Highlight keywords
  langKeywords.forEach((keyword) => {
    const regex = new RegExp(`\\b(${keyword})\\b`, 'g');
    highlighted = highlighted.replace(
      regex,
      '<span class="text-purple-400">$1</span>'
    );
  });

  // Highlight types/classes (capitalized words)
  highlighted = highlighted.replace(
    /\b([A-Z][a-zA-Z0-9]*)\b/g,
    '<span class="text-yellow-400">$1</span>'
  );

  // Highlight numbers
  highlighted = highlighted.replace(
    /\b(\d+)\b/g,
    '<span class="text-orange-400">$1</span>'
  );

  return highlighted;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
