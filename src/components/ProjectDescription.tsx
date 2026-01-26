'use client';

import { useState } from 'react';
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
          <div key={key++} className="my-6 rounded-lg overflow-hidden ring-1 ring-white/10">
            <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-gray-800/50">
              <span className="text-gray-400 text-xs font-mono">{lang}</span>
            </div>
            <SyntaxHighlighter
              language={getLanguage(lang)}
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

      // Headers with ** prefix (must be ONLY **text** on the line)
      if (line.startsWith('**')) {
        const headerMatch = line.match(/^\*\*(.+?)\*\*$/);
        if (headerMatch) {
          elements.push(
            <h3 key={key++} className="text-xl font-semibold text-white mt-8 mb-4 flex items-center gap-2">
              <span className="w-1 h-6 bg-gradient-to-b from-emerald-500 to-teal-600 rounded-full" />
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
              <li key={idx} className="flex items-start gap-3 text-gray-300">
                <span className="text-emerald-500 mt-1">•</span>
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
          <ol key={key++} className="mb-6 space-y-2 list-decimal list-inside">
            {listItems.map((item, idx) => (
              <li key={idx} className="text-gray-300 ml-4">{formatInline(item)}</li>
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
          <p key={key++} className="text-gray-300 leading-relaxed mb-4">
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
        parts.push(<em key={key++} className="text-gray-200">{italicMatch[1]}</em>);
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
            className="text-emerald-400 hover:text-emerald-300 underline"
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
    <section className="py-12">
      <div className="prose prose-invert max-w-none">
        {formatText(displayText)}
      </div>
      
      {isLong && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-4 text-emerald-500 hover:text-emerald-400 transition-colors flex items-center gap-2"
        >
          {expanded ? (
            <>
              Show less
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            </>
          ) : (
            <>
              Read more
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </>
          )}
        </button>
      )}
    </section>
  );
}
