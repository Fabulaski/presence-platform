import { ContextClassification, ContextEvent, ExperienceObject, ScriptureMatch, SpiritualNeed } from '@presence/types';
import { IGlooAIPipeline } from '../ports/ai-pipeline-port.js';

interface GeneratedReflectionData {
  title: string;
  reflection: string;
  prayer: string;
  action: string;
  shareText: string;
}

// ─── Fallback Templates (used when OpenAI is unreachable) ──────────────────
const FALLBACK_TEMPLATES: Record<SpiritualNeed, Array<{ title: string; reflection: (t: string) => string; prayer: string; action: string }>> = {
  wisdom: [
    { title: 'Luz para tu Código', reflection: (t) => `Al trabajar en ${t}, recuerda que la sabiduría técnica nace de la serenidad. Dios da claridad a tu entendimiento.`, prayer: 'Señor, ilumina mi mente para estructurar soluciones limpias y sabias. Amén.', action: 'Haz una pausa de 60 segundos y toma un vaso de agua.' },
    { title: 'Claridad y Entendimiento', reflection: (t) => `En medio de la complejidad de ${t}, la verdadera inteligencia consiste en reconocer que la luz viene de arriba.`, prayer: 'Señor, dame paciencia y discernimiento para hallar el camino correcto. Amén.', action: 'Respira profundo 3 veces y retoma el código con calma.' }
  ],
  rest: [
    { title: 'Pausa para la Mente', reflection: (t) => `Tu productividad no define tu valor. Tras este tiempo en ${t}, el descanso renueva tus fuerzas.`, prayer: 'Padre, entrego el cansancio mental y permito que tu presencia renueve mis energías. Amén.', action: 'Cierra los ojos 60 segundos y estira los hombros.' },
    { title: 'Renovación y Vigor', reflection: (t) => `Incluso los mejores desarrolladores necesitan pausar. Al trabajar en ${t}, descansa bajo la sombra del Altísimo.`, prayer: 'Señor, renueva mi espíritu y tráeme paz física y mental. Amén.', action: 'Sepárate de la pantalla un minuto.' }
  ],
  peace: [
    { title: 'Serenidad en el Desafío', reflection: (t) => `Los errores en ${t} son pasajeros. No permitas que la prisa robe tu paz.`, prayer: 'Señor, entrego cualquier frustración y me refugio en tu paz. Amén.', action: 'Suelta el teclado, exhala suavemente y confía en el proceso.' },
    { title: 'Paz en la Tormenta Técnica', reflection: (t) => `Cuando las cosas en ${t} no salen al primer intento, la tranquilidad es la clave para la excelencia.`, prayer: 'Padre, dame paz interior para afrontar cualquier error. Amén.', action: 'Tómate 60 segundos para meditar antes de compilar nuevamente.' }
  ],
  hope: [
    { title: 'Renovación de la Esperanza', reflection: (t) => `Cada avance en ${t} forma parte de un propósito mayor. El fruto de tu dedicación traerá bendición.`, prayer: 'Señor, llena mi día de esperanza renaciente y alegría. Amén.', action: 'Agradece por este proyecto y continúa con entusiasmo.' },
    { title: 'Nuevas Perspectivas', reflection: (t) => `No importa cuán difícil parezca ${t}, Dios tiene un futuro de bien para ti.`, prayer: 'Señor, mi esperanza está puesta en ti. Amén.', action: 'Visualiza la meta cumplida y avanza con fe.' }
  ],
  perseverance: [
    { title: 'Constancia que Vence', reflection: (t) => `Grandes sistemas se construyen línea a línea. Al trabajar en ${t}, la constancia supera cualquier obstáculo.`, prayer: 'Señor, fortaléceme para no desmayar y terminar con excelencia. Amén.', action: 'Anota tu próximo objetivo corto y avanza firme.' }
  ],
  courage: [
    { title: 'Valentía para Innovar', reflection: (t) => `Toma decisiones audaces en ${t}. Dios no nos ha dado espíritu de temor, sino de poder y dominio propio.`, prayer: 'Señor, quita todo temor al fallo y llena mi espíritu de valor. Amén.', action: 'Da el siguiente paso con determinación y fe.' }
  ],
  comfort: [
    { title: 'Consuelo y Aliento', reflection: (t) => `Si sientes agobio en ${t}, recuerda que Dios está cercano para consolarte y sostenerte.`, prayer: 'Señor, tú eres mi refugio y el consuelo de mi alma. Amén.', action: 'Permítete sentir su paz e inspira aliento divino.' }
  ],
  joy: [
    { title: 'Gozo en la Creación', reflection: (t) => `Disfruta el proceso de crear en ${t}. El gozo del Señor es la verdadera fortaleza.`, prayer: 'Señor, que tu gozo inunde mi corazón mientras desarrollo. Amén.', action: 'Sonríe, celebra tus logros y sigue compartiendo alegría.' }
  ]
};

// ─── OpenAI-Powered AI Pipeline Adapter ────────────────────────────────────
export class GlooAIPipelineAdapter implements IGlooAIPipeline {
  private openaiKey: string;
  private openaiModel: string;
  private openaiEndpoint = 'https://api.openai.com/v1/chat/completions';

  constructor(apiKey?: string) {
    this.openaiKey = apiKey || process.env.OPENAI_API_KEY || '';
    this.openaiModel = process.env.OPENAI_MODEL || 'gpt-4o-mini';
  }

  /** Clean raw topic strings into human-readable module names */
  private cleanTopic(rawTopic?: string): string {
    if (!rawTopic) return 'este módulo';
    const match = rawTopic.match(/file_([^_\s]+)/i);
    if (match && match[1]) return match[1];
    return rawTopic.replace(/duration_\d+s?/g, '').replace(/[_-]/g, ' ').trim() || 'este proyecto';
  }

  /** Make a request to OpenAI Chat Completions API */
  private async callOpenAI(systemPrompt: string, userPrompt: string): Promise<any | null> {
    if (!this.openaiKey) return null;

    try {
      const response = await fetch(this.openaiEndpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.openaiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.openaiModel,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.9,
          max_tokens: 500,
          response_format: { type: 'json_object' }
        })
      });

      if (response.ok) {
        const data = (await response.json()) as any;
        const content = data.choices?.[0]?.message?.content;
        if (content) {
          return JSON.parse(content);
        }
      } else {
        const errorBody = await response.text().catch(() => '');
        console.warn(`[OpenAI API] HTTP ${response.status}: ${errorBody.substring(0, 200)}`);
      }
    } catch (err: any) {
      console.warn(`[OpenAI API] Error: ${err.message}`);
    }
    return null;
  }

  // ─── Context Classification ────────────────────────────────────────────
  public async classifyContext(event: ContextEvent): Promise<ContextClassification> {
    const systemPrompt = `Eres el Agente de Clasificación Contextual de Presence Platform, una plataforma SaaS de bienestar espiritual para desarrolladores de software.

Tu trabajo es analizar la actividad del usuario y determinar:
1. Si Presence debe intervenir con un momento espiritual (shouldIntervene).
2. El tipo de contexto emocional/espiritual detectado (contextType).
3. La necesidad espiritual primaria (primaryNeed).
4. La urgencia de la intervención (urgency).

Responde EXCLUSIVAMENTE en JSON con esta estructura:
{
  "shouldIntervene": boolean,
  "contextType": "creative_block" | "anxiety" | "weariness" | "celebration" | "frustration" | "loneliness" | "general",
  "primaryNeed": "wisdom" | "rest" | "peace" | "hope" | "perseverance" | "courage" | "comfort" | "joy",
  "urgency": "low" | "medium" | "high",
  "confidence": number (0.0-1.0),
  "reasoning": "breve explicación en español"
}

Reglas:
- Si la duración es >180s, considera "rest" o "perseverance".
- Si hay frustración evidente (errores, stuck, block), considera "peace" o "hope".
- Si parece celebración o logro, usa "joy".
- No intervengas si la actividad sugiere que el usuario está en un buen flujo de trabajo (<60s, sin señales negativas).`;

    const userPrompt = `Actividad: "${event.activity}", Archivo/Tema: "${event.topic || 'ninguno'}", Plataforma: "${event.platform}", Duración sesión: ${event.durationSeconds || 0} segundos, Confianza del sensor: ${event.confidence}`;

    const parsed = await this.callOpenAI(systemPrompt, userPrompt);

    if (parsed && parsed.primaryNeed) {
      console.log(`[OpenAI] ✅ Clasificación GPT: ${parsed.contextType} → ${parsed.primaryNeed} (${parsed.confidence})`);
      return {
        eventId: event.id,
        shouldIntervene: parsed.shouldIntervene ?? true,
        contextType: parsed.contextType || 'creative_block',
        primaryNeed: parsed.primaryNeed || 'wisdom',
        urgency: parsed.urgency || 'medium',
        confidence: parsed.confidence || 0.95,
        reasoning: parsed.reasoning || 'OpenAI GPT Context Classification'
      };
    }

    // ── Fallback: rule-based classification ────────────────────────────
    console.log(`[OpenAI] ⚠️ Fallback a clasificación por reglas`);
    const activityLower = event.activity.toLowerCase();
    const topicLower = (event.topic || '').toLowerCase();

    let primaryNeed: SpiritualNeed = 'wisdom';
    let contextType: ContextClassification['contextType'] = 'creative_block';

    if (topicLower.includes('.py') || topicLower.includes('.ts') || topicLower.includes('.js')) {
      primaryNeed = Math.random() > 0.5 ? 'wisdom' : 'peace';
    } else if (activityLower.includes('editing') || topicLower.includes('block') || topicLower.includes('stuck')) {
      primaryNeed = 'hope';
    } else if (activityLower.includes('music') || topicLower.includes('anxiety') || topicLower.includes('stress')) {
      contextType = 'anxiety'; primaryNeed = 'peace';
    } else if (event.durationSeconds && event.durationSeconds > 180) {
      contextType = 'weariness'; primaryNeed = 'rest';
    } else if (topicLower.includes('joy') || topicLower.includes('thanks')) {
      contextType = 'celebration'; primaryNeed = 'joy';
    } else {
      primaryNeed = (['wisdom', 'rest', 'peace', 'hope', 'perseverance', 'courage'] as SpiritualNeed[])[Math.floor(Math.random() * 6)];
      contextType = 'general';
    }

    return {
      eventId: event.id,
      shouldIntervene: true,
      contextType,
      primaryNeed,
      urgency: 'medium',
      confidence: event.confidence > 0 ? event.confidence : 0.85,
      reasoning: `Fallback classification: ${contextType} → ${primaryNeed}`
    };
  }

  // ─── Reflection Generation (GPT-Powered) ──────────────────────────────
  public async generateReflection(need: SpiritualNeed, scripture: ScriptureMatch, topic?: string): Promise<GeneratedReflectionData> {
    const topicClean = this.cleanTopic(topic);

    const needLabels: Record<SpiritualNeed, string> = {
      wisdom: 'sabiduría', rest: 'descanso', peace: 'paz interior',
      hope: 'esperanza', perseverance: 'perseverancia', courage: 'valentía',
      comfort: 'consuelo', joy: 'gozo y gratitud'
    };

    const systemPrompt = `Eres el Agente de Reflexión Espiritual de Presence Platform. Tu misión es generar un momento de acompañamiento espiritual breve, cálido y genuino para un desarrollador de software.

IMPORTANTE:
- Escribe en ESPAÑOL, con tono pastoral cercano (no formal ni religioso rígido).
- La reflexión debe conectar el versículo bíblico con la experiencia concreta del desarrollador.
- La oración debe ser breve (1-2 frases), íntima, como si hablaras con un amigo.
- La micro-acción debe ser práctica, realizable en 60 segundos.
- El título debe ser creativo, diferente cada vez, máximo 5 palabras.
- NUNCA repitas las mismas frases genéricas. Sé original y específico.

Responde EXCLUSIVAMENTE en JSON:
{
  "title": "Título creativo y breve",
  "reflection": "Reflexión de 2-3 frases conectando el versículo con la situación del desarrollador",
  "prayer": "Oración breve y cercana terminando en Amén",
  "action": "Micro-acción práctica de 60 segundos"
}`;

    const userPrompt = `Necesidad espiritual: ${needLabels[need] || need}
Versículo: "${scripture.text}" (${scripture.reference})
Módulo activo del desarrollador: ${topicClean}
Hora local aproximada: ${new Date().getHours()}:${String(new Date().getMinutes()).padStart(2, '0')}`;

    const parsed = await this.callOpenAI(systemPrompt, userPrompt);

    if (parsed && parsed.reflection) {
      console.log(`[OpenAI] ✅ Reflexión GPT generada: "${parsed.title}"`);
      return {
        title: parsed.title || 'Un Momento con Dios',
        reflection: parsed.reflection,
        prayer: parsed.prayer || 'Señor, acompáñame en este momento. Amén.',
        action: parsed.action || 'Tómate 60 segundos de pausa y respira profundo.',
        shareText: `"${scripture.text}" - ${scripture.reference} via Presence Platform`
      };
    }

    // ── Fallback: dynamic templates ───────────────────────────────────
    console.log(`[OpenAI] ⚠️ Fallback a plantillas dinámicas`);
    const templates = FALLBACK_TEMPLATES[need] || FALLBACK_TEMPLATES.wisdom;
    const selected = templates[Math.floor(Math.random() * templates.length)];

    return {
      title: selected.title,
      reflection: selected.reflection(topicClean),
      prayer: selected.prayer,
      action: selected.action,
      shareText: `"${scripture.text}" - ${scripture.reference} via Presence Platform`
    };
  }

  // ─── Full Experience Builder ──────────────────────────────────────────
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
