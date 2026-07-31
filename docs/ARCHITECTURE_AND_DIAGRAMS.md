# 🏛️ Especificación de Arquitectura de Software & Diagramas C4

> **Presence Platform — Contextual Scripture Infrastructure**  
> Documentación técnica exhaustiva basada en la metodología **C4 Model** (Contexto, Contenedores y Componentes Hexagonales) con diagramas interactivos en **Mermaid.js**.

---

## 📋 Tabla de Contenidos
1. [Visión General de la Arquitectura](#-visión-general-de-la-arquitectura)
2. [🌐 Nivel 1: Diagrama de Contexto del Sistema (System Context)](#-nivel-1-diagrama-de-contexto-del-sistema-system-context)
3. [🐳 Nivel 2: Diagrama de Contenedores (Containers)](#-nivel-2-diagrama-de-contenedores-containers)
4. [🏛️ Nivel 3: Diagrama de Componentes Hexagonales (Components)](#-nivel-3-diagrama-de-componentes-hexagonales-components)
5. [⚡ Diagrama de Secuencia y Flujo de Ejecución (<800ms)](#-diagrama-de-secuencia-y-flujo-de-ejecución-800ms)
6. [🔒 Principios de Privacidad y Aislamiento Multi-Tenant](#-principios-de-privacidad-y-aislamiento-multi-tenant)

---

## 💡 Visión General de la Arquitectura

Presence Platform está diseñada bajo los patrones de **Arquitectura Hexagonal (Puertos y Adaptadores)** y **Arquitectura Dirigida por Eventos (Event-Driven Architecture)**.

### Principios Fundamentales:
1. **Desacoplamiento Absoluto (B2B2C)**: El núcleo del sistema (`@presence/core`) no conoce los detalles de implementación de los clientes (VS Code, Canva, Chrome, React, Express) ni de los proveedores externos (Gloo AI, YouVersion).
2. **Puertos y Adaptadores**: Los servicios externos se integran mediante interfaces puras (`IScriptureService` y `IGlooAIPipeline`), permitiendo sustituir o alternar modelos de IA sin modificar la lógica del dominio.
3. **Optimización de Latencia Paralela**: Las consultas bíblicas y las llamadas al modelo de IA se ejecutan de forma concurrente mediante promesas paralelas de TypeScript (`Promise.all`), logrando responder en menos de **800 ms**.

---

## 🌐 Nivel 1: Diagrama de Contexto del Sistema (System Context)

El Diagrama de Contexto define cómo los usuarios finales y los sistemas externos interactúan con la frontera de Presence Platform.

```mermaid
graph TD
    User["👤 Usuario Final (Creadores en Canva, Navegantes en Chrome, Desenvolvedores en VS Code)"]
    
    subgraph Clients["Plataformas y Clientes Integrados"]
        VSCodeApp["💻 Extensión VS Code"]
        CanvaApp["🎨 App / Extensión Canva"]
        ChromeExt["🌐 Extensión Google Chrome"]
        CustomSDKApp["📱 Aplicación de Terceros (SDK)"]
    end

    PresencePlatform["☁️ Presence Platform Core Gateway"]
    YouVersionAPI["📖 YouVersion Platform API (Scripture Service)"]
    GlooAIGateway["🤖 Gloo AI Platform API (Multi-Agent Engine)"]
    Database["🗄️ Supabase PostgreSQL (11 Tablas Relacionales)"]

    User -->|"Trabaja / Diseña / Programa en"| Clients
    Clients -->|"1. Envía ContextEvent (Sin código ni datos privados)"| PresencePlatform
    PresencePlatform -->|"2. Consulta pasajes y planes devocionales"| YouVersionAPI
    PresencePlatform -->|"3. Clasifica contexto y redacta reflexiones"| GlooAIGateway
    PresencePlatform -->|"4. Persiste eventos y grafo espiritual"| Database
    PresencePlatform -->|"5. Retorna ExperienceObject (Escritura, Reflexión, Pausa 60s)"| Clients
```

### Descripción de Actores y Sistemas:
- **Usuario Final**: Persona realizando actividades de diseño, programación, edición de video o estudio.
- **Clientes Integrados**: Extensiones y SDKs que capturan metadatos de actividad (`activity`, `topic`, `durationSeconds`).
- **Presence Platform**: Núcleo orquestador que ejecuta el discernimiento proactivo.
- **YouVersion Platform API**: Proveedor oficial de versículos bíblicos y planes devocionales.
- **Gloo AI Platform**: Motor de inteligencia artificial que ejecuta los agentes de clasificación y reflexión.

---

## 🐳 Nivel 2: Diagrama de Contenedores (Containers)

El Diagrama de Contenedores muestra los distintos microservicios, módulos y aplicaciones del monorepo Turborepo.

```mermaid
graph TB
    subgraph ClientLayer["Capas de Cliente y Extensiones"]
        VSCode["💻 apps/vscode-extension (.vsix)"]
        Canva["🎨 apps/canva-app (React UI Sidebar)"]
        Chrome["🌐 apps/chrome-extension (Manifest V3)"]
        SDK["🛠️ @presence/sdk (TypeScript SDK)"]
        CLI["💻 @presence/cli (CLI Tool)"]
    end

    subgraph CorePlatform["Presence Platform Core"]
        APIServer["🔌 apps/api (Express REST API / OpenAPI 3.1 - Puerto 3001)"]
        WebDashboard["🖥️ apps/web (Mission Control Dashboard - Puerto 3000)"]
        CanvaBackend["🎨 apps/canva-extension (Canva Integration Backend - Puerto 3005)"]
        EventBus["⚡ @presence/events (Async PresenceEventBus)"]
        HexEngine["🧠 @presence/core (Hexagonal Engine & ContextEngine)"]
    end

    subgraph Infrastructure["Servicios de Persistencia y Proveedores"]
        YouVersionAdapter["📖 YouVersionScriptureAdapter"]
        GlooAIAdapter["🤖 GlooAIPipelineAdapter (gloo-openai-gpt-4.1-mini)"]
        DBPackage["🗄️ @presence/database (Prisma ORM + Supabase PostgreSQL)"]
    end

    VSCode --> APIServer
    Chrome --> APIServer
    Canva --> CanvaBackend
    CanvaBackend --> APIServer
    SDK --> APIServer
    CLI --> APIServer
    WebDashboard --> APIServer
    APIServer --> HexEngine
    HexEngine --> EventBus
    HexEngine --> YouVersionAdapter
    HexEngine --> GlooAIAdapter
    HexEngine --> DBPackage
```

### Detalle de Contenedores:
- **`apps/api` (Puerto 3001)**: Gateway REST en Express. Expone OpenAPI 3.1 y la documentación en Scalar GUI (`http://localhost:3001/docs`).
- **`apps/web` (Puerto 3000)**: Dashboard en tiempo real que transmite la actividad y las reflexiones discernidas.
- **`apps/canva-extension` (Puerto 3005)**: Backend puente para inserción en lienzos de Canva y sincronización con el Dashboard.
- **`@presence/core`**: Paquete npm interno que contiene la lógica pura del dominio, el `ContextEngine` y los adaptadores hexagonales.

---

## 🏛️ Nivel 3: Diagrama de Componentes Hexagonales (Components)

El Diagrama de Componentes ilustra la estructura interna de `@presence/core` aislada mediante Puertos y Adaptadores.

```mermaid
graph LR
    subgraph DrivingAdapters["Driving Adapters (Puertos de Entrada)"]
        RESTController["REST Controller (/api/v1/context)"]
        SDKDriver["Presence SDK Driver"]
        ExtensionDriver["Browser/IDE Extension Drivers"]
    end

    subgraph DomainCore["Capa de Dominio Hexagonal (@presence/core)"]
        ContextEngineCore["Engine: ContextEngine"]
        ScripturePort["Port: IScriptureService"]
        AIPort["Port: IGlooAIPipeline"]
        LiveStore["Store: LiveExperienceStore"]
        DomainEvents["Events: PresenceEventBus"]
    end

    subgraph DrivenAdapters["Driven Adapters (Puertos de Salida)"]
        YouVersionImpl["Adapter: YouVersionScriptureAdapter"]
        GlooAIImpl["Adapter: GlooAIPipelineAdapter"]
        PrismaImpl["Adapter: PrismaRepository (PostgreSQL)"]
    end

    RESTController --> ContextEngineCore
    SDKDriver --> ContextEngineCore
    ExtensionDriver --> ContextEngineCore
    
    ContextEngineCore --> ScripturePort
    ContextEngineCore --> AIPort
    ContextEngineCore --> LiveStore
    ContextEngineCore --> DomainEvents

    ScripturePort -.-> YouVersionImpl
    AIPort -.-> GlooAIImpl
    LiveStore -.-> PrismaImpl
```

### Componentes de Dominio:
- **`ContextEngine`**: Orquesta el flujo de discernimiento y generación de la experiencia.
- **`IScriptureService`**: Puerto abstracto para búsqueda de pasajes y planes devocionales.
- **`IGlooAIPipeline`**: Puerto abstracto para clasificación de contexto y generación de reflexiones.
- **`LiveExperienceStore`**: Almacén reactivo singleton en memoria para actualizar el Dashboard Web en tiempo real.

---

## ⚡ Diagrama de Secuencia y Flujo de Ejecución (<800ms)

Este diagrama detalla la secuencia temporal sincrónica y asincrónica desde que una extensión cliente envía un evento hasta que la tarjeta se presenta en pantalla y se notifica al Dashboard Web.

```mermaid
sequenceDiagram
    autonumber
    actor User as Usuario Final
    participant Client as Cliente / Extensión (VS Code/Chrome/Canva)
    participant API as apps/api (REST Gateway)
    participant Engine as ContextEngine (@presence/core)
    participant GlooAI as GlooAIPipelineAdapter
    participant YouVersion as YouVersionScriptureAdapter
    participant EventBus as PresenceEventBus
    participant Dashboard as apps/web (Live Dashboard)

    User->>Client: Realiza actividad (ej: 30 min en diseño o código)
    Client->>API: POST /api/v1/context (ContextEvent)
    API->>Engine: processContext(event)
    
    Engine->>GlooAI: 1. classifyContext(event)
    GlooAI-->>Engine: ContextClassification (shouldIntervene: true, primaryNeed: "peace")
    
    par Ejecución Concurrente en Paralelo (Promise.all)
        Engine->>YouVersion: 2a. findScriptureForNeed("peace")
        YouVersion-->>Engine: ScriptureMatch (Filipenses 4:6-7)
        Engine->>YouVersion: 2b. getReadingPlanForNeed("peace")
        YouVersion-->>Engine: YouVersionPlan URL
        Engine->>GlooAI: 2c. buildExperience("peace", scripture)
        GlooAI-->>Engine: Reflection, Prayer, 60s Micro-Action
    end

    Engine->>EventBus: 3. publish(EXPERIENCE_GENERATED)
    EventBus-->>Dashboard: Actualiza tarjeta en tiempo real
    Engine-->>API: ExperienceObject
    API-->>Client: 200 OK (ExperienceObject JSON)
    Client-->>User: Muestra Tarjeta con Escritura, Reflexión y Botón YouVersion
```

---

## 🔒 Principios de Privacidad y Aislamiento Multi-Tenant

1. **Sin lectura de contenido privado**: Presence **nunca** lee ni transmite código fuente, textos de diseño, correos o datos personales.
2. **Evaluación de Metadatos Livianos**: Solamente se analizan cadenas no sensibles (`activity`, `topic`, `durationSeconds`).
3. **Aislamiento Multi-Tenant**: Cada cliente está aislado por `appId` y `machineId` / `userId`, previniendo la contaminación de datos entre usuarios.

---

## 📄 Licencia

MIT License © Team Presence Platform.
