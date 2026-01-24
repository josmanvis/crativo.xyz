import { AboutData } from '@/types/about';

export const aboutData: AboutData = {
  bio: {
    name: 'Jose Viscasillas',
    tagline: 'Senior Software Engineer specializing in React, video platforms, and innovation',
    description: [
      "I'm a Senior Software Engineer at ON24, where I develop cutting-edge video conferencing solutions using React.js, SASS, OpenTok, and styled-components. I've built features including attendee lists, hand raise, pass-the-mic, virtual backgrounds, and custom user role systems that power video platforms for thousands of users.",
      'With over a decade of experience spanning video platforms, innovation labs, and rapid application development, I specialize in creating scalable front-end solutions. I led teams at Retail Business Services (Ahold Delhaize) where I developed kiosk software, innovation portals, and authored several NPM packages including too-bored (virtual keyboard), gappa-comments (threaded comments), and ace (React bootstrapping CLI).',
      "I'm passionate about building tools that empower developers and creating user experiences that blend technical excellence with thoughtful design. From React-Native mobile apps to enterprise web platforms, I bring ideas to life with clean code and modern best practices.",
    ],
  },
  skills: [
    // Languages & Core
    { name: 'JavaScript (ES6)', category: 'Languages', proficiency: 'expert' },
    { name: 'HTML5', category: 'Languages', proficiency: 'expert' },
    { name: 'CSS3', category: 'Languages', proficiency: 'expert' },
    { name: 'PHP5', category: 'Languages', proficiency: 'advanced' },

    // Frontend Frameworks
    { name: 'React.js', category: 'Frontend', proficiency: 'expert' },
    { name: 'React Native', category: 'Frontend', proficiency: 'expert' },
    { name: 'InfernoJS', category: 'Frontend', proficiency: 'advanced' },
    { name: 'SASS', category: 'Frontend', proficiency: 'expert' },
    { name: 'LESS', category: 'Frontend', proficiency: 'expert' },
    { name: 'Styled Components', category: 'Frontend', proficiency: 'expert' },

    // Backend & Data
    { name: 'RESTful APIs', category: 'Backend', proficiency: 'expert' },
    { name: 'Node.js', category: 'Backend', proficiency: 'expert' },
    { name: 'Express.js', category: 'Backend', proficiency: 'expert' },
    { name: 'CouchDB', category: 'Backend', proficiency: 'advanced' },

    // Tools & Platforms
    { name: 'Git', category: 'Tools', proficiency: 'expert' },
    { name: 'WordPress', category: 'Tools', proficiency: 'expert' },
    { name: 'OpenTok', category: 'Tools', proficiency: 'advanced' },
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
