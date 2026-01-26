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
    <div className="rounded-lg overflow-hidden ring-1 ring-white/10">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-gray-800/50">
        <span className="text-gray-400 text-xs font-mono">
          {snippet.filename}
        </span>
        <span className="text-xs bg-white/10 text-gray-300 rounded px-2 py-0.5">
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
          background: '#1a1a1a',
          fontSize: '0.875rem',
        }}
        codeTagProps={{
          style: {
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
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
