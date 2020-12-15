/**
 * Keeps the preferred version of each game and deletes the rest
 */
const fs = require('fs');
const path = require('path');
const { exec } = require("child_process");

const {
  getGameName
} = require('./common');
const { resolve } = require('path');

// Country codes in preferred order
const preferredVersions = [
  '(S)',
  '(E)',
  '(U)',
  'Eng]',
  '(F)',
  '(JU)',
  '(J)',
  'Jap]'
];

const dir = process.argv[2];

if (!dir) {
  throw 'No dir specified';
}

const hasCheevosCache = {};

const dryRun = process.argv.includes('--dry-run');

const preferred = {};
const deleted = []

fs.readdir(dir, async (err, files) => {
  console.log(`${files.length} files found`);

  // Get the best of each game
  for (const file of files) {
    const filePath = path.join(dir, file);
    const game = getGameName(file);
    preferred[game] = preferred[game] || filePath;
    preferred[game] = await getPreferred(preferred[game], filePath);
  }

  // Delete the ones which are not the best
  for (const file of files) {
    const game = getGameName(file);
    if (file !== preferred[game]) {
      console.log(`Delete ${file} instead of ${preferred[game]}`);
      deleted.push(file);

      if (!dryRun) {
        fs.unlink(path.join(dir, file), (err) => {
          if (err) {
            console.log(err);
          }
        });
      }
    }
  }

  console.log(`${deleted.length} files deleted`);
  if (deleted.length && dryRun) {
    console.log('DRY RUN. Nothing deleted in fact')
  }
});


// Helper functions

/**
 * Chooses the best rom between two according to the preference table and with priority to cheevos
 * @param {string} filePath1
 * @param {string} filePath2
 */
async function getPreferred(filePath1, filePath2) {
  if (!filePath1) {
    return filePath2;
  }
  if (!filePath2) {
    return filePath1;
  }
  const file1Score = getScore(filePath1);
  const file2Score = getScore(filePath2);

  // const cheevosPromises = [
  //   hasCheevos(filePath1),
  //   hasCheevos(filePath2)
  // ];

  // [hasCheevos1, hasCheevos2] = await Promise.all(cheevosPromises);
  const hasCheevos1 = await hasCheevos(filePath1);
  const hasCheevos2 = await hasCheevos(filePath2);

  return hasCheevos1 && !hasCheevos2 ? filePath1 :
    !hasCheevos1 && hasCheevos2 ? filePath2 :
    file1Score > file2Score ? filePath1 :
    filePath2;
}

function getScore(filePath) {
  const fileName = filePath.split('/').pop();
  for (let i = 0, n = preferredVersions.length; i < n; i++) {
    if (fileName.toUpperCase().includes(preferredVersions[i].toUpperCase()) > -1) {
      return preferredVersions.length - i;
    }
  }
}


function hasCheevos(filePath) {
  return new Promise((resolve, reject) => {
    if (typeof hasCheevosCache[filePath] !== 'undefined') {
      resolve(hasCheevosCache[filePath]);
      return;
    }

    // console.log('Checking cheevos ' + filePath);
    exec(`hascheevos.sh "${filePath}"`, (error, stdout, stderr) => {
      // console.log('Done');
      if (error) {
        // console.log('ERRORASO', error);
        reject(error);
        return;
      }
      // console.log(stderr);
      const has = stderr ? stderr.includes('HAS CHEEVOS') : stdout.includes('HAS CHEEVOS');
      hasCheevosCache[filePath] = has;
      // console.log(has ? 'Has cheevos' : 'No cheevos');
      resolve(has);
    });
  });
}
