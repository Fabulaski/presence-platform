import { LiveExperienceStore, LiveStoreItem } from '@presence/core';

export function renderDashboardSummary() {
  const store = LiveExperienceStore.getInstance();
  const metrics = store.getMetrics();
  const experiences = store.getExperiences();

  return {
    metrics,
    recentEvents: experiences.map((exp: LiveStoreItem) => ({
      id: exp.id,
      app: exp.appName || 'Presence Platform App',
      activity: exp.activity || exp.need,
      topic: exp.need,
      status: 'Intervenido',
      verse: exp.scripture.reference
    }))
  };
}
