# 🕊️ Guía de Integración Paso a Paso: `@presence/sdk`

> **Acompañamiento Espiritual Contextual en Cualquier Aplicación**  
> Aprende a integrar el SDK de Presence Platform en **menos de 5 minutos** en cualquier entorno (React, Next.js, Node.js, Express, Vue, Angular, React Native, Extensiones o Vanilla JavaScript).

---

## 📋 Tabla de Contenidos
1. [Visión General](#-visión-general)
2. [Paso 1: Instalación](#-paso-1-instalación)
3. [Paso 2: Inicialización](#-paso-2-inicialización)
4. [Paso 3: Captura de Eventos de Contexto](#-paso-3-captura-de-eventos-de-contexto)
5. [Paso 4: Estructura de la Respuesta (`ExperienceObject`)](#-paso-4-estructura-de-la-respuesta-experienceobject)
6. [Paso 5: Suscripción a Eventos en Tiempo Real y Feedback](#-paso-5-suscripción-a-eventos-en-tiempo-real-y-feedback)
7. [Ejemplos Prácticos de Código](#-ejemplos-prácticos-de-código)
   - [A. React / Next.js Component](#a-react--nextjs-component)
   - [B. Backend Node.js / Express](#b-backend-nodejs--express)
   - [C. Vanilla JavaScript (Script Tag)](#c-vanilla-javascript-script-tag)
8. [Garantías de Privacidad](#-garantías-de-privacidad)

---

## 💡 Visión General

El SDK `@presence/sdk` evalúa la actividad y ritmo de uso del usuario para discernir proactivamente su necesidad espiritual y mental (`peace`, `wisdom`, `rest`, `hope`, `perseverance`, `courage`, `comfort`, `joy`).

Con **solo 3 líneas de código**, entregas:
- 📖 **Escritura Bíblica Contextual** (Integración YouVersion).
- 💡 **Reflexiones Cálidas y Humanas** (Gloo AI Engine).
- ⏱️ **Micro-Pausas de 60 Segundos**.
- 📲 **Enlaces a Planes Devocionales de YouVersion**.

---

## 📦 Paso 1: Instalación

Agrega `@presence/sdk` a tu proyecto usando tu gestor de paquetes preferido:

```bash
# npm
npm install @presence/sdk

# pnpm
pnpm add @presence/sdk

# yarn
yarn add @presence/sdk
```

---

## 🔑 Paso 2: Inicialización

Inicializa el cliente de Presence una sola vez al arrancar tu aplicación usando `Presence.initialize()`:

```typescript
import { Presence } from '@presence/sdk';

const presence = Presence.initialize({
  apiKey: 'pk_live_tu_api_key', // Tu clave pública o privada de aplicación
  platform: 'custom',           // 'creator' | 'dev' | 'radio' | 'custom'
  debug: true                   // Habilita logs en consola durante desarrollo
});
```

### Opciones de Configuración (`PresenceConfig`):

| Propiedad | Tipo | Requerido | Descripción |
| :--- | :---: | :---: | :--- |
| `apiKey` | `string` | **Sí** | Identificador de tu aplicación o tenant. |
| `platform` | `PlatformType` | No | Canal de origen (`'creator'`, `'dev'`, `'radio'`, `'custom'`). Por defecto: `'custom'`. |
| `debug` | `boolean` | No | Activa la salida detallada en consola (`true`/`false`). |
| `endpointUrl` | `string` | No | URL personalizada de tu backend proxy si aplica. |

---

## ⚡ Paso 3: Captura de Eventos de Contexto

Invoca `presence.capture()` cuando el usuario realice una acción clave, cambie de pantalla, experimente bloqueo o complete una jornada de trabajo:

```typescript
const experience = await presence.capture({
  userId: 'usr_12345',              // Identificador único de usuario (opcional)
  activity: 'creative_design',      // 'coding', 'designing', 'writing', 'listening', etc.
  topic: 'creative_block',          // Tema o reto actual (opcional)
  durationSeconds: 1800,            // Tiempo acumulado en la actividad en segundos
  language: 'es',                   // 'es' (Español) o 'en' (Inglés)
  force: true                       // Fuerza la generación ignorando enfriamientos
});
```

---

## 🔍 Paso 4: Estructura de la Respuesta (`ExperienceObject`)

Si el motor de Gloo AI discierne que es momento oportuno para acompañar al usuario, `presence.capture()` retorna un objeto con el siguiente formato:

```json
{
  "id": "exp_1785361200_a8f9k",
  "need": "peace",
  "title": "Paz que Calma la Mente",
  "scripture": {
    "reference": "Filipenses 4:6-7",
    "text": "Por nada estéis afanosos, sino sean conocidas vuestras peticiones delante de Dios...",
    "version": "RVR1960",
    "url": "https://www.bible.com/bible/149/PHP.4.6-7"
  },
  "reflection": "Los desafíos en tu proyecto son pasajeros. No permitas que la prisa robe tu paz interior.",
  "prayer": "Señor, entrego cualquier preocupación y me refugio en tu paz. Amén.",
  "action": "Exhala suavemente 3 veces y confía en el proceso de Dios.",
  "devotionalUrl": "https://www.bible.com/reading-plans/14022-paz-en-el-trabajo",
  "timestamp": "2026-07-31T03:20:00.000Z"
}
```

---

## 📡 Paso 5: Suscripción a Eventos en Tiempo Real y Feedback

### Escuchar Experiencias Globales (`presence.listen`):
Si deseas actualizar la UI automáticamente en cualquier lugar de tu app cuando se genere una experiencia:

```typescript
const unsubscribe = presence.listen((experience) => {
  console.log('✨ Nueva experiencia discernida:', experience.title);
  // Actualizar tu estado de UI global (Redux, Zustand, React Context, etc.)
});

// Para cancelar la suscripción:
// unsubscribe();
```

### Registrar Feedback de Usuario (`presence.feedback`):
Registra cuando el usuario interactúe con la tarjeta (dar Me Gusta, Guardar, Compartir):

```typescript
await presence.feedback({
  experienceId: experience.id,
  action: 'like', // 'like' | 'bookmark' | 'share' | 'dismiss'
  timestamp: new Date().toISOString()
});
```

---

## 💻 Ejemplos Prácticos de Código

### A. React / Next.js Component

```tsx
import React, { useState, useEffect } from 'react';
import { Presence, ExperienceObject } from '@presence/sdk';

// Inicializar el SDK fuera del renderizado
const presence = Presence.initialize({
  apiKey: 'pk_live_my_react_app',
  platform: 'custom',
  debug: true
});

export const SpiritualReflectionCard: React.FC = () => {
  const [experience, setExperience] = useState<ExperienceObject | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCapture = async (needTopic: string) => {
    setLoading(true);
    try {
      const exp = await presence.capture({
        userId: 'user_react_01',
        activity: 'study_session',
        topic: needTopic,
        language: 'es'
      });
      setExperience(exp);
    } catch (err) {
      console.error('Error al capturar presencia:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', background: '#0F172A', color: '#FFF', borderRadius: '12px' }}>
      <h3>🕊️ Presencia & Acompañamiento</h3>
      <button onClick={() => handleCapture('bloqueo_creativo')} disabled={loading}>
        {loading ? 'Discerniendo...' : '⚡ Pedir Inspiración'}
      </button>

      {experience && (
        <div style={{ marginTop: '16px', background: 'rgba(30,41,59,0.7)', padding: '16px', borderRadius: '8px' }}>
          <h4>{experience.title}</h4>
          <p><strong>📖 {experience.scripture.reference}:</strong> "{experience.scripture.text}"</p>
          <p>💡 {experience.reflection}</p>
          <p>🙏 <em>{experience.prayer}</em></p>
          <p>🎯 <strong>Pausa 60s:</strong> {experience.action}</p>
          {experience.devotionalUrl && (
            <a href={experience.devotionalUrl} target="_blank" rel="noreferrer" style={{ color: '#60A5FA' }}>
              📲 Abrir Plan en YouVersion →
            </a>
          )}
        </div>
      )}
    </div>
  );
};
```

---

### B. Backend Node.js / Express

```typescript
import express from 'express';
import { Presence } from '@presence/sdk';

const app = express();
app.use(express.json());

const presence = Presence.initialize({
  apiKey: 'pk_live_backend_express',
  platform: 'custom'
});

app.post('/api/reflect', async (req, res) => {
  const { userId, activity, topic } = req.body;

  const experience = await presence.capture({
    userId,
    activity: activity || 'general_work',
    topic,
    language: 'es'
  });

  res.json({ success: true, experience });
});

app.listen(4000, () => console.log('Servidor corriendo en http://localhost:4000'));
```

---

### C. Vanilla JavaScript (Browser Script Tag)

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Integración Presence SDK</title>
</head>
<body>
  <button id="btn-reflect">🕊️ Obtener Reflexión</button>
  <div id="output"></div>

  <script type="module">
    import { Presence } from 'https://cdn.jsdelivr.net/npm/@presence/sdk/+esm';

    const presence = Presence.initialize({
      apiKey: 'pk_live_vanilla_js',
      debug: true
    });

    document.getElementById('btn-reflect').addEventListener('click', async () => {
      const exp = await presence.capture({
        activity: 'browsing',
        topic: 'stress',
        language: 'es'
      });

      if (exp) {
        document.getElementById('output').innerHTML = `
          <h3>${exp.title}</h3>
          <p><strong>${exp.scripture.reference}:</strong> "${exp.scripture.text}"</p>
          <p>${exp.reflection}</p>
        `;
      }
    });
  </script>
</body>
</html>
```

---

## 🔒 Garantías de Privacidad

1. **Sin lectura de contenido privado**: Presence **jamás** lee código fuente, correos ni datos personales sensibles del usuario.
2. **Metadata Anónima**: Únicamente se evalúan metadatos no sensibles de la actividad (`activity`, `topic`, `durationSeconds`).
3. **Aislamiento Multi-Tenant**: Las sesiones están completamente aisladas por `apiKey` y `userId`.

---

## 📄 Licencia

MIT License © Team Presence Platform.
