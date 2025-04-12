/*
⚠️ PERINGATAN:
Script ini **TIDAK BOLEH DIPERJUALBELIKAN** dalam bentuk apa pun!

╔══════════════════════════════════════════════╗
║                🛠️ INFORMASI SCRIPT           ║
╠══════════════════════════════════════════════╣
║ 📦 Version   : 1.0.4
║ 👨‍💻 Developer  : Azhari Creative              ║
║ 🌐 Website    : https://autoresbot.com       ║
║ 💻 GitHub     : github.com/autoresbot/resbot-ai
╚══════════════════════════════════════════════╝

📌 Mulai 11 April 2025,
Script **Autoresbot** resmi menjadi **Open Source** dan dapat digunakan secara gratis:
🔗 https://autoresbot.com
*/

const moment= require("moment-timezone")

const config = {
    AutoUpdate          : 'off', // on atau off
    API_KEY             : 'APIKEY_GRATIS', // APIKEY ANDA AMBIL DI autoresbot.com
    GEMINI_API_KEY      : 'AIzaSyDFBFp5k5mqZB35jdaAXLVfpuyku-W3iN4', // https://youtu.be/02oGg3-3a-s?si=9WhaVsLyfc6B-YYI
    phone_number_bot    : '6282287634350',
    type_connection     : 'pairing', // qr atau pairing
    bot_destination     : 'group', // group , private, both
    name_bot            : 'Resbot Ai',
    owner_name          : 'Autoresbot',
    owner_number        : '6285246154386',
    owner_website       : 'autoresbot.com',
    version             : global.version,
    rate_limit          : 3000, // 3 detik
    total_limit         : 20, // limit perhari -  user biasa || kalo premium unlimited
    sticker_packname    : 'Autoresbot',
    sticker_author      : `Date: ${moment.tz('Asia/Jakarta').format('DD/MM/YY')}\nYouTube: Azhari Creative\nBot: 0852-4615-4386`,
    notification        : {
        limit           : 'Hai kak, Limit harian anda sudah habis silakan tunggu besok ya atau berlangganan premium untuk menikmati fitur tanpa limit',
        reset           : 'Dialog berhasil dihapus. Semua percakapan kita telah di-reset dan siap memulai dari awal!',
        ig              : 'kirimkan link instagramnya ya kak',
        fb              : 'kirimkan link facebooknya ya kak',
        tt              : 'kirimkan link tiktoknya ya kak',
        waiting         : 'Hai kak mohon tunggu beberapa saat lagi ya, proses sebelumnya belum selesai',
        qc_help         : 'Tulis textnya ya kak, misal *qc halo*',
        only_owner      : '_❗Perintah Ini Hanya Bisa Digunakan Oleh Owner !_'
        
    },
    success             : {
        hd : 'Ini kak hasil gambarnya, Maaf kalau masih blur',
    },
    error               : {
       FILE_TOO_LARGE : `File terlalu besar. Maksimal ukuran file adalah 99 Mb`,
       THROW          : '_Ada masalah saat terhubung ke server_',
       PLAY_ERROR     : 'Yahh Gagal, Sepertinya ada masalah saat mendowload audio',
       HD_ERROR       : 'Yahh Gagal, Mohon maaf kak, tidak bisa hd in gambar',
       IMAGE_ERROR    : 'Yahh Gagal, Mohon maaf kak, tidak bisa carikan kamu gambar',
       qc             : 'Yah gagal bikin qc nya kak'
    }
}; 

module.exports = config;
