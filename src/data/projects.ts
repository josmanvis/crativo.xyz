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
];
