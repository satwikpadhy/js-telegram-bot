const pinMessage = function(bot,msg) {
    console.log(`/pin called for ${msg.chat.id}`)
    bot.pinChatMessage(msg.chat.id,msg.reply_to_message.message_id)
}

module.exports=pinMessage