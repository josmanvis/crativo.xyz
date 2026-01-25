import { Metadata } from 'next';
import { DotGrid } from '@/components/DotGrid';

export const metadata: Metadata = {
  title: 'Videos | crativo',
  description: 'Video tutorials, walkthroughs, and dev content.',
};

export default function VideosPage() {
  return (
    <main className="min-h-screen bg-black text-white py-24 px-6 relative">
      <DotGrid opacity={0.15} spacing={60} dotSize={1.5} />
      
      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Videos</h1>
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
            Tutorials, deep dives, and dev content. Coming soon.
          </p>
        </div>

        {/* Coming Soon State */}
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-24 h-24 mb-8 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
            <span className="text-5xl">🎬</span>
          </div>
          
          <h2 className="text-2xl font-semibold mb-4">Filming in Progress</h2>
          <p className="text-zinc-500 text-center max-w-md mb-8">
            Video content is on the way. Expect tutorials, project walkthroughs, 
            and the occasional rant about CSS.
          </p>
          
          {/* Placeholder video grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mt-8 opacity-30">
            {[1, 2, 3, 4].map((i) => (
              <div 
                key={i}
                className="aspect-video bg-zinc-900 rounded-xl border border-zinc-800 flex items-center justify-center"
              >
                <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center">
                  <svg className="w-6 h-6 text-zinc-600 ml-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
