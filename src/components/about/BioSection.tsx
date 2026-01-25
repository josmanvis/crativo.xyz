interface BioSectionProps {
  description: string[];
}

export default function BioSection({ description }: BioSectionProps) {
  return (
    <section className="mb-16">
      <h2 className="text-2xl font-bold mb-6 text-center">About Me</h2>
      <div className="space-y-4 max-w-3xl mx-auto">
        {description.map((paragraph, index) => (
          <p key={index} className="text-neutral-300 leading-relaxed text-center">
            {paragraph}
          </p>
        ))}
      </div>
    </section>
  );
}
