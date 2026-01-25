'use client';

import { useEffect, useRef } from 'react';

interface ModeToggleProps {
  isHRMode: boolean;
  onToggle: () => void;
}

export default function ModeToggle({ isHRMode, onToggle }: ModeToggleProps) {
  const hasSpoken = useRef(false);

  const speakRobot = () => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(
      "DETECTING... POSSIBLE H R HUMAN... BEEP BEEP"
    );
    
    // Try to find a robotic-sounding voice
    const voices = window.speechSynthesis.getVoices();
    const robotVoice = voices.find(v => 
      v.name.toLowerCase().includes('robot') ||
      v.name.toLowerCase().includes('zarvox') ||
      v.name.toLowerCase().includes('trinoids') ||
      v.name.toLowerCase().includes('cellos') ||
      v.name.includes('Google UK English Male') ||
      v.name.includes('Daniel')
    ) || voices.find(v => v.lang.startsWith('en'));
    
    if (robotVoice) {
      utterance.voice = robotVoice;
    }
    
    utterance.rate = 0.8;
    utterance.pitch = 0.3;
    
    window.speechSynthesis.speak(utterance);
  };

  const handleToggle = () => {
    const wasHRMode = isHRMode;
    onToggle();
    
    // Speak when switching TO HR mode
    if (!wasHRMode) {
      // Small delay to let voices load if needed
      setTimeout(() => {
        speakRobot();
      }, 100);
    }
  };

  // Preload voices
  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.getVoices();
    }
  }, []);

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
          onClick={handleToggle}
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
