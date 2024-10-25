// utils.js

const fs        = require('fs');
const path      = require('path');
const axios     = require('axios');
const chalk     = require('chalk');
const config    = require('../config');



/**
 * Function to delete all files in a specified directory
 * @param {string} dirPath - The path of the directory to clear
 */
async function clearDirectory(dirPath) {
    try {
        // Membaca isi direktori
        const files = await fs.promises.readdir(dirPath);

        // Menghapus setiap file dalam direktori
        for (const file of files) {
            const filePath = path.join(dirPath, file);
            await fs.promises.unlink(filePath); // Menghapus file
        }

        console.log(`Semua isi folder ${dirPath} telah dihapus.`);
    } catch (error) {
        console.error('Error saat menghapus isi folder:', error);
    }
}

async function getBuffer(url, options){
	try {
		// Menambahkan timeout ke dalam konfigurasi
		options = options || {};
		const res = await axios({
			method: "get",
			url,
			headers: {
				'DNT': 1,
				'Upgrade-Insecure-Request': 1
			},
			timeout: 45000, // Timeout 45 detik (45000 ms)
			...options,
			responseType: 'arraybuffer'
		});
		return res.data;
	} catch (err) {
		// Menangani error
		return false;
	}
}
function logWithTime(pushName, truncatedContent) {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    
    const time = chalk.blue(`[${hours}:${minutes}]`); // Warna biru untuk waktu
    const name = chalk.yellow(pushName); // Warna kuning untuk nama pengguna
    const message = chalk.greenBright(truncatedContent); // Warna hijau cerah untuk isi pesan

    console.log(`${time} ${name} : ${message}`);
}

function displayMenu(remoteJid) {
    let number = remoteJid.split('@')[0];

    return new Promise((resolve, reject) => {
        const menuFilePath = path.join(__dirname, 'menu.txt');
        const ownerMenuFilePath = path.join(__dirname, 'menu_owner.txt');

        fs.readFile(menuFilePath, 'utf8', (err, data) => {
            if (err) {
                console.error('Error saat membaca file menu.txt:', err);
                reject(err); // Menolak Promise jika ada error
                return;
            }

            // Mengganti @botname dengan config.name_bot
            let replacedData = data.replace(/@botname/g, config.name_bot);

            if (number === config.owner_number) {
                // Jika nomor owner, baca menu_owner.txt
                fs.readFile(ownerMenuFilePath, 'utf8', (err, ownerData) => {
                    if (err) {
                        console.error('Error saat membaca file menu_owner.txt:', err);
                        reject(err); // Menolak Promise jika ada error
                        return;
                    }

                    // Menambahkan isi dari menu_owner.txt ke replacedData
                    replacedData += '\n' + ownerData; // Menambahkan konten menu_owner
                    resolve(replacedData); // Mengembalikan data yang sudah ditambah
                });
            } else {
                resolve(replacedData); // Mengembalikan data yang sudah diganti jika bukan owner
            }
        });
    });
}


function log(content) {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    
    const time = chalk.blue(`[${hours}:${minutes}]`); // Warna biru untuk waktu
    const message = chalk.greenBright(content); // Warna hijau cerah untuk isi pesan

    console.log(`${time} : ${message}`);
}



// Ekspor fungsi
module.exports = {
    clearDirectory,getBuffer, logWithTime, displayMenu, log
};
