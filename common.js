function getGameName(file) {
  // Remove extension
  const nameSplit = file.split('.');
  nameSplit.pop();
  let name = nameSplit.join('.');
  // Remove brackets, parenthesis, colons, dashes
  name = name.replace(/\[.*\]|\(.*\)|\:| \- /g, ' ');
  // Remove articles
  name = name.replace(/, The/i, '');
  name = name.replace(/^The /i, '');
  // Make all double space, single
  name = name.replace(/ {2,}/g, ' ');

  return name.trim().toUpperCase();
}

module.exports = {
  getGameName
};
