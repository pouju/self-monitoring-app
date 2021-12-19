import { Client, Pool } from "../deps.js";
import { config } from "../config/config.js";

let connectionPool;
let executeQuery;

/*
    Using normal client for superoak testing as there is some problems when using pooling with superaoks
    --> leaking async ops
    --> google tells that it's possible some problem in Deno

    Normal client is used also for Heroku
 */

if (Deno.env.get('HEROKU') === 'true' || Deno.env.get('TEST_ENVIRONMENT') === 'true') {

    console.log('USING ONE CLIENT FOR HEROKU OR TESTING')

    connectionPool = new Client(config.database);

    executeQuery = async(query, ...args) => {
        const response = {};
        const client = connectionPool;
        try {
            await client.connect();
            const result = await client.queryObject(query, ...args);
            if (result && result.rows) {
              response.rows = result.rows;
            }
        } catch (e) {
            response.error = e;
            response.rows = [];
            console.log(e);
        } finally {
          try {
            await client.end();
          } catch (e) {
            console.log(e);
          }
        }
        return response;
    }
}

//In production we are using connection pooling

else {

    console.log('USING CONNECTION POOLING FOR PRODUCTION')

    connectionPool = new Pool(config.database, config.CONCURRENT_CONNECTIONS);

    executeQuery = async(query, ...args) => {
        const response = {};
        let client;
        try {
            client = await connectionPool.connect();
            const result = await client.queryObject(query, ...args);
            if (result && result.rows) {
              response.rows = result.rows;
            }
        } catch (e) {
            response.error = e;
            response.rows = [];
            console.log(e);
        } finally {
          try {
            await client.release();
          } catch (e) {
            console.log(e);
          }
        }
        return response;
    }
}

export { executeQuery };
