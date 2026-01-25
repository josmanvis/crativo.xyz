'use client';

import { useState } from 'react';

interface ProjectDescriptionProps {
  description: string;
}

export default function ProjectDescription({ description }: ProjectDescriptionProps) {
  const [expanded, setExpanded] = useState(false);
  
  // Simple markdown-ish parsing for bold and sections
  const formatText = (text: string) => {
    // Split by double newlines for paragraphs
    const sections = text.split(/\n\n+/);
    
    return sections.map((section, sectionIndex) => {
      // Check if it's a header (starts with **)
      if (section.startsWith('**') && section.includes('**\n')) {
        const headerMatch = section.match(/^\*\*(.+?)\*\*\n?([\s\S]*)/);
        if (headerMatch) {
          const [, header, content] = headerMatch;
          return (
            <div key={sectionIndex} className="mb-6">
              <h3 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
                <span className="w-1 h-6 bg-gradient-to-b from-orange-500 to-orange-600 rounded-full" />
                {header}
              </h3>
              <div className="text-gray-300 leading-relaxed pl-3 border-l border-white/10">
                {formatParagraph(content)}
              </div>
            </div>
          );
        }
      }
      
      // Check if it's a list (contains - at line starts)
      if (section.includes('\n- ') || section.startsWith('- ')) {
        const items = section.split(/\n- /).filter(Boolean);
        return (
          <ul key={sectionIndex} className="mb-6 space-y-2">
            {items.map((item, itemIndex) => (
              <li key={itemIndex} className="flex items-start gap-3 text-gray-300">
                <span className="text-orange-500 mt-1">•</span>
                <span>{formatInline(item.replace(/^- /, ''))}</span>
              </li>
            ))}
          </ul>
        );
      }
      
      // Regular paragraph
      return (
        <p key={sectionIndex} className="text-gray-300 leading-relaxed mb-6">
          {formatParagraph(section)}
        </p>
      );
    });
  };
  
  const formatParagraph = (text: string) => {
    return text.split('\n').map((line, i) => (
      <span key={i}>
        {i > 0 && <br />}
        {formatInline(line)}
      </span>
    ));
  };
  
  const formatInline = (text: string) => {
    // Handle **bold** and *italic* and `code`
    const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g);
    
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} className="text-white font-semibold">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return <em key={index} className="text-gray-200">{part.slice(1, -1)}</em>;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return <code key={index} className="px-1.5 py-0.5 bg-white/10 rounded text-orange-400 text-sm font-mono">{part.slice(1, -1)}</code>;
      }
      return part;
    });
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
          className="mt-4 text-orange-500 hover:text-orange-400 transition-colors flex items-center gap-2"
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
