'use client';

interface BioSectionProps {
  description: string[];
  isHRMode?: boolean;
}

export default function BioSection({ description, isHRMode = false }: BioSectionProps) {
  return (
    <section className="mb-16">
      <h2 className={`
        text-2xl font-bold mb-6 transition-all duration-500 ease-out
        ${isHRMode ? 'text-left text-lg uppercase tracking-wider text-emerald-400' : 'text-center'}
      `}>
        {isHRMode ? 'Professional Summary' : 'About Me'}
      </h2>
      <div className={`
        space-y-4 max-w-3xl transition-all duration-500 ease-out
        ${isHRMode ? 'mx-0' : 'mx-auto'}
      `}>
        {description.map((paragraph, index) => (
          <p 
            key={index} 
            className={`
              text-neutral-300 leading-relaxed transition-all duration-500 ease-out
              ${isHRMode 
                ? 'text-left text-sm border-l-2 border-zinc-700 pl-4 hover:border-emerald-500 hover:bg-zinc-900/50' 
                : 'text-center'
              }
            `}
            style={{ 
              transitionDelay: isHRMode ? `${index * 50}ms` : '0ms',
              animationDelay: `${index * 50}ms`
            }}
          >
            {paragraph}
          </p>
        ))}
      </div>
    </section>
  );
}
