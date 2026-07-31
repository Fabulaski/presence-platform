# 🕊️ Presence Platform — Contextual Scripture Infrastructure

> **Eslogan**: *Scripture in New Frontiers — La Escritura donde la gente ya está.*

[![Monorepo](https://img.shields.io/badge/Monorepo-Turborepo-blue?style=flat-square&logo=turborepo)](https://turbo.build/)
[![Package Manager](https://img.shields.io/badge/Package%20Manager-pnpm%209-orange?style=flat-square&logo=pnpm)](https://pnpm.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Gloo AI Platform](https://img.shields.io/badge/AI%20Engine-Gloo%20AI%20Platform-8B5CF6?style=flat-square)](https://platform.ai.gloo.com/)
[![YouVersion API](https://img.shields.io/badge/Devotionals-YouVersion-E11D48?style=flat-square)](https://www.youversion.com/)
[![OpenAPI](https://img.shields.io/badge/OpenAPI-3.1-green?style=flat-square&logo=openapi-initiative)](https://spec.openapis.org/oas/v3.1.0)
[![Docker](https://img.shields.io/badge/Docker-Supported-2496ED?style=flat-square&logo=docker)](https://www.docker.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](LICENSE)

---

## 💡 Visión del Producto

**Presence Platform** es una infraestructura/plataforma B2B2C desacoplada (**Minimum Marketable Product - MMP**) que permite a cualquier aplicación de terceros incorporar experiencias espirituales contextuales mediante una **API REST de alto rendimiento**, un **SDK cliente en TypeScript**, un motor de IA impulsado por **Gloo AI Platform**, **YouVersion Devotional Plans**, una **Extensión Oficial para VS Code**, una **Extensión para Canva** y una **Extensión para Google Chrome**.

En lugar de requerir que el usuario abra intencionalmente una app de la Biblia, Presence lleva la Escritura de forma cálida, humana y respetuosa exactamente al flujo de trabajo donde la persona ya pasa su tiempo:
- 🎨 **Diseñadores y Creadores en Canva** al experimentar bloqueo creativo o desgaste.
- 🌐 **Navegantes en Google Chrome** según el tiempo de inactividad o temas detectados.
- 💻 **Personas programando en VS Code** durante extensas jornadas de trabajo o estudio.
- 📻 **Oyentes de audio y streaming** en momentos de ansiedad o búsqueda de descanso.

---

## 🏛️ Arquitectura Hexagonal y Event-Driven

Presence se rige por **3 Principios Fundamentales**:
1. **El núcleo es el contexto**, no la búsqueda manual.
2. **Presence no predica, acompaña de forma humana**: Posee un motor de discernimiento impulsado por **Gloo AI** que evalúa las necesidades espirituales y mentales (`peace`, `wisdom`, `rest`, `hope`, `perseverance`, `courage`, `comfort`, `joy`) con un tono amigable, cálido y libre de tecnicismos.
3. **Identificación y Aislamiento Multi-Tenant**: Cada desarrollador o usuario cuenta con una sesión única (`machineId` / `devId`) que aísla sus estadísticas e historial personal en tiempo real.

```text
                  Presence Platform Architecture
┌─────────────────────────────────────────────────────────────────┐
│                      Clients & Extensions                       │
│  @presence/sdk  •  apps/vscode-extension  •  apps/canva-app       │
│  apps/chrome-extension  •  apps/creator-demo  •  @presence/cli   │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    API Gateway & Live Stream                    │
│  apps/api (OpenAPI 3.1 & Scalar GUI /docs)                      │
│  apps/web (Mission Control Dashboard & Presence Studio)         │
│  @presence/events (PresenceEventBus / Domain Events)            │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│               Core Hexagonal Engine (@presence/core)            │
│  ContextEngine  •  LiveExperienceStore  •  SpiritualGraph       │
└─────────────────────────────────────────────────────────────────┘
                 │                             │
                 ▼                             ▼
┌──────────────────────────────┐ ┌──────────────────────────────┐
│  YouVersion Scripture Port   │ │     Gloo AI Platform Port    │
│  (YouVersionScriptureAdapter)│ │ (GlooAIPipelineAdapter)      │
│                              │ │ Model: gloo-openai-gpt-4.1   │
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
│   ├── api/               # REST API Server Express (OpenAPI 3.1 + Scalar GUI /docs) [Puerto 3001]
│   ├── web/               # Mission Control Dashboard y Presence Studio Web Platform [Puerto 3000]
│   ├── vscode-extension/  # Extensión Oficial para VS Code (Empaquetada .vsix autónoma)
│   ├── canva-app/         # App Oficial de Canva (Sidebar & Inserción en Lienzo)
│   ├── canva-extension/   # Backend de Integración para Canva [Puerto 3005]
│   ├── chrome-extension/  # Extensión para Chrome (Manifest V3, Notificaciones y SidePanel)
│   ├── widget/            # Componente embebible en HTML/JS (Script tag)
│   ├── creator-demo/      # Demo interactiva para editores de contenido/reels
│   ├── radio-demo/        # Demo interactiva para streaming de audio cristiano
│   └── dev-demo/          # Demo interactiva para integraciones en IDE
│
├── packages/
│   ├── types/             # Value Objects, DTOs y Agregados DDD
│   ├── events/            # Event Bus asíncrono (PresenceEventBus)
│   ├── core/              # Context Engine Hexagonal, LiveStore + Puertos YouVersion & Gloo AI
│   ├── sdk/               # SDK oficial cliente en TypeScript
│   ├── database/          # Prisma Schema (11 tablas relacionales) & cliente Supabase
│   └── cli/               # Herramienta CLI de integración (presence-cli / npx presence)
│
├── Dockerfile             # Containerización multi-etapa para producción
├── docker-compose.yml     # Orquestación de servicios en producción (Puertos 3000, 3001, 3005)
└── render.yaml            # Blueprint de despliegue en 1-clic para Render.com / Railway
```

---

## 🌐 Endpoints de la API Backend

La aplicación `apps/api` expone la especificación **OpenAPI 3.1** y una documentación gráfica interactiva accesible en tiempo real:

| Endpoint | Método | Descripción |
| :--- | :---: | :--- |
| `http://localhost:3001/docs` | `GET` | **Documentación Interactiva (Scalar GUI)** para explorar la API. |
| `http://localhost:3001/openapi.json` | `GET` | Especificación completa **OpenAPI 3.1** en formato JSON. |
| `http://localhost:3001/health` | `GET` | Estado de salud e información del servidor (`{"status": "ok"}`). |
| `http://localhost:3001/api/v1/context` | `POST` | Captura eventos de contexto y ejecuta el discernimiento de Gloo AI. |
| `http://localhost:3001/api/v1/experience` | `POST` | Sincroniza experiencias espirituales con el Dashboard en vivo. |

```bash
# Iniciar el Backend de la API y Documentación
pnpm --filter @presence/api dev
```

---

## 🐳 Despliegue en Producción (Docker & Nube)

Presence Platform está listo para desplegarse en producción mediante **Docker** o servicios PaaS en la nube en 1 solo clic.

### Opción A: Despliegue con Docker Compose (Recomendado para Servidores/VPS)

Con un solo comando se compila el monorepo y se levantan automáticamente todos los servicios en contenedores aislados:

```bash
# 1. Clonar el repositorio
git clone https://github.com/Fabulaski/presence-platform.git
cd presence-platform

# 2. Levantar todos los servicios en segundo plano con Docker Compose
docker compose up -d
```

**Servicios orquestados por Docker**:
- **Dashboard Web & Studio**: `http://localhost:3000`
- **API REST & Scalar Docs**: `http://localhost:3001`
- **Canva Backend Extension**: `http://localhost:3005`

### Opción B: Despliegue en 1-Clic en la Nube (Render.com / Railway.app)

El archivo [`render.yaml`](file:///d:/Desarrollo/Presense_os/render.yaml) permite conectar tu repositorio de GitHub directamente a Render o Railway. Al hacer `git push`, la nube desplegará los microservicios con **SSL/HTTPS gratuito** y dominios públicos automáticos.

---

## 💻 Extensión Oficial de VS Code (`apps/vscode-extension`)

Presence incluye una extensión empaquetada para Visual Studio Code con el icono oficial de la palomita en formato squircle azul, categoría de **Productividad** y documentación completa:

### Instalación rápida en VS Code:
```bash
code --install-extension apps/vscode-extension/presence-vscode-extension-1.0.0.vsix
```

### Funcionalidades:
- **Barra de Estado**: Muestra el indicador `❤️ Presence: Activo`.
- **Paleta de Comandos** (`Ctrl + Shift + P`):
  - `Presence: Capture Context & Reflect`: Discierne la necesidad actual e inspira con versículos de YouVersion.
  - `Presence: Open Mission Control Dashboard`: Abre el panel personalizado en el navegador.

---

## 🤖 Integración en Vivo con Gloo AI Platform & YouVersion

- **Gloo AI Platform API**: Autenticación OAuth2 Client Credentials con el modelo `gloo-openai-gpt-4.1-mini`. Realiza el **Discernimiento Proactivo de Actividad**, clasificando 8 necesidades espirituales principales (`wisdom`, `peace`, `rest`, `hope`, `perseverance`, `courage`, `comfort`, `joy`) con reflexiones cálidas y humanas.
- **YouVersion Platform API**: Consultas bíblicas dinámicas y enlaces directos a Planes Devocionales de YouVersion.

---

## 📊 Mission Control Dashboard (`apps/web`)

Dashboard web en tiempo real sincronizado con todas las extensiones (VS Code, Chrome y Canva):

- **Soporte Multilingüe (English 🇬🇧 / Español 🇪🇸)**.
- **Métricas en Vivo de Sesión y Discernimientos Proactivos**.

```bash
pnpm --filter @presence/web dev
```
---

## 🛠️ Integración del SDK (`@presence/sdk`)

Puedes integrar Presence en **cualquier aplicación** (React, Next.js, Express, Vue, Angular, React Native, Extensiones o Vanilla JS) en 3 líneas de código:

```typescript
import { Presence } from '@presence/sdk';

// 1. Inicializar el SDK
const presence = Presence.initialize({ apiKey: 'pk_live_my_app', debug: true });

// 2. Capturar el contexto y discernir
const experience = await presence.capture({ activity: 'coding', topic: 'creative_block', language: 'es' });

// 3. Renderizar la experiencia
if (experience) {
  console.log(experience.title, experience.scripture.text, experience.reflection);
}
```

📘 **Consulta la guía paso a paso completa**: [📖 Guía de Integración del SDK (docs/SDK_INTEGRATION_GUIDE.md)](docs/SDK_INTEGRATION_GUIDE.md)

---

## 📖 Documentación Adicional

- 🤖 [Documentación del Motor de IA (Gloo AI Engine) & Prompts del Sistema](docs/GLOO_AI_ENGINE_AND_PROMPTS.md)
- 📘 [Guía de Integración del SDK Paso a Paso](docs/SDK_INTEGRATION_GUIDE.md)
- 🔑 [Guía de Configuración y Cambio de Llaves API de Gloo AI y YouVersion](docs/API_CONFIGURATION_GUIDE.md)
- 🔌 Especificación OpenAPI 3.1: `http://localhost:3001/openapi.json`
- 🖥️ Interfaz de Documentación Interactiva Scalar: `http://localhost:3001/docs`

---

## 📄 Licencia

Este proyecto está bajo la Licencia **MIT**. Consulta el archivo `LICENSE` para más detalles.
