const { getMongoData, insertMany } = require("../../model/db/mongodb/mongo_helper")
const db = require('../../model/db/mysql/mysql')

async function makeMetroStationIdMap() {
  const map = []
  // console.log(db)
  const [result] = await db.query(
    'SELECT id, ptx_station_id FROM station WHERE type = "metro"'
  )
  result.forEach(({ id, ptx_station_id }) => {
    map[ptx_station_id] = id
  })
  // console.log(map)
  return map
}

async function makeMetroStopIdMap() {
  const map = {}
  const [result] = await db.query('SELECT id, ptx_stop_id, direction FROM stop')
  // console.log(result)
  result.forEach(({ id, ptx_stop_id, direction }) => {
    // 不同方向的站點為不同stop
    map[`${ptx_stop_id}-${direction}`] = id
  })
  // console.log(map)
  return map
}

async function makeTimePeriodMap() {
  const map = {}
  const q = `SELECT id, time_period_hour, time_period_minute FROM time_period`
  const [result] = await db.query(q)
  result.forEach(({ id, time_period_hour, time_period_minute }) => {
    map[`${time_period_hour}-${time_period_minute}`] = id
  })
  // console.log(map)
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
  // console.log(map)
  return map
}
async function makeOverlapMap() {
  const routeInfoList = await getMongoData("metroRoutes")
  // 計算某捷運站點路線重疊次數
  const counterMap = {}
  const routeMap = {}
  routeInfoList.forEach(route => {
    // if (lineMap[route.ServiceDay.ServiceTag !== '平日']) return
    if (routeMap[route.RouteID]) return
    routeMap[route.RouteID] = true
    if (route.Stations.length === 2) return
    route.Stations.forEach(station => {
      // console.log(station.StationID)
      if (!counterMap[station.StationID]) {
        return counterMap[station.StationID] = 1
        // {
        //   counter: 1,
        //   frequency: 
        // }
      }
      counterMap[station.StationID]++
    })
  })
  // console.log(counterMap)
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
  // console.log(lineStationsMap)
  return lineStationsMap
}

// version 1 (複雜結構版)
// async function makeMetroWaitingTimeMap() {
//   const metroWaitingTimeMap = {}
//   const metroWaitingTimes = await getMongoData("metroStationWaitingTime")
//   metroWaitingTimes.forEach((station) => {
//     // console.log(station)
//     for (let i = 0; i < station.weekDay.length; i++) {
//       let {peakFlag, waitingTimeSeconds} = station.weekDay[i]
//       // console.log(station.weekDay[i])
//       if (peakFlag === '1') {
//         waitingTimeSeconds = waitingTimeSeconds ? waitingTimeSeconds : 420
//         metroWaitingTimeMap[station.stationId] = waitingTimeSeconds
//         break
//       }
//     }
//   })
//   // console.log(metroWaitingTimeMap)
//   return metroWaitingTimeMap
// }

async function makeMetroWaitingTimeMap() {
  const metroWaitingTimeMap = {}
  const metroWaitingTimes =  await getMongoData("metroStationWaitingTime")
  metroWaitingTimes.forEach(({stationId, waitingTimes}) => {
    metroWaitingTimeMap[stationId] = waitingTimes
  })
  // console.log(metroWaitingTimeMap)
  return metroWaitingTimeMap
}

// makeMetroWaitingTimeMap()

module.exports = {
  makeMetroStopIdMap,
  makeMetroStationIdMap,
  makeTimePeriodMap,
  makeMetroLineMap,
  makeLineStationsMap,
  makeOverlapMap,
  makeMetroWaitingTimeMap
}