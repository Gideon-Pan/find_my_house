const { getHouseIds } = require('../../../server/models/db/mongo')
const pool = require('../../../server/models/db/mysql')
const { today, yesterday } = require('../time')

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


async function getHouseIdsToDelete(cleansedDataOld, cleansedDataNew) {
  // const oldIds = await getMongo('591_cleansed', cleansedDataOld)
  const oldIds = await getHouseIds('591_cleansed', cleansedDataOld)
  console.log(oldIds)
  console.log('fetch old data')
  // const newIds = await getMongo('591_cleansed', cleansedDataNew)
  const newIds = await getHouseIds('591_cleansed', cleansedDataNew)
  console.log(newIds)
  console.log('fetch new data')
  const oldHouseIdMap = {}
  const newHouseIdMap = {}
  const houseMap = {}
  const houseIdsToDelete = []
  const houseIdsToInsert = []

  // oldIds.forEach(({ id }) => {
  //   oldHouseIdMap[id] = true
  // })
  newIds.forEach((house) => {
    newHouseIdMap[house.id] = true
    // houseMap[house.id] = house
  })
  // console.log(oldHouseIdMap)
  // console.log(newHouseIdMap)
  oldIds.forEach(({ id }) => {
    if (!newHouseIdMap[id]) {
      houseIdsToDelete.push(id)
    }
  })
  // console.log(houseIdsToDelete)
  console.log(houseIdsToDelete.length)
  return houseIdsToDelete
}
// getHouseIdsToDelete(`${yesterday}houseDatacleansed`, `${today}houseDatacleansed`)
// bulkUpdate()
// array()
// test()
