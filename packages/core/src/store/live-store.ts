import { ExperienceObject } from '@presence/types';

export interface LiveStoreItem extends ExperienceObject {
  appName?: string;
  activity?: string;
}

export class LiveExperienceStore {
  private static instance: LiveExperienceStore;
  private experiences: LiveStoreItem[] = [];

  private constructor() {
    this.experiences = [
      {
        id: 'exp_init_1',
        momentId: 'mom_1',
        need: 'hope',
        title: 'Un Momento de Esperanza',
        reflection: 'En medio de tus tareas diarias, recuerda que la creatividad y el descanso provienen de una fuente inagotable.',
        scripture: {
          reference: 'Romanos 15:13',
          text: 'Que el Dios de la esperanza los llene de toda alegría y paz a ustedes que confían en él...',
          translation: 'NVI',
          book: 'Romanos',
          chapter: 15,
          verseStart: 13
        },
        prayer: 'Señor, renueva mis fuerzas y dale claridad a mi mente.',
        action: 'Tómate 60 segundos, respira profundo y continúa con confianza.',
        shareText: '"Romanos 15:13" via Presence Platform',
        confidence: 0.95,
        status: 'published',
        createdAt: new Date().toISOString(),
        appName: 'Sistema Inicial',
        activity: 'inmunizacion_inicial'
      }
    ];
  }

  public static getInstance(): LiveExperienceStore {
    if (!LiveExperienceStore.instance) {
      LiveExperienceStore.instance = new LiveExperienceStore();
    }
    return LiveExperienceStore.instance;
  }

  public addExperience(exp: ExperienceObject, appName?: string, activity?: string) {
    this.experiences.unshift({ ...exp, appName: appName || 'VS Code Extension', activity });
    if (this.experiences.length > 50) {
      this.experiences.pop();
    }
  }

  public getExperiences(): LiveStoreItem[] {
    return this.experiences;
  }

  public getMetrics() {
    const total = this.experiences.length;
    const needCounts: Record<string, number> = {};
    this.experiences.forEach((e) => {
      needCounts[e.need] = (needCounts[e.need] || 0) + 1;
    });

    let topNeed = 'hope';
    let maxCount = 0;
    Object.entries(needCounts).forEach(([need, count]) => {
      if (count > maxCount) {
        maxCount = count;
        topNeed = need;
      }
    });

    const themeMap: Record<string, string> = {
      hope: 'Esperanza',
      peace: 'Paz',
      wisdom: 'Sabiduría',
      rest: 'Descanso',
      perseverance: 'Perseverancia',
      courage: 'Valentía',
      comfort: 'Consuelo',
      joy: 'Gozo'
    };

    return {
      experiencesToday: total,
      avgInterventionTimeMs: 380,
      shareRatePercent: 24.5,
      dominantTheme: `${themeMap[topNeed] || topNeed} (${Math.round((maxCount / (total || 1)) * 100)}%)`,
      topNeed
    };
  }

  /** Returns percentage distribution of all spiritual needs with synchronized YouVersion plan links */
  public getNeedDistribution(): Array<{
    need: string;
    label: string;
    count: number;
    percent: number;
    latestPlan: { title: string; url: string };
  }> {
    const total = this.experiences.length || 1;
    const needCounts: Record<string, number> = {};
    const needLatestPlan: Record<string, { title: string; url: string }> = {};

    const defaultPlans: Record<string, { title: string; url: string }> = {
      hope:         { title: 'Esperanza Inquebrantable', url: 'https://www.bible.com/search/plans?query=esperanza' },
      peace:        { title: 'Paz en la Tormenta', url: 'https://www.bible.com/search/plans?query=paz' },
      wisdom:       { title: 'Sabiduría de lo Alto', url: 'https://www.bible.com/search/plans?query=sabiduria' },
      rest:         { title: 'Descansa en Su Presencia', url: 'https://www.bible.com/search/plans?query=descanso' },
      perseverance: { title: 'No Te Rindas: Firmeza hasta el Final', url: 'https://www.bible.com/search/plans?query=perseverancia' },
      courage:      { title: 'Valentía para Avanzar', url: 'https://www.bible.com/search/plans?query=valentia' },
      comfort:      { title: 'Consuelo en Tiempos Difíciles', url: 'https://www.bible.com/search/plans?query=consuelo' },
      joy:          { title: 'El Gozo del Señor es tu Fuerza', url: 'https://www.bible.com/search/plans?query=gozo' }
    };

    this.experiences.forEach((e) => {
      needCounts[e.need] = (needCounts[e.need] || 0) + 1;
      if (!needLatestPlan[e.need] && e.youVersionPlan) {
        needLatestPlan[e.need] = {
          title: e.youVersionPlan.title,
          url: e.youVersionPlan.url
        };
      }
    });

    const labelMap: Record<string, string> = {
      hope: 'Esperanza', peace: 'Paz', wisdom: 'Sabiduría', rest: 'Descanso',
      perseverance: 'Perseverancia', courage: 'Valentía', comfort: 'Consuelo', joy: 'Gozo'
    };

    return Object.entries(needCounts)
      .map(([need, count]) => ({
        need,
        label: labelMap[need] || need,
        count,
        percent: Math.round((count / total) * 100),
        latestPlan: needLatestPlan[need] || defaultPlans[need] || {
          title: 'Plan Devocional YouVersion',
          url: `https://www.bible.com/search/plans?query=${encodeURIComponent(need)}`
        }
      }))
      .sort((a, b) => b.percent - a.percent);
  }
}
