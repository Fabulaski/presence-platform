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
    latestExperience: store.getExperiences()[0] || null
  });
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
    <html lang="es" class="dark">
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
        body { background-color: #090d16; color: #f8fafc; font-family: system-ui, sans-serif; }
        .glass { background: rgba(15, 23, 42, 0.75); backdrop-filter: blur(12px); border: 1px solid rgba(51, 65, 85, 0.5); }
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
          <div class="flex items-center space-x-4 text-xs font-semibold">
            <a href="http://localhost:3001/docs" target="_blank" class="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-400 transition">API Docs (/docs)</a>
            <span class="px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Systems Operational
            </span>
          </div>
        </header>

        <!-- Hero Landing Section -->
        <section class="glass rounded-3xl p-8 md:p-12 relative overflow-hidden">
          <div class="max-w-3xl space-y-4 relative z-10">
            <span class="px-3 py-1 text-xs font-semibold rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">B2B2C SaaS Platform</span>
            <h2 class="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">${landing.hero.headline}</h2>
            <p class="text-slate-300 text-base md:text-lg">${landing.hero.subheadline}</p>
          </div>
        </section>

        <!-- Mission Control Dashboard -->
        <section class="space-y-6">
          <div class="flex justify-between items-center">
            <h3 class="text-2xl font-bold flex items-center gap-2">📊 Mission Control Dashboard</h3>
            <span class="text-xs text-slate-400 flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full bg-sky-400 animate-ping"></span> Actualizando en vivo cada 2s
            </span>
          </div>
          
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="glass p-5 rounded-2xl">
              <div class="text-xs text-slate-400">Experiencias Hoy</div>
              <div id="stat-experiences" class="text-3xl font-extrabold text-sky-400 mt-1">${dashboard.metrics.experiencesToday}</div>
            </div>
            <div class="glass p-5 rounded-2xl">
              <div class="text-xs text-slate-400">Tiempo Promedio API</div>
              <div id="stat-latency" class="text-3xl font-extrabold text-emerald-400 mt-1">${dashboard.metrics.avgInterventionTimeMs} ms</div>
            </div>
            <div class="glass p-5 rounded-2xl">
              <div class="text-xs text-slate-400">Tasa de Compartidos</div>
              <div id="stat-share" class="text-3xl font-extrabold text-indigo-400 mt-1">${dashboard.metrics.shareRatePercent}%</div>
            </div>
            <div class="glass p-5 rounded-2xl">
              <div class="text-xs text-slate-400">Tema Dominante</div>
              <div id="stat-theme" class="text-xl font-bold text-amber-400 mt-2">${dashboard.metrics.dominantTheme}</div>
            </div>
          </div>

          <!-- Live Experience Stream -->
          <div class="glass p-6 rounded-2xl space-y-4">
            <h4 class="font-bold text-base text-slate-200">⚡ Transmisión de Contexto en Tiempo Real (Live Stream)</h4>
            <div id="live-card" class="bg-slate-950/80 border border-slate-800 rounded-xl p-5 space-y-3 transition-all duration-500">
              <div class="flex justify-between items-center">
                <span id="live-app" class="text-xs font-bold text-sky-400 uppercase tracking-wider">${liveExp?.appName || 'VS Code Extension'}</span>
                <span id="live-confidence" class="text-xs text-slate-500">Confianza: ${Math.round((liveExp?.confidence || 0.9) * 100)}%</span>
              </div>
              <h5 id="live-title" class="text-lg font-semibold text-slate-100">${liveExp?.title || 'Esperando evento...'}</h5>
              <p id="live-reflection" class="text-sm text-slate-300 leading-relaxed">${liveExp?.reflection || ''}</p>
              <blockquote id="live-quote" class="p-3 bg-slate-900/60 border-l-4 border-sky-400 rounded text-sm italic text-slate-200">
                "${liveExp?.scripture?.text || ''}" — <strong id="live-reference" class="not-italic text-sky-300">${liveExp?.scripture?.reference || ''}</strong>
              </blockquote>
            </div>

            <!-- Recent Stream Table -->
            <div class="space-y-2 pt-2">
              <h5 class="text-xs font-semibold text-slate-400 uppercase">Historial Reciente de Eventos de Contexto</h5>
              <div class="overflow-x-auto">
                <table class="w-full text-left text-xs text-slate-300">
                  <thead class="text-slate-500 uppercase bg-slate-900/40 border-b border-slate-800">
                    <tr>
                      <th class="p-2.5">Origen / App</th>
                      <th class="p-2.5">Actividad</th>
                      <th class="p-2.5">Necesidad</th>
                      <th class="p-2.5">Pasaje Matcheado</th>
                      <th class="p-2.5">Estado</th>
                    </tr>
                  </thead>
                  <tbody id="stream-table-body" class="divide-y divide-slate-800/50">
                    ${experiences.map((exp: LiveStoreItem) => `
                      <tr class="hover:bg-slate-900/30 transition">
                        <td class="p-2.5 font-medium text-sky-300">${exp.appName || 'VS Code'}</td>
                        <td class="p-2.5 text-slate-400">${exp.activity || 'programacion'}</td>
                        <td class="p-2.5 font-semibold text-indigo-400">${exp.need.toUpperCase()}</td>
                        <td class="p-2.5 text-slate-200">${exp.scripture.reference}</td>
                        <td class="p-2.5"><span class="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Intervenido</span></td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        <!-- Presence Studio Configurator -->
        <section class="glass p-8 rounded-3xl space-y-6">
          <div>
            <h3 class="text-2xl font-bold flex items-center gap-2">🎛️ Presence Studio</h3>
            <p class="text-slate-400 text-sm">Configuración personalizada para ministerios e iglesias de la plataforma.</p>
          </div>

          <div class="grid md:grid-cols-3 gap-6">
            <div class="bg-slate-950/60 p-5 rounded-xl border border-slate-800 space-y-2">
              <div class="text-xs font-semibold text-slate-400 uppercase">Organización / Ministerio</div>
              <div class="text-lg font-bold text-slate-100">${studio.churchName}</div>
            </div>
            <div class="bg-slate-950/60 p-5 rounded-xl border border-slate-800 space-y-2">
              <div class="text-xs font-semibold text-slate-400 uppercase">Tono Pastoral Configurado</div>
              <div class="text-lg font-bold text-indigo-400">${studio.tone.toUpperCase()}</div>
            </div>
            <div class="bg-slate-950/60 p-5 rounded-xl border border-slate-800 space-y-2">
              <div class="text-xs font-semibold text-slate-400 uppercase">Traducción Bíblica por Defecto</div>
              <div class="text-lg font-bold text-emerald-400">${studio.defaultTranslation}</div>
            </div>
          </div>
        </section>

        <!-- Footer -->
        <footer class="text-center text-xs text-slate-500 pt-6 border-t border-slate-800">
          Presence Platform © 2026 • MIT Licensed • Built for Hackathon Excellence
        </footer>

      </div>

      <!-- Real-time Polling Script -->
      <script>
        async function fetchLiveStream() {
          try {
            const res = await fetch('/api/v1/live-stream');
            if (!res.ok) return;
            const data = await res.json();
            
            // Update Stat counters
            if (data.metrics) {
              document.getElementById('stat-experiences').textContent = data.metrics.experiencesToday;
              document.getElementById('stat-latency').textContent = data.metrics.avgInterventionTimeMs + ' ms';
              document.getElementById('stat-share').textContent = data.metrics.shareRatePercent + '%';
              document.getElementById('stat-theme').textContent = data.metrics.dominantTheme;
            }

            // Update Live Card
            const exp = data.latestExperience;
            if (exp) {
              document.getElementById('live-app').textContent = exp.appName || 'VS Code Extension';
              document.getElementById('live-confidence').textContent = 'Confianza: ' + Math.round((exp.confidence || 0.9) * 100) + '%';
              document.getElementById('live-title').textContent = exp.title || '';
              document.getElementById('live-reflection').textContent = exp.reflection || '';
              document.getElementById('live-quote').childNodes[0].nodeValue = '"' + (exp.scripture ? exp.scripture.text : '') + '" — ';
              document.getElementById('live-reference').textContent = exp.scripture ? exp.scripture.reference : '';
            }

            // Update Stream Table
            if (data.experiences && Array.isArray(data.experiences)) {
              const tbody = document.getElementById('stream-table-body');
              tbody.innerHTML = data.experiences.map(e => \`
                <tr class="hover:bg-slate-900/30 transition">
                  <td class="p-2.5 font-medium text-sky-300">\${e.appName || 'VS Code'}</td>
                  <td class="p-2.5 text-slate-400">\${e.activity || 'programacion'}</td>
                  <td class="p-2.5 font-semibold text-indigo-400">\${e.need.toUpperCase()}</td>
                  <td class="p-2.5 text-slate-200">\${e.scripture ? e.scripture.reference : '-'}</td>
                  <td class="p-2.5"><span class="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Intervenido</span></td>
                </tr>
              \`).join('');
            }
          } catch(err) {
            console.error('Polling error:', err);
          }
        }

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
