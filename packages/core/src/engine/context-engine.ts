import { PresenceEventBus, DomainEventType } from '@presence/events';
import { ContextEvent, ExperienceObject } from '@presence/types';
import { IScriptureService } from '../ports/scripture-port.js';
import { IGlooAIPipeline } from '../ports/ai-pipeline-port.js';

export class ContextEngine {
  private scriptureService: IScriptureService;
  private aiPipeline: IGlooAIPipeline;
  private eventBus: PresenceEventBus;

  constructor(scriptureService: IScriptureService, aiPipeline: IGlooAIPipeline) {
    this.scriptureService = scriptureService;
    this.aiPipeline = aiPipeline;
    this.eventBus = PresenceEventBus.getInstance();
  }

  public async processContext(event: ContextEvent): Promise<ExperienceObject | null> {
    // Step 1: Emit Context Captured
    this.eventBus.publish(DomainEventType.CONTEXT_CAPTURED, event);

    // Step 2: Classify and Discern via Gloo AI Agent
    const classification = await this.aiPipeline.classifyContext(event);
    this.eventBus.publish(DomainEventType.CONTEXT_CLASSIFIED, classification);

    // Step 3: Discernment check - Principle #2: Presence accompanies, doesn't spam
    if (!classification.shouldIntervene) {
      console.log(`[ContextEngine] Discernment: No intervention needed for event ${event.id}`);
      return null;
    }

    this.eventBus.publish(DomainEventType.NEED_RECOGNIZED, {
      eventId: event.id,
      need: classification.primaryNeed,
      urgency: classification.urgency
    });

    // Step 4: Fetch Scripture via YouVersion Service Port
    const scripture = await this.scriptureService.findScriptureForNeed({
      need: classification.primaryNeed,
      topic: event.topic
    });
    this.eventBus.publish(DomainEventType.SCRIPTURE_MATCHED, {
      momentId: `mom_${event.id}`,
      reference: scripture.reference
    });

    // Step 5: Build Complete Experience Object
    const experience = await this.aiPipeline.buildExperience(event, classification, scripture);
    this.eventBus.publish(DomainEventType.EXPERIENCE_GENERATED, experience);

    return experience;
  }
}
