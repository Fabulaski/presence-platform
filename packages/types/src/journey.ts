import { SpiritualNeed } from './context.js';

export interface JourneyChapter {
  id: string;
  journeyId: string;
  chapterNumber: number;
  theme: SpiritualNeed;
  title: string;
  summary: string;
  experiencesCompleted: number;
  startedAt: string;
  completedAt?: string;
}

export interface SpiritualJourney {
  id: string;
  userId: string;
  currentTheme: SpiritualNeed;
  stage: 'initial' | 'growing' | 'maturing' | 'flourishing';
  chapters: JourneyChapter[];
  totalExperiencesCount: number;
  growthAreas: SpiritualNeed[];
  lastActivityAt: string;
  createdAt: string;
  updatedAt: string;
}
