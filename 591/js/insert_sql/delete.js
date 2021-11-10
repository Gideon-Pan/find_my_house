const pool = require('../../../server/models/db/mysql')

async function main() {
  const [result] = await pool.query('SELECT COUNT(*) AS count FROM station_house_distance')
  // console.log(count)
  const dataAmount = result[0].count
  // for (let i = 0; i < )
}

main()