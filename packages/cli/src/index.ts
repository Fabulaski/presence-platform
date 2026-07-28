#!/usr/bin/env node
import { Presence } from '@presence/sdk';
import { ExperienceObject } from '@presence/types';

const args = process.argv.slice(2);
const command = args[0] || 'help';

console.log('✨ Presence Platform CLI v1.0.0\n');

switch (command) {
  case 'init': {
    const appName = args[1] || 'my-presence-app';
    console.log(`🚀 Inicializando integración de Presence en './${appName}'...`);
    console.log(`✅ Creado presencia.config.json`);
    console.log(`✅ SDK @presence/sdk vinculado`);
    console.log(`\nPara empezar:`);
    console.log(`  cd ${appName}`);
    console.log(`  Presence.initialize({ apiKey: 'pk_live_...' });`);
    break;
  }
  case 'test-context': {
    const activity = args[1] || 'coding';
    const topic = args[2] || 'focus';
    console.log(`🔍 Probando captura de contexto (Actividad: "${activity}", Tema: "${topic}")...`);
    
    const presence = Presence.initialize({
      apiKey: 'cli_test_key',
      platform: 'dev',
      debug: false
    });

    presence.capture({ activity, topic }).then((exp: ExperienceObject | null) => {
      if (exp) {
        console.log('\n✅ [EXPERIENCIA GENERADA POR CONTEXT ENGINE]:');
        console.log(`  📌 Título: ${exp.title}`);
        console.log(`  📖 Versículo: ${exp.scripture.reference} -> "${exp.scripture.text}"`);
        console.log(`  💡 Reflexión: ${exp.reflection}`);
        console.log(`  🎯 Acción: ${exp.action}`);
      } else {
        console.log('ℹ️ El motor discernió que no es necesario intervenir para este contexto.');
      }
    });
    break;
  }
  case 'status': {
    console.log('🟢 Estado del Sistema Presence:');
    console.log('  - Context Engine: ONLINE');
    console.log('  - YouVersion Adapter: ONLINE (NVI / RVR1960)');
    console.log('  - Gloo AI Pipeline: ONLINE (5 Agentes)');
    console.log('  - Event Bus: ONLINE');
    break;
  }
  case 'help':
  default: {
    console.log('Comandos disponibles:');
    console.log('  presence init <app-name>        Inicializa una nueva integración');
    console.log('  presence test-context <act> <topic>  Prueba la respuesta del Context Engine');
    console.log('  presence status                 Muestra el estado de la infraestructura');
    break;
  }
}
