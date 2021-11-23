require('dotenv').config()
// const House = require('../models/house_model')
const Redis = require('../../util/redis')
const db = require('../models/db/mysql')
const {
  makeGraphs,
  makeWaitingTimeMap
} = require('../../util/dijkstra/make_graph')
const { Vertex, Edge } = require('../../util/dijkstra/graph')
const { getShortestPath } = require('../../util/dijkstra/shortest_path')

const {
  makeHouseMap,
  makeTagMap,
  makeTypeMap
} = require('../models/house_model')
const { getHouseInConstraint, getHousesInConstraint } = require('../service/house_service')

// const {graphs, walkVelocity} = require('../../util/init')
let tagMap
let waitingTimeMaps
const walkVelocity = 1.25 / 1.414
let graphs
async function main() {
  const time0_0 = Date.now()
  graphs = await makeGraphs(2)
  console.log('finish making graph step 0')
  const time0_1 = Date.now()
  console.log(
    'finish making graph:',
    Math.floor(time0_1 - time0_0) / 1000,
    'seconds'
  )

  waitingTimeMaps = await makeWaitingTimeMap(2)
  tagMap = await makeTagMap()
  await makeTypeMap()
  if (Redis.client.connected) {
    // console.log('interesting')
    await makeHouseMap()
  }
}

main()

function makeOfficeToNearbyStopEdges(
  g,
  startPoint,
  period,
  distToStopMap,
  maxWalkDistance
) {
  let counter = 0
  // const officeLat = office.lat()
  // const officeLng = office.lng()
  for (let id of g.getAllIds()) {
    const lat = g.getVertex(id).lat()
    const lng = g.getVertex(id).lng()
    if (!lat || !lng) continue
    const distToStation = getDistance(
      { latitude: lat, longitude: lng },
      { latitude: startPoint.lat(), longitude: startPoint.lng() }
    )

    if (distToStation < maxWalkDistance) {
      const edge = new Edge(
        '-2',
        id,
        period,
        // distToStation / walkVelocity + waitingTime
        distToStation / walkVelocity
      )
      g.addEdge(edge)
      distToStopMap[id] = distToStation
      counter++
    }
  }

  const nearByStationCount = counter - 1

  // can't get to any station but itself
  const timerNearby = Date.now()
  // console.log((timerNearby - start) / 1000, 'seconds for get nearby station')
  console.log('nearByStationCount: ', nearByStationCount)
  return counter
}

const search = async (req, res) => {
  console.log('hihi')
  let {
    commuteTime,
    officeLat,
    officeLng,
    maxWalkDistance,
    period,
    commuteWay,
    budget,
    houseType,
    fire,
    shortRent,
    directRent,
    pet,
    newItem,
    latitudeNW,
    longitudeNW,
    latitudeSE,
    longitudeSE
  } = req.query
  // console.log(req.query)
  // console.log(budget)
  const tags = []
  if (fire === 'true') tags.push(tagMap['fire'])
  // if (fire === 'true') console.log(fire)
  if (shortRent === 'true') tags.push(tagMap['shortRent'])
  if (directRent === 'true') tags.push(tagMap['directRent'])
  if (pet === 'true') tags.push(tagMap['pet'])
  if (newItem === 'true') tags.push(tagMap['newItem'])
  // console.log(graphs)
  const g = graphs[commuteWay][period]

  const start = Date.now()
  console.log('receive')

  officeLat = Number(officeLat)
  officeLng = Number(officeLng)
  maxWalkDistance = Number(maxWalkDistance)
  const office = new Vertex('-2', 'startPoint', officeLat, officeLng)

  g.addVertex(office)

  if (maxWalkDistance > commuteTime * walkVelocity) {
    maxWalkDistance = commuteTime * walkVelocity
  }

  // const idMap = {}

  const distToStopMap = {}

  const nearByStationCount = makeOfficeToNearbyStopEdges(
    g,
    office,
    period,
    distToStopMap,
    maxWalkDistance
  )

  // can't get to any station but itself
  if (nearByStationCount === 0) {
    const positionData = [
      {
        stopId: '-2',
        lat: officeLat,
        lng: officeLng,
        distanceLeft: maxWalkDistance
      }
    ]
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
      houses,
      stopRadiusMap
    )
    // const houseData = getHousesInBound(houses, Number(latitudeNW), Number(latitudeSE), Number(longitudeNW), Number(longitudeSE))
    // const end = Date.now()
    // console.log('It totally takes', (end - start) / 1000, 'seconds')
    // console.log('...')
    console.log('respond')
    return res.send({
      positionData,
      houseData,
      totalHouse: houseData.length
    })
  }
  // const counter = {}
  const timer0 = Date.now()
  const waitingTimeMap = waitingTimeMaps[period]
  const reachableStations = getShortestPath(
    g,
    '-2',
    commuteTime,
    period,
    waitingTimeMap
  )
  const timer1 = Date.now()
  console.log((timer1 - timer0) / 1000, 'seconds for Dijkstra')
  const reachableStationMap = {}
  console.log('reachable stops count:', reachableStations.length)

  reachableStations.forEach((reachableStation) => {
    const { id, startStationId, timeSpent, walkDistance } = reachableStation

    let distanceLeft = (commuteTime - timeSpent) * walkVelocity - walkDistance

    distanceLeft =
      distanceLeft + distToStopMap[startStationId] > maxWalkDistance
        ? maxWalkDistance - distToStopMap[startStationId]
        : distanceLeft
    if (distanceLeft < 0) {
      // console.log('fuck')
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

  const positionData = Object.values(reachableStationMap)
  const stopRadiusMap = {}
  positionData.forEach(({ stopId, distanceLeft }) => {
    stopRadiusMap[stopId] = distanceLeft
  })
  const time1 = Date.now()
  // console.log((time1 - start) / 1000, '!!!')
  // let houses = await getHousesInBudget(budget, houseType, tags)
  let houses = await getHousesInConstraint(budget, houseType, tags)
  const time2 = Date.now()
  console.log(
    (time2 - time1) / 1000,
    'seconds to get house in house constraint'
  )
  if (houses.length !== 0) {
    houses = await getHousesInRange(positionData, houses, stopRadiusMap)
  }
  const houseData = getHousesInBound(
    houses,
    Number(latitudeNW),
    Number(latitudeSE),
    Number(longitudeNW),
    Number(longitudeSE)
  )
  // console.log(houseData.length)
  // return res.send()

  const time3 = Date.now()
  console.log((time3 - time2) / 1000, 'seconds to filter house in range')

  // console.log(positionData)
  // console.log(respondData.length)
  const end = Date.now()
  console.log('It totally takes', (end - start) / 1000, 'seconds')
  console.log('respond')
  // console.log(houseData)
  return res.send({
    positionData,
    houseData,
    totalHouse: houses.length
  })
}

async function getHousesInBudget(budget, houseType, validTags) {
  let typeMap
  if (Redis.client.connected && await Redis.get('houseTypeMap')) {
    // console.log('hi5151581')
    typeMapJSON = await Redis.get('houseTypeMap')
    if (typeMapJSON) {
      typeMap = JSON.parse(typeMapJSON)
    } else {
      typeMap = await makeTypeMap()
      console.log(typeMap, '#')
    }
  } else {
    typeMap = await makeTypeMap()
    console.log(typeMap, '#')
  }

  let tagMap
  if (Redis.client.connected && await Redis.get('tagMap')) {
    // console.log('111111111111111')
    tagMap = JSON.parse(await Redis.get('tagMap'))
  } else {
    // console.log('222222222222222')
    tagMap = await makeTagMap()
  }

  console.log(typeMap)
  const houseTypeId = typeMap[houseType]
  // console.log(houseType)
  // console.log(typeMap)
  // console.log(houseTypeId)

  if (Redis.client.connected) {
    const houseMapString = await Redis.get('houseMap')
    if (houseMapString) {
      // console.log(houseMapString)
      console.log('caching house map~~~~~')
      const houseMapCache = JSON.parse(houseMapString)
      console.log(Object.keys(houseMapCache).length, 'length of houseMap')
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

  // console.log(db)
  const [result] = await db.query(q, [validTags])
  console.log(result.length)

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
  const houses = Object.values(houseMap).filter((house) => {
    // console.log(house.counter)
    // console.log(validTags.length)
    // console.log('~~~')
    // console.log(house.counter)
    // console.log(validTags.length)
    // console.log(house.category)
    return house.counter === validTags.length
  })
  console.log('QQQQQ no cache')
  console.log(houses.length, 'houses satisfy tag filters')
  const timet2 = Date.now()
  if (Redis.client.connected) {
    await makeHouseMap()
  }
  // console.log((timet2 - timet1) / 1000, 'seconds for filtering tags')
  return houses
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
  return houses
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

async function getHousesInRange(positionData, houses, stopRadiusMap) {
  console.log('reachable stops count', positionData.length)
  if (Redis.client.connected && false) {
    console.log('~~~~~~~~~~~~~~~')
    // const houseIdToNumMapJSON = await Redis.get('houseIdToNumMap')
    // const houseStopDistanceMapJSON = await Redis.get('houseStopDistanceMap')
    if (houseIdToNumMapJSON && houseStopDistanceMapJSON) {
      // console.log('@@@@@')
      // console.log('jfoiw')

      let counter = 0
      // console.log('~~~~~~~~~~')
      const houseData = houses.filter((house) => {
        const { latitude, longitude } = house
        const houseNum = houseIdToNumMap[house.id]
        // console.log(houseNum)
        // if (!houseStopDistanceMap[houseNum]) {
        //   const position = positionData[0]
        //   if (getDistance({latitude, longitude}, {latitude: position.lat, longitude: position.lng}) < position.distanceLeft) {
        //     return true
        //   }
        //   return false
        // }
        // console.log(houseNum, 'dfsd')
        if (houseStopDistanceMap[houseNum]) {
          for (let i = 0; i < houseStopDistanceMap[houseNum].length; i++) {
            const stopId = houseStopDistanceMap[houseNum][i][0]
            const radius = stopRadiusMap[stopId]
            const distance = houseStopDistanceMap[houseNum][i][1]
            counter++
            if (distance < radius) {
              return true
            }
          }
        }
        const position = positionData[0]
        // console.log(position)
        if (
          getDistance(
            { latitude, longitude },
            { latitude: position.lat, longitude: position.lng }
          ) < position.distanceLeft
        ) {
          // console.log(getDistance({latitude, longitude}, {latitude: position.lat, longitude: position.lng}))
          return true
        }
        return false
      })
      // console.log(houseData)
      console.log(`computing ${counter} times`)
      // console.log(houseData)
      return houseData
    }
  }

  // console.log(houses.length, 'houses')
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
      // if (houseStopDistanceMap[house.id] && houseStopDistanceMap[house.id][positionData[i].stopId] < radius) {
      //   // console.log(house.id)
      //   // console.log(positionData[i].stopId)
      //   // console.log('houseStopDistanceMap[house.id][positionData[i].stopId]: ', houseStopDistanceMap[house.id][positionData[i].stopId]);
      //   // console.log('radius: ', radius);
      //   // console.log('~~~')
      //   return true
      // }
    }
    // console.log('waht')
    return false
  })
  // console.log('hahahahh')
  console.log(`computing ${counter} times`)
  return houseData
  // const stopMap = {}
  // const stopData = []
  // for (let stop of positionData) {
  //   if (!stationMap[stopStationMap[stop.id]]) {
  //     stationMap[stopStationMap[stop.id]] = true
  //     stationData.push(stopStationMap[stop.id])
  //   }
  // }
  // const stationMap = {}
  // for (let house of houses) {
  //   const houseNum = houseIdToNumMap[house.id]
  //   if (houseStationDistanceMap[houseNum]) {
  //     for (let i = 0; i < houseStationDistanceMap[houseNum].length; i++) {
  //       const stopId = houseStationDistanceMap[houseNum][i][0]
  //       const stopId =
  //       const distance = houseStationDistanceMap[houseNum][i][1]
  //       const radius =

  //       const stopId = houseStopDistanceMap[houseNum][i][0]
  //       const radius = stopRadiusMap[stopId]
  //       const distance = houseStopDistanceMap[houseNum][i][1]
  //       counter++
  //       if (distance < radius) {
  //         return true
  //       }
  //     }
  //   }
  // }

  // const q = `SELECT * FROM house
  // WHERE latitude IS NOT NULL
  //   AND longitude IS NOT NULL
  // `
  // // // console.log(db)
  // const [result] = await db.query(q)
  // // console.log(positionData)

  // const houseData = result.filter(house => {
  //   // console.log(house.category)
  //   const {latitude, longitude} = house
  //   // const houseIdToNumMap = await makeHou
  //   // const houseNum = houseIdToNumMap.get(house.id)
  //   if (!houseStopDistanceMap[houseNum]) {
  //     const position = positionData[0]
  //     // console.log(position)
  //     if (getDistance({latitude, longitude}, {latitude: position.lat, longitude: position.lng}) < position.distanceLeft) {
  //       // console.log(getDistance({latitude, longitude}, {latitude: position.lat, longitude: position.lng}))
  //       return true
  //     }
  //     return false
  //   }
  //   // console.log(positionData.length)
  //   for (let i = 0; i < positionData.length; i++) {
  //     // console.log(positionData.length)
  //     const position = positionData[i]
  //     const radius = position.distanceLeft
  //     counter++
  //     const stopNum = stopIdToNumMap.get(position.stopId)
  //     // console.log(stopNum)
  //     // console.log(houseStopDistanceMap[houseNum])
  //     if (houseStopDistanceMap[houseNum][stopNum] < radius) {

  //       return true
  //     }
  //     if (positionData[i].stopId === '-2' && getDistance({latitude, longitude}, {latitude: position.lat, longitude: position.lng}) < radius) {
  //       return true
  //     }
  //     // console.log('distance:', houseStopDistanceMap[houseNum][stopNum])
  //     // console.log('radius:', radius)
  //   }
  //   return false
  // })
  // return houseData
}

function getDistance(position1, position2) {
  return Math.sqrt(
    (position1.latitude - position2.latitude) *
      (position1.latitude - position2.latitude) *
      111319.5 *
      111319.5 +
      (position1.longitude - position2.longitude) *
        (position1.longitude - position2.longitude) *
        100848.6 *
        100848.6
  )
}

function getDistanceSquare(position1, position2) {
  return (
    (position1.latitude - position2.latitude) *
      (position1.latitude - position2.latitude) *
      111319.5 *
      111319.5 +
    (position1.longitude - position2.longitude) *
      (position1.longitude - position2.longitude) *
      100848.6 *
      100848.6
  )
}

module.exports = {
  search
}
