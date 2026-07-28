import { ContextClassification, ContextEvent, ExperienceObject, ScriptureMatch, SpiritualNeed } from '@presence/types';

export interface IGlooAIPipeline {
  classifyContext(event: ContextEvent): Promise<ContextClassification>;
  generateReflection(need: SpiritualNeed, scripture: ScriptureMatch, topic?: string): Promise<{
    title: string;
    reflection: string;
    prayer: string;
    action: string;
    shareText: string;
  }>;
  buildExperience(event: ContextEvent, classification: ContextClassification, scripture: ScriptureMatch): Promise<ExperienceObject>;
}
