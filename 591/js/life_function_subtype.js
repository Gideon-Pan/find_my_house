const { getMongo, getMongoOne } = require('../../server/models/db/mongo')
const pool = require('../../server/models/db/mysql')
const { makeTypeToIdMap } = require('./map')

async function main() {
  // const typeMap = {}
  const typeToIdMap = await makeTypeToIdMap()
  const subtypeMap = {}
  let houses = await getMongo('591_data', 'cleansedHouseDataNew')
  // houses = [houses]
  houses.forEach((house) => {
    house.lifeFunction.forEach((type) => {
      // const type = type.name
      // typeMap[type.name] = type.name
      type.children.forEach((subtype) => {
        subtypeMap[subtype.name] = {
          name: subtype.name,
          typeId: typeToIdMap[type.name]
        }

        // const subtype = subtype.name
        // subtype.children.forEach(({name, lat, lng, distance}) => {

        // })
      })
    })
  })
  // console.log(typeMap)
  // console.log(subtypeMap)
  // return
  // console.log(lifeFunctionMap)
  // const values = Object.values(typeMap).map(type => [type])
  // console.log(types)
  // return
  const q = 'INSERT INTO life_function_subtype (name, type_id) VALUES ?'
  const values = Object.values(subtypeMap).map((subtype) => [
    subtype.name,
    subtype.typeId
  ])
  console.log(values)
  // await pool.query(q, [values])
  console.log('finish inserting types')
}

main()
