const { insertMany, getMongoData } = require('../../server/models/db/mongo')
const { getPtxData } = require('../ptx_helper')
const { makeWaitingTimeMapNew } = require('./bus_map')

async function insertBusStations() {
  const busStationsTPE = await getPtxData(
    'https://ptx.transportdata.tw/MOTC/v2/Bus/Station/City/Taipei?$top=10000&$format=JSON'
  )
  const busStationsNTP = await getPtxData(
    'https://ptx.transportdata.tw/MOTC/v2/Bus/Station/City/NewTaipei?$top=10000&$format=JSON'
  )
  const busStationsAll = busStationsTPE.concat(busStationsNTP)
  await insertMany('busStations', busStationsAll)
}

async function insertBusStops() {
  const busStopsTPE = await getPtxData(
    'https://ptx.transportdata.tw/MOTC/v2/Bus/Stop/City/Taipei?$top=100000&$format=JSON'
  )
  const busStopsNTP = await getPtxData(
    'https://ptx.transportdata.tw/MOTC/v2/Bus/Stop/City/NewTaipei?$top=100000&$format=JSON'
  )
  const busStopsAll = busStopsTPE.concat(busStopsNTP)
  await insertMany('busStops', busStopsAll)
}

async function insertbusRoutes() {
  const busRoutesTPE = await getPtxData(
    'https://ptx.transportdata.tw/MOTC/v2/Bus/DisplayStopOfRoute/City/Taipei?$top=10000&$format=JSON'
  )
  const busRoutesNTP = await getPtxData(
    'https://ptx.transportdata.tw/MOTC/v2/Bus/DisplayStopOfRoute/City/NewTaipei?$top=10000&$format=JSON'
  )
  const busRoutesAll = busRoutesTPE.concat(busRoutesNTP)
  await insertMany('busRoutes', busRoutesAll)
}

async function insertBusWaitingTime(collection) {
  const busWaitingTimeTPE = await getPtxData(
    'https://ptx.transportdata.tw/MOTC/v2/Bus/EstimatedTimeOfArrival/City/Taipei?$top=100000&$format=JSON'
  )
  const busWaitingTimeNTP = await getPtxData(
    'https://ptx.transportdata.tw/MOTC/v2/Bus/EstimatedTimeOfArrival/City/NewTaipei?$top=100000&$format=JSON'
  )
  const busWaitingTimeAll = busWaitingTimeTPE.concat(busWaitingTimeNTP)
  await insertMany(collection, busWaitingTimeAll)
}

async function insertBusWaitingTimeTiny() {
  const busWaitingTimeTPE = await getPtxData(
    'https://ptx.transportdata.tw/MOTC/v2/Bus/EstimatedTimeOfArrival/City/Taipei?$top=100000&$format=JSON'
  )
  const busWaitingTimeNTP = await getPtxData(
    'https://ptx.transportdata.tw/MOTC/v2/Bus/EstimatedTimeOfArrival/City/NewTaipei?$top=100000&$format=JSON'
  )
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
  await insertMany('busWaitingTime', data)
  console.log('finsish insert bus waiting time data')
}

async function insertBusAvgWaitingTime(fromCollection, period) {
  const waitingTimes = await getMongoData(fromCollection)
  console.log('finsish fetching data')
  const waitingTimeMap = makeWaitingTimeMapNew(waitingTimes)
  const avgTimeDataList = Object.values(waitingTimeMap).map((stopData) => {
    const { stopId } = stopData[0]
    const avgTimeData = {stopId}
    let totalTime = 0
    let validCounter = 0
    for (let i = 0; i < stopData.length; i++) {
      const {  waitingTime } = stopData[i]
      if (waitingTime) {
        totalTime += waitingTime
        validCounter++
      }
    }
    const avgWaitingTime = totalTime / validCounter
    avgTimeData.period = period
    avgTimeData.avgWaitingTime = avgWaitingTime
    avgTimeData.dataAmount = validCounter
    return avgTimeData
  })

  await insertMany('busAvgWaitingTimeV2', avgTimeDataList)
}

async function insertBusAvgWaitingTimeAll() {
  const collections = [
    'busWaitingTimeWeekdays',
    'busWaitingTimeWeekdaysPeak',
    'busWaitingTimeWeekend'
  ]
  const periods = ['weekdays', 'weekdaysPeak', 'weekend']
  for (let i = 0; i < periods.length; i++) {
    console.log('start inserting period', periods[i])
    await insertBusAvgWaitingTime(collections[i], periods[i])
    console.log('finish inserting period', periods[i])
  }
}

insertBusAvgWaitingTimeAll()

module.exports = {
  insertBusStations,
  insertBusStops,
  insertBusWaitingTime,
  insertBusWaitingTimeTiny,
  insertbusRoutes,
  insertBusAvgWaitingTime
}
