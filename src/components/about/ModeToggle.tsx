'use client';

interface ModeToggleProps {
  isHRMode: boolean;
  onToggle: () => void;
}

export default function ModeToggle({ isHRMode, onToggle }: ModeToggleProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-6 mb-16">
      {/* Label */}
      <div className="text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-zinc-500 mb-2">
          Who's reading this?
        </p>
      </div>

      {/* Toggle Container */}
      <div className="relative">
        {/* Glow effect */}
        <div 
          className={`absolute -inset-2 rounded-full blur-xl transition-all duration-500 opacity-40 ${
            isHRMode 
              ? 'bg-gradient-to-r from-amber-500/50 to-orange-500/50' 
              : 'bg-gradient-to-r from-emerald-500/50 to-teal-500/50'
          }`} 
        />
        
        {/* Main toggle button */}
        <button
          onClick={onToggle}
          className="relative flex items-center gap-1 p-1.5 rounded-full bg-zinc-900 border border-zinc-700 backdrop-blur-sm hover:border-zinc-600 transition-all duration-300 shadow-2xl"
        >
          {/* Left option - Humans */}
          <div
            className={`relative z-10 px-5 py-3 rounded-full transition-all duration-300 ${
              !isHRMode 
                ? 'bg-zinc-700 text-white' 
                : 'bg-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <span className="text-sm font-medium whitespace-nowrap">
              👋 Humans
            </span>
          </div>
          
          {/* Right option - HR Humans */}
          <div
            className={`relative z-10 px-5 py-3 rounded-full transition-all duration-300 ${
              isHRMode 
                ? 'bg-zinc-700 text-white' 
                : 'bg-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <span className="text-sm font-medium whitespace-nowrap">
              📋 Humans in HR
            </span>
          </div>
        </button>
      </div>
      
      {/* Description */}
      <p className="text-sm text-zinc-500 max-w-sm text-center transition-all duration-300">
        {isHRMode 
          ? "Keywords ✓ Buzzwords ✓ ATS-optimized ✓ Soul-crushing ✓" 
          : "The version where I talk like a person, not a LinkedIn post"}
      </p>
    </div>
  );
}
