import { ContextClassification, ContextEvent, ExperienceObject, ScriptureMatch, SpiritualNeed } from '@presence/types';
import { IGlooAIPipeline } from '../ports/ai-pipeline-port.js';

export class GlooAIPipelineAdapter implements IGlooAIPipeline {
  private apiKey?: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey;
  }

  public async classifyContext(event: ContextEvent): Promise<ContextClassification> {
    // Multi-Agent Step 1 & 2: Context Agent + Need Agent
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
      // Discernment: If context is vague or low confidence, decide NOT to intervene
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
      reasoning: `Gloo Agent detected ${contextType} during ${event.activity}`
    };
  }

  public async generateReflection(need: SpiritualNeed, scripture: ScriptureMatch, topic?: string) {
    // Multi-Agent Step 4: Reflection Agent
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
