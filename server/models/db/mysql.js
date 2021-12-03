const mysql = require('mysql2')
const { getMongoData } = require('./mongo')
require('dotenv').config()

const pool = mysql.createPool({
  connectionLimit: 100,
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: 'renting'
})

pool.getConnection(function (err, connection) {
  if (err) throw err // not connected!
  console.log('mysql connected...')
})

const poolPromisified = pool.promise()

module.exports = poolPromisified
