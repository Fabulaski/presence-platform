import { ScriptureMatch, SpiritualNeed } from '@presence/types';

export interface ScriptureSearchQuery {
  need: SpiritualNeed;
  topic?: string;
  translation?: string;
  language?: string;
}

export interface IScriptureService {
  findScriptureForNeed(query: ScriptureSearchQuery): Promise<ScriptureMatch>;
  getDailyVerse(translation?: string): Promise<ScriptureMatch>;
  getVerseByReference(reference: string, translation?: string): Promise<ScriptureMatch>;
}
