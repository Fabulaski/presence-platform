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
        console.log(`[Gloo AI Gateway] Requesting live multi-agent classification via ${this.agentEndpoint}...`);
        const response = await fetch(`${this.agentEndpoint}/chat/completions`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'gloo-agent-pipeline-v1',
            messages: [
              {
                role: 'system',
                content: 'You are the Gloo AI Context Classifier Agent for Presence Platform. Analyze user activity and return a JSON object with: { shouldIntervene: boolean, contextType: string, primaryNeed: string, urgency: string, confidence: number, reasoning: string }'
              },
              {
                role: 'user',
                content: `Activity: "${event.activity}", Topic: "${event.topic || 'none'}", Platform: "${event.platform}", Duration: ${event.durationSeconds || 0}s`
              }
            ],
            response_format: { type: 'json_object' }
          })
        });

        if (response.ok) {
          const data = (await response.json()) as any;
          const parsed = JSON.parse(data.choices?.[0]?.message?.content || '{}');
          if (parsed && parsed.primaryNeed) {
            return {
              eventId: event.id,
              shouldIntervene: parsed.shouldIntervene ?? true,
              contextType: parsed.contextType || 'creative_block',
              primaryNeed: parsed.primaryNeed || 'hope',
              urgency: parsed.urgency || 'medium',
              confidence: parsed.confidence || 0.95,
              reasoning: parsed.reasoning || 'Live Gloo AI Multi-Agent Classification'
            };
          }
        }
      } catch (err: any) {
        console.warn(`[Gloo AI Gateway] Live multi-agent pipeline fallback: ${err.message}`);
      }
    }

    // Local Intelligent Fallback Classifier
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
    } else if (activityLower.includes('coding') || topicLower.includes('tired') || topicLower.includes('weariness')) {
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
        const response = await fetch(`${this.agentEndpoint}/chat/completions`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'gloo-agent-reflection-v1',
            messages: [
              {
                role: 'system',
                content: 'You are the Gloo AI Reflection Agent for Presence Platform. Generate a brief encouraging reflection, prayer, micro-action, and title in JSON format: { title: string, reflection: string, prayer: string, action: string }'
              },
              {
                role: 'user',
                content: `Need: ${need}, Verse: "${scripture.text}" (${scripture.reference}), Context Topic: ${topic || 'work'}`
              }
            ],
            response_format: { type: 'json_object' }
          })
        });

        if (response.ok) {
          const data = (await response.json()) as any;
          const parsed = JSON.parse(data.choices?.[0]?.message?.content || '{}');
          if (parsed && parsed.reflection) {
            return {
              title: parsed.title || 'Un Momento de Esperanza',
              reflection: parsed.reflection,
              prayer: parsed.prayer || 'Señor, dame paz y sabiduría en este momento. Amén.',
              action: parsed.action || 'Tómate 60 segundos y continúa con fe.',
              shareText: `"${scripture.text}" - ${scripture.reference} via Presence Platform`
            };
          }
        }
      } catch (err: any) {
        // fallback
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
