import { Presence } from '@presence/sdk';

async function runRadioDemo() {
  console.log('--- 📻 PRESENCE RADIO DEMO ---');
  console.log('Simulando oyente de radio escuchando música de adoración en momento de ansiedad...');

  const presence = Presence.initialize({
    apiKey: 'pk_live_radio_app_key',
    platform: 'radio',
    debug: true
  });

  const experience = await presence.capture({
    userId: 'radio_listener_44',
    activity: 'listening_worship_stream',
    topic: 'anxiety_peace',
    durationSeconds: 1800
  });

  if (experience) {
    console.log('\n✅ [EXP INTERRUPCIÓN REPRODUCCIÓN]:');
    console.log('Intervención:', experience.title);
    console.log('Versículo:', experience.scripture.reference, `"${experience.scripture.text}"`);
    console.log('Oración Corta:', experience.prayer);
  }
}

runRadioDemo();
