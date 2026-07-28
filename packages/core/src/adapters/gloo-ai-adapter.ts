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
const FALLBACK_TEMPLATES_ES: Record<SpiritualNeed, Array<{ title: string; reflection: (t: string) => string; prayer: string; action: string }>> = {
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

const FALLBACK_TEMPLATES_EN: Record<SpiritualNeed, Array<{ title: string; reflection: (t: string) => string; prayer: string; action: string }>> = {
  wisdom: [
    { title: 'Light for Your Code', reflection: (t) => `As you work on ${t}, remember that technical wisdom springs from serenity. God grants clarity to your understanding.`, prayer: 'Lord, illuminate my mind to structure clean and wise solutions. Amen.', action: 'Take a 60-second pause and drink a glass of water.' },
    { title: 'Clarity and Understanding', reflection: (t) => `Amid the complexity of ${t}, true intelligence is recognizing that light comes from above.`, prayer: 'Lord, give me patience and discernment to find the right path. Amen.', action: 'Take 3 deep breaths and return to coding calmly.' }
  ],
  rest: [
    { title: 'Pause for the Mind', reflection: (t) => `Your productivity does not define your worth. After working on ${t}, rest renews your strength.`, prayer: 'Father, I surrender mental fatigue and let Your presence refresh my energy. Amen.', action: 'Close your eyes for 60 seconds and stretch your shoulders.' },
    { title: 'Renewal and Vigor', reflection: (t) => `Even the best developers need to pause. Working on ${t}, rest under the shadow of the Most High.`, prayer: 'Lord, renew my spirit and bring physical and mental peace. Amen.', action: 'Step away from the screen for one minute.' }
  ],
  peace: [
    { title: 'Serenity in the Challenge', reflection: (t) => `Errors in ${t} are temporary. Do not let rush steal your peace.`, prayer: 'Lord, I surrender all frustration and rest in Your peace. Amen.', action: 'Release the keyboard, exhale softly, and trust the process.' },
    { title: 'Peace in the Technical Storm', reflection: (t) => `When things in ${t} do not work on the first try, calm is the key to excellence.`, prayer: 'Father, grant me inner peace to face any error. Amen.', action: 'Take 60 seconds to meditate before compiling again.' }
  ],
  hope: [
    { title: 'Renewal of Hope', reflection: (t) => `Every step forward in ${t} is part of a greater purpose. Your dedication will bring blessing.`, prayer: 'Lord, fill my day with renewed hope and joy. Amen.', action: 'Be thankful for this project and continue with enthusiasm.' },
    { title: 'Fresh Perspectives', reflection: (t) => `No matter how difficult ${t} seems, God has a future of good for you.`, prayer: 'Lord, my hope is anchored in You. Amen.', action: 'Visualize the goal accomplished and move forward in faith.' }
  ],
  perseverance: [
    { title: 'Perseverance Overcomes', reflection: (t) => `Great systems are built line by line. Working on ${t}, constancy overcomes any obstacle.`, prayer: 'Lord, strengthen me so I do not grow weary and finish with excellence. Amen.', action: 'Write down your next short goal and move forward firmly.' }
  ],
  courage: [
    { title: 'Courage to Innovate', reflection: (t) => `Make bold decisions in ${t}. God has not given us a spirit of fear, but of power and sound mind.`, prayer: 'Lord, remove all fear of failure and fill my spirit with courage. Amen.', action: 'Take the next step with determination and faith.' }
  ],
  comfort: [
    { title: 'Comfort and Encouragement', reflection: (t) => `If you feel overwhelmed in ${t}, remember God is near to comfort and uphold you.`, prayer: 'Lord, You are my refuge and the comfort of my soul. Amen.', action: 'Allow yourself to feel His peace and draw fresh breath.' }
  ],
  joy: [
    { title: 'Joy in Creation', reflection: (t) => `Enjoy the process of creating in ${t}. The joy of the Lord is your true strength.`, prayer: 'Lord, let Your joy fill my heart as I build. Amen.', action: 'Smile, celebrate your progress, and share joy.' }
  ]
};

// ─── Gloo AI Platform-Powered AI Pipeline Adapter ──────────────────────────
export class GlooAIPipelineAdapter implements IGlooAIPipeline {
  private glooClientId: string;
  private glooClientSecret: string;
  private glooTokenUrl: string;
  private glooEndpoint: string;
  private glooModel: string;

  private cachedAccessToken: string | null = null;
  private tokenExpiryTime: number = 0;

  private openaiKey: string;
  private openaiModel: string;
  private openaiEndpoint = 'https://api.openai.com/v1/chat/completions';

  constructor(clientId?: string, clientSecret?: string) {
    this.glooClientId = clientId || process.env.GLOO_CLIENT_ID || '2jhf906bcnngiugsengi7v6nnq';
    this.glooClientSecret = clientSecret || process.env.GLOO_CLIENT_SECRET || '6amjvb3vuo3lboeq1lhmrh5utbiqob4n8v9t5h60fmglqujgvrs';
    this.glooTokenUrl = process.env.GLOO_TOKEN_URL || 'https://platform.ai.gloo.com/oauth2/token';
    this.glooEndpoint = process.env.GLOO_ENDPOINT || 'https://platform.ai.gloo.com/ai/v1/chat/completions';
    this.glooModel = process.env.GLOO_MODEL || 'gloo-qwen-3.7-flash';

    this.openaiKey = process.env.OPENAI_API_KEY || '';
    this.openaiModel = process.env.OPENAI_MODEL || 'gpt-4o-mini';
  }

  /** Safely parse JSON from raw LLM text outputs (stripping markdown codeblocks if present) */
  private extractJSON(text?: string): any | null {
    if (!text) return null;
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch (e) {}
    }
    try {
      return JSON.parse(text);
    } catch (e) {
      return null;
    }
  }

  /** Retrieve or refresh OAuth2 Access Token from Gloo AI Platform */
  private async getGlooAccessToken(): Promise<string | null> {
    if (this.cachedAccessToken && Date.now() < this.tokenExpiryTime - 60000) {
      return this.cachedAccessToken;
    }

    if (!this.glooClientId || !this.glooClientSecret) {
      return null;
    }

    try {
      const rawAuth = `${this.glooClientId}:${this.glooClientSecret}`;
      const basicAuth = typeof Buffer !== 'undefined'
        ? Buffer.from(rawAuth).toString('base64')
        : (typeof btoa === 'function' ? btoa(rawAuth) : '');

      const response = await fetch(this.glooTokenUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${basicAuth}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'grant_type=client_credentials&scope=api/access'
      });

      if (response.ok) {
        const data = (await response.json()) as any;
        if (data && data.access_token) {
          this.cachedAccessToken = data.access_token;
          const expiresInSeconds = data.expires_in || 3600;
          this.tokenExpiryTime = Date.now() + expiresInSeconds * 1000;
          console.log('[Gloo AI OAuth2] ✅ Token obtained successfully (expires in ' + expiresInSeconds + 's)');
          return this.cachedAccessToken;
        }
      } else {
        const errText = await response.text().catch(() => '');
        console.warn(`[Gloo AI OAuth2] Token error HTTP ${response.status}: ${errText.substring(0, 200)}`);
      }
    } catch (err: any) {
      console.warn(`[Gloo AI OAuth2] Exception during token fetch: ${err.message}`);
    }

    return null;
  }

  /** Clean raw topic strings into human-readable module names */
  private cleanTopic(rawTopic?: string): string {
    if (!rawTopic) return 'this module';
    const match = rawTopic.match(/file_([^_\s]+)/i);
    if (match && match[1]) return match[1];
    return rawTopic.replace(/duration_\d+s?/g, '').replace(/[_-]/g, ' ').trim() || 'this project';
  }

  /** Make a request to Gloo AI Platform API (with OpenAI fallback) */
  private async callGlooAI(systemPrompt: string, userPrompt: string): Promise<any | null> {
    const accessToken = await this.getGlooAccessToken();

    if (accessToken) {
      try {
        console.log(`[Gloo AI Engine] Requesting model: "${this.glooModel}"`);
        const response = await fetch(this.glooEndpoint, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: this.glooModel,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt }
            ],
            temperature: 0.7,
            max_tokens: 500
          })
        });

        if (response.ok) {
          const data = (await response.json()) as any;
          const content = data.choices?.[0]?.message?.content;
          if (content) {
            const parsed = this.extractJSON(content);
            if (parsed) {
              console.log(`[Gloo AI Engine] ✅ Model output received from ${this.glooModel}`);
              return parsed;
            }
          }
        } else {
          const errorBody = await response.text().catch(() => '');
          console.warn(`[Gloo AI Engine] HTTP ${response.status}: ${errorBody.substring(0, 200)}`);
        }
      } catch (err: any) {
        console.warn(`[Gloo AI Engine] Error calling Gloo API: ${err.message}`);
      }
    }

    // ── Fallback to OpenAI Chat Completions API ──────────────────────────
    if (this.openaiKey) {
      try {
        console.log(`[OpenAI Fallback] Requesting model: "${this.openaiModel}"`);
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
        }
      } catch (err: any) {
        console.warn(`[OpenAI Fallback] Error: ${err.message}`);
      }
    }

    return null;
  }

  // ─── Context Classification ────────────────────────────────────────────
  public async classifyContext(event: ContextEvent): Promise<ContextClassification> {
    const lang = event.language || 'es';
    const isEn = lang === 'en';

    const systemPrompt = isEn
      ? `You are the Context Classification Agent of Presence Platform, a SaaS spiritual wellness platform for software developers.
Analyze the user activity and return JSON:
{
  "shouldIntervene": boolean,
  "contextType": "creative_block" | "anxiety" | "weariness" | "celebration" | "frustration" | "loneliness" | "general",
  "primaryNeed": "wisdom" | "rest" | "peace" | "hope" | "perseverance" | "courage" | "comfort" | "joy",
  "urgency": "low" | "medium" | "high",
  "confidence": number (0.0-1.0),
  "reasoning": "short explanation in English"
}`
      : `Eres el Agente de Clasificación Contextual de Presence Platform. Analiza la actividad y responde en JSON:
{
  "shouldIntervene": boolean,
  "contextType": "creative_block" | "anxiety" | "weariness" | "celebration" | "frustration" | "loneliness" | "general",
  "primaryNeed": "wisdom" | "rest" | "peace" | "hope" | "perseverance" | "courage" | "comfort" | "joy",
  "urgency": "low" | "medium" | "high",
  "confidence": number (0.0-1.0),
  "reasoning": "breve explicación en español"
}`;

    const userPrompt = `Activity: "${event.activity}", File/Topic: "${event.topic || 'none'}", Platform: "${event.platform}", Duration: ${event.durationSeconds || 0}s, Language: ${lang}`;

    const parsed = await this.callGlooAI(systemPrompt, userPrompt);

    if (parsed && parsed.primaryNeed) {
      console.log(`[OpenAI] ✅ GPT Classification (${lang}): ${parsed.contextType} → ${parsed.primaryNeed}`);
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
    console.log(`[OpenAI] ⚠️ Fallback to rule-based classification (${lang})`);
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
  public async generateReflection(need: SpiritualNeed, scripture: ScriptureMatch, topic?: string, language?: string): Promise<GeneratedReflectionData> {
    const topicClean = this.cleanTopic(topic);
    const lang = language || 'es';
    const isEn = lang === 'en';

    const LANG_LABELS: Record<string, Record<SpiritualNeed, string>> = {
      es: { wisdom: 'sabiduría', rest: 'descanso', peace: 'paz interior', hope: 'esperanza', perseverance: 'perseverancia', courage: 'valentía', comfort: 'consuelo', joy: 'gozo y gratitud' },
      en: { wisdom: 'wisdom', rest: 'rest', peace: 'inner peace', hope: 'hope', perseverance: 'perseverance', courage: 'courage', comfort: 'comfort', joy: 'joy and gratitude' },
      pt: { wisdom: 'sabedoria', rest: 'descanso', peace: 'paz interior', hope: 'esperança', perseverance: 'perseverança', courage: 'coragem', comfort: 'consolo', joy: 'alegria e gratidão' }
    };
    const needLabels = LANG_LABELS[lang] || LANG_LABELS['es'];

    const systemPrompt = isEn
      ? `You are the Spiritual Reflection Agent of Presence Platform. Your mission is to generate a brief, warm, authentic pastoral reflection for a software developer.

CRITICAL INSTRUCTIONS:
- Write 100% of your output in ENGLISH (title, reflection, prayer, action).
- Connect the Bible verse directly to the developer's current coding task/file.
- The prayer must be brief (1-2 sentences), intimate, ending in Amen.
- The action must be a practical 60-second micro-break.
- The title must be creative, in ENGLISH, unique every time, maximum 5 words.

Respond EXCLUSIVELY in JSON format:
{
  "title": "Creative short title in English",
  "reflection": "Reflection in English connecting the verse to the software developer",
  "prayer": "Short intimate prayer ending in Amen in English",
  "action": "Practical 60-second micro-action in English"
}`
      : `Eres el Agente de Reflexión Espiritual de Presence Platform. Tu misión es generar un momento de acompañamiento espiritual breve, cálido y genuino para un desarrollador de software.

INSTRUCCIONES CRÍTICAS:
- Escribe el 100% de tu respuesta en ESPAÑOL (título, reflexión, oración, acción).
- La reflexión debe conectar el versículo bíblico con la experiencia concreta del desarrollador.
- La oración debe ser breve (1-2 frases), íntima, terminando en Amén.
- La micro-acción debe ser práctica, realizable en 60 segundos.
- El título debe ser creativo, en ESPAÑOL, diferente cada vez, máximo 5 palabras.

Responde EXCLUSIVAMENTE en JSON format:
{
  "title": "Título creativo y breve en español",
  "reflection": "Reflexión en español conectando el versículo con el desarrollador",
  "prayer": "Oración breve y cercana terminando en Amén",
  "action": "Micro-acción práctica de 60 segundos en español"
}`;

    const userPrompt = isEn
      ? `Spiritual need: ${needLabels[need] || need}
Verse: "${scripture.text}" (${scripture.reference})
Developer's active file/module: ${topicClean}
Target language: ENGLISH
Local time: ${new Date().getHours()}:${String(new Date().getMinutes()).padStart(2, '0')}`
      : `Necesidad espiritual: ${needLabels[need] || need}
Versículo: "${scripture.text}" (${scripture.reference})
Módulo activo del desarrollador: ${topicClean}
Idioma objetivo: ESPAÑOL
Hora local: ${new Date().getHours()}:${String(new Date().getMinutes()).padStart(2, '0')}`;

    const parsed = await this.callGlooAI(systemPrompt, userPrompt);

    if (parsed && parsed.reflection) {
      console.log(`[OpenAI] ✅ GPT Reflection generated (${lang}): "${parsed.title}"`);
      return {
        title: parsed.title || (isEn ? 'A Moment with God' : 'Un Momento con Dios'),
        reflection: parsed.reflection,
        prayer: parsed.prayer || (isEn ? 'Lord, abide with me in this moment. Amen.' : 'Señor, acompáñame en este momento. Amén.'),
        action: parsed.action || (isEn ? 'Take a 60-second pause and breathe deeply.' : 'Tómate 60 segundos de pausa y respira profundo.'),
        shareText: `"${scripture.text}" - ${scripture.reference} via Presence Platform`
      };
    }

    // ── Fallback: localized dynamic templates ──────────────────────────
    console.log(`[OpenAI] ⚠️ Fallback to localized templates (${lang})`);
    const catalog = isEn ? FALLBACK_TEMPLATES_EN : FALLBACK_TEMPLATES_ES;
    const templates = catalog[need] || catalog.wisdom;
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
    const generated = await this.generateReflection(classification.primaryNeed, scripture, event.topic, event.language);

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
