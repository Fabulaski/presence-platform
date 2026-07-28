import { Presence } from '@presence/sdk';

async function runDevDemo() {
  console.log('--- 💻 PRESENCE DEV DEMO (VS CODE PLUGIN) ---');
  console.log('Simulando desarrollador programando por 4 horas seguidas...');

  const presence = Presence.initialize({
    apiKey: 'pk_live_vscode_plugin_key',
    platform: 'dev',
    debug: true
  });

  const experience = await presence.capture({
    userId: 'dev_user_77',
    activity: 'coding_marathon',
    topic: 'weariness_rest',
    durationSeconds: 14400
  });

  if (experience) {
    console.log('\n✅ [EXP VS CODE STATUS BAR / POPUP]:');
    console.log('Recordatorio:', experience.title);
    console.log('Pasaje:', experience.scripture.reference);
    console.log('Mensaje:', `"${experience.scripture.text}"`);
    console.log('Pausa Recomendada:', experience.action);
  }
}

runDevDemo();
