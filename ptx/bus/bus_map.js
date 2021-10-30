const { getMongoData } = require('../../model/db/mongodb/mongo_helper')
const db = require('../../model/db/mysql/mysql')

async function makeWaitingTimeMap() {
  const waitingTimeList = await getMongoData('busAvgWaitingTime')
  const waitingTimeMap = {}
  waitingTimeList.forEach((waitingTime) => {
    const { avgWaitingTime, stopId } = waitingTime
    if (!avgWaitingTime) return
    waitingTimeMap[stopId] = avgWaitingTime
  })
  return waitingTimeMap
}

async function makeStopStationMap() {
  const map = {}
  const stations = await getMongoData('busStations')
  stations.forEach((station) => {
    station.Stops.forEach((stop) => {
      map[stop.StopID] = station.StationID
    })
  })
  return map
}

async function makePtxIdMap() {
  const q = `SELECT id, ptx_stop_id FROM stop`
  // const values = [ptxId]
  const [result] = await db.query(q)
  const map = {}
  result.forEach(({ id, ptx_stop_id }) => {
    map[ptx_stop_id] = id
  })
  return map
}

async function makePostionMap() {
  const map = {}
  const busStops = await getMongoData('busStops')
  busStops.forEach(stop => {
    map[stop.StopID] = stop.StopPosition
  })
  // console.log(map)
  return map
}

module.exports = {
  makePtxIdMap,
  makeStopStationMap,
  makeWaitingTimeMap,
  makePostionMap
}