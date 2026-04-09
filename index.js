const save = require('./utils/Save')
const getNote = require('./utils/getNote')
const notes = require('./utils/notes')
const formatUptime = require('./utils/formatUptime')
const deleteNote = require('./utils/deleteNote')
const pinMessage = require('./utils/pinMessage')
const userManagement = require('./utils/userManagement')
const pool = require('./utils/pool')
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

app.get('/health', async (req, res) => {
    try {
        // Check if bot is connected
        getMe("healthCheck")
        
        // Check if pg connection is working
        const queryString = `SELECT 1`
        if (bot && me) {
            pool.query(queryString)
                .then(() => {
                    res.status(200).json({
                        status: 'healthy',
                        timestamp: new Date().toISOString(),
                        bot_username: me.username,
                        uptime: formatUptime(process.uptime())
                    });
                })
                .catch((error) => {
                    res.status(503).json({
                            status: 'unhealthy',
                            timestamp: new Date().toISOString(),
                            message: 'Postgres connection error' + error
                        });
                })
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
            status: 'unhealthy',
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
        save(bot,pool,msg,spl,encryptionKey)
    }  

    else if(command == "/get") {
        getNote(bot,pool,chatId,spl,encryptionKey)
    }
    
    else if(command == `/notes` || command == `/notes@${me.username}`) {
        notes(bot,pool,chatId)
    }

    else if(command == '/delete') {
        deleteNote(bot,pool,msg,spl)
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

bot.on('callback_query' , async (cq) => {
    chatId = cq.message.chat.id
    callbackData = cq.data
    console.log(`Inside callback query block for chatId = ${chatId} and callback data = ${callbackData}`)
    let spl = callbackData.split(" ")
    messageId = cq.message.message_id

    try {
        if(spl[0] === '/get') {
            await bot.deleteMessage(chatId,messageId) //To be changed to edit message in the future releases.
            getNote(bot,pool,chatId,spl,encryptionKey)
        }
        else if(spl[0] == '/delete') {
            if(spl.length === 2) {
                let row = []
                let keyboard = []
                row.push({'text' : "Yes", 'callback_data' : "/delete " + spl[1] + " confirmed"})
                row.push({'text' : "No", 'callback_data' : "/delete " + spl[1] + " aborted"})
                keyboard.push(row)
                let editOptions = {'message_id' : messageId, 'chat_id' : chatId, 'reply_markup' : {'inline_keyboard' : keyboard}}
                bot.editMessageText(
                    "You are going to delete the note named\n**" + 
                    spl[1] + 
                    "**\n\nAre You Sure???", editOptions
                )
            }
            else if(spl.length === 3) {
                if(spl[2] === 'confirmed') {
                    const deleteReply = await deleteNote(bot,pool,cq.message,spl)
                    console.log("deleteReply :" + deleteReply)
                    let editOptions = {'message_id' : messageId, 'chat_id' : chatId}
                    bot.editMessageText(deleteReply,editOptions)
                }
                else {
                    let editOptions = {'message_id' : messageId, 'chat_id' : chatId}
                    bot.editMessageText("Delete Aborted", editOptions)
                }
            }
        }
            
    } catch (error) {
        console.log(error)
        bot.sendMessage(chatId,"Sorry, I cannot interact with messages older than 48 hours due to Telegram limitations.")
    }
})

// To be implemented in future releases

// bot.on('new_chat_members', (info) => {
//     console.log(info)
//     var chat_id = info.chat.id
//     var added_by = info.from.id
//     var user_id = info.new_chat_participant.id
//     var username = info.new_chat_participant.username
//     var is_bot = info.new_chat_participant.is_bot
//     console.log(chat_id,added_by,user_id,username,is_bot)
// })

// bot.on('left_chat_member', (info) => {
//     console.log(info)
//     var chat_id = info.chat.id
//     var added_by = info.from.id
//     var user_id = info.new_chat_participant.id
//     var username = info.new_chat_participant.username
//     var is_bot = info.new_chat_participant.is_bot
//     console.log(chat_id,added_by,user_id,username,is_bot)
// })