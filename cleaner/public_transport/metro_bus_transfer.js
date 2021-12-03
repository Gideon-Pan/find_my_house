const { getDistance } = require('geolib')
const { getMongoData } = require('../../server/models/db/mongo')
const Bus = require('./bus/bus_map')
const Metro = require('./metro/metro_map')
const db = require('../../server/models/db/mysql')

async function busMetroTransfer(periodId, period, version) {
  const metroStations = await getMongoData("metroStationsPosition")
  const metroStopMap = await Metro.makeMetroStopIdMap()
  const busStops = await getMongoData("busStops")
  const busStopMap = await Bus.makePtxIdMap()
  const busWaitingTimeMap = await Bus.makeWaitingTimeMap()
  const metroWaitingTimeMap = await Metro.makeMetroWaitingTimeMap()
  const WALK_VELOCITY = process.env.WALK_VELOCITY

  console.log('finish fetching data')
  const values = []
  metroStations.forEach(station => {
    const {StationID, StationPosition} = station
    busStops.forEach(busStop => {
      const {StopID, StopPosition} = busStop
      const distance = getDistance({latitude: StationPosition.PositionLat, longitude: StationPosition.PositionLon}, 
        {latitude: StopPosition.PositionLat, longitude: StopPosition.PositionLon})
      if (distance < 100) {
        const mysqlMetroStoplId0 = metroStopMap[`${StationID}-0`]
        const mysqlMetroStoplId1 = metroStopMap[`${StationID}-1`]
        const mysqlBusStopId = busStopMap[StopID]
        const walkTime = distance / WALK_VELOCITY
        // estimate as 600 seconds for waiting time if no data provided
        const busWaitingTime = busWaitingTimeMap[StopID] ? busWaitingTimeMap[StopID] : 600
        const metroWaitingTime = metroWaitingTimeMap[StationID][period]

        values.push([mysqlMetroStoplId0, mysqlBusStopId, periodId, walkTime + busWaitingTime, version, distance])
        values.push([mysqlMetroStoplId1, mysqlBusStopId, periodId, walkTime + busWaitingTime, version, distance])
        values.push([mysqlBusStopId, mysqlMetroStoplId0, periodId, walkTime + metroWaitingTime, version, distance])
        values.push([mysqlBusStopId, mysqlMetroStoplId1, periodId, walkTime + metroWaitingTime, version, distance])
      }
    })
    
  })
  const q = 'INSERT INTO time_between_stop (from_stop_id, to_stop_id, time_period_id, time, version, distance) VALUES ?'
  await db.query(q, [values])
  console.log('finish insert trasfer time between metro and bus')
}

module.exports = {
  busMetroTransfer
}