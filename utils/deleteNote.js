const deleteNote = async function(bot,pool,msg,spl) {
    const chatId = msg.chat.id
    const userId = msg.from.id
    let resultReply
    let noteName

    if(spl.length === 1) {
        console.log(`/delete called for ${chatId} withour parameters`)
        const queryString = `select * from savednotes where chat_id = $1 order by lower(notename)`

        try {
            pool.query(queryString,[chatId])
                .then((result) =>    {
                    if(result.rowCount == 0) {
                        resultReply = "There are no saved notes in this chat. Use /save to get started"
                    }
                    else {
                            let rows = []
                            let keyboard = []
                            for(let i=1;i<=result.rows.length;i++) {
                                let button = {'text' : result.rows[i-1].notename, 'callback_data' : "/delete " + result.rows[i-1].notename}
                                rows.push(button)
                                if(i%2 == 0 && i != 1) {
                                    keyboard.push(rows)
                                    rows = []
                                }
                            }
                            keyboard.push(rows)
                            let inlineKeyboardMarkup = {'reply_markup' : {'inline_keyboard' : keyboard}}
                            let text = 'Notes in this chat :'
                            bot.api.sendMessage(chatId, text, inlineKeyboardMarkup)
                        }
                })
        }
        catch (error) {
            console.error('Error executing the "notes" query:', error);
        }
    }
    else if(spl.length === 3) {
        try {
            //Replacing all single quotes with two single quotes so as to escape the single quote when putting it into the SQL
            noteName = spl[1].replace(/\'/g, `''`) 
            const userRole = await bot.api.getChatMember(chatId, userId)
            const status = userRole.status

            if(status === 'administrator' || status === 'creator' || msg.chat.type === 'private') {
                console.log(`/deleteNote called for chatId = ${chatId} and notename = ${noteName}`)
                
                // const queryString = `delete from savednotes where chat_id = '${chatId}' and notename = '${noteName}'`
                const queryString = `delete from savednotes where chat_id = $1 and notename = $2`
                await pool.query(queryString,[chatId,noteName])
                    .then((result) => {
                        
                        if(result.rowCount == 0) {
                            resultReply = "Note doesnot exist!"
                        }
                        else {
                            resultReply = "Note deleted successfully!"
                        }
                    })
                    .catch((error) => {
                        console.log('Error executing the "delete" query : ' , error)
                    })
            }
            else {
                resultReply = "Sorry, non-admins cannot use this command"
            }
        }
        catch(err) {
            console.log(err)
        }
    }
    else
        bot.api.sendMessage(chatId, "Please delete using the /delete command. \"/delete notename\" is not supported anymore")

    return resultReply
}

export default deleteNote