const  { get591MongoData, getMongoData, insertMany } = require("../../model/db/mongodb/mongo_helper")
const { getDistance } = require('geolib')
const { makePostionMap } = require("./bus_map")



// makePostionMap()
async function deleteLackInfoStops(routes) {
  // routes = await getMongoData('busRoutes')
  const positionMap = await makePostionMap()
  // console.log('dsf')
  let counter = 0
  let total = 0
  routes.forEach(route => {
    const stops = route.Stops
    // console.log(stops)
    // return
    for (let i = 0; i < stops.length; i++) {
      total++
      if (!positionMap[stops[i].StopID]){
        // console.log(stops[i].StopID)
        stops.splice(i, 1)
        i--
      }
    }
  })
  // console.log(counter)
  // console.log(total)
  // return routes
}

// deleteLackInfoStops()

async function insertBusStopIntervalDistance() {
  // console.log('jeje')
  const distanceList = []
  const positionMap = await makePostionMap()
  const routes = await getMongoData('busRoutes')
  // await deleteLackInfoStops(routes)
  await deleteLackInfoStops(routes)
  console.log('start')
  routes.forEach(route => {
    const stops = route.Stops
    for (let i = 0; i < stops.length - 1; i ++) {
      // console.log(stops[i])
      const position1 = positionMap[stops[i].StopID]
      // console.log(position1)
      
      let position2 = positionMap[stops[i + 1].StopID]
      if (!position2) {
        stops.splice(i + 1, 1)
        i--
        continue
      }
      
      const distance = getDistance({ latitude: position1.PositionLat, longitude: position1.PositionLon },
        { latitude: position2.PositionLat, longitude: position2.PositionLon })
      // distanceMap[`${stops[i].StopID}-${stops[i + 1].StopID}`] = {

      // }
      distanceList.push({
        fromStopId: stops[i].StopID,
        toStopId: stops[i + 1].StopID,
        distance
      })
      // distanceList.push({
      //   fromStopId: stops[i + 1].StopID,
      //   toStopId: stops[i].StopID,
      //   distance
      // })
    }
  })
// insert into mongo
  // console.log(distanceList)
  await insertMany("busStopIntervalDistance", distanceList)
  process.exit()
}

// insertBusStopIntervalDistance()
// console.log('a')

// async function insertBusStopIntervalDistance() {
  
// }