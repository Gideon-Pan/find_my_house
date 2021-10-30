const { getPtxData } = require('../ptx_helper')
const { insertMany } = require('../../model/db/mongodb/mongo_helper')

async function insertBusStations() {
  const busStationsTPE = await getPtxData(
    'https://ptx.transportdata.tw/MOTC/v2/Bus/Station/City/Taipei?$top=10000&$format=JSON'
  )
  // await insertMany('busStations', busStationsTPE)
  console.log(busStationsTPE.length)
  const busStationsNTP = await getPtxData(
    'https://ptx.transportdata.tw/MOTC/v2/Bus/Station/City/NewTaipei?$top=10000&$format=JSON'
  )
  console.log(busStationsNTP.length)
  const busStationsAll = busStationsTPE.concat(busStationsNTP)
  console.log(busStationsAll.length)
  await insertMany('busStations', busStationsAll)
  console.log('nice')
}

async function insertBusStops() {
  const busStopsTPE = await getPtxData(
    'https://ptx.transportdata.tw/MOTC/v2/Bus/Stop/City/Taipei?$top=100000&$format=JSON'
  )
  // await insertMany('busStops', busStopsTPE)
  console.log(busStopsTPE.length)
  const busStopsNTP = await getPtxData(
    'https://ptx.transportdata.tw/MOTC/v2/Bus/Stop/City/NewTaipei?$top=100000&$format=JSON'
  )
  console.log(busStopsNTP.length)
  const busStopsAll = busStopsTPE.concat(busStopsNTP)
  console.log(busStopsAll.length)
  await insertMany('busStops', busStopsAll)
  console.log('nice')
}

async function insertbusRoutes() {
  const busRoutesTPE = await getPtxData(
    'https://ptx.transportdata.tw/MOTC/v2/Bus/DisplayStopOfRoute/City/Taipei?$top=10000&$format=JSON'
  )
  console.log(busRoutesTPE.length)
  const busRoutesNTP = await getPtxData(
    'https://ptx.transportdata.tw/MOTC/v2/Bus/DisplayStopOfRoute/City/NewTaipei?$top=10000&$format=JSON'
  )
  console.log(busRoutesNTP.length)
  const busRoutesAll = busRoutesTPE.concat(busRoutesNTP)
  console.log(busRoutesAll.length)
  // busRoutesAll.forEach(route => {
  //   route.Stops.forEach(stop => {
  //     if (stop.StopName.Zh_tw === '丹鳳國小') {
  //       console.log(route.RouteName)
  //     }
  //   })
  // })
  await insertMany('busRoutes', busRoutesAll)
  console.log('done')
}

async function insertBusWaitingTime() {
  const busWaitingTimeTPE = await getPtxData(
    'https://ptx.transportdata.tw/MOTC/v2/Bus/EstimatedTimeOfArrival/City/Taipei?$top=100000&$format=JSON'
  )
  console.log(busWaitingTimeTPE.length)
  const busWaitingTimeNTP = await getPtxData(
    'https://ptx.transportdata.tw/MOTC/v2/Bus/EstimatedTimeOfArrival/City/NewTaipei?$top=100000&$format=JSON'
  )
  console.log(busWaitingTimeNTP.length)
  // const busStopsNTP = await getPtxData("https://ptx.transportdata.tw/MOTC/v2/Bus/Stop/City/NewTaipei?$top=100000&$format=JSON")
  // console.log(busStopsNTP.length)
  // const busStopsAll = busStopsTPE.concat(busStopsNTP)
  // console.log(busStopsAll.length)
  const busWaitingTimeAll = busWaitingTimeTPE.concat(busWaitingTimeNTP)
  console.log(busWaitingTimeAll.length)
  await insertMany('busWaitingTime', busWaitingTimeAll)
  console.log('done')
}

async function insertBusWaitingTimeTiny() {
  const busWaitingTimeTPE = await getPtxData(
    'https://ptx.transportdata.tw/MOTC/v2/Bus/EstimatedTimeOfArrival/City/Taipei?$top=100000&$format=JSON'
  )
  console.log(busWaitingTimeTPE.length)
  const busWaitingTimeNTP = await getPtxData(
    'https://ptx.transportdata.tw/MOTC/v2/Bus/EstimatedTimeOfArrival/City/NewTaipei?$top=100000&$format=JSON'
  )
  console.log(busWaitingTimeNTP.length)
  // const busStopsNTP = await getPtxData("https://ptx.transportdata.tw/MOTC/v2/Bus/Stop/City/NewTaipei?$top=100000&$format=JSON")
  // console.log(busStopsNTP.length)
  // const busStopsAll = busStopsTPE.concat(busStopsNTP)
  // console.log(busStopsAll.length)
  const busWaitingTimeAll = busWaitingTimeTPE.concat(busWaitingTimeNTP)
  const data = busWaitingTimeAll.map(
    ({ StopID, Direction, UpdateTime, EstimateTime, StopStatus }) => ({
      StopID,
      Direction,
      EstimateTime,
      StopStatus,
      UpdateTime
    })
  )
  console.log(data.length)
  await insertMany('busWaitingTime', data)
  console.log('finsish insert bus waiting time data')
}

async function insertBusAvgWaitingTime(busAvgWaitingTime) {
  // await insertMany('busAvgWaitingTime', busAvgWaitingTime)
  // console.log('done')
}

module.exports = {
  insertBusStations,
  insertBusStops,
  insertBusWaitingTime,
  insertBusWaitingTimeTiny,
  insertbusRoutes,
  insertBusAvgWaitingTime
}
