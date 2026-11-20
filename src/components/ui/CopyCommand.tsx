'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { hud } from '@/lib/hud';

/** `$ npm i -g projax` with a one-click copy. */
export default function CopyCommand({ command }: { command: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      hud.flash(`Copied · ${command}`);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      hud.flash('Clipboard unavailable · select and copy manually');
    }
  };

  return (
    <div className="flex items-stretch border border-ink bg-screen text-screen-ink font-mono text-[13px] min-w-0">
      <code className="flex-1 min-w-0 px-3 py-2.5 truncate select-all">
        <span className="opacity-50 mr-2">$</span>
        {command}
      </code>
      <button
        type="button"
        onClick={copy}
        aria-label={`Copy command: ${command}`}
        data-hud={`Copy · ${command}`}
        className="shrink-0 w-11 grid place-items-center border-l border-white/15 hover:bg-signal hover:text-[#111110] transition-colors duration-150"
      >
        {copied ? <Check size={16} strokeWidth={1.5} /> : <Copy size={16} strokeWidth={1.5} />}
      </button>
    </div>
  );
}
