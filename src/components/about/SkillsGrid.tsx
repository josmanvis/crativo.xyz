'use client';

import { Skill } from '@/types/about';

interface SkillsGridProps {
  skills: Skill[];
  isHRMode?: boolean;
}

export default function SkillsGrid({ skills, isHRMode = false }: SkillsGridProps) {
  // Group skills by category
  const groupedSkills = skills.reduce((acc, skill) => {
    if (!acc[skill.category]) {
      acc[skill.category] = [];
    }
    acc[skill.category].push(skill);
    return acc;
  }, {} as Record<string, Skill[]>);

  // Define category order
  const categoryOrder = ['Languages', 'Frontend', 'Backend', 'Tools', 'Design'];
  const sortedCategories = categoryOrder.filter(cat => groupedSkills[cat]);

  return (
    <section className="mb-16">
      <h2 className={`
        text-2xl font-bold mb-8 transition-all duration-500 ease-out
        ${isHRMode ? 'text-left text-lg uppercase tracking-wider text-emerald-400' : 'text-center'}
      `}>
        {isHRMode ? 'Technical Proficiencies' : 'Skills & Expertise'}
      </h2>
      <div className={`
        space-y-6 max-w-3xl transition-all duration-500 ease-out
        ${isHRMode ? 'mx-0' : 'mx-auto'}
      `}>
        {sortedCategories.map((category, catIndex) => (
          <div 
            key={category} 
            className={`
              transition-all duration-500 ease-out
              ${isHRMode ? 'text-left' : 'text-center'}
            `}
            style={{ transitionDelay: `${catIndex * 75}ms` }}
          >
            <h3 className={`
              text-lg font-semibold mb-3 transition-all duration-500
              ${isHRMode ? 'text-sm text-zinc-300 uppercase tracking-wide' : 'text-neutral-400'}
            `}>
              {category}
            </h3>
            <div className={`
              flex flex-wrap gap-2 transition-all duration-500
              ${isHRMode ? 'justify-start' : 'justify-center'}
            `}>
              {groupedSkills[category].map((skill, skillIndex) => (
                <span
                  key={skill.name}
                  className={`
                    px-3 py-1.5 rounded-full text-sm transition-all duration-300
                    ${isHRMode 
                      ? 'bg-zinc-900 text-zinc-300 border border-zinc-700 hover:border-emerald-500' 
                      : 'px-4 py-2 bg-neutral-800 text-neutral-200 border border-neutral-700 hover:border-neutral-500'
                    }
                  `}
                  style={{ transitionDelay: `${(catIndex * 75) + (skillIndex * 25)}ms` }}
                >
                  {skill.name}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
