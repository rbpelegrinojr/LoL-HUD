const fs = require('node:fs');
const path = require('node:path');

const directories = ['uploads', 'logs'];

function ensureRuntimeDirectories(baseDirectory) {
  directories.forEach((directory) => {
    fs.mkdirSync(path.join(baseDirectory, directory), { recursive: true });
  });
}

module.exports = {
  ensureRuntimeDirectories
};
