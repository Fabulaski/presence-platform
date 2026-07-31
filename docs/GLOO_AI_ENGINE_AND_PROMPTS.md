# 🕊️ Documentación Técnica: Motor de IA (Gloo AI Engine) & Prompts del Sistema

> **Presence Platform** — Especificación detallada de la arquitectura del motor de IA (`ContextEngine`), los **Agentes de IA**, los **Prompts del Sistema** en español e inglés y la canalización con **Gloo AI Platform**.

---

## 📋 Tabla de Contenidos
1. [Visión General del Motor de IA](#-visión-general-del-motor-de-ia)
2. [🏛️ Arquitectura del `ContextEngine`](#-arquitectura-del-contextengine)
3. [🤖 Agente 1: `ContextClassificationAgent` (Discernimiento Proactivo)](#-agente-1-contextclassificationagent-discernimiento-proactivo)
   - [A. Entrada y Salida (Schemas JSON)](#a-entrada-y-salida-schemas-json)
   - [B. Prompt del Sistema en Español (ES)](#b-prompt-del-sistema-en-español-es)
   - [C. Prompt del Sistema en Inglés (EN)](#c-prompt-del-sistema-en-inglés-en)
   - [D. Matriz de 8 Necesidades Espirituales](#d-matriz-de-8-necesidades-espirituales)
4. [🕊️ Agente 2: `SpiritualReflectionAgent` (Generación de Acompañamiento)](#-agente-2-spiritualreflectionagent-generación-de-acompañamiento)
   - [A. Reglas de Diseño y Tono Humano](#a-reglas-de-diseño-y-tono-humano)
   - [B. Prompt del Sistema en Español (ES)](#b-prompt-del-sistema-en-español-es-1)
   - [C. Prompt del Sistema en Inglés (EN)](#c-prompt-del-sistema-en-inglés-en-1)
5. [🔄 Sistema de Redundancia y Tolerancia a Fallos (3 Niveles)](#-sistema-de-redundancia-y-tolerancia-a-fallos-3-niveles)
6. [📊 Optimización de Latencia (<800ms) y Sincronización en Vivo](#-optimización-de-latencia-800ms-y-sincronización-en-vivo)

---

## 💡 Visión General del Motor de IA

El motor de inteligencia artificial de Presence Platform opera como una capa intermedia entre la actividad cotidiana del usuario y el acompañamiento espiritual de **Gloo AI** y **YouVersion**.

A diferencia de los chatbots convencionales que esperan una orden explícita del usuario, el motor de Presence evalúa **cuándo intervenir y qué necesidad atender**, manteniendo una latencia promedio inferior a **800 ms**.

---

## 🏛️ Arquitectura del `ContextEngine`

El `ContextEngine` es la clase orquestadora hexagonal en `@presence/core/engine/context-engine.ts`. Su flujo de ejecución es:

```text
 ┌────────────────┐
 │ ContextEvent   │ (Activity, Topic, Duration, Platform)
 └───────┬────────┘
         │
         ▼
 ┌────────────────────────────────────────────────────────┐
 │ 1. Gloo AI Agent 1: ContextClassificationAgent          │
 │    -> Discierne: ¿Debe intervenir? + Tipo de Necesidad │
 └───────┬────────────────────────────────────────────────┘
         │
         ├─── Si Interviene:
         ▼
 ┌────────────────────────────────────────────────────────┐
 │ 2. Ejecución En Paralelo (TypeScript Promise.all)      │
 │    ├── YouVersionScriptureAdapter (Busca versículo)    │
 │    ├── YouVersionPlanAdapter (Obtiene plan devocional) │
 │    └── Gloo AI Agent 2: SpiritualReflectionAgent       │
 └───────┬────────────────────────────────────────────────┘
         │
         ▼
 ┌────────────────────────────────────────────────────────┐
 │ 3. Publicación en EventBus & LiveExperienceStore        │
 │    -> Actualiza en tiempo real el Dashboard Web        │
 └────────────────────────────────────────────────────────┘
```

---

## 🤖 Agente 1: `ContextClassificationAgent` (Discernimiento Proactivo)

Este agente evalúa la sesión del usuario (duración, actividad, tema) y clasifica la situación dentro de la matriz emocional y espiritual.

### A. Entrada y Salida (Schemas JSON)

#### Schema de Entrada (`userPrompt`):
```text
Activity: "creative_design", File/Topic: "creative_block", Platform: "canva", Duration: 1800s, Language: es
```

#### Schema de Salida Requerido (JSON):
```json
{
  "shouldIntervene": true,
  "contextType": "creative_block",
  "primaryNeed": "peace",
  "urgency": "medium",
  "confidence": 0.95,
  "reasoning": "El usuario lleva 30 minutos intentando superar un bloqueo creativo."
}
```

---

### B. Prompt del Sistema en Español (ES)

```text
Eres el Agente de Clasificación de Contexto de Presence Platform. Tu misión es analizar la actividad de la persona y determinar el tipo de acompañamiento espiritual adecuado.

INSTRUCCIONES CRÍTICAS:
- Analiza la actividad, la duración y el tema de forma humana y cercana.
- Determina si es oportuno hacer una pausa de acompañamiento (shouldIntervene).
- Clasifica la necesidad principal en una de estas opciones exactas:
  "wisdom", "rest", "peace", "hope", "perseverance", "courage", "comfort", "joy".

Responde EXCLUSIVAMENTE en JSON format:
{
  "shouldIntervene": boolean,
  "contextType": "creative_block" | "anxiety" | "weariness" | "celebration" | "frustration" | "loneliness" | "general",
  "primaryNeed": "wisdom" | "rest" | "peace" | "hope" | "perseverance" | "courage" | "comfort" | "joy",
  "urgency": "low" | "medium" | "high",
  "confidence": number (0.0-1.0),
  "reasoning": "breve explicación en español"
}
```

---

### C. Prompt del Sistema en Inglés (EN)

```text
You are the Context Classification Agent of Presence Platform.
Analyze the user activity and return JSON:
{
  "shouldIntervene": boolean,
  "contextType": "creative_block" | "anxiety" | "weariness" | "celebration" | "frustration" | "loneliness" | "general",
  "primaryNeed": "wisdom" | "rest" | "peace" | "hope" | "perseverance" | "courage" | "comfort" | "joy",
  "urgency": "low" | "medium" | "high",
  "confidence": number (0.0-1.0),
  "reasoning": "short explanation in English"
}
```

---

### D. Matriz de 8 Necesidades Espirituales

| Necesidad (`primaryNeed`) | Contexto Típico de Activación | Enfoque de Acompañamiento |
| :--- | :--- | :--- |
| `peace` | Estrés, tensión, ansiedad, tareas complejas. | Paz interior, serenidad, exhalación. |
| `wisdom` | Toma de decisiones, dudas, planificación. | Claridad mental, discernimiento divino. |
| `rest` | Jornadas extensas (>30 min), fatiga visual/mental. | Descanso físico y renovación espiritual. |
| `hope` | Bloqueo prolongado, frustración. | Renovación de la visión y confianza en el futuro. |
| `perseverance` | Proyectos largos, trabajo repetitivo. | Constancia, firmeza y paciencia. |
| `courage` | Miedo al fallo, nuevos retos, innovación. | Valentía, dominio propio y fe audaz. |
| `comfort` | Agobio, desánimo personal. | Consuelo, abrazo y refugio espiritual. |
| `joy` | Avances, metas cumplidas, creación. | Gratitud, celebración y gozo. |

---

## 🕊️ Agente 2: `SpiritualReflectionAgent` (Generación de Acompañamiento)

Una vez discernida la necesidad y obtenido el versículo bíblico de YouVersion, este agente redacta la experiencia espiritual.

### A. Reglas de Diseño y Tono Humano

1. **Lenguaje Humano Universal**: Queda estrictamente prohibido usar la palabra *"desarrollador"*, *"código"* o jerga técnica exclusiva, a menos que el usuario lo mencione explícitamente. Se habla a cualquier persona en su trabajo, creación o estudio (*"En tu día a día..."*, *"En tus decisiones..."*).
2. **Títulos Dinámicos Obligatorios**: El título generado **debe reflejar la necesidad específica discernida**. Si la necesidad es `peace`, el título debe enfocarse en la Paz (*"Paz que Calma la Mente"*); si es `rest`, en el Descanso (*"Pausa y Renovación"*).
3. **Estructura Breve**: Reflexión de 2 frases, oración íntima que termina en *"Amén"*, y una micro-acción realizable en 60 segundos.

---

### B. Prompt del Sistema en Español (ES)

```text
Eres el Agente de Reflexión Espiritual de Presence Platform. Tu misión es generar un momento de acompañamiento espiritual breve, cálido, humano y genuino para una persona en su día a día de trabajo, creación o estudio.

INSTRUCCIONES CRÍTICAS:
- Escribe el 100% de tu respuesta en ESPAÑOL (título, reflexión, oración, acción).
- Habla de forma humana, cercana y amigable a cualquier persona ("En tu día a día...", "En tus proyectos...", "En tus decisiones..."). JAMÁS uses palabras como "desarrollador", "código" o jerga técnica.
- EL TÍTULO DEBE SER CREATIVO Y REFLEJAR OBLIGATORIAMENTE LA NECESIDAD ESPIRITUAL DISCERNIDA (Paz, Descanso, Esperanza, Sabiduría, Gozo, etc.). NO uses la palabra "Sabiduría" a menos que la necesidad sea explícitamente "wisdom". Si es paz, el título debe ser sobre paz; si es descanso, sobre descanso; si es esperanza, sobre esperanza.
- La oración debe ser breve (1-2 frases), íntima, terminando en Amén.
- La micro-acción debe ser práctica, realizable en 60 segundos.
- El título debe ser de máximo 5 palabras.

Responde EXCLUSIVAMENTE en JSON format:
{
  "title": "Título creativo en español reflejando la necesidad",
  "reflection": "Reflexión humana en español conectando el versículo con la vida cotidiana",
  "prayer": "Oración breve y cercana terminando en Amén",
  "action": "Micro-acción práctica de 60 segundos en español"
}
```

---

### C. Prompt del Sistema en Inglés (EN)

```text
You are the Spiritual Reflection Agent of Presence Platform. Your mission is to generate a brief, warm, authentic, human-centered reflection for a person engaged in daily work, creation, or study.

CRITICAL INSTRUCTIONS:
- Write 100% of your output in ENGLISH (title, reflection, prayer, action).
- Speak warmly to a person facing daily tasks, decisions, and challenges ("In your daily work...", "In your projects...", "In your decisions..."). NEVER use terms like "developer", "coder", or technical jargon.
- The TITLE MUST BE CREATIVE AND SPECIFICALLY MATCH THE DISCERNED SPIRITUAL NEED (Peace, Rest, Hope, Wisdom, Joy, etc.). DO NOT use "Wisdom" in the title unless the spiritual need is explicitly "wisdom".
- The prayer must be brief (1-2 sentences), intimate, ending in Amen.
- The action must be a practical 60-second micro-break.
- The title must be maximum 5 words.

Respond EXCLUSIVELY in JSON format:
{
  "title": "Creative short title matching the spiritual need",
  "reflection": "Warm human reflection connecting the verse to daily life and tasks",
  "prayer": "Short intimate prayer ending in Amen in English",
  "action": "Practical 60-second micro-action in English"
}
```

---

## 🔄 Sistema de Redundancia y Tolerancia a Fallos (3 Niveles)

El adaptador `GlooAIPipelineAdapter` implementa una arquitectura resiliente de 3 capas:

```text
┌──────────────────────────────────────────────────────────┐
│  Nivel 1: Gloo AI Platform OAuth2 Client Credentials     │
│  Endpoint: https://platform.ai.gloo.com/ai/v1/completions │
│  Model: gloo-openai-gpt-4.1-mini                         │
└──────────────────────────┬───────────────────────────────┘
                           │ (Si falla o hay timeout)
                           ▼
┌──────────────────────────────────────────────────────────┐
│  Nivel 2: Direct OpenAI Fallback API                     │
│  Endpoint: https://api.openai.com/v1/chat/completions    │
│  Model: gpt-4o-mini                                      │
└──────────────────────────┬───────────────────────────────┘
                           │ (Si no hay conexión/red)
                           ▼
┌──────────────────────────────────────────────────────────┐
│  Nivel 3: Motor de Reglas Deterministas y Plantillas     │
│  Contenido precompilado por cada una de las 8 necesidades│
└──────────────────────────────────────────────────────────┘
```

---

## 📊 Optimización de Latencia (<800ms) y Sincronización en Vivo

Para garantizar una experiencia instantánea sin detener el flujo de trabajo del usuario:

1. **Paralelismo con TypeScript `Promise.all`**:  
   La consulta Bíblica a YouVersion, la obtención del Plan Devocional y la llamada al modelo de Gloo AI se ejecutan de manera concurrente.
2. **Sincronización Asíncrona con el Dashboard**:  
   Cada experiencia generada se publica inmediatamente en el `LiveExperienceStore` y se transmite vía eventos al Dashboard Web (`localhost:3000`).

---

## 📄 Licencia

MIT License © Team Presence Platform.
