import { ScriptureMatch, SpiritualNeed } from '@presence/types';
import { IScriptureService, ScriptureSearchQuery } from '../ports/scripture-port.js';

const DEFAULT_YOUVERSION_KEY = 'kJUhmDGjfa4guaAirEbEfWpL2rwUGhTwOyl04woquaK56VoK';

const SCRIPTURE_CATALOG: Record<SpiritualNeed, ScriptureMatch[]> = {
  hope: [
    {
      reference: 'Romanos 15:13',
      text: 'Que el Dios de la esperanza los llene de toda alegría y paz a ustedes que confían en él, para que rebosen de esperanza por el poder del Espíritu Santo.',
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
    },
    {
      reference: 'Isaías 40:31',
      text: 'Pero los que confían en el Señor renovarán sus fuerzas; volarán como las águilas: correrán y no se fatigarán, caminarán y no se cansarán.',
      translation: 'NVI',
      book: 'Isaías',
      chapter: 40,
      verseStart: 31
    },
    {
      reference: 'Salmos 42:11',
      text: '¿Por qué voy a inquietarme? ¿Por qué voy a angustiarme? En Dios pondré mi esperanza, y todavía lo alabaré. ¡Él es mi Salvador y mi Dios!',
      translation: 'NVI',
      book: 'Salmos',
      chapter: 42,
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
    },
    {
      reference: 'Juan 14:27',
      text: 'La paz les dejo; mi paz les doy. Yo no se la doy a ustedes como la da el mundo. No se angustien ni se acobarden.',
      translation: 'NVI',
      book: 'Juan',
      chapter: 14,
      verseStart: 27
    },
    {
      reference: 'Isaías 26:3',
      text: 'Tú guardarás en completa paz a aquel cuyo pensamiento en ti persevera; porque en ti ha confiado.',
      translation: 'RVR1960',
      book: 'Isaías',
      chapter: 26,
      verseStart: 3
    },
    {
      reference: 'Salmos 4:8',
      text: 'En paz me acostaré y asimismo dormiré, porque solo tú, Señor, me haces vivir confiado.',
      translation: 'RVR1960',
      book: 'Salmos',
      chapter: 4,
      verseStart: 8
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
    },
    {
      reference: 'Hebreos 12:1-2',
      text: 'Corramos con perseverancia la carrera que tenemos por delante, fijando la mirada en Jesús, el iniciador y perfeccionador de nuestra fe.',
      translation: 'NVI',
      book: 'Hebreos',
      chapter: 12,
      verseStart: 1,
      verseEnd: 2
    },
    {
      reference: 'Santiago 1:12',
      text: 'Dichoso el que resiste la prueba porque, al salir aprobado, recibirá la corona de la vida que el Señor ha prometido a quienes lo aman.',
      translation: 'NVI',
      book: 'Santiago',
      chapter: 1,
      verseStart: 12
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
    },
    {
      reference: 'Proverbios 3:5-6',
      text: 'Confía en el Señor de todo corazón, y no te apoyes en tu propia prudencia. Reconócelo en todos tus caminos, y él allanará tus sendas.',
      translation: 'NVI',
      book: 'Proverbios',
      chapter: 3,
      verseStart: 5,
      verseEnd: 6
    },
    {
      reference: 'Proverbios 2:6',
      text: 'Porque el Señor da la sabiduría; de su boca proceden el conocimiento y la inteligencia.',
      translation: 'NVI',
      book: 'Proverbios',
      chapter: 2,
      verseStart: 6
    },
    {
      reference: 'Efesios 1:17',
      text: 'Pido que el Dios de nuestro Señor Jesucristo les dé el Espíritu de sabiduría y de revelación, para que lo conozcan mejor.',
      translation: 'NVI',
      book: 'Efesios',
      chapter: 1,
      verseStart: 17
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
    },
    {
      reference: 'Salmos 23:4',
      text: 'Aunque pase por el valle de sombra de muerte, no temeré mal alguno, porque tú estarás conmigo; tu vara y tu cayado me infundirán aliento.',
      translation: 'NVI',
      book: 'Salmos',
      chapter: 23,
      verseStart: 4
    },
    {
      reference: 'Salmos 34:18',
      text: 'Cercano está el Señor a los quebrantados de corazón, y salva a los contritos de espíritu.',
      translation: 'RVR1960',
      book: 'Salmos',
      chapter: 34,
      verseStart: 18
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
    },
    {
      reference: 'Nehemías 8:10',
      text: 'No estén tristes, pues el gozo del Señor es su fortaleza.',
      translation: 'NVI',
      book: 'Nehemías',
      chapter: 8,
      verseStart: 10
    },
    {
      reference: 'Filipenses 4:4',
      text: 'Alégrense siempre en el Señor. Insisto: ¡Alégrense!',
      translation: 'NVI',
      book: 'Filipenses',
      chapter: 4,
      verseStart: 4
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
    },
    {
      reference: 'Salmos 27:1',
      text: 'El Señor es mi luz y mi salvación; ¿a quién temeré? El Señor es el baluarte de mi vida; ¿quién podrá amedrentarme?',
      translation: 'NVI',
      book: 'Salmos',
      chapter: 27,
      verseStart: 1
    },
    {
      reference: 'Isaías 41:10',
      text: 'No temas, porque yo estoy contigo; no desmayes, porque yo soy tu Dios que te esfuerzo; siempre te ayudaré, siempre te sustentaré con la diestra de mi justicia.',
      translation: 'RVR1960',
      book: 'Isaías',
      chapter: 41,
      verseStart: 10
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
    },
    {
      reference: 'Salmos 62:1',
      text: 'En Dios solamente descansa mi alma; de él viene mi salvación.',
      translation: 'RVR1960',
      book: 'Salmos',
      chapter: 62,
      verseStart: 1
    },
    {
      reference: 'Éxodo 33:14',
      text: 'Mi presencia irá contigo, y te daré descanso —respondió el Señor.',
      translation: 'NVI',
      book: 'Éxodo',
      chapter: 33,
      verseStart: 14
    }
  ]
};

const SCRIPTURE_CATALOG_EN: Record<SpiritualNeed, ScriptureMatch[]> = {
  hope: [
    {
      reference: 'Romans 15:13',
      text: 'May the God of hope fill you with all joy and peace as you trust in him, so that you may overflow with hope by the power of the Holy Spirit.',
      translation: 'NIV',
      book: 'Romans',
      chapter: 15,
      verseStart: 13
    },
    {
      reference: 'Jeremiah 29:11',
      text: 'For I know the plans I have for you, declares the LORD, plans to prosper you and not to harm you, plans to give you hope and a future.',
      translation: 'NIV',
      book: 'Jeremiah',
      chapter: 29,
      verseStart: 11
    },
    {
      reference: 'Isaiah 40:31',
      text: 'But those who hope in the LORD will renew their strength. They will soar on wings like eagles; they will run and not grow weary, they will walk and not be faint.',
      translation: 'NIV',
      book: 'Isaiah',
      chapter: 40,
      verseStart: 31
    }
  ],
  peace: [
    {
      reference: 'Philippians 4:6-7',
      text: 'Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God. And the peace of God, which transcends all understanding, will guard your hearts and your minds in Christ Jesus.',
      translation: 'NIV',
      book: 'Philippians',
      chapter: 4,
      verseStart: 6,
      verseEnd: 7
    },
    {
      reference: 'John 14:27',
      text: 'Peace I leave with you; my peace I give you. I do not give to you as the world gives. Do not let your hearts be troubled and do not be afraid.',
      translation: 'NIV',
      book: 'John',
      chapter: 14,
      verseStart: 27
    },
    {
      reference: 'Isaiah 26:3',
      text: 'You will keep in perfect peace those whose minds are steadfast, because they trust in you.',
      translation: 'NIV',
      book: 'Isaiah',
      chapter: 26,
      verseStart: 3
    },
    {
      reference: 'Psalms 4:8',
      text: 'In peace I will lie down and sleep, for you alone, LORD, make me dwell in safety.',
      translation: 'NIV',
      book: 'Psalms',
      chapter: 4,
      verseStart: 8
    }
  ],
  perseverance: [
    {
      reference: 'Galatians 6:9',
      text: 'Let us not become weary in doing good, for at the proper time we will reap a harvest if we do not give up.',
      translation: 'NIV',
      book: 'Galatians',
      chapter: 6,
      verseStart: 9
    },
    {
      reference: 'Hebrews 12:1-2',
      text: 'Let us run with perseverance the race marked out for us, fixing our eyes on Jesus, the pioneer and perfecter of faith.',
      translation: 'NIV',
      book: 'Hebrews',
      chapter: 12,
      verseStart: 1,
      verseEnd: 2
    },
    {
      reference: 'James 1:12',
      text: 'Blessed is the one who perseveres under trial because, having stood the test, that person will receive the crown of life.',
      translation: 'NIV',
      book: 'James',
      chapter: 1,
      verseStart: 12
    }
  ],
  wisdom: [
    {
      reference: 'James 1:5',
      text: 'If any of you lacks wisdom, you should ask God, who gives generously to all without finding fault, and it will be given to you.',
      translation: 'NIV',
      book: 'James',
      chapter: 1,
      verseStart: 5
    },
    {
      reference: 'Proverbs 3:5-6',
      text: 'Trust in the LORD with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight.',
      translation: 'NIV',
      book: 'Proverbs',
      chapter: 3,
      verseStart: 5,
      verseEnd: 6
    },
    {
      reference: 'Proverbs 2:6',
      text: 'For the LORD gives wisdom; from his mouth come knowledge and understanding.',
      translation: 'NIV',
      book: 'Proverbs',
      chapter: 2,
      verseStart: 6
    }
  ],
  comfort: [
    {
      reference: '2 Corinthians 1:3-4',
      text: 'Praise be to the God and Father of our Lord Jesus Christ, the Father of compassion and the God of all comfort, who comforts us in all our troubles.',
      translation: 'NIV',
      book: '2 Corinthians',
      chapter: 1,
      verseStart: 3,
      verseEnd: 4
    },
    {
      reference: 'Psalms 23:4',
      text: 'Even though I walk through the darkest valley, I will fear no evil, for you are with me; your rod and your staff, they comfort me.',
      translation: 'NIV',
      book: 'Psalms',
      chapter: 23,
      verseStart: 4
    }
  ],
  joy: [
    {
      reference: 'Psalms 118:24',
      text: 'This is the day the LORD has made; let us rejoice and be glad in it.',
      translation: 'NIV',
      book: 'Psalms',
      chapter: 118,
      verseStart: 24
    },
    {
      reference: 'Philippians 4:4',
      text: 'Rejoice in the Lord always. I will say it again: Rejoice!',
      translation: 'NIV',
      book: 'Philippians',
      chapter: 4,
      verseStart: 4
    }
  ],
  courage: [
    {
      reference: 'Joshua 1:9',
      text: 'Have I not commanded you? Be strong and courageous. Do not be afraid; do not be discouraged, for the LORD your God will be with you wherever you go.',
      translation: 'NIV',
      book: 'Joshua',
      chapter: 1,
      verseStart: 9
    },
    {
      reference: 'Isaiah 41:10',
      text: 'So do not fear, for I am with you; do not be dismayed, for I am your God. I will strengthen you and help you; I will uphold you with my righteous right hand.',
      translation: 'NIV',
      book: 'Isaiah',
      chapter: 41,
      verseStart: 10
    }
  ],
  rest: [
    {
      reference: 'Matthew 11:28',
      text: 'Come to me, all you who are weary and burdened, and I will give you rest.',
      translation: 'NIV',
      book: 'Matthew',
      chapter: 11,
      verseStart: 28
    },
    {
      reference: 'Psalms 62:1',
      text: 'Truly my soul finds rest in God; my salvation comes from him.',
      translation: 'NIV',
      book: 'Psalms',
      chapter: 62,
      verseStart: 1
    }
  ]
};

export class YouVersionScriptureAdapter implements IScriptureService {
  private apiKey: string;
  private endpointUrl: string;

  constructor(apiKey?: string, endpointUrl?: string) {
    this.apiKey = apiKey || process.env.YOUVERSION_API_KEY || DEFAULT_YOUVERSION_KEY;
    this.endpointUrl = endpointUrl || process.env.YOUVERSION_ENDPOINT || 'https://api.youversion.com/v1';
  }

  public async findScriptureForNeed(query: ScriptureSearchQuery): Promise<ScriptureMatch> {
    const lang = query.language || 'es';
    if (this.apiKey) {
      try {
        console.log(`[YouVersion API] Fetching live passage with developer token for need: "${query.need}" in language: "${lang}"`);
        const response = await fetch(`${this.endpointUrl}/passages/search?query=${encodeURIComponent(query.need)}&language=${lang}`, {
          headers: {
            'X-YouVersion-Developer-Token': this.apiKey,
            'Accept': 'application/json'
          }
        });

        if (response.ok) {
          const data = (await response.json()) as any;
          if (data && data.reference && data.text) {
            return {
              reference: data.reference,
              text: data.text,
              translation: query.translation || (lang === 'en' ? 'NIV' : 'NVI'),
              book: data.book || (lang === 'en' ? 'Bible' : 'Biblia'),
              chapter: data.chapter || 1,
              verseStart: data.verseStart || 1
            };
          }
        }
      } catch (err: any) {
        console.warn(`[YouVersion API] Fallback to rich dynamic catalog: ${err.message}`);
      }
    }

    const catalog = lang === 'en' ? SCRIPTURE_CATALOG_EN : SCRIPTURE_CATALOG;
    const matches = catalog[query.need] || catalog.hope;
    const randomIndex = Math.floor(Math.random() * matches.length);
    return matches[randomIndex];
  }

  public async getDailyVerse(translation = 'NVI'): Promise<ScriptureMatch> {
    const list = SCRIPTURE_CATALOG.hope;
    return list[Math.floor(Math.random() * list.length)];
  }

  public async getVerseByReference(reference: string, translation = 'NVI'): Promise<ScriptureMatch> {
    try {
      const res = await fetch(`https://bible-api.com/${encodeURIComponent(reference)}`);
      if (res.ok) {
        const data = (await res.json()) as any;
        if (data && data.text) {
          return {
            reference: data.reference || reference,
            text: data.text.trim(),
            translation,
            book: data.verses?.[0]?.book_name || reference.split(' ')[0],
            chapter: data.verses?.[0]?.chapter || 1,
            verseStart: data.verses?.[0]?.verse || 1
          };
        }
      }
    } catch (err) {
      // fallback
    }

    return {
      reference,
      text: 'Porque de tal manera amó Dios al mundo, que ha dado a su Hijo unigénito, para que todo aquel que en él cree, no se pierda, mas tenga vida eterna.',
      translation,
      book: 'Juan',
      chapter: 3,
      verseStart: 16
    };
  }

  public async getReadingPlanForNeed(need: SpiritualNeed, topic?: string, language?: string): Promise<{ title: string; url: string; description?: string }> {
    const lang = language || 'es';
    const youVersionLocale = YOUVERSION_LOCALE_MAP[lang] || lang;

    const needQueryMap: Record<string, Record<SpiritualNeed, string>> = {
      es: { hope: 'esperanza', peace: 'paz', wisdom: 'sabiduria', rest: 'descanso', perseverance: 'perseverancia', courage: 'valentia', comfort: 'consuelo', joy: 'gozo' },
      en: { hope: 'hope', peace: 'peace', wisdom: 'wisdom', rest: 'rest', perseverance: 'perseverance', courage: 'courage', comfort: 'comfort', joy: 'joy' },
      pt: { hope: 'esperanca', peace: 'paz', wisdom: 'sabedoria', rest: 'descanso', perseverance: 'perseveranca', courage: 'coragem', comfort: 'consolo', joy: 'alegria' }
    };
    const needTerms = needQueryMap[lang] || needQueryMap['es'];
    const searchTerm = needTerms[need] || need;

    if (this.apiKey) {
      try {
        console.log(`[YouVersion API] Querying devotional plans for need: "${need}" in language: "${lang}"`);
        const response = await fetch(`${this.endpointUrl}/plans/search?query=${encodeURIComponent(searchTerm)}&language=${lang}`, {
          headers: {
            'X-YouVersion-Developer-Token': this.apiKey,
            'Accept': 'application/json'
          }
        });

        if (response.ok) {
          const data = (await response.json()) as any;
          if (data && data.plans && data.plans.length > 0) {
            const firstPlan = data.plans[0];
            const planTitle = firstPlan.title || firstPlan.name;
            // Only use explicit full URLs from API if they match the current locale, otherwise use localized search URL
            const planUrl = (firstPlan.url && firstPlan.url.includes(`/${youVersionLocale}/`))
              ? firstPlan.url
              : `https://www.bible.com/${youVersionLocale}/reading-plans-search?query=${encodeURIComponent(planTitle || searchTerm)}`;

            return {
              title: planTitle || (lang === 'en' ? 'Devotional Plan' : 'Plan Devocional'),
              url: planUrl,
              description: firstPlan.description || undefined
            };
          }
        }
      } catch (err: any) {
        console.warn(`[YouVersion API] Fallback for devotional plans: ${err.message}`);
      }
    }

    // Fallback: use curated multilingual catalog
    const langPlans = YOUVERSION_PLANS_I18N[lang] || YOUVERSION_PLANS_I18N['es'];
    const plans = langPlans[need] || langPlans.hope;
    const selected = plans[Math.floor(Math.random() * plans.length)];

    return {
      ...selected,
      url: selected.url.replace('{locale}', youVersionLocale).replace('{query}', encodeURIComponent(searchTerm))
    };
  }
}

// ─── YouVersion Locale Mapping ──────────────────────────────────────────────
const YOUVERSION_LOCALE_MAP: Record<string, string> = {
  es: 'es', en: 'en', pt: 'pt', fr: 'fr', de: 'de', it: 'it',
  ko: 'ko', ja: 'ja', zh: 'zh', ru: 'ru', ar: 'ar', hi: 'hi',
  nl: 'nl', pl: 'pl', sv: 'sv', da: 'da', no: 'no', fi: 'fi'
};

// ─── Multilingual YouVersion Reading Plans Catalog ──────────────────────────
type PlanEntry = { title: string; url: string; description: string };
type NeedPlans = Record<SpiritualNeed, PlanEntry[]>;

const YOUVERSION_PLANS_I18N: Record<string, NeedPlans> = {
  es: {
    hope: [
      { title: 'Esperanza Inquebrantable', url: 'https://www.bible.com/{locale}/reading-plans-search?query=esperanza', description: 'Renueva tu fe y encuentra esperanza renovada para superar cualquier obstáculo en tu jornada.' }
    ],
    peace: [
      { title: 'Paz en la Tormenta', url: 'https://www.bible.com/{locale}/reading-plans-search?query=paz', description: 'Encuentra calma y serenidad mental cuando la presión y la ansiedad intentan abrumarte.' }
    ],
    wisdom: [
      { title: 'Sabiduría de lo Alto', url: 'https://www.bible.com/{locale}/reading-plans-search?query=sabiduria', description: 'Luz y dirección divina para tomar decisiones sabias y estructurar soluciones complejas.' }
    ],
    rest: [
      { title: 'Descansa en Su Presencia', url: 'https://www.bible.com/{locale}/reading-plans-search?query=descanso', description: 'Un llamado a pausar, soltar el agotamiento mental y renovar tus fuerzas en Dios.' }
    ],
    perseverance: [
      { title: 'No Te Rindas: Firmeza hasta el Final', url: 'https://www.bible.com/{locale}/reading-plans-search?query=perseverancia', description: 'Fortaleza espiritual para continuar construyendo y no desmayar ante el cansancio.' }
    ],
    courage: [
      { title: 'Valentía para Avanzar', url: 'https://www.bible.com/{locale}/reading-plans-search?query=valentia', description: 'Vence el temor al fallo y toma decisiones valientes para innovar y crear.' }
    ],
    comfort: [
      { title: 'Consuelo en Tiempos Difíciles', url: 'https://www.bible.com/{locale}/reading-plans-search?query=consuelo', description: 'El abrazo amoroso de Dios cerca de quienes atraviesan agobio o dolor.' }
    ],
    joy: [
      { title: 'El Gozo del Señor es tu Fuerza', url: 'https://www.bible.com/{locale}/reading-plans-search?query=gozo', description: 'Celebra cada logro y vive con gratitud y alegría continua en tu labor.' }
    ]
  },
  en: {
    hope: [
      { title: 'Unshakeable Hope', url: 'https://www.bible.com/{locale}/reading-plans-search?query=hope', description: 'Renew your faith and find renewed hope to overcome any obstacle in your journey.' }
    ],
    peace: [
      { title: 'Peace in the Storm', url: 'https://www.bible.com/{locale}/reading-plans-search?query=peace', description: 'Find calm and mental serenity when pressure and anxiety try to overwhelm you.' }
    ],
    wisdom: [
      { title: 'Wisdom from Above', url: 'https://www.bible.com/{locale}/reading-plans-search?query=wisdom', description: 'Divine light and direction to make wise decisions and structure complex solutions.' }
    ],
    rest: [
      { title: 'Rest in His Presence', url: 'https://www.bible.com/{locale}/reading-plans-search?query=rest', description: 'A call to pause, release mental exhaustion and renew your strength in God.' }
    ],
    perseverance: [
      { title: "Don't Give Up: Firmness to the End", url: 'https://www.bible.com/{locale}/reading-plans-search?query=perseverance', description: 'Spiritual strength to keep building and not faint under weariness.' }
    ],
    courage: [
      { title: 'Courage to Move Forward', url: 'https://www.bible.com/{locale}/reading-plans-search?query=courage', description: 'Overcome the fear of failure and make bold decisions to innovate and create.' }
    ],
    comfort: [
      { title: 'Comfort in Hard Times', url: 'https://www.bible.com/{locale}/reading-plans-search?query=comfort', description: "God's loving embrace near those going through distress or pain." }
    ],
    joy: [
      { title: 'The Joy of the Lord is Your Strength', url: 'https://www.bible.com/{locale}/reading-plans-search?query=joy', description: 'Celebrate every achievement and live with gratitude and continuous joy in your work.' }
    ]
  },
  pt: {
    hope: [
      { title: 'Esperança Inabalável', url: 'https://www.bible.com/{locale}/reading-plans-search?query=esperanca', description: 'Renove sua fé e encontre esperança renovada para superar qualquer obstáculo em sua jornada.' }
    ],
    peace: [
      { title: 'Paz na Tempestade', url: 'https://www.bible.com/{locale}/reading-plans-search?query=paz', description: 'Encontre calma e serenidade mental quando a pressão e a ansiedade tentam te sobrecarregar.' }
    ],
    wisdom: [
      { title: 'Sabedoria do Alto', url: 'https://www.bible.com/{locale}/reading-plans-search?query=sabedoria', description: 'Luz e direção divina para tomar decisões sábias e estruturar soluções complexas.' }
    ],
    rest: [
      { title: 'Descanse na Sua Presença', url: 'https://www.bible.com/{locale}/reading-plans-search?query=descanso', description: 'Um chamado para pausar, soltar o esgotamento mental e renovar suas forças em Deus.' }
    ],
    perseverance: [
      { title: 'Não Desista: Firmeza até o Fim', url: 'https://www.bible.com/{locale}/reading-plans-search?query=perseveranca', description: 'Força espiritual para continuar construindo e não desanimar diante do cansaço.' }
    ],
    courage: [
      { title: 'Coragem para Avançar', url: 'https://www.bible.com/{locale}/reading-plans-search?query=coragem', description: 'Vença o medo do fracasso e tome decisões corajosas para inovar e criar.' }
    ],
    comfort: [
      { title: 'Consolo em Tempos Difíceis', url: 'https://www.bible.com/{locale}/reading-plans-search?query=consolo', description: 'O abraço amoroso de Deus perto de quem atravessa angústia ou dor.' }
    ],
    joy: [
      { title: 'A Alegria do Senhor é a sua Força', url: 'https://www.bible.com/{locale}/reading-plans-search?query=alegria', description: 'Celebre cada conquista e viva com gratidão e alegria contínua em seu trabalho.' }
    ]
  }
};
