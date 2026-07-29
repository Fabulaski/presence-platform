import express from 'express';
import http from 'http';
import { Presence } from '@presence/sdk';

const app = express();
const PORT = process.env.PORT || 3005;

app.use(express.json());

// Middleware for Canva iframe embedding & CORS
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  // Allow iframe embedding inside Canva.com
  res.setHeader('Content-Security-Policy', "frame-ancestors 'self' https://*.canva.com https://canva.com http://localhost:* https://*.loca.lt https://*.ngrok-free.app");
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Initialize Presence SDK for Canva Platform
const presence = Presence.initialize({
  apiKey: 'pk_live_canva_extension_app',
  platform: 'creator',
  debug: true
});

// Endpoint for Canva sidebar to request inspiration
app.post('/api/inspiration', async (req: express.Request, res: express.Response) => {
  try {
    const { activity, topic, language, userId } = req.body;
    
    const experience = await presence.capture({
      userId: userId || 'canva_designer_session',
      activity: activity || 'editing_canva_reel',
      topic: topic || 'creative_block',
      language: language || 'es'
    });

    // Sincronizar silenciosamente en segundo plano con Mission Control Dashboard (puerto 3000)
    if (experience) {
      fetch('http://localhost:3000/api/v1/experience', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          experience,
          activity: activity || 'canva_design',
          appId: 'Canva Extension',
          userId: userId || 'canva_designer_session'
        })
      }).catch(() => {});
    }

    return res.json({ success: true, experience });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// HTML Canva App Extension UI
app.get('/', (req: express.Request, res: express.Response) => {
  res.send(`
<!DOCTYPE html>
<html lang="es" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Presence for Canva — Inspiration & Scripture</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          colors: {
            canva: {
              purple: '#7d2ae8',
              teal: '#00c4cc',
              blue: '#00c4cc',
              dark: '#0e1318',
              card: '#181e24',
              border: '#2c353e'
            }
          }
        }
      }
    }
  </script>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Playfair+Display:ital,wght@0,600;1,400&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Inter', sans-serif; }
    .serif-quote { font-family: 'Playfair Display', serif; }
  </style>
</head>
<body class="bg-slate-900 text-slate-100 min-h-screen flex flex-col md:flex-row transition-colors duration-300">

  <!-- Left: Canva Apps Sidebar Mock (Exact Canva Panel Width ~360px) -->
  <aside class="w-full md:w-[380px] bg-canva-dark border-r border-canva-border flex flex-col h-screen overflow-y-auto shrink-0 p-4 shadow-2xl">
    
    <!-- App Header -->
    <div class="flex items-center justify-between pb-4 border-b border-canva-border mb-4">
      <div class="flex items-center gap-2.5">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-canva-purple to-canva-teal flex items-center justify-center text-white font-bold text-xl shadow-lg">
          🕊️
        </div>
        <div>
          <h1 class="font-bold text-base text-white leading-tight flex items-center gap-1.5">
            Presence <span class="text-xs px-2 py-0.5 rounded-full bg-canva-purple/30 text-purple-300 border border-canva-purple/40 font-normal">Canva App</span>
          </h1>
          <p class="text-xs text-slate-400">Scripture & Inspiration in Canva</p>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <button onclick="toggleLanguage()" id="btn-lang" class="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition">
          ES 🇪🇸
        </button>
        <button onclick="toggleTheme()" id="btn-theme" class="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition">
          🌙 Dark
        </button>
      </div>
    </div>

    <!-- Mode Selector Cards -->
    <div class="space-y-3 mb-5">
      <label class="text-xs font-semibold uppercase tracking-wider text-slate-400 block" id="lbl-mode-select">Modo de Diseño Activo</label>
      
      <div class="grid grid-cols-2 gap-2">
        <button onclick="selectMode('creative_block', 'editing_canva_reel')" id="btn-mode-block" class="mode-btn p-3 rounded-xl bg-canva-purple/20 border-2 border-canva-purple text-left transition hover:scale-[1.02]">
          <span class="text-lg block mb-1">🎬</span>
          <span class="font-bold text-xs text-white block">Reel / Video</span>
          <span class="text-[10px] text-slate-300 block">Bloqueo Creativo</span>
        </button>

        <button onclick="selectMode('anxiety', 'social_poster')" id="btn-mode-poster" class="mode-btn p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-left transition hover:scale-[1.02]">
          <span class="text-lg block mb-1">🖼️</span>
          <span class="font-bold text-xs text-slate-200 block">Póster / Story</span>
          <span class="text-[10px] text-slate-400 block">Ansiedad & Estrés</span>
        </button>

        <button onclick="selectMode('wisdom', 'worship_graphic')" id="btn-mode-worship" class="mode-btn p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-left transition hover:scale-[1.02]">
          <span class="text-lg block mb-1">🎵</span>
          <span class="font-bold text-xs text-slate-200 block">Adoración / Arte</span>
          <span class="text-[10px] text-slate-400 block">Búsqueda Sabiduría</span>
        </button>

        <button onclick="selectMode('hope', 'presentation_slide')" id="btn-mode-presentation" class="mode-btn p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-left transition hover:scale-[1.02]">
          <span class="text-lg block mb-1">📊</span>
          <span class="font-bold text-xs text-slate-200 block">Presentación</span>
          <span class="text-[10px] text-slate-400 block">Esperanza & Fe</span>
        </button>
      </div>
    </div>

    <!-- Action Button -->
    <button onclick="triggerInspiration()" id="btn-action" class="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-canva-purple to-canva-teal hover:opacity-90 font-bold text-sm text-white shadow-lg transition transform active:scale-95 flex items-center justify-center gap-2 mb-5">
      <span>✨</span>
      <span id="btn-action-text">Obtener Inspiración Divina</span>
    </button>

    <!-- Experience Result Card -->
    <div id="experience-card" class="hidden bg-slate-800/90 border border-canva-purple/40 rounded-2xl p-4 shadow-xl space-y-3.5 backdrop-blur">
      <div class="flex items-center justify-between">
        <span id="card-need-badge" class="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
          Esperanza
        </span>
        <span class="text-[10px] text-slate-400 font-mono">Gloo AI Engine</span>
      </div>

      <h3 id="card-title" class="font-bold text-white text-sm leading-snug">
        Un Refugio para tu Proceso Creativo
      </h3>

      <blockquote id="card-scripture" class="serif-quote italic text-sm text-purple-200 border-l-2 border-canva-teal pl-3 py-1 bg-teal-950/20 rounded-r-lg">
        "Porque yo sé los planes que tengo para vosotros, declara el Señor, planes de bienestar y no de calamidad..."
      </blockquote>
      
      <p id="card-reference" class="text-xs font-bold text-canva-teal text-right">
        Jeremías 29:11
      </p>

      <p id="card-reflection" class="text-xs text-slate-300 leading-relaxed pt-1 border-t border-slate-700/60">
        Cuando sientas que las ideas no fluyen en tu diseño, recuerda que la creatividad original proviene del Diseñador por excelencia. Descansa tu mente y confía en el proceso.
      </p>

      <!-- Insert to Canva Canvas Button -->
      <button onclick="insertToCanvaCanvas()" id="btn-insert-canvas" class="w-full py-2.5 px-3 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/50 text-emerald-300 font-bold text-xs transition flex items-center justify-center gap-1.5 shadow">
        <span>📌</span>
        <span id="btn-insert-text">Insertar Cita en el Lienzo de Canva</span>
      </button>

      <a id="card-youversion-link" href="https://www.bible.com/bible/128/JER.29.NVI" target="_blank" class="block text-center text-[11px] text-purple-400 hover:text-purple-300 underline font-medium pt-1">
        📖 Abrir Plan Devocional YouVersion →
      </a>
    </div>

    <!-- Footer status -->
    <div class="mt-auto pt-4 border-t border-canva-border text-center">
      <p class="text-[11px] text-slate-500">
        Presence Platform • Canva Extension v1.0
      </p>
      <a href="http://localhost:3000" target="_blank" class="text-[10px] text-canva-teal hover:underline font-semibold">
        📊 Mission Control Dashboard →
      </a>
    </div>
  </aside>

  <!-- Right: Simulated Canva Editor Workarea & Canvas -->
  <main class="flex-1 bg-slate-950 p-6 md:p-10 flex flex-col items-center justify-center relative overflow-hidden">
    
    <!-- Top Canva Toolbar Simulation -->
    <div class="absolute top-4 left-6 right-6 flex items-center justify-between bg-slate-900/80 backdrop-blur border border-slate-800 px-4 py-2.5 rounded-xl shadow-lg">
      <div class="flex items-center gap-3">
        <span class="text-xs font-bold text-slate-300 flex items-center gap-2">
          <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
          Canva Workspace Editor
        </span>
        <span class="text-xs text-slate-500">|</span>
        <span class="text-xs text-slate-400">Diseño sin título — Instagram Story</span>
      </div>
      <div class="flex items-center gap-2">
        <span class="px-2.5 py-1 text-[11px] rounded-lg bg-slate-800 text-slate-300 border border-slate-700">1080 x 1920 px</span>
        <span class="px-3 py-1 text-[11px] font-bold rounded-lg bg-canva-purple text-white shadow">Compartir</span>
      </div>
    </div>

    <!-- Canva Artboard / Canvas Frame (16:9 vertical preview) -->
    <div class="w-[340px] h-[580px] bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 rounded-2xl border-4 border-slate-800 shadow-2xl relative overflow-hidden flex flex-col justify-between p-6 transition-all duration-500 group">
      
      <!-- Background Graphic Accents -->
      <div class="absolute -top-10 -right-10 w-40 h-40 bg-purple-500/10 rounded-full blur-2xl"></div>
      <div class="absolute -bottom-10 -left-10 w-40 h-40 bg-canva-teal/10 rounded-full blur-2xl"></div>

      <!-- Canvas Header Banner -->
      <div class="z-10 flex justify-between items-center text-slate-400 text-[10px] uppercase tracking-widest font-mono">
        <span>Presence Design</span>
        <span>Canva Layer</span>
      </div>

      <!-- Canvas Dynamic Text Element (Inserted from Presence App) -->
      <div id="canva-canvas-content" class="z-10 my-auto text-center space-y-4 transition-all duration-500 transform scale-95 opacity-80">
        <div class="w-12 h-12 mx-auto rounded-full bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-2xl shadow-inner">
          ✨
        </div>
        <p class="text-xs text-slate-400 italic">
          Haz clic en "Obtener Inspiración Divina" y luego en "Insertar Cita en el Lienzo" para ver el resultado aquí.
        </p>
      </div>

      <!-- Canvas Footer -->
      <div class="z-10 text-center border-t border-white/10 pt-3">
        <p class="text-[10px] text-purple-300/80 font-medium tracking-wide">
          SCRIPTURE IN NEW FRONTIERS • PRESENCE PLATFORM
        </p>
      </div>
    </div>

    <!-- Notification Toast -->
    <div id="toast-notify" class="fixed bottom-6 right-6 hidden bg-emerald-500 text-slate-950 font-bold px-4 py-2.5 rounded-xl shadow-2xl text-xs flex items-center gap-2 animate-bounce">
      <span>✅</span>
      <span id="toast-message">¡Cita añadida al lienzo de Canva con éxito!</span>
    </div>
  </main>

  <!-- Interactive Client Script -->
  <script>
    let currentLang = 'es';
    let currentTheme = 'dark';
    let selectedTopic = 'creative_block';
    let selectedActivity = 'editing_canva_reel';
    let activeExperience = null;

    function toggleTheme() {
      currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
      document.documentElement.classList.toggle('dark', currentTheme === 'dark');
      document.getElementById('btn-theme').textContent = currentTheme === 'dark' ? '🌙 Dark' : '☀️ Light';
    }

    function toggleLanguage() {
      currentLang = currentLang === 'es' ? 'en' : 'es';
      document.getElementById('btn-lang').textContent = currentLang === 'es' ? 'ES 🇪🇸' : 'EN 🇬🇧';
      
      // Update UI Texts
      document.getElementById('lbl-mode-select').textContent = currentLang === 'es' ? 'Modo de Diseño Activo' : 'Active Design Mode';
      document.getElementById('btn-action-text').textContent = currentLang === 'es' ? 'Obtener Inspiración Divina' : 'Seek Divine Inspiration';
      document.getElementById('btn-insert-text').textContent = currentLang === 'es' ? 'Insertar Cita en el Lienzo de Canva' : 'Insert Quote onto Canva Canvas';
    }

    function selectMode(topic, activity) {
      selectedTopic = topic;
      selectedActivity = activity;
      
      document.querySelectorAll('.mode-btn').forEach(b => {
        b.classList.remove('bg-canva-purple/20', 'border-canva-purple');
        b.classList.add('bg-slate-800/80', 'border-slate-700');
      });
      
      event.currentTarget.classList.remove('bg-slate-800/80', 'border-slate-700');
      event.currentTarget.classList.add('bg-canva-purple/20', 'border-canva-purple');
    }

    async function triggerInspiration() {
      const btn = document.getElementById('btn-action');
      btn.disabled = true;
      btn.classList.add('opacity-75');
      document.getElementById('btn-action-text').textContent = currentLang === 'es' ? 'Discerniendo con Gloo AI...' : 'Discerning with Gloo AI...';

      try {
        const res = await fetch('/api/inspiration', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            topic: selectedTopic,
            activity: selectedActivity,
            language: currentLang
          })
        });

        const data = await res.json();
        if (data.success && data.experience) {
          activeExperience = data.experience;
          renderExperienceCard(data.experience);
        }
      } catch (err) {
        console.error(err);
      } finally {
        btn.disabled = false;
        btn.classList.remove('opacity-75');
        document.getElementById('btn-action-text').textContent = currentLang === 'es' ? 'Obtener Inspiración Divina' : 'Seek Divine Inspiration';
      }
    }

    function renderExperienceCard(exp) {
      const card = document.getElementById('experience-card');
      card.classList.remove('hidden');

      document.getElementById('card-need-badge').textContent = exp.need || 'Esperanza';
      document.getElementById('card-title').textContent = exp.title || 'Inspiración Divina';
      document.getElementById('card-scripture').textContent = '"' + (exp.scripture ? exp.scripture.text : '') + '"';
      document.getElementById('card-reference').textContent = exp.scripture ? exp.scripture.reference : '';
      document.getElementById('card-reflection').textContent = exp.reflection || '';
      
      if (exp.youversionUrl) {
        document.getElementById('card-youversion-link').href = exp.youversionUrl;
      }
    }

    function insertToCanvaCanvas() {
      if (!activeExperience) return;

      const canvasContent = document.getElementById('canva-canvas-content');
      canvasContent.classList.remove('scale-95', 'opacity-80');
      canvasContent.classList.add('scale-100', 'opacity-100');

      canvasContent.innerHTML = \`
        <div class="space-y-4 text-center animate-fade-in">
          <span class="text-3xl block">🕊️</span>
          <blockquote class="serif-quote text-lg text-white font-medium italic leading-relaxed drop-shadow-md">
            "\${activeExperience.scripture ? activeExperience.scripture.text : ''}"
          </blockquote>
          <p class="text-sm font-bold text-canva-teal uppercase tracking-widest">
            — \${activeExperience.scripture ? activeExperience.scripture.reference : ''}
          </p>
          <div class="w-16 h-0.5 bg-gradient-to-r from-canva-purple to-canva-teal mx-auto rounded-full mt-3"></div>
          <p class="text-[11px] text-slate-300 max-w-[260px] mx-auto leading-normal">
            \${activeExperience.reflection}
          </p>
        </div>
      \`;

      // Show toast
      const toast = document.getElementById('toast-notify');
      document.getElementById('toast-message').textContent = currentLang === 'es' ? '¡Cita insertada en el lienzo de Canva!' : 'Quote inserted into Canva Canvas!';
      toast.classList.remove('hidden');
      setTimeout(() => toast.classList.add('hidden'), 3500);
    }
  </script>
</body>
</html>
  `);
});

const server = http.createServer(app);

server.listen(PORT, () => {
  console.log(`[Presence Canva Extension] Server running on http://localhost:${PORT}`);
});
