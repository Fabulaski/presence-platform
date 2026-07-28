export interface StudioConfig {
  churchName: string;
  tone: 'pastoral' | 'inspirational' | 'educational' | 'contemplative';
  defaultTranslation: 'NVI' | 'RVR1960' | 'TLA' | 'NIV';
  interventionThreshold: number; // 0.0 to 1.0
  activeCategories: string[];
}

export function getDefaultStudioConfig(): StudioConfig {
  return {
    churchName: 'Ministerio Ecosistema Digital',
    tone: 'pastoral',
    defaultTranslation: 'NVI',
    interventionThreshold: 0.65,
    activeCategories: ['creative_block', 'anxiety', 'weariness', 'celebration']
  };
}
