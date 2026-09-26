import fs from 'fs';
import path from 'path';
import type { Config } from '#/types/config.ts';
import { getBestRoms } from '#/utils/rom.ts';
import cliProgress from 'cli-progress';

export async function copy({
  from,
  dest,
  dat,
  config,
  dryRun,
}: {
  from: string;
  dest: string;
  dat: string;
  config: Config;
  dryRun: boolean;
}) {
  console.log('Analyzing the roms');
  const bestRoms = await getBestRoms({
    from,
    dat,
    config,
  });

  console.log(`Copying${dryRun ? ' DRY RUN' : ''}`);
  const progressBar = new cliProgress.SingleBar({
    format: `{bar} | {percentage}% | {value}/{total} Files | {rom}`,
  });
  progressBar.start(bestRoms.length, 0, { rom: '-' });

  for await (const rom of bestRoms) {
    const newPath = path.join(dest, rom.file);
    if (!dryRun) {
      await fs.promises.copyFile(rom.path, newPath);
    }
    progressBar.increment(1, { rom: rom.file });
  }
  progressBar.stop();
}
