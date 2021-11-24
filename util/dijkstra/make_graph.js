const { Vertex, Edge, Graph } = require('./graph')
const db = require('../../server/models/db/mysql')
const process = require('process'); 

async function makeVerticeOld(g, type) {
  let condition
  if (type === 'mix') {
    condition = ''
  } else {
    condition = `WHERE type = '${type}'`
  }
  const q = `SELECT ptx_stop_id, name, type, latitude, longitude FROM stop
    JOIN station
      ON stop.station_id = station.id
      ${condition}`
  const [stops] = await db.query(q)
  // if (type === 'mix')  console.log(stops)

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

async function makeEdgesOld(g, type, period, version) {
  // console.log(g)
  let condition
  if (type === 'mix') {
    condition = `WHERE from_stop_id IS NOT NULL
      AND to_stop_id IS NOT NULL
      AND time IS NOT NULL
      AND version = ${version}
    `
  } else {
    condition = `WHERE from_stop_id IS NOT NULL
      AND to_stop_id IS NOT NULL
      AND time IS NOT NULL
      AND type='${type}'
      AND version = ${version}
    `
  }

  const busIdMap = await makeBusIdMap()
  const q = `SELECT from_stop_id, to_stop_id, time_period_hour, time_period_minute, period, time, distance FROM time_between_stop
    JOIN time_period
      ON time_between_stop.time_period_id = time_period.id
    JOIN stop
      ON stop.id = from_stop_id
    JOIN station
      ON station.id = stop.station_id
    ${condition}
    `
  const [data] = await db.query(q)
  data.forEach(
    ({
      from_stop_id,
      to_stop_id,
      // time_period_hour,
      // time_period_minute,
      period,
      time,
      distance
    }) => {
      if (!busIdMap[from_stop_id]) {
        console.log(from_stop_id)
        return
      }
      distance = distance ? distance : 0
      // console.log(distance)
      const edge = new Edge(
        busIdMap[from_stop_id],
        busIdMap[to_stop_id],
        // `${time_period_hour}-${time_period_minute}`,
        period,
        time,
        distance
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

async function makeGraphMap(version) {
  const graphMap = {}
  const types = ['bus', 'metro', 'mix']
  const periods = ['weekdaysPeak', 'weekdays', 'weekend']
  const stops = await getStops()
  for (let type of types) {
    graphMap[type] = {}
    for (let period of periods) {
      const g = new Graph()
      graphMap[type][period] = g
      makeVertice(g, stops)
    }
  }
  const edges = await makeEdges(version)
  edges.forEach((edge) => {
    // console.log(edge)
    const period = edge.period()
    const type = getType(edge.fromId(), edge.toId())
    // console.log(edge.fromId())
    // if (edge.fromId() == -1 ) {
    //   console.log(type)
    // }
    // if (type === 'bus') {
    //   const g = graphMap[type][period]
    //   g.addEdge(edge)
    // }
    // if (type )
    switch (type) {
      case 'bus':
        // if (type === 'bus') {
        graphMap.bus[period].addEdge(edge)
        graphMap.mix[period].addEdge(edge)
        break
      case 'metro':
        // g = graphMapForMetro
        graphMap.metro[period].addEdge(edge)
        graphMap.mix[period].addEdge(edge)
        break
      case 'mix':
        // g = graphMapForMix
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
        // break
    }
  })
  return graphMap
}

function getType(fromId, toId) {
  if (Number(fromId) === -1) {
    return 'start'
  }
  let type 
  if (Number(fromId) && Number(toId)) {
    type = 'bus'
  } else if (!Number(fromId) && !Number(toId)) {
    type = 'metro'
  } else {
    type = 'mix'
  }
  return type
}

async function getStops() {
  const q = `SELECT ptx_stop_id, name, type, latitude, longitude FROM stop
  JOIN station
    ON stop.station_id = station.id
  `
  const [stops] = await db.query(q)
  // if (type === 'mix')  console.log(stops)
  
  return stops
}

async function makeVertice(g, stops) {
  stops.forEach((stop) => {
    const { ptx_stop_id, name, type, latitude, longitude } = stop
    const vertex = new Vertex(ptx_stop_id, name, latitude, longitude)
    g.addVertex(vertex)
  })
}

async function makeEdges(version) {
  // console.log(process.argv[2])
  // console.log(version)
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
      // console.log(distance)
      // console.log(busIdMap[from_stop_id])
      const edge = new Edge(
        busIdMap[data.from_stop_id],
        busIdMap[data.to_stop_id],
        // `${time_period_hour}-${time_period_minute}`,
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

async function makeWaitingTimeMap(version) {
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
  const waitingTimeMap = {}
  waitingTimeList.forEach(
    ({ to_stop_id, time_period_hour, time_period_minute, time, period }) => {
      if (!waitingTimeMap[period]) {
        waitingTimeMap[period] = {}
      }
      waitingTimeMap[period][idToPtxMap[to_stop_id]] = time
    }
  )
  return waitingTimeMap
}

async function makeIdToPtx() {
  const map ={}
  const q = `SELECT id, ptx_stop_id from stop`
  const [data] = await db.query(q)
  data.forEach(({id, ptx_stop_id}) => {
    map[id] = ptx_stop_id
  })
  return map
}

module.exports = {
  makeWaitingTimeMap,
  makeGraphMap,
  makeIdToPtx
}
