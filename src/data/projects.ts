import { Project } from "@/types/project";

export const categories = [
  "All",
  "Apps",
  "Libraries",
  "Experiments",
  "Tools",
  "Games",
] as const;

export const projects: Project[] = [
  // Apps (3)
  {
    id: "pulse",
    title: "Pulse",
    description:
      "Real-time health monitoring dashboard with WebSocket streaming and predictive alerts.",
    category: "Apps",
    techStack: ["React", "Node.js", "WebSocket", "D3.js"],
    imageUrl: "/projects/pulse.jpg",
    href: "/projects/pulse",
    year: 2025,
    metrics: [
      { label: "Users", value: "10K+" },
      { label: "Uptime", value: "99.9%" },
    ],
  },
  {
    id: "orbiter",
    title: "Orbiter",
    description:
      "Collaborative whiteboard app with infinite canvas, real-time cursors, and version history.",
    category: "Apps",
    techStack: ["Next.js", "Supabase", "Canvas API"],
    imageUrl: "/projects/orbiter.jpg",
    href: "/projects/orbiter",
    year: 2025,
    metrics: [
      { label: "Teams", value: "500+" },
      { label: "Boards", value: "12K" },
    ],
  },
  {
    id: "flowstate",
    title: "FlowState",
    description:
      "Focus-oriented task manager with ambient soundscapes and pomodoro integration.",
    category: "Apps",
    techStack: ["Swift", "SwiftUI", "CloudKit"],
    imageUrl: "/projects/flowstate.jpg",
    href: "/projects/flowstate",
    year: 2024,
    metrics: [
      { label: "Downloads", value: "25K" },
      { label: "Rating", value: "4.8" },
    ],
  },

  // Libraries (3)
  {
    id: "nexframe",
    title: "NexFrame",
    description:
      "Lightweight animation framework for React with spring physics and gesture support.",
    category: "Libraries",
    techStack: ["TypeScript", "React", "WASM"],
    imageUrl: "/projects/nexframe.jpg",
    href: "/projects/nexframe",
    year: 2025,
    metrics: [
      { label: "npm/week", value: "45K" },
      { label: "Stars", value: "2.1K" },
    ],
  },
  {
    id: "chromakit",
    title: "ChromaKit",
    description:
      "Color manipulation library with perceptually uniform color spaces and accessibility checks.",
    category: "Libraries",
    techStack: ["TypeScript", "Rollup", "Vitest"],
    imageUrl: "/projects/chromakit.jpg",
    href: "/projects/chromakit",
    year: 2024,
    metrics: [
      { label: "npm/week", value: "18K" },
      { label: "Bundle", value: "3.2KB" },
    ],
  },
  {
    id: "formcraft",
    title: "FormCraft",
    description:
      "Schema-driven form builder with validation, conditional logic, and multi-step flows.",
    category: "Libraries",
    techStack: ["TypeScript", "Zod", "React Hook Form"],
    imageUrl: "/projects/formcraft.jpg",
    href: "/projects/formcraft",
    year: 2024,
    metrics: [
      { label: "npm/week", value: "8K" },
      { label: "Forms built", value: "50K+" },
    ],
  },

  // Experiments (3)
  {
    id: "synthwave",
    title: "SynthWave",
    description:
      "Audio-reactive 3D visualizer using Web Audio API and procedural geometry generation.",
    category: "Experiments",
    techStack: ["Three.js", "Web Audio", "GLSL"],
    imageUrl: "/projects/synthwave.jpg",
    href: "/projects/synthwave",
    year: 2025,
    metrics: [
      { label: "FPS", value: "60" },
      { label: "Visitors", value: "80K" },
    ],
  },
  {
    id: "neural-canvas",
    title: "Neural Canvas",
    description:
      "Interactive neural network visualization exploring backpropagation in real-time.",
    category: "Experiments",
    techStack: ["WebGL", "TensorFlow.js", "TypeScript"],
    imageUrl: "/projects/neural-canvas.jpg",
    href: "/projects/neural-canvas",
    year: 2024,
    metrics: [
      { label: "Interactions", value: "200K" },
      { label: "Featured", value: "HN #3" },
    ],
  },
  {
    id: "particle-life",
    title: "Particle Life",
    description:
      "Emergent behavior simulation with configurable attraction rules and thousands of particles.",
    category: "Experiments",
    techStack: ["Rust", "WebAssembly", "Canvas 2D"],
    imageUrl: "/projects/particle-life.jpg",
    href: "/projects/particle-life",
    year: 2024,
    metrics: [
      { label: "Particles", value: "10K+" },
      { label: "Configs", value: "200+" },
    ],
  },

  // Tools (3)
  {
    id: "snapdiff",
    title: "SnapDiff",
    description:
      "Visual regression testing CLI that catches UI changes with pixel-perfect comparisons.",
    category: "Tools",
    techStack: ["Node.js", "Puppeteer", "Sharp"],
    imageUrl: "/projects/snapdiff.jpg",
    href: "/projects/snapdiff",
    year: 2025,
    metrics: [
      { label: "CI runs", value: "1M+" },
      { label: "Stars", value: "890" },
    ],
  },
  {
    id: "portmap",
    title: "Portmap",
    description:
      "Developer tool for managing local service ports with conflict detection and auto-routing.",
    category: "Tools",
    techStack: ["Go", "gRPC", "TUI"],
    imageUrl: "/projects/portmap.jpg",
    href: "/projects/portmap",
    year: 2024,
    metrics: [
      { label: "Installs", value: "5K" },
      { label: "Services", value: "50+" },
    ],
  },
  {
    id: "migratron",
    title: "Migratron",
    description:
      "Database migration tool with automatic rollback plans and zero-downtime schema changes.",
    category: "Tools",
    techStack: ["Rust", "PostgreSQL", "SQLite"],
    imageUrl: "/projects/migratron.jpg",
    href: "/projects/migratron",
    year: 2024,
    metrics: [
      { label: "Migrations", value: "100K+" },
      { label: "Rollbacks", value: "0 lost" },
    ],
  },

  // Games (3)
  {
    id: "voxel-quest",
    title: "Voxel Quest",
    description:
      "Procedurally generated voxel adventure with crafting, exploration, and multiplayer dungeons.",
    category: "Games",
    techStack: ["Unity", "C#", "Netcode"],
    imageUrl: "/projects/voxel-quest.jpg",
    href: "/projects/voxel-quest",
    year: 2025,
    metrics: [
      { label: "Players", value: "15K" },
      { label: "Worlds", value: "Infinite" },
    ],
  },
  {
    id: "echo-drift",
    title: "Echo Drift",
    description:
      "Rhythm-based platformer where the level reshapes to the beat of procedural music.",
    category: "Games",
    techStack: ["Godot", "GDScript", "FMOD"],
    imageUrl: "/projects/echo-drift.jpg",
    href: "/projects/echo-drift",
    year: 2024,
    metrics: [
      { label: "Levels", value: "40+" },
      { label: "Rating", value: "92%" },
    ],
  },
  {
    id: "hex-siege",
    title: "Hex Siege",
    description:
      "Turn-based strategy game on hexagonal grids with AI opponents and online matchmaking.",
    category: "Games",
    techStack: ["TypeScript", "Pixi.js", "Firebase"],
    imageUrl: "/projects/hex-siege.jpg",
    href: "/projects/hex-siege",
    year: 2024,
    metrics: [
      { label: "Matches", value: "50K+" },
      { label: "Elo range", value: "800-2400" },
    ],
  },
];
