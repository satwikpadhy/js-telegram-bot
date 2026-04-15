const notes = function(bot,pool,chatId) {
    console.log(`/notes called for ${chatId}`)
    const queryString = `select * from savednotes where chat_id = $1 order by lower(notename)`

    try {
        pool.query(queryString,[chatId])
            .then((result) =>    {
                if(result.rowCount == 0) {
                    bot.sendMessage(chatId, "There are no saved notes in this chat. Use /save to get started")
                }
                else {
                        let rows = []
                        let keyboard = []
                        for(i=1;i<=result.rows.length;i++) {
                            let button = {'text' : result.rows[i-1].notename, 'callback_data' : "/get " + result.rows[i-1].notename}
                            rows.push(button)
                            if(i%2 == 0 && i != 1) {
                                keyboard.push(rows)
                                rows = []
                            }
                        }
                        keyboard.push(rows)
                        let inlineKeyboardMarkup = {'reply_markup' : {'inline_keyboard' : keyboard}}
                        let text = 'Notes in this chat :'
                        bot.sendMessage(chatId, text, inlineKeyboardMarkup)
                    }
            })
    }
    catch (error) {
        console.error('Error executing the "notes" query:', error);
    }
}

module.exports = notes