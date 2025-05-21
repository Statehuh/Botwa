const config = require('../config');
const axios = require('axios');

function getWaktuWIB() {
    const now = new Date();
  
    // Hitung waktu UTC dari sistem (lawan dari getTimezoneOffset)
    const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
  
    // Tambahkan offset UTC+7 untuk WIB
    const wibTime = new Date(utcTime + (7 * 60 * 60 * 1000));
  
    const hari = wibTime.getDate();
    const bulanIndex = wibTime.getMonth();
    const tahun = wibTime.getFullYear();
    const jam = wibTime.getHours().toString().padStart(2, '0');
    const menit = wibTime.getMinutes().toString().padStart(2, '0');
  
    const namaBulan = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
  
    return `${hari} ${namaBulan[bulanIndex]} ${tahun} jam ${jam}:${menit} WIB`;
}

// Inisialisasi objek untuk menyimpan history per pengguna
global.conversationHistories = {};

async function GEMINI_TEXT(id_user, prompt) {
    const API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${config.GEMINI_API_KEY}`;

    try {
        // Cek apakah ada history untuk user ini, jika tidak buat array baru
        if (!conversationHistories[id_user]) {
            conversationHistories[id_user] = [];
        }

        // Konteks awal untuk percakapan
        let initialContext =  `Kamu adalah Resbot AI, asisten cerdas buatan tim dari Autoresbot (jika di tanya website tunjukkan autoresbot.com dan jika ada yang nanya waktu sekarang adalah @NOW ). Tugasmu adalah menjawab pertanyaan dengan baik, ramah, dan cerdas, serta jangan terlalu panjang dan terlalu pendek, apapun yang ditanyakan.`;

        initialContext = initialContext.replace('@NOW', getWaktuWIB());

        // Gabungkan konteks awal, history percakapan, dan prompt terbaru
        const fullPrompt = `${initialContext}\n${conversationHistories[id_user].join('\n')}\nUser: ${prompt}\nAI:`;

        // Buat requestBody sesuai format yang baru
        const requestBody = {
            contents: [
                {
                    role: "user",
                    parts: [{ text: fullPrompt }]
                }
            ]
        };

        // Generate respons dari model
        const response = await axios.post(API_URL, requestBody);
        const responseText = response.data.candidates[0].content.parts[0].text;

        // Tambahkan prompt dan respons ke history user tersebut
        conversationHistories[id_user].push('User: ' + prompt);
        conversationHistories[id_user].push('AI: ' + responseText);

        // Batasi panjang history untuk mencegah terlalu panjang
        if (conversationHistories[id_user].length > 10) {
            conversationHistories[id_user] = conversationHistories[id_user].slice(-10);  // Simpan hanya 10 percakapan terakhir
        }

        return responseText;
    } catch (error) {
        console.error('Error generating AI content:', error.message || error);

        const panduan = 'https://youtu.be/02oGg3-3a-s?si=ElXoKafRCG9B-7XD';

        const pesan_ERROR = `Jika melihat error ini, berarti apikey gemini terkena limit karena pengguna yang terlalu banyak. Silakan gunakan apikey gemini pribadi.\n\n${panduan}`

        if (error.message && error.message.includes('Too Many Requests')) {
            return pesan_ERROR;
        }

        if (error.message && error.message.includes('status code 429')) {
            return pesan_ERROR;
        }

        if (error.message && error.message.includes('status code 403')) {
            return `Jika melihat error ini, berarti apikey gemini masih kosong atau kena limit karena pengguna yang terlalu banyak. Silakan gunakan apikey gemini pribadi.\n\n${panduan}`
        }

        // Kembalikan pesan error umum jika error.message tidak ada atau berbeda
        return error.message || 'Terjadi kesalahan pada sistem. Silakan coba lagi nanti.';
    }
}

module.exports = { GEMINI_TEXT };
