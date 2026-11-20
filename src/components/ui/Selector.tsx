'use client';

interface SelectorProps {
  options: readonly string[];
  value: string;
  onChange: (value: string) => void;
  counts?: Record<string, number>;
  label: string;
}

/** A row of detented mode buttons. Active = ink fill + lit LED. */
export default function Selector({ options, value, onChange, counts, label }: SelectorProps) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className="flex gap-px overflow-x-auto scrollbar-hide border border-ink bg-ink w-fit max-w-full"
    >
      {options.map((option) => {
        const active = option === value;
        return (
          <button
            key={option}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(option)}
            data-hud={`Filter · ${option}${counts?.[option] !== undefined ? ` · ${counts[option]} entries` : ''}`}
            className={`t-label shrink-0 flex items-center gap-2 h-10 px-3 md:px-4 transition-[background-color,color,transform] duration-150 ease-[var(--ease-primary)] active:scale-[0.97] ${
              active ? 'bg-ink text-paper' : 'bg-paper text-ink hover:bg-paper-2'
            }`}
          >
            <span className="led" data-on={active ? 'true' : 'false'} />
            {option}
            {counts?.[option] !== undefined && (
              <span className={active ? 'opacity-60' : 'text-graphite'}>{counts[option]}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
