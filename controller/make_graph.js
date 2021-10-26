const { Vertex, Edge, Graph } = require('./graph')
const db = require('../model/db/mysql/mysql')

async function makeVertice(g, type) {
  const q = `SELECT ptx_stop_id, name, type, latitude, longitude FROM stop
    JOIN station
      ON stop.station_id = station.id
    WHERE type = '${type}'`
  const [stops] = await db.query(q)
  stops.forEach((stop) => {
    const { ptx_stop_id, name, type, latitude, longitude } = stop
    const vertex = new Vertex(ptx_stop_id, name, latitude, longitude)
    g.addVertex(vertex)
  })
  // console.log(g._vertexMap)
}

async function makeBusIdMap() {
  const map = {}
  const q = `SELECT id, ptx_stop_id FROM stop`
  const [stops] = await db.query(q)
  stops.forEach(({ id, ptx_stop_id }) => {
    map[id] = ptx_stop_id
  })
  // console.log(map)
  return map
}
// makeBusIdMap()
// makeVertice()

async function makeEdges(g, type) {
  // console.log(g)
  const busIdMap = await makeBusIdMap()
  const q = `SELECT from_stop_id, to_stop_id, time_period_hour, time_period_minute, time FROM time_between_stop
    JOIN time_period
      ON time_between_stop.time_period_id = time_period.id
    JOIN stop
      ON stop.id = from_stop_id
    JOIN station
      ON station.id = stop.station_id
    WHERE from_stop_id IS NOT NULL
      AND to_stop_id IS NOT NULL
      AND time IS NOT NULL
      AND type='${type}'`
  const [data] = await db.query(q)
  data.forEach(
    ({
      from_stop_id,
      to_stop_id,
      time_period_hour,
      time_period_minute,
      time
    }) => {
      if (!busIdMap[from_stop_id]) {
        console.log(from_stop_id)
        return
      }
      const edge = new Edge(
        busIdMap[from_stop_id],
        busIdMap[to_stop_id],
        `${time_period_hour}-${time_period_minute}`,
        time
      )
      g.addEdge(edge)
    }
  )
}

// makeEdges()

async function addTransfer(g, nodeMap) {
  const data = await getData('./metro_transfer.json')
  data.forEach((transfer) => {
    const edge = new Edge(
      nodeMap[transfer.FromStationID],
      nodeMap[transfer.ToStationID],
      transfer.TransferTime * 60
    )
    // console.log(edge)
    g.addEdge(edge)
  })
}

async function addPosition(g, nodeMap) {
  const stations = await getPtxData(
    'https://ptx.transportdata.tw/MOTC/v2/Rail/Metro/Station/TRTC?$top=3000&$format=JSON'
  )
  stations.forEach((station) => {
    const { PositionLon, PositionLat } = station.StationPosition
    nodeMap[station.StationID].addLat(PositionLat)
    nodeMap[station.StationID].addLng(PositionLon)
  })
}

async function makeGraph(type) {
  const g = new Graph()
  // console.log(g)
  await makeVertice(g, type)
  // console.log(g._vertexMap)
  await makeEdges(g, type)
  // console.log(g._edges.length)
  return g
}

async function makeWaitingTimeMap() {
  const q = `SELECT to_stop_id, time_period_hour, time_period_minute, time FROM time_between_stop
  JOIN time_period
    ON time_between_stop.time_period_id = time_period.id
  JOIN stop
    ON stop.id = from_stop_id
  WHERE ptx_stop_id = -1
    AND time IS NOT NULL
  `
  const [waitingTimeList] = await db.query(q)
  // console.log(waitingTimeList)
  const waitingTimeMap = {}
  waitingTimeList.forEach(
    ({ to_stop_id, time_period_hour, time_period_minute, time }) => {
      waitingTimeMap[to_stop_id] = time
    }
  )
  // console.log(waitingTimeMap)
  return waitingTimeMap
}
makeWaitingTimeMap()
// makeGraph()

module.exports = {
  makeGraph,
  makeWaitingTimeMap
}
