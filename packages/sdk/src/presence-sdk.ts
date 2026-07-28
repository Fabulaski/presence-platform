import { ContextEngine, GlooAIPipelineAdapter, YouVersionScriptureAdapter } from '@presence/core';
import { DomainEventType, PresenceEventBus } from '@presence/events';
import { ContextEvent, ExperienceFeedback, ExperienceObject, PlatformType } from '@presence/types';

export interface PresenceConfig {
  apiKey: string;
  endpointUrl?: string;
  platform?: PlatformType;
  debug?: boolean;
}

export class Presence {
  private static instance: Presence;
  private config: PresenceConfig;
  private engine: ContextEngine;
  private eventBus: PresenceEventBus;

  private constructor(config: PresenceConfig) {
    this.config = config;
    this.eventBus = PresenceEventBus.getInstance();
    
    // Instantiates Hexagonal ports and core engine
    const scriptureAdapter = new YouVersionScriptureAdapter();
    const aiAdapter = new GlooAIPipelineAdapter();
    this.engine = new ContextEngine(scriptureAdapter, aiAdapter);

    if (this.config.debug) {
      console.log('[Presence SDK] Initialized successfully with API Key:', config.apiKey);
    }
  }

  public static initialize(config: PresenceConfig): Presence {
    if (!Presence.instance) {
      Presence.instance = new Presence(config);
    }
    return Presence.instance;
  }

  public static getInstance(): Presence {
    if (!Presence.instance) {
      throw new Error('[Presence SDK] Must call Presence.initialize({ apiKey: ... }) first');
    }
    return Presence.instance;
  }

  public async capture(params: {
    userId?: string;
    activity: string;
    topic?: string;
    durationSeconds?: number;
    language?: string;
    force?: boolean;
    metadata?: Record<string, unknown>;
  }): Promise<ExperienceObject | null> {
    const event: ContextEvent = {
      id: `ctx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      appId: this.config.apiKey,
      userId: params.userId || 'usr_anonymous',
      platform: this.config.platform || 'custom',
      activity: params.activity,
      topic: params.topic,
      durationSeconds: params.durationSeconds || 0,
      confidence: 0.95,
      language: params.language || 'es',
      metadata: params.metadata || {},
      timestamp: new Date().toISOString()
    };

    return this.engine.processContext(event, { force: params.force ?? true });
  }

  public listen(onExperience: (exp: ExperienceObject) => void): () => void {
    return this.eventBus.subscribe(DomainEventType.EXPERIENCE_GENERATED, (evt) => {
      onExperience(evt.payload);
    });
  }

  public async feedback(feedback: ExperienceFeedback): Promise<void> {
    this.eventBus.publish(DomainEventType.INTERACTION_RECORDED, feedback);
    if (this.config.debug) {
      console.log('[Presence SDK] Feedback recorded for experience:', feedback.experienceId);
    }
  }
}
