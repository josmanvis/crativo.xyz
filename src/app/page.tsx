"use client";

import { useState, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import { projects, categories } from "@/data/projects";
import ProjectGrid from "@/components/ProjectGrid";
import CategoryFilter from "@/components/CategoryFilter";

const RemotionIntro = dynamic(() => import("@/components/RemotionIntro"), {
  ssr: false,
});

export default function Home() {
  const [showIntro, setShowIntro] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");

  const handleAnimationEnd = useCallback(() => {
    setFadeOut(true);
    setTimeout(() => {
      setShowIntro(false);
    }, 800);
  }, []);

  const filteredProjects = useMemo(
    () =>
      activeCategory === "All"
        ? projects
        : projects.filter((p) => p.category === activeCategory),
    [activeCategory]
  );

  return (
    <>
      {showIntro && (
        <div
          className={`transition-opacity duration-700 ease-out ${
            fadeOut ? "opacity-0" : "opacity-100"
          }`}
        >
          <RemotionIntro onEnded={handleAnimationEnd} />
        </div>
      )}
      <main className="min-h-screen bg-[#0a0a0a] text-white">
        {/* Header */}
        <div className="text-center py-16">
          <h1 className="text-4xl font-bold tracking-tight">crativo</h1>
          <p className="text-gray-400 mt-2">Creative Software Portfolio</p>
        </div>

        {/* Category Filter */}
        <CategoryFilter
          categories={categories}
          active={activeCategory}
          onSelect={setActiveCategory}
        />

        {/* Project Grid */}
        <div className="py-8">
          <ProjectGrid projects={filteredProjects} />
        </div>
      </main>
    </>
  );
}
