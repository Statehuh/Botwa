const sessions = new Map();

function getSession(remoteJid, action = '') {
    // Jika session tidak ada, kembalikan null
    if (!sessions.has(remoteJid)) {
        return null;
    }

    const session = sessions.get(remoteJid);
    const now = new Date();
    
    // Hitung perbedaan waktu dalam detik
    const timeDifference = (now - session.startTime) / 1000;
    
    // Jika lebih dari 60 detik, perbarui startTime dan action
    if (timeDifference > 60) {
        session.startTime = now;
        session.action = action;
        sessions.set(remoteJid, session); // Simpan session yang diperbarui
    }

    return session; // Kembalikan session
}

function updateSession(remoteJid, action = '') {
    // Buat session baru jika tidak ada
    if (!sessions.has(remoteJid)) {
        const sessionData = {
            startTime: new Date(),
            remoteJid: remoteJid,
            action: action
        };
        sessions.set(remoteJid, sessionData);
    }
    
    // Ambil dan perbarui session jika sudah lebih dari 60 detik
    return getSession(remoteJid, action);
}

function resetSession(remoteJid) {
    if (sessions.has(remoteJid)) {
        sessions.delete(remoteJid);
    } 
}


module.exports = { getSession, updateSession, resetSession }
