const postgres = require('pg').Client

/*
To do : Add Checks so that only admins and owners can perform the following actions
*/

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

const warnUser = async function(bot,connString,msg) {
    const chat_id = msg.chat.id;
    const user_id = msg.reply_to_message.from.id;
    const pg = new postgres(connString)

    try {
        await pg.connect();

        // Increment warning count or insert new record
        const result = await pg.query(`
            INSERT INTO user_warnings (chat_id, user_id, warn_count)
            VALUES ($1, $2, 1)
            ON CONFLICT (chat_id, user_id)
            DO UPDATE SET warn_count = user_warnings.warn_count + 1
            RETURNING warn_count
        `, [chat_id, user_id]);

        const warnCount = result.rows[0].warn_count;

        if (warnCount >= 3) {
            // Reset warnings and ban user
            await pg.query(`
                UPDATE user_warnings 
                SET warn_count = 0 
                WHERE chat_id = $1 AND user_id = $2
            `, [chat_id, user_id]);

            await bot.banChatMember(chat_id, user_id);
            await bot.sendMessage(chat_id, 
                `User has been banned after receiving ${warnCount} warnings.`);
        } else {
            await bot.sendMessage(chat_id, 
                `Warning ${warnCount}/3 has been issued to the user.`);
        }

    } catch (error) {
        console.error('Error in warnUser:', error);
        await bot.sendMessage(chat_id, 'Error processing warning.');
    } finally {
        await pg.end();
    }
}

const removeWarn = async function(bot,connString,msg) {
    const chat_id = msg.chat.id;
    const user_id = msg.reply_to_message.from.id;
    const pg = new postgres(connString)

    try {
        await pg.connect();

        const result = await pg.query(`
            UPDATE user_warnings 
            SET warn_count = GREATEST(warn_count - 1, 0)
            WHERE chat_id = $1 AND user_id = $2
            RETURNING warn_count
        `, [chat_id, user_id]);

        if (result.rows.length > 0) {
            const newWarnCount = result.rows[0].warn_count;
            await bot.sendMessage(chat_id, `Warning removed. User now has ${newWarnCount}/3 warnings.`);
        } else {
            await bot.sendMessage(chat_id, 'User has no warnings to remove.');
        }

    } catch (error) {
        console.error('Error in removeWarn:', error);
        await bot.sendMessage(chat_id, 'Error removing warning.');
    } finally {
        await pg.end();
    }
}

module.exports = {
    banUser, 
    unbanUser,
    warnUser,
    removeWarn
}