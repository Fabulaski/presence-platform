import { renderDashboardSummary } from './components/dashboard.js';
import { getDefaultStudioConfig } from './components/studio.js';
import { getLandingContent } from './components/landing.js';

function renderFullWebPlatform() {
  console.log('===========================================================');
  console.log('🌐 PRESENCE PLATFORM WEB: LANDING, DASHBOARD & STUDIO');
  console.log('===========================================================');

  const landing = getLandingContent();
  console.log('\n--- 🚀 HERO LANDING SECTION ---');
  console.log(`Headline: "${landing.hero.headline}"`);
  console.log(`Subheadline: ${landing.hero.subheadline}`);
  console.log('Características:');
  landing.features.forEach((f) => console.log(`  - [${f.title}]: ${f.description}`));

  const dashboard = renderDashboardSummary();
  console.log('\n--- 📊 MISSION CONTROL DASHBOARD ---');
  console.log(`Experiencias Hoy: ${dashboard.metrics.experiencesToday}`);
  console.log(`Tiempo Promedio: ${dashboard.metrics.avgInterventionTimeMs} ms`);
  console.log(`Tasa de Compartidos: ${dashboard.metrics.shareRatePercent}%`);
  console.log(`Tema Dominante: ${dashboard.metrics.dominantTheme}`);
  console.log('Últimos Eventos de Contexto:');
  dashboard.recentEvents.forEach((e) => console.log(`  • [${e.app}] ${e.activity} (${e.topic}) -> ${e.status} (${e.verse})`));

  const studio = getDefaultStudioConfig();
  console.log('\n--- 🎛️ PRESENCE STUDIO (CONFIGURACIÓN DE MINISTERIO) ---');
  console.log(`Organización: ${studio.churchName}`);
  console.log(`Tono Pastoral: ${studio.tone.toUpperCase()}`);
  console.log(`Traducción Bíblica por Defecto: ${studio.defaultTranslation}`);
  console.log(`Umbral de Discernimiento: ${studio.interventionThreshold * 100}%`);
  console.log(`Categorías Activas: ${studio.activeCategories.join(', ')}`);
  console.log('===========================================================\n');
}

renderFullWebPlatform();
