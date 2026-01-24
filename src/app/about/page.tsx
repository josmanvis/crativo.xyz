import { aboutData } from '@/data/about';
import ProfileCard from '@/components/about/ProfileCard';
import BioSection from '@/components/about/BioSection';
import SkillsGrid from '@/components/about/SkillsGrid';
import Timeline from '@/components/about/Timeline';

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-black text-white py-16 px-6">
      <div className="max-w-5xl mx-auto">
        <ProfileCard bio={aboutData.bio} />
        <BioSection description={aboutData.bio.description} />
        <SkillsGrid skills={aboutData.skills} />
        <Timeline events={aboutData.timeline} />
      </div>
    </main>
  );
}
