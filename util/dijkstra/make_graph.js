const { Vertex, Edge, Graph } = require('./graph')
const db = require('../../server/models/db/mysql')
const process = require('process'); 
const { makeIdToPtx, makeBusIdMap, getType } = require('./make_graph_helper');

async function makeGraphMap(graphMap, version) {
  const types = ['bus', 'metro', 'mix']
  const periods = ['weekdaysPeak', 'weekdays', 'weekend']
  // const stops = await getStops()

  const vertice = await getVertice()
  // create 3 * 3 = 9 graphs for graphMap, and add vertice to them
  for (let type of types) {
    graphMap[type] = {}
    for (let period of periods) {
      const graph = new Graph()
      graphMap[type][period] = graph
      addVertice(graph, vertice)
    }
  }

  const edges = await getEdges(version)
  addEdges(graphMap, edges)
  // edges.forEach((edge) => {
  //   const period = edge.period()
  //   const type = getType(edge.fromId(), edge.toId())
  //   switch (type) {
  //     case 'bus':
  //       graphMap.bus[period].addEdge(edge)
  //       graphMap.mix[period].addEdge(edge)
  //       break
  //     case 'metro':
  //       graphMap.metro[period].addEdge(edge)
  //       graphMap.mix[period].addEdge(edge)
  //       break
  //     case 'mix':
  //       graphMap.mix[period].addEdge(edge)
  //       break
  //     case 'start':
  //       graphMap.bus[period].addEdge(edge)
  //       graphMap.metro[period].addEdge(edge)
  //       graphMap.mix[period].addEdge(edge)
  //       break
  //     default:
  //       console.log(type)
  //       throw new Error('type undefined')
  //   }
  // })
  return graphMap
}

async function getVertice() {
  const q = `SELECT ptx_stop_id, name, type, latitude, longitude FROM stop
  JOIN station
    ON stop.station_id = station.id
  `
  const [stops] = await db.query(q)
  const vertice = stops.map((stop) => {
    const { ptx_stop_id, name, latitude, longitude } = stop
    const vertex = new Vertex(ptx_stop_id, name, latitude, longitude)
    return vertex
  })
  return vertice
}

function addVerticeOld(graph, stops) {
  stops.forEach((stop) => {
    const { ptx_stop_id, name, latitude, longitude } = stop
    const vertex = new Vertex(ptx_stop_id, name, latitude, longitude)
    graph.addVertex(vertex)
  })
}

function addVertice(graph, vertice) {
  vertice.forEach(vertex => {
    graph.addVertex(vertex)
  })
}

function addEdges(graphMap, edges) {
  edges.forEach((edge) => {
    const period = edge.period()
    const type = getType(edge.fromId(), edge.toId())
    switch (type) {
      case 'bus':
        graphMap.bus[period].addEdge(edge)
        graphMap.mix[period].addEdge(edge)
        break
      case 'metro':
        graphMap.metro[period].addEdge(edge)
        graphMap.mix[period].addEdge(edge)
        break
      case 'mix':
        graphMap.mix[period].addEdge(edge)
        break
      case 'start':
        graphMap.bus[period].addEdge(edge)
        graphMap.metro[period].addEdge(edge)
        graphMap.mix[period].addEdge(edge)
        break
      default:
        console.log(type)
        throw new Error('type undefined')
    }
  })
}

async function getEdges(version) {
  const edges = []
  const busIdMap = await makeBusIdMap()
  const q = `SELECT from_stop_id, to_stop_id, time_period_hour, time_period_minute, period, time, distance FROM time_between_stop
    JOIN time_period
      ON time_between_stop.time_period_id = time_period.id
    JOIN stop
      ON stop.id = to_stop_id
    JOIN station
      ON station.id = stop.station_id
      WHERE from_stop_id IS NOT NULL
      AND to_stop_id IS NOT NULL
      AND time IS NOT NULL
      AND version = ${version}
      ${process.argv[2] === 'metro' ? 'AND type = "metro"' : ''}
    `
  const [result] = await db.query(q)
  result.forEach(
    (data) => {
      if (!busIdMap[data.from_stop_id]) {
        console.log(data.from_stop_id)
        return
      }
      data.distance = data.distance ? data.distance : 0
      const edge = new Edge(
        busIdMap[data.from_stop_id],
        busIdMap[data.to_stop_id],
        data.period,
        data.time,
        data.distance
      )
      // g.addEdge(edge)
      edges.push(edge)
    }
  )
  console.log('finish fetching data')
  return edges
}

async function makeWaitingTimeMap(waitingTimeMaps, version) {
  // console.log(version)
  const idToPtxMap = await makeIdToPtx()
  const q = `SELECT to_stop_id, time_period_hour, time_period_minute, time, period FROM time_between_stop
  JOIN time_period
    ON time_between_stop.time_period_id = time_period.id
  JOIN stop s
    ON s.id = time_between_stop.from_stop_id
  JOIN stop t
    ON t.id = time_between_stop.to_stop_id
  JOIN station
    ON station.id = t.station_id
  WHERE s.ptx_stop_id = -1
    AND time IS NOT NULL
    AND version = ${version}
    ${process.argv[2] === 'metro' ? 'AND type = "metro"' : ''}
  `
  const [waitingTimeList] = await db.query(q)
  waitingTimeList.forEach(
    ({ to_stop_id, time_period_hour, time_period_minute, time, period }) => {
      if (!waitingTimeMaps[period]) {
        waitingTimeMaps[period] = {}
      }
      waitingTimeMaps[period][idToPtxMap[to_stop_id]] = time
    }
  )
  return waitingTimeMaps
}

module.exports = {
  makeWaitingTimeMap,
  makeGraphMap,
}
