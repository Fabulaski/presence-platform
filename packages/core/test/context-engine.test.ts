import { describe, it, expect } from 'vitest';
import { ContextEngine, YouVersionScriptureAdapter, GlooAIPipelineAdapter } from '../src/index.js';
import { ContextEvent } from '@presence/types';

describe('ContextEngine Discernment & Pipeline Test', () => {
  const scriptureService = new YouVersionScriptureAdapter();
  const aiPipeline = new GlooAIPipelineAdapter();
  const engine = new ContextEngine(scriptureService, aiPipeline);

  it('should generate an experience for a valid creative block event', async () => {
    const event: ContextEvent = {
      id: 'ctx_test_1',
      appId: 'pk_test',
      userId: 'usr_test',
      platform: 'creator',
      activity: 'editing_reel',
      topic: 'creative_block',
      confidence: 0.9,
      timestamp: new Date().toISOString()
    };

    const exp = await engine.processContext(event);
    expect(exp).not.toBeNull();
    expect(exp?.need).toBe('hope');
    expect(exp?.title).toBeDefined();
    expect(exp?.scripture.reference).toBeDefined();
  });

  it('should discern NOT to intervene when confidence is very low (< 0.3)', async () => {
    const event: ContextEvent = {
      id: 'ctx_test_low_conf',
      appId: 'pk_test',
      userId: 'usr_test',
      platform: 'custom',
      activity: 'random_scrolling',
      confidence: 0.1,
      timestamp: new Date().toISOString()
    };

    const exp = await engine.processContext(event);
    expect(exp).toBeNull();
  });
});
