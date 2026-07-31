# 🕊️ Presence Platform — Contextual Scripture & Reflection

> **Scripture in New Frontiers** — Timely biblical wisdom, prayer, and micro-break devotionals delivered right inside VS Code.

[![Productivity](https://img.shields.io/badge/Category-Productivity-blue?style=flat-square)](#)
[![Gloo AI Engine](https://img.shields.io/badge/AI%20Engine-Gloo%20AI%20Platform-8B5CF6?style=flat-square)](https://platform.ai.gloo.com/)
[![YouVersion API](https://img.shields.io/badge/Devotionals-YouVersion-E11D48?style=flat-square)](https://www.youversion.com/)
[![Version](https://img.shields.io/badge/Version-1.0.0-green?style=flat-square)](#)

---

## 💡 Overview

**Presence Platform** accompanies you during coding sessions, complex decision-making, and long development marathons. Instead of requiring you to leave your editor to search for inspiration, Presence non-intrusively evaluates your context and delivers:

- 🕊️ **Contextual Scripture**: Relevant Bible passages matched to your current work.
- 💡 **Gloo AI Reflections**: Short, warm, human-centered reflections.
- ⏱️ **60-Second Micro-Breaks**: Practical physical and mental rest recommendations.
- 📲 **YouVersion Devotional Plans**: One-click access to curated reading plans.

---

## ✨ Features

### 1. ⚡ Proactive Activity Discernment (Gloo AI Engine)
- Detects non-intrusive activity telemetry (active coding duration, file switches, error frequency).
- Discerns spiritual and mental needs: **Peace**, **Wisdom**, **Rest**, **Hope**, **Perseverance**, **Courage**, **Joy**.
- Operates under 800ms via Gloo AI OAuth2 credentials (`gloo-openai-gpt-4.1-mini`).

### 2. 📊 Real-Time Mission Control Dashboard Sync
- Automatically syncs reflections to the **Mission Control Dashboard** (`http://localhost:3000`).
- Provides telemetry for spiritual wellness metrics across workspace environments.

### 3. 🌐 Privacy-First Design
- **100% Private**: Presence **never** reads code contents, private keys, or personal files. It only evaluates non-sensitive activity metadata and duration.

---

## ⌨️ Extension Commands

| Command | Title | Description |
| :--- | :--- | :--- |
| `presence.captureContext` | **Presence: Capture Context & Reflect** | Triggers Gloo AI discernment for your current session. |
| `presence.openDashboard` | **Presence: Open Mission Control Dashboard** | Opens the live telemetry web dashboard (`localhost:3000`). |

---

## ⚙️ Status Bar & Controls

Presence adds a discrete indicator to your VS Code status bar:
`$(heart) Presence: Activo`

Clicking the status bar item instantly opens your current reflection and devotional plan!

---

## 📄 License

MIT License © Presence Platform team.
