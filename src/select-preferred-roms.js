/**
 * Keeps the preferred version of each game and deletes the rest
 */
const fs = require('fs');
const path = require('path');
const { exec } = require("child_process");

const {
  getGameName,
  processArgs
} = require('./common');

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

const args = processArgs();
const deleteNonPreferred = !!args['delete-non-preferred'];
const copyPreferredToPath = args['copy-to-path'];
const recursive = args['recursive'];
const dryRun = !!args['dry-run'];
const verbose = !!args['verbose'];
const paths = !args['path'] ? [] :
  Array.isArray(args['path']) ? args['path'] :
  [args['path']];

const dirs = [...args._, ...paths];

if (!dirs) {
  throw 'No path specified';
}

const hasCheevosCache = {};

if (dryRun) {
  console.log('DRY RUN');
}

async function start() {
  const files = await getFilesFromDirs(dirs, recursive);
  console.log(`${files.length} files found`);
  await parseFiles(files);
  console.log('Done.');
}

// Helper functions

async function getFilesFromDirs(dirs, recursive) {
  const files = await Promise.all(dirs.map(dir => getFilesFromDir(dir, recursive)));
  // Flatten the array
  return [].concat(...files);
}

async function getFilesFromDir(dir, recursive) {
  return new Promise((resolve, reject) => {
    fs.readdir(dir, async (err, result) => {
      if (err) {
        reject(err);
        return;
      }
      const paths = result.map(file => path.join(dir, file));
      const dirs = paths.filter(path => fs.lstatSync(path).isDirectory());
      let files = paths.filter(path => fs.lstatSync(path).isFile());

      if (recursive) {
        const recFiles = await getFilesFromDirs(dirs, recursive);
        files = files.concat(recFiles)
      }

      resolve(files);
    });
  })
}

/**
 * Goes through all the files and selects the preferred and deletes the rest.
 * @param {string[]} files
 */
async function parseFiles(files) {
  const preferred = await getPreferred(files);
  if (copyPreferredToPath) {
    const copied = await copyFilesToPath(Object.values(preferred), copyPreferredToPath);

    console.log(`${copied.length} files copied to ${copyPreferredToPath}`);
    if (copied.length && dryRun) {
      console.log('DRY RUN. Nothing copied in fact')
    }
  }

  if (deleteNonPreferred) {
    const deleted = removeNonPreferred(files, preferred);

    console.log(`${deleted.length} files deleted`);
    if (deleted.length && dryRun) {
      console.log('DRY RUN. Nothing deleted in fact')
    }
  }
}

/**
 * Chooses the best rom between two according to the preference table and with priority to cheevos
 * @param {string} filePath1
 * @param {string} filePath2
 */
async function compareFiles(filePath1, filePath2) {
  if (!filePath1) {
    return filePath2;
  }
  if (!filePath2) {
    return filePath1;
  }
  const file1Score = getScore(filePath1);
  const file2Score = getScore(filePath2);

  const hasCheevos1 = await hasCheevos(filePath1);
  const hasCheevos2 = await hasCheevos(filePath2);

  return hasCheevos1 && !hasCheevos2 ? filePath1 :
    !hasCheevos1 && hasCheevos2 ? filePath2 :
    file1Score > file2Score ? filePath1 :
    filePath2;
}

/**
 * For each game, chooses the preferred file
 * @param {string[]} files
 * @return The selected games as a hash { [game]: filePath }
 */
async function getPreferred(files) {
  const preferred = {};
  // Get the best of each game
  for (const filePath of files) {
    verbose && console.log(`Checking ${filePath}. Score: ${getScore(filePath)}`);
    const game = getGameName(filePath);

    if (!preferred[game]) {
      preferred[game] = filePath;
    } else {
      const prevPreferred = preferred[game];
      preferred[game] = await compareFiles(preferred[game], filePath);
      const declined = prevPreferred === preferred[game] ? filePath : prevPreferred;
      verbose && console.log(`- Choosing ${preferred[game]} (Cheevos: ${await hasCheevos(preferred[game])}) over ${declined} (Cheevos: ${await hasCheevos(declined)})`);
    }
  }

  return preferred;
}

async function copyFilesToPath(filePaths, destPath) {
  return Promise.all(filePaths.map(filePath => copyFileToPath(filePath, destPath)));
}

async function copyFileToPath(filePath, destDir) {
  const fileName = filePath.split('/').pop();
  const destPath = resolveHome(path.join(destDir, fileName));
  return new Promise((resolve, reject) => {
    if (!dryRun) {
      fs.copyFile(filePath, destPath, (err) => {
        if (err) {
          reject(err);
          return;
        }
        verbose && console.log(`Copied ${filePath} to ${destPath}`);
        resolve(filePath);
      });
    } else {
      resolve(filePath);
    }
  });
}

function resolveHome(filepath) {
  if (filepath[0] === '~') {
      return path.join(process.env.HOME, filepath.slice(1));
  }
  return filepath;
}

/**
 *  Deletes the files that are not the preferred version of its game
 * @param {string[]} files
 * @param {object} preferred An object with the preferred file per game { [game]: filePath }
 */
function removeNonPreferred(files, preferred) {
  // Delete the files which are not the best
  const deleted = [];
  for (const filePath of files) {
    const game = getGameName(filePath);
    if (filePath !== preferred[game]) {
      deleted.push(filePath);
      if (!dryRun) {
        fs.unlink(filePath, (err) => {
          if (err) {
            console.log(`Error deleting file ${filePath}`, err);
          }
        });
      }
    }
  }
  return deleted;
}

/**
 * Returns the score of the file as a numeric value. The higher, the better
 * @param {string} filePath
 */
function getScore(filePath) {
  const fileName = filePath.split('/').pop();
  for (let i = 0, n = preferredVersions.length; i < n; i++) {
    const pattern = preferredVersions[i];
    if (typeof pattern === 'string') {
      if (fileName.toUpperCase().includes(preferredVersions[i].toUpperCase())) {
        return preferredVersions.length - i;
      }
    } else if (pattern instanceof RegExp) {
      if (fileName.match(pattern)) {
        return preferredVersions.length - i;
      }
    }
  }
  return 0;
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

start();
