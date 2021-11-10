const { getMongo, getMongoOne } = require('../../server/models/db/mongo')
const pool = require('../../server/models/db/mysql')
const { makeSubypeToIdMap } = require('./map')

async function main() {
  const lifeFunctionMap = {}
  const houses = await getMongo('591_data', 'cleansedHouseDataNew')
  // console.log(houses)
  // houses = [houses]
  const subtypeToIdMap = await makeSubypeToIdMap()
  // console.log(subtypeToIdMap)
  // return
  houses.forEach((house) => {
    house.lifeFunction.forEach((type) => {
      // const type = type.name
      type.children.forEach((subtype) => {
        // const subtype = subtype.name
        subtype.children.forEach(({ name, lat, lng, distance }) => {
          lifeFunctionMap[`${name}-${lat}-${lng}`] = [
            name,
            lat,
            lng,
            subtypeToIdMap[subtype.name]
          ]
        })
      })
    })
  })
  // console.log(lifeFunctionMap)
  // return
  const q =
    'INSERT INTO life_function (name, latitude, longitude, subtype_id) VALUES ?'
  const values = Object.values(lifeFunctionMap)
  // console.log(values)
  await pool.query(q, [values])
  console.log('finish inserting lifeFunctions')
}

main()
