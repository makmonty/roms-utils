import fs from 'fs';

export async function copy({
  from,
  dest,
  dat,
  config,
  dryRun
}) {
  const files = await fs.promises.readdir(from);
  files.forEach(file => console.log(file));
}
