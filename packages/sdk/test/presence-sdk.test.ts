import { describe, it, expect } from 'vitest';
import { Presence } from '../src/index.js';

describe('Presence SDK Integration Test', () => {
  it('should initialize single instance and capture context', async () => {
    const presence = Presence.initialize({
      apiKey: 'pk_test_sdk_key',
      platform: 'dev'
    });

    expect(Presence.getInstance()).toBe(presence);

    const exp = await presence.capture({
      activity: 'coding_session',
      topic: 'stuck'
    });

    expect(exp).not.toBeNull();
    expect(exp?.scripture).toBeDefined();
  });
});
