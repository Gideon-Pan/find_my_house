const { makeHouseMap } = require("../server/models/house_model")
const { makeGraphs } = require("./dijkstra/make_graph")
const Redis = require('./redis')

const walkVelocity = 1.25 / 1.414

let graphs
// let stopIdToNumMap
// let numToStopIdMap
// let houseIdToNumMap
// let numToHouseIdMap
// let houseStopDistanceMap
// let houseStationDistanceMap
// let housePositionMap
// let stopStationMap
// let stationStopMap
// let houseMapCache
async function main() {
  // houseIdToNumMap = JSON.parse(houseIdToNumMapJSON)
      // console.log(houseIdToNumMap)
  // houseStopDistanceMap = JSON.parse(houseStopDistanceMapJSON)
  // stopStationMap = await makeStopStationMap()
  // console.log('Redis.client.connected: ', Redis.client.connected);
  // console.log(Redis.client)
  
  
  // const houseMapJSON = JSON.stringify(houseMap)
  

  // console.log(houseMapCache)
  // return
  const time0_0 = Date.now()
  // graphsForBus = await makeGraph('bus', 2)
  // graphsForMetro = await makeGraph('metro', 2)
  // graphsForMix = await makeGraph('mix', 2)
  graphs = await makeGraphs(2)
  console.log('finish making graph step 0')
  // waitingTimeMaps = await makeWaitingTimeMap(2)
  // waitingTimeMap = waitingTimeMaps[]
  const time0_1 = Date.now()
  console.log(
    'finish making graph:',
    Math.floor(time0_1 - time0_0) / 1000,
    'seconds'
  )

  if (Redis.client.connected) {
    // console.log('interesting')
    await makeHouseMap()
  }

  // if (Redis.client.connected) {
  //   // const maps = await makeHouseStopDistanceMap()
  //   await makeHouseStopDistanceMap()
  // }

  // const maps = await makeHouseStopDistanceMap()
  // stopIdToNumMap = maps.stopIdToNumMap
  // houseIdToNumMap = maps.houseIdToNumMap
  // houseStopDistanceMap = maps.houseStopDistanceMap


  // housePositionMap = maps.housePositionMap

  // const maps = await makeHouseStationDistanceMap()
  // houseIdToNumMap = maps.houseIdToNumMap
  // houseStationDistanceMap = maps.houseStationDistanceMap
  // // console.log(map)
  // const time0_2 = Date.now()
  // console.log(
  //   'finish calculating stop house distance:',
  //   Math.floor(time0_2 - time0_1) / 1000,
  //   'seconds'
  // )
  // console.log(waitingTimeMaps)
  // console.log(graphs)
}

main()

module.exports = {
  graphs,
  walkVelocity
}