export type AgeGroup = 'toddler' | 'preschool' | 'early';

export interface KidProfile {
  id: string;
  name: string;
  avatar: string; // 'lion' | 'rabbit' | 'bear' | 'monkey' | 'dino' | 'koala'
  color: string;  // theme color hex or tailwind class
  ageGroup: AgeGroup;
  stars: number;
  completedGamesCount: number;
  achievements: string[]; // List of unlocked badges
}

export interface GameMetadata {
  id: string;
  title: string;
  description: string;
  minAge: number;
  maxAge: number;
  icon: string; // lucide icon name
  color: string; // tailwind background/border class
  difficulty: 'Very Easy' | 'Easy' | 'Medium' | 'Fun Adventure';
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string;
}
