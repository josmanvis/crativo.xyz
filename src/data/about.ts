import { AboutData } from '@/types/about';

export const aboutData: AboutData = {
  bio: {
    name: 'Creative Developer',
    tagline: 'Building experiences that blend design, code, and motion',
    description: [
      "I'm a full-stack developer with a passion for creating immersive digital experiences. My work spans interactive web applications, creative coding experiments, and developer tools that make complex things simple.",
      'With expertise in modern web technologies and a keen eye for design, I bridge the gap between technical implementation and user experience. Every project is an opportunity to push boundaries and explore new possibilities.',
      "When I'm not coding, you'll find me experimenting with generative art, contributing to open source, or exploring the intersection of technology and creativity.",
    ],
  },
  skills: [
    // Languages
    { name: 'TypeScript', category: 'Languages', proficiency: 'expert' },
    { name: 'JavaScript', category: 'Languages', proficiency: 'expert' },
    { name: 'Python', category: 'Languages', proficiency: 'advanced' },
    { name: 'Rust', category: 'Languages', proficiency: 'intermediate' },

    // Frontend
    { name: 'React', category: 'Frontend', proficiency: 'expert' },
    { name: 'Next.js', category: 'Frontend', proficiency: 'expert' },
    { name: 'Tailwind CSS', category: 'Frontend', proficiency: 'expert' },
    { name: 'Remotion', category: 'Frontend', proficiency: 'advanced' },
    { name: 'Three.js', category: 'Frontend', proficiency: 'advanced' },

    // Backend
    { name: 'Node.js', category: 'Backend', proficiency: 'expert' },
    { name: 'PostgreSQL', category: 'Backend', proficiency: 'advanced' },
    { name: 'Redis', category: 'Backend', proficiency: 'advanced' },
    { name: 'GraphQL', category: 'Backend', proficiency: 'advanced' },

    // Tools & Platforms
    { name: 'Git', category: 'Tools', proficiency: 'expert' },
    { name: 'Docker', category: 'Tools', proficiency: 'advanced' },
    { name: 'AWS', category: 'Tools', proficiency: 'advanced' },
    { name: 'Vercel', category: 'Tools', proficiency: 'expert' },

    // Creative
    { name: 'Motion Design', category: 'Creative', proficiency: 'advanced' },
    { name: 'UI/UX Design', category: 'Creative', proficiency: 'advanced' },
    { name: 'Generative Art', category: 'Creative', proficiency: 'intermediate' },
  ],
  timeline: [
    {
      date: '2024',
      title: 'Senior Full-Stack Developer',
      description: 'Leading development of interactive web platforms and creative digital experiences',
      type: 'career',
    },
    {
      date: '2022',
      title: 'Open Source Contributor',
      description: 'Published multiple npm packages with 100k+ downloads, active contributor to React ecosystem',
      type: 'achievement',
    },
    {
      date: '2020',
      title: 'Full-Stack Developer',
      description: 'Built scalable applications using React, Node.js, and modern cloud infrastructure',
      type: 'career',
    },
    {
      date: '2018',
      title: 'Frontend Developer',
      description: 'Specialized in creating responsive, accessible web interfaces with focus on performance',
      type: 'career',
    },
    {
      date: '2016',
      title: 'Computer Science Degree',
      description: 'Graduated with honors, focus on software engineering and human-computer interaction',
      type: 'education',
    },
    {
      date: '2015',
      title: 'First Web Application',
      description: 'Built and launched first commercial web application, discovering passion for web development',
      type: 'milestone',
    },
  ],
};
