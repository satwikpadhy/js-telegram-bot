const pinMessage = async function(bot,msg) {
    console.log(`/pin called for ${msg.chat.id}`)
    const chatId = msg.chat.id
    const userId = msg.from.id
    const userRole = await bot.getChatMember(chatId, userId)
    const status = userRole.status

    if(status === 'administrator' || status === 'creator' || msg.chat.type === 'private') {
        try {
            msg_to_pin = msg.reply_to_message.message_id
            bot.pinChatMessage(msg.chat.id,msg_to_pin)
            .then(() =>{
                bot.sendMessage(msg.chat.id,"Message Pinned Successfully!")
            })
            .catch((error) => {
                console.error('Error pinning the message:', error);
            })
        }
        catch {
            bot.sendMessage(chatId,"Please reply to a message you want to pin")
        }
    }
    else {
        bot.sendMessage(chatId, "Sorry, non-admins cannot use this command")
    }
}

const unpinMessage = async function(bot,msg) {
    console.log(`/unpin called for ${msg.chat.id}`)
    const chatId = msg.chat.id
    const userId = msg.from.id
    const userRole = await bot.getChatMember(chatId, userId)
    const status = userRole.status

    if(status === 'administrator' || status === 'creator' || msg.chat.type === 'private') {
        bot.unpinChatMessage(msg.chat.id)
            .then(() =>{
                bot.sendMessage(msg.chat.id,"Message Unpinned Successfully!")
            })
            .catch((error) => {
                console.error('Error unpinning the message:', error);
            })
    }
    else {
        bot.sendMessage(chatId, "Sorry, non-admins cannot use this command")
    }
}

module.exports = {
    pinMessage,
    unpinMessage
}