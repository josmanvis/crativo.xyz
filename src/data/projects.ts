import { Project } from "@/types/project";

export const categories = [
  "All",
  "Apps",
  "Libraries",
  "Tools",
  "Kiosks",
] as const;

export const projects: Project[] = [
  // Apps - Real Projects
  {
    id: "qortr",
    title: "Qortr",
    description:
      "Modern room booking platform for businesses with instant booking, team management, and smart analytics.",
    category: "Apps",
    techStack: ["React", "Node.js", "REST API", "OAuth 2.0"],
    imageUrl: "/projects/qortr.jpg",
    href: "/projects/qortr",
    year: 2024,
    metrics: [
      { label: "Daily Bookings", value: "1,000+" },
      { label: "Teams", value: "2,500+" },
    ],
    longDescription:
      "Qortr is the simplest way to manage room bookings for your business. Built to eliminate the friction and complexity of traditional booking systems, it offers instant space reservation with real-time availability, team management with granular permissions, and smart analytics to optimize space utilization. Features a comprehensive REST API with OAuth 2.0 authentication, webhooks for real-time updates, and maintains 99.9% uptime. SOC 2 certified and GDPR compliant.",
    links: [
      { label: "Website", url: "https://www.qortr.com", icon: "external" },
      { label: "API Docs", url: "https://api.qortr.app", icon: "external" },
    ],
    gallery: [],
    codeSnippet: {
      language: "typescript",
      filename: "BookingAPI.ts",
      code: `// Qortr API integration
const qortr = new QortrClient({
  apiKey: process.env.QORTR_API_KEY,
  baseUrl: 'https://api.qortr.app'
});

async function bookRoom(roomId: string, slot: TimeSlot) {
  const booking = await qortr.bookings.create({
    roomId,
    startTime: slot.start,
    endTime: slot.end,
    attendees: slot.invitees
  });

  // Real-time webhook notification
  await qortr.webhooks.trigger('booking.created', booking);
  return booking;
}`,
    },
  },
  {
    id: "on24-video",
    title: "ON24 Video Platform",
    description:
      "Enterprise video conferencing platform with attendee management, hand raise, pass-the-mic, and virtual backgrounds.",
    category: "Apps",
    techStack: ["React.js", "SASS", "OpenTok", "Styled Components"],
    imageUrl: "/projects/on24-video.jpg",
    href: "/projects/on24-video",
    year: 2024,
    metrics: [
      { label: "Product Teams", value: "4" },
      { label: "Platform", value: "iOS Safari" },
    ],
    longDescription:
      "Built the UI for ON24's video conferencing products using React.js, SASS, OpenTok, and styled-components. Developed and owned features including attendee list, hand raise, pass-the-mic, virtual backgrounds, and a custom user role system that allows interface customization based on subscriber roles with support for live demotion and promotion. Brought existing features to iOS Safari within 2 months and provided technical integration support to 4 other product teams.",
    links: [
      { label: "ON24", url: "https://www.on24.com", icon: "external" },
    ],
    gallery: [],
    codeSnippet: {
      language: "typescript",
      filename: "VideoRoleSystem.tsx",
      code: `interface UserRole {
  canShare: boolean;
  canRaiseHand: boolean;
  canChat: boolean;
  customUI: UIConfig;
}

export function VideoInterface({ role }: { role: UserRole }) {
  return (
    <VideoContainer theme={role.customUI}>
      {role.canShare && <ScreenShareButton />}
      {role.canRaiseHand && <HandRaiseButton />}
      {role.canChat && <ChatPanel />}
    </VideoContainer>
  );
}`,
    },
  },
  {
    id: "snaptask",
    title: "SnapTask",
    description:
      "Mobile-first task management platform with real-time messaging, push notifications, and cross-platform support.",
    category: "Apps",
    techStack: ["React Native", "Ruby on Rails", "SendGrid"],
    imageUrl: "/projects/snaptask.jpg",
    href: "/projects/snaptask",
    year: 2017,
    metrics: [
      { label: "Platform", value: "iOS/Android" },
      { label: "Features", value: "Real-time" },
    ],
    longDescription:
      "Built React Native mobile application with JSON/XML parsing to communicate with Ruby on Rails RESTful API. Created responsive web apps using HTML5, CSS3, ES6 JavaScript, Bootstrap, and jQuery. Designed and developed UI for marketing site, web app, and management dashboard. Integrated real-time messaging, email blasts via SendGrid, and push notifications. Managed tasks on Trello with daily meetings across global team members.",
    links: [
      { label: "Website", url: "https://snaptaskapp.com", icon: "external" },
    ],
    gallery: [],
    codeSnippet: {
      language: "javascript",
      filename: "TaskSync.js",
      code: `// React Native task synchronization
class TaskSync extends Component {
  componentDidMount() {
    this.syncTasks();
    this.setupPushNotifications();
  }

  async syncTasks() {
    const response = await fetch('/api/tasks');
    const tasks = await response.json();
    this.setState({ tasks });
  }
}`,
    },
  },
  {
    id: "stopshop-kiosk",
    title: "Stop & Shop Kiosk",
    description:
      "Interactive kiosk software for grocery stores with product lookup, voice shopping list, and store navigation.",
    category: "Kiosks",
    techStack: ["React.js", "Express.js", "Node.js", "IBM Watson"],
    imageUrl: "/projects/stopshop-kiosk.jpg",
    href: "/projects/stopshop-kiosk",
    year: 2021,
    metrics: [
      { label: "Brand", value: "Stop & Shop" },
      { label: "AI", value: "Watson/Dialogflow" },
    ],
    longDescription:
      "Led development of kiosk software solutions for Stop & Shop brand at Retail Business Services. Created shopping list application with voice-to-text integration using IBM Watson, Google Dialogflow, and Microsoft Luis. Developed product lookup component that overlays products on store maps to help customers find items. Built custom virtual keyboard (too-bored npm package) used in the Beer Kiosk application.",
    links: [],
    gallery: [],
    codeSnippet: {
      language: "javascript",
      filename: "VoiceShoppingList.js",
      code: `// Voice shopping list with Watson integration
import Watson from 'watson-developer-cloud';

const assistant = new Watson.AssistantV2({
  version: '2021-06-14',
  authenticator: new Watson.IamAuthenticator({
    apikey: process.env.WATSON_API_KEY,
  }),
});

async function addItemByVoice(transcript) {
  const response = await assistant.message({
    assistantId: process.env.ASSISTANT_ID,
    sessionId: currentSession,
    input: { text: transcript }
  });
  return parseShoppingItem(response);
}`,
    },
  },
  {
    id: "innovation-portal",
    title: "Innovation Portal",
    description:
      "Internal platform for submitting and tracking innovative ideas from pilot to production at Retail Business Services.",
    category: "Apps",
    techStack: ["React.js", "Node.js", "Express.js"],
    imageUrl: "/projects/innovation-portal.jpg",
    href: "/projects/innovation-portal",
    year: 2020,
    metrics: [
      { label: "Company", value: "Ahold Delhaize" },
      { label: "Workflow", value: "Pilot to Prod" },
    ],
    longDescription:
      "Developed innovation portal at Retail Business Services (Ahold Delhaize) that allows company personnel and BRMs to submit innovative ideas and track progress through the entire journey from Pilot to Production. Led front-end development as part of Innovation Lab with responsibility for teaching React.js, Express.js, and Node.js to co-ops. Managed merge requests for both backend and frontend repositories.",
    links: [],
    gallery: [],
    codeSnippet: {
      language: "typescript",
      filename: "IdeaWorkflow.tsx",
      code: `type IdeaStage = 'submitted' | 'review' | 'pilot' | 'production';

interface Idea {
  id: string;
  title: string;
  stage: IdeaStage;
  submitter: User;
  timeline: StageTransition[];
}

function IdeaTracker({ idea }: { idea: Idea }) {
  return (
    <div className="idea-card">
      <h2>{idea.title}</h2>
      <ProgressBar stage={idea.stage} />
      <Timeline events={idea.timeline} />
    </div>
  );
}`,
    },
  },

  // Libraries - Real NPM Packages
  {
    id: "too-bored",
    title: "too-bored",
    description:
      "Configurable React.js virtual keyboard component used in retail kiosk applications.",
    category: "Libraries",
    techStack: ["React.js", "TypeScript", "NPM"],
    imageUrl: "/projects/too-bored.jpg",
    href: "/projects/too-bored",
    year: 2019,
    metrics: [
      { label: "Used in", value: "Beer Kiosk" },
      { label: "Platform", value: "npm" },
    ],
    longDescription:
      "A fully configurable React.js virtual keyboard component built for retail kiosk applications. Originally developed for the Beer Kiosk project at Retail Business Services, it provides touch-friendly input with customizable layouts, themes, and key mappings. Published to the company's internal npm registry and used across multiple kiosk projects.",
    links: [
      { label: "npm", url: "https://www.npmjs.com/~vivalavisca", icon: "package" },
    ],
    gallery: [],
    codeSnippet: {
      language: "typescript",
      filename: "VirtualKeyboard.tsx",
      code: `import TooBored from 'too-bored';

export function KioskInput() {
  const [value, setValue] = useState('');

  return (
    <div>
      <input value={value} readOnly />
      <TooBored
        onChange={setValue}
        layout="qwerty"
        theme="dark"
        maxLength={50}
      />
    </div>
  );
}`,
    },
  },
  {
    id: "gappa-comments",
    title: "gappa-comments",
    description:
      "Fully-responsive, configurable threaded comment component with user tagging support.",
    category: "Libraries",
    techStack: ["React.js", "TypeScript", "NPM"],
    imageUrl: "/projects/gappa-comments.jpg",
    href: "/projects/gappa-comments",
    year: 2019,
    metrics: [
      { label: "Features", value: "Threading+Tags" },
      { label: "Platform", value: "npm" },
    ],
    longDescription:
      "A fully-responsive and configurable threaded comment component for React applications. Supports nested comment threads, user mentions/tagging, and customizable styling. Built to handle complex comment hierarchies with performance optimizations for large discussion trees. Published to internal npm registry for use across Innovation Lab projects.",
    links: [
      { label: "npm", url: "https://www.npmjs.com/~vivalavisca", icon: "package" },
    ],
    gallery: [],
    codeSnippet: {
      language: "typescript",
      filename: "CommentThread.tsx",
      code: `import { GappaComments } from 'gappa-comments';

export function Discussion({ postId }: { postId: string }) {
  const [comments, setComments] = useState<Comment[]>([]);

  return (
    <GappaComments
      comments={comments}
      onReply={(parent, text) => addReply(parent.id, text)}
      onTag={(user) => notifyUser(user)}
      maxDepth={5}
      allowMarkdown
    />
  );
}`,
    },
  },

  // Tools - Real CLI Tools
  {
    id: "ace-cli",
    title: "ace",
    description:
      "Node.js-based CLI for bootstrapping React applications and quickly scaffolding views and components.",
    category: "Tools",
    techStack: ["Node.js", "CLI", "NPM"],
    imageUrl: "/projects/ace-cli.jpg",
    href: "/projects/ace-cli",
    year: 2019,
    metrics: [
      { label: "Team", value: "Innovation Lab" },
      { label: "Platform", value: "npm" },
    ],
    longDescription:
      "A Node.js-based command-line interface tool for bootstrapping React applications and rapidly generating views and components with consistent patterns. Built for the Innovation Lab at Retail Business Services to standardize React project setup and accelerate development. Includes templates for common patterns, automatic import generation, and project structure enforcement.",
    links: [
      { label: "npm", url: "https://www.npmjs.com/~vivalavisca", icon: "package" },
    ],
    gallery: [],
    codeSnippet: {
      language: "bash",
      filename: "terminal",
      code: `# Bootstrap a new React app
$ ace init my-app --template innovation-lab

# Generate a new view
$ ace generate view Dashboard --route /dashboard

# Generate a component
$ ace generate component Button --props variant,size

# Output:
# ✓ Created src/views/Dashboard/index.tsx
# ✓ Created src/views/Dashboard/Dashboard.test.tsx
# ✓ Added route to App.tsx`,
    },
  },
  {
    id: "ticketcloud",
    title: "TicketCloud",
    description:
      "Powerful support ticket system built as the first app for MiPortal online operating system.",
    category: "Apps",
    techStack: ["PHP5", "jQuery", "JavaScript", "XML"],
    imageUrl: "/projects/ticketcloud.jpg",
    href: "/projects/ticketcloud",
    year: 2014,
    metrics: [
      { label: "Platform", value: "MiPortal" },
      { label: "Type", value: "SaaS" },
    ],
    longDescription:
      "Developed as the flagship application for MiPortal, an online operating system for business purposes. TicketCloud provided comprehensive support ticket management with custom workflows, user policies, and cross-installation support. Built using PHP5, jQuery, vanilla JavaScript, and a custom XML parsing library for data exchange between MiPortal instances.",
    links: [],
    gallery: [],
    codeSnippet: {
      language: "php",
      filename: "TicketController.php",
      code: `<?php
class TicketController {
    public function createTicket($data) {
        $ticket = new Ticket();
        $ticket->title = $data['title'];
        $ticket->status = 'open';
        $ticket->assignee = $this->autoAssign($data['category']);

        $xml = $this->toXML($ticket);
        $this->syncToMiPanel($xml);

        return $ticket->save();
    }

    private function autoAssign($category) {
        return $this->getUserPolicy()->getAssignee($category);
    }
}`,
    },
  },

  // PROJAX - Project Management Tool
  {
    id: "projax",
    title: "PROJAX",
    description:
      "Cross-platform project management dashboard for managing local development projects across different tech stacks.",
    category: "Tools",
    techStack: ["Node.js", "Electron", "Express.js", "CLI"],
    imageUrl: "/projects/projax.jpg",
    href: "/projects/projax",
    year: 2024,
    metrics: [
      { label: "Platforms", value: "CLI/Desktop/TUI" },
      { label: "Languages", value: "Node/Python/Rust/Go" },
    ],
    longDescription:
      "PROJAX is the ultimate cross-platform project management dashboard that provides a unified interface for managing local development projects. Features include CLI tools for project management and workflow automation, an Electron-based desktop app with modern UI, interactive terminal UI with vim bindings, automatic port detection and conflict resolution, background process management with log tracking, automatic test detection for Jest/Vitest/Mocha, REST API for programmatic access, and support for Node.js, Python, Rust, Go, and Makefile projects.",
    links: [
      { label: "Website", url: "https://projax.dev", icon: "external" },
    ],
    gallery: [],
    codeSnippet: {
      language: "bash",
      filename: "terminal",
      code: `# Initialize PROJAX in your projects directory
$ projax init ~/projects

# List all detected projects
$ projax list --status

# Run a project with port management
$ projax run my-app --port auto

# Check for port conflicts
$ projax ports scan

# Output:
# ✓ Detected 12 projects
# ✓ Running my-app on port 3001
# ✓ No port conflicts found`,
    },
  },

  // More Libraries - NPM Packages
  {
    id: "zeebra",
    title: "zeebra",
    description:
      "Performant z-index management library with virtual z-stack recycling for complex UI layering.",
    category: "Libraries",
    techStack: ["TypeScript", "React", "NPM"],
    imageUrl: "/projects/zeebra.jpg",
    href: "/projects/zeebra",
    year: 2024,
    metrics: [
      { label: "Focus", value: "Performance" },
      { label: "Platform", value: "npm" },
    ],
    longDescription:
      "A performant z-index management library with virtual z-stack recycling. Zeebra solves the common problem of z-index management in complex UIs by providing a centralized system that automatically manages layer ordering, prevents z-index conflicts, and recycles unused z-indices for optimal performance. Includes React bindings for seamless integration with React applications.",
    links: [
      { label: "npm", url: "https://www.npmjs.com/package/zeebra", icon: "package" },
    ],
    gallery: [],
    codeSnippet: {
      language: "typescript",
      filename: "ZIndexManager.tsx",
      code: `import { useZIndex, ZIndexProvider } from 'zeebra/react';

function Modal({ children }) {
  const zIndex = useZIndex('modal');

  return (
    <div style={{ zIndex }}>
      {children}
    </div>
  );
}

// Automatic z-index recycling when component unmounts
export function App() {
  return (
    <ZIndexProvider>
      <Modal>Content</Modal>
      <Dropdown />
      <Tooltip />
    </ZIndexProvider>
  );
}`,
    },
  },
  {
    id: "floatnote",
    title: "floatnote",
    description:
      "Transparent always-on-top drawing and note-taking overlay for macOS with annotation tools.",
    category: "Libraries",
    techStack: ["Electron", "JavaScript", "macOS"],
    imageUrl: "/projects/floatnote.jpg",
    href: "/projects/floatnote",
    year: 2024,
    metrics: [
      { label: "Platform", value: "macOS" },
      { label: "Type", value: "Desktop App" },
    ],
    longDescription:
      "Floatnote is a transparent always-on-top drawing and note-taking overlay application for macOS. Perfect for screen annotations during presentations, tutorials, or quick visual notes. Features include freehand drawing tools, text annotations, screenshot capabilities, and customizable opacity settings. Built with Electron for native macOS integration.",
    links: [
      { label: "npm", url: "https://www.npmjs.com/package/floatnote", icon: "package" },
      { label: "GitHub", url: "https://github.com/josmanvis/floatnote", icon: "github" },
    ],
    gallery: [],
    codeSnippet: {
      language: "bash",
      filename: "terminal",
      code: `# Install floatnote globally
$ npm install -g floatnote

# Launch the overlay
$ floatnote

# Features:
# - Transparent overlay on any screen
# - Freehand drawing with color picker
# - Text annotations
# - Screenshot and save
# - Keyboard shortcuts for quick access`,
    },
  },
  {
    id: "pubsafe",
    title: "pubsafe",
    description:
      "CLI tool to check if sensitive files in your coding projects are properly gitignored.",
    category: "Tools",
    techStack: ["Node.js", "TypeScript", "CLI", "Ink"],
    imageUrl: "/projects/pubsafe.jpg",
    href: "/projects/pubsafe",
    year: 2025,
    metrics: [
      { label: "Focus", value: "Security" },
      { label: "Platform", value: "npm" },
    ],
    longDescription:
      "Pubsafe is a security-focused CLI tool that audits your projects to ensure sensitive files are properly gitignored before publishing or pushing to remote repositories. It scans for common sensitive file patterns like .env files, API keys, credentials, and private keys, then verifies they are included in your .gitignore. Built with Ink for a beautiful terminal UI experience.",
    links: [
      { label: "npm", url: "https://www.npmjs.com/package/pubsafe", icon: "package" },
    ],
    gallery: [],
    codeSnippet: {
      language: "bash",
      filename: "terminal",
      code: `# Install pubsafe
$ npm install -g pubsafe

# Scan current project
$ pubsafe

# Output:
# Scanning for sensitive files...
#
# ⚠ Found 3 sensitive files:
#   ✗ .env (NOT in .gitignore)
#   ✓ .env.local (gitignored)
#   ✗ credentials.json (NOT in .gitignore)
#
# Run 'pubsafe --fix' to add missing entries`,
    },
  },
  {
    id: "toolbench",
    title: "toolbench",
    description:
      "Reusable development tools library for React applications with debugging and console utilities.",
    category: "Libraries",
    techStack: ["React", "TypeScript", "SCSS", "Vite"],
    imageUrl: "/projects/toolbench.jpg",
    href: "/projects/toolbench",
    year: 2024,
    metrics: [
      { label: "Framework", value: "React 18+" },
      { label: "Platform", value: "npm" },
    ],
    longDescription:
      "Toolbench is a reusable development tools library for React applications. It provides a suite of debugging utilities, console enhancements, and development-time helpers that can be easily integrated into any React project. Includes state inspectors, performance monitors, and customizable dev panels that can be toggled during development.",
    links: [
      { label: "npm", url: "https://www.npmjs.com/package/toolbench", icon: "package" },
    ],
    gallery: [],
    codeSnippet: {
      language: "typescript",
      filename: "DevTools.tsx",
      code: `import { DevTools, useDevPanel } from 'toolbench';
import 'toolbench/styles';

function App() {
  const { isOpen, toggle } = useDevPanel();

  return (
    <div>
      <YourApp />
      {process.env.NODE_ENV === 'development' && (
        <DevTools
          position="bottom-right"
          panels={['state', 'network', 'performance']}
        />
      )}
    </div>
  );
}`,
    },
  },
];
