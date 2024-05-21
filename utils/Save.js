const postgres = require('pg').Client;

const updateDB = function(bot,connString,chatId, noteName, data, type) {
    console.log("update db called")
    const pg = new postgres(connString)
    const queryString = `update savednotes set data = '${data}', type = '${type}' where chat_id = '${chatId}' and notename = '${noteName}'`
    pg.connect()
        .then(() => {
            console.log("Connected to the database")
            return pg.query(queryString)
        })
        .then((result) => {
            bot.sendMessage(chatId, "Note Updated Successfully!")
            pg.end()
                .then(() => console.log('Disconnected from the database 3'))
                .catch((error) => console.error('Error disconnecting from the database:', error))
        })
        .catch( async (error) => {
            console.error('Error executing update query:', error)
        })
        .finally(() => {
            console.log("Exiting WriteDB Function")
        });
}

const writeDB = function(bot,connString,chatId, noteName, data, type) {
    console.log(`save called for chatId = ${chatId} and notename = ${noteName}`)
    const pg = new postgres(connString)
    const queryString = `insert into savednotes values('${chatId}', '${noteName}', '${data}', '${type}')`
    console.log(`query = ${queryString}`)
    pg.connect()
        .then(() => {
            console.log('Connected to the database')
            return pg.query(queryString)
        })
        .then((result) => {
            // Handle query result
            bot.sendMessage(chatId, "Note Saved Successfully!")
            pg.end()
                .then(() => console.log('Disconnected from the database 1'))
                .catch((error) => console.error('Error disconnecting from the database:', error))
        })
        .catch( async (error) => {
            console.log(`error = ${error.code}`)

            if(error.code == 23505) { 
                //Error code 23505 occurs when unique constraint is violated. i.e note already exists
                await pg.end().then(() => console.log("Disconnected from the database 2"))
                updateDB(bot,connString,chatId, noteName, data, type)
            }
            else {
                console.error('Error executing insert query:', error)
            }
        })
        .finally(() => {
            console.log("Exiting WriteDB Function")
        });
}

const Save = async function(connString,bot,msg, spl) {
    const chatId = msg.chat.id
    const userId = msg.from.id
    let data
    let type
	if(spl.length === 1) {
		bot.sendMessage(chatId, "Please Specify the Notename")
	}
	else {
        try {
            noteName = spl[1]
            const userRole = await bot.getChatMember(chatId, userId)
            console.log(userRole)
            const status = userRole.status

            if(status === 'administrator' || status === 'creator' || msg.chat.type === 'private') {
                //Code to get the data type and Set the variables accordingly
                if("photo" in msg.reply_to_message) {
                    data = msg.reply_to_message.photo[3].file_id 
                    //photo[3] had the highest resolution. Thats why it was selected.
                    type = "img"
                }
                else if("text" in msg.reply_to_message) {
                    //Add encryption
                    data = msg.reply_to_message.text
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