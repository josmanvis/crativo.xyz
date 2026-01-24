import { ProjectCodeSnippet } from "@/types/project";

interface CodeSnippetProps {
  snippet: ProjectCodeSnippet;
}

export default function CodeSnippet({ snippet }: CodeSnippetProps) {
  return (
    <div className="bg-gray-900 rounded-lg overflow-hidden">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/10">
        <span className="text-gray-400 text-xs font-mono">
          {snippet.filename}
        </span>
        <span className="text-xs bg-white/10 text-gray-300 rounded px-2 py-0.5">
          {snippet.language}
        </span>
      </div>

      {/* Code block */}
      <pre className="p-4 overflow-x-auto">
        <code className="text-sm font-mono text-gray-200 leading-relaxed whitespace-pre">
          {snippet.code}
        </code>
      </pre>
    </div>
  );
}
