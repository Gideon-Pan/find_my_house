const express = require('express')
require('dotenv').config()
const { getDistance } = require('geolib')
const { makeGraphs, makeWaitingTimeMap } = require('./server/dijkstra/make_graph')
// const getShortestPathBus = require('./ptx_testing/bus/bus_sp')
// const { PQ } = require('./controller/priority_queue')
// const { metro } = require('./ptx_testing/metro_app')
const { Vertex, Edge } = require('./server/dijkstra/graph')
const { getShortestPath } = require('./server/dijkstra/shortest_path')
// const { Edge } = require('./graph')
// const { makeGraph } = require('./makeGraph')
const db = require('./server/models/db/mysql')
// console.log(makeGraph)
const {API_VERSION} = process.env
// console.log(API_VERSION)

const app = express()
app.use(express.json())

app.use(express.static(__dirname + '/public'))

// API routes
app.use('/api/' + API_VERSION,
    // rateLimiterRoute,
    [
      require('./server/routes/user_route'),
      require('./server/routes/house_route')
        // require('./server/routes/admin_route'),
        // require('./server/routes/product_route'),
        // require('./server/routes/marketing_route'),
        // require('./server/routes/user_route'),
        // require('./server/routes/order_route'),
    ]
);

// app.get('/house/life-function', async (req, res) => {
//   // console.log('qhhq')
//   // console.log(req.query)
  
// })

const walkVelocity = 1.25 / 1.414

let graphsForBus
let graphForMetro
let graphForMix
let waitingTimeMaps
let graphs
async function main() {
  const time0_0 = Date.now()
  // graphsForBus = await makeGraph('bus', 2)
  // graphsForMetro = await makeGraph('metro', 2)
  // graphsForMix = await makeGraph('mix', 2)
  graphs = await makeGraphs(2)
  console.log('finish making graph step 0')
  waitingTimeMaps = await makeWaitingTimeMap(2)
  // waitingTimeMap = waitingTimeMaps[]
  const time0_1 = Date.now()
  console.log(
    'finish making graph:',
    Math.floor(time0_1 - time0_0) / 1000,
    'seconds'
  )
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
  console.log(data)
  res.send(data)
})

app.get('/search', async (req, res) => {
  // const g = req.query.commuteWay === 'bus' ? graphForBus : graphForMetro
  let { commuteTime, officeLat, officeLng, maxWalkDistance, period, commuteWay, budget, houseType } = req.query
  // console.log(waitingTimeMaps)
  const waitingTimeMap = waitingTimeMaps[period]
  // console.log(waitingTimeMap)
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
      const waitingTime = waitingTimeMap[id] || 0
      // console.log(id)
      // console.log(waitingTime)
      // return
      const edge = new Edge(
        '-2',
        id,
        period,
        distToStation / walkVelocity + waitingTime
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
  console.log('nearByStationCount: ', nearByStationCount)
  // can't get to any station but itself
  if (nearByStationCount === 0) {
    const positionData = [
      {
        stationId: '-2',
        lat: officeLat,
        lng: officeLng,
        distanceLeft: maxWalkDistance
      }
    ]
    const houses = await getHousesInBudget()
    const houseData = await getHousesInRange(positionData, houses)
    return res.send({
      positionData,
      houseData
    })
  }

  // const counter = {}

  const reachableStations = getShortestPath(g, '-2', commuteTime, period)

  const reachableStationsMap = {}
  console.log("reachable station count:", reachableStations.length)

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
  // console.log(budget)
  const time1 = Date.now()
  const  houses = await getHousesInBudget(budget, houseType)
  const time2 = Date.now()
  console.log((time2 - time1) / 1000)
  // console.log(houses)
  let houseData
  console.log(houses.length)
  if (houses.length !== 0) {
    // console.log(houses.lastIndexOf)
    houseData = await getHousesInRange(positionData, houses)
    // console.log(houseData)
  } else {
    houseData = houses
  }
  const time3 = Date.now()
  console.log((time3 - time2) / 1000)
  
  // console.log(positionData)
  // console.log(respondData.length)
  const end = Date.now()
  console.log('It totally takes', (end - start) / 1000, 'seconds')
  console.log('respond')
  // console.log(houseData)
  return res.send({
    positionData,
    houseData
  })
  // {stationId: 'G08', lat: 25.020733, lng: 121.528143, distanceLeft: 134}
})

app.listen(3000, () => {
  console.log('Listening on port 3000')
})

async function getHousesInBudget(budget, houseType) {
  console.log(houseType)
  switch (houseType) {
    case 'shared-suite':
      houseType = '分租套房'
      break
    case 'independant-suite':
      houseType = '獨立套房'
      break
    case 'studio':
      houseType = '雅房'
      break
    default:
      break
  }
  // console.log(houseType)
  // const condition = budget ? `WHERE price <= ${budget}` : ''
  const q = `SELECT house.id, title, price, area, link, image, house.address, house.latitude, house.longitude, category.name AS category FROM house 
    JOIN category
      ON house.category_id = category.id
    WHERE latitude IS NOT NULL
      AND longitude IS NOT NULL
      ${budget ? `AND price <= ${budget}` : ''}
      ${houseType ? `AND category.name = '${houseType}'` : "AND category.name = '獨立套房' OR category.name = '分租套房' OR category.name = '雅房'"}
  `
  // console.log(db)
  const [houses] = await db.query(q)
  console.log(houses.length)
  return houses
}

async function getHousesInRange(positionData, houses) {
  // const q = `SELECT * FROM house 
  // WHERE latitude IS NOT NULL 
  //   AND longitude IS NOT NULL
  // `
  // // console.log(db)
  // const [houses] = await db.query(q)
  let counter = 0
  const houseData = houses.filter(house => {
    const {latitude, longitude} = house
    for (let i = 0; i < positionData.length; i++) {
      const position = positionData[i]
      const radius = position.distanceLeft
      counter++
      if (getDistance({latitude, longitude}, {latitude: position.lat, longitude: position.lng}) < radius) {
        return true
      }
    }
    // console.log('waht')
    return false
  })
  console.log(`computing ${counter} times`)
  return houseData
}