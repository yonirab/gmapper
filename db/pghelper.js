const  { Pool } = require('pg').native,
    config = require('./config'),
    winston = require('winston'),
    databaseURL = config.databaseURL;

// pgClientPoolSize: The max number of clients in our pool 
const pgClientPoolSize = process.env.PGCLIENT_POOL_SIZE || 10;

// pgClientConnectionTimeout: How long to wait when connecting a client before giving up
const pgClientConnectionTimeout = process.env.PGCLIENT_CONNECTION_TIMEOUT || 10000;

// A pool of pg clients
const pool = new Pool ({
     connectionString : databaseURL,
     connectionTimeoutMillis : pgClientConnectionTimeout,
     max : pgClientPoolSize,
});


/**
 * Utility function to execute a SQL query against a Postgres database
 * @param sql - SQL query
 * @param values - params passed to SQL query
 * @param singleItem - If true, only return result.rows[0] instead of result.rows
 * @param logQuery - If true log the query
 * @returns {promise|*}
 */ 
const query = async (sql, values, singleItem, logQuery=false) => {
    
    if (logQuery) {
        winston.info(`${sql} [${values || ""}]`);
    }

    try {
        // Perform the query, using a client from the pool.
        let result = await pool.query(sql,values);
        
        // Return result of query in requested format
        return singleItem ? result.rows[0] : result.rows;
        
    } catch (err) {
        // Postgres Error codes definitions: https://www.postgresql.org/docs/10/static/errcodes-appendix.html
        winston.error(`${err.severity} ${err.code} executing query ${sql} [${values}]: ${err.stack}`);
        // Rethrow the error for further handling
        err.name='DatabaseQueryError';
        throw (err);
    }
 
};


module.exports = {
    query,
};