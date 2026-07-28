export function renderDashboardSummary() {
  return {
    metrics: {
      experiencesToday: 1245,
      avgInterventionTimeMs: 420,
      shareRatePercent: 18.4,
      savedRatePercent: 35.2,
      dominantTheme: 'Esperanza (48%)'
    },
    recentEvents: [
      { id: 'evt_101', app: 'Presence Creator', activity: 'editing_reel', topic: 'creative_block', status: 'Intervenido', verse: 'Romanos 15:13' },
      { id: 'evt_102', app: 'Presence Radio', activity: 'listening_stream', topic: 'anxiety', status: 'Intervenido', verse: 'Filipenses 4:6-7' },
      { id: 'evt_103', app: 'Presence Dev', activity: 'coding', topic: 'weariness', status: 'Discernido (No Intervenir)', verse: '-' }
    ]
  };
}
