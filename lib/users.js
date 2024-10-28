const fs        = require('fs');
const path      = require('path');
const moment    = require('moment');
const config    = require('../config');

const filePath = path.join(__dirname, '../database/users.json');

function resetUsersJson() {

    // Membuat objek kosong
    const emptyData = {
        users: []
    };

    // Menyimpan objek kosong ke dalam users.json
    fs.writeFile(filePath, JSON.stringify(emptyData, null, 2), (err) => {
        if (err) {
            console.error('Gagal mereset users.json:', err);
            return;
        }
    });
}



// Fungsi untuk membaca data dari file JSON
function readData() {
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
}

// Fungsi untuk menulis data ke file JSON
function writeData(data) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}


// Fungsi untuk mengecek apakah user adalah user premium
function isPremiumUser(user) {
    const currentTime = moment(); // Waktu sekarang
    return moment(user.premium_end).isAfter(currentTime); // Jika premium_end lebih besar dari waktu sekarang
}

// Fungsi untuk mengecek limit user biasa
function checkLimit(user) {
    if (isPremiumUser(user)) {
        return 'Unlimited'; // User premium, tidak ada limit
    } else {
        if (user.limit === undefined) {
            user.limit = config.total_limit; // Set limit awal untuk user biasa jika belum ada
            user.last_reset = moment().format('YYYY-MM-DD'); // Simpan tanggal reset terakhir
        }

        const currentDate = moment().format('YYYY-MM-DD'); // Tanggal hari ini
        if (user.last_reset !== currentDate) {
            // Reset limit harian jika tanggal berubah
            user.limit = config.total_limit;
            user.last_reset = currentDate;
        }

        return user.limit; // Kembalikan sisa limit user biasa
    }
}

// Fungsi untuk mengurangi limit user biasa
function reduceLimit(id) {
    const data = readData();
    const user = data.users.find(u => u.id === id);
    if (user) {
        if (isPremiumUser(user)) {
        } else {
            const remainingLimit = checkLimit(user);
            if (remainingLimit > 0) {
                user.limit -= 1;
                writeData(data);
            }
        }
    }
}


function addUser(id, premiumDurationDays) {
    const data = readData();

    // Cek apakah pengguna dengan id yang sama sudah ada
    const user = data.users.find(user => user.id === id);

    if (user) {
        // Jika pengguna sudah ada, perbarui premium_end
        console.log(`User with ID ${id} already exists. Updating premium duration.`);

        const premiumStart = moment(); // Waktu saat ini
        let premiumEnd;

        // Jika premiumDurationDays -1, maka user biasa (tanpa premium)
        if (premiumDurationDays === -1) {
            premiumEnd = moment().subtract(1, 'days'); // Set premium_end ke waktu yang sudah berlalu
        } else {
            premiumEnd = premiumStart.clone().add(premiumDurationDays, 'days'); // Tambahkan durasi premium (misal 30 hari)
        }

        // Update premium_end pada pengguna yang ada
        user.premium_start = premiumStart.format(); // Perbarui premium_start
        user.premium_end = premiumEnd.format();      // Perbarui premium_end
    } else {
        // Tambahkan pengguna baru jika belum ada
        const premiumStart = moment(); // Waktu saat ini
        let premiumEnd;

        // Jika premiumDurationDays -1, maka user biasa (tanpa premium)
        if (premiumDurationDays === -1) {
            premiumEnd = moment().subtract(1, 'days'); // Set premium_end ke waktu yang sudah berlalu
        } else {
            premiumEnd = premiumStart.clone().add(premiumDurationDays, 'days'); // Tambahkan durasi premium (misal 30 hari)
        }

        data.users.push({
            id: id,
            premium_start: premiumStart.format(),  // Format ISO string
            premium_end: premiumEnd.format()
        });
    }

    writeData(data);
}



// Fungsi untuk mengedit user secara dinamis
function editUser(id, premiumDurationDays) {
    const data = readData();
    const user = data.users.find(u => u.id === id);

    if (user) {
        const premiumStart = moment(); // Waktu saat ini
        const premiumEnd = premiumStart.clone().add(premiumDurationDays, 'days'); // Tambahkan durasi baru

        user.premium_start = premiumStart.format();
        user.premium_end = premiumEnd.format();

        writeData(data);
    } 
}

// Fungsi untuk menghapus user
function deleteUser(id) {
    const data = readData();
    const updatedUsers = data.users.filter(u => u.id !== id);
    if (updatedUsers.length === data.users.length) {
    } else {
        data.users = updatedUsers;
        writeData(data);
    }
}

// Fungsi untuk mendapatkan data user
function getUser(id) {
    const data = readData();
    const user = data.users.find(u => u.id === id);
    if (user) {
        return user;
    } else {
        return null;
    }
}

function getUserPremium() {
    const data = readData();
    const currentDate = moment(); // Tanggal dan waktu saat ini
    const premiumUsers = data.users.filter(user => moment(user.premium_end).isSameOrAfter(currentDate)); // Hanya ambil user yang premium masih aktif

    const total = premiumUsers.length; // Menghitung total pengguna premium
    let userListText = `*DAFTAR LIST PREMIUM* (${total})\n\n`; // Menambahkan header dengan total pengguna premium

    // Mengurutkan pengguna premium berdasarkan premium_end (tanggal terawal lebih dulu)
    premiumUsers.sort((a, b) => new Date(a.premium_end) - new Date(b.premium_end));

    premiumUsers.forEach(user => {
        // Mengambil hanya nomor dari user.id (tanpa @s.whatsapp.net)
        const number = user.id.split('@')[0];
        userListText += `⌬ ${number}, - ${moment(user.premium_end).format('YYYY-MM-DD')}\n`;
    });

    return userListText.trim(); // Mengembalikan daftar pengguna dalam format teks
}

function getAllUsers() {
    const data = readData();
    const total = data.users.length; // Menghitung total pengguna
    let userListText = `*DAFTAR SEMUA USER* (${total})\n\n`; // Menambahkan header dengan total pengguna

    // Mengurutkan semua pengguna berdasarkan premium_end (tanggal terawal lebih dulu)
    data.users.sort((a, b) => new Date(a.premium_end) - new Date(b.premium_end));

    data.users.forEach(user => {
        // Mengambil hanya nomor dari user.id (tanpa @s.whatsapp.net)
        const number = user.id.split('@')[0];
        userListText += `⌬ ${number}, - ${moment(user.premium_end).format('YYYY-MM-DD')}\n`;
    });

    return userListText.trim(); // Mengembalikan daftar pengguna dalam format teks
}








// Mengekspor fungsi-fungsi
module.exports = {
    addUser,
    editUser,
    deleteUser,
    getUser,
    isPremiumUser,
    checkLimit,
    reduceLimit,
    getUserPremium,
    getAllUsers,
    resetUsersJson
};
