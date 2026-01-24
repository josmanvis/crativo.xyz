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
    longDescription:
      "Pulse is a real-time health monitoring platform that streams biometric data via WebSocket connections and renders interactive D3.js visualizations. The predictive alerting system uses rolling window analysis to detect anomalies before they become critical, reducing incident response times by 40%.",
    links: [
      { label: "GitHub", url: "#", icon: "github" },
      { label: "Live Demo", url: "#", icon: "external" },
      { label: "Docs", url: "#", icon: "book" },
    ],
    gallery: [
      "/projects/pulse/gallery-1.jpg",
      "/projects/pulse/gallery-2.jpg",
      "/projects/pulse/gallery-3.jpg",
      "/projects/pulse/gallery-4.jpg",
    ],
    codeSnippet: {
      language: "typescript",
      filename: "useHealthStream.ts",
      code: `import { useEffect, useState } from 'react';

export function useHealthStream(patientId: string) {
  const [vitals, setVitals] = useState<Vitals | null>(null);
  useEffect(() => {
    const ws = new WebSocket(\`wss://api.pulse/stream/\${patientId}\`);
    ws.onmessage = (e) => setVitals(JSON.parse(e.data));
    return () => ws.close();
  }, [patientId]);
  return vitals;
}`,
    },
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
    longDescription:
      "Orbiter reimagines collaborative design with an infinite canvas that supports real-time multi-user editing. Built on Supabase Realtime for presence awareness and conflict-free replicated data types (CRDTs) for seamless concurrent editing without merge conflicts.",
    links: [
      { label: "GitHub", url: "#", icon: "github" },
      { label: "Live Demo", url: "#", icon: "external" },
    ],
    gallery: [
      "/projects/orbiter/gallery-1.jpg",
      "/projects/orbiter/gallery-2.jpg",
      "/projects/orbiter/gallery-3.jpg",
    ],
    codeSnippet: {
      language: "typescript",
      filename: "Canvas.tsx",
      code: `export function Canvas({ boardId }: { boardId: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { cursors, broadcast } = usePresence(boardId);

  const handlePointerMove = (e: PointerEvent) => {
    const ctx = canvasRef.current?.getContext('2d');
    ctx?.lineTo(e.offsetX, e.offsetY);
    ctx?.stroke();
    broadcast({ x: e.offsetX, y: e.offsetY });
  };

  return <canvas ref={canvasRef} onPointerMove={handlePointerMove} />;
}`,
    },
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
    longDescription:
      "FlowState combines task management with ambient audio environments to help users achieve deep focus. The app uses adaptive pomodoro timers that adjust session lengths based on task complexity and user productivity patterns tracked via CloudKit sync.",
    links: [
      { label: "App Store", url: "#", icon: "apple" },
      { label: "GitHub", url: "#", icon: "github" },
      { label: "Docs", url: "#", icon: "book" },
    ],
    gallery: [
      "/projects/flowstate/gallery-1.jpg",
      "/projects/flowstate/gallery-2.jpg",
      "/projects/flowstate/gallery-3.jpg",
      "/projects/flowstate/gallery-4.jpg",
    ],
    codeSnippet: {
      language: "swift",
      filename: "FocusTimer.swift",
      code: `struct FocusTimer: View {
    @State private var remaining: TimeInterval = 25 * 60
    @State private var isActive = false

    var body: some View {
        VStack {
            Text(formatted(remaining))
                .font(.system(size: 64, design: .monospaced))
            Button(isActive ? "Pause" : "Start") {
                isActive.toggle()
            }
        }
    }
}`,
    },
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
    longDescription:
      "NexFrame provides a declarative API for spring-based animations with WASM-accelerated physics calculations. The gesture system supports complex multi-touch interactions with velocity tracking and configurable friction curves for natural-feeling UI animations.",
    links: [
      { label: "GitHub", url: "#", icon: "github" },
      { label: "npm", url: "#", icon: "package" },
      { label: "Docs", url: "#", icon: "book" },
    ],
    gallery: [
      "/projects/nexframe/gallery-1.jpg",
      "/projects/nexframe/gallery-2.jpg",
      "/projects/nexframe/gallery-3.jpg",
    ],
    codeSnippet: {
      language: "typescript",
      filename: "useSpring.ts",
      code: `export function useSpring(target: number, config?: SpringConfig) {
  const [value, setValue] = useState(target);
  const velocity = useRef(0);

  useAnimationFrame((dt) => {
    const force = -config.stiffness * (value - target);
    const damping = -config.damping * velocity.current;
    velocity.current += (force + damping) * dt;
    setValue((v) => v + velocity.current * dt);
  });

  return value;
}`,
    },
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
    longDescription:
      "ChromaKit implements the OKLCH and OKLAB color spaces for perceptually uniform color manipulation. It includes WCAG contrast ratio calculations, color blindness simulation, and automatic palette generation that guarantees accessible color combinations.",
    links: [
      { label: "GitHub", url: "#", icon: "github" },
      { label: "npm", url: "#", icon: "package" },
      { label: "Playground", url: "#", icon: "external" },
    ],
    gallery: [
      "/projects/chromakit/gallery-1.jpg",
      "/projects/chromakit/gallery-2.jpg",
      "/projects/chromakit/gallery-3.jpg",
    ],
    codeSnippet: {
      language: "typescript",
      filename: "contrast.ts",
      code: `export function contrastRatio(fg: Color, bg: Color): number {
  const l1 = relativeLuminance(fg);
  const l2 = relativeLuminance(bg);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

export function meetsWCAG(fg: Color, bg: Color, level: 'AA' | 'AAA') {
  const ratio = contrastRatio(fg, bg);
  return level === 'AAA' ? ratio >= 7 : ratio >= 4.5;
}`,
    },
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
    longDescription:
      "FormCraft generates type-safe forms from Zod schemas with automatic validation, conditional field visibility, and multi-step wizard flows. The declarative schema approach eliminates boilerplate while maintaining full control over rendering and behavior.",
    links: [
      { label: "GitHub", url: "#", icon: "github" },
      { label: "npm", url: "#", icon: "package" },
      { label: "Docs", url: "#", icon: "book" },
    ],
    gallery: [
      "/projects/formcraft/gallery-1.jpg",
      "/projects/formcraft/gallery-2.jpg",
      "/projects/formcraft/gallery-3.jpg",
      "/projects/formcraft/gallery-4.jpg",
    ],
    codeSnippet: {
      language: "typescript",
      filename: "createForm.ts",
      code: `import { z } from 'zod';
import { createForm } from 'formcraft';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  remember: z.boolean().default(false),
});

export const LoginForm = createForm(loginSchema, {
  onSubmit: async (data) => await auth.signIn(data),
  steps: [{ fields: ['email', 'password', 'remember'] }],
});`,
    },
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
    longDescription:
      "SynthWave maps audio frequency data to procedural 3D geometry in real-time using custom GLSL shaders. The visualizer analyzes audio through FFT decomposition and drives mesh deformation, particle systems, and post-processing bloom effects synchronized to the beat.",
    links: [
      { label: "GitHub", url: "#", icon: "github" },
      { label: "Live Demo", url: "#", icon: "external" },
    ],
    gallery: [
      "/projects/synthwave/gallery-1.jpg",
      "/projects/synthwave/gallery-2.jpg",
      "/projects/synthwave/gallery-3.jpg",
    ],
    codeSnippet: {
      language: "glsl",
      filename: "waveform.frag",
      code: `uniform float uTime;
uniform float uFrequency[64];
varying vec2 vUv;

void main() {
  float wave = sin(vUv.x * 10.0 + uTime) * 0.5;
  float freq = uFrequency[int(vUv.x * 64.0)];
  vec3 color = mix(
    vec3(0.1, 0.0, 0.4),
    vec3(1.0, 0.2, 0.8),
    freq + wave
  );
  gl_FragColor = vec4(color, 1.0);
}`,
    },
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
    longDescription:
      "Neural Canvas renders neural networks as interactive graphs where users can manipulate weights, add neurons, and watch backpropagation flow in real-time. Built with WebGL for smooth rendering of thousands of animated connections and TensorFlow.js for actual gradient computation.",
    links: [
      { label: "GitHub", url: "#", icon: "github" },
      { label: "Live Demo", url: "#", icon: "external" },
      { label: "Blog Post", url: "#", icon: "article" },
    ],
    gallery: [
      "/projects/neural-canvas/gallery-1.jpg",
      "/projects/neural-canvas/gallery-2.jpg",
      "/projects/neural-canvas/gallery-3.jpg",
      "/projects/neural-canvas/gallery-4.jpg",
    ],
    codeSnippet: {
      language: "typescript",
      filename: "NeuralGraph.ts",
      code: `class NeuralGraph {
  private layers: Neuron[][] = [];

  forward(input: number[]): number[] {
    let activation = input;
    for (const layer of this.layers) {
      activation = layer.map((neuron) =>
        sigmoid(dot(neuron.weights, activation) + neuron.bias)
      );
    }
    return activation;
  }

  backpropagate(target: number[], lr: number) {
    const gradients = this.computeGradients(target);
    this.applyGradients(gradients, lr);
  }
}`,
    },
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
    longDescription:
      "Particle Life simulates emergent complexity from simple attraction/repulsion rules between colored particle groups. The Rust-compiled WASM core handles physics for 10,000+ particles at 60fps while the Canvas 2D renderer provides smooth visualization with configurable trail effects.",
    links: [
      { label: "GitHub", url: "#", icon: "github" },
      { label: "Live Demo", url: "#", icon: "external" },
    ],
    gallery: [
      "/projects/particle-life/gallery-1.jpg",
      "/projects/particle-life/gallery-2.jpg",
      "/projects/particle-life/gallery-3.jpg",
    ],
    codeSnippet: {
      language: "rust",
      filename: "simulation.rs",
      code: `pub fn step(&mut self, dt: f32) {
    for i in 0..self.particles.len() {
        let mut fx = 0.0_f32;
        let mut fy = 0.0_f32;
        for j in 0..self.particles.len() {
            if i == j { continue; }
            let (dx, dy) = self.delta(i, j);
            let d = (dx * dx + dy * dy).sqrt();
            let force = self.rules[self.particles[i].kind][self.particles[j].kind];
            fx += force * dx / d;
            fy += force * dy / d;
        }
        self.particles[i].vx += fx * dt;
        self.particles[i].vy += fy * dt;
    }
}`,
    },
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
    longDescription:
      "SnapDiff integrates into CI pipelines to capture screenshots of web pages and compare them against approved baselines. Using perceptual diffing algorithms via Sharp, it highlights meaningful visual changes while ignoring anti-aliasing and sub-pixel rendering differences.",
    links: [
      { label: "GitHub", url: "#", icon: "github" },
      { label: "npm", url: "#", icon: "package" },
      { label: "Docs", url: "#", icon: "book" },
    ],
    gallery: [
      "/projects/snapdiff/gallery-1.jpg",
      "/projects/snapdiff/gallery-2.jpg",
      "/projects/snapdiff/gallery-3.jpg",
    ],
    codeSnippet: {
      language: "typescript",
      filename: "compare.ts",
      code: `export async function compare(
  baseline: Buffer,
  current: Buffer,
  threshold = 0.01
): Promise<DiffResult> {
  const [img1, img2] = await Promise.all([
    sharp(baseline).raw().toBuffer({ resolveWithObject: true }),
    sharp(current).raw().toBuffer({ resolveWithObject: true }),
  ]);
  const diffPixels = countDifferences(img1.data, img2.data);
  const ratio = diffPixels / (img1.info.width * img1.info.height);
  return { passed: ratio < threshold, ratio, diffPixels };
}`,
    },
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
    longDescription:
      "Portmap provides a terminal UI for managing local development services, automatically detecting port conflicts and offering re-routing solutions. The gRPC daemon monitors active ports and can proxy traffic between services for seamless local microservice development.",
    links: [
      { label: "GitHub", url: "#", icon: "github" },
      { label: "Homebrew", url: "#", icon: "package" },
    ],
    gallery: [
      "/projects/portmap/gallery-1.jpg",
      "/projects/portmap/gallery-2.jpg",
      "/projects/portmap/gallery-3.jpg",
    ],
    codeSnippet: {
      language: "go",
      filename: "scanner.go",
      code: `func (s *Scanner) FindConflicts() []Conflict {
	active := s.getActivePorts()
	var conflicts []Conflict
	for _, svc := range s.services {
		if owner, ok := active[svc.Port]; ok && owner != svc.Name {
			conflicts = append(conflicts, Conflict{
				Port:    svc.Port,
				Want:    svc.Name,
				Current: owner,
			})
		}
	}
	return conflicts
}`,
    },
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
    longDescription:
      "Migratron generates reversible migration plans by analyzing schema diffs and automatically creating rollback SQL. It supports zero-downtime migrations through shadow table strategies and progressive column backfills, ensuring production databases stay available during schema changes.",
    links: [
      { label: "GitHub", url: "#", icon: "github" },
      { label: "Crates.io", url: "#", icon: "package" },
      { label: "Docs", url: "#", icon: "book" },
    ],
    gallery: [
      "/projects/migratron/gallery-1.jpg",
      "/projects/migratron/gallery-2.jpg",
      "/projects/migratron/gallery-3.jpg",
      "/projects/migratron/gallery-4.jpg",
    ],
    codeSnippet: {
      language: "rust",
      filename: "plan.rs",
      code: `pub fn generate_plan(from: &Schema, to: &Schema) -> MigrationPlan {
    let diff = from.diff(to);
    let mut steps = Vec::new();
    for change in diff.changes() {
        steps.push(Step {
            forward: change.to_sql(),
            rollback: change.inverse().to_sql(),
            safety: change.safety_level(),
        });
    }
    MigrationPlan { steps, estimated_duration: estimate(&diff) }
}`,
    },
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
    longDescription:
      "Voxel Quest generates infinite worlds using layered noise functions with biome-specific generation rules. The multiplayer dungeon system uses Unity Netcode for synchronized combat encounters, and the crafting system features 200+ recipes with emergent material combinations.",
    links: [
      { label: "GitHub", url: "#", icon: "github" },
      { label: "Steam", url: "#", icon: "gamepad" },
      { label: "Wiki", url: "#", icon: "book" },
    ],
    gallery: [
      "/projects/voxel-quest/gallery-1.jpg",
      "/projects/voxel-quest/gallery-2.jpg",
      "/projects/voxel-quest/gallery-3.jpg",
      "/projects/voxel-quest/gallery-4.jpg",
    ],
    codeSnippet: {
      language: "csharp",
      filename: "ChunkGenerator.cs",
      code: `public Chunk Generate(Vector3Int chunkPos) {
    var chunk = new Chunk(chunkPos);
    for (int x = 0; x < CHUNK_SIZE; x++)
    for (int y = 0; y < CHUNK_SIZE; y++)
    for (int z = 0; z < CHUNK_SIZE; z++) {
        float density = Noise.Perlin3D(
            chunkPos + new Vector3Int(x, y, z), scale: 0.05f
        );
        chunk.SetBlock(x, y, z,
            density > 0.5f ? BlockType.Stone : BlockType.Air);
    }
    return chunk;
}`,
    },
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
    longDescription:
      "Echo Drift synchronizes platforming mechanics with procedurally generated music through FMOD integration. Platforms pulse, shift, and transform on beat boundaries while the player's movement speed and jump height respond to the current musical intensity.",
    links: [
      { label: "GitHub", url: "#", icon: "github" },
      { label: "Itch.io", url: "#", icon: "gamepad" },
    ],
    gallery: [
      "/projects/echo-drift/gallery-1.jpg",
      "/projects/echo-drift/gallery-2.jpg",
      "/projects/echo-drift/gallery-3.jpg",
    ],
    codeSnippet: {
      language: "gdscript",
      filename: "BeatPlatform.gd",
      code: `extends StaticBody2D

@export var beat_offset: float = 0.0
var base_position: Vector2

func _ready():
    base_position = position
    AudioBus.beat_signal.connect(_on_beat)

func _on_beat(beat_index: int):
    var t = create_tween()
    t.tween_property(self, "position:y",
        base_position.y - 32.0, 0.1)
    t.tween_property(self, "position:y",
        base_position.y, 0.3).set_ease(Tween.EASE_OUT)`,
    },
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
    longDescription:
      "Hex Siege combines deep turn-based strategy with hexagonal grid mechanics and an AI opponent trained via self-play reinforcement learning. The Firebase-backed matchmaking system pairs players by Elo rating with average queue times under 15 seconds.",
    links: [
      { label: "GitHub", url: "#", icon: "github" },
      { label: "Play Online", url: "#", icon: "external" },
      { label: "Docs", url: "#", icon: "book" },
    ],
    gallery: [
      "/projects/hex-siege/gallery-1.jpg",
      "/projects/hex-siege/gallery-2.jpg",
      "/projects/hex-siege/gallery-3.jpg",
    ],
    codeSnippet: {
      language: "typescript",
      filename: "HexGrid.ts",
      code: `export class HexGrid {
  getNeighbors(hex: Hex): Hex[] {
    const directions = [
      [1, 0, -1], [1, -1, 0], [0, -1, 1],
      [-1, 0, 1], [-1, 1, 0], [0, 1, -1],
    ];
    return directions
      .map(([dq, dr, ds]) => ({ q: hex.q + dq, r: hex.r + dr, s: hex.s + ds }))
      .filter((h) => this.isValid(h));
  }

  findPath(start: Hex, end: Hex): Hex[] {
    return aStar(start, end, (h) => this.getNeighbors(h));
  }
}`,
    },
  },
];
