const Redis = require('../../util/redis')
const { makeTypeMap, makeTagMap, makeHouseMap } = require('../models/house_model')
const pool = require('../models/db/mysql')

async function getHousesInConstraintWithRedis(budget, validTags, houseTypeId) {
  if (Redis.client.connected && await Redis.get('houseMap')) {
      // console.log(houseMapString)
      console.log('caching house map~~~~~')
      const houseMapCache = JSON.parse(await Redis.get('houseMap'))
      // console.log(Object.keys(houseMapCache).length, 'length of houseMap')
      let counter = 0
      const houses = Object.values(houseMapCache).filter((house) => {
        if (houseTypeId && houseTypeId !== house.categoryId) {
          return false
        }
        // console.log(house)
        if (house.price > budget) {
          return false
        }
        for (let tag of validTags) {
          counter++
          if (!house.tagIds.includes(tag)) {
            return false
          }
        }
        return true
      })
      console.log(counter, 'times for filtering tag')
      return houses
    
  }
}

async function getHousesInConstraint(budget, houseType, validTags) {
  // console.log('susususususuu')
  let typeMap
  // make type map
  if (Redis.client.connected && await Redis.get('typeMap')) {
    typeMap = JSON.parse(Redis.get('typeMap'))
  } else {
    typeMap = await makeTypeMap()
  }
  const houseTypeId = typeMap[houseType]

  let houses = await getHousesInConstraintWithRedis(budget, validTags, houseTypeId)
  if (houses) {
    return houses
  }

  let tagMap
  if (Redis.client.connected && await Redis.get('tagMap')) {
    // console.log('111111111111111')
    tagMap = JSON.parse(await Redis.get('tagMap'))
  } else {
    // console.log('222222222222222')
    tagMap = await makeTagMap()
  }

  const q = `SELECT house.id, title, price, area, link, image, house.address, house.latitude, house.longitude, category.name AS category, tag.id AS tag FROM house 
    JOIN category
      ON house.category_id = category.id
    JOIN house_tag
      ON house.id = house_tag.house_id
    JOIN tag
      ON tag.id = house_tag.tag_id
    WHERE price <= ${budget}
      ${validTags.length !== 0 ? 'AND tag.id IN  (?)' : ''}
      ${houseType ? `AND category.id = '${houseTypeId}'` : ''}
  `
  //     

  // console.log(db)
  const [result] = await pool.query(q, [validTags])
  // console.log(result.length)

  const houseMap = {}
  // const validTags =
  const timet1 = Date.now()
  result.forEach((house) => {
    // if (!validTags.includes(house.tag)) return
    // if (house.tag in )
    if (!houseMap[house.id]) {
      houseMap[house.id] = house
      houseMap[house.id].tags = []
      houseMap[house.id].counter = 0
    }
    // console.log(house.tag)
    houseMap[house.id].tags.push(house.tag)
    if (validTags.includes(house.tag)) {
      houseMap[house.id].counter++
    }
  })
  console.log(result.length, 'rows from sql')
  houses = Object.values(houseMap).filter((house) => {
    return house.counter === validTags.length
  })
  // console.log('QQQQQ no cache')
  console.log(houses.length, 'houses satisfy tag filters')
  const timet2 = Date.now()
  if (Redis.client.connected) {
    // await makeHouseMap()
  }
  // console.log((timet2 - timet1) / 1000, 'seconds for filtering tags')
  return houses
}

module.exports = {
  getHousesInConstraint
}