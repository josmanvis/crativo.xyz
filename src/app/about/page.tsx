'use client';

import { useState } from 'react';
import { aboutDataHuman, aboutDataHR } from '@/data/about';
import ProfileCard from '@/components/about/ProfileCard';
import BioSection from '@/components/about/BioSection';
import SkillsGrid from '@/components/about/SkillsGrid';
import Timeline from '@/components/about/Timeline';
import ModeToggle from '@/components/about/ModeToggle';
import { DotGrid } from '@/components/DotGrid';

export default function AboutPage() {
  const [isHRMode, setIsHRMode] = useState(false);
  const aboutData = isHRMode ? aboutDataHR : aboutDataHuman;

  return (
    <main className="min-h-screen bg-black text-white py-16 px-6 relative">
      <DotGrid opacity={0.15} spacing={60} dotSize={1.5} />
      <div className="max-w-5xl mx-auto relative z-10">
        <ModeToggle isHRMode={isHRMode} onToggle={() => setIsHRMode(!isHRMode)} />
        
        <div 
          key={isHRMode ? 'hr' : 'human'}
          className="transition-opacity duration-300"
        >
          <ProfileCard bio={aboutData.bio} />
          <BioSection description={aboutData.bio.description} />
          <SkillsGrid skills={aboutData.skills} />
          <Timeline events={aboutData.timeline} />
        </div>
      </div>
    </main>
  );
}
