export type PlatformType = 'creator' | 'radio' | 'dev' | 'widget' | 'custom';

export type ContextType = 
  | 'creative_block'
  | 'anxiety'
  | 'grief'
  | 'celebration'
  | 'decision_making'
  | 'weariness'
  | 'gratitude'
  | 'general';

export type SpiritualNeed = 
  | 'hope'
  | 'peace'
  | 'perseverance'
  | 'wisdom'
  | 'comfort'
  | 'joy'
  | 'courage'
  | 'rest';

export type PriorityLevel = 'low' | 'medium' | 'high' | 'urgent';

export interface ContextEvent {
  id: string;
  appId: string;
  userId: string;
  platform: PlatformType;
  activity: string;
  topic?: string;
  durationSeconds?: number;
  intent?: string;
  contextType?: ContextType;
  confidence: number; // 0.0 to 1.0
  metadata?: Record<string, unknown>;
  timestamp: string;
}

export interface ContextClassification {
  eventId: string;
  shouldIntervene: boolean;
  contextType: ContextType;
  primaryNeed: SpiritualNeed;
  urgency: PriorityLevel;
  confidence: number;
  reasoning: string;
}
