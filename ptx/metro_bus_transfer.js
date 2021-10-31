const { getDistance } = require('geolib')
const { getMongoData } = require('../model/db/mongodb/mongo_helper')
const Bus = require('./bus/bus_map')
const Metro = require('./metro/metro_map')
const db = require('../model/db/mysql/mysql')

// Error!!!
async function busMetroTransfer(periodId, period, version) {
  const metroStations = await getMongoData("metroStationsPosition")
  const metroStopMap = await Metro.makeMetroStopIdMap()
  const busStops = await getMongoData("busStops")
  const busStopMap = await Bus.makePtxIdMap()
  // const timePeriodMap = await Metro.makeTimePeriodMap()
  // const timePeriod = '9-0'
  // const timePeriodId = timePeriodMap[timePeriod]
  const busWaitingTimeMap = await Bus.makeWaitingTimeMap()
  const metroWaitingTimeMap = await Metro.makeMetroWaitingTimeMap()
  // const metroWaitingTime = await getMongoData("metroStationWaitingTime")
  // const metroWaitingTimeMap = await Metro.makeMetroWaitingTimeMap()
  const walkVelocity = 1.25 / 1.414

  console.log('finish fetching data')
  const transferMap = {}
  let counter = 0
  const values = []
  metroStations.forEach(station => {
    const {StationID, StationPosition} = station
    // console.log(StationID)
    busStops.forEach(busStop => {
      const {StopID, StopPosition} = busStop
      // console.log(StopID)
      const distance = getDistance({latitude: StationPosition.PositionLat, longitude: StationPosition.PositionLon}, 
        {latitude: StopPosition.PositionLat, longitude: StopPosition.PositionLon})
      if (distance < 100) {
        // console.log(distance)
        // transferMap = []
        const mysqlMetroStoplId0 = metroStopMap[`${StationID}-0`]
        // console.log('mysqlMetroStoplId0: ', mysqlMetroStoplId0);
        const mysqlMetroStoplId1 = metroStopMap[`${StationID}-1`]
        // console.log('mysqlMetroStoplId1: ', mysqlMetroStoplId1);
        const mysqlBusStopId = busStopMap[StopID]
        // console.log('busStop: ', busStop);
        const walkTime = distance / walkVelocity
        const busWaitingTime = busWaitingTimeMap[StopID] ? busWaitingTimeMap[StopID] : 600
        const metroWaitingTime = metroWaitingTimeMap[StationID][period]
    
        counter++
        values.push([mysqlMetroStoplId0, mysqlBusStopId, periodId, walkTime + busWaitingTime, version, distance])
        values.push([mysqlMetroStoplId1, mysqlBusStopId, periodId, walkTime + busWaitingTime, version, distance])
        values.push([mysqlBusStopId, mysqlMetroStoplId0, periodId, walkTime + metroWaitingTime, version, distance])
        values.push([mysqlBusStopId, mysqlMetroStoplId1, periodId, walkTime + metroWaitingTime, version, distance])
        if (!mysqlMetroStoplId0 || !mysqlMetroStoplId1 || !mysqlBusStopId || !periodId || !walkTime || !busWaitingTime ||! distance) {
          console.log('distance: ', distance);
          console.log('busWaitingTime: ', busWaitingTime);
          console.log('walkTime: ', walkTime);
          console.log('periodId: ', periodId);
          console.log('mysqlBusStopId: ', mysqlBusStopId);
          console.log('mysqlMetroStoplId1: ', mysqlMetroStoplId1);
          console.log('mysqlMetroStoplId0: ', mysqlMetroStoplId0);

        }
        // if (counter === 1) console.log(values)
      }
    })
    
  })
  const q = 'INSERT INTO time_between_stop (from_stop_id, to_stop_id, time_period_id, time, version, distance) VALUES ?'
  // console.log(values)
  // return
  await db.query(q, [values])
  console.log('finish insert trasfer time between metro and bus')
  // console.log(counter)
}

// busMetroTransfer(1)

module.exports = {
  busMetroTransfer
}