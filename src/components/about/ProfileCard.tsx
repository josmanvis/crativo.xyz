import { Bio } from '@/types/about';

interface ProfileCardProps {
  bio: Bio;
}

export default function ProfileCard({ bio }: ProfileCardProps) {
  return (
    <div className="flex flex-col items-center text-center mb-16">
      {/* Profile Image Placeholder */}
      <div className="w-32 h-32 mb-6 rounded-full bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 p-1">
        <div className="w-full h-full rounded-full bg-neutral-900 flex items-center justify-center">
          <span className="text-4xl font-bold text-white">
            {bio.name.split(' ').map(word => word[0]).join('')}
          </span>
        </div>
      </div>

      {/* Name and Tagline */}
      <h1 className="text-4xl font-bold mb-3">{bio.name}</h1>
      <p className="text-xl text-neutral-400 max-w-2xl">{bio.tagline}</p>
    </div>
  );
}
