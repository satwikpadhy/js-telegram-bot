const banUser = async function (bot, msg) {
    const chat_id = msg.chat.id
    const userId = msg.from.id
    const userRole = await bot.api.getChatMember(chat_id, userId)
    const status = userRole.status

    if (status === 'administrator' || status === 'creator') {
        if (msg.reply_to_message) {
            const to_ban_id = msg.reply_to_message.from.id
            const to_ban_role = await bot.api.getChatMember(chat_id, to_ban_id)
            const to_ban_status = to_ban_role.status
            if (to_ban_status === 'administrator' || to_ban_status === 'creator') {
                bot.api.sendMessage(chat_id, "Ah!! These admins are too powerful for me")
            }
            else {
                bot.api.banChatMember(chat_id, to_ban_id)
                    .then(() => {
                        console.log("User banned successfully")
                        bot.api.sendMessage(chat_id, "User banned successfully")
                    })
            }
            
        }
        else {
            bot.api.sendMessage(chat_id, "Please reply to a message of the offender")
        }
    }
    else {
        bot.api.sendMessage(chat_id, "Sorry, non-admins cannot use this command")
    }
}

const unbanUser = async function (bot, msg) {
    const chat_id = msg.chat.id
    const userId = msg.from.id
    const userRole = await bot.api.getChatMember(chat_id, userId)
    const status = userRole.status

    if(status === 'administrator' || status === 'creator') {
        if(msg.reply_to_message) {
            const to_ban_id = msg.reply_to_message.from.id
            bot.api.unbanChatMember(chat_id, to_ban_id, {only_if_banned: true})
            .then(() => {
                console.log("User unbanned successfully")
                bot.api.sendMessage(chat_id, "User unbanned successfully")
            })
        }
        else {
            bot.api.sendMessage(chat_id,"Please reply to a message of the offender")
        }
    }
    else {
        bot.api.sendMessage(chat_id, "Sorry, non-admins cannot use this command")
    }
}

const kickUser = async function(bot,msg) {
    const chat_id = msg.chat.id
    const userId = msg.from.id
    const userRole = await bot.api.getChatMember(chat_id, userId)
    const status = userRole.status

    if(status === 'administrator' || status === 'creator') {
        if(msg.reply_to_message) {
            const to_ban_id = msg.reply_to_message.from.id
            bot.api.unbanChatMember(chat_id, to_ban_id)
            .then(() => {
                console.log("User kicked successfully")
                bot.api.sendMessage(chat_id, "User kicked successfully")
            })
        }
        else {
            bot.api.sendMessage(chat_id,"Please reply to a message of the offender")
        }
    }
    else {
        bot.api.sendMessage(chat_id, "Sorry, non-admins cannot use this command")
    }
}

const warnUser = async function (bot, pool, msg) {
    const chat_id = msg.chat.id;
    const userId = msg.from.id
    const userRole = await bot.api.getChatMember(chat_id, userId)
    const status = userRole.status

    if(status === 'administrator' || status === 'creator') {
        if(msg.reply_to_message) {
            const user_id = msg.reply_to_message.from.id;
            const to_ban_role = await bot.api.getChatMember(chat_id, user_id)
            const to_ban_status = to_ban_role.status
            if(to_ban_status === 'administrator' || to_ban_status === 'creator') {
                bot.api.sendMessage(chat_id, "Ah!! These admins are too powerful for me")
            }
            else {
                try {        
                    // Increment warning count or insert new record
                    const result = await pool.query(`
                        INSERT INTO user_warnings (chat_id, user_id, warn_count)
                        VALUES ($1, $2, 1)
                        ON CONFLICT (chat_id, user_id)
                        DO UPDATE SET warn_count = user_warnings.warn_count + 1
                        RETURNING warn_count
                    `, [chat_id, user_id]);
        
                    const warnCount = result.rows[0].warn_count;
        
                    if (warnCount >= 3) {
                        // Reset warnings and ban user
                        await pool.query(`
                            UPDATE user_warnings 
                            SET warn_count = 0 
                            WHERE chat_id = $1 AND user_id = $2
                        `, [chat_id, user_id]);
        
                        await bot.api.banChatMember(chat_id, user_id);
                        await bot.api.sendMessage(chat_id, 
                            `User has been banned after receiving ${warnCount} warnings.`);
                    } else {
                        await bot.api.sendMessage(chat_id, 
                            `Warning ${warnCount}/3 has been issued to the user.`);
                    }
        
                } catch (error) {
                    console.error('Error in warnUser:', error);
                    await bot.api.sendMessage(chat_id, 'Error processing warning.');
                } 
            }
            
        }
        else {
            bot.api.sendMessage(chat_id,"Please reply to a message of the offender")
        }
    }
    else {
        bot.api.sendMessage(chat_id, "Sorry, non-admins cannot use this command")
    }
}

const removeWarn = async function (bot, pool, msg) {
    const chat_id = msg.chat.id;
    const userId = msg.from.id
    const userRole = await bot.api.getChatMember(chat_id, userId)
    const status = userRole.status
    if (status === 'administrator' || status === 'creator') {
        if (msg.reply_to_message) {
            const user_id = msg.reply_to_message.from.id;
  
            try {
                const result = await pool.query(`
                  UPDATE user_warnings 
                  SET warn_count = GREATEST(warn_count - 1, 0)
                  WHERE chat_id = $1 AND user_id = $2
                  RETURNING warn_count
              `, [chat_id, user_id]);
  
                if (result.rows.length > 0) {
                    const newWarnCount = result.rows[0].warn_count;
                    await bot.api.sendMessage(chat_id, `Warning removed. User now has ${newWarnCount}/3 warnings.`);
                } else {
                    await bot.api.sendMessage(chat_id, 'User has no warnings to remove.');
                }
  
            } catch (error) {
                console.error('Error in removeWarn:', error);
                await bot.api.sendMessage(chat_id, 'Error removing warning.');
            }
        }
        else {
            bot.api.sendMessage(chat_id, "Please reply to a message of the offender")
        }
    }
    else {
        bot.api.sendMessage(chat_id, "Sorry, non-admins cannot use this command")
    }
}

export default {
    banUser, 
    unbanUser,
    warnUser,
    removeWarn,
    kickUser
}