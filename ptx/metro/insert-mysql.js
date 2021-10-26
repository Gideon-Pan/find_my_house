const { getMongoData } = require('../model/mongo/mongo-helper')
const db = require('../model/mysql.js')
const { makeTimePeriodMap } = require('../bus/insert_mysql')

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
  // console.log(values)
  await db.query(q, [values])
  console.log('finish inserting metro stations into mysql')
}

async function insertMetroLine() {
  const lines = await getMongoData('metroStations')
  const q = 'INSERT INTO line (ptx_line_id, name, type) VALUES ?'
  const values = lines.map((line) => {
    // const {LineID, LineNo} = line
    return [line.LineID, line.LineNo, 'metro']
  })
  // console.log(values)
  await db.query(q, [values])
  console.log('finish inserting metro lines')
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
// makePtxIdMap()

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
  // console.log(values[269])
  // console.log(values.length)
  await db.query(q, [values])
  console.log('finish inserting metro stops')
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

// makeMetroStopIdMap()

async function insertMetroIntervalTime() {
  const intervalTimeList = await getMongoData('metroIntervalTime')
  // const stopIdMap = await makeMetroStopIdMap()
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
  // console.log(intervalTimeMap)
  // 去程 & 返程
  const timePeriodMap = await makeTimePeriodMap()
  const stopIdMap = await makeMetroStopIdMap()
  const q =
    'INSERT INTO time_between_stop (from_stop_id, to_stop_id, time_period_id, time) VALUES ?'
  const values = []
  for (let i = 0; i < Object.keys(intervalTimeMap).length; i++) {
    const intervalTime = Object.values(intervalTimeMap)[i]
    const { fromStationId, toStationId, time } = intervalTime
    // 去程
    values.push([
      stopIdMap[`${fromStationId}-0`],
      stopIdMap[`${toStationId}-0`],
      timePeriodMap['9-0'],
      time
    ])
    // 返程
    values.push([
      stopIdMap[`${toStationId}-1`],
      stopIdMap[`${fromStationId}-1`],
      timePeriodMap['9-0'],
      time
    ])
  }
  // console.log(values)
  await db.query(q, [values])
  console.log('finish inserting metro time interval')
}

// insertMetroIntervalTime()

async function insertMetroTransferTime() {
  const transferTimeList = await getMongoData('metroTransferTime')
  const timePeriodMap = await makeTimePeriodMap()
  const stopIdMap = await makeMetroStopIdMap()
  // console.log(stopIdMap)
  const valuesMap = {}
  // const values = []
  const q =
    'INSERT INTO time_between_stop (from_stop_id, to_stop_id, time_period_id, time) VALUES ?'
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
          valuesMap[`${stationIds[i]}-${stationIds[j]}-${timePeriodMap['9-0']}`]
        )
          continue
        valuesMap[`${stationIds[i]}-${stationIds[j]}-${timePeriodMap['9-0']}`] =
          [
            stationIds[i],
            stationIds[j],
            timePeriodMap['9-0'],
            transferTimeSecond
          ]
        // values.push([stationIds[i], stationIds[j], timePeriodMap['9-0'], transferTimeSecond])
        // if (stationIds[i] == 180674 && stationIds[j] == 180809) {
        //   console.log('what')
      }
    }
  })
  const values = Object.values(valuesMap)
  // console.log(values)
  await db.query(q, [values])
  console.log('finish inserting metro transfer time')
}

insertMetroTransferTime()

async function insertMetroWaitingTime() {}

async function insertTimeBetweenStopMetro() {
  await insertMetroIntervalTime()
  await insertMetroTransferTime()
  await insertMetroWaitingTime()
}

// insertMetroStations()
