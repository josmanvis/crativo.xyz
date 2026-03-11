"use client";

import { useState } from "react";
import { projects, categories } from "@/data/projects";
import ProjectGrid from "@/components/ProjectGrid";
import CategoryFilter from "@/components/CategoryFilter";
import { DotGrid } from "@/components/DotGrid";

export default function ProjectsPage() {
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredProjects = activeCategory === "All"
    ? projects
    : projects.filter((p) => p.category === activeCategory);

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white relative">
      <DotGrid opacity={0.15} spacing={60} dotSize={1.5} />

      {/* Header */}
      <div className="text-center py-16 px-6">
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight bg-gradient-to-r from-white via-white to-gray-500 bg-clip-text text-transparent">
          Projects
        </h1>
        <p className="text-gray-500 mt-4 text-lg max-w-md mx-auto">
          Apps, tools, and libraries that solve real problems.
        </p>
      </div>

      {/* Category Filter */}
      <div className="max-w-4xl mx-auto px-6 mb-8">
        <CategoryFilter
          categories={categories}
          active={activeCategory}
          onSelect={setActiveCategory}
        />
      </div>

      {/* Project Grid */}
      <div className="py-8">
        <ProjectGrid projects={filteredProjects} />
      </div>
    </main>
  );
}