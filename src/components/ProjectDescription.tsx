'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface ProjectDescriptionProps {
  description: string;
}

export default function ProjectDescription({ description }: ProjectDescriptionProps) {
  const [expanded, setExpanded] = useState(false);
  
  // Map common language aliases
  const getLanguage = (lang: string) => {
    const langMap: Record<string, string> = {
      'tsx': 'typescript',
      'jsx': 'javascript',
      'ts': 'typescript',
      'js': 'javascript',
      'sh': 'bash',
      'shell': 'bash',
    };
    return langMap[lang.toLowerCase()] || lang.toLowerCase();
  };

  // Parse markdown with code block support
  const formatText = (text: string): React.ReactNode[] => {
    const elements: React.ReactNode[] = [];
    const lines = text.split('\n');
    let i = 0;
    let key = 0;

    while (i < lines.length) {
      const line = lines[i];

      // Code blocks with ```
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
          <div key={key++} className="my-8 bezel overflow-hidden">
            <div className="flex items-center justify-between px-3 h-8 border-b border-white/10">
              <span className="t-label text-screen-ink/70">{lang}</span>
            </div>
            <SyntaxHighlighter
              language={getLanguage(lang)}
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

      // Headers with ** prefix (must be ONLY **text** on the line)
      if (line.startsWith('**')) {
        const headerMatch = line.match(/^\*\*(.+?)\*\*$/);
        if (headerMatch) {
          elements.push(
            <h3 key={key++} className="text-xl font-bold tracking-[-0.015em] [font-stretch:108%] mt-12 mb-4 pt-4 border-t border-rule-strong">
              {headerMatch[1]}
            </h3>
          );
          i++;
          continue;
        }
        // Line starts with ** but isn't a header - treat as paragraph (fall through)
      }

      // Unordered lists
      if (line.startsWith('- ')) {
        const listItems: string[] = [];
        while (i < lines.length && lines[i].startsWith('- ')) {
          listItems.push(lines[i].slice(2));
          i++;
        }
        elements.push(
          <ul key={key++} className="mb-6 space-y-2">
            {listItems.map((item, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <span aria-hidden="true" className="mt-[0.7em] w-2 h-px bg-ink shrink-0" />
                <span>{formatInline(item)}</span>
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
          <ol key={key++} className="mb-6 space-y-2 list-decimal pl-6 marker:font-mono marker:text-graphite">
            {listItems.map((item, idx) => (
              <li key={idx} className="pl-1">{formatInline(item)}</li>
            ))}
          </ol>
        );
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
        !lines[i].startsWith('```') &&
        !lines[i].startsWith('- ') &&
        !/^\*\*(.+?)\*\*$/.test(lines[i]) && // Only skip standalone headers, not inline bold
        !/^\d+\. /.test(lines[i])
      ) {
        paragraphLines.push(lines[i]);
        i++;
      }
      if (paragraphLines.length > 0) {
        elements.push(
          <p key={key++} className="leading-relaxed mb-5 text-[18px]">
            {formatInline(paragraphLines.join(' '))}
          </p>
        );
      }
    }

    return elements;
  };
  
  const formatInline = (text: string): React.ReactNode => {
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

      // Regular text
      const nextSpecial = remaining.search(/[`*\[]/);
      if (nextSpecial === -1) {
        parts.push(remaining);
        break;
      } else if (nextSpecial === 0) {
        parts.push(remaining[0]);
        remaining = remaining.slice(1);
      } else {
        parts.push(remaining.slice(0, nextSpecial));
        remaining = remaining.slice(nextSpecial);
      }
    }

    return parts.length === 1 ? parts[0] : parts;
  };
  
  // Check if description is long enough to warrant expansion
  const isLong = description.length > 1500;
  const displayText = isLong && !expanded 
    ? description.slice(0, 1500) + '...' 
    : description;

  return (
    <section>
      <div className="max-w-[68ch]">
        {formatText(displayText)}
      </div>
      
      {isLong && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="btn mt-4"
        >
          {expanded ? (
            <>
              Show less
              <ChevronUp size={16} strokeWidth={1.5} />
            </>
          ) : (
            <>
              Read more
              <ChevronDown size={16} strokeWidth={1.5} />
            </>
          )}
        </button>
      )}
    </section>
  );
}
