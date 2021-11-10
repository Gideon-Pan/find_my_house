const { getMongo, getMongoOne } = require("../../server/models/db/mongo")
const pool = require('../../server/models/db/mysql')
const { makeCategoryToIdMap } = require("./map")

async function insertHouse() {
  const houseMap = {}
  const map = {}
  const categoryMap = await makeCategoryToIdMap()
  const houses = await getMongo('591_data', 'cleansedHouseDataNew')
  console.log(houses.length)
  houses.forEach(house => {
    const {title, latitude, longitude, id} = house
    // house.facilities.forEach(house => {
      
      // if (houseMap[`${title}-${latitude}-${longitude}`]) {
      //   console.log(houseMap[`${title}-${latitude}-${longitude}`].id)
      //   console.log(house.id)
      //   console.log(houseMap[`${title}-${latitude}-${longitude}`].image)
      //   console.log(house.image)
      //   console.log('qq')
      // }
      // if (map[id]) {
      //   console.log(map[`${title}-${latitude}-${longitude}`].id)
      //   console.log(house.id)
      //   console.log('qq')
      // }
      houseMap[`${title}-${latitude}-${longitude}`] = house
      // map[id] = house
    // })
  })
  // console.log(houseMap)
  const houseData = Object.values(houseMap).map(({id, title, area, category, price, layout, floor, shape, link, image, address, latitude, longitude, region, section}) => {
    area = area.replace('坪', '')
    return [id, title, categoryMap[category], area, price, layout, floor, shape, link, image, address, latitude, longitude, region, section]
  })
  // console.log(values.length)
  // console.log(Object.keys(map).length)
  // console.log(houseMap)
  // console.log(values)
  // return
  const q = 'INSERT INTO house (id, title, category_id, area, price, layout, floor, shape, link, image, address, latitude, longitude, region, section) VALUES ?'
  // const values = Object.values(houseMap).map(house => [house])
  // console.log(values)
  let values = []
  const bulkNum = 1000
  const insertTimes = Math.floor(houseData.length / bulkNum) + 1
  for (let i = 0; i < insertTimes; i++) {
    if (i === insertTimes - 1) {
      await pool.query(q, [houseData.slice(i * bulkNum, houseData.length - 1)])
      console.log(`finish inserting house ${i * bulkNum} to ${houseData.length - 1}`)
      break
    }
    await pool.query(q, [houseData.slice(i * bulkNum, (i + 1) * bulkNum)])
    console.log(`finish inserting house ${i * bulkNum} to ${(i + 1) * bulkNum}`)
  }
  
  console.log('finish inserting all houses')
}

module.exports = {
  insertHouse
}