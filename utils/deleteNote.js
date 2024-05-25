const postgres = require('pg').Client

const deleteNote = async function(bot,connString,msg,spl) {
    const chatId = msg.chat.id
    const userId = msg.from.id

    if(spl.length === 1) {
        console.log(`No notename specified by ${chatId} for /delete`)
        bot.sendMessage(chatId, "Please Specify the Notename")
    }
    else {
        try {
            //Replacing all single quotes with two single quotes so as to escape the single quote when putting it into the SQL
            noteName = spl[1].replace(/\'/g, `''`) 
            const userRole = await bot.getChatMember(chatId, userId)
            const status = userRole.status

            if(status === 'administrator' || status === 'creator' || msg.chat.type === 'private') {
                console.log(`/deleteNote called for chatId = ${chatId} and notename = ${noteName}`)
                const pg = new postgres(connString)
                const queryString = `delete from savednotes where chat_id = '${chatId}' and notename = '${noteName}'`
                pg.connect()
                    .then(() => {
                        console.log("Connected to the database")
                        return pg.query(queryString)
                    })
                    .then((result) => {
                        if(result.rowCount == 0) {
                            bot.sendMessage(chatId,"Note doesnot exist!")
                        }
                        else {
                            bot.sendMessage(chatId,"Note deleted successfully!")
                        }
                    })
                    .catch((error) => {
                        console.log('Error executing the "delete" query')
                    })
                    .finally(() => {
                        pg.end()
                        .then(() => console.log('Disconnected from the database'))
                        .catch((error) => console.error('Error disconnecting from the database:', error));
                    })
            }
            else {
                bot.sendMessage(chatId, "Sorry, non-admins cannot use this command")
            }
        }
        catch(err) {
            console.log(err)
        }
    }
}

module.exports = deleteNote