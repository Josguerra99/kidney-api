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

async function getConnection() {
  const connection = await pool.promise().getConnection();
  return connection;
}

module.exports = { getConnection, pool };
