const pinMessage = async function(bot,msg) {
    console.log(`/pin called for ${msg.chat.id}`)
    const chatId = msg.chat.id
    const userId = msg.from.id
    const userRole = await bot.api.getChatMember(chatId, userId)
    const status = userRole.status
    // console.log(chatId, userId, status)

    if(status === 'administrator' || status === 'creator' || msg.chat.type === 'private') {
        try {
            const msg_to_pin = msg.reply_to_message.message_id
            bot.api.pinChatMessage(msg.chat.id,msg_to_pin)
            .then(() =>{
                bot.api.sendMessage(msg.chat.id,"Message Pinned Successfully!")
            })
            .catch((error) => {
                console.error('Error pinning the message:', error);
            })
        }
        catch {
            bot.api.sendMessage(chatId,"Please reply to a message you want to pin")
        }
    }
    else {
        bot.api.sendMessage(chatId, "Sorry, non-admins cannot use this command")
    }
}

const unpinMessage = async function(bot,msg) {
    console.log(`/unpin called for ${msg.chat.id}`)
    const chatId = msg.chat.id
    const userId = msg.from.id
    const userRole = await bot.api.getChatMember(chatId, userId)
    const status = userRole.status

    if(status === 'administrator' || status === 'creator' || msg.chat.type === 'private') {
        bot.api.unpinChatMessage(msg.chat.id)
            .then(() =>{
                bot.api.sendMessage(msg.chat.id,"Message Unpinned Successfully!")
            })
            .catch((error) => {
                // console.error('Error unpinning the message:', error);
                bot.api.sendMessage(msg.chat.id, "Error in unpinning the message. Perhaps there was no message to unpin?")
            })
    }
    else {
        bot.api.sendMessage(chatId, "Sorry, non-admins cannot use this command")
    }
}

export default {
    pinMessage,
    unpinMessage
}