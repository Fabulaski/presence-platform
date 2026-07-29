import express, { Request, Response } from 'express';
import cors from 'cors';
import { Presence } from '@presence/sdk';
import { LiveExperienceStore, LiveStoreItem } from '@presence/core';
import { renderDashboardSummary } from './components/dashboard.js';
import { getDefaultStudioConfig } from './components/studio.js';
import { getLandingContent } from './components/landing.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const presence = Presence.initialize({
  apiKey: 'pk_live_presence_web_platform',
  platform: 'widget',
  debug: true
});

// API endpoint to receive context from VS Code / CLI / apps in real time
app.post('/api/v1/context', async (req: Request, res: Response) => {
  try {
    const { activity, topic, userId, platform, appId } = req.body;
    const exp = await presence.capture({
      activity: activity || 'vscode_coding',
      topic: topic || 'wisdom',
      userId: userId || 'usr_vscode_dev',
      metadata: { platform: platform || 'vscode' }
    });

    if (exp) {
      LiveExperienceStore.getInstance().addExperience(exp, appId || 'VS Code Extension', activity);
    }

    res.json({ success: true, data: exp });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// API endpoint to receive a COMPLETE pre-generated experience from VS Code / clients
// This guarantees the exact same verse/reflection/prayer shown in the extension
// appears on the dashboard — no re-generation, perfect synchronization.
app.post('/api/v1/experience', (req: Request, res: Response) => {
  try {
    const { experience, activity, appId } = req.body;
    if (experience && experience.scripture) {
      LiveExperienceStore.getInstance().addExperience(experience, appId || 'VS Code Extension', activity || 'coding');
      console.log(`[Presence Web] ✅ Synced experience from ${appId}: "${experience.title}" — ${experience.scripture.reference}`);
      res.json({ success: true, synced: true });
    } else {
      res.status(400).json({ error: 'Missing experience data' });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// API endpoint for live stream polling
app.get('/api/v1/live-stream', (req: Request, res: Response) => {
  const store = LiveExperienceStore.getInstance();
  res.json({
    metrics: store.getMetrics(),
    experiences: store.getExperiences(),
    latestExperience: store.getExperiences()[0] || null,
    needDistribution: store.getNeedDistribution()
  });
});

// API endpoint for tracking user interaction / devotional clicks
app.post('/api/v1/interact', (req: Request, res: Response) => {
  LiveExperienceStore.getInstance().trackShare();
  res.json({ success: true, metrics: LiveExperienceStore.getInstance().getMetrics() });
});

app.get('/', async (req: Request, res: Response) => {
  const landing = getLandingContent();
  const dashboard = renderDashboardSummary();
  const studio = getDefaultStudioConfig();
  const store = LiveExperienceStore.getInstance();
  const experiences = store.getExperiences();
  const liveExp = experiences[0];

  const html = `
    <!DOCTYPE html>
    <html lang="en" class="dark">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Presence Platform — Mission Control & Studio</title>
      <script src="https://cdn.tailwindcss.com"></script>
      <script>
        tailwind.config = {
          darkMode: 'class',
          theme: {
            extend: {
              colors: {
                brand: { 500: '#38bdf8', 600: '#0284c7', 900: '#0f172a' }
              }
            }
          }
        }
      </script>
      <style>
        body { font-family: system-ui, -apple-system, sans-serif; transition: background-color 0.3s, color 0.3s; }

        /* Dark Theme Styles */
        html.dark body { background-color: #090d16; color: #f8fafc; }
        html.dark .glass { background: rgba(15, 23, 42, 0.75); backdrop-filter: blur(12px); border: 1px solid rgba(51, 65, 85, 0.5); }
        html.dark .card-inner { background-color: rgba(2, 6, 23, 0.8) !important; border-color: rgba(30, 41, 59, 0.8) !important; color: #f8fafc !important; }
        html.dark .quote-box { background-color: rgba(15, 23, 42, 0.7) !important; border-color: #38bdf8 !important; color: #f1f5f9 !important; }
        html.dark .table-head { background-color: rgba(15, 23, 42, 0.6) !important; border-color: #1e293b !important; color: #94a3b8 !important; }
        html.dark .table-row { border-color: rgba(30, 41, 59, 0.5) !important; color: #cbd5e1 !important; }
        html.dark .table-row:hover { background-color: rgba(30, 41, 59, 0.4) !important; }
        html.dark .progress-bg { background-color: #1e293b !important; }

        /* Light Theme Styles — Clean, Elegant & High-Contrast */
        html.light body { background-color: #f8fafc; color: #0f172a; }
        html.light .glass { background: #ffffff; backdrop-filter: blur(12px); border: 1px solid #e2e8f0; box-shadow: 0 10px 30px -5px rgba(0, 0, 0, 0.04); }
        html.light .card-inner { background-color: #f8fafc !important; border-color: #cbd5e1 !important; color: #0f172a !important; box-shadow: 0 2px 8px rgba(0,0,0,0.03) !important; }
        html.light .quote-box { background-color: #f0f9ff !important; border-color: #0284c7 !important; color: #0f172a !important; }
        html.light .table-head { background-color: #f1f5f9 !important; border-color: #cbd5e1 !important; color: #334155 !important; }
        html.light .table-row { border-color: #e2e8f0 !important; color: #1e293b !important; }
        html.light .table-row:hover { background-color: #f1f5f9 !important; }
        html.light .progress-bg { background-color: #e2e8f0 !important; }
        html.light .text-slate-100 { color: #0f172a !important; }
        html.light .text-slate-200 { color: #1e293b !important; }
        html.light .text-slate-300 { color: #334155 !important; }
        html.light .text-slate-400 { color: #64748b !important; }
        html.light .text-slate-500 { color: #475569 !important; }
      </style>
    </head>
    <body class="min-h-screen p-6 md:p-12">
      <div class="max-w-7xl mx-auto space-y-10">
        
        <!-- Header / Navigation -->
        <header class="flex justify-between items-center pb-6 border-b border-slate-800">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center font-bold text-xl shadow-lg shadow-sky-500/20">
              🕊️
            </div>
            <div>
              <h1 class="text-xl font-bold tracking-tight bg-gradient-to-r from-sky-400 to-indigo-400 bg-clip-text text-transparent">Presence Platform</h1>
              <p class="text-xs text-slate-400">Contextual Scripture Infrastructure</p>
            </div>
          </div>
          <div class="flex items-center space-x-3 text-xs font-semibold">
            <!-- Language Toggle Button -->
            <button id="btn-lang-toggle" onclick="toggleLanguage()" class="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-400 border border-slate-700 transition flex items-center gap-1.5 cursor-pointer">
              🌐 <span id="lang-btn-text">EN 🇬🇧</span>
            </button>
            
            <!-- Dark / Light Mode Toggle Button -->
            <button id="btn-theme-toggle" onclick="toggleTheme()" class="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 transition flex items-center gap-1.5 cursor-pointer">
              <span id="theme-btn-icon">🌙</span> <span id="theme-btn-text">Dark</span>
            </button>

            <a href="http://localhost:3001/docs" target="_blank" class="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-400 transition border border-slate-700">API Docs</a>
            <span class="px-3 py-2 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Systems Operational
            </span>
          </div>
        </header>

        <!-- Centered & Redesigned Hero Landing Section -->
        <section class="glass rounded-3xl p-10 md:p-16 relative overflow-hidden text-center flex flex-col items-center justify-center border border-slate-700/50">
          <div class="absolute -top-24 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-sky-500/20 via-indigo-500/15 to-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div class="max-w-4xl mx-auto space-y-6 relative z-10 flex flex-col items-center">
            <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 text-xs font-bold uppercase tracking-wider shadow-sm">
              <span class="w-2 h-2 rounded-full bg-sky-400 animate-ping"></span>
              <span id="hero-badge">B2B2C SaaS Platform</span>
            </div>
            
            <h2 id="hero-headline" class="text-3xl md:text-5xl font-black tracking-tight leading-tight bg-gradient-to-r from-slate-100 via-sky-200 to-indigo-200 bg-clip-text text-transparent">
              ${landing.hero.headline}
            </h2>
            
            <p id="hero-subheadline" class="text-slate-300 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
              ${landing.hero.subheadline}
            </p>

            <div class="flex flex-wrap items-center justify-center gap-3 pt-2 text-xs font-semibold text-slate-300">
              <span class="px-3.5 py-1.5 rounded-xl card-inner border border-slate-700/50 flex items-center gap-1.5 shadow-sm">
                ⚡ Gloo AI Engine
              </span>
              <span class="px-3.5 py-1.5 rounded-xl card-inner border border-slate-700/50 flex items-center gap-1.5 shadow-sm">
                📖 YouVersion Live Integration
              </span>
              <span class="px-3.5 py-1.5 rounded-xl card-inner border border-slate-700/50 flex items-center gap-1.5 shadow-sm">
                💻 VS Code Extension & SDK
              </span>
            </div>
          </div>
        </section>

        <!-- Mission Control Dashboard -->
        <section class="space-y-6">
          <div class="flex justify-between items-center">
            <h3 id="lbl-dash-title" class="text-2xl font-bold flex items-center gap-2">📊 Mission Control Dashboard</h3>
            <span class="text-xs text-slate-400 flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full bg-sky-400 animate-ping"></span> <span id="lbl-live-updating-sec">Updating live every 2s</span>
            </span>
          </div>
          
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="glass p-5 rounded-2xl">
              <div id="lbl-stat-exp-title" class="text-xs text-slate-400">Experiences Today</div>
              <div id="stat-experiences" class="text-3xl font-extrabold text-sky-400 mt-1">${dashboard.metrics.experiencesToday}</div>
            </div>
            <div class="glass p-5 rounded-2xl">
              <div id="lbl-stat-lat-title" class="text-xs text-slate-400">Avg API Latency</div>
              <div id="stat-latency" class="text-3xl font-extrabold text-emerald-400 mt-1">${dashboard.metrics.avgInterventionTimeMs} ms</div>
            </div>
            <div class="glass p-5 rounded-2xl">
              <div id="lbl-stat-share-title" class="text-xs text-slate-400">Share Rate</div>
              <div id="stat-share" class="text-3xl font-extrabold text-indigo-400 mt-1">${dashboard.metrics.shareRatePercent}%</div>
            </div>
            <div class="glass p-5 rounded-2xl">
              <div id="lbl-stat-theme-title" class="text-xs text-slate-400">Dominant Theme</div>
              <div id="stat-theme" class="text-xl font-bold text-amber-400 mt-2">${dashboard.metrics.dominantTheme}</div>
            </div>
          </div>

          <!-- Live Experience Stream -->
          <div class="glass p-6 rounded-2xl space-y-4">
            <h4 id="lbl-livestream-title" class="font-bold text-base text-slate-200">⚡ Real-Time Context Stream (Live Stream)</h4>
            <div id="live-card" class="card-inner border rounded-xl p-5 space-y-3 transition-all duration-500">
              <div class="flex justify-between items-center">
                <span id="live-app" class="text-xs font-bold text-sky-400 uppercase tracking-wider">${liveExp?.appName || 'VS Code Extension'}</span>
                <span id="live-confidence" class="text-xs text-slate-500">Confidence: ${Math.round((liveExp?.confidence || 0.9) * 100)}%</span>
              </div>
              <h5 id="live-title" class="text-lg font-semibold text-slate-100">${liveExp?.title || 'Waiting for context event...'}</h5>
              <p id="live-reflection" class="text-sm text-slate-300 leading-relaxed">${liveExp?.reflection || ''}</p>
              <blockquote id="live-quote" class="quote-box p-3 border-l-4 rounded-r-xl text-sm italic">
                "${liveExp?.scripture?.text || ''}" — <strong id="live-reference" class="not-italic text-sky-400 font-bold">${liveExp?.scripture?.reference || ''}</strong>
              </blockquote>
              <div id="live-plan-container" class="pt-2 flex items-center justify-between border-t border-slate-700/50">
                <span id="live-plan-title" class="text-xs text-amber-400 font-semibold">
                  📲 Plan YouVersion: ${liveExp?.youVersionPlan?.title || 'Wisdom from Above'}
                </span>
                <a id="live-plan-link" onclick="trackPlanClick()" href="${liveExp?.youVersionPlan?.url || 'https://www.bible.com/search/plans?query=wisdom'}" target="_blank" rel="noopener noreferrer"
                   class="px-3 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/20 text-xs font-semibold transition">
                  Open Devotional →
                </a>
              </div>
            </div>

            <!-- Recent Stream Table -->
            <div class="space-y-2 pt-2">
              <h5 id="lbl-recent-history" class="text-xs font-semibold text-slate-400 uppercase">RECENT CONTEXT EVENT HISTORY</h5>
              <div class="overflow-x-auto">
                <table class="w-full text-left text-xs text-slate-300">
                  <thead class="table-head uppercase border-b">
                    <tr>
                      <th id="lbl-th-origin" class="p-2.5">ORIGIN / APP</th>
                      <th id="lbl-th-activity" class="p-2.5">ACTIVITY</th>
                      <th id="lbl-th-need" class="p-2.5">NEED</th>
                      <th id="lbl-th-passage" class="p-2.5">MATCHED PASSAGE</th>
                      <th id="lbl-th-status" class="p-2.5">STATUS</th>
                    </tr>
                  </thead>
                  <tbody id="stream-table-body" class="divide-y divide-slate-800/50">
                    ${experiences.map((exp: LiveStoreItem) => `
                      <tr class="table-row transition">
                        <td class="p-2.5 font-medium text-sky-400">${exp.appName || 'VS Code Extension'}</td>
                        <td class="p-2.5 text-slate-400">${exp.activity || 'coding'}</td>
                        <td class="p-2.5 font-semibold text-indigo-400">${exp.need.toUpperCase()}</td>
                        <td class="p-2.5 text-slate-200">${exp.scripture.reference}</td>
                        <td class="p-2.5"><span class="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Intervened</span></td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        <!-- Spiritual Needs Distribution & YouVersion Plans -->
        <section class="glass p-8 rounded-3xl space-y-6">
          <div class="flex justify-between items-center">
            <div>
              <h3 id="lbl-needs-title" class="text-2xl font-bold flex items-center gap-2">📊 Spiritual Needs Distribution</h3>
              <p id="lbl-needs-subtitle" class="text-slate-400 text-sm mt-1">Percentage of themes identified in developer sessions</p>
            </div>
            <span class="text-xs text-slate-400 flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full bg-indigo-400 animate-ping"></span> <span id="lbl-needs-live">Live updating</span>
            </span>
          </div>

          <div id="needs-distribution" class="space-y-4">
            ${(() => {
              const dist = store.getNeedDistribution();
              const colorMap: Record<string, { bar: string; text: string; bg: string }> = {
                hope:         { bar: 'bg-amber-400',   text: 'text-amber-400',   bg: 'bg-amber-400/10' },
                peace:        { bar: 'bg-sky-400',     text: 'text-sky-400',     bg: 'bg-sky-400/10' },
                wisdom:       { bar: 'bg-violet-400',  text: 'text-violet-400',  bg: 'bg-violet-400/10' },
                rest:         { bar: 'bg-emerald-400', text: 'text-emerald-400', bg: 'bg-emerald-400/10' },
                perseverance: { bar: 'bg-orange-400',  text: 'text-orange-400',  bg: 'bg-orange-400/10' },
                courage:      { bar: 'bg-rose-400',    text: 'text-rose-400',    bg: 'bg-rose-400/10' },
                comfort:      { bar: 'bg-pink-400',    text: 'text-pink-400',    bg: 'bg-pink-400/10' },
                joy:          { bar: 'bg-yellow-400',  text: 'text-yellow-400',  bg: 'bg-yellow-400/10' }
              };
              if (dist.length === 0) {
                return '<p class="text-slate-500 text-sm italic">Not enough data yet. Use the VS Code extension to generate context experiences.</p>';
              }
              return dist.map(d => {
                const c = colorMap[d.need] || { bar: 'bg-slate-400', text: 'text-slate-400', bg: 'bg-slate-400/10' };
                const plan = d.latestPlan || { url: 'https://www.bible.com/search/plans?query=' + d.need, title: d.label };
                return `
                  <div class="card-inner p-4 rounded-xl border transition">
                    <div class="flex justify-between items-center mb-2">
                      <div class="flex items-center gap-3">
                        <span class="text-base font-bold ${c.text}">${d.label}</span>
                        <span class="px-2 py-0.5 rounded-full text-xs font-semibold ${c.bg} ${c.text} border border-current/10">${d.count} ${d.count === 1 ? 'times' : 'times'}</span>
                      </div>
                      <span class="text-2xl font-extrabold ${c.text}">${d.percent}%</span>
                    </div>
                    <div class="w-full progress-bg rounded-full h-2.5 mb-3">
                      <div class="${c.bar} h-2.5 rounded-full transition-all duration-700 ease-out" style="width: ${d.percent}%"></div>
                    </div>
                    <a href="${plan.url}" onclick="trackPlanClick()" target="_blank" rel="noopener noreferrer"
                       class="inline-flex items-center gap-1.5 text-xs font-medium ${c.text} hover:underline transition">
                      📖 Plan YouVersion: ${plan.title} →
                    </a>
                  </div>
                `;
              }).join('');
            })()}
          </div>
        </section>

        <!-- Footer with updated text -->
        <footer class="text-center text-xs text-slate-500 pt-6 border-t border-slate-800">
          Presence Platform © 2026 • MIT Licensed • Built for Hackathon: Scripture in New Frontiers
        </footer>

      </div>

      <!-- Real-time Polling & Dynamic i18n / Theme Script -->
      <script>
        function trackPlanClick() {
          fetch('/api/v1/interact', { method: 'POST' }).then(() => fetchLiveStream()).catch(() => {});
        }

        const I18N = {
          en: {
            heroBadge: 'B2B2C SaaS Platform',
            heroHeadline: 'Contextual Scripture Infrastructure for Workspaces & Apps',
            heroSubheadline: 'Presence delivers timely biblical wisdom, prayer, and devotionals directly inside IDEs, mobile apps, and developer workflows.',
            dashboardTitle: '📊 Mission Control Dashboard',
            liveUpdatingSec: 'Updating live every 2s',
            experiencesToday: 'Experiences Today',
            avgApiLatency: 'Avg API Latency',
            shareRate: 'Share Rate',
            dominantTheme: 'Dominant Theme',
            liveStreamTitle: '⚡ Real-Time Context Stream (Live Stream)',
            confidenceLabel: 'Confidence:',
            waitingEvent: 'Waiting for context event...',
            openDevotional: 'Open Devotional →',
            recentHistoryTitle: 'RECENT CONTEXT EVENT HISTORY',
            thOrigin: 'ORIGIN / APP',
            thActivity: 'ACTIVITY',
            thNeed: 'NEED',
            thPassage: 'MATCHED PASSAGE',
            thStatus: 'STATUS',
            statusIntervened: 'Intervened',
            needsTitle: '📊 Spiritual Needs Distribution',
            needsSubtitle: 'Percentage of themes identified in developer sessions',
            liveUpdating: 'Live updating',
            noData: 'Not enough data yet. Use the VS Code extension to generate context experiences.',
            timesSingular: 'time',
            timesPlural: 'times',
            needs: {
              hope: 'Hope',
              peace: 'Peace',
              wisdom: 'Wisdom',
              rest: 'Rest',
              perseverance: 'Perseverance',
              courage: 'Courage',
              comfort: 'Comfort',
              joy: 'Joy'
            },
            activities: {
              inmunizacion_inicial: 'Initial Sync',
              vscode_coding: 'Coding',
              coding_in_python: 'Python Coding',
              coding_in_javascript: 'JavaScript Coding',
              coding_in_typescript: 'TypeScript Coding'
            },
            apps: {
              'Sistema Inicial': 'Initial System',
              'VS Code Extension': 'VS Code Extension',
              'Extensión VS Code': 'VS Code Extension'
            }
          },
          es: {
            heroBadge: 'Plataforma SaaS B2B2C',
            heroHeadline: 'Infraestructura de Escrituras Contextuales para Entornos de Trabajo y Apps',
            heroSubheadline: 'Presence entrega sabiduría bíblica, oración y devocionales directamente dentro de IDEs, aplicaciones móviles y flujos de trabajo.',
            dashboardTitle: '📊 Panel de Control (Mission Control)',
            liveUpdatingSec: 'Actualizando en vivo cada 2s',
            experiencesToday: 'Experiencias Hoy',
            avgApiLatency: 'Tiempo Promedio API',
            shareRate: 'Tasa de Compartidos',
            dominantTheme: 'Tema Dominante',
            liveStreamTitle: '⚡ Transmisión de Contexto en Tiempo Real (Live Stream)',
            confidenceLabel: 'Confianza:',
            waitingEvent: 'Esperando evento de contexto...',
            openDevotional: 'Abrir Devocional →',
            recentHistoryTitle: 'HISTORIAL RECIENTE DE EVENTOS DE CONTEXTO',
            thOrigin: 'ORIGEN / APP',
            thActivity: 'ACTIVIDAD',
            thNeed: 'NECESIDAD',
            thPassage: 'PASAJE MATCHADO',
            thStatus: 'ESTADO',
            statusIntervened: 'Intervenido',
            needsTitle: '📊 Distribución de Necesidades Espirituales',
            needsSubtitle: 'Porcentaje de temas identificados en las sesiones del desarrollador',
            liveUpdating: 'Actualización en vivo',
            noData: 'Aún no hay datos suficientes. Usa la extensión de VS Code para generar experiencias.',
            timesSingular: 'vez',
            timesPlural: 'veces',
            needs: {
              hope: 'Esperanza',
              peace: 'Paz',
              wisdom: 'Sabiduría',
              rest: 'Descanso',
              perseverance: 'Perseverancia',
              courage: 'Valentía',
              comfort: 'Consuelo',
              joy: 'Gozo'
            },
            activities: {
              inmunizacion_inicial: 'Sincronización Inicial',
              vscode_coding: 'Programación',
              coding_in_python: 'Programación en Python',
              coding_in_javascript: 'Programación en JavaScript',
              coding_in_typescript: 'Programación en TypeScript'
            },
            apps: {
              'Sistema Inicial': 'Sistema Inicial',
              'VS Code Extension': 'Extensión VS Code',
              'Extensión VS Code': 'Extensión VS Code'
            }
          }
        };

        // Automatic Experience Translation Helper
        function formatExperienceForLang(exp, lang) {
          if (!exp) return exp;
          const translated = JSON.parse(JSON.stringify(exp));

          if (lang === 'es') {
            let t = translated.title || '';
            if (t.toLowerCase().includes('coding with divine wisdom') || t.toLowerCase().includes('coding with wisdom')) t = 'Programando con Sabiduría Divina';
            else if (t.toLowerCase().includes('rest for the weary')) t = 'Descanso para el Programador Cansado';
            else if (t.toLowerCase().includes('code with trust')) t = 'Programa con Confianza';
            else if (t.toLowerCase().includes('pause for the mind')) t = 'Pausa para la Mente';
            else if (t.toLowerCase().includes('stillness')) t = 'Quietud en la Sintaxis';
            translated.title = t;

            let r = translated.reflection || '';
            if (r.includes('As you work through') || r.includes('demo.py')) {
              r = 'Mientras trabajas en el módulo demo.py esta tarde, recuerda que los desafíos y errores que encuentras son oportunidades para buscar sabiduría más allá de tu propio entendimiento. Santiago 1:5 nos recuerda que Dios da sabiduría generosamente a quienes se la piden sin reproche. Deja que esto te anime a hacer una pausa e invitar la guía de Dios al resolver problemas, confiando en que la claridad llegará a su debido tiempo.';
            }
            translated.reflection = r;

            if (translated.scripture) {
              if (translated.scripture.reference === 'James 1:5' || translated.scripture.reference === 'James 1:5-6' || translated.scripture.text.includes('lacks wisdom')) {
                translated.scripture.reference = 'Santiago 1:5';
                translated.scripture.text = 'Y si alguno de vosotros tiene falta de sabiduría, pídala a Dios, el cual da a todos abundantemente y sin reproche, y le será dada.';
              } else if (translated.scripture.reference === 'Romans 15:13') {
                translated.scripture.reference = 'Romanos 15:13';
                translated.scripture.text = 'Que el Dios de la esperanza los llene de toda alegría y paz a ustedes que confían en él...';
              }
            }

            if (translated.youVersionPlan) {
              if (translated.youVersionPlan.title === 'Wisdom from Above') {
                translated.youVersionPlan.title = 'Sabiduría de lo Alto';
              }
            }
          } else if (lang === 'en') {
            let t = translated.title || '';
            if (t.includes('Un Momento de Esperanza')) t = 'A Moment of Hope';
            else if (t.includes('Programando con Sabiduría')) t = 'Coding With Divine Wisdom';
            else if (t.includes('Descanso para el Programador')) t = 'Rest for the Weary Coder';
            translated.title = t;

            let r = translated.reflection || '';
            if (r.includes('En medio de tus tareas diarias') || r.includes('inagotable')) {
              r = 'In the midst of your daily tasks, remember that creativity and rest come from an inexhaustible source.';
            }
            translated.reflection = r;

            if (translated.scripture) {
              if (translated.scripture.reference === 'Romanos 15:13') {
                translated.scripture.reference = 'Romans 15:13';
                translated.scripture.text = 'May the God of hope fill you with all joy and peace as you trust in him, so that you may overflow with hope by the power of the Holy Spirit.';
              } else if (translated.scripture.reference === 'Santiago 1:5') {
                translated.scripture.reference = 'James 1:5';
                translated.scripture.text = 'If any of you lacks wisdom, you should ask God, who gives generously to all without finding fault, and it will be given to you.';
              }
            }

            if (translated.youVersionPlan) {
              if (translated.youVersionPlan.title === 'Sabiduría de lo Alto') {
                translated.youVersionPlan.title = 'Wisdom from Above';
              } else if (translated.youVersionPlan.title === 'Esperanza Inquebrantable') {
                translated.youVersionPlan.title = 'Unshakeable Hope';
              }
            }
          }

          return translated;
        }

        // Theme Toggle Logic
        let currentTheme = localStorage.getItem('presence_theme') || 'dark';

        function applyTheme(theme) {
          currentTheme = theme;
          localStorage.setItem('presence_theme', theme);
          const html = document.documentElement;
          const btnText = document.getElementById('theme-btn-text');
          const btnIcon = document.getElementById('theme-btn-icon');
          
          if (theme === 'light') {
            html.classList.remove('dark');
            html.classList.add('light');
            if (btnText) btnText.textContent = 'Light';
            if (btnIcon) btnIcon.textContent = '☀️';
          } else {
            html.classList.remove('light');
            html.classList.add('dark');
            if (btnText) btnText.textContent = 'Dark';
            if (btnIcon) btnIcon.textContent = '🌙';
          }
        }

        function toggleTheme() {
          applyTheme(currentTheme === 'dark' ? 'light' : 'dark');
        }

        // Language Toggle Logic
        let currentLang = localStorage.getItem('presence_lang') || (navigator.language && navigator.language.startsWith('es') ? 'es' : 'en');

        function applyLanguage(lang) {
          currentLang = lang;
          localStorage.setItem('presence_lang', lang);
          const langBtnText = document.getElementById('lang-btn-text');
          if (langBtnText) langBtnText.textContent = lang === 'en' ? 'EN 🇬🇧' : 'ES 🇪🇸';

          const t = I18N[lang] || I18N['en'];

          const setTxt = (id, txt) => { const el = document.getElementById(id); if (el) el.textContent = txt; };
          setTxt('lbl-dash-title', t.dashboardTitle);
          setTxt('lbl-live-updating-sec', t.liveUpdatingSec);
          setTxt('lbl-stat-exp-title', t.experiencesToday);
          setTxt('lbl-stat-lat-title', t.avgApiLatency);
          setTxt('lbl-stat-share-title', t.shareRate);
          setTxt('lbl-stat-theme-title', t.dominantTheme);
          setTxt('lbl-livestream-title', t.liveStreamTitle);
          setTxt('lbl-recent-history', t.recentHistoryTitle);
          setTxt('lbl-th-origin', t.thOrigin);
          setTxt('lbl-th-activity', t.thActivity);
          setTxt('lbl-th-need', t.thNeed);
          setTxt('lbl-th-passage', t.thPassage);
          setTxt('lbl-th-status', t.thStatus);
          setTxt('lbl-needs-title', t.needsTitle);
          setTxt('lbl-needs-subtitle', t.needsSubtitle);
          setTxt('lbl-needs-live', t.liveUpdating);
          setTxt('live-plan-link', t.openDevotional);
          setTxt('hero-badge', t.heroBadge);
          setTxt('hero-headline', t.heroHeadline);
          setTxt('hero-subheadline', t.heroSubheadline);

          fetchLiveStream();
        }

        function toggleLanguage() {
          applyLanguage(currentLang === 'es' ? 'en' : 'es');
        }

        // Real-time polling
        async function fetchLiveStream() {
          try {
            const res = await fetch('/api/v1/live-stream');
            if (!res.ok) return;
            const data = await res.json();
            const t = I18N[currentLang] || I18N['en'];
            
            // Update Stat counters
            if (data.metrics) {
              document.getElementById('stat-experiences').textContent = data.metrics.experiencesToday;
              document.getElementById('stat-latency').textContent = data.metrics.avgInterventionTimeMs + ' ms';
              document.getElementById('stat-share').textContent = data.metrics.shareRatePercent + '%';
              
              const rawNeed = data.metrics.topNeed || 'hope';
              const needName = (t.needs && t.needs[rawNeed]) ? t.needs[rawNeed] : rawNeed;
              document.getElementById('stat-theme').textContent = needName;
            }

            // Update Live Card with dynamic language translation
            const rawExp = data.latestExperience;
            if (rawExp) {
              const exp = formatExperienceForLang(rawExp, currentLang);
              const appDisplay = (t.apps && t.apps[exp.appName]) ? t.apps[exp.appName] : (exp.appName || 'VS Code Extension');
              document.getElementById('live-app').textContent = appDisplay;
              document.getElementById('live-confidence').textContent = t.confidenceLabel + ' ' + Math.round((exp.confidence || 0.9) * 100) + '%';
              document.getElementById('live-title').textContent = exp.title || '';
              document.getElementById('live-reflection').textContent = exp.reflection || '';
              document.getElementById('live-quote').childNodes[0].nodeValue = '"' + (exp.scripture ? exp.scripture.text : '') + '" — ';
              document.getElementById('live-reference').textContent = exp.scripture ? exp.scripture.reference : '';
              
              if (exp.youVersionPlan) {
                const planPrefix = currentLang === 'es' ? '📲 Plan YouVersion: ' : '📲 YouVersion Plan: ';
                document.getElementById('live-plan-title').textContent = planPrefix + exp.youVersionPlan.title;
                document.getElementById('live-plan-link').href = exp.youVersionPlan.url;
                document.getElementById('live-plan-link').textContent = t.openDevotional;
              }
            }

            // Update Stream Table
            if (data.experiences && Array.isArray(data.experiences)) {
              const tbody = document.getElementById('stream-table-body');
              tbody.innerHTML = data.experiences.map(rawE => {
                const e = formatExperienceForLang(rawE, currentLang);
                const appName = (t.apps && t.apps[e.appName]) ? t.apps[e.appName] : (e.appName || 'VS Code Extension');
                const activityName = (t.activities && t.activities[e.activity]) ? t.activities[e.activity] : (e.activity || 'coding');
                const needName = (t.needs && t.needs[e.need]) ? t.needs[e.need] : e.need;
                return \`
                  <tr class="table-row transition">
                    <td class="p-2.5 font-medium text-sky-400">\${appName}</td>
                    <td class="p-2.5 text-slate-400">\${activityName}</td>
                    <td class="p-2.5 font-semibold text-indigo-400">\${needName.toUpperCase()}</td>
                    <td class="p-2.5 text-slate-200">\${e.scripture ? e.scripture.reference : '-'}</td>
                    <td class="p-2.5"><span class="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">\${t.statusIntervened}</span></td>
                  </tr>
                \`;
              }).join('');
            }

            // Update Spiritual Needs Distribution
            if (data.needDistribution && Array.isArray(data.needDistribution)) {
              const colorMap = {
                hope:         { bar: 'bg-amber-400',   text: 'text-amber-400',   bg: 'bg-amber-400/10' },
                peace:        { bar: 'bg-sky-400',     text: 'text-sky-400',     bg: 'bg-sky-400/10' },
                wisdom:       { bar: 'bg-violet-400',  text: 'text-violet-400',  bg: 'bg-violet-400/10' },
                rest:         { bar: 'bg-emerald-400', text: 'text-emerald-400', bg: 'bg-emerald-400/10' },
                perseverance: { bar: 'bg-orange-400',  text: 'text-orange-400',  bg: 'bg-orange-400/10' },
                courage:      { bar: 'bg-rose-400',    text: 'text-rose-400',    bg: 'bg-rose-400/10' },
                comfort:      { bar: 'bg-pink-400',    text: 'text-pink-400',    bg: 'bg-pink-400/10' },
                joy:          { bar: 'bg-yellow-400',  text: 'text-yellow-400',  bg: 'bg-yellow-400/10' }
              };
              const container = document.getElementById('needs-distribution');
              if (data.needDistribution.length === 0) {
                container.innerHTML = \`<p class="text-slate-500 text-sm italic">\${t.noData}</p>\`;
              } else {
                container.innerHTML = data.needDistribution.map(d => {
                  const c = colorMap[d.need] || { bar: 'bg-slate-400', text: 'text-slate-400', bg: 'bg-slate-400/10' };
                  const plan = d.latestPlan || { url: 'https://www.bible.com/search/plans?query=' + d.need, title: d.label };
                  const needLabel = (t.needs && t.needs[d.need]) ? t.needs[d.need] : d.label;
                  const unitLabel = d.count === 1 ? t.timesSingular : t.timesPlural;
                  const planPrefix = currentLang === 'es' ? 'Plan YouVersion' : 'YouVersion Plan';
                  let planTitle = plan.title;
                  if (currentLang === 'es' && planTitle === 'Wisdom from Above') planTitle = 'Sabiduría de lo Alto';
                  if (currentLang === 'en' && planTitle === 'Sabiduría de lo Alto') planTitle = 'Wisdom from Above';
                  return \`
                    <div class="card-inner p-4 rounded-xl border transition">
                      <div class="flex justify-between items-center mb-2">
                        <div class="flex items-center gap-3">
                          <span class="text-base font-bold \${c.text}">\${needLabel}</span>
                          <span class="px-2 py-0.5 rounded-full text-xs font-semibold \${c.bg} \${c.text} border border-current/10">\${d.count} \${unitLabel}</span>
                        </div>
                        <span class="text-2xl font-extrabold \${c.text}">\${d.percent}%</span>
                      </div>
                      <div class="w-full progress-bg rounded-full h-2.5 mb-3">
                        <div class="\${c.bar} h-2.5 rounded-full transition-all duration-700 ease-out" style="width: \${d.percent}%"></div>
                      </div>
                      <a href="\${plan.url}" onclick="trackPlanClick()" target="_blank" rel="noopener noreferrer"
                         class="inline-flex items-center gap-1.5 text-xs font-medium \${c.text} hover:underline transition">
                        📖 \${planPrefix}: \${planTitle} →
                      </a>
                    </div>
                  \`;
                }).join('');
              }
            }
          } catch(err) {
            console.error('Polling error:', err);
          }
        }

        // Initialize Theme & Language on load
        applyTheme(currentTheme);
        applyLanguage(currentLang);

        setInterval(fetchLiveStream, 2000);
      </script>
    </body>
    </html>
  `;

  res.send(html);
});

const server = app.listen(PORT, () => {
  console.log(`[Presence Web] Server running on http://localhost:${PORT}`);
}).on('error', (err: any) => {
  if (err.code === 'EADDRINUSE') {
    const fallbackPort = Number(PORT) + 5;
    console.log(`[Presence Web] Puerto ${PORT} en uso. Iniciando servidor en puerto alternativo: http://localhost:${fallbackPort}`);
    app.listen(fallbackPort, () => {
      console.log(`[Presence Web] Server running on http://localhost:${fallbackPort}`);
    });
  } else {
    console.error(err);
  }
});
