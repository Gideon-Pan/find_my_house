require('dotenv').config()
const { getDistance } = require('../../util/distance')
const { Vertex, Edge } = require('../../util/dijkstra/graph')

const {WALK_VELOCITY, START_POINT_ID} = process.env

function makeOfficeToNearbyStopEdges(
  graph,
  officeLat,
  officeLng,
  period,
  maxWalkDistance
) {
  console.log(WALK_VELOCITY)
  const distToStopMap = {}
  const office = new Vertex(START_POINT_ID, 'startPoint', officeLat, officeLng)
  graph.addVertex(office)
  let counter = 0
  
  for (let id of graph.getAllIds()) {
    const lat = graph.getVertex(id).lat()
    const lng = graph.getVertex(id).lng()
    if (!lat || !lng) continue
    const distToStation = getDistance(
      { latitude: lat, longitude: lng },
      { latitude: officeLat, longitude: officeLng})

    if (distToStation < maxWalkDistance) {
      const edge = new Edge(
        START_POINT_ID,
        id,
        period,
        distToStation / WALK_VELOCITY
      )
      graph.addEdge(edge)
      distToStopMap[id] = distToStation
      counter++
    }
  }
  const nearByStationCount = counter - 1
  console.log('nearByStationCount: ', nearByStationCount)
  return distToStopMap
}
module.exports = {
  makeOfficeToNearbyStopEdges
}
