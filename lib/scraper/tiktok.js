const axios = require('axios');
const cheerio = require('cheerio');

async function tiktok(url) {
    return new Promise(async (resolve, reject) => {
        try {
            const params = new URLSearchParams();
            params.set("url", url);
            params.set("hd", "1");

            const response = await axios.post("https://tikwm.com/api/", params, {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                    Cookie: "current_language=en",
                    "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36"
                }
            });

            const data = response.data.data || {};

            resolve({
                title: data.title,
                cover: data.cover,
                origin_cover: data.origin_cover,
                no_watermark: data.play,
                watermark: data.wmplay,
                music: data.music
            });
        } catch (error) {
            reject(error);
        }
    });
}

async function tiktokSlide(url) {
    try {
        const response = await axios.get(`https://dlpanda.com/id?url=${url}&token=G7eRpMaa`);
        const $ = cheerio.load(response.data);
        let images = [];
        const creator = "Jikarinka";

        $("div.col-md-12 > img").each((i, el) => {
            images.push($(el).attr("src"));
        });

        return [{ creator, imgSrc: images }];
    } catch (error) {
        throw error;
    }
}

module.exports = { tiktok, tiktokSlide };
