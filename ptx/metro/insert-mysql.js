const db = require('../../server/models/db/mysql')
const { getMongoData } = require('../../server/models/db/mongo')
const { makeMetroStopIdMap, makeMetroStationIdMap, makeMetroLineMap, makeMetroWaitingTimeMap} = require('./metro_map')

async function insertMetroStations() {
  const stations = await getMongoData('metroStationsPosition')
  const q =
    'INSERT INTO station (ptx_station_id, name, type, latitude, longitude, geo_hash) VALUES ?'
  const values = stations.map((station) => {
    const { StationID, StationName, StationPosition } = station
    const { PositionLon, PositionLat, GeoHash } = StationPosition
    return [
      StationID,
      StationName.Zh_tw,
      'metro',
      PositionLat,
      PositionLon,
      GeoHash
    ]
  })
  await db.query(q, [values])
  console.log('finish inserting metro stations into mysql')
}

async function insertMetroLine() {
  const lines = await getMongoData('metroStations')
  const q = 'INSERT INTO line (ptx_line_id, name, type) VALUES ?'
  const values = lines.map((line) => {
    return [line.LineID, line.LineNo, 'metro']
  })
  await db.query(q, [values])
  console.log('finish inserting metro lines')
}

async function insertMetroStops() {
  const lines = await getMongoData('metroStations')
  const stationIdMap = await makeMetroStationIdMap()
  const lineIdMap = await makeMetroLineMap()
  const q =
    'INSERT INTO stop (ptx_stop_id, station_id, line_id, direction) VALUES ?'
  const values = []
  // two direcion
  for (let i = 0; i < 2; i++) {
    lines.forEach((line) => {
      const { LineID } = line
      line.Stations.forEach((station) => {
        const { StationID } = station
        values.push([StationID, stationIdMap[StationID], lineIdMap[LineID], i])
      })
    })
  }
  await db.query(q, [values])
  console.log('finish inserting metro stops')
}

async function insertMetroIntervalTime(periodId, version) {
  const intervalTimeList = await getMongoData('metroIntervalTime')
  // filter repeat data
  const intervalTimeMap = {}
  intervalTimeList.forEach((intervalTime) => {
    intervalTime.TravelTimes.forEach((traveltime) => {
      const { FromStationID, ToStationID, RunTime, StopTime } = traveltime
      intervalTimeMap[`${FromStationID}-${ToStationID}`] = {
        fromStationId: FromStationID,
        toStationId: ToStationID,
        time: RunTime + StopTime
      }
    })
  })
  // 去程 & 返程
  const stopIdMap = await makeMetroStopIdMap()
  const q =
    'INSERT INTO time_between_stop (from_stop_id, to_stop_id, time_period_id, time, version) VALUES ?'
  const values = []
  for (let i = 0; i < Object.keys(intervalTimeMap).length; i++) {
    const intervalTime = Object.values(intervalTimeMap)[i]
    const { fromStationId, toStationId, time } = intervalTime
    // 去程
    values.push([
      stopIdMap[`${fromStationId}-0`],
      stopIdMap[`${toStationId}-0`],
      periodId,
      time,
      version
    ])
    // 返程
    values.push([
      stopIdMap[`${toStationId}-1`],
      stopIdMap[`${fromStationId}-1`],
      periodId,
      time,
      version
    ])
  }
  await db.query(q, [values])
  console.log('finish inserting metro time interval')
}

async function insertMetroTransferTime(periodId, version) {
  const transferTimeList = await getMongoData('metroTransferTime')
  const stopIdMap = await makeMetroStopIdMap()
  const valuesMap = {}
  const q =
    'INSERT INTO time_between_stop (from_stop_id, to_stop_id, time_period_id, time, version) VALUES ?'
  // 2個轉乘節點/stop * 4 stop = 8 times
  transferTimeList.forEach((transferTime) => {
    const { FromStationID, ToStationID, TransferTime } = transferTime
    const transferTimeSecond = TransferTime * 60
    const stationIds = [
      stopIdMap[`${FromStationID}-0`],
      stopIdMap[`${FromStationID}-1`],
      stopIdMap[`${ToStationID}-0`],
      stopIdMap[`${ToStationID}-1`]
    ]
    for (let i = 0; i < stationIds.length; i++) {
      for (let j = 0; j < stationIds.length; j++) {
        if (i === j) continue
        // filter repeated data
        if (
          valuesMap[`${stationIds[i]}-${stationIds[j]}-${periodId}`]
        )
          continue
        valuesMap[`${stationIds[i]}-${stationIds[j]}-${periodId}`] =
          [
            stationIds[i],
            stationIds[j],
            periodId,
            transferTimeSecond,
            version
          ]
      }
    }
  })
  const values = Object.values(valuesMap)
  await db.query(q, [values])
  console.log('finish inserting metro transfer time')
}

async function insertFirstWaitingTime(periodId, period, version) {
  const waitingTimeMap = await makeMetroWaitingTimeMap()
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
      AND type = 'metro'
    `
  )
  const q =
    'INSERT INTO time_between_stop (from_stop_id, to_stop_id, time_period_id, time, version) VALUES ?'
  const values = []
  result2.forEach(({ id, ptx_stop_id }) => {
    const fromStopId = startId
    const toStopId = id
    let waitingTime = waitingTimeMap[ptx_stop_id][period]
    if (!waitingTime) {
      waitingTime = 360
    }
    values.push([fromStopId, toStopId, periodId, waitingTime, version])
  })
  await db.query(q, [values])
  console.log('finish inserting first waiting time for metro')
}

async function insertTimeBetweenStopMetro() {
  await insertMetroIntervalTime()
  await insertMetroTransferTime()
  await insertMetroWaitingTime()
}

module.exports = {
  insertMetroIntervalTime,
  insertMetroTransferTime,
  insertFirstWaitingTime
}
