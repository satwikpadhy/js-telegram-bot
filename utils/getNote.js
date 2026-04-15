var CryptoJS = require("crypto-js");

const getNote = function(bot,pool,chatId,spl,encryptionKey) {
    if(spl.length === 1) {
        console.log(`No notename specified by ${chatId} for /get`)
        bot.sendMessage(chatId, "Please Specify the Notename")
    }
    else {
        noteName = spl[1]
        console.log(`/getNote called for chatId = ${chatId} and notename = ${noteName}`)
        const queryString = `select data, type from savednotes where chat_id = $1 and notename = $2`
        pool.query(queryString,[chatId,noteName])
            .then((result) => {
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
                        key = spl[1].concat(chatId).concat(encryptionKey)
                        const decryptedText = CryptoJS.AES.decrypt(fileId, key).toString(CryptoJS.enc.Utf8)
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
    }
}

module.exports = getNote