const postgres = require('pg').Client;
var CryptoJS = require("crypto-js");

const updateDB = function(bot,pool,chatId, noteName, data, type) {
    console.log("update db called")
    
    const queryString = `update savednotes set data = '${data}', type = '${type}' where chat_id = '${chatId}' and notename = '${noteName}'`
    pool.query(queryString)
        .then((result) => {
            bot.sendMessage(chatId, "Note Updated Successfully!")
        })
        .catch( async (error) => {
            console.error('Error executing update query:', error)
        })
        .finally(() => {
            console.log("Exiting updateDB Function")
        });
}

const writeDB = function(bot,pool,chatId, noteName, data, type) {
    console.log(`/save called for chatId = ${chatId} and notename = ${noteName}`)
    // const pg = new postgres(connString)
    const queryString = `insert into savednotes values('${chatId}', '${noteName}', '${data}', '${type}')`
    pool.query(queryString)
        .then((result) => {
            // Handle query result
            bot.sendMessage(chatId, "Note Saved Successfully!")
        })
        .catch( async (error) => {
            console.log(`error = ${error.code}`)

            if(error.code == 23505) { 
                //Error code 23505 occurs when unique constraint is violated. i.e note already exists
                updateDB(bot,pool,chatId, noteName, data, type)
            }
            else {
                console.error('Error executing insert query:', error)
            }
        })
        .finally(() => {
            console.log("Exiting writeDB Function")
        });
}

const Save = async function(bot,connString,msg, spl,encryptionKey) {
    const chatId = msg.chat.id
    const userId = msg.from.id
    let data
    let type
	if(spl.length === 1) {
		bot.sendMessage(chatId, "Please Specify the Notename")
	}
	else {
        try {
            //Replacing all single quotes with two single quotes so as to escape the single quote when putting it into the SQL
            noteName = spl[1].replace(/\'/g, `''`) 
            const userRole = await bot.getChatMember(chatId, userId)
            const status = userRole.status

            if(status === 'administrator' || status === 'creator' || msg.chat.type === 'private') {
                //Code to get the data type and Set the variables accordingly
                if("photo" in msg.reply_to_message) {
                    data = msg.reply_to_message.photo[3].file_id 
                    //photo[3] had the highest resolution. Thats why it was selected.
                    type = "img"
                }
                else if("text" in msg.reply_to_message) {
                    key = spl[1].concat(chatId).concat(encryptionKey)
                    data = CryptoJS.AES.encrypt(msg.reply_to_message.text, key)
                    type = "txt"
                }
                else if("video" in msg.reply_to_message) {
                    data = msg.reply_to_message.video.file_id
                    type = "vid"
                }
                else if("document" in msg.reply_to_message) {
                    data = msg.reply_to_message.document.file_id
                    type = "doc"
                }
                else if("audio" in msg.reply_to_message) {
                    data = msg.reply_to_message.audio.file_id
                    type = "aud"
                }
                else if("voice" in msg.reply_to_message) {
                    data = msg.reply_to_message.voice.file_id
                    type = "voice"
                }
                console.log(`chatId = ${chatId}, notename = ${noteName}, data = ${data}, doctype = ${type}`)
                writeDB(bot,connString,chatId,noteName,data,type)
            }
            else {
                bot.sendMessage(chatId, "Sorry, non-admins cannot use this command")
            }
        }
        catch(err)
            {
                console.log(err)
            }
	}
}



module.exports = Save