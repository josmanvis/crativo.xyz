'use client';

import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { ProjectCodeSnippet } from "@/types/project";

interface CodeSnippetProps {
  snippet: ProjectCodeSnippet;
}

export default function CodeSnippet({ snippet }: CodeSnippetProps) {
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

  return (
    <div className="bezel overflow-hidden">
      {/* Header bar */}
      <div className="flex items-center justify-between px-3 h-8 border-b border-white/10 t-label text-screen-ink/70">
        <span className="flex items-center gap-2"><span className="led" data-on="true" />
          {snippet.filename}
        </span>
        <span>
          {snippet.language}
        </span>
      </div>

      {/* Syntax highlighted code block */}
      <SyntaxHighlighter
        language={getLanguage(snippet.language)}
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
        showLineNumbers={snippet.code.split('\n').length > 5}
        wrapLines={true}
      >
        {snippet.code}
      </SyntaxHighlighter>
    </div>
  );
}
