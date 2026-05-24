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

bot.command("start", async (ctx) => {
    ctx.reply(`Hello I am @${me.username} v2. Send /help to get a list of commands.`);
});

bot.command("help", async (ctx) => {
    ctx.reply(helpText.replace("${me}", `${me.username}`));
});

bot.command("save", async (ctx) => {
    var msg = ctx.message
    if("text" in msg) {
        const text = msg.text 
        var spl = text.split(" ")
    }
    save(bot, pool, msg, spl, encryptionKey)
});

bot.command("get", async (ctx) => {
    const chatId = ctx.chat.id
    var msg = ctx.message
    if("text" in msg) {
        const text = msg.text 
        var spl = text.split(" ")
    }
    getNote(bot, pool, chatId, spl, encryptionKey)
});

bot.command("notes", async (ctx) => {
    const chatId = ctx.chat.id
    notes(bot,pool,chatId)
});

bot.command("delete", async (ctx) => {
    var msg = ctx.message
    if("text" in msg) {
        const text = msg.text 
        var spl = text.split(" ")
    }
    deleteNote(bot, pool, msg, spl)
});

bot.command("pin", async (ctx) => {
    var msg = ctx.message
    pinMessage.pinMessage(bot,msg)
});

bot.command("unpin", async (ctx) => {
    var msg = ctx.message
    pinMessage.unpinMessage(bot, msg)
});

//Add detection of private vs group chats in future releases and restrict these commands to group chats only. For now, these commands will be available in all types of chats but will only work in groups.
bot.command("ban", async (ctx) => {
    var msg = ctx.message
    userManagement.banUser(bot, msg)
});

bot.command("unban", async (ctx) => {
    var msg = ctx.message
    userManagement.unbanUser(bot, msg)
});

bot.command("warn", async (ctx) => {
    var msg = ctx.message
    userManagement.warnUser(bot, connString, msg)
});

bot.command("unwarn", async (ctx) => {
    var msg = ctx.message
    userManagement.removeWarn(bot, connString, msg)
});

bot.command("kick", async (ctx) => {
    var msg = ctx.message
    userManagement.kickUser(bot, msg)
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
  console.error(err.error);
});