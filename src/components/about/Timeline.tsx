import { TimelineEvent } from '@/types/about';

interface TimelineProps {
  events: TimelineEvent[];
}

const typeColors = {
  education: 'from-blue-500 to-blue-600',
  career: 'from-purple-500 to-purple-600',
  achievement: 'from-pink-500 to-pink-600',
  milestone: 'from-orange-500 to-orange-600',
};

export default function Timeline({ events }: TimelineProps) {
  return (
    <section className="mb-16">
      <h2 className="text-2xl font-bold mb-6">Journey</h2>
      <div className="space-y-6 max-w-3xl">
        {events.map((event, index) => (
          <div key={index} className="relative pl-8 border-l-2 border-neutral-800">
            {/* Timeline dot */}
            <div className={`absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-gradient-to-br ${typeColors[event.type]}`} />

            <div className="pb-6">
              <div className="flex items-baseline gap-3 mb-2">
                <span className="text-sm font-semibold text-neutral-500">{event.date}</span>
                <h3 className="text-lg font-semibold">{event.title}</h3>
              </div>
              <p className="text-neutral-400">{event.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
