const { getMongo, getMongoOne } = require("../../server/models/db/mongo")
const pool = require('../../server/models/db/mysql')
const { makeSubypeToIdMap, makeLifeFunctionMap, makeCategoryToIdMap, makeTagMap, makeFacilityMap } = require("./map")

async function main() {
  const houses = await getMongo('591_data', 'cleansedHouseDataNew')
  const lifeFunctionMap = await makeLifeFunctionMap()
  const tagMap = await makeTagMap()
  const categoryMap = await makeCategoryToIdMap()
  const facilityMap = await makeFacilityMap()
  // console.log(houses)
  // houses = [houses]
  // const subtypeToIdMap = await makeSubypeToIdMap()
  // console.log(subtypeToIdMap)
  // return 
  const houseMap = {}
  houses.forEach(house => {
    const {title, latitude, longitude, id} = house
      houseMap[`${title}-${latitude}-${longitude}`] = house
  })

  const values = []

  Object.values(houseMap).forEach(house => {
    house.lifeFunction.forEach(type => {
      // const type = type.name
      type.children.forEach(subtype => {
        // const subtype = subtype.name
        subtype.children.forEach(({name, lat, lng, distance}) => {
          // console.log(lifeFunctionMap[`${name}-${lat}-${lng}`])
          if (!lifeFunctionMap[`${name}-${Number(lat)}-${Number(lng)}`]) {
            console.log(name)
            console.log(Number(lat))
            console.log(Number(lng))
            if (name === '三重社區大學') console.log(`${name}-${Number(lat)}-${Number(lng)}`)
          } 
          values.push([house.id, lifeFunctionMap[`${name}-${Number(lat)}-${Number(lng)}`], distance])
          // console.log(distance)
          // if 
          // lifeFunctionMap[`${name}-${lat}-${lng}`] = [name, lat, lng, subtypeToIdMap[subtype.name]]
        })
      })
    })
  })

  const q = 'INSERT INTO house_life_function (house_id, life_function_id, distance) VALUES ?'
  // const values = Object.values(lifeFunctionMap)
  // console.log(values)
  console.log(values.length)
  const bulkNum = 10000
  const insertTimes = Math.floor(values.length / bulkNum) + 1
  for (let i = 0; i < insertTimes; i++) {
    // if (i!== insertTimes - 1) continue
    if (i === insertTimes - 1) {
      // console.log(values.slice(i * bulkNum, values.length - 1))
      values.slice(i * bulkNum, values.length - 1).forEach((value) => {
        if (!value[0]) console.log(value)
      })
      await pool.query(q, [values.slice(i * bulkNum, values.length - 1)])
      console.log(`finish inserting house life function ${i * bulkNum} to ${values.length - 1}`)
      break
    }
    await pool.query(q, [values.slice(i * bulkNum, (i + 1) * bulkNum)])
    console.log(`finish inserting house life function ${i * bulkNum} to ${(i + 1) * bulkNum}`)
  }
  // await pool.query(q, [values])
  console.log('finish inserting house life functions')
}

