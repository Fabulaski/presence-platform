# C4 Architecture Specification: Presence Platform

Esta documentación sigue el estándar **C4 Model** para estructurar la arquitectura del software en distintos niveles de abstracción.

---

## Nivel 1: Diagrama de Contexto del Sistema (System Context)

Muestra cómo **Presence Platform** interactúa con los usuarios finales, aplicaciones cliente de terceros y sistemas externos como YouVersion y Gloo AI.

```mermaid
graph TD
    User["👤 Usuario Final (Creador, Oyente, Dev)"]
    ThirdPartyApp["📱 Aplicaciones Integradas (Widget, Creator, Radio, IDE)"]
    PresencePlatform["☁️ Presence Platform (Contextual Scripture Infrastructure)"]
    YouVersionAPI["📖 YouVersion Platform API (Scripture Service)"]
    GlooAIGateway["🤖 Gloo AI Gateway (Multi-Agent Engine)"]
    SupabaseDB["🗄️ Supabase / PostgreSQL (Data & Spiritual Graph)"]

    User -->|"Interactúa con"| ThirdPartyApp
    ThirdPartyApp -->|"Captura ContextEvent & solicita Experiencias"| PresencePlatform
    PresencePlatform -->|"Consulta pasajes y planes de lectura"| YouVersionAPI
    PresencePlatform -->|"Clasifica contexto y genera reflexiones"| GlooAIGateway
    PresencePlatform -->|"Persiste sesiones y grafo espiritual"| SupabaseDB
```

---

## Nivel 2: Diagrama de Contenedores (Containers)

Muestra los contenedores de software que componen la plataforma (Apps, SDK, API REST, Motors y Almacenamiento).

```mermaid
graph TB
    subgraph Clients["Capas de Cliente y Demos"]
        SDK["🛠️ @presence/sdk (TypeScript SDK)"]
        CLI["💻 @presence/cli (CLI Tool)"]
        Widget["🎨 @presence/widget (JS Embed)"]
        WebDashboard["🖥️ apps/web (Landing & Mission Control)"]
    end

    subgraph PlatformCore["Presence Core Platform"]
        APIGateway["🔌 apps/api (Express REST API / OpenAPI 3.1)"]
        EventBus["⚡ @presence/events (Event Bus)"]
        ContextEngine["🧠 @presence/core (Hexagonal Engine)"]
    end

    subgraph External["Servicios Externos & Persistencia"]
        YouVersion["📖 YouVersion Adapter"]
        GlooAI["🤖 Gloo AI Multi-Agent Adapter"]
        Database["🗄️ @presence/database (Prisma + PostgreSQL)"]
    end

    SDK --> APIGateway
    CLI --> APIGateway
    Widget --> SDK
    WebDashboard --> APIGateway
    APIGateway --> ContextEngine
    ContextEngine --> EventBus
    ContextEngine --> YouVersion
    ContextEngine --> GlooAI
    ContextEngine --> Database
```

---

## Nivel 3: Diagrama de Componentes Hexagonales (Components)

Desglose interno de `@presence/core` demostrando el aislamiento de la Capa de Dominio mediante Puertos y Adaptadores (Hexagonal Architecture).

```mermaid
graph LR
    subgraph PrimaryAdapters["Driving Adapters (Puertos de Entrada)"]
        RESTController["REST Controller (/api/v1/context)"]
        SDKDriver["Presence SDK Driver"]
    end

    subgraph DomainCore["Capa de Dominio Hexagonal"]
        ScripturePort["Port: IScriptureService"]
        AIPort["Port: IGlooAIPipeline"]
        ContextEngineCore["Engine: ContextEngine"]
        DomainEvents["Domain Events (CONTEXT_CAPTURED, EXPERIENCE_GENERATED)"]
    end

    subgraph SecondaryAdapters["Driven Adapters (Puertos de Salida)"]
        YouVersionImpl["Adapter: YouVersionScriptureAdapter"]
        GlooAIImpl["Adapter: GlooAIPipelineAdapter"]
        PostgresImpl["Adapter: PrismaRepository"]
    end

    RESTController --> ContextEngineCore
    SDKDriver --> ContextEngineCore
    ContextEngineCore --> ScripturePort
    ContextEngineCore --> AIPort
    ContextEngineCore --> DomainEvents
    ScripturePort -.-> YouVersionImpl
    AIPort -.-> GlooAIImpl
```
