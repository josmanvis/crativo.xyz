'use client';

import { useEffect, useState } from 'react';

interface MobileCallSplashProps {
  onEnded: () => void;
}

export default function MobileCallSplash({ onEnded }: MobileCallSplashProps) {
  const [status, setStatus] = useState<'calling' | 'connecting' | 'connected' | 'fading'>('calling');
  const [dots, setDots] = useState('');

  // Animate the dots
  useEffect(() => {
    if (status === 'fading') return;
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 400);
    return () => clearInterval(interval);
  }, [status]);

  // Progress through call states
  useEffect(() => {
    const timer1 = setTimeout(() => setStatus('connecting'), 2000);
    const timer2 = setTimeout(() => setStatus('connected'), 3200);
    const timer3 = setTimeout(() => setStatus('fading'), 4000);
    const timer4 = setTimeout(() => onEnded(), 4500);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [onEnded]);

  return (
    <div
      className={`fixed inset-0 z-50 bg-gradient-to-b from-zinc-900 via-black to-black flex flex-col items-center justify-between py-16 px-6 transition-opacity duration-500 ${
        status === 'fading' ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* Top spacer */}
      <div className="h-8" />

      {/* Center content */}
      <div className="flex flex-col items-center">
        {/* Pulsing rings behind avatar */}
        <div className="relative">
          {/* Outer rings - only during calling */}
          {status === 'calling' && (
            <>
              <div
                className="absolute rounded-full border-2 border-emerald-500/30 animate-ping-slow"
                style={{ width: 120, height: 120, top: -12, left: -12 }}
              />
              <div
                className="absolute rounded-full border-2 border-emerald-500/20 animate-ping-slower"
                style={{ width: 120, height: 120, top: -12, left: -12 }}
              />
            </>
          )}
          
          {/* Avatar */}
          <div
            className={`w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-2xl shadow-emerald-500/20 transition-transform duration-300 ${
              status === 'connected' ? 'scale-105' : 'scale-100'
            }`}
          >
            <span className="text-3xl font-bold text-white">JV</span>
          </div>
        </div>

        {/* Name */}
        <h1 className="text-2xl font-semibold text-white mt-6 animate-fade-in">
          Jose Viscasillas
        </h1>

        {/* Status text */}
        <p className="text-zinc-400 mt-2 text-lg h-7 animate-fade-in-delayed">
          {status === 'calling' && (
            <span>calling{dots}</span>
          )}
          {status === 'connecting' && (
            <span className="text-emerald-400">
              connecting{dots}
            </span>
          )}
          {(status === 'connected' || status === 'fading') && (
            <span className="text-emerald-400 font-medium">
              connected ✓
            </span>
          )}
        </p>

        {/* Subtle label */}
        <p className="text-zinc-600 text-sm mt-1 animate-fade-in-delayed">
          crativo.xyz
        </p>
      </div>

      {/* Bottom buttons - iOS style */}
      <div className="flex flex-col items-center gap-4">
        {status !== 'connected' && status !== 'fading' ? (
          <div className="flex gap-16 animate-slide-up">
            {/* Mute button */}
            <div className="flex flex-col items-center gap-2">
              <div className="w-14 h-14 rounded-full bg-zinc-800/80 backdrop-blur flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                </svg>
              </div>
              <span className="text-xs text-zinc-500">mute</span>
            </div>

            {/* Keypad button */}
            <div className="flex flex-col items-center gap-2">
              <div className="w-14 h-14 rounded-full bg-zinc-800/80 backdrop-blur flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h2m4 0h2m4 0h2M4 12h2m4 0h2m4 0h2M4 18h2m4 0h2m4 0h2" />
                </svg>
              </div>
              <span className="text-xs text-zinc-500">keypad</span>
            </div>

            {/* Speaker button */}
            <div className="flex flex-col items-center gap-2">
              <div className="w-14 h-14 rounded-full bg-zinc-800/80 backdrop-blur flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728M12 18.75a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12 12.75a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12 6.75a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                </svg>
              </div>
              <span className="text-xs text-zinc-500">speaker</span>
            </div>
          </div>
        ) : (
          <div className="text-emerald-400 text-sm animate-fade-in">
            entering portfolio...
          </div>
        )}

        {/* End call button - visible during calling */}
        {status === 'calling' && (
          <button
            onClick={onEnded}
            className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center mt-4 animate-scale-in active:scale-95 transition-transform"
          >
            <svg className="w-8 h-8 text-white rotate-[135deg]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 00-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z"/>
            </svg>
          </button>
        )}
      </div>

      {/* iOS-style bottom bar indicator */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
        <div className="w-32 h-1 bg-white/20 rounded-full" />
      </div>
    </div>
  );
}
