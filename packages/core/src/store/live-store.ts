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
}
