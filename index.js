const save = require('./utils/Save')
const getNote = require('./utils/getNote')
require('dotenv').config()
const TelegramBot = require('node-telegram-bot-api');

const token = process.env.token

const bot = new TelegramBot(token, {polling: true})

const connString = {
  database : process.env.database,
  user : process.env.user,
  password : process.env.password,
  host : process.env.host,
  port : process.env.port
}



bot.on('message', (msg) => {
  const chatId = msg.chat.id

  if("text" in msg) {
    const text = msg.text 
    spl = text.split(" ")
    command = spl[0]
    // console.log("command =", command)
    // console.log(msg.reply_to_message)

    if(command == "/start") {
        reply_text = "Hello I am @cruzex_bot. Send /help to get a list of commands."
        bot.sendMessage(chatId, reply_text)
    }

    if(command == "/help") {
        reply_text = "Help functionality yet to be implemented."
        bot.sendMessage(bot,chatId, reply_text)
    }

    if(command == "/save") {
		    save(connString,bot,msg,spl)
    }  

    if(command == "/get") {
        getNote(bot,connString,chatId,spl)
    }
  }
});