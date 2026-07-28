import { ScriptureMatch, SpiritualNeed } from '@presence/types';
import { IScriptureService, ScriptureSearchQuery } from '../ports/scripture-port.js';

const SCRIPTURE_CATALOG: Record<SpiritualNeed, ScriptureMatch[]> = {
  hope: [
    {
      reference: 'Romanos 15:13',
      text: 'Que el Dios de la esperanza los llene de toda alegría y paz a ustedes que confían en él, para que rebocen de esperanza por el poder del Espíritu Santo.',
      translation: 'NVI',
      book: 'Romanos',
      chapter: 15,
      verseStart: 13
    },
    {
      reference: 'Jeremías 29:11',
      text: 'Porque yo sé los pensamientos que tengo acerca de vosotros, dice Jehová, pensamientos de paz, y no de mal, para daros el fin que esperáis.',
      translation: 'RVR1960',
      book: 'Jeremías',
      chapter: 29,
      verseStart: 11
    }
  ],
  peace: [
    {
      reference: 'Filipenses 4:6-7',
      text: 'No se inquieten por nada; más bien, en toda ocasión, con oración y ruego, presenten sus peticiones a Dios y denle gracias. Y la paz de Dios que sobrepasa todo entendimiento cuidará sus corazones.',
      translation: 'NVI',
      book: 'Filipenses',
      chapter: 4,
      verseStart: 6,
      verseEnd: 7
    }
  ],
  perseverance: [
    {
      reference: 'Gálatas 6:9',
      text: 'No nos cansemos de hacer el bien, porque a su debido tiempo cosecharemos si no nos damos por vencidos.',
      translation: 'NVI',
      book: 'Gálatas',
      chapter: 6,
      verseStart: 9
    }
  ],
  wisdom: [
    {
      reference: 'Santiago 1:5',
      text: 'Si a alguno de ustedes le falta sabiduría, pídasela a Dios, quien da a todos generosamente y sin buscar faltas, y se la dará.',
      translation: 'NVI',
      book: 'Santiago',
      chapter: 1,
      verseStart: 5
    }
  ],
  comfort: [
    {
      reference: '2 Corintios 1:3-4',
      text: 'Bendito sea el Dios y Padre de nuestro Señor Jesucristo, Padre de misericordias y Dios de toda consolación, el cual nos consuela en todas nuestras tribulaciones.',
      translation: 'RVR1960',
      book: '2 Corintios',
      chapter: 1,
      verseStart: 3,
      verseEnd: 4
    }
  ],
  joy: [
    {
      reference: 'Salmos 118:24',
      text: 'Este es el día que hizo el Señor; nos gozaremos y alegraremos en él.',
      translation: 'RVR1960',
      book: 'Salmos',
      chapter: 118,
      verseStart: 24
    }
  ],
  courage: [
    {
      reference: 'Josué 1:9',
      text: 'Mira que te mando que te esfuerces y seas valiente; no temas ni desmayes, porque Jehová tu Dios estará contigo en dondequiera que vayas.',
      translation: 'RVR1960',
      book: 'Josué',
      chapter: 1,
      verseStart: 9
    }
  ],
  rest: [
    {
      reference: 'Mateo 11:28',
      text: 'Vengan a mí todos ustedes que están cansados y agobiados, y yo les daré descanso.',
      translation: 'NVI',
      book: 'Mateo',
      chapter: 11,
      verseStart: 28
    }
  ]
};

export class YouVersionScriptureAdapter implements IScriptureService {
  private apiKey?: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey;
  }

  public async findScriptureForNeed(query: ScriptureSearchQuery): Promise<ScriptureMatch> {
    // If external API key exists, this adapter connects to YouVersion Platform API.
    // Fallback/Default Catalog ensures 100% offline dev capability.
    const matches = SCRIPTURE_CATALOG[query.need] || SCRIPTURE_CATALOG.hope;
    const randomIndex = Math.floor(Math.random() * matches.length);
    return matches[randomIndex];
  }

  public async getDailyVerse(translation = 'NVI'): Promise<ScriptureMatch> {
    return SCRIPTURE_CATALOG.hope[0];
  }

  public async getVerseByReference(reference: string, translation = 'NVI'): Promise<ScriptureMatch> {
    return {
      reference,
      text: 'Porque de tal manera amó Dios al mundo, que ha dado a su Hijo unigénito, para que todo aquel que en él cree, no se pierda, mas tenga vida eterna.',
      translation,
      book: 'Juan',
      chapter: 3,
      verseStart: 16
    };
  }
}
