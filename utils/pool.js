const { Pool } = require("pg");
require('dotenv').config()

const pool = new Pool({
    host: process.env.host,
    user: process.env.user,
    password: process.env.password,
    database: process.env.database,
    port: process.env.port,
    application_name: process.env.appname,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000
    });

module.exports = pool