'use client';

import { Bio } from '@/types/about';

interface ProfileCardProps {
  bio: Bio;
  isHRMode?: boolean;
}

export default function ProfileCard({ bio, isHRMode = false }: ProfileCardProps) {
  return (
    <div className={`
      transition-all duration-500 ease-out mb-16
      ${isHRMode 
        ? 'flex flex-row items-start text-left gap-6' 
        : 'flex flex-col items-center text-center'
      }
    `}>
      {/* Profile Image */}
      <div className={`
        rounded-full bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 p-1
        transition-all duration-500 ease-out shrink-0
        ${isHRMode ? 'w-20 h-20' : 'w-32 h-32 mb-8'}
      `}>
        <div className="w-full h-full rounded-full bg-neutral-900 flex items-center justify-center">
          <span className={`
            font-bold text-white transition-all duration-500
            ${isHRMode ? 'text-xl' : 'text-4xl'}
          `}>
            {bio.name.split(' ').map(word => word[0]).join('')}
          </span>
        </div>
      </div>

      <div className={`transition-all duration-500 ${isHRMode ? 'flex-1' : ''}`}>
        {/* Name */}
        <h1 className={`
          font-bold transition-all duration-500 ease-out
          ${isHRMode 
            ? 'text-2xl md:text-3xl mb-2' 
            : 'text-4xl md:text-5xl mb-8'
          }
        `}>
          {bio.name}
        </h1>
        
        {/* Tagline */}
        <p className={`
          text-zinc-400 leading-relaxed transition-all duration-500 ease-out
          ${isHRMode 
            ? 'text-base md:text-lg max-w-none not-italic border-l-4 border-emerald-500 pl-4' 
            : 'text-xl md:text-2xl max-w-3xl italic'
          }
        `}>
          {bio.tagline}
        </p>

        {/* HR Mode contact line */}
        {isHRMode && (
          <div className="flex gap-4 mt-3 text-sm text-zinc-500 animate-fade-in">
            <span>📍 Charlotte, NC</span>
            <span>•</span>
            <span>crativo.xyz</span>
          </div>
        )}
      </div>
    </div>
  );
}
