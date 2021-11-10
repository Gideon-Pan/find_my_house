const pool = require('../../../server/models/db/mysql')

async function test() {
  const [result] = await pool.query('SELECT id FROM house')
        const sqlIdMap = {}
        result.forEach(({id}) => sqlIdMap[id] = true)
        console.log(sqlIdMap)
}

async function array() {
  const arr = [1, 2, 3]
  const [num1] = arr
  console.log(num1)
}

async function bulkUpdate() {
  // const [result] = await pool.query('SELECT * FROM station_house_distance order by id limit 1')
  // // const data = result
  // console.log(result)
  // return
  const values = [[20331, 11551456, 610]]
  // [
  //   { id: 2843364, station_id: 20331, house_id: 11551456, distance: 615 }
  // ]
  const q = `INSERT into station_house_distance (station_id, house_id, distance) VALUES ?
    ON DUPLICATE KEY UPDATE distance = VALUES(distance)`
  // ON DUPLICATE KEY UPDATE distance = values(distance)
  await pool.query(q, [values])
  let str = ''
  values.forEach(([latitude, longitude, distance]) => {
    str += `(${latitude}, ${longitude}, ${distance}),`
  })
  str = str.substring(0, str.length - 1)
  console.log(str)
  
  // const q2 = `INSERT INTO station_house_distance (station_id, house_id, distance) VALUES ${str}
  //   ON DUPLICATE KEY UPDATE distance = values(distance)`
  // console.log(q2)
  // await pool.query(q2)
  console.log('finsish')
}

bulkUpdate()
// array()
// test()