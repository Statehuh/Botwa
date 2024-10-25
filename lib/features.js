const fs = require('fs');
const { ReminiV1, ReminiV2, ReminiV3 } = require('./scraper/remini');
const { tiktok, tiktokSlide } = require('./scraper/tiktok');
const config            = require('../config');
const ApiAutoresbot     = require('api-autoresbot');
const api               = new ApiAutoresbot(config.API_KEY);
const { getBuffer }     = require('./utils');

async function HDR(content) {
    const filePath = content.filePath;
    const buffer = content.buffer;
    try {
        const FileUpload = await api.tmpUpload(filePath);
        if (!FileUpload) {
            throw new Error("File upload failed");
        }
        const originalFileUrl = FileUpload.data.url;

        // Coba ReminiV1
        try {
            const MediaBuffer = await ReminiV1(buffer);
            return MediaBuffer;
        } catch (error) {
            console.error("ReminiV1 failed, trying ReminiV2:");
        }

        // Jika ReminiV1 gagal, coba ReminiV2
        try {
            const MediaBuffer = await ReminiV2(originalFileUrl);
            return MediaBuffer;
        } catch (error) {
            console.error("ReminiV2 failed, trying ReminiV3:");
        }

        // Jika ReminiV2 juga gagal, coba ReminiV3
        try {
            const MediaBuffer = await ReminiV3(filePath);
            return MediaBuffer;
        } catch (error) {
            console.error("ReminiV3 failed:");
            throw new Error("All Remini attempts failed");
        }

    } catch (error) {
        console.error("Error in HDR function:");
        throw error; // Re-throw the error after logging it
    }
}

async function TIKTOK(url) {
    try {
        const data = await tiktok(url);
        let type;
        let resultData;

        if (data && data.no_watermark.includes('video')) {
            type = 'video';
            resultData = data; // Jika tipe video, gunakan data dari tiktok
        } else {
            type = 'slide';
            const slides = await tiktokSlide(url); // Ambil slide dari tiktokSlide
            resultData = slides[0].imgSrc; // Ambil data gambar dari slide
        }

        const result = {
            status: true,
            type: type,
            data: resultData
        };
        return result; // Mengembalikan object result
    } catch (error) {
        console.error("Tiktok failed", error);
        return {
            status: false,
            message: "Failed to process TikTok URL"
        };
    }
}

async function SEARCH_IMAGE(content) {
    const timeout = (ms) => new Promise((resolve) => setTimeout(resolve, ms, null)); // Fungsi timeout

    try {
        let response = await Promise.race([
            api.get('/api/search/pinterest', { text: content }),
            timeout(5000) // Timeout 10 detik
        ]);
        if (response?.data) {
            return await getBuffer(response.data); // Jika berhasil, kembalikan hasil dari Pinterest
        }

        response = await Promise.race([
            api.get('/api/search/pixabay',{ text: content }),
            timeout(5000)
        ]);

        if (response?.data?.length > 0) {
            const randomIndex = Math.floor(Math.random() * response.data.length);
            const randomImageUrl = response.data[randomIndex];
            const media = await getBuffer(randomImageUrl);
            return media;
        }

        response = await Promise.race([
            api.get('/api/search/unsplash', { text: content }),
            timeout(10000) // Timeout 10 detik
        ]);
        if (response?.data?.length > 0) {
            const randomIndex = Math.floor(Math.random() * response.data.length);
            const randomImageUrl = response.data[randomIndex];
            const media = await getBuffer(randomImageUrl);
            return media;
        }
        return null;

    } catch (error) {
        console.error('Error during image search:', error.message);
        return null; // Mengembalikan null jika terjadi error
    }
}

async function FACEBOOK(url) {
    
    try {
        const media = await api.get('/api/downloader/facebook', { url });
        return media.data[0];
    } catch (error) {
        return {
            status: false,
            message: "Failed to process Facebook URL"
        };
    }
} 

async function IG(url) {
    
    try {
        const media = await api.get('/api/downloader/instagram', { url });
        return media.data[0];
    } catch (error) {
        return {
            status: false,
            message: "Failed to process instagram URL"
        };
    }
} 



module.exports = { HDR, TIKTOK, SEARCH_IMAGE, FACEBOOK, IG };
