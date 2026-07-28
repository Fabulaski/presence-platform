import { ContextClassification, ContextEvent, ExperienceFeedback, ExperienceObject, SpiritualJourney } from '@presence/types';

export enum DomainEventType {
  CONTEXT_CAPTURED = 'context.captured',
  CONTEXT_CLASSIFIED = 'context.classified',
  NEED_RECOGNIZED = 'need.recognized',
  SCRIPTURE_MATCHED = 'scripture.matched',
  EXPERIENCE_GENERATED = 'experience.generated',
  EXPERIENCE_DISPLAYED = 'experience.displayed',
  INTERACTION_RECORDED = 'interaction.recorded',
  JOURNEY_UPDATED = 'journey.updated',
  ANALYTICS_GENERATED = 'analytics.generated'
}

export interface DomainEventPayloadMap {
  [DomainEventType.CONTEXT_CAPTURED]: ContextEvent;
  [DomainEventType.CONTEXT_CLASSIFIED]: ContextClassification;
  [DomainEventType.NEED_RECOGNIZED]: { eventId: string; need: string; urgency: string };
  [DomainEventType.SCRIPTURE_MATCHED]: { momentId: string; reference: string };
  [DomainEventType.EXPERIENCE_GENERATED]: ExperienceObject;
  [DomainEventType.EXPERIENCE_DISPLAYED]: { experienceId: string; appId: string };
  [DomainEventType.INTERACTION_RECORDED]: ExperienceFeedback;
  [DomainEventType.JOURNEY_UPDATED]: SpiritualJourney;
  [DomainEventType.ANALYTICS_GENERATED]: { experienceId: string; metrics: Record<string, number> };
}

export interface BaseDomainEvent<T extends DomainEventType = DomainEventType> {
  id: string;
  type: T;
  payload: DomainEventPayloadMap[T];
  timestamp: string;
}
