'use client';

import { useMemo } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface MarkdownContentProps {
  content: string;
}

export default function MarkdownContent({ content }: MarkdownContentProps) {
  const elements = useMemo(() => parseMarkdown(content), [content]);

  return (
    <article className="prose prose-invert prose-lg max-w-none">
      {elements}
    </article>
  );
}

function parseMarkdown(markdown: string): React.ReactNode[] {
  const elements: React.ReactNode[] = [];
  const lines = markdown.split('\n');
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Code blocks
    if (line.startsWith('```')) {
      const lang = line.slice(3).trim() || 'text';
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // skip closing ```

      elements.push(
        <div key={key++} className="my-6 rounded-lg overflow-hidden ring-1 ring-white/10">
          <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-gray-800/50">
            <span className="text-gray-400 text-xs font-mono">{lang}</span>
          </div>
          <SyntaxHighlighter
            language={lang === 'tsx' ? 'typescript' : lang}
            style={oneDark}
            customStyle={{
              margin: 0,
              padding: '1rem',
              background: '#1a1a1a',
              fontSize: '0.875rem',
            }}
            codeTagProps={{
              style: {
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
              }
            }}
          >
            {codeLines.join('\n')}
          </SyntaxHighlighter>
        </div>
      );
      continue;
    }

    // Headings
    if (line.startsWith('### ')) {
      elements.push(
        <h3 key={key++} className="group flex items-center gap-3 text-xl font-bold text-white mt-14 mb-6">
          <span className="w-1 h-5 rounded-full bg-gradient-to-b from-teal-400 to-emerald-500 opacity-60 group-hover:opacity-100 transition-opacity" />
          <span>{parseInline(line.slice(4))}</span>
        </h3>
      );
      i++;
      continue;
    }
    if (line.startsWith('## ')) {
      elements.push(
        <h2 key={key++} className="group relative mt-16 mb-8 pt-4">
          <div className="absolute -left-4 top-4 bottom-0 w-1 rounded-full bg-gradient-to-b from-emerald-400 via-teal-500 to-cyan-500 opacity-70 group-hover:opacity-100 transition-opacity" />
          <span className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-white via-white to-zinc-400 bg-clip-text text-transparent">
            {parseInline(line.slice(3))}
          </span>
        </h2>
      );
      i++;
      continue;
    }
    if (line.startsWith('# ')) {
      elements.push(
        <h1 key={key++} className="relative mt-16 mb-10">
          <span className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
            {parseInline(line.slice(2))}
          </span>
          <div className="mt-4 h-px w-24 bg-gradient-to-r from-emerald-500/50 to-transparent" />
        </h1>
      );
      i++;
      continue;
    }

    // Unordered lists
    if (line.startsWith('- ')) {
      const listItems: string[] = [];
      while (i < lines.length && lines[i].startsWith('- ')) {
        listItems.push(lines[i].slice(2));
        i++;
      }
      elements.push(
        <ul key={key++} className="list-disc list-inside my-4 space-y-1 text-gray-300">
          {listItems.map((item, idx) => (
            <li key={idx} className="ml-4">{parseInline(item)}</li>
          ))}
        </ul>
      );
      continue;
    }

    // Numbered lists
    if (/^\d+\. /.test(line)) {
      const listItems: string[] = [];
      while (i < lines.length && /^\d+\. /.test(lines[i])) {
        listItems.push(lines[i].replace(/^\d+\. /, ''));
        i++;
      }
      elements.push(
        <ol key={key++} className="list-decimal list-inside my-4 space-y-1 text-gray-300">
          {listItems.map((item, idx) => (
            <li key={idx} className="ml-4">{parseInline(item)}</li>
          ))}
        </ol>
      );
      continue;
    }

    // Tables
    if (line.includes('|') && line.trim().startsWith('|')) {
      const tableRows: string[][] = [];
      while (i < lines.length && lines[i].includes('|')) {
        const row = lines[i]
          .split('|')
          .map(cell => cell.trim())
          .filter(cell => cell && !cell.match(/^[-:]+$/));
        if (row.length > 0 && !lines[i].match(/^\|[-:\s|]+\|$/)) {
          tableRows.push(row);
        }
        i++;
      }
      if (tableRows.length > 0) {
        const [header, ...body] = tableRows;
        elements.push(
          <div key={key++} className="my-6 overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="border-b border-white/20">
                  {header.map((cell, idx) => (
                    <th key={idx} className="px-4 py-2 text-left text-white font-semibold">
                      {parseInline(cell)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {body.map((row, rowIdx) => (
                  <tr key={rowIdx} className="border-b border-white/10">
                    {row.map((cell, cellIdx) => (
                      <td key={cellIdx} className="px-4 py-2 text-gray-300">
                        {parseInline(cell)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }
      continue;
    }

    // Images: ![alt text](url)
    const imageMatch = line.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (imageMatch) {
      const altText = imageMatch[1] || 'Blog image';
      const src = imageMatch[2];

      // Check if next line is an image caption (starts with *)
      let caption = '';
      if (i + 1 < lines.length && lines[i + 1].startsWith('*') && lines[i + 1].endsWith('*')) {
        caption = lines[i + 1].slice(1, -1);
        i++; // Skip caption line
      }

      elements.push(
        <figure key={key++} className="my-8">
          <img
            src={src}
            alt={altText}
            loading="lazy"
            decoding="async"
            className="rounded-xl w-full h-auto border border-white/10"
          />
          {caption && (
            <figcaption className="text-center text-sm text-zinc-500 mt-3 italic">
              {caption}
            </figcaption>
          )}
        </figure>
      );
      i++;
      continue;
    }

    // Empty lines
    if (line.trim() === '') {
      i++;
      continue;
    }

    // Regular paragraphs
    const paragraphLines: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !lines[i].startsWith('#') &&
      !lines[i].startsWith('```') &&
      !lines[i].startsWith('- ') &&
      !/^\d+\. /.test(lines[i]) &&
      !(lines[i].includes('|') && lines[i].trim().startsWith('|'))
    ) {
      paragraphLines.push(lines[i]);
      i++;
    }
    if (paragraphLines.length > 0) {
      elements.push(
        <p key={key++} className="text-gray-300 leading-relaxed my-4">
          {parseInline(paragraphLines.join(' '))}
        </p>
      );
    }
  }

  return elements;
}

function parseInline(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    // Inline code
    const codeMatch = remaining.match(/^`([^`]+)`/);
    if (codeMatch) {
      parts.push(
        <code key={key++} className="text-pink-400 bg-white/10 px-1.5 py-0.5 rounded text-sm font-mono">
          {codeMatch[1]}
        </code>
      );
      remaining = remaining.slice(codeMatch[0].length);
      continue;
    }

    // Bold
    const boldMatch = remaining.match(/^\*\*([^*]+)\*\*/);
    if (boldMatch) {
      parts.push(
        <strong key={key++} className="text-white font-semibold">
          {boldMatch[1]}
        </strong>
      );
      remaining = remaining.slice(boldMatch[0].length);
      continue;
    }

    // Italic
    const italicMatch = remaining.match(/^\*([^*]+)\*/);
    if (italicMatch) {
      parts.push(<em key={key++}>{italicMatch[1]}</em>);
      remaining = remaining.slice(italicMatch[0].length);
      continue;
    }

    // Links
    const linkMatch = remaining.match(/^\[([^\]]+)\]\(([^)]+)\)/);
    if (linkMatch) {
      parts.push(
        <a
          key={key++}
          href={linkMatch[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 hover:text-blue-300 underline"
        >
          {linkMatch[1]}
        </a>
      );
      remaining = remaining.slice(linkMatch[0].length);
      continue;
    }

    // Regular text - find next special character
    const nextSpecial = remaining.search(/[`*\[]/);
    if (nextSpecial === -1) {
      parts.push(remaining);
      break;
    } else if (nextSpecial === 0) {
      // Special char didn't match a pattern, treat as text
      parts.push(remaining[0]);
      remaining = remaining.slice(1);
    } else {
      parts.push(remaining.slice(0, nextSpecial));
      remaining = remaining.slice(nextSpecial);
    }
  }

  return parts.length === 1 ? parts[0] : parts;
}
