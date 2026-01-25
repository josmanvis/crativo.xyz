'use client';

interface ModeToggleProps {
  isHRMode: boolean;
  onToggle: () => void;
}

export default function ModeToggle({ isHRMode, onToggle }: ModeToggleProps) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
      <button
        onClick={onToggle}
        className="relative flex items-center gap-3 px-4 py-2 rounded-full bg-zinc-900/80 border border-zinc-800 hover:border-zinc-700 transition-colors"
      >
        <span className={`text-sm transition-colors duration-200 ${!isHRMode ? 'text-white' : 'text-zinc-500'}`}>
          🧑‍💻 Normal People
        </span>
        
        <div className="relative w-12 h-6 bg-zinc-800 rounded-full">
          <div
            className="absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-200"
            style={{ left: isHRMode ? '1.5rem' : '0.25rem' }}
          />
        </div>
        
        <span className={`text-sm transition-colors duration-200 ${isHRMode ? 'text-white' : 'text-zinc-500'}`}>
          👔 HR Mode
        </span>
      </button>
      
      <p className="text-xs text-zinc-600 max-w-[200px] text-center sm:text-left transition-opacity duration-200">
        {isHRMode 
          ? "Optimized for ATS systems and keyword matching" 
          : "How I'd actually talk to you at a coffee shop"}
      </p>
    </div>
  );
}
