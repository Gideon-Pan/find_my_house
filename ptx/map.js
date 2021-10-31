const db = require('../model/db/mysql/mysql')

async function insertPeriod() {
  const q = 'INSERT INTO time_period (period) VALUES ?'
  const values = periods.map(period => {
    return [period]
  })
  // console.log(values)
  await db.query(q, [values])
  console.log('finish insert v2 period')
}

// insertPeriod()
async function makePeriodMap() {
  const periodMap = {}
  const q = `SELECT id, period FROM time_period
    WHERE period IS NOT NULL`
  const [result] = await db.query(q)
  result.forEach(({id, period}) => {
    periodMap[period] = id
  })
  console.log(periodMap)
  return periodMap
}

// makePeriodMap()

module.exports = {
  makePeriodMap
}