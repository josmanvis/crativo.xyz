import { TimelineEvent } from '@/types/about';
import SectionHeader from '@/components/ui/SectionHeader';

interface TimelineProps {
  events: TimelineEvent[];
  isHRMode?: boolean;
}

/** Service record: date · entry · class, one ruled row each. */
export default function Timeline({ events, isHRMode = false }: TimelineProps) {
  return (
    <section className="pt-28 md:pt-36">
      <SectionHeader
        number="03.2"
        label={isHRMode ? 'Professional experience' : 'Service record'}
        title={isHRMode ? 'Professional experience.' : 'The journey so far.'}
        meta={`${events.length} entries`}
        className="mb-6"
      />
      <ol>
        {events.map((event, i) => (
          <li
            key={`${event.date}-${i}`}
            className="relative grid grid-cols-1 md:grid-cols-[10rem_minmax(0,1fr)_8rem] gap-x-6 gap-y-2 py-6"
            data-hud={`${event.date} · ${event.title}`}
          >
            <span className="t-label text-graphite pt-1.5">{event.date}</span>
            <div>
              <h3 className="text-[clamp(1.2rem,1.8vw,1.5rem)] font-bold leading-snug tracking-[-0.015em] [font-stretch:108%]">
                {event.title}
              </h3>
              <p className="mt-2 text-graphite leading-relaxed max-w-[68ch]">{event.description}</p>
            </div>
            <span className="t-label md:text-right pt-1.5 flex md:justify-end items-start gap-2">
              <span className="led mt-[2px]" data-on={event.type === 'career' ? 'true' : 'false'} />
              {event.type}
            </span>
            <span aria-hidden="true" data-reveal="rule" className="absolute inset-x-0 bottom-0 h-px bg-rule-strong" />
          </li>
        ))}
      </ol>
    </section>
  );
}
