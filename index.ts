import arg from 'arg';
import { copy } from './src/commands/copy.ts';
import type { Config } from './src/types/config.ts';

const args = arg({
  '--from': String,
  '--dest': String,
  '--dat': String,
  '--dryrun': Boolean,
});

const command = args['_'][0];

const from = args['--from'] as string;
const dest = args['--dest'] as string;
const dat = args['--dat'] as string;
const config: Config = {
  preferences: [
    {
      type: 'regions',
      order: ['Spain', 'Europe', 'World', 'USA', 'Japan'],
    },
    {
      type: 'pirate',
      order: [false],
    },
  ],
};
const dryRun = Boolean(args['--dryrun']);

// if (dat) {
//   const datContent = await getDatContent(dat);
//   console.log(datContent.datafile.game.find(g => g['$'].name.includes('Zelda'))[0]);
//   process.exit(0);
// }

switch (command) {
  case 'copy':
    copy({
      from,
      dest,
      dat,
      config,
      dryRun,
    });
    break;
  default:
    console.log('No command provided');
}
