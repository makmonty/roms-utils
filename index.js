import arg from 'arg';
import {copy} from './src/commands/copy.js';
import { getDatContent } from './src/utils/dat.js';

const args = arg({
  '--from': String,
  '--dest': String,
  '--dat': String,
  '--dryrun': Boolean
});

const command = args['_'][0];

const from = args['--from'];
const dest = args['--dest'];
const dat = args['--dat'];
const config = {};
const dryRun = Boolean(args['--dryrun']);

// if (dat) {
//   const datContent = await getDatContent(dat);
//   console.log(datContent.datafile.game.find(g => g['$'].name.includes('Zelda'))[0]);
//   process.exit(0);
// }

switch(command) {
  case 'copy':
    copy({
      from,
      dest,
      dat,
      config,
      dryRun
    });
    break;
  default:
    console.log('No command provided');
}
