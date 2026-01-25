'use client';

import { TimelineEvent } from '@/types/about';

interface TimelineProps {
  events: TimelineEvent[];
  isHRMode?: boolean;
}

const typeColors = {
  education: 'from-blue-500 to-blue-600',
  career: 'from-emerald-500 to-emerald-600',
  achievement: 'from-pink-500 to-pink-600',
  milestone: 'from-orange-500 to-orange-600',
};

export default function Timeline({ events, isHRMode = false }: TimelineProps) {
  return (
    <section className="mb-16">
      <h2 className={`
        text-2xl font-bold mb-8 transition-all duration-500 ease-out
        ${isHRMode ? 'text-left text-lg uppercase tracking-wider text-emerald-400' : 'text-center'}
      `}>
        {isHRMode ? 'Professional Experience' : 'Journey'}
      </h2>
      <div className={`
        space-y-4 max-w-3xl transition-all duration-500 ease-out
        ${isHRMode ? 'mx-0 space-y-6' : 'mx-auto'}
      `}>
        {events.map((event, index) => (
          <div 
            key={index} 
            className={`
              relative transition-all duration-500 ease-out
              ${isHRMode 
                ? 'pl-0 border-l-0 bg-zinc-900/30 p-4 rounded-lg border border-zinc-800 hover:border-zinc-600' 
                : 'pl-8 border-l-2 border-neutral-800'
              }
            `}
            style={{ transitionDelay: `${index * 75}ms` }}
          >
            {/* Timeline dot - only in non-HR mode */}
            {!isHRMode && (
              <div className={`absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-gradient-to-br ${typeColors[event.type]} transition-all duration-500`} />
            )}

            <div className={isHRMode ? '' : 'pb-6'}>
              <div className={`
                flex items-baseline gap-3 mb-2 transition-all duration-500
                ${isHRMode ? 'flex-col gap-1' : ''}
              `}>
                <span className={`
                  text-sm font-semibold transition-all duration-500
                  ${isHRMode ? 'text-emerald-400 order-2 text-xs' : 'text-neutral-500'}
                `}>
                  {event.date}
                </span>
                <h3 className={`
                  font-semibold transition-all duration-500
                  ${isHRMode ? 'text-base text-white order-1' : 'text-lg'}
                `}>
                  {event.title}
                </h3>
              </div>
              <p className={`
                text-neutral-400 transition-all duration-500
                ${isHRMode ? 'text-sm leading-relaxed' : ''}
              `}>
                {event.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
