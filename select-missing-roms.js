/**
 * Copy the roms missing in the firstDir that exist in the secondDir into the firstDir
 */

const fs = require('fs');
const path = require('path');

const firstDir = process.argv[2];
const secondDir = process.argv[3];

if (!firstDir) {
  throw 'No firstDir specified';
}
if (!secondDir) {
  throw 'No secondDir specified';
}

fs.readdir(firstDir, (err, files) => {
  if (err) {
    throw err;
  }

  const best = {};

  files.forEach(file => {
    best[getGameName(file)] = file;
  });

  fs.readdir(secondDir, (err, files) => {
    files.forEach(file => {
      const game = getGameName(file);

      if (!best[game]) {
        fs.copyFile(
          path.join(secondDir, file),
          path.join(firstDir, file),
          (err) => {
            if (err) {
              console.log(err);
            }
          }
        )
      }
    });
  });
})

// Helper functions

function getGameName(file) {
  return file.split(' (')[0].replace(/\[.*\]/, '').trim().toUpperCase();
}