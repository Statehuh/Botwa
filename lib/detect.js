function detectLink(message) {
    const urlPattern = /(https?:\/\/[^\s]+)/g;
    const foundLinks = message.match(urlPattern); // Mencari semua link

    // Daftar domain yang ingin diperiksa
    const domainList = [
        { name: 'TikTok', patterns: ['tiktok.com'] },
        { name: 'Google', patterns: ['google.com'] },
        { name: 'YouTube', patterns: ['youtube.com', 'youtu.be'] },
        { name: 'Whatsapp', patterns: ['whatsapp.com'] },
        { name: 'Facebook', patterns: ['facebook.com'] },
        { name: 'Instagram', patterns: ['instagram.com'] }

    ];

    if (foundLinks) {
        for (let link of foundLinks) {
            // Cek setiap link terhadap daftar domain
            for (let domain of domainList) {
                for (let pattern of domain.patterns) {
                    if (link.includes(pattern)) {
                        return { link: link, name: domain.name }; // Kembalikan objek
                    }
                }
            }
        }
        return { link: foundLinks, name: 'undefined' }; // Jika tidak ada domain yang cocok
    }

    return null; // Jika tidak ada link yang ditemukan
}

module.exports = { detectLink };
