const config = require('../config');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(config.GEMINI_API_KEY);

// Inisialisasi objek untuk menyimpan history per pengguna
global.conversationHistories = {};

async function GEMINI_TEXT(id_user, prompt) {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // Cek apakah ada history untuk user ini, jika tidak buat array baru
        if (!conversationHistories[id_user]) {
            conversationHistories[id_user] = [];
        }

        // Gabungkan history percakapan dengan prompt baru
        const fullPrompt = conversationHistories[id_user].join('\n') + '\nUser: ' + prompt + '\nAI:';

        // Generate respons dari model
        const result = await model.generateContent([fullPrompt]);
        const responseText = result.response.text();

        // Tambahkan prompt dan respons ke history user tersebut
        conversationHistories[id_user].push('User: ' + prompt);
        conversationHistories[id_user].push('AI: ' + responseText);

        // Batasi panjang history untuk mencegah terlalu panjang
        if (conversationHistories[id_user].length > 10) {
            conversationHistories[id_user] = conversationHistories[id_user].slice(-10);  // Simpan hanya 10 percakapan terakhir
        }

        return responseText;
    } catch (error) {
        console.error('Error generating AI content:', error.message);
    }
}

module.exports = { GEMINI_TEXT };
