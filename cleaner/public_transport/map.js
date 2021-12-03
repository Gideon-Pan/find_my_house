const db = require('../../server/models/db/mysql')

async function insertPeriod() {
  const q = 'INSERT INTO time_period (period) VALUES ?'
  const values = periods.map((period) => {
    return [period]
  })
  await db.query(q, [values])
  console.log('finish insert period')
}

async function makePeriodMap() {
  const periodMap = {}
  const q = `SELECT id, period FROM time_period
    WHERE period IS NOT NULL`
  const [result] = await db.query(q)
  result.forEach(({ id, period }) => {
    periodMap[period] = id
  })
  return periodMap
}

module.exports = {
  makePeriodMap
}
