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
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const { processMessage }        = require('./lib/ai');
const { Boom }                  = require("@hapi/boom");
const qrcode                    = require('qrcode-terminal');
const pino                      = require("pino");
const lastMessageTime           = {};
const logger                    = pino({ level: "silent" });
const { addUser, getUser } = require('./lib/users');
const { clearDirectory, logWithTime } = require('./lib/utils');
clearDirectory('./tmp');


async function checkAndUpdate() {
    if (config.AutoUpdate == 'on') {
      const { cloneOrUpdateRepo } = require('./lib/cekUpdate');
      await cloneOrUpdateRepo(); // Menunggu hingga cloneOrUpdateRepo selesai
    }
    connectToWhatsApp();
  }





async function connectToWhatsApp() {
    const sessionDir = path.join(__dirname, 'session');

    const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        logger: logger,
        printQRInTerminal: false,
        auth: state,
        browser: ["Ubuntu", "Chrome", "20.0.04"],
    });

    if (!sock.authState.creds.registered && config.type_connection == 'pairing') {
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
            const userReady = getUser(remoteJid);
            if (!userReady) {
                addUser(remoteJid, -1);
            }

            /* --------------------- Send Message ---------------------- */
            try {
                const response = await processMessage(content, sock, remoteJid, message, messageType, pushName);
                
            } catch (error) {
                console.error("Terjadi kesalahan saat memproses pesan:", error);
            }
        } catch (error) {
            console.log(chalk.redBright(`Error dalam message upsert: ${error.message}`));
        }


    });


    sock.ev.on("connection.update", async (update) => {
        const { connection, lastDisconnect, qr } = update;
        if (qr != null && config.type_connection == 'qr') {
            console.log(chalk.yellowBright(`Menampilkan QR`));
        
            // Menampilkan QR code dalam terminal
            qrcode.generate(qr, { small: true }, (qrcodeStr) => {
                console.log(qrcodeStr);  // Menampilkan QR code dalam bentuk kecil
            });
        }

        if (connection === 'close') {
            let reason = new Boom(lastDisconnect?.error)?.output.statusCode;
            switch (reason) {
                case DisconnectReason.badSession:
                    console.log(chalk.redBright(`Bad Session File, Start Again ...`));
                    return await connectToWhatsApp()
                    break;

                case DisconnectReason.connectionClosed:
                    console.log(chalk.redBright(`Connection closed, reconnecting....`));
                    return await connectToWhatsApp()
                    break;

                case DisconnectReason.connectionLost:
                    console.log(chalk.redBright(`Connection Lost from Server, reconnecting...`));
                    return await connectToWhatsApp()
                    break;

                case DisconnectReason.connectionReplaced:
                    console.log(chalk.redBright(`Connection Replaced, Another New Session Opened, Please Restart Bot`));
                    return await connectToWhatsApp()
                    break;

                case DisconnectReason.loggedOut:
                    console.log(chalk.redBright(`Perangkat Terkeluar, Silakan Lalukan Scan/Pairing Ulang`));
                    break;

                case DisconnectReason.restartRequired:
                    console.log(chalk.redBright(`Restart Required, Restarting..`));
                    return await connectToWhatsApp()
                    break;

                case DisconnectReason.timedOut:
                    console.log(chalk.redBright(`Connection TimedOut, Reconnecting...`));
                    return await connectToWhatsApp()
                    break;

                default:
                    console.log(chalk.redBright(`Unknown DisconnectReason: ${reason}|${connection}`));
                    return await connectToWhatsApp();
                    break;
            }

        } else if (connection === 'open') {
            await sock.sendMessage(`${config.phone_number_bot}@s.whatsapp.net`, { text: "Bot Connected" });
            console.log(chalk.greenBright(`KONEKSI TERHUBUNG`));

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
