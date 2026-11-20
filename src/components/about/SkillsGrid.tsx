import { Skill } from '@/types/about';
import SectionHeader from '@/components/ui/SectionHeader';

interface SkillsGridProps {
  skills: Skill[];
  isHRMode?: boolean;
}

const LEVELS: Record<NonNullable<Skill['proficiency']>, number> = {
  beginner: 1,
  intermediate: 2,
  advanced: 3,
  expert: 4,
};

const categoryOrder = ['Languages', 'Frontend', 'Backend', 'Tools', 'Design'];

/** Capabilities as a datasheet table with 4-segment meters. */
export default function SkillsGrid({ skills, isHRMode = false }: SkillsGridProps) {
  const grouped = skills.reduce<Record<string, Skill[]>>((acc, skill) => {
    (acc[skill.category] ||= []).push(skill);
    return acc;
  }, {});
  const ordered = [
    ...categoryOrder.filter((c) => grouped[c]),
    ...Object.keys(grouped).filter((c) => !categoryOrder.includes(c)),
  ];

  return (
    <section className="pt-28 md:pt-36">
      <SectionHeader
        number="03.1"
        label={isHRMode ? 'Technical proficiencies' : 'Capabilities'}
        title={isHRMode ? 'Technical proficiencies.' : 'What I reach for.'}
        meta={`${skills.length} entries`}
        className="mb-10"
      />
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-6 gap-y-12">
        {ordered.map((category) => (
          <div key={category}>
            <h3 className="t-label text-graphite pb-3 border-b border-ink">{category}</h3>
            <ul>
              {grouped[category].map((skill) => {
                const level = LEVELS[skill.proficiency ?? 'advanced'];
                return (
                  <li
                    key={skill.name}
                    data-hud={`${skill.name} · ${skill.proficiency ?? 'advanced'} · ${level}/4`}
                    className="flex items-center justify-between gap-4 py-2.5 border-b border-rule-strong"
                  >
                    <span>{skill.name}</span>
                    <span
                      className="flex gap-[3px]"
                      data-reveal="meter"
                      role="img"
                      aria-label={`${skill.proficiency ?? 'advanced'}, ${level} of 4`}
                    >
                      {[1, 2, 3, 4].map((seg) => (
                        <span
                          key={seg}
                          data-on={seg <= level ? 'true' : 'false'}
                          className={`w-3 h-2.5 ${seg <= level ? 'bg-ink' : 'bg-rule-strong'}`}
                        />
                      ))}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
