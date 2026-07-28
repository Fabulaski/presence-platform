# 🕊️ Presence Platform — Contextual Scripture Infrastructure

> **Eslogan**: *Scripture where people already are.* (La Escritura donde la gente ya está).

[![Monorepo](https://img.shields.io/badge/Monorepo-Turborepo-blue?style=flat-square&logo=turborepo)](https://turbo.build/)
[![Package Manager](https://img.shields.io/badge/Package%20Manager-pnpm%209-orange?style=flat-square&logo=pnpm)](https://pnpm.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![OpenAPI](https://img.shields.io/badge/OpenAPI-3.1-green?style=flat-square&logo=openapi-initiative)](https://spec.openapis.org/oas/v3.1.0)
[![Prisma](https://img.shields.io/badge/ORM-Prisma-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io/)
[![Supabase](https://img.shields.io/badge/Database-Supabase-3ECF8E?style=flat-square&logo=supabase)](https://supabase.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](LICENSE)

---

## 💡 Visión del Producto

**Presence Platform** es una infraestructura/plataforma SaaS B2B2C desacoplada (**Minimum Marketable Product - MMP**) que permite a cualquier aplicación de terceros incorporar experiencias espirituales contextuales mediante una **API REST de alto rendimiento** y un **SDK cliente en TypeScript**.

En lugar de requerir que el usuario abra intencionalmente una app de la Biblia, Presence lleva la Escritura exactamente al contexto donde la persona ya pasa su tiempo:
- 🎬 **Creadores de contenido** editando Reels o videos al experimentar bloqueo creativo.
- 📻 **Oyentes de radio/audio** escuchando música cristiana en momentos de ansiedad.
- 💻 **Desarrolladores** programando en su IDE durante maratones de código.

---

## 🏛️ Arquitectura Hexagonal y Event-Driven

Presence se rige por **3 Principios Fundamentales**:
1. **El núcleo es el contexto**, no la búsqueda manual.
2. **Presence no predica, acompaña**: Posee un motor de discernimiento que evalúa si debe o **NO** intervenir (evitando spam o interrupciones innecesarias).
3. **Grafo Espiritual de Crecimiento**: En lugar de guardar chats olvidados, registra el crecimiento por **Capítulos** (*Ansiedad → Paz → Esperanza → Servicio*).

```text
                  Presence Platform Architecture
┌─────────────────────────────────────────────────────────────────┐
│                      Clients & Demos                            │
│  @presence/sdk  •  @presence/cli  •  @presence/widget           │
│  apps/creator-demo  •  apps/radio-demo  •  apps/dev-demo        │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    API Gateway & Events                         │
│  apps/api (OpenAPI 3.1 & Scalar /docs)                          │
│  @presence/events (PresenceEventBus / Domain Events)            │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│               Core Hexagonal Engine (@presence/core)            │
│  ContextEngine  •  DiscernmentEvaluator  •  SpiritualGraph      │
└─────────────────────────────────────────────────────────────────┘
                 │                             │
                 ▼                             ▼
┌──────────────────────────────┐ ┌──────────────────────────────┐
│  YouVersion Scripture Port   │ │   Gloo AI Multi-Agent Port   │
│  (YouVersionScriptureAdapter)│ │   (GlooAIPipelineAdapter)    │
└──────────────────────────────┘ └──────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│               Data Persistence (@presence/database)             │
│  Prisma ORM  •  Supabase PostgreSQL (11 Relational Tables)      │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📦 Estructura del Monorepo

```text
presence-platform/
├── apps/
│   ├── api/          # REST API Server Express (OpenAPI 3.1 + Scalar GUI /docs)
│   ├── web/          # Landing Page, Mission Control Dashboard y Presence Studio
│   ├── widget/       # Componente embebible en HTML/JS (Script tag)
│   ├── creator-demo/ # Demo interactiva para editores de contenido/reels
│   ├── radio-demo/   # Demo interactiva para reproductores de streaming cristiano
│   └── dev-demo/     # Demo interactiva para integraciones en IDE (VS Code)
│
├── packages/
│   ├── types/        # Value Objects, DTOs y Agregados DDD
│   ├── events/       # Event Bus asíncrono (PresenceEventBus)
│   ├── core/         # Context Engine Hexagonal + Puertos YouVersion & Gloo AI
│   ├── sdk/          # SDK oficial cliente en TypeScript
│   ├── database/     # Prisma Schema (11 tablas relacionales) & cliente Supabase
│   └── cli/          # Herramienta CLI de integración (presence-cli / npx presence)
│
├── architecture/     # Especificación técnica C4 (Nivel 1, 2 y 3 en Mermaid)
├── pitch/            # Guión y estructura de presentación para el jurado
├── .github/          # Workflows de GitHub Actions (CI/CD Pipeline)
├── Dockerfile        # Containerización multi-etapa para producción
└── docker-compose.yml# Orquestación con PostgreSQL 16
```

---

## 🚀 Inicio Rápido

### Requisitos Previos
- **Node.js**: `>= 18.0.0`
- **pnpm**: `>= 9.0.0` (`npm i -g pnpm`)

### Instalación y Compilación
```bash
# 1. Clonar el repositorio
git clone https://github.com/Fabulaski/presence-platform.git
cd presence-platform

# 2. Instalar dependencias del monorepo
pnpm install

# 3. Generar el cliente de Prisma para la base de datos
pnpm --filter @presence/database db:generate

# 4. Compilar todos los paquetes y aplicaciones (Turborepo)
pnpm build
```

---

## 🛠️ Uso del SDK de TypeScript

Integrar Presence en cualquier aplicación requiere únicamente 3 líneas de código:

```typescript
import { Presence } from '@presence/sdk';

// 1. Inicializar el SDK
const presence = Presence.initialize({
  apiKey: 'pk_live_mi_app_key',
  platform: 'creator',
  debug: true
});

// 2. Capturar un evento de contexto
const experience = await presence.capture({
  userId: 'usr_123',
  activity: 'editing_reel',
  topic: 'creative_block'
});

// 3. Renderizar la experiencia espiritual discernida
if (experience) {
  console.log('📌 Título:', experience.title);
  console.log('📖 Versículo:', experience.scripture.reference, `"${experience.scripture.text}"`);
  console.log('💡 Reflexión:', experience.reflection);
  console.log('🎯 Acción:', experience.action);
}
```

---

## 💻 CLI de Presence (`@presence/cli`)

Prueba el estado de la infraestructura o simula respuestas directamente en tu terminal:

```bash
# Estado de la plataforma
node packages/cli/dist/index.js status

# Simular captura de contexto
node packages/cli/dist/index.js test-context editing_reel creative_block

# Inicializar un nuevo proyecto
node packages/cli/dist/index.js init mi-app-cristiana
```

---

## 📻 Ejecución de las Aplicaciones Demo

```bash
# Demo Creadores (Edición de Video / Reels)
pnpm --filter @presence/creator-demo dev

# Demo Radio (Streaming de Audio / Adoración)
pnpm --filter @presence/radio-demo dev

# Demo Dev (VS Code / Marathon de Código)
pnpm --filter @presence/dev-demo dev

# Dashboard & Presence Studio Web Platform
pnpm --filter @presence/web dev
```

---

## 📖 Documentación Adicional

- 📐 [Diagramas de Arquitectura C4](architecture/c4-architecture.md)
- 🏆 [Guión y Diapositivas de Pitch para el Jurado](pitch/hackathon-pitch.md)
- 🔌 Especificación OpenAPI 3.1: `/openapi.json`
- 🖥️ Interfaz de Documentación Interactiva Scalar: `/docs`

---

## 📄 Licencia

Este proyecto está bajo la Licencia **MIT**. Consulta el archivo `LICENSE` para más detalles.
