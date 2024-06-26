const save = require('./utils/Save')
const getNote = require('./utils/getNote')
const notes = require('./utils/notes')
const deleteNote = require('./utils/deleteNote')
require('dotenv').config()
const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs')

const token = process.env.token

const bot = new TelegramBot(token, {polling: true})
const connString = {
    database : process.env.database,
    user : process.env.user,
    password : process.env.password,
    host : process.env.host,
    port : process.env.port
}

encryptionKey = process.env.key
var me = ''
const getMe = (async () => {
    me = await bot.getMe()
})
getMe()
const helpText = fs.readFileSync('help.md').toString()

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