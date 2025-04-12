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

const config        = require('./config');
const path          = require('path')
const fs            = require('fs');
const chalk         = require('chalk');
const { writeLog } = require('./lib/log');
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion, makeInMemoryStore } = require('@whiskeysockets/baileys');
const { processMessage }        = require('./lib/ai');
const { Boom }                  = require("@hapi/boom");
const qrcode                    = require('qrcode-terminal');
const pino                      = require("pino");
const lastMessageTime           = {};
const logger                    = pino({ level: "silent" });
const { addUser, getUser } = require('./lib/users');
const { clearDirectory, logWithTime } = require('./lib/utils');
const store = makeInMemoryStore({ logger })
clearDirectory('./tmp');
global.version = '1.0.4'


async function checkAndUpdate() {
    if (config.AutoUpdate == 'on') {
      const { cloneOrUpdateRepo } = require('./lib/cekUpdate');
      await cloneOrUpdateRepo(); // Menunggu hingga cloneOrUpdateRepo selesai
    }
    await connectToWhatsApp();
  }


async function connectToWhatsApp() {

    if (global.sock && global.sock.user && global.sock.ws && global.sock.ws.readyState === 1) {
        console.log(chalk.yellow("⚠️ Bot sudah terkoneksi dan aktif. Tidak membuat koneksi baru."));
        return global.sock;
    }

    const sessionDir = path.join(process.cwd(), 'session');

    const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        logger: logger,
        printQRInTerminal: false,
        auth: state,
        browser: ["Ubuntu", "Chrome", "20.0.04"],
    });

    global.sock = sock; 

    if (!sock.authState.creds.registered && config.type_connection.toLowerCase() == 'pairing') {
        const phoneNumber = config.phone_number_bot;
        const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
        await delay(4000);
        const code = await sock.requestPairingCode(phoneNumber.trim());
        console.log(chalk.blue('PHONE NUMBER: '), chalk.yellow(phoneNumber));
        console.log(chalk.blue('CODE PAIRING: '), chalk.yellow(code));
    }

    sock.ev.on('creds.update', saveCreds);


    if (!fs.existsSync(sessionDir)) {
        fs.mkdirSync(sessionDir, { recursive: true });
    }
    fs.chmodSync(sessionDir, 0o755);
    fs.readdir(sessionDir, (err, files) => {
        if (err) {return;}
        files.forEach(file => {
            const filePath = path.join(sessionDir, file);
            fs.chmod(filePath, 0o644, (err) => {  
                if (err) {console.error('Error changing file permissions:', err);
                } 
            });
        });
    });


    
    store.bind(sock.ev);

    sock.ev.on('contacts.update', (contacts) => { // UPDATE KONTAK
        contacts.forEach(contact => {
            store.contacts[contact.id] = contact;
        });

    });

    sock.ev.on('messages.upsert', async (m) => { // CHAT MASUK
        try {  // console.log(JSON.stringify(m, null, 2))

            if (!m || !m.messages || !m.messages[0]) {
                console.log(chalk.redBright('Pesan tidak valid'), chalk.yellow(phoneNumber));
                return;
            }

            if (m.type === 'append') {
                return false;
            }

            const messageTimestamp = m.messages[0].messageTimestamp;
            const message = m.messages[0];
            const key = message.key || {};
            const remoteJid = key.remoteJid || '';
            const fromMe = key.fromMe || false;
            const id = key.id || false;
            const participant = key.participant || ''; // Untuk pesan dari grup
            const pushName = message.pushName || 'Unknown';
            const isGroup = remoteJid.endsWith('@g.us'); // Cek apakah pesan dari grup
            const sender = isGroup ? participant : remoteJid;

            if (remoteJid == "status@broadcast") {
                return false;
            }


           // Handle Destination
           const destination = config.bot_destination.toLowerCase();

           if (
               (isGroup && destination === 'private') || 
               (!isGroup && destination === 'group')
           ) {
               return;
           }



            let content = '';
            let messageType = '';
            if (message && message.message) {
                messageType = Object.keys(message.message)[0];
                // stickerMessage,audioMessage,extendedTextMessage,imageMessage, videoMessage

                content = messageType === 'conversation' ? message.message.conversation :
                messageType === 'extendedTextMessage' ? message.message.extendedTextMessage.text :
                messageType === 'senderKeyDistributionMessage' ? message.message.conversation :
                messageType === 'imageMessage' ? message.message.imageMessage.caption || 'No caption' :
                messageType === 'stickerMessage' ? 'stickerMessage' :
                messageType === 'templateButtonReplyMessage' ? message.message.templateButtonReplyMessage.selectedId : '';

            } else {
                return console.log(chalk.redBright('Message atau message.message tidak terdefinisi'));
            }

            if(content == ''){return}

            let truncatedContent = content;

            if (content.length > 10) {
                truncatedContent = content.substring(0, 10) + '...';
            }
            //if(content == '-') return
            const currentTime = Date.now();
            if (lastMessageTime[sender] && (currentTime - lastMessageTime[sender] < config.rate_limit)) {
                console.log(chalk.redBright(`Rate limit : ${truncatedContent} - ${sender}`));
                return; 
            }
            lastMessageTime[sender] = currentTime;
            logWithTime(pushName, truncatedContent)
            //console.log(chalk.greenBright(`${pushName} : ${truncatedContent}`));

            // Log File
            writeLog('INFO', `${remoteJid}: ${content}`);


            // Cek Users
            const userReady = getUser(sender);
            if (!userReady) {
                addUser(sender, -1);
            }

            /* --------------------- Send Message ---------------------- */
            try {
                await processMessage(content, sock, sender, remoteJid, message, messageType, pushName);
                
            } catch (error) {
                console.error("Terjadi kesalahan saat memproses pesan:", error);
            }
        } catch (error) {
            console.log(chalk.redBright(`Error dalam message upsert: ${error.message}`));
        }


    });


    sock.ev.on("connection.update", async (update) => {
        const { connection, lastDisconnect, qr } = update;
    
        // Tampilkan QR jika tipe koneksi menggunakan QR
        if (qr != null && config.type_connection.toLowerCase() === 'qr') {
            console.log(chalk.yellowBright(`Menampilkan QR`));
            qrcode.generate(qr, { small: true }, (qrcodeStr) => {
                console.log(qrcodeStr);
            });
        }
    
        // Jika koneksi terbuka
        if (connection === 'open') {

            global.sock = sock; 
            
            await new Promise(resolve => setTimeout(resolve, 1000));
            await sock.sendMessage(`${config.phone_number_bot}@s.whatsapp.net`, { text: "Bot Connected" });
      
            console.log(chalk.greenBright(`✅ KONEKSI TERHUBUNG`));
            return;
        }
    
        // Jika koneksi tertutup
        if (connection === 'close') {
            const statusCode = lastDisconnect?.error?.output?.statusCode;
            const reason = new Boom(lastDisconnect?.error)?.output?.statusCode;
            const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
    
            console.log(`❌ Koneksi terputus. Reason: ${statusCode || "undefined"}`);
            console.log('🔌 UPDATE:', update);
    
            switch (reason) {
                case DisconnectReason.badSession:
                    console.log(chalk.redBright(`Bad Session File, Start Again ...`));
                    return await connectToWhatsApp();
    
                case DisconnectReason.connectionClosed:
                    console.log(chalk.redBright(`Connection closed, reconnecting...`));
                    return await connectToWhatsApp();
    
                case DisconnectReason.connectionLost:
                    console.log(chalk.redBright(`Connection lost from server, reconnecting...`));
                    return await connectToWhatsApp();
    
                case DisconnectReason.connectionReplaced:
                    console.log(chalk.redBright(`Connection replaced by another session. Please restart bot.`));
                    return await connectToWhatsApp();
    
                case DisconnectReason.loggedOut:
                    console.log(chalk.redBright(`Perangkat logout. Silakan scan ulang.`));
                    break;
    
                case DisconnectReason.restartRequired:
                    console.log(chalk.redBright(`Restart required. Restarting...`));
                    await new Promise(resolve => setTimeout(resolve, 3000));
                    return await connectToWhatsApp();
    
                case DisconnectReason.timedOut:
                    console.log(chalk.redBright(`Connection timed out. Reconnecting...`));
                    return await connectToWhatsApp();
    
                default:
                    console.log(chalk.redBright(`Unknown disconnect reason: ${reason} | ${connection}`));
                    return await connectToWhatsApp();
            }
        }
    });
    

    return sock;
}

checkAndUpdate();

// api.get('/api/doa/random')
//   .then(response => console.log(response))
//   .catch(error => console.error(error));

// api.getBuffer('/api/textpro/blackpink', { text : 'Blackpink'})
//   .then(response => console.log(response))
//   .catch(error => console.error(error));


// Upload File Tmp
// const filePath = path.join(__dirname, 'tes.png');
// api.tmpUpload(filePath)
//   .then(response => console.log('File uploaded successfully:', response))
//   .catch(error => console.error('Error uploading file:', error));
