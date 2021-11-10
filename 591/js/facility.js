const { getMongo, getMongoOne } = require('../../server/models/db/mongo')
const pool = require('../../server/models/db/mysql')

async function main() {
  const facilityMap = {}
  const houses = await getMongo('591_data', 'cleansedHouseDataNew')
  houses.forEach((house) => {
    house.facilities.forEach((facility) => {
      // if (facility.includes('陽台')) facility = '陽台'
      facilityMap[facility] = facility
    })
  })
  // console.log(facilityMap)
  const q = 'INSERT INTO facility (name) VALUES ?'
  const values = Object.values(facilityMap).map((facility) => [facility])
  console.log(values)
  await pool.query(q, [values])
  console.log('finish inserting facilities')
}

main()
