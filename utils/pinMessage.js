const pinMessage = function(bot,msg) {
    console.log(`/pin called for ${msg.chat.id}`)
    bot.pinChatMessage(msg.chat.id,msg.reply_to_message.message_id)
        .then(() =>{
            bot.sendMessage(msg.chat.id,"Message Pinned Successfully!")
        })
        .catch((error) => {
            console.error('Error pinning the message:', error);
        })
}

const unpinMessage = function(bot,msg) {
    console.log(`/unpin called for ${msg.chat.id}`)
    bot.unpinChatMessage(msg.chat.id)
        .then(() =>{
            bot.sendMessage(msg.chat.id,"Message unPinned Successfully!")
        })
        .catch((error) => {
            console.error('Error unpinning the message:', error);
        })
}

module.exports = {
    pinMessage,
    unpinMessage
}