const db = require('../../server/models/db/mysql')
const { getMongoData } = require('../../server/models/db/mongo')
const { makeWaitingTimeMap, makeStopStationMap, makePtxIdMap, makeStopRouteMap } = require('./bus_map')

async function insertBusStations() {
  const stations = await getMongoData('busStations')
  const stationMap = {}
  for (let i = 0; i < stations.length; i++) {
    const station = stations[i]
    if (!stationMap[station.StationID]) {
      stationMap[station.StationID] = station
      continue
    }
    // check if different lat, lng station has same station id, which is aweful
    stationMap[station.StationID].Stops = stationMap[
      station.StationID
    ].Stops.concat(station.Stops)
  }

  const values = []
  for (let i = 0; i < Object.keys(stationMap).length; i++) {
    const station = Object.values(stationMap)[i]
    const ptx_station_id = station.StationID
    const name = station.StationName.Zh_tw
    const type = 'bus'
    const latitude = station.StationPosition.PositionLat
    const longitude = station.StationPosition.PositionLon
    const geo_hash = station.StationPosition.GeoHash

    values.push([ptx_station_id, name, type, latitude, longitude, geo_hash])
  }
  const q = `INSERT INTO station (ptx_station_id, name, type, latitude, longitude, geo_hash)
        VALUES ?`
  await db.query(q, [values])
  console.log('finish inserting bus stations')
}

async function insertBusStops() {
  const stops = await getMongoData('busStops')
  const stopStationMap = await makeStopStationMap()
  const values = []
  for (let i = 0; i < stops.length; i++) {
    const stop = stops[i]
    const ptx_stop_id = stop.StopID
    const ptx_station_id = stopStationMap[ptx_stop_id]
    const [result] = await db.query(
      `SELECT id FROM station WHERE ptx_station_id = '${ptx_station_id}'`
    )
    const station_id = result[0].id
    values.push([ptx_stop_id, station_id])
  }
  const q = `INSERT INTO stop (ptx_stop_id, station_id)
    VALUES ?`

  await db.query(q, [values])
  console.log('finish insert bus stops')
}

async function insertTimeBetweenStopOld(periodId, version) {
  const data = await getMongoData('busAvgIntervalTime')
  const busIdMap = await makePtxIdMap()
  const values = []
  for (let i = 0; i < data.length; i++) {
    let { fromStopId, toStopId, avgIntervalTime } = data[i]
    fromStopId = busIdMap[fromStopId]
    toStopId = busIdMap[toStopId]
    values.push([fromStopId, toStopId, periodId, avgIntervalTime, version])
  }
  const q =
    'INSERT INTO time_between_stop (from_stop_id, to_stop_id, time_period_id, time, version) VALUES ?'
  await db.query(q, [values])
  console.log('finish insert time between station')
}

async function insertTimeBetweenStop(periodId, busVelocity, version) {
  const ptxIdMap = await makePtxIdMap()
  const distanceList = await getMongoData('busStopIntervalDistance')
  const q = 'INSERT INTO time_between_stop (from_stop_id, to_stop_id, time_period_id, time, version) VALUES ?'
  const values = distanceList.map(({fromStopId, toStopId, distance}) => {
    return [ptxIdMap[fromStopId], ptxIdMap[toStopId], periodId, distance / busVelocity + 20, version]
  })
  await db.query(q, [values])
  console.log('finish inserting stop interval time for bus')
}

async function getTimePeriodId(timePeriodHour, timePeriodMinute) {
  const q1 = `SELECT id FROM time_period WHERE time_period_hour = ? AND time_period_minute = ?`
  const values1 = [timePeriodHour, timePeriodMinute]
  const [result1] = await db.query(q1, values1)
  const timePeriodId = result1[0].id
  return timePeriodId
}

async function insertBusTransfer(periodId, version) {
  const waitingTimeMap = await makeWaitingTimeMap()
  const stopIdMap = await makePtxIdMap()
  const stopRouteMap = await makeStopRouteMap()
  const stations = await getMongoData('busStations')
  let values = []
  let counter = 0
  for (let i = 0; i < stations.length; i++) {
    for (let i = 0; i < stops.length; i++) {
      for (let j = 0; j < stops.length; j++) {
        if (i === j) continue
        if (stopRouteMap[stops[i].StopID] === stopRouteMap[stops[j].StopID]) {
          counter++
          continue
        }
        const fromStopIdPtx = stops[i].StopID
        const toStopIdPtx = stops[j].StopID
        values.push([
          stopIdMap[fromStopIdPtx],
          stopIdMap[toStopIdPtx],
          periodId,
          waitingTimeMap[toStopIdPtx],
          version
        ])
      }
    }

    if (i % 1000 === 0 || i === stations.length - 1) {
      const q = `INSERT INTO time_between_stop (from_stop_id, to_stop_id, time_period_id, time, version) 
          VALUES ?`
      await db.query(q, [values])
      console.log(`finish inserting ${i + 1} stations`)
      while (values.length !== 0) {
        values.pop()
      }
    }
  }
  console.log('finish inserting bus transfer time')
}

async function makeStartPoint() {
  const q1 = `INSERT INTO station (ptx_station_id, name, type)
  VALUES ?`
  const values1 = [[-1, '起點', '']]
  const [result] = await db.query(q1, [values1])
  const stationId = result.insertId
  const q2 = `INSERT INTO stop (ptx_stop_id, station_id)
    VALUES ?`
  const values2 = [[-1, stationId]]
  await db.query(q2, [values2])
  console.log('finish making start point')
}

async function insertFirstWaitingTime(periodId, version) {
  const waitingTimeMap = await makeWaitingTimeMap()
  const [result1] = await db.query(
    'SELECT id, ptx_stop_id FROM stop WHERE ptx_stop_id = -1'
  )
  const startId = result1[0].id
  const [result2] = await db.query(
    `
    SELECT stop.id, ptx_stop_id FROM stop 
    JOIN station
      ON station.id = stop.station_id
    WHERE ptx_stop_id != 1
      AND type = 'bus'
    `
  )
  const q =
    'INSERT INTO time_between_stop (from_stop_id, to_stop_id, time_period_id, time, version) VALUES ?'
  const values = []
  result2.forEach(({ id, ptx_stop_id }) => {
    const fromStopId = startId
    const toStopId = id
    const waitingTime = waitingTimeMap[ptx_stop_id]
    values.push([fromStopId, toStopId, periodId, waitingTime, version])
  })
  await db.query(q, [values])
  console.log('finish inserting first waiting time')
}

module.exports = {
  insertTimeBetweenStop,
  insertBusTransfer,
  insertFirstWaitingTime
}
