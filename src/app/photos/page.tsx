import Image from 'next/image';

export const metadata = {
  title: 'Photos | crativo.xyz',
  description: 'Photo gallery by Jose Viscasillas',
};

const photos = [
  { src: '/photos/cat1.jpg', alt: 'Cat photo 1', width: 800, height: 600 },
  { src: '/photos/cat2.jpg', alt: 'Cat photo 2', width: 801, height: 601 },
  { src: '/photos/cat3.jpg', alt: 'Cat photo 3', width: 802, height: 602 },
  { src: '/photos/cat4.jpg', alt: 'Cat photo 4', width: 803, height: 603 },
  { src: '/photos/cat5.jpg', alt: 'Cat photo 5', width: 804, height: 604 },
  { src: '/photos/cat6.jpg', alt: 'Cat photo 6', width: 805, height: 605 },
];

export default function PhotosPage() {
  return (
    <main className="min-h-screen bg-black text-white pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Photos
          </h1>
          <p className="text-neutral-400 text-lg max-w-2xl">
            A collection of photos. Mostly cats, because cats are awesome.
          </p>
        </div>

        {/* Photo Grid - Masonry-like layout */}
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
          {photos.map((photo, index) => (
            <div 
              key={index} 
              className="break-inside-avoid group relative overflow-hidden rounded-xl bg-neutral-900"
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                width={photo.width}
                height={photo.height}
                className="w-full h-auto transition-transform duration-500 group-hover:scale-105"
              />
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          ))}
        </div>

        {/* Footer note */}
        <div className="mt-16 text-center text-neutral-500 text-sm">
          <p>🐱 More photos coming soon...</p>
        </div>
      </div>
    </main>
  );
}
