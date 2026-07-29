import { PresenceEventBus, DomainEventType } from '@presence/events';
import { ContextEvent, ExperienceObject } from '@presence/types';
import { IScriptureService } from '../ports/scripture-port.js';
import { IGlooAIPipeline } from '../ports/ai-pipeline-port.js';
import { LiveExperienceStore } from '../store/live-store.js';

export class ContextEngine {
  private scriptureService: IScriptureService;
  private aiPipeline: IGlooAIPipeline;
  private eventBus: PresenceEventBus;

  constructor(scriptureService: IScriptureService, aiPipeline: IGlooAIPipeline) {
    this.scriptureService = scriptureService;
    this.aiPipeline = aiPipeline;
    this.eventBus = PresenceEventBus.getInstance();
  }

  public async processContext(event: ContextEvent, options?: { force?: boolean }): Promise<ExperienceObject | null> {
    const startTime = Date.now();
    console.log(`[ContextEngine] Processing context event ${event.id} (${event.appId})`);
    
    // Step 1: Emit Context Captured
    this.eventBus.publish(DomainEventType.CONTEXT_CAPTURED, event);

    // Step 2: Classify and Discern via Gloo AI Agent
    const classification = await this.aiPipeline.classifyContext(event);
    
    // If forced by explicit user action, always intervene
    if (options?.force) {
      classification.shouldIntervene = true;
      if (classification.contextType === 'general') {
        classification.contextType = 'creative_block';
      }
    }

    this.eventBus.publish(DomainEventType.CONTEXT_CLASSIFIED, classification);

    // Step 3: Discernment check - Presence accompanies, doesn't spam
    if (!classification.shouldIntervene) {
      console.log(`[ContextEngine] Discernment: No intervention needed for event ${event.id}`);
      return null;
    }

    this.eventBus.publish(DomainEventType.NEED_RECOGNIZED, {
      eventId: event.id,
      need: classification.primaryNeed,
      urgency: classification.urgency
    });

    // Step 4: Fetch Scripture, Devotional Plan, and AI Experience in parallel for ultra-fast response
    const lang = event.language || 'es';

    const scripturePromise = this.scriptureService.findScriptureForNeed({
      need: classification.primaryNeed,
      topic: event.topic,
      language: lang
    });

    const planPromise = this.scriptureService.getReadingPlanForNeed(
      classification.primaryNeed,
      event.topic,
      lang
    );

    const scripture = await scripturePromise;

    this.eventBus.publish(DomainEventType.SCRIPTURE_MATCHED, {
      momentId: `mom_${event.id}`,
      reference: scripture.reference
    });

    const [youVersionPlan, experience] = await Promise.all([
      planPromise,
      this.aiPipeline.buildExperience(event, classification, scripture)
    ]);

    experience.youVersionPlan = youVersionPlan;
    
    this.eventBus.publish(DomainEventType.EXPERIENCE_GENERATED, experience);

    const latencyMs = Date.now() - startTime;

    // Step 6: Save to Live Store for real-time Web Dashboard updates
    LiveExperienceStore.getInstance().addExperience(experience, event.appId, event.activity, latencyMs);

    return experience;
  }
}
