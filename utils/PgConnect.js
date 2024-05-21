const { postgres } = require('pg')
// const postgres = require('pg').Client;
require('dotenv').config()

const PgConnect = new postgres.client({
    database : process.env.database,
    user : process.env.user,
    password : process.env.password,
    host : process.env.host,
    port : process.env.port
});
PgConnect.connect()
module.exports = PgConnect

/* running a query :
    postgres.connect()
        .then(() => {
            console.log('Connected to the database');

            return postgres.query('SELECT * FROM savednotes');
        })
        .then((result) => {
            // Handle query result
            console.log('Query result:', result.rows);
        })
        .catch((error) => {
            // Handle errors
            console.error('Error executing query:', error);
        })
        .finally(() => {
            // Close the client
            postgres.end()
            .then(() => console.log('Disconnected from the database'))
            .catch((error) => console.error('Error disconnecting from the database:', error));
        });


*/