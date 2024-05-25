require('dotenv').config()
const postgres = require('pg').Client;
var CryptoJs = require('crypto-js');

//To convert the old database which had unencrypted text to encrypted text

const connString = {
    database : process.env.database,
    user : process.env.user,
    password : process.env.password,
    host : process.env.host,
    port : process.env.port
  }
key = process.env.key

const notes_table = process.env.notes_table

const pg = new postgres(connString)

pg.connect()
    .then(() => {
        return pg.query(`select * from ${notes_table} where type = 'txt' and notename <> 'text'`)
    })
    .then((result) => {
        for(i=0; i<result.rows.length;i++) {
            chatId = result.rows[i].chat_id
            notename = result.rows[i].notename
            data = result.rows[i].data
            encryptedData = CryptoJs.AES.encrypt(data,notename.concat(chatId).concat(key))
            queryString = `update ${notes_table} set data = '${encryptedData}' where chat_id = '${chatId}' and notename = '${notename}'`
            console.log(queryString)
            pg.query(queryString)
        }
    })
console.log("Done!")