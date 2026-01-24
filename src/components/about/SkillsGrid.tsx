import { Skill } from '@/types/about';

interface SkillsGridProps {
  skills: Skill[];
}

export default function SkillsGrid({ skills }: SkillsGridProps) {
  // Group skills by category
  const groupedSkills = skills.reduce((acc, skill) => {
    if (!acc[skill.category]) {
      acc[skill.category] = [];
    }
    acc[skill.category].push(skill);
    return acc;
  }, {} as Record<string, Skill[]>);

  // Define category order
  const categoryOrder = ['Languages', 'Frontend', 'Backend', 'Tools', 'Creative'];
  const sortedCategories = categoryOrder.filter(cat => groupedSkills[cat]);

  return (
    <section className="mb-16">
      <h2 className="text-2xl font-bold mb-6">Skills & Expertise</h2>
      <div className="space-y-8">
        {sortedCategories.map((category) => (
          <div key={category}>
            <h3 className="text-lg font-semibold text-neutral-400 mb-3">{category}</h3>
            <div className="flex flex-wrap gap-2">
              {groupedSkills[category].map((skill) => (
                <span
                  key={skill.name}
                  className="px-4 py-2 bg-neutral-800 rounded-full text-sm text-neutral-200 border border-neutral-700 hover:border-neutral-500 transition-colors"
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
