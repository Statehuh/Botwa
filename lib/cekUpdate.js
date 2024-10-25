// ./lib/cekUpdate.js
const simpleGit = require('simple-git');
const path = require('path');
const fs = require('fs');

const repoUrl = 'https://github.com/autoresbot/resbot-ai.git';
const currentPath = path.resolve(__dirname, '..');
const tempRepoPath = path.join(currentPath, 'tmp-repo'); // Folder sementara

async function cloneRepoToTemp() {
  // Pastikan folder sementara ada
  if (!fs.existsSync(tempRepoPath)) {
    fs.mkdirSync(tempRepoPath, { recursive: true });
    console.log('Temporary folder created:', tempRepoPath);
  }

  const git = simpleGit(tempRepoPath); // Inisialisasi simple-git di folder sementara

  try {
    // Clone repository ke folder sementara
    console.log('Cloning repository to temporary folder...');
    await git.clone(repoUrl, '.'); // Clone ke dalam direktori saat ini (tempRepoPath)
    console.log('Repository cloned successfully to temporary folder.');
  } catch (err) {
    console.error('Error during cloning to temporary folder:', err.message);
    throw err; // Melempar error agar bisa ditangani di level atas
  }
}

function copyFiles(src, dest) {
  // Membaca isi direktori sumber
  const files = fs.readdirSync(src);
  for (const file of files) {
    const srcFilePath = path.join(src, file);
    const destFilePath = path.join(dest, file);

    // Cek apakah itu direktori
    if (fs.statSync(srcFilePath).isDirectory()) {
      // Jika direktori, buat direktori tujuan dan salin isinya
      fs.mkdirSync(destFilePath, { recursive: true });
      copyFiles(srcFilePath, destFilePath);
    } else {
      // Jika file, salin ke direktori tujuan
      fs.copyFileSync(srcFilePath, destFilePath);
    }
  }
}

function cleanUpTempRepo() {
  // Menghapus folder sementara
  if (fs.existsSync(tempRepoPath)) {
    fs.rmSync(tempRepoPath, { recursive: true, force: true });
    console.log('Temporary folder cleaned up.');
  }
}

async function cloneOrUpdateRepo() {
  try {
    // Cek apakah Node.js terinstal dengan benar
    if (process.versions.node) {
      console.log(`Node.js version: ${process.versions.node}`);
    } else {
      throw new Error('Node.js is not installed. Please install Node.js to run this script.');
    }

    // Clone repositori ke folder sementara
    await cloneRepoToTemp();

    // Salin isi dari folder sementara ke direktori utama
    copyFiles(tempRepoPath, currentPath);
    console.log('Files copied successfully from temporary folder to main directory.');

    // Hapus folder sementara
    cleanUpTempRepo();
  } catch (err) {
    console.error('Error during git operation:', err.message);
  }
}

module.exports = { cloneOrUpdateRepo };
