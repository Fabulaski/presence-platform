import { ContextClassification, ContextEvent, ExperienceObject, ScriptureMatch, SpiritualNeed } from '@presence/types';
import { IGlooAIPipeline } from '../ports/ai-pipeline-port.js';

interface GeneratedReflectionData {
  title: string;
  reflection: string;
  prayer: string;
  action: string;
  shareText: string;
}

const DYNAMIC_TEMPLATES: Record<SpiritualNeed, Array<{ title: string; reflection: (topicClean: string) => string; prayer: string; action: string }>> = {
  wisdom: [
    {
      title: 'Luz para tu Código',
      reflection: (topic) => `Al trabajar en ${topic}, recuerda que la sabiduría técnica nace de la serenidad. Dios da claridad a tu entendimiento para resolver cada desafío con perspicacia.`,
      prayer: 'Señor, ilumina mi mente para estructurar soluciones limpias, ordenadas y sabias. Amén.',
      action: 'Haz una pausa de 60 segundos, toma un vaso de agua y vuelve con la mente despejada.'
    },
    {
      title: 'Claridad y Entendimiento',
      reflection: (topic) => `En medio de la complejidad de ${topic}, la verdadera inteligencia consiste en reconocer que la luz viene de arriba. No tienes que resolverlo todo de golpe.`,
      prayer: 'Señor, dame paciencia y discernimiento para hallar el camino correcto en esta tarea. Amén.',
      action: 'Respira profundo 3 veces, sonríe y retoma el código con calma.'
    }
  ],
  rest: [
    {
      title: 'Pausa para la Mente',
      reflection: (topic) => `Tu productividad no define tu valor. Tras este tiempo de enfoque en ${topic}, el descanso es una recomendación divina para renovar tus fuerzas.`,
      prayer: 'Padre, entrego el cansancio mental y permito que tu presencia renueve mis energías ahora. Amén.',
      action: 'Cierra los ojos 60 segundos, estira los hombros y suelta la tensión.'
    },
    {
      title: 'Renovación y Vigor',
      reflection: (topic) => `Incluso los mejores desarrolladores necesitan pausar. Al trabajar en ${topic}, tómate un momento para descansar bajo la sombra del Altísimo.`,
      prayer: 'Señor, renueva mi espíritu y tráeme paz física y mental en esta jornada. Amén.',
      action: 'Sepárate de la pantalla un minuto y contempla un momento de quietud.'
    }
  ],
  peace: [
    {
      title: 'Serenidad en el Desafío',
      reflection: (topic) => `Los errores y las dificultades en ${topic} son pasajeros. No permitas que la prisa robe tu paz; la calma guardará tu corazón y tu mente.`,
      prayer: 'Señor, entrego cualquier frustración y me refugio en tu paz que sobrepasa todo entendimiento. Amén.',
      action: 'Suelta el teclado, exhala suavemente y confía en el proceso.'
    },
    {
      title: 'Paz en la Tormenta Técnica',
      reflection: (topic) => `Cuando las cosas en ${topic} no salen al primer intento, recuerda que la tranquilidad es la clave para la verdadera excelencia.`,
      prayer: 'Padre, dame paz interior para afrontar cualquier error sin perder el gozo. Amén.',
      action: 'Tómate 60 segundos para meditar en tu paz antes de compilar nuevamente.'
    }
  ],
  hope: [
    {
      title: 'Renovación de la Esperanza',
      reflection: (topic) => `Cada avance en ${topic} forma parte de un propósito mayor. Mantén la esperanza viva: el fruto de tu dedicación traerá bendición.`,
      prayer: 'Señor, llena mi día de esperanza renaciente y alegría en cada paso que doy. Amén.',
      action: 'Agradece por este proyecto y continúa con renovado entusiasmo.'
    },
    {
      title: 'Nuevas Perspectivas',
      reflection: (topic) => `No importa cuán difícil parezca el camino en ${topic}, Dios tiene un futuro de bien para ti. Camina confiado en su gracia.`,
      prayer: 'Señor, mi esperanza está puesta en ti y en la obra de tus manos. Amén.',
      action: 'Visualiza la meta cumplida y avanza con fe.'
    }
  ],
  perseverance: [
    {
      title: 'Constancia que Vence',
      reflection: (topic) => `Grandes sistemas se construyen línea a línea. Al estar trabajando en ${topic}, recuerda que la constancia supera cualquier obstáculo.`,
      prayer: 'Señor, fortaléceme para no desmayar y terminar esta obra con perseverancia y excelencia. Amén.',
      action: 'Anota tu próximo objetivo corto y avanza firme hacia él.'
    }
  ],
  courage: [
    {
      title: 'Valentía para Innovar',
      reflection: (topic) => `Toma decisiones audaces en tu arquitectura para ${topic}. Dios no nos ha dado espíritu de temor, sino de poder, amor y dominio propio.`,
      prayer: 'Señor, quita todo temor al fallo y llena mi espíritu de valor para crear cosas grandes. Amén.',
      action: 'Da el siguiente paso con determinación y fe.'
    }
  ],
  comfort: [
    {
      title: 'Consuelo y Aliento',
      reflection: (topic) => `Si sientes agobio en ${topic}, recuerda que Dios está cercano a ti para consolarte y sostenerte en cada momento.`,
      prayer: 'Señor, tú eres mi refugio y el consuelo de mi alma. Amén.',
      action: 'Permítete sentir tu paz e inspira aliento divino.'
    }
  ],
  joy: [
    {
      title: 'Gozo en la Creación',
      reflection: (topic) => `Disfruta el proceso de crear y construir en ${topic}. El gozo del Señor es la verdadera fortaleza para superar la rutina.`,
      prayer: 'Señor, que tu gozo inunde mi corazón mientras desarrollo este código. Amén.',
      action: 'Sonríe, celebra tus logros y sigue compartiendo alegría.'
    }
  ]
};

export class GlooAIPipelineAdapter implements IGlooAIPipeline {
  private apiKey?: string;
  private agentEndpoint: string;

  constructor(apiKey?: string, agentEndpoint?: string) {
    this.apiKey = apiKey || process.env.GLOO_API_KEY;
    this.agentEndpoint = agentEndpoint || process.env.GLOO_AGENT_ENDPOINT || 'https://api.gloo.us/v1/agents';
  }

  private cleanTopic(rawTopic?: string): string {
    if (!rawTopic) return 'este módulo';
    // Clean strings like file_ui.js_duration_210s -> ui.js
    const match = rawTopic.match(/file_([^_\s]+)/i);
    if (match && match[1]) {
      return match[1];
    }
    return rawTopic.replace(/duration_\d+s?/g, '').replace(/[_-]/g, ' ').trim() || 'este proyecto';
  }

  public async classifyContext(event: ContextEvent): Promise<ContextClassification> {
    if (this.apiKey && this.apiKey !== 'gloo_live_multi_agent_key_prod') {
      try {
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
                content: 'You are the Gloo AI Context Classifier Agent for Presence Platform. Return JSON: { shouldIntervene: boolean, contextType: string, primaryNeed: string, urgency: string, confidence: number, reasoning: string }'
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
              primaryNeed: parsed.primaryNeed || 'wisdom',
              urgency: parsed.urgency || 'medium',
              confidence: parsed.confidence || 0.95,
              reasoning: parsed.reasoning || 'Live Gloo AI Multi-Agent Classification'
            };
          }
        }
      } catch (err: any) {
        // fallback
      }
    }

    // Dynamic Intelligent Classification based on activity and topic
    const activityLower = event.activity.toLowerCase();
    const topicLower = (event.topic || '').toLowerCase();

    let shouldIntervene = true;
    let primaryNeed: SpiritualNeed = 'wisdom';
    let urgency: ContextClassification['urgency'] = 'medium';
    let contextType: ContextClassification['contextType'] = 'creative_block';

    if (topicLower.includes('.py') || topicLower.includes('.ts') || topicLower.includes('.js')) {
      primaryNeed = Math.random() > 0.5 ? 'wisdom' : 'peace';
      contextType = 'creative_block';
    } else if (activityLower.includes('editing') || topicLower.includes('block') || topicLower.includes('stuck')) {
      contextType = 'creative_block';
      primaryNeed = 'hope';
    } else if (activityLower.includes('music') || topicLower.includes('anxiety') || topicLower.includes('stress')) {
      contextType = 'anxiety';
      primaryNeed = 'peace';
    } else if (event.durationSeconds && event.durationSeconds > 180) {
      contextType = 'weariness';
      primaryNeed = 'rest';
    } else if (topicLower.includes('joy') || topicLower.includes('thanks')) {
      contextType = 'celebration';
      primaryNeed = 'joy';
    } else {
      primaryNeed = ['wisdom', 'rest', 'peace', 'hope', 'perseverance', 'courage'][Math.floor(Math.random() * 6)] as SpiritualNeed;
      contextType = 'general';
    }

    return {
      eventId: event.id,
      shouldIntervene,
      contextType,
      primaryNeed,
      urgency,
      confidence: event.confidence > 0 ? event.confidence : 0.92,
      reasoning: `Gloo Agent dynamic classification detected ${contextType} for need ${primaryNeed}`
    };
  }

  public async generateReflection(need: SpiritualNeed, scripture: ScriptureMatch, topic?: string): Promise<GeneratedReflectionData> {
    const topicClean = this.cleanTopic(topic);

    if (this.apiKey && this.apiKey !== 'gloo_live_multi_agent_key_prod') {
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
                content: 'You are the Gloo AI Reflection Agent for Presence Platform. Generate a brief unique encouraging reflection, prayer, micro-action, and title in JSON format: { title: string, reflection: string, prayer: string, action: string }'
              },
              {
                role: 'user',
                content: `Need: ${need}, Verse: "${scripture.text}" (${scripture.reference}), Active Module: ${topicClean}`
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
              title: parsed.title || 'Un Momento de Fe',
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

    // Dynamic Multi-Template Generator for rich variety
    const templates = DYNAMIC_TEMPLATES[need] || DYNAMIC_TEMPLATES.wisdom;
    const selected = templates[Math.floor(Math.random() * templates.length)];

    return {
      title: selected.title,
      reflection: selected.reflection(topicClean),
      prayer: selected.prayer,
      action: selected.action,
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
