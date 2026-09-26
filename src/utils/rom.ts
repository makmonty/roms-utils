import fs from 'fs';
import path from 'path';
import {
  regions as nointroRegions,
  languages as nointroLanguages,
} from '#/constants/nointro.ts';
import { validExtensions } from '#/constants/rom.ts';
import type { ConfigPreference, Config } from '#/types/config.ts';
import type { Dat } from '#/types/dat.ts';
import type {
  RomExtension,
  RomLanguage,
  RomRegion,
  RomDescription,
} from '#/types/rom.ts';
import { getDatContent } from './dat.ts';

const tagRegEx = /\[([^\]]*)\]|\(([^)]*)\)/g;

export function getRomDescription(romPath: string) {
  // Extract file name
  const file = romPath.split('/').pop()!;
  // Remove extension
  const nameSplit = file.split('.');
  const extension = nameSplit.pop()! as unknown as RomExtension;
  const rom = nameSplit.join('.');
  const game = rom.replace(tagRegEx, '').trim();
  const tags = [...file.matchAll(tagRegEx)]
    .map((match) => match[1] || match[2])
    .reduce((acc: string[], tag: string) => {
      tag.split(',').forEach((t) => acc.push(t.trim()));
      return acc;
    }, []);

  const regions = tags.filter((tag) =>
    nointroRegions.includes(tag as any),
  ) as unknown as RomRegion[];
  const languages = tags.filter((tag) =>
    nointroLanguages.includes(tag as any),
  ) as unknown as RomLanguage[];
  const aftermarket = tags.some((tag) => tag === 'Aftermarket');
  const beta = tags.some((tag) => tag.startsWith('Beta'));
  const demo = tags.some((tag) => tag === 'Demo');
  const pirate = tags.some((tag) => tag === 'Pirate');
  const hack = tags.some((tag) => tag === 'Hack');
  const revision = parseInt(
    tags.find((tag) => tag.startsWith('Rev'))?.match(/\d+/)?.[0] || '0',
  );

  return {
    path: romPath,
    file,
    rom,
    game,
    extension,
    tags,
    regions,
    languages,
    aftermarket,
    beta,
    demo,
    pirate,
    hack,
    revision,
  };
}

export function getRomClonesFromDat(rom: string, dat: Dat) {
  const games = dat.datafile.game;
  const romDat = games.find((game) => game['$'].name === rom);
  if (!romDat) {
    throw new Error(`The rom ${rom} does not exist in the DAT file`);
  }

  const originalId = romDat['$'].cloneofid || romDat['$'].id;

  return games.filter(
    (game) => game['$'].id === originalId || game['$'].cloneofid === originalId,
  );
}

export function getBestRom(romDescriptions: RomDescription[], config: Config) {
  let matchingRoms = romDescriptions;
  for (const pref of config.preferences) {
    if (!matchingRoms.length) {
      break;
    }
    matchingRoms = getPreferenceMatchingRoms(matchingRoms, pref);
  }

  return matchingRoms[0] || null;
}

export function getPreferenceMatchingRoms(
  romDescriptions: RomDescription[],
  pref: ConfigPreference,
) {
  for (const item of pref.order) {
    const matchingRoms = getPreferenceItemMatchingRoms(
      romDescriptions,
      item,
      pref.type,
    );

    if (matchingRoms.length) {
      return matchingRoms;
    }
  }
  return [];
}

export function getPreferenceItemMatchingRoms(
  romDescriptions: RomDescription[],
  item: ConfigPreference['order']['0'],
  type: ConfigPreference['type'],
) {
  return romDescriptions.filter((romDesc) =>
    Array.isArray(romDesc[type])
      ? romDesc[type].includes(item)
      : romDesc[type] === item,
  );
}

export async function getRomGroupsFromDat(dat: Dat, dir: string) {
  console.log('Shaping the data');
  const groups: Record<string, RomDescription[]> = {};

  for await (const gameDat of dat.datafile.game) {
    const globPattern = path.join(dir, gameDat.$.name) + '.*';
    const fileExists = fs.promises.glob(globPattern);
    const files = [];
    for await (const file of fileExists) {
      files.push(path.join(dir, file));
    }
    if (!files.length) {
      continue;
    }
    const description = getRomDescription(files[0]);
    const groupId = gameDat.$.cloneofid || gameDat.$.id;
    groups[groupId] ||= [];
    groups[groupId].push(description);
  }

  return groups;
}

export async function getRomDescriptionsFromDir(dir: string) {
  const files = await fs.promises.readdir(dir);
  return files
    .filter((file) => {
      const ext = file.split('.').pop();
      return validExtensions.includes(ext as any);
    })
    .map((file) => path.join(dir, file))
    .map(getRomDescription);
}

export async function getBestRoms({
  from,
  dat,
  config,
}: {
  from: string;
  dat: string;
  config: Config;
}) {
  const datContent = await getDatContent(dat);
  const groups = await getRomGroupsFromDat(datContent, from);
  console.log(`${Object.keys(groups).length} original roms found`);

  const bestRoms: Array<RomDescription> = [];
  Object.values(groups).forEach((group) => {
    const bestRom = getBestRom(group, config);
    if (bestRom) {
      bestRoms.push(bestRom);
    }
  });

  return bestRoms;
}
