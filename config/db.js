const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.HEROKU_POSTGRESQL_ROSE_URL,
    ssl: true,
});

// a generic query, that executes all queries you send to it
function query(text) {
    return new Promise((resolve, reject) => {
        pool
            .query(text)
            .then((res) => {
                resolve(res);
            })
            .catch((err) => {
                reject(err);
            });
    });
}

module.exports = {
    query
};