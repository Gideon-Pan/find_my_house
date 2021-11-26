const Redis = require('../../util/redis')
const {
  makeTypeMap,
  makeTagMap,
  makeHouseMap
} = require('../models/house_model')
const { getDistance } = require('../../util/distance')
const pool = require('../models/db/mysql')
const { Vertex, Edge } = require('../../util/dijkstra/graph')

const walkVelocity = 1.25 / 1.414
const startPointId = '0'

function makeOfficeToNearbyStopEdges(
  g,
  startPoint,
  period,
  distToStopMap,
  maxWalkDistance
) {
  let counter = 0
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
        startPointId,
        id,
        period,
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
  console.log('nearByStationCount: ', nearByStationCount)
  return counter
}

module.exports = {
  makeOfficeToNearbyStopEdges
}
