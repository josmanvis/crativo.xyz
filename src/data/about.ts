import { AboutData } from '@/types/about';

// HR Mode - The corporate speak that gets past the keyword scanners
export const aboutDataHR: AboutData = {
  bio: {
    name: 'Jose Viscasillas',
    tagline: 'Senior Software Engineer specializing in React, video platforms, and innovation',
    description: [
      "I'm a Senior Software Engineer at ON24, where I develop cutting-edge video conferencing solutions using React.js, SASS, OpenTok, and styled-components. I've built features including attendee lists, hand raise, pass-the-mic, virtual backgrounds, and custom user role systems that power video platforms for thousands of users.",
      'With over two decades of experience — I started coding at 13 and haven\'t stopped — spanning video platforms, innovation labs, and rapid application development, I specialize in creating scalable front-end solutions. I led teams at Retail Business Services (Ahold Delhaize) where I developed kiosk software, innovation portals, and authored several NPM packages including too-bored (virtual keyboard), gappa-comments (threaded comments), and ace (React bootstrapping CLI).',
      "I'm passionate about building tools that empower developers and creating user experiences that blend technical excellence with thoughtful design. From React-Native mobile apps to enterprise web platforms, I bring ideas to life with clean code and modern best practices.",
    ],
  },
  skills: [
    // Languages & Core
    { name: 'TypeScript', category: 'Languages', proficiency: 'expert' },
    { name: 'JavaScript (ES6)', category: 'Languages', proficiency: 'expert' },
    { name: 'HTML5', category: 'Languages', proficiency: 'expert' },
    { name: 'CSS3', category: 'Languages', proficiency: 'expert' },
    { name: 'PHP5', category: 'Languages', proficiency: 'advanced' },

    // Frontend Frameworks
    { name: 'React.js', category: 'Frontend', proficiency: 'expert' },
    { name: 'Next.js', category: 'Frontend', proficiency: 'expert' },
    { name: 'React Native', category: 'Frontend', proficiency: 'expert' },
    { name: 'Tailwind CSS', category: 'Frontend', proficiency: 'expert' },
    { name: 'Remotion', category: 'Frontend', proficiency: 'advanced' },
    { name: 'SASS', category: 'Frontend', proficiency: 'expert' },
    { name: 'Styled Components', category: 'Frontend', proficiency: 'expert' },

    // Backend & Data
    { name: 'RESTful APIs', category: 'Backend', proficiency: 'expert' },
    { name: 'Node.js', category: 'Backend', proficiency: 'expert' },
    { name: 'Express.js', category: 'Backend', proficiency: 'expert' },
    { name: 'Ruby on Rails', category: 'Backend', proficiency: 'advanced' },
    { name: 'CouchDB', category: 'Backend', proficiency: 'advanced' },
    { name: 'SendGrid', category: 'Backend', proficiency: 'advanced' },

    // Tools & Platforms
    { name: 'Git', category: 'Tools', proficiency: 'expert' },
    { name: 'Redux', category: 'Tools', proficiency: 'expert' },
    { name: 'OpenTok', category: 'Tools', proficiency: 'advanced' },
    { name: 'IBM Watson', category: 'Tools', proficiency: 'advanced' },
    { name: 'Google Dialogflow', category: 'Tools', proficiency: 'advanced' },
    { name: 'WordPress', category: 'Tools', proficiency: 'expert' },
    { name: 'Project Management', category: 'Tools', proficiency: 'expert' },

    // Design
    { name: 'UI/UX Design', category: 'Design', proficiency: 'expert' },
    { name: 'Sketch', category: 'Design', proficiency: 'advanced' },
    { name: 'Adobe XD', category: 'Design', proficiency: 'advanced' },
    { name: 'Photoshop', category: 'Design', proficiency: 'advanced' },
    { name: 'Affinity Designer', category: 'Design', proficiency: 'advanced' },
    { name: 'Affinity Photo', category: 'Design', proficiency: 'advanced' },
  ],
  timeline: [
    {
      date: '2021 - Present',
      title: 'Senior Software Engineer at ON24',
      description: 'Developed video conferencing platform features including attendee lists, hand raise, virtual backgrounds, and custom user role systems. Led iOS Safari support and provided technical integration support to 4 product teams.',
      type: 'career',
    },
    {
      date: '2018 - 2021',
      title: 'Software Engineer III at Retail Business Services',
      description: 'Led Innovation Lab teams in front-end development, rapid application development, and project management. Developed kiosk software for Stop & Shop and authored NPM packages including too-bored, gappa-comments, and ace CLI.',
      type: 'career',
    },
    {
      date: '2019',
      title: 'NPM Package Author',
      description: 'Published open-source tools: too-bored (React virtual keyboard), gappa-comments (threaded comment component), and ace (React app bootstrapping CLI)',
      type: 'achievement',
    },
    {
      date: '2016 - 2017',
      title: 'Front End Developer at Xceleration',
      description: 'Built responsive layouts with React, Styled Components, and Redux. Developed custom leaderboards for Rodan + Fields programs and maintained company WordPress site.',
      type: 'career',
    },
    {
      date: '2015',
      title: 'Associates Degree in Business Marketing',
      description: 'Graduated from Central Piedmont Community College with focus on business and retail',
      type: 'education',
    },
    {
      date: '2013 - 2014',
      title: 'UX/UI Designer at Micosoftt/Elite',
      description: 'Oversaw development of MiPortal online business operating system and built TicketCloud support ticket system',
      type: 'career',
    },
  ],
};

// Normal People Mode - How I'd actually describe myself to a human
export const aboutDataHuman: AboutData = {
  bio: {
    name: 'Jose Einstein Pants',
    tagline: '"I have 200+ unfinished projects and mass anxiety about all of them. But hey, at least I ship the ones that pay the bills."',
    description: [
      "Look, software engineering is just problem-solving with extra steps and way too many tabs open. I've been doing this since I was 13 — I'm almost 34 now — which means I've had 21 years to make mistakes so you don't have to.",
      "Currently I'm at ON24 making video conferencing not suck — hand raising, virtual backgrounds, the \"who's talking\" indicator, all that stuff. Before that, I was at an Innovation Lab at Retail Business Services building kiosks that help people find tomatoes in grocery stores (real project, I swear). Voice AI that understands \"where are the red things for pasta\" and knows you mean tomatoes. The future is weird.",
      "I've also published npm packages that actual humans use — too-bored (a virtual keyboard with fat-finger-friendly keys), gappa-comments (threaded comments that actually work), and ace (a CLI to stop copy-pasting boilerplate). 8,700+ downloads combined. Not viral, but not zero either.",
      "I build things because I genuinely love it. Not in a LinkedIn \"passionate about synergy\" way — I mean I'll spend my Saturday building a CLI tool because my Developer folder is chaos and I got annoyed. I'll refactor code that works perfectly fine because it offends me aesthetically. I have opinions about semicolons. That's the vibe.",
      "My stack is React, TypeScript, Next.js, Node, and whatever else makes sense for the problem. I've done React Native, Tauri, Electron, Remotion for video, OpenTok for WebRTC, IBM Watson for AI that kinda works, and enough CSS to have nightmares about z-index. I believe in shipping, iterating, and not bikeshedding about tabs vs spaces (it's spaces, but I'll use tabs if you're buying lunch).",
      "When I'm not coding, I'm probably thinking about coding. The brain doesn't have an off switch, you know?",
    ],
  },
  skills: [
    // Languages & Core
    { name: 'TypeScript', category: 'Languages', proficiency: 'expert' },
    { name: 'JavaScript (ES6)', category: 'Languages', proficiency: 'expert' },
    { name: 'HTML5', category: 'Languages', proficiency: 'expert' },
    { name: 'CSS3', category: 'Languages', proficiency: 'expert' },
    { name: 'PHP5', category: 'Languages', proficiency: 'advanced' },

    // Frontend Frameworks
    { name: 'React.js', category: 'Frontend', proficiency: 'expert' },
    { name: 'Next.js', category: 'Frontend', proficiency: 'expert' },
    { name: 'React Native', category: 'Frontend', proficiency: 'expert' },
    { name: 'Tailwind CSS', category: 'Frontend', proficiency: 'expert' },
    { name: 'Remotion', category: 'Frontend', proficiency: 'advanced' },
    { name: 'SASS', category: 'Frontend', proficiency: 'expert' },
    { name: 'Styled Components', category: 'Frontend', proficiency: 'expert' },

    // Backend & Data
    { name: 'RESTful APIs', category: 'Backend', proficiency: 'expert' },
    { name: 'Node.js', category: 'Backend', proficiency: 'expert' },
    { name: 'Express.js', category: 'Backend', proficiency: 'expert' },
    { name: 'Ruby on Rails', category: 'Backend', proficiency: 'advanced' },
    { name: 'CouchDB', category: 'Backend', proficiency: 'advanced' },
    { name: 'SendGrid', category: 'Backend', proficiency: 'advanced' },

    // Tools & Platforms
    { name: 'Git', category: 'Tools', proficiency: 'expert' },
    { name: 'Redux', category: 'Tools', proficiency: 'expert' },
    { name: 'OpenTok', category: 'Tools', proficiency: 'advanced' },
    { name: 'IBM Watson', category: 'Tools', proficiency: 'advanced' },
    { name: 'Google Dialogflow', category: 'Tools', proficiency: 'advanced' },
    { name: 'WordPress', category: 'Tools', proficiency: 'expert' },
    { name: 'Project Management', category: 'Tools', proficiency: 'expert' },

    // Design
    { name: 'UI/UX Design', category: 'Design', proficiency: 'expert' },
    { name: 'Sketch', category: 'Design', proficiency: 'advanced' },
    { name: 'Adobe XD', category: 'Design', proficiency: 'advanced' },
    { name: 'Photoshop', category: 'Design', proficiency: 'advanced' },
    { name: 'Affinity Designer', category: 'Design', proficiency: 'advanced' },
    { name: 'Affinity Photo', category: 'Design', proficiency: 'advanced' },
  ],
  timeline: [
    {
      date: '2021 - Present',
      title: 'Senior Software Engineer at ON24',
      description: 'Making video calls work. Hand raising, virtual backgrounds, the \"who\'s talking\" indicator — all the stuff you don\'t think about until it breaks. I also became the Safari Guy™ which is exactly as fun as it sounds.',
      type: 'career',
    },
    {
      date: '2018 - 2021',
      title: 'Innovation Lab at Retail Business Services',
      description: 'Built kiosks that help people find stuff in grocery stores. Voice AI that understands \"where are the red things for pasta\" and knows you mean tomatoes. Also trained co-ops, shipped npm packages, and learned that enterprise software is wild.',
      type: 'career',
    },
    {
      date: '2019',
      title: 'Started Publishing npm Packages',
      description: 'too-bored (virtual keyboard with fat-finger-friendly keys), gappa-comments (threaded comments that actually work), ace (stop copy-pasting boilerplate). 8,700+ downloads combined. Not famous, but not zero.',
      type: 'achievement',
    },
    {
      date: '2016 - 2017',
      title: 'Front End Developer at Xceleration',
      description: 'React, Redux, leaderboards for MLM companies. It was a job. I learned a lot about state management and the skincare industry.',
      type: 'career',
    },
    {
      date: '2015',
      title: 'Associates Degree in Business Marketing',
      description: 'Plot twist: I went to school for business. The coding thing happened on the side and then... became the main thing.',
      type: 'education',
    },
    {
      date: '2013 - 2014',
      title: 'First Real Software Project',
      description: 'Built an \"online operating system\" called MiPortal and a ticket system called TicketCloud. PHP5. jQuery. XML. No tests. No version control. I was 20 and fearless. We shipped it anyway.',
      type: 'career',
    },
  ],
};

// Default export for backward compatibility
export const aboutData = aboutDataHuman;
