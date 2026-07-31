# 🔑 Guía Paso a Paso: Configuración y Cambio de Llaves API de Gloo AI y YouVersion

> **Presence Platform** se conecta a las plataformas oficiales de **Gloo AI** y **YouVersion**.  
> Este documento detalla cómo actualizar, cambiar o rotar tus llaves API y credenciales de entorno (`.env`) o de forma programática en TypeScript.

---

## 📋 Tabla de Contenidos
1. [Visión General de la Arquitectura de Adaptadores](#-visión-general-de-la-arquitectura-de-adaptadores)
2. [🤖 Parte 1: Configurar y Cambiar Credenciales de Gloo AI](#-parte-1-configurar-y-cambiar-credenciales-de-gloo-ai)
   - [A. Mediante Variables de Entorno (`.env`)](#a-mediante-variables-de-entorno-env)
   - [B. Mediante Inicialización Programática en TypeScript](#b-mediante-inicialización-programática-en-typescript)
   - [C. Configurar Fallback Directo de OpenAI (Opcional)](#c-configurar-fallback-directo-de-openai-opcional)
3. [📖 Parte 2: Configurar y Cambiar Credenciales de YouVersion API](#-parte-2-configurar-y-cambiar-credenciales-de-youversion-api)
   - [A. Mediante Variables de Entorno (`.env`)](#a-mediante-variables-de-entorno-env-1)
   - [B. Mediante Inicialización Programática en TypeScript](#b-mediante-inicialización-programática-en-typescript-1)
4. [🛠️ Parte 3: Configuración Paso a Paso del Archivo `.env`](#-parte-3-configuración-paso-a-paso-del-archivo-env)
5. [🧪 Parte 4: Comprobación y Verificación de Registro (Logs)](#-parte-4-comprobación-y-verificación-de-registro-logs)

---

## 🏛️ Visión General de la Arquitectura de Adaptadores

Presence utiliza la **Arquitectura Hexagonal (Puertos y Adaptadores)** en el paquete `@presence/core`:

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        Core Engine (@presence/core)                    │
└────────────────────────────────────────────────────────────────────────┘
                    │                                │
                    ▼                                ▼
  ┌─────────────────────────────────┐ ┌─────────────────────────────────┐
  │   YouVersionScriptureAdapter    │ │     GlooAIPipelineAdapter       │
  │ (Puerto: IScriptureService)     │ │ (Puerto: IGlooAIPipeline)       │
  └─────────────────────────────────┘ └─────────────────────────────────┘
```

Ambos adaptadores permiten configurar sus llaves de dos formas:
1. **Automática**: Leyendo variables del archivo de entorno (`.env` o variables de sistema).
2. **Manual / Programática**: Pasando las llaves como parámetros en el constructor de TypeScript.

---

## 🤖 Parte 1: Configurar y Cambiar Credenciales de Gloo AI

Gloo AI se conecta mediante autenticación **OAuth2 Client Credentials** (`https://platform.ai.gloo.com/oauth2/token`).

### A. Mediante Variables de Entorno (`.env`)

Abre o crea el archivo `.env` en la raíz del proyecto o en `apps/api/.env` y define las siguientes variables:

```env
# ─── Gloo AI Platform OAuth2 Credentials ─────────────────────────────────────
GLOO_CLIENT_ID="tu_nuevo_gloo_client_id"
GLOO_CLIENT_SECRET="tu_nuevo_gloo_client_secret"

# ─── Gloo AI Endpoints (Opcional - Usan valores oficiales por defecto) ────────
GLOO_TOKEN_URL="https://platform.ai.gloo.com/oauth2/token"
GLOO_ENDPOINT="https://platform.ai.gloo.com/ai/v1/chat/completions"
GLOO_MODEL="gloo-openai-gpt-4.1-mini"
```

### B. Mediante Inicialización Programática en TypeScript

Si estás extendiendo el servidor backend o creando tu propio adaptador, puedes instanciar el puerto pasando las credenciales directamente:

```typescript
import { GlooAIPipelineAdapter } from '@presence/core';

// Pasa tu clientId y clientSecret en el constructor
const customGlooAdapter = new GlooAIPipelineAdapter(
  'tu_gloo_client_id_aqui',
  'tu_gloo_client_secret_aqui'
);
```

### C. Configurar Fallback Directo de OpenAI (Opcional)

Si las credenciales de Gloo AI expiran o deseas contar con un respaldo redundante directo con OpenAI:

```env
# ─── Backup Directo de OpenAI (Opcional) ────────────────────────────────────
OPENAI_API_KEY="sk-proj-tu-api-key-de-openai"
OPENAI_MODEL="gpt-4o-mini"
```

---

## 📖 Parte 2: Configurar y Cambiar Credenciales de YouVersion API

El adaptador de YouVersion realiza consultas bíblicas y genera enlaces a Planes Devocionales oficiales de la plataforma YouVersion.

### A. Mediante Variables de Entorno (`.env`)

Agrega a tu archivo `.env`:

```env
# ─── YouVersion Platform API Key ─────────────────────────────────────────────
YOUVERSION_API_KEY="tu_nueva_llave_api_de_youversion"
YOUVERSION_API_URL="https://api.youversion.com/v1"
```

### B. Mediante Inicialización Programática en TypeScript

Puedes especificar la clave de YouVersion al instanciar el adaptador:

```typescript
import { YouVersionScriptureAdapter } from '@presence/core';

// Pasa la llave de API directamente
const customScriptureAdapter = new YouVersionScriptureAdapter(
  'tu_llave_api_youversion_aqui'
);
```

---

## 🛠️ Parte 3: Configuración Paso a Paso del Archivo `.env`

1. **Copiar la plantilla `.env.example`**:
   ```bash
   cp .env.example .env
   ```

2. **Editar las claves en el archivo `.env`**:
   ```env
   # Puertos del servidor
   PORT=3001
   
   # Gloo AI
   GLOO_CLIENT_ID="2jhf906bcnngiugsengi7v6nnq"
   GLOO_CLIENT_SECRET="6amjvb3vuo3lboeq1lhmrh5utbiqob4n8v9t5h60fmglqujgvrs"
   
   # YouVersion API
   YOUVERSION_API_KEY="kJUhmDGjfa4guaAirEbEfWpL2rwUGhTwOyl04woquaK56VoK"
   ```

3. **Reiniciar el Servidor API**:
   ```bash
   pnpm --filter @presence/api dev
   ```

---

## 🧪 Parte 4: Comprobación y Verificación de Registro (Logs)

Al iniciar la aplicación (`pnpm --filter @presence/api dev`), observa los logs en la terminal para confirmar la conexión exitosa:

```text
[Presence SDK] Initialized successfully with API Key: pk_live_presence_core_prod
[Gloo AI OAuth2] ✅ Token obtained successfully (expires in 3600s)
[Presence API] Server running on http://localhost:3001
[Presence API] OpenAPI 3.1 Spec available at http://localhost:3001/openapi.json
```

Si las llaves se cambiaron correctamente, verás la marca de verificación verde: `[Gloo AI OAuth2] ✅ Token obtained successfully`.

---

## 📄 Licencia

MIT License © Team Presence Platform.
