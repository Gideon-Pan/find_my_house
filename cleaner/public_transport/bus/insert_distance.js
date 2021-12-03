const { getDistance } = require('geolib')
const { getMongoData, insertMany } = require('../../server/models/db/mongo')
const { makePostionMap } = require("./bus_map")

async function deleteLackInfoStops(routes) {
  const positionMap = await makePostionMap()
  routes.forEach(route => {
    const stops = route.Stops
    for (let i = 0; i < stops.length; i++) {
      if (!positionMap[stops[i].StopID]){
        stops.splice(i, 1)
        i--
      }
    }
  })
}

async function insertBusStopIntervalDistance() {
  const distanceList = []
  const positionMap = await makePostionMap()
  const routes = await getMongoData('busRoutes')
  await deleteLackInfoStops(routes)
  
  routes.forEach(route => {
    const stops = route.Stops
    for (let i = 0; i < stops.length - 1; i ++) {
      const position1 = positionMap[stops[i].StopID]
      let position2 = positionMap[stops[i + 1].StopID]
      if (!position2) {
        stops.splice(i + 1, 1)
        i--
        continue
      }
      
      const distance = getDistance({ latitude: position1.PositionLat, longitude: position1.PositionLon },
        { latitude: position2.PositionLat, longitude: position2.PositionLon })
      distanceList.push({
        fromStopId: stops[i].StopID,
        toStopId: stops[i + 1].StopID,
        distance
      })
    }
  })
  await insertMany("busStopIntervalDistance", distanceList)
  process.exit()
}