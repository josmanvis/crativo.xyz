'use client';

import { useEffect } from 'react';

interface ModeToggleProps {
  isHRMode: boolean;
  onToggle: () => void;
}

function speakRobot() {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance('H R Human Detected');
  const voices = window.speechSynthesis.getVoices();
  const robotVoice =
    voices.find(
      (v) =>
        v.name.toLowerCase().includes('robot') ||
        v.name.toLowerCase().includes('zarvox') ||
        v.name.toLowerCase().includes('trinoids') ||
        v.name.toLowerCase().includes('cellos') ||
        v.name.includes('Google UK English Male') ||
        v.name.includes('Daniel')
    ) || voices.find((v) => v.lang.startsWith('en'));
  if (robotVoice) utterance.voice = robotVoice;
  utterance.rate = 0.8;
  utterance.pitch = 0.3;
  window.speechSynthesis.speak(utterance);
}

/**
 * Two-position reader switch: HUMANS / HUMANS IN HR. A detented thumb slides
 * between equal segments. Switching to HR mode announces itself — only ever
 * on an explicit click.
 */
export default function ModeToggle({ isHRMode, onToggle }: ModeToggleProps) {
  useEffect(() => {
    window.speechSynthesis?.getVoices();
  }, []);

  const handleToggle = () => {
    const wasHR = isHRMode;
    onToggle();
    if (!wasHR) setTimeout(speakRobot, 100);
  };

  return (
    <div className="flex flex-col items-start gap-2">
      <span className="t-label text-graphite">Who&apos;s reading?</span>
      <button
        type="button"
        role="switch"
        aria-checked={isHRMode}
        aria-label="HR mode"
        onClick={handleToggle}
        data-hud={isHRMode ? 'Reader: HR · keywords ✓ buzzwords ✓ soul ✗' : 'Reader: human · talks like a person'}
        className="relative grid grid-cols-2 border border-ink t-label w-[280px] max-w-full h-11 active:scale-[0.98] transition-transform duration-100"
      >
        <span
          aria-hidden="true"
          className="absolute top-0 left-0 h-full w-1/2 bg-ink transition-transform duration-300 ease-[var(--ease-primary)]"
          style={{ transform: isHRMode ? 'translateX(100%)' : 'translateX(0)' }}
        />
        <span
          className={`relative z-10 flex items-center justify-center gap-2 transition-colors duration-150 ${
            isHRMode ? 'text-ink' : 'text-paper'
          }`}
        >
          <span className="led" data-on={!isHRMode ? 'true' : 'false'} /> Humans
        </span>
        <span
          className={`relative z-10 flex items-center justify-center gap-2 transition-colors duration-150 ${
            isHRMode ? 'text-paper' : 'text-ink'
          }`}
        >
          <span className="led" data-on={isHRMode ? 'true' : 'false'} /> Humans in HR
        </span>
      </button>
      <span className="text-sm text-graphite">
        {isHRMode
          ? 'Keywords ✓ Buzzwords ✓ ATS-optimised ✓ Soul-crushing ✓'
          : 'The version where I talk like a person, not a LinkedIn post.'}
      </span>
    </div>
  );
}
