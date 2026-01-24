interface ProjectGalleryProps {
  gallery: string[];
}

const gradientAngles = [
  "from-blue-600/30 to-purple-600/20",
  "from-emerald-600/30 to-cyan-600/20",
  "from-orange-600/30 to-pink-600/20",
  "from-violet-600/30 to-indigo-600/20",
];

export default function ProjectGallery({ gallery }: ProjectGalleryProps) {
  return (
    <div>
      <h2 className="text-2xl font-semibold text-white mb-4">Gallery</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {gallery.map((_, index) => (
          <div
            key={index}
            className={`aspect-video rounded-lg bg-gradient-to-br ${gradientAngles[index % gradientAngles.length]}`}
          />
        ))}
      </div>
    </div>
  );
}
