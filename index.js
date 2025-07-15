const save = require('./utils/Save')
const getNote = require('./utils/getNote')
const notes = require('./utils/notes')
const deleteNote = require('./utils/deleteNote')
const pinMessage = require('./utils/pinMessage')
const userManagement = require('./utils/userManagement')
require('dotenv').config()
const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs')
const express = require('express')
const postgres = require('pg').Client
var token = ''
var connString = ''

token = process.env.token
connString = {
    database : process.env.database,
    user : process.env.user,
    password : process.env.password,
    host : process.env.host,
    port : process.env.port
}


const bot = new TelegramBot(token, {polling: true})


encryptionKey = process.env.key
var me = ''
const getMe = (async (zone) => {
    if(zone === "init") {
        console.log("getting me")
    }
        me = await bot.getMe()
    if(zone === "init") {
        console.log("Fetched Bot details successfully")
    }
})
getMe("init")
const helpText = fs.readFileSync('help.md').toString()

//Health Check implementation

const app = express();
const PORT = process.env.PORT || 8321;
app.use(express.json());

app.get('/health', (req, res) => {
    try {
        // Check if bot is connected
        getMe("healthCheck")
        
        // Check if pg connection is working
        const pg = new postgres(connString)
        const queryString = `select count(*) from savednotes`
        if (bot && me) {
            pg.connect()
                .then(() => {
                    // console.log("Connected to the database")
                    return pg.query(queryString)
                })
                .then((result) => {
                    // console.log(result.rows)
                    // if (bot && me) {
                    res.status(200).json({
                        status: 'healthy',
                        timestamp: new Date().toISOString(),
                        bot_username: me.username,
                        uptime: process.uptime() + " seconds",
                        pg_result: result.rows
                    });
                })
                .catch((error) => {
                    // console.error('Error executing the healthcheck query:', error);
                    res.status(503).json({
                            status: 'unhealthy',
                            timestamp: new Date().toISOString(),
                            message: 'Postgres connection error' + error
                        });
                })
                .finally(() => {
                        pg.end()
                            // .then(() => console.log('Disconnected from the database'))
                            .catch((error) => console.error('Error disconnecting from the database:', error));
                    });
        }
        else {
                res.status(503).json({
                    status: 'unhealthy',
                    timestamp: new Date().toISOString(),
                    message: 'Bot not initialized'
                });
        }
        
    } catch (error) {
        res.status(500).json({
            status: 'error',
            timestamp: new Date().toISOString(),
            message: error.message
        });
    }

});

// Start Express server
app.listen(PORT, () => {
    console.log(`Health check server running on port ${PORT}`);
});

bot.on('message', (msg) => {
  const chatId = msg.chat.id

  if("text" in msg) {
    const text = msg.text 
    spl = text.split(" ")
    command = spl[0]

    if(command == "/start") {
        bot.sendMessage(chatId, `Hello I am @${me.username}. Send /help to get a list of commands.`)
    }

    else if(command == "/help" || command ==`/help@${me.username}`) {
        bot.sendMessage(chatId, helpText.replace("${me}", `${me.username}`))
    }

    else if(command == "/save" || command == `/save@${me.username}`) {
        save(bot,connString,msg,spl,encryptionKey)
    }  

    else if(command == "/get") {
        getNote(bot,connString,chatId,spl,encryptionKey)
    }
    
    else if(command == `/notes` || command == `/notes@${me.username}`) {
        notes(bot,connString,chatId)
    }

    else if(command == '/delete') {
        deleteNote(bot,connString,msg,spl)
    }
    
    else if(command == '/pin') {
        pinMessage.pinMessage(bot,msg)
    }

    else if(command == '/unpin') {
        pinMessage.unpinMessage(bot,msg)
    }

    else if(msg.chat.type != 'private') {

        if(command == '/ban') {
            userManagement.banUser(bot,msg)
        }
        
        else if(command == '/unban') {
            userManagement.unbanUser(bot,msg)
        }

        else if(command == '/warn') {
            userManagement.warnUser(bot,connString,msg)
        }

        else if(command == '/unwarn') {
            userManagement.removeWarn(bot,connString,msg)
        }
        
        else if(command == '/kick') {
            userManagement.kickUser(bot,msg)
        }
    }
  }
});

bot.on('callback_query' , (cq) => {
    chatId = cq.message.chat.id
    noteName = cq.data
    console.log(`Inside callback query block for chatId = ${chatId} and notename = ${noteName}`)
    let spl = ['/get',noteName]
    messageId = cq.message.message_id
    // console.log(chatId,noteName)
    bot.deleteMessage(chatId,messageId)
    getNote(bot,connString,chatId,spl,encryptionKey)
})