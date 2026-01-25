import { ProjectFeature } from '@/types/project';

interface FeatureHighlightsProps {
  features: ProjectFeature[];
}

export default function FeatureHighlights({ features }: FeatureHighlightsProps) {
  if (!features || features.length === 0) return null;

  return (
    <section className="py-12 border-t border-white/10">
      <h2 className="text-2xl font-semibold text-white mb-8">Key Features</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, index) => (
          <div 
            key={index}
            className="group relative p-6 rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 hover:border-white/20 transition-all duration-300"
          >
            {/* Icon */}
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500/20 to-orange-600/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <span className="text-2xl">{feature.icon}</span>
            </div>
            
            {/* Title */}
            <h3 className="text-lg font-semibold text-white mb-2">
              {feature.title}
            </h3>
            
            {/* Description */}
            <p className="text-gray-400 text-sm leading-relaxed">
              {feature.description}
            </p>
            
            {/* Subtle glow effect on hover */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-orange-500/0 to-orange-600/0 group-hover:from-orange-500/5 group-hover:to-orange-600/5 transition-all duration-300 -z-10" />
          </div>
        ))}
      </div>
    </section>
  );
}
