// const { getMongoData } = require('../bus/mongo-helper')
const { makeTimePeriodMap } = require('../metro/metro_map')
const { getMongoData } = require('../../model/db/mongodb/mongo_helper')
const db = require('../../model/db/mysql/mysql')
const { makeWaitingTimeMap, makeStopStationMap, makePtxIdMap, makeDistanceMap, makeStopRouteMap } = require('./bus_map')

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
    // if (station.)
    stationMap[station.StationID].Stops = stationMap[
      station.StationID
    ].Stops.concat(station.Stops)
    // console.log(station.StationID)
    // console.log(stationMap[station.StationID].Stops.length)
    // console.log(stationMap[station.StationID].Stops)
    // break
  }
  // const map = {}
  // console.log(Object.keys(stationMap).length)
  // return
  // console.log(stations.length)
  const values = []
  for (let i = 0; i < Object.keys(stationMap).length; i++) {
    if (i % 1000 === 0) {
      console.log(i)
    }
    const station = Object.values(stationMap)[i]
    // for (let station of stationMap) {
    //   console.log(station)
    // }
    // const station = stations[i]
    const ptx_station_id = station.StationID
    const name = station.StationName.Zh_tw
    const type = 'bus'
    const latitude = station.StationPosition.PositionLat
    const longitude = station.StationPosition.PositionLon
    const geo_hash = station.StationPosition.GeoHash

    // const values = [[ptx_station_id, name, type, latitude, longitude, geo_hash]]

    values.push([ptx_station_id, name, type, latitude, longitude, geo_hash])
    // if (map[station.StationID]) {
    //   // console.log(station.StationID)
    //   // console.log(station)
    //   // console.log(map[station.StationID])
    //   // break
    // }
    // map[station.StationID] = station
    // console.log(i)
  }
  console.log(values)
  const q = `INSERT INTO station (ptx_station_id, name, type, latitude, longitude, geo_hash)
        VALUES ?`
  await db.query(q, [values])
  // console.log(Object.keys(map).length)
  console.log('finish inserting bus stations')
}

async function insertBusStops() {
  // const routes = await getMongoData("stops")
  const stops = await getMongoData('busStops')
  const stopStationMap = await makeStopStationMap()
  // console.log(stopStationMap)
  const values = []
  for (let i = 0; i < stops.length; i++) {
    if (i % 1000 === 0) {
      console.log(i)
    }
    const stop = stops[i]
    const ptx_stop_id = stop.StopID
    const ptx_station_id = stopStationMap[ptx_stop_id]
    // const name = stop.StopName.Zh_tw
    // const type = "bus"
    // const latitude = stop.StopPosition.PositionLat
    // const longitude = stop.StopPosition.PositionLat
    // const geo_hash = stop.StopPosition.GeoHash

    const [result] = await db.query(
      `SELECT id FROM station WHERE ptx_station_id = '${ptx_station_id}'`
    )
    // console.log(result[0].id)
    const station_id = result[0].id

    // const values = [[ptx_stop_id, station_id]]
    values.push([ptx_stop_id, station_id])

    // console.log(i)

    // if (result.length === 0) {
    //   const q =`INSERT INTO station (ptx_stations_id, name, type, latitude, longitude, geo_hash)
    //     VALUES ?`
    //   const values = [[ptx_station_id, name, type, latitude, longitude, geo_hash]]
    //   await db.query(q, [values])
    // }
    // break;
  }
  const q = `INSERT INTO stop (ptx_stop_id, station_id)
    VALUES ?`

  await db.query(q, [values])
  console.log('finish insert bus stops')
}

async function insertTimeBetweenStopOld(periodId, version) {
  const data = await getMongoData('busAvgIntervalTime')
  // const timePeriodMap = await makeTimePeriodMap()
  const busIdMap = await makePtxIdMap()
  const values = []
  for (let i = 0; i < data.length; i++) {
    if (i % 1000 === 0) {
      console.log(i)
    }
    let { fromStopId, toStopId, avgIntervalTime } = data[i]
    const timePeriodHour = 9
    const timePeriodMinute = 0
    // const q1 = `SELECT id FROM time_period WHERE time_period_hour = ? AND time_period_minute = ?`
    // const values1 = [timePeriodHour, timePeriodMinute]
    // const [result1] = await db.query(q1, values1)
    // const timePeriodId = result1[0].id
    // const timePeriodId = timePeriodMap[`${timePeriodHour}-${timePeriodMinute}`]

    // const q2 = `SELECT id FROM stop WHERE ptx_stop_id = ?`
    // const values2 = [fromStopId]
    // const [result2] = await db.query(q2, values2)
    // fromStopId = result2[0].id
    fromStopId = busIdMap[fromStopId]

    // const q3 = `SELECT id FROM stop WHERE ptx_stop_id = ?`
    // const values3 = [toStopId]
    // const [result3] = await db.query(q3, values3)
    // toStopId = result3[0].id
    toStopId = busIdMap[toStopId]

    // console.log(fromStopId)
    // console.log(toStopId)

    // console.log(result)
    // const [[{time_period_id}]] = await db.query(q1, values1)
    // console.log(time_period_id)

    // console.log('timePeriodId: ', timePeriodId);
    // return

    // const values = [[fromStopId, toStopId, timePeriodId, avgIntervalTime]]
    values.push([fromStopId, toStopId, periodId, avgIntervalTime, version])
    // try {

    // } catch(e) {
    //   console.log(e)
    //   console.log(fromStopId)
    //   console.log(toStopId)
    //   return
    // }
  }
  const q =
    'INSERT INTO time_between_stop (from_stop_id, to_stop_id, time_period_id, time, version) VALUES ?'
  await db.query(q, [values])
  // console.log(i)
  console.log('finish insert time between station')
  // temporory method for single time_period
}

async function insertTimeBetweenStop(periodId, busVelocity, version) {
  // const distanceMap = await makeDistanceMap()
  // const values = distanceMap
  // const values = []
  const ptxIdMap = await makePtxIdMap()
  const distanceList = await getMongoData('busStopIntervalDistance')
  const q = 'INSERT INTO time_between_stop (from_stop_id, to_stop_id, time_period_id, time, version) VALUES ?'
  const values = distanceList.map(({fromStopId, toStopId, distance}) => {
    // if (ptxIdMap[fromStopId] === 165011 && ptxIdMap[toStopId] === 165012) {
    //   console.log('toStopIdPtx: ', toStopId);
    //   console.log('fromStopIdPtx: ', fromStopId);
    //   console.log('111111111')
    //   // console.log(waitingTimeMap[toStopId])
      
    // }
    return [ptxIdMap[fromStopId], ptxIdMap[toStopId], periodId, distance / busVelocity + 20, version]
  })
  // console.log(values)
  await db.query(q, [values])
  console.log('finish inserting stop interval time for bus')
}
// insertTimeBetweenStop()

async function getTimePeriodId(timePeriodHour, timePeriodMinute) {
  const q1 = `SELECT id FROM time_period WHERE time_period_hour = ? AND time_period_minute = ?`
  const values1 = [timePeriodHour, timePeriodMinute]
  const [result1] = await db.query(q1, values1)
  const timePeriodId = result1[0].id
  return timePeriodId
}



// makeTimePeriodMap()





async function insertBusTransfer(periodId, version) {
  const waitingTimeMap = await makeWaitingTimeMap()

  const stopIdMap = await makePtxIdMap()
  const stopRouteMap = await makeStopRouteMap()
  // console.log(waitingTimeMap)
  const stations = await getMongoData('busStations')
  // const timePeriodId = await getTimePeriodId(9, 0)
  let values = []
  const map = {}
  let counter = 0
  for (let i = 0; i < stations.length; i++) {
    const station = stations[i]
    const stops = station.Stops
    // key: ptx_stop_id values: stop.id

    // const stopIdMap = {}
    // for (let i = 0; i < stops.length; i++) {
    //   const ptx_stop_id = stops[i].StopID
    //   const q = 'SELECT id FROM stop WHERE ptx_stop_id = ?'
    //   const values = [ptx_stop_id]
    //   try {
    //     const [result] = await db.query(q, [values])
    //     const stop_id = result[0].id
    //     stopIdMap[ptx_stop_id] = stop_id
    //   } catch(e) {
    //     console.log(e)
    //     console.log(q)
    //     console.log("station id:", station.StationID)
    //   }

    // }

    // console.log(stopIdMap)
    // return
    
    for (let i = 0; i < stops.length; i++) {
      for (let j = 0; j < stops.length; j++) {
        if (i === j) continue
        if (stopRouteMap[stops[i].StopID] === stopRouteMap[stops[j].StopID]) {
          counter++
          continue
          console.log('got it')
          // console.log(stops[i].StopID)
          console.log('stops[i].StopID: ', stops[i].StopID);
          // stops[j].StopID
          console.log('stops[j].StopID: ', stops[j].StopID);
          // stopRouteMap[stops[i].StopID
          console.log('route id: ', stopRouteMap[stops[i].StopID]);
        }
        // console.log(stops[i])
        // if (stops[i].StopName.Zh_tw !== stops[j].StopName.Zh_tw) {
        //   console.log(i)
        //   console.log(j)
        //   console.log(station.StationID)
        //   continue
        // }

        // test 
        

        const fromStopIdPtx = stops[i].StopID
        const toStopIdPtx = stops[j].StopID
        // if (!waitingTimeMap[toStopIdPtx]) {
        //   console.log(toStopIdPtx)
        //   return
        // }
        values.push([
          stopIdMap[fromStopIdPtx],
          stopIdMap[toStopIdPtx],
          periodId,
          waitingTimeMap[toStopIdPtx],
          version
        ])
        // console.log(waitingTimeMap[toStopIdPtx])
        if (stopIdMap[fromStopIdPtx] === 165011 && stopIdMap[toStopIdPtx] === 165012) {
          console.log('transfer bug')
          console.log('toStopIdPtx: ', toStopIdPtx);
          console.log('fromStopIdPtx: ', fromStopIdPtx);
          console.log('111111111')
          console.log(waitingTimeMap[toStopIdPtx])
          console.log(station.StationID)
          console.log(stopRouteMap[fromStopIdPtx])
          console.log(stopRouteMap[toStopIdPtx])
          
        }
        // if (map[`${fromStopIdPtx}-${toStopIdPtx}-${periodId}`]) {
        //   console.log('`${fromStopIdPtx}-${toStopIdPtx}-${periodId}`: ', `${fromStopIdPtx}-${toStopIdPtx}-${periodId}`);
        //   return console.log('QQQQ')
        // }
        // map[`${fromStopIdPtx}-${toStopIdPtx}-${periodId}`] = true
        // console.log(stopIdMap)
        // console.log(fromStopIdPtx)
        // console.log("stop id:", stopIdMap[fromStopIdPtx])
        // console.log(waitingTimeMap[toStopIdPtx])
        // return
      }
    }
    // return
    // if (i > 3)  return
    // console.log(i)
    // console.log(stops.length)
    // console.log(i)
    //   console.log(values.length)
    // if (i === 2) {
    //   console.log(values)
    // }
    // return
    
    // continue
    if (i % 1000 === 0 || i === stations.length - 1) {
      const q = `INSERT INTO time_between_stop (from_stop_id, to_stop_id, time_period_id, time, version) 
          VALUES ?`
      // console.log(values)
      // return
      await db.query(q, [values])
      console.log(`finish inserting ${i + 1} stations`)
      while (values.length !== 0) {
        values.pop()
      }
      // values = []
    }
  }
  console.log('finish inserting bus transfer time')
  // console.log('filter', counter)
}

async function makeStartPoint() {
  const q1 = `INSERT INTO station (ptx_station_id, name, type)
  VALUES ?`
  const values1 = [[-1, '起點', '']]
  const [result] = await db.query(q1, [values1])
  // console.log(result)
  const stationId = result.insertId
  // return
  const q2 = `INSERT INTO stop (ptx_stop_id, station_id)
    VALUES ?`
  const values2 = [[-1, stationId]]

  await db.query(q2, [values2])
  console.log('finish making start point')
}

async function insertFirstWaitingTime(periodId, version) {
  // const timePeriodMap = await makeTimePeriodMap()
  // return console.log(timePeriodMap)
  const waitingTimeMap = await makeWaitingTimeMap()
  const [result1] = await db.query(
    'SELECT id, ptx_stop_id FROM stop WHERE ptx_stop_id = -1'
  )
  const startId = result1[0].id
  // console.log(startId)
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
    // console.log(ptx_stop_id)
    // console.log(waitingTimeMap)
    // const timePeriodId = timePeriodMap['9-0']
    const waitingTime = waitingTimeMap[ptx_stop_id]
    values.push([fromStopId, toStopId, periodId, waitingTime, version])
  })
  // return console.log(values)
  await db.query(q, [values])
  console.log('finish inserting first waiting time')
}

// insertBusStations()
// insertBusStops()
// insertTimeBetweenStop()
// insertBusTransfer()
// makeStartPoint()
// insertFirstWaitingTime()

module.exports = {
  insertTimeBetweenStop,
  insertBusTransfer,
  insertFirstWaitingTime
}
