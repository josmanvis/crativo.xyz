interface CategoryFilterProps {
  categories: readonly string[];
  active: string;
  onSelect: (category: string) => void;
}

export default function CategoryFilter({
  categories,
  active,
  onSelect,
}: CategoryFilterProps) {
  return (
    <div className="max-w-6xl mx-auto px-6">
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => onSelect(category)}
            className={`rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors duration-150 ${
              active === category
                ? "bg-white text-black"
                : "bg-white/10 text-white hover:bg-white/20"
            }`}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  );
}
