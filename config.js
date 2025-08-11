/*
⚠️ PERINGATAN:
Script ini **TIDAK BOLEH DIPERJUALBELIKAN** dalam bentuk apa pun!

╔══════════════════════════════════════════════╗
║                🛠️ INFORMASI SCRIPT           ║
╠══════════════════════════════════════════════╣
║ 📦 Version   : 1.0.5
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
    API_KEY             : '294767f1dd165a976f97016a', // APIKEY ANDA AMBIL DI autoresbot.com
    GEMINI_API_KEY      : '', // https://youtu.be/02oGg3-3a-s?si=9WhaVsLyfc6B-YYI
    phone_number_bot    : '6282135214781', // Nomor BOT
    type_connection     : 'pairing', // qr atau pairing
    bot_destination     : 'private', // group , private, both
    name_bot            : 'SDV Ai',
    owner_name          : 'SDV Wa',
    owner_number        : '6283150958207',
    owner_website       : 'autoresbot.com',
    version             : global.version,
    rate_limit          : 3000, // 3 detik
    total_limit         : 100, // limit perhari -  user biasa || kalo premium unlimited
    sticker_packname    : 'SDV',
    sticker_author      : `Serial Designation V`,
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
