"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import dynamic from "next/dynamic";
import { projects, categories } from "@/data/projects";
import ProjectGrid from "@/components/ProjectGrid";
import CategoryFilter from "@/components/CategoryFilter";
import { DotGrid } from "@/components/DotGrid";
import { useSplash } from "@/lib/SplashContext";

const RemotionIntro = dynamic(() => import("@/components/RemotionIntro"), {
  ssr: false,
});

export default function Home() {
  const { hasShownSplash, markSplashShown } = useSplash();
  const [showIntro, setShowIntro] = useState(!hasShownSplash);
  const [fadeOut, setFadeOut] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");

  // Lock scrolling when intro is visible
  useEffect(() => {
    if (showIntro) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [showIntro]);

  const handleAnimationEnd = useCallback(() => {
    setFadeOut(true);
    markSplashShown();
    setTimeout(() => {
      setShowIntro(false);
    }, 800);
  }, [markSplashShown]);

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
      <main className="min-h-screen bg-[#0a0a0a] text-white relative">
        {/* Dot grid background - matches intro animation */}
        {!showIntro && <DotGrid opacity={0.15} spacing={60} dotSize={1.5} />}
        
        {/* Header */}
        <div className="text-center py-16 px-6">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight bg-gradient-to-r from-white via-white to-gray-500 bg-clip-text text-transparent">
            Built different.
          </h1>
          <p className="text-gray-500 mt-4 text-lg max-w-md mx-auto">
            Apps, tools, and libraries that solve real problems.
          </p>
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
