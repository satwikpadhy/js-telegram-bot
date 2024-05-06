const postgres = require('./PgConnect')

const writeDB = function(chatId, noteName, data, type) {
    postgres.connect()
        .then(() => {
            console.log('Connected to the database');
            return postgres.query('insert into savednotes values()');
        })
        // .then((result) => {
        //     // Handle query result
        //     console.log('Query result:', result.rows);
        // })
        .catch((error) => {
            console.error('Error executing query:', error);
        })
        .finally(() => {
            postgres.end()
            .then(() => console.log('Disconnected from the database'))
            .catch((error) => console.error('Error disconnecting from the database:', error));
        });
}

const Save = async function(bot,msg, spl) {
	if(spl.length == 1) {
		bot.sendMessage(chatId, "Please Specify the Notename")
	}
	else {

		notename = spl[1]
        try {
            if(msg.chat.type == 'private') {
        writeDB(chatId,notename,data,type)
            }
            else {
                const userRole = await bot.getChatMember(chatId, userId) //.then((userRole) => {
                    console.log(userRole)
                //     //add check for admin here
                //     writeDB(chatId, notename)
                // })
            }
        }
        catch(err)
            {
                
            }
	}
}



module.exports = Save