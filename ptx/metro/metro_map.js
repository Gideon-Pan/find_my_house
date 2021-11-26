
const { getMongoData } = require('../../server/models/db/mongo')
const db = require('../../server/models/db/mysql')

async function makeMetroStationIdMap() {
  const map = []
  const [result] = await db.query(
    'SELECT id, ptx_station_id FROM station WHERE type = "metro"'
  )
  result.forEach(({ id, ptx_station_id }) => {
    map[ptx_station_id] = id
  })
  return map
}

async function makeMetroStopIdMap() {
  const map = {}
  const [result] = await db.query('SELECT id, ptx_stop_id, direction FROM stop')
  result.forEach(({ id, ptx_stop_id, direction }) => {
    // 不同方向的站點為不同stop
    map[`${ptx_stop_id}-${direction}`] = id
  })
  return map
}

async function makeTimePeriodMap() {
  const map = {}
  const q = `SELECT id, time_period_hour, time_period_minute FROM time_period`
  const [result] = await db.query(q)
  result.forEach(({ id, time_period_hour, time_period_minute }) => {
    map[`${time_period_hour}-${time_period_minute}`] = id
  })
  return map
}

async function makeMetroLineMap() {
  const map = []
  const [result] = await db.query(
    'SELECT id, ptx_line_id FROM line WHERE type = "metro"'
  )
  result.forEach(({ id, ptx_line_id }) => {
    map[ptx_line_id] = id
  })
  return map
}
async function makeOverlapMap() {
  const routeInfoList = await getMongoData("metroRoutes")
  // 計算某捷運站點路線重疊次數
  const counterMap = {}
  const routeMap = {}
  routeInfoList.forEach(route => {
    if (routeMap[route.RouteID]) return
    routeMap[route.RouteID] = true
    if (route.Stations.length === 2) return
    route.Stations.forEach(station => {
      if (!counterMap[station.StationID]) {
        return counterMap[station.StationID] = 1
      }
      counterMap[station.StationID]++
    })
  })
  return counterMap
}

async function makeLineStationsMap() {
  const lineStationsMap = {}
  const lines = await getMongoData("metroStations")
  lines.forEach(line => {
    line.Stations.forEach(station => {
      if (!lineStationsMap[line.LineID]) {
        return lineStationsMap[line.LineID] = [station.StationID]
      }
      lineStationsMap[line.LineID].push(station.StationID)
    })
  })
  return lineStationsMap
}

async function makeMetroWaitingTimeMap() {
  const metroWaitingTimeMap = {}
  const metroWaitingTimes =  await getMongoData("metroStationWaitingTime")
  metroWaitingTimes.forEach(({stationId, waitingTimes}) => {
    metroWaitingTimeMap[stationId] = waitingTimes
  })
  return metroWaitingTimeMap
}

module.exports = {
  makeMetroStopIdMap,
  makeMetroStationIdMap,
  makeTimePeriodMap,
  makeMetroLineMap,
  makeLineStationsMap,
  makeOverlapMap,
  makeMetroWaitingTimeMap
}