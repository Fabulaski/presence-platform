import { SpiritualNeed } from './context.js';

export interface ScriptureMatch {
  reference: string;        // e.g. "Romans 15:13"
  text: string;             // Verse content
  translation: string;      // e.g. "NVI", "RVR1960", "NIV"
  book: string;
  chapter: number;
  verseStart: number;
  verseEnd?: number;
}

export interface ExperienceObject {
  id: string;
  momentId: string;
  need: SpiritualNeed;
  title: string;
  reflection: string;       // Short pastoral/encouraging reflection
  scripture: ScriptureMatch;
  prayer: string;           // Brief guided prayer
  action: string;           // Micro-action (e.g., "Take 3 deep breaths and write down 1 gratitude")
  readingPlanSlug?: string;
  shareText: string;
  journeyChapterId?: string;
  confidence: number;
  status: 'draft' | 'published' | 'dismissed';
  createdAt: string;
}

export interface ExperienceFeedback {
  experienceId: string;
  userId: string;
  opened: boolean;
  saved: boolean;
  shared: boolean;
  dismissed: boolean;
  completed: boolean;
  rating?: number; // 1 to 5
}
