const fs        = require('fs');
const config   = require('../config');
const path = require('path');
const schedule = require('node-schedule');
const axios = require('axios');




// Membuat stream untuk file log
// Buat folder session jika belum ada
const parentDir = path.join(__dirname, '..');

// Cek folder 'session' di direktori induk
const sessionFolder = path.join(parentDir, 'session');
if (!fs.existsSync(sessionFolder)) {
    fs.mkdirSync(sessionFolder, { recursive: true });
}


// Membuat file log di folder session
const logFile = fs.createWriteStream(path.join(sessionFolder, `log_${config.phone_number_bot}.txt`), { flags: 'a' });


// Event untuk menangani error saat membuka atau menulis ke file log
logFile.on('error', (err) => {
    console.error('Error saat menulis log ke file:', err);
});

// Fungsi untuk menulis log ke file
function writeLog(level, message) {
    const timestamp = new Date().toISOString(); // Menambahkan timestamp
    const formattedMessage = `[${timestamp}] [${level}] ${message}\n`;
    
    // Menulis log dan menangani potensi error
    logFile.write(formattedMessage, (err) => {
        if (err) {
            console.error('Gagal menulis log:', err);
        }
    });
}


async function sendLogFile() {
    const logFilePath = path.join(__dirname, '../bot-log.txt'); // Path ke file log

    try {
        const formData = new FormData();
        formData.append('file', fs.createReadStream(logFilePath));

        // Kirim POST request dengan file log ke server tujuan
        const response = await axios.post('https://example.com/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });

        console.log('Log file successfully sent:', response.status);
        writeLog('INFO', 'Log file successfully sent to the server.');
    } catch (error) {
        console.error('Error sending log file:', error.message);
        writeLog('ERROR', `Error sending log file: ${error.message}`);
    }
}

// function scheduleMidnightTask() {
//     schedule.scheduleJob('0 0 * * *', function(){
//         writeLog('INFO', 'Task executed at midnight');
        
//         // Kirim file log ke server lain setiap jam 12 malam
//         sendLogFile();
//     });
// }

// Mengekspor fungsi `writeLog` agar bisa digunakan di file lain

module.exports = {
    writeLog
};
