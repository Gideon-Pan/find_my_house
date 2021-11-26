require('dotenv').config()
const { Vertex } = require('../../util/dijkstra/graph')
const { getReachableStops } = require('../../util/dijkstra/shortest_path')
const {
  getHouseData,
  getPositionData
} = require('../service/search_service')
const { makeOfficeToNearbyStopEdges } = require('../service/graph_service')
const { getTagMap } = require('../service/house_service')
// const {graphMap, waitingTimeMaps} = require('../../util/init')
const initMap = require('../../util/init')
const {WALK_VELOCITY} = process.env
const startPointId = '0'

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

  const graph = initMap.graphMap[commuteWay][period]
  console.log('receive')

  officeLat = Number(officeLat)
  officeLng = Number(officeLng)
  maxWalkDistance = Number(maxWalkDistance)
  const office = new Vertex(startPointId, 'startPoint', officeLat, officeLng)

  graph.addVertex(office)

  maxWalkDistance = Math.min(maxWalkDistance, commuteTime * WALK_VELOCITY)

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
        stopId: startPointId,
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
  const waitingTimeMap = initMap.waitingTimeMaps[period]
  console.time('Dijkstra')
  const reachableStations = getReachableStops(
    graph,
    startPointId,
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
