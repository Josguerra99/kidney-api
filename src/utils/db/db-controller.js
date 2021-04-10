const mysql = require("mysql2");
const path = require("path");

if (!process.env.NODE_ENV || process.env.NODE_ENV !== "production") {
  require("dotenv").config({ path: path.resolve(__dirname, "../../../.env") });
}

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  database: process.env.MYSQL_DB,
  password: process.env.MYSQL_PASS,
  port: process.env.MYSQL_PORT,
  connectionLimit: 20,
});

const pool2 = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  database: process.env.MYSQL_DB_2,
  password: process.env.MYSQL_PASS,
  port: process.env.MYSQL_PORT,
  connectionLimit: 2,
});

async function getConnection(id = 0) {
  const connection =
    id == 0
      ? await pool.promise().getConnection()
      : await pool2.promise().getConnection();

  return connection;
}

async function execute(callback, connectionId = 0) {
  return new Promise(async (resolve, reject) => {
    let connection = null;
    try {
      connection = await getConnection(connectionId);

      let result = await callback(connection);
      connection.release();
      resolve(result);
    } catch (error) {
      console.log(error);
      if (connection) connection.release();
      reject(error);
    }
  });
}

/**
 *
 * @param {executeCallback} callback
 * @returns {Promise}
 */
async function beginTransaction(callback, connectionId = 0) {
  return new Promise(async (resolve, reject) => {
    let connection = null;
    try {
      connection = await getConnection(connectionId);
      await connection.beginTransaction();
      let result = await callback(connection);
      await connection.commit();
      connection.release();
      resolve(result);
    } catch (error) {
      if (connection) {
        console.log(`rollback and release`);
        await connection.rollback();
        connection.release();
      }
      reject(error);
    }
  });
}
module.exports = { getConnection, pool, execute, beginTransaction };
