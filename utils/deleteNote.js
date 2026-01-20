const deleteNote = async function(bot,pool,msg,spl) {
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
                
                const queryString = `delete from savednotes where chat_id = '${chatId}' and notename = '${noteName}'`
                pool.query(queryString)
                    .then((result) => {
                        if(result.rowCount == 0) {
                            bot.sendMessage(chatId,"Note doesnot exist!")
                        }
                        else {
                            bot.sendMessage(chatId,"Note deleted successfully!")
                        }
                    })
                    .catch((error) => {
                        console.log('Error executing the "delete" query : ' , error)
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