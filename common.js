function getGameName(file) {
  // Extract file name
  let name = file.split('/').pop();
  // Remove extension
  const nameSplit = file.split('.');
  nameSplit.pop();
  name = nameSplit.join('.');
  // Remove brackets and parenthesis
  name = name.replace(/\[.*\]|\(.*\)/g, ' ');
  // Remove articles
  name = name.replace(/, The/i, '');
  name = name.replace(/^The /i, '');
  // Remove non alphanumeric characters
  name = name.replace(/[^a-zA-Z0-9]/g, ' ');
  // Make every double space, single
  name = name.replace(/ {2,}/g, ' ');

  return name.trim().toUpperCase();
}

function processArgs() {
  const args = process.argv.slice(2);
  const argObj = {_: []};
  let ignoreNext = false;
  for (const index in args) {
    const i = parseInt(index); // I don't know why index is a string?
    const arg = args[i];
    if (!ignoreNext && !arg.startsWith('--')) {
      argObj._.push(arg);
    } else if (arg.startsWith('--')) {
      ignoreNext = false;
      let argName = arg.slice(2);
      let argValue;
      if (argName.includes('=')) {
        const argSplit = argName.split('=');
        argName = argSplit[0];
        argValue = argSplit[1];
      } else {
        const nextArg = args[i + 1];
        argValue = nextArg && !nextArg.startsWith('--') ? nextArg : true;

        if (nextArg && !nextArg.startsWith('--')) {
          ignoreNext = true;
        }
      }

      if (typeof argObj[argName] !== 'undefined') {
        if (!Array.isArray(argObj[argName])) {
          argObj[argName] = [argObj[argName]];
        }
        argObj[argName].push(argValue);
      } else {
        argObj[argName] = argValue;
      }
    } else if (ignoreNext) {
      ignoreNext = false;
    }
  }

  return argObj;
}

module.exports = {
  getGameName,
  processArgs
};
