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

function makeWaitingTimeMapNew(waitingTimeList) {
  const map = {}
  for (let i = 0; i < waitingTimeList.length; i++) {
    const waitingTime = waitingTimeList[i]

    if (map[`${waitingTime.StopID}-${waitingTime.Direction}`]) {
      map[`${waitingTime.StopID}-${waitingTime.Direction}`].push({
        stopId: waitingTime.StopID,
        direction: waitingTime.Direction,
        dataTime: waitingTime.UpdateTime,
        waitingTime: waitingTime.EstimateTime,
        stopStatus: waitingTime.StopStatus
      })
      continue
    }
    map[`${waitingTime.StopID}-${waitingTime.Direction}`] = [
      {
        stopId: waitingTime.StopID,
        direction: waitingTime.Direction,
        dataTime: waitingTime.UpdateTime,
        waitingTime: waitingTime.EstimateTime,
        stopStatus: waitingTime.StopStatus
      }
    ]
  }
  return map
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

async function makeDistanceMap() {
  const distanceMap = {}
  const distanceList = await getMongoData('busStopIntervalDistance')
  distanceList.forEach(({fromStopId, toStopId, distance}) => {
    distanceMap[`${fromStopId}-${toStopId}`] = distance
  })
  // console.log(distanceMap)
  return distanceMap
}

// makeDistanceMap()
async function makeStopRouteMap() {
  const stopRouteMap = {}
  const routes = await getMongoData('busRoutes')
  routes.forEach(route => {
    route.Stops.forEach((stop, i) => {
      // console.log(stop.StopID)
      // if (stop.StopID === "161601") {
      //   console.log(route.RouteID)
      //   console.log(route.Direction)
      //   console.log(i)
      // }
      stopRouteMap[stop.StopID] = route.RouteID
    })
  })
  // console.log(stopRouteMap)
  return stopRouteMap
}


module.exports = {
  makePtxIdMap,
  makeStopStationMap,
  makeWaitingTimeMap,
  makePostionMap,
  makeDistanceMap,
  makeStopRouteMap,
  makeWaitingTimeMapNew
}