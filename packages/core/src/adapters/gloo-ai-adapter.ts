import { ContextClassification, ContextEvent, ExperienceObject, ScriptureMatch, SpiritualNeed } from '@presence/types';
import { IGlooAIPipeline } from '../ports/ai-pipeline-port.js';

export class GlooAIPipelineAdapter implements IGlooAIPipeline {
  private apiKey?: string;
  private agentEndpoint: string;

  constructor(apiKey?: string, agentEndpoint?: string) {
    this.apiKey = apiKey || process.env.GLOO_API_KEY;
    this.agentEndpoint = agentEndpoint || process.env.GLOO_AGENT_ENDPOINT || 'https://api.gloo.us/v1/agents';
  }

  public async classifyContext(event: ContextEvent): Promise<ContextClassification> {
    if (this.apiKey) {
      try {
        console.log(`[Gloo AI Gateway] Connecting to multi-agent pipeline at ${this.agentEndpoint}...`);
        const response = await fetch(`${this.agentEndpoint}/classify`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            activity: event.activity,
            topic: event.topic,
            platform: event.platform,
            durationSeconds: event.durationSeconds,
            metadata: event.metadata
          })
        });

        if (response.ok) {
          const data = (await response.json()) as any;
          return {
            eventId: event.id,
            shouldIntervene: data.shouldIntervene ?? true,
            contextType: data.contextType || 'creative_block',
            primaryNeed: data.primaryNeed || 'hope',
            urgency: data.urgency || 'medium',
            confidence: data.confidence || 0.92,
            reasoning: data.reasoning || 'Gloo AI Live Multi-Agent Classification'
          };
        }
      } catch (err: any) {
        console.warn(`[Gloo AI Gateway] Live multi-agent pipeline fallback: ${err.message}`);
      }
    }

    // Local Fallback Classifier (Zero-latency fallback)
    const activityLower = event.activity.toLowerCase();
    const topicLower = (event.topic || '').toLowerCase();

    let shouldIntervene = true;
    let primaryNeed: SpiritualNeed = 'hope';
    let urgency: ContextClassification['urgency'] = 'medium';
    let contextType: ContextClassification['contextType'] = 'creative_block';

    if (activityLower.includes('editing') || topicLower.includes('block') || topicLower.includes('stuck')) {
      contextType = 'creative_block';
      primaryNeed = 'hope';
    } else if (activityLower.includes('music') || topicLower.includes('anxiety') || topicLower.includes('stress')) {
      contextType = 'anxiety';
      primaryNeed = 'peace';
    } else if (topicLower.includes('tired') || topicLower.includes('exhausted')) {
      contextType = 'weariness';
      primaryNeed = 'rest';
    } else if (topicLower.includes('joy') || topicLower.includes('thanks')) {
      contextType = 'celebration';
      primaryNeed = 'joy';
    } else {
      if (event.confidence < 0.3) {
        shouldIntervene = false;
      }
      contextType = 'general';
      primaryNeed = 'wisdom';
    }

    return {
      eventId: event.id,
      shouldIntervene,
      contextType,
      primaryNeed,
      urgency,
      confidence: event.confidence > 0 ? event.confidence : 0.85,
      reasoning: `Gloo Agent local fallback detected ${contextType} during ${event.activity}`
    };
  }

  public async generateReflection(need: SpiritualNeed, scripture: ScriptureMatch, topic?: string) {
    if (this.apiKey) {
      try {
        const response = await fetch(`${this.agentEndpoint}/generate-reflection`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ need, reference: scripture.reference, text: scripture.text, topic })
        });
        if (response.ok) {
          const data = (await response.json()) as any;
          return {
            title: data.title || 'Un Momento de Esperanza',
            reflection: data.reflection,
            prayer: data.prayer,
            action: data.action,
            shareText: `${scripture.text} - ${scripture.reference} via Presence Platform`
          };
        }
      } catch (err: any) {
        // Fall back to intelligent template
      }
    }

    return {
      title: 'Un Momento de Esperanza',
      reflection: `En medio de tus tareas diarias (${topic || 'creación'}), recuerda que la creatividad y el descanso provienen de una fuente inagotable. No tienes que cargar el peso a solas.`,
      prayer: 'Señor, renueva mis fuerzas y dale claridad a mi mente en este momento. Amén.',
      action: 'Tómate 60 segundos, respira profundo y continúa con confianza.',
      shareText: `"${scripture.text}" - ${scripture.reference} via Presence Platform`
    };
  }

  public async buildExperience(
    event: ContextEvent,
    classification: ContextClassification,
    scripture: ScriptureMatch
  ): Promise<ExperienceObject> {
    const generated = await this.generateReflection(classification.primaryNeed, scripture, event.topic);
    
    return {
      id: `exp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      momentId: `mom_${event.id}`,
      need: classification.primaryNeed,
      title: generated.title,
      reflection: generated.reflection,
      scripture,
      prayer: generated.prayer,
      action: generated.action,
      shareText: generated.shareText,
      confidence: classification.confidence,
      status: 'published',
      createdAt: new Date().toISOString()
    };
  }
}
