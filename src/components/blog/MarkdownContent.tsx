'use client';

import { useMemo } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { extractHeadings, headingId, plainHeading } from '@/lib/blog-utils';

interface MarkdownContentProps {
  content: string;
}

export default function MarkdownContent({ content }: MarkdownContentProps) {
  const elements = useMemo(() => parseMarkdown(content), [content]);

  return <div className="article-body text-[18px] leading-[1.7]">{elements}</div>;
}

function parseMarkdown(markdown: string): React.ReactNode[] {
  const elements: React.ReactNode[] = [];
  const totalSections = extractHeadings(markdown).length;
  let section = 0;
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
        <div key={key++} className="my-10 bezel overflow-hidden">
          <div className="flex items-center justify-between px-3 h-8 border-b border-white/10">
            <span className="t-label text-screen-ink/70">{lang}</span>
          </div>
          <SyntaxHighlighter
            language={lang === 'tsx' ? 'typescript' : lang}
            style={oneDark}
            customStyle={{
              margin: 0,
              padding: '1rem',
              background: 'var(--screen)',
              fontSize: '0.875rem',
            }}
            codeTagProps={{
              style: {
                fontFamily: 'var(--font-mono)',
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
        <h3 key={key++} className="text-[1.3rem] font-bold tracking-[-0.015em] [font-stretch:108%] leading-snug mt-12 mb-4">
          {parseInline(line.slice(4))}
        </h3>
      );
      i++;
      continue;
    }
    if (line.startsWith('## ')) {
      section++;
      const text = line.slice(3);
      const n = String(section).padStart(2, '0');
      elements.push(
        <h2
          key={key++}
          id={headingId(text)}
          data-hud-section={`§ ${n}/${String(totalSections).padStart(2, '0')} — ${plainHeading(text)}`}
          className="mt-20 mb-6 pt-4 border-t border-ink scroll-mt-[calc(var(--nav-h)+24px)]"
        >
          <span className="t-label text-graphite block mb-4">§ {n}</span>
          <span className="block text-[clamp(1.6rem,2.6vw,2.25rem)] font-bold leading-[1.1] tracking-[-0.025em] [font-stretch:112%] pb-[0.1em]">
            {parseInline(text)}
          </span>
        </h2>
      );
      i++;
      continue;
    }
    // The page header already shows the title; drop a leading "# Title".
    if (line.startsWith('# ') && elements.length === 0) {
      i++;
      continue;
    }
    if (line.startsWith('# ')) {
      elements.push(
        <p key={key++} role="heading" aria-level={2} className="mt-16 mb-8 text-[clamp(1.75rem,3vw,2.5rem)] font-extrabold leading-[1.05] tracking-[-0.03em] [font-stretch:118%] pb-[0.12em]">
          {parseInline(line.slice(2))}
        </p>
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
        <ul key={key++} className="my-6 space-y-2">
          {listItems.map((item, idx) => (
            <li key={idx} className="flex gap-3">
              <span aria-hidden="true" className="mt-[0.8em] w-2.5 h-px bg-ink shrink-0" />
              <span>{parseInline(item)}</span>
            </li>
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
        <ol key={key++} className="list-decimal pl-7 my-6 space-y-2 marker:font-mono marker:text-[0.8em] marker:text-graphite">
          {listItems.map((item, idx) => (
            <li key={idx} className="pl-1">{parseInline(item)}</li>
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
          <div key={key++} className="my-10 overflow-x-auto border-t border-ink" data-lenis-prevent>
            <table className="min-w-full border-collapse text-[15px]">
              <thead>
                <tr className="border-b border-ink">
                  {header.map((cell, idx) => (
                    <th key={idx} className="px-3 py-2.5 text-left t-label text-graphite font-normal">
                      {parseInline(cell)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {body.map((row, rowIdx) => (
                  <tr key={rowIdx} className="border-b border-rule-strong">
                    {row.map((cell, cellIdx) => (
                      <td key={cellIdx} className="px-3 py-2.5 align-top">
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
        <figure key={key++} className="my-10">
          <img
            src={src}
            alt={altText}
            loading="lazy"
            decoding="async"
            className="w-full h-auto border border-rule-strong"
          />
          {caption && (
            <figcaption className="text-sm text-graphite mt-3 flex gap-3"><span className="t-label text-ink pt-[3px]">Fig.</span>
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
        <p key={key++} className="my-5">
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
        <code key={key++} className="bg-paper-2 border border-rule px-1.5 py-0.5 text-[0.85em] font-mono [overflow-wrap:anywhere]">
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
        <strong key={key++} className="font-semibold">
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
          className="link-ink"
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
