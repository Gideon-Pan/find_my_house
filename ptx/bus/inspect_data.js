const { getMongoData } = require('../../model/db/mongodb/mongo_helper')

async function countStops() {
  const routes = await getMongoData('busRoutes')
  let counter = 0
  routes.forEach((route) => {
    counter += route.Stops.length
  })
  // console.log(counter)
  console.log('total stops by routes', counter)
}

async function getStops() {
  const stops = await getMongoData('busStops')
  console.log('total stops: ', stops.length)
}

async function main() {
  const map = {}
  const stops = await getMongoData('busStops')
  stops.forEach((stop) => {
    map[stop.StopID] = stop
  })
  console.log(Object.keys(map).length)
  const routes = await getMongoData('busRoutes')
  let counter = 0
  routeMap = {}
  qqMap = {}
  routes.forEach((route) => {
    routeMap[route.RouteID] = true
    route.Stops.forEach((stop) => {
      if (!map[stop.StopID]) {
        // console.log(map[stop.StopID])
        console.log('route id:', route.RouteID)
        // console.log()
        console.log('stop id:', stop.StopID)
        qqMap[route.RouteID] = true
        counter++
      }
    })
  })
  console.log(counter)
  console.log('number of incomplete routes:', Object.keys(qqMap).length)
  console.log('total routes:', Object.keys(routeMap).length)
}

async function checkStopAndStation() {
  const stops = await getMongoData('busStops')
  console.log('total stops:', stops.length)
  const stations = await getMongoData('busStations')
  let counter = 0
  stations.forEach((station) => {
    counter += station.Stops.length
  })
  console.log('total stops of stations:', counter)
}

// checkStopAndStation()

async function checkRoute() {
  const routes = await getMongoData('busRoutes')
  routes.forEach(route => {
    route.Stops.forEach((stop, i) => {
      // console.log(stop.StopID)
      if (stop.StopID === "161601") {
        console.log(route.RouteID)
        console.log(route.Direction)
        console.log(i)
      }
    })
  })
}

// checkRoute()

// toStopIdPtx:  161601
// fromStopIdPtx:  161600
// station : 71427

// main()
// countStops()
