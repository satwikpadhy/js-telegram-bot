const postgres = require('pg').Client
var CryptoJS = require("crypto-js");

const getNote = function(bot,connString,chatId,spl) {
    console.log('getNote called')
    if(spl.length === 1) {
        bot.sendMessage(chatId, "Please Specify the Notename")
    }
    else {
        noteName = spl[1]
        console.log(`save called for chatId = ${chatId} and notename = ${noteName}`)
        const pg = new postgres(connString)
        const queryString = `select data, type from savednotes where chat_id = '${chatId}' and notename = '${noteName}'`
        pg.connect()
            .then(() => {
                console.log('Connected to the database');

                return pg.query(queryString);
            })
            .then((result) => {
                console.log('Query result:', result.rows);
                console.log('Result rows length :', result.rows.length)
                if(result.rows.length == 0) {
                    bot.sendMessage(chatId,"Note does not exist!")
                }
                else {
                    fileId = result.rows[0].data
                    type = result.rows[0].type
                    if(type == "img") {
                        const options = {caption:`Here's the image named → ${noteName}`}
                        bot.sendPhoto(chatId,fileId,options)
                    }
                    else if(type == "txt") {
                        const decryptedText = CryptoJS.AES.decrypt(fileId, spl[1].concat(chatId).concat(connString)).toString(CryptoJS.enc.Utf8)
                        bot.sendMessage(chatId,`Here's the note named → ${noteName} : \n\n${decryptedText}`)
                    }
                    else if(type == "vid") {
                        const options = {caption:`Here's the video named → ${noteName}`}
                        bot.sendVideo(chatId,fileId,options)
                    }
                    else if(type == "doc") {
                        const options = {caption:`Here's the document named → ${noteName}`}
                        bot.sendDocument(chatId,fileId,options)
                    }
                    else if(type == "aud") {
                        const options = {caption:`Here's the audio named → ${noteName}`}
                        bot.sendAudio(chatId,fileId,options)
                    }
                    else if(type == "voice") {
                        const options = {caption:`Here's the voice named → ${noteName}`}
                        bot.sendVoice(chatId,fileId,options)
                    }
                }  
                // Similarly add other cases for other file types and handle note not found
            })
            .catch((error) => {
                console.error('Error executing the "get" query:', error);
            })
            .finally(() => {
                
                pg.end()
                .then(() => console.log('Disconnected from the database'))
                .catch((error) => console.error('Error disconnecting from the database:', error));
            });
    }
}

module.exports = getNote