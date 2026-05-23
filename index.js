import save from './utils/Save.js'
import getNote from './utils/getNote.js'
import notes from './utils/notes.js'
import formatUptime from './utils/formatUptime.js'
import deleteNote from './utils/deleteNote.js'
import pinMessage from './utils/pinMessage.js'
import userManagement from './utils/userManagement.js'
import pool from './utils/pool.js'
import dotenv from 'dotenv'
dotenv.config()
import fs from 'fs'
import express from 'express'
import { Bot } from "grammy";
var token = process.env.token

var connString = {
    database : process.env.database,
    user : process.env.user,
    password : process.env.password,
    host : process.env.host,
    port : process.env.port
}

const bot = new Bot(token)


const encryptionKey = process.env.key
const getMe = (async () => {
    return (await bot.api.getMe())
})
var me = await getMe()
const helpText = fs.readFileSync('help.md').toString()

//Health Check implementation

const app = express();
const PORT = process.env.PORT || 8321;
app.use(express.json());

app.get('/health', async (req, res) => {
    try {
        // Check if bot is connected
        me = await getMe()
        
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


/*
bot.command("pin", async (ctx) => {
    // 1. Send the message first
    const sentMessage = await ctx.reply("This is the message I am going to pin!");

    // 2. Pin that message using its ID and the chat ID
    await ctx.api.pinChatMessage(ctx.chat.id, sentMessage.message_id);
});

Migrate the code to this


Also implement gramy error handling.
*/

bot.on('message', (ctx) => {
    const chatId = ctx.chat.id
    var msg = ctx.message

    if("text" in msg) {
        const text = msg.text 
        var spl = text.split(" ")
        var command = spl[0]

        if(command == "/start") {
            bot.api.sendMessage(chatId, `Hello I am @${me.username}. Send /help to get a list of commands.`)
        }

        else if(command == "/help" || command ==`/help@${me.username}`) {
            bot.api.sendMessage(chatId, helpText.replace("${me}", `${me.username}`))
        }

        else if(command == "/save" || command == `/save@${me.username}`) {
            save(bot, pool, msg, spl, encryptionKey)
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

        else if(msg.chat.type != 'private' && 1===2) { //Temporarily disable group features

            if(command == '/ban') {
                userManagement.banUser(bot,msg)
            }
            
            else if(command == '/unban') {
                userManagement.unbanUser(bot,msg)
            }

            else if(command == '/warn') {
                userManagement.warnUser(bot, connString, msg)
                //Check if not using connString is possible
            }

            else if(command == '/unwarn') {
                userManagement.removeWarn(bot, connString, msg)
                //Check if not using connString is possible
            }
            
            else if(command == '/kick') {
                userManagement.kickUser(bot,msg)
            }
        }
    }
});

bot.on('callback_query', async (ctx) => {
    let cq = ctx.callbackQuery
    let chatId = cq.message.chat.id
    let callbackData = cq.data
    console.log(`Inside callback query block for chatId = ${chatId} and callback data = ${callbackData}`)
    let spl = callbackData.split(" ")
    let messageId = cq.message.message_id

    try {
        if(spl[0] === '/get') {
            bot.api.answerCallbackQuery(cq.id, {text: "Fetching your note...", show_alert: false})
            await bot.api.deleteMessage(chatId,messageId) //To be changed to edit message in the future releases.
            getNote(bot,pool,chatId,spl,encryptionKey)
        }
        else if(spl[0] == '/delete') {
            if(spl.length === 2) {
                bot.api.answerCallbackQuery(cq.id, {text: "⚠️ Confirm deletion ⚠️", show_alert: true})
                let row = []
                let keyboard = []
                row.push({'text' : "Yes", 'callback_data' : "/delete " + spl[1] + " confirmed"})
                row.push({'text' : "No", 'callback_data' : "/delete " + spl[1] + " aborted"})
                keyboard.push(row)
                
                await ctx.editMessageText("**\n\nAre You Sure???", {
                  reply_markup: {
                    inline_keyboard: keyboard
                  }
                })
            }
            else if(spl.length === 3) {
                if(spl[2] === 'confirmed') {
                    bot.api.answerCallbackQuery(cq.id, {text: "Deleting note...", show_alert: false})
                    const deleteReply = await deleteNote(bot, pool, cq.message, spl)
                    console.log("deleteReply :" + deleteReply)
                    await ctx.editMessageText(deleteReply)
                }
                else {
                    bot.api.answerCallbackQuery(cq.id, {text: "Deletion cancelled", show_alert: false})
                    await ctx.editMessageText("Delete Aborted")
                }
            }
        }
            
    } catch (error) {
        console.log(error)
        // bot.api.sendMessage(chatId,"Sorry, I cannot interact with messages older than 48 hours due to Telegram limitations.")
        ctx.reply("Sorry, I cannot interact with messages older than 48 hours due to Telegram limitations.")
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

bot.start()

bot.catch((err) => {
  const ctx = err.ctx;
  console.error(`Error while handling update ${ctx.update.update_id}:`);
  const e = err.error;
  if (e instanceof GrammyError) {
    console.error("Error in request:", e.description);
  } else if (e instanceof HttpError) {
    console.error("Could not contact Telegram:", e);
  } else {
    console.error("Unknown error:", e);
  }
});