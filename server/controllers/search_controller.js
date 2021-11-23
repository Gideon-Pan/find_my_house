require('dotenv').config()
// const House = require('../models/house_model')
const Redis = require('../../util/redis')
const db = require('../models/db/mysql')
const { getDistance, getDistanceSquare } = require('../../util/distance')
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
const {
  getHousesInConstraint,
  getHousesInRange,
  getHouseData
} = require('../service/search_service')
const { makeOfficeToNearbyStopEdges } = require('../service/graph_service')
// const { getHouseData } = require('../service/house_service')

// const {graphs, walkVelocity} = require('../../util/init')
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
  await makeTagMap()
  await makeTypeMap()
  if (Redis.client.connected) {
    // console.log('interesting')
    await makeHouseMap()
  }
}

main()

const search = async (req, res) => {
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
    const houseData = await getHouseData(positionData, budget, houseType, tags)
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
  const houseData = await getHouseData(positionData, budget, houseType, tags)
  // console.log(houseData)
  return res.send({
    positionData,
    houseData,
    totalHouse: houseData.length
  })
}

module.exports = {
  search
}
