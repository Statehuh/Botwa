// ./lib/cekUpdate.js
const simpleGit = require('simple-git');
const path = require('path');
const fs = require('fs');

const repoUrl = 'https://github.com/autoresbot/resbot-ai.git';
const currentPath = path.resolve(__dirname, '..');

async function cloneOrUpdateRepo() {
  const git = simpleGit(currentPath);

  try {
    // Cek apakah Node.js terinstal dengan benar
    if (process.versions.node) {
      console.log(`Node.js version: ${process.versions.node}`);
    } else {
      throw new Error('Node.js is not installed. Please install Node.js to run this script.');
    }

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
    console.error('Error during git operation:', err.message);
    
    // Tambahkan saran untuk masalah izin
    if (err.message.includes('permission denied')) {
      console.error('Please check your directory permissions or run this script with elevated privileges.');
    }
    
    // Cek apakah direktori tidak ada atau tidak bisa diakses
    if (!fs.existsSync(currentPath)) {
      console.error(`Directory does not exist: ${currentPath}`);
    }
  }
}

module.exports = { cloneOrUpdateRepo };
