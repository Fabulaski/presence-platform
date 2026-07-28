import { Presence } from '@presence/sdk';

async function runCreatorDemo() {
  console.log('--- 🎬 PRESENCE CREATOR DEMO ---');
  console.log('Simulando creador editando un Reel sobre bloqueo creativo y esperanza...');

  const presence = Presence.initialize({
    apiKey: 'pk_live_creator_app_key',
    platform: 'creator',
    debug: true
  });

  const experience = await presence.capture({
    userId: 'creator_usr_99',
    activity: 'editing_reel',
    topic: 'creative_block_hope',
    durationSeconds: 2500
  });

  if (experience) {
    console.log('\n✅ [EXP GENERADA EN 5s]:');
    console.log('Título:', experience.title);
    console.log('Reflexión:', experience.reflection);
    console.log('Versículo:', experience.scripture.reference, `"${experience.scripture.text}"`);
    console.log('Acción Recomendada:', experience.action);
  } else {
    console.log('El Context Engine discernió no intervenir en esta ocasión.');
  }
}

runCreatorDemo();
