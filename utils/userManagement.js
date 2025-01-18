// const postgres = require('pg').Client
// var CryptoJS = require("crypto-js");

const banUser = function(bot,msg) {
    chat_id = msg.chat.id
    to_ban_id = msg.reply_to_message.from.id

    bot.banChatMember(chat_id, to_ban_id)
        .then(() => {
            console.log("User banned successfully")
            bot.sendMessage(chat_id, "User banned successfully")
        })
}

const unbanUser = function(bot,msg) {
    chat_id = msg.chat.id
    to_ban_id = msg.reply_to_message.from.id

    bot.unbanChatMember(chat_id, to_ban_id)
        .then(() => {
            console.log("User unbanned successfully")
            bot.sendMessage(chat_id, "User unbanned successfully")
        })
}

const warnUser = function(bot,msg) {
    chat_id = msg.chat.id
    bot.sendMessage(chat_id, "This function is in development")
}

const removeWarn = function(bot, msg) {
    chat_id = msg.chat.id
    bot.sendMessage(chat_id, "This function is in development")
}

module.exports = {
    banUser, 
    unbanUser,
    warnUser,
    removeWarn
}