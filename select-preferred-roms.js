/**
 * Keeps the preferred version of each game and deletes the rest
 */
const fs = require('fs');
const path = require('path');

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

const preferred = {};

fs.readdir(dir, (err, files) => {
  // Get the best of each game
  files.forEach((file, index) => {
    const game = getGameName(file);
    preferred[game] = getPreferred(preferred[game], file);
  });

  // Delete the ones which are not the best
  files.forEach((file) => {
    const game = getGameName(file);
    if (file !== preferred[game]) {
      // console.log('Delete',file,'and not',preferred[game]);
      fs.unlink(path.join(dir, file), (err) => {
        if (err) {
          console.log(err);
        }
      });
    }
  });
});



// Helper functions

function getGameName(file) {
  return file.split(' (')[0].replace(/\[.*\]/, '').trim().toUpperCase();
}

function getPreferred(file1, file2) {
  if (!file1) {
    return file2;
  }
  if (!file2) {
    return file1;
  }
  const file1Score = getScore(file1);
  const file2Score = getScore(file2);

  // console.log(file1Score, file1, file2Score, file2);

  return file1Score > file2Score ? file1 : file2;
}

function getScore(file) {
  for (let i = 0, n = preferredVersions.length; i < n; i++) {
    if (file.toUpperCase().includes(preferredVersions[i].toUpperCase()) > -1) {
      return preferredVersions.length - i;
    }
  }
}
