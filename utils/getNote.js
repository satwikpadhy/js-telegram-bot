const postgres = require('pg').Client

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
                fileId = result.rows[0].data
                type = result.rows[0].type
                if(type == "img") {
                    bot.sendPhoto(chatId,fileId)
                }
                // Similarly add other cases for other file types and handle note not found
            })
            .catch((error) => {
                console.error('Error executing query:', error);
            })
            .finally(() => {
                
                pg.end()
                .then(() => console.log('Disconnected from the database'))
                .catch((error) => console.error('Error disconnecting from the database:', error));
            });
    }
}

module.exports = getNote