export interface Bio {
  name: string;
  tagline: string;
  description: string[];
}

export interface Skill {
  name: string;
  category: string;
  proficiency?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}

export interface TimelineEvent {
  date: string;
  title: string;
  description: string;
  type: 'education' | 'career' | 'achievement' | 'milestone';
}

export interface AboutData {
  bio: Bio;
  skills: Skill[];
  timeline: TimelineEvent[];
}
