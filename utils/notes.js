const postgres = require('pg').Client

const notes = function(bot,connString,chatId) {
    console.log(`/notes called for ${chatId}`)
    const pg = new postgres(connString)
    const queryString = `select * from savednotes where chat_id = '${chatId}' order by notename`
    pg.connect()
            .then(() => {
                console.log('Connected to the database');

                return pg.query(queryString);
            })
            .then((result) => {
                // console.log(result.rows)
                if(result.rowCount == 0) {
                    bot.sendMessage(chatId, "There are no saved notes in this chat. Use /save to get started")
                }
                else {
                    let rows = []
                    let keyboard = []
                    for(i=1;i<=result.rows.length;i++) {
                        let button = {'text' : result.rows[i-1].notename, 'callback_data' : result.rows[i-1].notename}
                        rows.push(button)
                        if(i%3 == 0 && i != 1) {
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
            .catch((error) => {
                console.error('Error executing the "notes" query:', error);
            })
            .finally(() => {
                pg.end()
                .then(() => console.log('Disconnected from the database'))
                .catch((error) => console.error('Error disconnecting from the database:', error));
            });
}

module.exports = notes