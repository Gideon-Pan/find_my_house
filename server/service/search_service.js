require('dotenv').config()
const Redis = require('../../util/redis')
const SearchModel = require('../models/search_model')
const { makeHouseMap } = require('../models/house_model')
const { getDistanceSquare } = require('../../util/distance')
const { getTypeMap, getTagMap } = require('./house_service')
const { isInBox } = require('../../util/util')
const { WALK_VELOCITY, START_POINT_ID } = process.env

async function getRequestTags(fire, shortRent, directRent, pet, newItem) {
  const tags = []
  const tagMap = await getTagMap()
  if (fire === 'true') tags.push(tagMap['fire'])
  if (shortRent === 'true') tags.push(tagMap['shortRent'])
  if (directRent === 'true') tags.push(tagMap['directRent'])
  if (pet === 'true') tags.push(tagMap['pet'])
  if (newItem === 'true') tags.push(tagMap['newItem'])
  return tags
}

async function getHousesInConstraintWithRedis(budget, validTags, houseTypeId) {
  if (Redis.client.connected && (await Redis.get('houseMap'))) {
    console.log('caching house map')
    const houseMapCache = JSON.parse(await Redis.get('houseMap'))
    let counter = 0
    const houses = Object.values(houseMapCache).filter((house) => {
      // console.log(house)
      if (houseTypeId && houseTypeId !== house.categoryId) {
        return false
      }
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
    console.log(`computing ${counter} times for filtering tag`)
    return houses
  }
}

async function getHousesInConstraint(budget, houseType, validTags) {
  const typeMap = await getTypeMap()
  const houseTypeId = typeMap[houseType]
  let houses = await getHousesInConstraintWithRedis(
    budget,
    validTags,
    houseTypeId
  )
  if (houses) {
    return houses
  }

  houses = await SearchModel.getHouseInConstraint(budget, validTags, houseTypeId)

  // get the houses which satisfy all tags
  const houseMap = {}
  houses.forEach(house => {
    if (!houseMap[house.id]) {
      houseMap[house.id] = house
      houseMap[house.id].tags = []
    }
    houseMap[house.id].tags.push(house.tag)
  })
  houses = Object.values(houseMap)
  houses.filter(house => {
    for (let tag of validTags) {
      if (!house.tags.includes(tag)) {
        return false
      }
    }
    return true
  })
  // cache house map
  if (Redis.client.connected) {
    makeHouseMap()
  }
  return houses
}

async function getReachableHouses(positionData, houses) {
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
  console.log(`computing ${counter} times for get house in range`)
  return houseData
}

function getHousesInBound(
  houses,
  latitudeTopLeft,
  latitudeBottomRight,
  longitudeTopLeft,
  longitudeBottomRight
) {
  if (houses.length <= 1000) {
    return houses
  }
  const housesInBound = houses.filter((house) => {
    if (!housePositionMap[house.id]) {
      return false
    }
    const houseLat = housePositionMap[house.id].latitude
    const houseLon = housePositionMap[house.id].longitude
    if (
      !isInBox(
        houseLat,
        houseLon,
        latitudeTopLeft,
        latitudeBottomRight,
        longitudeTopLeft,
        longitudeBottomRight
      )
    ) {
      return false
    }
    return true
  })
  return housesInBound
}

async function getHouseData(positionData, budget, houseType, tags) {
  const stopRadiusMap = {}
  positionData.forEach(({ stopId, distanceLeft }) => {
    stopRadiusMap[stopId] = distanceLeft
  })
  let houses = await getHousesInConstraint(budget, houseType, tags)
  const houseData = await getReachableHouses(
    positionData,
    houses
  )
  return houseData
}

function getPositionData(
  reachableStations,
  commuteTime,
  maxWalkDistance,
  distToStopMap,
  graph
) {
  const reachableStationMap = {}
  reachableStations.forEach((reachableStation) => {
    const { id, startStationId, timeSpent, walkDistance } = reachableStation
    let distanceLeft = (commuteTime - timeSpent) * WALK_VELOCITY - walkDistance
    distanceLeft =
      distanceLeft + distToStopMap[startStationId] > maxWalkDistance
        ? maxWalkDistance - distToStopMap[startStationId]
        : distanceLeft
    if (distanceLeft < 0) {
      return
    }
    // office point
    if (id == START_POINT_ID) distanceLeft = maxWalkDistance
    const lat = graph.getVertex(id).lat()
    const lng = graph.getVertex(id).lng()
    if (
      reachableStationMap[`${lat}-${lng}`] &&
      distanceLeft < reachableStationMap[`${lat}-${lng}`].distanceLeft
    ) {
      return
    }
    reachableStationMap[`${lat}-${lng}`] = {
      stopId: id,
      lat: graph.getVertex(id).lat(),
      lng: graph.getVertex(id).lng(),
      distanceLeft
    }
  })
  return Object.values(reachableStationMap)
}

module.exports = {
  getRequestTags,
  getPositionData,
  getHousesInConstraint,
  getHouseData
}