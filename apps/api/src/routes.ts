import { Router, Request, Response } from 'express';
import { Presence } from '@presence/sdk';

export const apiRouter: Router = Router();

// Initialize Presence SDK for API server
const presence = Presence.initialize({
  apiKey: 'pk_live_presence_core_prod',
  platform: 'custom',
  debug: true
});

apiRouter.post('/context', async (req: Request, res: Response) => {
  try {
    const { activity, topic, userId, platform } = req.body;
    if (!activity) {
      return res.status(400).json({ error: 'Activity is required' });
    }

    const experience = await presence.capture({
      activity,
      topic,
      userId: userId || 'usr_anonymous',
      metadata: { platform }
    });

    return res.json({
      success: true,
      intervened: !!experience,
      data: experience
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

apiRouter.get('/experiences/daily', async (req: Request, res: Response) => {
  const experience = await presence.capture({
    activity: 'daily_reflection',
    topic: 'hope',
    userId: 'usr_daily'
  });
  return res.json({ success: true, data: experience });
});

apiRouter.get('/journey', async (req: Request, res: Response) => {
  return res.json({
    success: true,
    data: {
      userId: 'usr_demo',
      currentTheme: 'hope',
      stage: 'growing',
      chapters: [
        {
          chapterNumber: 1,
          theme: 'hope',
          title: 'Capítulo 1: Renovación de la Esperanza',
          experiencesCompleted: 5
        },
        {
          chapterNumber: 2,
          theme: 'perseverance',
          title: 'Capítulo 2: Constancia y Fe',
          experiencesCompleted: 2
        }
      ]
    }
  });
});
