const unpinMessage = function(bot,msg) {
    console.log(`/unpin called for ${msg.chat.id}`)
    bot.unpinChatMessage(msg.chat.id)
}

module.exports=unpinMessage