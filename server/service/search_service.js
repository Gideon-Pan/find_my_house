const Redis = require('../../util/redis')
const pool = require('../models/db/mysql')
const {
  makeTypeMap,
  makeTagMap,
  makeHouseMap
} = require('../models/house_model')
const { getDistanceSquare } = require('../../util/distance')

async function getHousesInConstraintWithRedis(budget, validTags, houseTypeId) {
  if (Redis.client.connected && (await Redis.get('houseMap'))) {
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
  if (Redis.client.connected && (await Redis.get('typeMap'))) {
    typeMap = JSON.parse(Redis.get('typeMap'))
  } else {
    typeMap = await makeTypeMap()
  }
  const houseTypeId = typeMap[houseType]

  let houses = await getHousesInConstraintWithRedis(
    budget,
    validTags,
    houseTypeId
  )
  if (houses) {
    return houses
  }

  let tagMap
  if (Redis.client.connected && (await Redis.get('tagMap'))) {
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
    await makeHouseMap()
  }
  // console.log((timet2 - timet1) / 1000, 'seconds for filtering tags')
  return houses
}

async function getHousesInRange(positionData, houses) {
  console.log('reachable stops count', positionData.length)
  let counter = 0
  const houseData = houses.filter((house) => {
    const { latitude, longitude } = house
    for (let i = 0; i < positionData.length; i++) {
      const position = positionData[i]
      const radius = position.distanceLeft
      counter++
      if (
        getDistanceSquare(
          { latitude, longitude },
          { latitude: position.lat, longitude: position.lng }
        ) <
        radius * radius
      ) {
        return true
      }
    }
    return false
  })
  // console.log('hahahahh')
  console.log(`computing ${counter} times for get house in range`)
  return houseData
}

function getHousesInBound(
  houses,
  latitudeNW,
  latitudeSE,
  longitudeNW,
  longitudeSE
) {
  if (houses.length <= 1000) {
    return houses
  }
  console.log('latitudeNW: ', latitudeNW)
  console.log(' latitudeSE: ', latitudeSE)
  console.log('longitudeNW: ', longitudeNW)
  console.log('longitudeSE: ', longitudeSE)
  const houseInBound = houses.filter((house, i) => {
    console.log(housePositionMap)
    if (!housePositionMap[house.id]) {
      return
    }
    const houseLat = housePositionMap[house.id].latitude

    const houseLon = housePositionMap[house.id].longitude
    if (i === 0) {
      console.log('houseLat: ', houseLat)
      console.log('houseLon: ', houseLon)
    }

    if (
      houseLat < latitudeNW &&
      houseLat > latitudeSE &&
      houseLon > longitudeSE &&
      houseLon < longitudeNW
    ) {
      return true
    }
    return false
  })
  return houseInBound
}

async function getHouseData(positionData, budget, houseType, tags) {
  const stopRadiusMap = {}
  positionData.forEach(({ stopId, distanceLeft }) => {
    stopRadiusMap[stopId] = distanceLeft
  })
  // let houses = await getHousesInBudget(budget, houseType, tags)
  // console.log('~~~~~~~~~~~~~~~~~~`')
  let houses = await getHousesInConstraint(budget, houseType, tags)
  console.log(houses.length)
  const houseData = await getHousesInRange(
    positionData,
    houses
    // stopRadiusMap
  )
  return houseData
}

function getPositionData(
  reachableStations,
  commuteTime,
  maxWalkDistance,
  walkVelocity,
  distToStopMap,
  g
) {
  const reachableStationMap = {}
  reachableStations.forEach((reachableStation) => {
    const { id, startStationId, timeSpent, walkDistance } = reachableStation
    let distanceLeft = (commuteTime - timeSpent) * walkVelocity - walkDistance
    distanceLeft =
      distanceLeft + distToStopMap[startStationId] > maxWalkDistance
        ? maxWalkDistance - distToStopMap[startStationId]
        : distanceLeft
    if (distanceLeft < 0) {
      // return console.log(req.query)
      return
    }
    // office point
    if (id == '-2') distanceLeft = maxWalkDistance
    // if (distanceLeft > 390) console.log(distanceLeft)
    const lat = g.getVertex(id).lat()
    const lng = g.getVertex(id).lng()
    if (
      reachableStationMap[`${lat}-${lng}`] &&
      distanceLeft < reachableStationMap[`${lat}-${lng}`].distanceLeft
    ) {
      return
    }
    reachableStationMap[`${lat}-${lng}`] = {
      stopId: id,
      lat: g.getVertex(id).lat(),
      lng: g.getVertex(id).lng(),
      distanceLeft
    }
  })
  return Object.values(reachableStationMap)
}

module.exports = {
  getPositionData,
  getHousesInConstraint,
  getHousesInRange,
  getHouseData
}
