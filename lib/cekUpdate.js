// ./lib/cekUpdate.js
const simpleGit = require('simple-git');
const path = require('path');

const repoUrl = 'https://github.com/autoresbot/resbot-ai.git';
const currentPath = path.resolve(__dirname, '..');

async function cloneOrUpdateRepo() {
  const git = simpleGit(currentPath);

  try {
    // Cek apakah ini adalah direktori Git (apakah `.git` ada)
    const isRepo = await git.checkIsRepo();
    
    if (!isRepo) {
      // Jika bukan direktori Git, clone repository
      console.log('Directory is not a Git repository. Cloning...');
      await git.clone(repoUrl, currentPath);
      console.log('Repository cloned successfully.');
    } else {
      // Jika sudah ada repository, lakukan pull untuk update
      console.log('Git repository found. Pulling updates...');
      await git.pull();
      console.log('Repository updated successfully.');
    }
  } catch (err) {
    console.error('Error during git operation:', err);
  }
}

module.exports = { cloneOrUpdateRepo };
