const express = require('express')
const { getDistance } = require('geolib')
const { makeGraph, makeWaitingTimeMap } = require('./controller/make_graph')
// const getShortestPathBus = require('./ptx_testing/bus/bus_sp')
// const { PQ } = require('./controller/priority_queue')
// const { metro } = require('./ptx_testing/metro_app')
const { Vertex, Edge } = require('./controller/graph')
const { getShortestPath } = require('./controller/shortest_path')
// const { Edge } = require('./graph')
// const { makeGraph } = require('./makeGraph')

// console.log(makeGraph)

const app = express()

app.use(express.static(__dirname + '/public'))

const walkVelocity = 1.25 / 1.414

let graphForBus
let graphForMetro
let waitingTimeMap
async function main() {
  const time0_0 = Date.now()
  graphForBus = await makeGraph('bus')
  graphForMetro = await makeGraph('metro')
  waitingTimeMap = await makeWaitingTimeMap()
  const time0_1 = Date.now()
  console.log(
    'finish making graph:',
    Math.floor(time0_1 - time0_0) / 1000,
    'seconds'
  )
}
main()

app.get('/search', async (req, res) => {
  const g = req.query.commuteWay === 'bus' ? graphForBus : graphForMetro
  const start = Date.now()
  console.log('receive')
  let { commuteTime, officeLat, officeLng, maxWalkDistance } = req.query
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
      const waitingTime = waitingTimeMap[id] || 0
      const edge = new Edge(
        '-2',
        id,
        '9-0',
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
  const time1_2 = Date.now()
  // can't get to any station but itself
  if (counter === 1) {
    return res.send([
      {
        stationId: '-2',
        lat: officeLat,
        lng: officeLng,
        distanceLeft: maxWalkDistance
      }
    ])
  }

  // const counter = {}

  const reachableStations = getShortestPath(g, '-2', commuteTime)

  const reachableStationsMap = {}
  console.log(reachableStations.length)

  reachableStations.forEach((reachableStation) => {
    const { id, startStationId, timeSpent } = reachableStation

    // if (id === '16911') {
    //   console.log(reachableStation)
    //   console.log(distToStationMap[startStationId])
    // }
    // console.log('id: ', id);
    // const totalTimeSpent =
    // console.log(timeSpent)
    let distanceLeft = (commuteTime - timeSpent) * walkVelocity

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
      console.log('fuck')
      return console.log(req.query)
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
  const respondData = Object.values(reachableStationsMap)
  // console.log(respondData.length)
  const end = Date.now()
  console.log('It totally takes', (end - start) / 1000, 'seconds')
  return res.send(respondData)
  // {stationId: 'G08', lat: 25.020733, lng: 121.528143, distanceLeft: 134}
})

app.listen(3000, () => {
  console.log('Listening on port 3000')
})
