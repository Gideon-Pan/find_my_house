const pool = require('../../server/models/db/mysql')
const { sleep } = require('./sleep')

async function deleteTable(tableName, bulkNum) {
  const q =
    `DELETE FROM ${tableName}
  ORDER BY id
  LIMIT ${bulkNum}`
  let affectedRows = 1
  let counter = 0
  while (affectedRows) {
    const [result] = await pool.query(q)
    affectedRows = result.affectedRows
    counter += affectedRows
    console.log(`finish delete ${counter} ${tableName}s`)
    await sleep(2)
  }
  console.log('finish')
}

deleteTable(process.argv[2], process.argv[3])
