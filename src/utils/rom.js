import { regions as nointroRegions, languages as nointroLanguages } from '../constants/nointro.js';

const tagRegEx = /\[([^\]]*)\]|\(([^)]*)\)/g;

export function getRomDescription(path) {
  // Extract file name
  let file = path.split('/').pop();
  // Remove extension
  const nameSplit = file.split('.');
  const extension = nameSplit.pop();
  const rom = nameSplit.join('.');
  const game = rom.replace(tagRegEx, '').trim();
  const tags = [...file.matchAll(tagRegEx)]
    .map(match =>  match[1] || match[2])
    .reduce((acc, tag) => {
      tag.split(',').forEach(t => acc.push(t.trim()));
      return acc;
    }, []);

  const regions = tags.filter(tag => nointroRegions.includes(tag));
  const languages = tags.filter(tag => nointroLanguages.includes(tag));

  return {
    path,
    file,
    rom,
    game,
    extension,
    tags,
    regions,
    languages,
  };
}

export function getRomClonesFromDat(rom, dat) {
  const games = dat.datafile.game;
  const romDat = games.find(game => game['$'].name === rom);
  const originalId = romDat['$'].cloneofid || romDat['$'].id;

  return games.filter(game =>
    game['$'].id === originalId || game['$'].cloneofid === originalId
  );
}

export function getBestRom(romDescriptions, config) {
  let rom = null;
  romDescriptions.forEach(romDesc => {
    if (!rom) {
      rom = romDesc;
      return;
    }

    rom = compareRoms(rom, romDesc, config);
  });

  return rom;
}

export function compareRoms(romDesc1, romDesc2, config) {
  console.log({ romDesc1, romDesc2 });
  for (const pref of config.preferences) {
    for (const item of pref.order) {
      if (romDesc1.tags.includes(item) && !romDesc2.tags.includes(item)) {
        return romDesc1;
      }
      if (romDesc2.tags.includes(item) && !romDesc1.tags.includes(item)) {
        return romDesc2;
      }
    }
  }
  return null;
}
