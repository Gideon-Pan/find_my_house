require('dotenv').config()
// const House = require('../models/house_model')
const Redis = require('../../util/redis')
const db = require('../models/db/mysql')
const { getDistance, getDistanceSquare } = require('../../util/distance')
const {
  makeGraphs,
  makeWaitingTimeMap,
  makeGraphMap
} = require('../../util/dijkstra/make_graph')
const { Vertex, Edge } = require('../../util/dijkstra/graph')
const { getShortestPath, getReachableStops } = require('../../util/dijkstra/shortest_path')
const {
  makeHouseMap,
  makeTagMap,
  makeTypeMap
} = require('../models/house_model')
const {
  getHousesInConstraint,
  getHousesInRange,
  getHouseData,
  getPositionData
} = require('../service/search_service')
const { makeOfficeToNearbyStopEdges } = require('../service/graph_service')
const { getTagMap } = require('../service/house_service')
// const { getInitGraph } = require('../service/init_service')
// const { getHouseData } = require('../service/house_service')

// const {graphs, walkVelocity} = require('../../util/init')
let waitingTimeMaps
const walkVelocity = 1.25 / 1.414
let graphMap
async function init() {
  console.time('make graph map')
  graphMap = await makeGraphMap(2)
  console.timeEnd('make graph map')
  waitingTimeMaps = await makeWaitingTimeMap(2)
  if (Redis.client.connected) {
    await makeTagMap()
    await makeTypeMap()
    await makeHouseMap()
  }
}

init()
// make graphs of version 2
// const graphs = await getInitGraph(2)
// init
// const graphs = require('../service/init_service')
// console.log(graphs)
// let graphs
// async function main() {
//   graphs = await makeGraphs(2)
// }
// main()

const search = async (req, res) => {
  console.time('total time')
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
  
  const tags = []
  const tagMap = await getTagMap()
  if (fire === 'true') tags.push(tagMap['fire'])
  if (shortRent === 'true') tags.push(tagMap['shortRent'])
  if (directRent === 'true') tags.push(tagMap['directRent'])
  if (pet === 'true') tags.push(tagMap['pet'])
  if (newItem === 'true') tags.push(tagMap['newItem'])

  const graph = graphMap[commuteWay][period]
  console.log('receive')

  officeLat = Number(officeLat)
  officeLng = Number(officeLng)
  maxWalkDistance = Number(maxWalkDistance)
  const office = new Vertex('-2', 'startPoint', officeLat, officeLng)

  graph.addVertex(office)

  if (maxWalkDistance > commuteTime * walkVelocity) {
    maxWalkDistance = commuteTime * walkVelocity
  }

  const distToStopMap = {}

  console.time('make nearby stop edge')
  const nearByStationCount = makeOfficeToNearbyStopEdges(
    graph,
    office,
    period,
    distToStopMap,
    maxWalkDistance
  )
  console.timeEnd('make nearby stop edge')

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
  console.time('Dijkstra')
  const reachableStations = getReachableStops(
    graph,
    '-2',
    commuteTime,
    period,
    waitingTimeMap
  )
  console.timeEnd('Dijkstra')
  const timer1 = Date.now()
  // console.log((timer1 - timer0) / 1000, 'seconds for Dijkstra')
  // const reachableStationMap = {}
  console.log('reachable stops count:', reachableStations.length)

  console.time('get position data')
  const positionData = getPositionData(
    reachableStations,
    commuteTime,
    maxWalkDistance,
    walkVelocity,
    distToStopMap,
    graph
  )
  console.timeEnd('get position data')
  console.time('get house data')
  const houseData = await getHouseData(positionData, budget, houseType, tags)
  // console.log(houseData)
  console.timeEnd('get house data')
  console.timeEnd('total time')
  return res.send({
    positionData,
    houseData,
    totalHouse: houseData.length
  })
}

module.exports = {
  search
}
