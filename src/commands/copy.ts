import type { Config } from '#/types/config.ts';
import { getBestRoms } from '#/utils/rom.ts';

export async function copy({
  from,
  dest,
  dat,
  config,
  dryRun,
}: {
  from: string,
  dest: string,
  dat: string,
  config: Config,
  dryRun: boolean
}) {
  console.log('Analyzing the roms')
  const bestRoms = await getBestRoms({
    from,
    dat,
    config
  })
  console.log(bestRoms.map(bestRom => bestRom.rom))
}
