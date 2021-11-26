require('dotenv').config()
// const { Vertex } = require('../../util/dijkstra/graph')
const { getReachableStops } = require('../../util/dijkstra/shortest_path')
const { getHouseData, getPositionData, getRequestTags } = require('../service/search_service')
const { makeOfficeToNearbyStopEdges } = require('../service/graph_service')
const initMap = require('../../util/init')
const { WALK_VELOCITY, START_POINT_ID } = process.env

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
  } = req.query

  console.log('receive')

  const graph = initMap.graphMap[commuteWay][period]
  const tags = await getRequestTags(fire, shortRent, directRent, pet, newItem)

  officeLat = Number(officeLat)
  officeLng = Number(officeLng)
  maxWalkDistance = Number(maxWalkDistance)
  maxWalkDistance = Math.min(maxWalkDistance, commuteTime * WALK_VELOCITY)

  console.time('make nearby stop edge')
  const distToStopMap = makeOfficeToNearbyStopEdges(
    graph,
    officeLat,
    officeLng,
    period,
    maxWalkDistance
  )
  // console.log(distToStopMap)
  console.timeEnd('make nearby stop edge')

  const waitingTimeMap = initMap.waitingTimeMaps[period]
  console.time('Dijkstra')
  const reachableStations = getReachableStops(
    graph,
    START_POINT_ID,
    commuteTime,
    period,
    waitingTimeMap
  )
  console.timeEnd('Dijkstra')
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