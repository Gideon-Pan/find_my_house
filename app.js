const express = require('express')
require('dotenv').config()
// const { getDistance } = require('geolib')
const {
  makeGraphs,
  makeWaitingTimeMap
} = require('./server/dijkstra/make_graph')
// const getShortestPathBus = require('./ptx_testing/bus/bus_sp')
// const { PQ } = require('./controller/priority_queue')
// const { metro } = require('./ptx_testing/metro_app')
const { Vertex, Edge } = require('./server/dijkstra/graph')
const { getShortestPath } = require('./server/dijkstra/shortest_path')
// const { Edge } = require('./graph')
// const { makeGraph } = require('./makeGraph')
const db = require('./server/models/db/mysql')
const Redis = require('./util/redis')
const {
  makeHouseStopDistanceMap,
  makeHouseMap,
  makeStopStationMap,
  // makeHouseStationDistanceMap
} = require('./server/models/house_model')
const { rateLimiter } = require('./util/util')
// console.log(makeGraph)
const { API_VERSION } = process.env
// console.log(API_VERSION)

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

const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(__dirname + '/public'))

// API routes
app.use('/api/' + API_VERSION, rateLimiter, [
  require('./server/routes/user_route'),
  require('./server/routes/house_route')
  // require('./server/routes/admin_route'),
  // require('./server/routes/product_route'),
  // require('./server/routes/marketing_route'),
  // require('./server/routes/user_route'),
  // require('./server/routes/order_route'),
])

// app.get('/house/life-function', async (req, res) => {
//   // console.log('qhhq')
//   // console.log(req.query)

// })

const walkVelocity = 1.25 / 1.414

// let graphsForBus
// let graphForMetro
// let graphForMix
let waitingTimeMaps
let graphs
// let stopIdToNumMap
// let numToStopIdMap
// let houseIdToNumMap
// let numToHouseIdMap
// let houseStopDistanceMap
// let houseStationDistanceMap
// let housePositionMap
// let stopStationMap
// let stationStopMap
// let houseMapCache
async function main() {
  // houseIdToNumMap = JSON.parse(houseIdToNumMapJSON)
      // console.log(houseIdToNumMap)
  // houseStopDistanceMap = JSON.parse(houseStopDistanceMapJSON)
  // stopStationMap = await makeStopStationMap()
  // console.log('Redis.client.connected: ', Redis.client.connected);
  // console.log(Redis.client)
  
  
  // const houseMapJSON = JSON.stringify(houseMap)
  

  // console.log(houseMapCache)
  // return
  const time0_0 = Date.now()
  // graphsForBus = await makeGraph('bus', 2)
  // graphsForMetro = await makeGraph('metro', 2)
  // graphsForMix = await makeGraph('mix', 2)
  graphs = await makeGraphs(2)
  console.log('finish making graph step 0')
  // waitingTimeMaps = await makeWaitingTimeMap(2)
  // waitingTimeMap = waitingTimeMaps[]
  const time0_1 = Date.now()
  console.log(
    'finish making graph:',
    Math.floor(time0_1 - time0_0) / 1000,
    'seconds'
  )

  if (Redis.client.connected) {
    console.log('interesting')
    await makeHouseMap()
  }

  // if (Redis.client.connected) {
  //   // const maps = await makeHouseStopDistanceMap()
  //   await makeHouseStopDistanceMap()
  // }

  // const maps = await makeHouseStopDistanceMap()
  // stopIdToNumMap = maps.stopIdToNumMap
  // houseIdToNumMap = maps.houseIdToNumMap
  // houseStopDistanceMap = maps.houseStopDistanceMap


  // housePositionMap = maps.housePositionMap

  // const maps = await makeHouseStationDistanceMap()
  // houseIdToNumMap = maps.houseIdToNumMap
  // houseStationDistanceMap = maps.houseStationDistanceMap
  // // console.log(map)
  // const time0_2 = Date.now()
  // console.log(
  //   'finish calculating stop house distance:',
  //   Math.floor(time0_2 - time0_1) / 1000,
  //   'seconds'
  // )
  // console.log(waitingTimeMaps)
}

main()

app.get('/test', async (req, res) => {
  const q = `SELECT * FROM house 
    WHERE latitude IS NOT NULL 
      AND longitude IS NOT NULL 
    LIMIT 5`
  // console.log(db)
  const [data] = await db.query(q)
  // console.log(data)
  res.send(data)
})

app.get('/api/1.0/search', async (req, res) => {
  // const g = req.query.commuteWay === 'bus' ? graphForBus : graphForMetro
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
  if (fire === 'true') tags.push(7)
  // if (fire === 'true') console.log(fire)
  if (shortRent === 'true') tags.push(5)
  if (directRent === 'true') tags.push(1)
  if (pet === 'true') tags.push(13)
  if (newItem === 'true') tags.push(12)

  // return
  // console.log(waitingTimeMaps)

  // !!!!
  // const waitingTimeMap = waitingTimeMaps[period]

  // console.log(waitingTimeMap)
  // console.log(graphs)
  // console.log(commuteWay)
  const g = graphs[commuteWay][period]
  // console.log(g)
  // console.log(g._edgeMap)
  // let g
  // switch (req.query.commuteWay) {
  //   case 'bus':
  //     g = graphsForBus
  //     break
  //   case 'metro':
  //     g = graphsForMetro
  //     break
  //   case 'mix':
  //     g = graphsForMix
  // }
  // console.log(g)

  const start = Date.now()
  console.log('receive')

  officeLat = Number(officeLat)
  officeLng = Number(officeLng)
  maxWalkDistance = Number(maxWalkDistance)
  const vertex = new Vertex('-2', 'startPoint', officeLat, officeLng)

  g.addVertex(vertex)

  if (maxWalkDistance > commuteTime * walkVelocity) {
    maxWalkDistance = commuteTime * walkVelocity
  }

  const idMap = {}

  const distToStationMap = {}
  let counter = 0
  for (let id of g.getAllIds()) {
    const lat = g.getVertex(id).lat()
    const lng = g.getVertex(id).lng()
    if (!lat || !lng) continue
    const distToStation = getDistance(
      { latitude: lat, longitude: lng },
      { latitude: officeLat, longitude: officeLng }
    )

    if (distToStation < maxWalkDistance) {
      // NearByStations = distToStation
      // shortestStationIds.push({
      //   shortestStationId: id,
      //   distToShortestStation,
      //   timeToShortestStation: distToStation / walkVelocity
      // })

      // 走到車站的時間 + 等車時間
      // console.log(waitingTimeMap)

      // const waitingTime = waitingTimeMap[id] || 0
      // console.log(id)

      // console.log(waitingTime)
      // return
      const edge = new Edge(
        '-2',
        id,
        period,
        // distToStation / walkVelocity + waitingTime
        distToStation / walkVelocity
      )

      g.addEdge(edge)

      idMap[id] = {
        stationId: id,
        distFromOffice: distToStation,
        walkTimeFromOffice: distToStation / walkVelocity
      }
      distToStationMap[id] = distToStation

      counter++
    }
  }

  // console.log(distToStationMap)
  const nearByStationCount = counter - 1

  // can't get to any station but itself

  const timerNearby = Date.now()
  console.log((timerNearby - start) / 1000, 'seconds for get nearby station')
  console.log('nearByStationCount: ', nearByStationCount)

  if (nearByStationCount === 0) {
    const positionData = [
      {
        stationId: '-2',
        lat: officeLat,
        lng: officeLng,
        distanceLeft: maxWalkDistance
      }
    ]
    const stopRadiusMap = {}
    positionData.forEach(({ stationId, distanceLeft }) => {
      stopRadiusMap[stationId] = distanceLeft
    })
    // return res.send()
    // console.log(positionData.length)
    let houses = await getHousesInBudget(budget, houseType, tags)
    // console.log(houses.length)
    const houseData = await getHousesInRange(
      positionData,
      houses,
      stopRadiusMap
    )
    
    // console.log(houses.length)
    // const houseData = getHousesInBound(houses, Number(latitudeNW), Number(latitudeSE), Number(longitudeNW), Number(longitudeSE))
    const end = Date.now()
    console.log('It totally takes', (end - start) / 1000, 'seconds')
    console.log('...')
    console.log('respond')
    return res.send({
      positionData,
      houseData,
      totalHouse: houseData.length
    })
  }
  // const counter = {}
  const timer0 = Date.now()
  const reachableStations = getShortestPath(g, '-2', commuteTime, period)
  const timer1 = Date.now()
  console.log((timer1 - timer0) / 1000, 'seconds for Dijkstra')
  const reachableStationsMap = {}
  console.log('reachable stops count:', reachableStations.length)

  reachableStations.forEach((reachableStation) => {
    const { id, startStationId, timeSpent, walkDistance } = reachableStation

    // if (id === '16911') {
    //   console.log(reachableStation)
    //   console.log(distToStationMap[startStationId])
    // }
    // console.log('id: ', id);
    // const totalTimeSpent =
    // console.log(timeSpent)
    let distanceLeft = (commuteTime - timeSpent) * walkVelocity - walkDistance

    // console.log('commuteTime: ', commuteTime);
    // console.log('timeSpent: ', timeSpent);
    // console.log('distanceLeft: ', distanceLeft);
    // console.log('distToStationMap[startStationId]: ', distToStationMap[startStationId]);

    // if (distanceLeft > maxWalkDistance) {
    //   distanceLeft = maxWalkDistance - distToStationMap[startStationId]
    // }
    distanceLeft =
      distanceLeft + distToStationMap[startStationId] > maxWalkDistance
        ? maxWalkDistance - distToStationMap[startStationId]
        : distanceLeft
    // distanceLeft = distanceLeft - distToStationMap[startStationId]
    // console.log(distanceLeft)
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
      reachableStationsMap[`${lat}-${lng}`] &&
      distanceLeft < reachableStationsMap[`${lat}-${lng}`].distanceLeft
    ) {
      return
    }
    reachableStationsMap[`${lat}-${lng}`] = {
      stationId: id,
      lat: g.getVertex(id).lat(),
      lng: g.getVertex(id).lng(),
      distanceLeft
    }
  })

  const positionData = Object.values(reachableStationsMap)
  const stopRadiusMap = {}
  positionData.forEach(({ stationId, distanceLeft }) => {
    stopRadiusMap[stationId] = distanceLeft
  })
  // positionData.push({
  //   stationId: '-2',
  //   lat: officeLat,
  //   lng: officeLng,
  //   distanceLeft: maxWalkDistance
  // })
  // console.log(positionData)
  // console.log(budget)
  // return res.send()
  const time1 = Date.now()
  // console.log((time1 - start) / 1000, '!!!')
  let houses = await getHousesInBudget(budget, houseType, tags)
  const time2 = Date.now()
  console.log(
    (time2 - time1) / 1000,
    'seconds to get house in house constraint'
  )
  // console.log(houses)

  // console.log(houses.length)
  if (houses.length !== 0) {
    // console.log(houses.lastIndexOf)
    houses = await getHousesInRange(positionData, houses, stopRadiusMap)
    // console.log(houseData)
  }

  // console.log(houses.length)
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
  // {stationId: 'G08', lat: 25.020733, lng: 121.528143, distanceLeft: 134}
})

app.listen(3000, () => {
  console.log('Listening on port 3000')
})

async function getHousesInBudget(budget, houseType, validTags) {
  // console.log('houseMapCache: ', houseMapCache);
  // console.log('123123213123')
  let houseTypeId
  switch (houseType) {
    case 'shared-suite':
      houseType = '分租套房'
      houseTypeId = 3
      break
    case 'independant-suite':
      houseType = '獨立套房'
      houseTypeId = 1
      break
    case 'studio':
      houseType = '雅房'
      houseTypeId = 5
      break
    default:
      break
  }

  if (Redis.client.connected) {
    const houseMapString = await Redis.get('houseMap')
    if (houseMapString) {
      // console.log(houseMapString)
      console.log('caching house map~~~~~')
      const houseMapCache = JSON.parse(houseMapString)
      console.log(Object.keys(houseMapCache).length, 'length of houseMap')
      let counter = 0
      // const houses = []
      // for (let house of Object.values(houseMapCache)) {
      //   if (houseTypeId && houseTypeId !== house.categoryId) continue
      //   if (house.price > budget) continue
      //   let toContinue
      //   for (let tag of validTags) {
      //     counter++
      //     if (!house.tagIds.includes(tag)) {
      //       // toContinue =
      //       continue
      //     }
      //   }
      // }
      const houses = Object.values(houseMapCache).filter((house) => {
        // if (house.id == 11643802) {
        //   console.log(house)
        // }
        // console.log(house.tagIds)
        if (houseTypeId && houseTypeId !== house.categoryId) {
          // console.log(houseType)
          // console.log(house.category)
          // console.log('~')
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

      // if (Redis.connected && req.query.update) {
      //   console.log('building hosue map cache')
      //   await makeHouseMap()
      // }
      
      return houses
    }
  }
  // if (houseType !==  && houseType)
  // console.log(houseType)
  // console.log(validTags)

  // console.log(houseType)
  // const condition = budget ? `WHERE price <= ${budget}` : ''
  // console.log(budget)
  // console.log('hehehehe')
  const q = `SELECT house.id, title, price, area, link, image, house.address, house.latitude, house.longitude, category.name AS category, tag.id AS tag FROM house 
    JOIN category
      ON house.category_id = category.id
    JOIN house_tag
      ON house.id = house_tag.house_id
    JOIN tag
      ON tag.id = house_tag.tag_id
    WHERE price <= ${budget}
      ${validTags.length !== 0 ? 'AND tag.id IN  (?)' : ''}
      ${houseType ? `AND category.name = '${houseType}'` : ''}
  `
  //       ${budget ? `` : ''}
  // latitude IS NOT NULL AND longitude IS NOT NULL
  // AND (category.name = '獨立套房' OR category.name = '分租套房' OR category.name = '雅房')
  // console.log(q)

  // console.log(db)
  const [result] = await db.query(q, [validTags])

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
  // Object.values(houseMap).forEach(house => {
  //   console.log(house)
  // })
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
  console.log('reachable stations count', positionData.length)
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
  const houseData = houses.filter(house => {
    const {latitude, longitude} = house
    for (let i = 0; i < positionData.length; i++) {
      const position = positionData[i]
      const radius = position.distanceLeft
      counter++
      if (getDistanceSquare({latitude, longitude}, {latitude: position.lat, longitude: position.lng}) < radius * radius) {
        return true
      }
      // if (houseStopDistanceMap[house.id] && houseStopDistanceMap[house.id][positionData[i].stationId] < radius) {
      //   // console.log(house.id)
      //   // console.log(positionData[i].stationId)
      //   // console.log('houseStopDistanceMap[house.id][positionData[i].stationId]: ', houseStopDistanceMap[house.id][positionData[i].stationId]);
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
  // const stationMap = {}
  // const stationData = []
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
  //       const stationId = houseStationDistanceMap[houseNum][i][0]
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
  //     const stopNum = stopIdToNumMap.get(position.stationId)
  //     // console.log(stopNum)
  //     // console.log(houseStopDistanceMap[houseNum])
  //     if (houseStopDistanceMap[houseNum][stopNum] < radius) {

  //       return true
  //     }
  //     if (positionData[i].stationId === '-2' && getDistance({latitude, longitude}, {latitude: position.lat, longitude: position.lng}) < radius) {
  //       return true
  //     }
  //     // console.log('distance:', houseStopDistanceMap[houseNum][stopNum])
  //     // console.log('radius:', radius)
  //   }
  //   return false
  // })
  // return houseData
}
