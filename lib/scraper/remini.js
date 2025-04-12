const fs = require('fs');
const config = require('../../config');
const ApiAutoresbot = require('api-autoresbot');
const api = new ApiAutoresbot(config.API_KEY);
const axios = require('axios');
const FormData = require('form-data');


async function ReminiV0(url) {
    try {
        //const encodedUrl = encodeURIComponent(url);
        const encodedUrl = url;
        const fullUrl = `https://api.autoresbot.com/api/tools/remini6?apikey=apikey_premium_9b85434f815b696e7809b61a4755b8a8&url=${encodedUrl}`;
        console.log('fullUrl :',fullUrl)
        
        const response = await axios.get(fullUrl, {
            responseType: 'arraybuffer' // supaya dapat Buffer
        });

        const MediaBuffer = Buffer.from(response.data);
        if (!Buffer.isBuffer(MediaBuffer)) {
            throw new Error('Invalid response: Expected Buffer.');
        }

        return MediaBuffer;

    } catch (error) {
        console.error('Error:', error.response?.status, error.response?.data || error.message);
        throw error;
    }
}
async function ReminiV1(e) {
    try {
        const t = require("form-data");
        const a = `https://inferenceengine.vyro.ai/enhance.vyro`;
        const n = new t();
        
        // Append image buffer and model_version
        n.append("image", Buffer.from(e), {
            filename: "enhance_image_body.jpg",
            contentType: "image/jpeg"
        });
        n.append("model_version", 1);
        
        // Send request to server
        const response = await axios.post(a, n, {
            headers: {
                ...n.getHeaders(),
                "User-Agent": "okhttp/4.9.3",
                Connection: "Keep-Alive",
                "Accept-Encoding": "gzip"
            },
            responseType: "arraybuffer",
            timeout: 40000
        });
        return response.data;

    } catch (error) {
        throw error;
    }
}

// ReminiV2 function
async function ReminiV2(url) {
    try {
        const MediaBuffer = await api.getBuffer('/api/tools/remini2', { url });
        
        if (!Buffer.isBuffer(MediaBuffer)) {
            throw new Error('Invalid response: Expected Buffer.');
        }
        return MediaBuffer;

    } catch (error) {
        throw error;
    }
}

// ReminiV3 function
async function ReminiV3(imagePath) {
    try {
        const imageStream = fs.createReadStream(imagePath);
        const formData = new FormData();
        formData.append('image', imageStream, { filename: 'image.jpg' });
        formData.append('scale', 2);

        // Step 1: Send request to the API to process the image
        const response = await axios.post('https://api2.pixelcut.app/image/upscale/v1', formData, {
            headers: {
                ...formData.getHeaders(),
                'Accept': 'application/json',
            },
        });

        const imageUrl = response.data.result_url;
        if (!imageUrl) {
            throw new Error('Failed to get the image URL.');
        }
        const imageResponse = await axios.get(imageUrl, {
            responseType: 'arraybuffer',
        });
        const imageBuffer = Buffer.from(imageResponse.data, 'binary');
        return imageBuffer;

    } catch (error) {
        throw error;
    }
}

module.exports = { ReminiV0, ReminiV1, ReminiV2, ReminiV3 };
