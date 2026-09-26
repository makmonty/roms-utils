import type { RomLanguage, RomRegion } from './rom.ts';

export type ConfigPreference =
  | {
      type: 'regions';
      order: RomRegion[];
    }
  | {
      type: 'languages';
      order: RomLanguage[];
    }
  | {
      type: 'revision';
      order: number[];
    }
  | {
      type: 'aftermarket' | 'beta' | 'demo' | 'pirate' | 'hack';
      order: boolean[];
    };

export interface Config {
  preferences: Array<ConfigPreference>;
}
