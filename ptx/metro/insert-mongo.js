const {getPtxData} = require('../ptx_helper')
const { getMongoData, insertMany } = require('../../model/db/mongodb/mongo_helper')
const { makeLineStationsMap, makeOverlapMap } = require('./metro_map')

async function insertMetroStation() {
  const data = await getPtxData(
    'https://ptx.transportdata.tw/MOTC/v2/Rail/Metro/StationOfLine/TRTC?$top=1000&$format=JSON'
  )
  // console.log(data.length)
  await insertMany('metroStations', data)
}

async function insertMetroIntervalTime() {
  const data = await getPtxData(
    'https://ptx.transportdata.tw/MOTC/v2/Rail/Metro/S2STravelTime/TRTC?$top=1000&$format=JSON'
  )
  // console.log(data.length)
  await insertMany('metroIntervalTime', data)
}

async function insertMetroTransferTime() {
  const data = await getPtxData(
    'https://ptx.transportdata.tw/MOTC/v2/Rail/Metro/LineTransfer/TRTC?$top=1000&$format=JSON'
  )
  // console.log(data.length)
  await insertMany('metroTransferTime', data)
}

async function insertMetroStationPosition() {
  const data = await getPtxData(
    'https://ptx.transportdata.tw/MOTC/v2/Rail/Metro/Station/TRTC?$top=3000&$format=JSON'
  )
  // console.log(data.length)
  await insertMany('metroStationsPosition', data)
}

async function insertMetroFrequency() {
  const data = await getPtxData(
    'https://ptx.transportdata.tw/MOTC/v2/Rail/Metro/Frequency/TRTC?$top=1000&$format=JSON'
  )
  // console.log(data.length)
  await insertMany('metroFrenquency', data)
}

async function insertMetroRoute() {
  const data = await getPtxData(
    'https://ptx.transportdata.tw/MOTC/v2/Rail/Metro/StationOfRoute/TRTC?$top=1000&$format=JSON'
  )
  // console.log(data[0])
  await insertMany("metroRoutes", data)
}

async function insertMetroWaitingTime() {
  const routeFrequencyList = await getMongoData("metroFrenquency")
  const lineStationsMap = await makeLineStationsMap()
  const overlapCountMap = await makeOverlapMap()
  const stationsWaitingTimeMap = {}
  // const stationsWaitingTimes = []
  routeFrequencyList.forEach(({LineID, RouteID, ServiceDay, Headways}) => {
    if (RouteID.split('-')[1] !== '1') return
    let serviceType = ServiceDay.ServiceTag
    // serviceType = serviceType === '平日' ? 'weekdays' : 'weekend'
    const stationIds = lineStationsMap[LineID]
    // console.log(routeFrequency)
    // const stopWaitingTime =  {}
    stationIds.forEach(stationId => {
      // if (stationId === 'G01') console.log(Headways)
      // const overlapCount = overlapCountMap[stationId]
      
      // const stopWaitingTime = 
      
      Headways.forEach((periodData, i) => {
        let period
        // console.log(periodData.StartTime)
        if (ServiceDay.ServiceTag === "假日" && periodData.StartTime === "06:00") {
          period = "weekend"
        } else if (periodData.StartTime === "06:00") {
          period = "weekdays"
        } else if (periodData.PeakFlag === "1") {
          period = "weekdaysPeak"
        } else {
          return
        }
        // peakFlag: period.PeakFlag,
        // startTime: period.StartTime,
        // endTime: period.EndTime,
        // average waiting time =  headwaytime / 2
        // 考慮路線重疊，等車時間減半
        waitingTimeSeconds = (periodData.MinHeadwayMins + periodData.MaxHeadwayMins) / 2 / 2 / overlapCountMap[stationId] * 60
        if (!stationsWaitingTimeMap[stationId]) {
          stationsWaitingTimeMap[stationId] = {stationId, waitingTimes: {}}
        }
        stationsWaitingTimeMap[stationId].waitingTimes[period] = waitingTimeSeconds
      })
      // if (stationId === 'G01') {
      //   console.log(serviceType)
      //   console.log(stopWaitingTimes.length)
      // }
      // if (!stationsWaitingTimeMap[stationId][serviceType]) {
      //   stationsWaitingTimeMap[stationId][serviceType] = stopWaitingTimes
      // }
      // stationsWaitingTimeMap[stationId][serviceType] = stopWaitingTimes
    })
    // metroWaitingTimeMap[LineID].push()
  })
  // for (let stationId in stationsWaitingTimeMap) {
  //   // console.log(stationsWaitingTime)
  //   const stationsWaitingTime = stationsWaitingTimeMap[stationId]
  //   for (let serviceType in stationsWaitingTime) {
  //     // console.log(serviceType)
  //     // stationsWaitingTime[serviceType]
  //     // console.log('stationsWaitingTime[serviceType]: ', stationsWaitingTime[serviceType]);
  //     stationsWaitingTime[serviceType].forEach(waitingTime => {
  //       // stationsWait = waitingTime.waitingTimeSeconds / overlapCountMap[stationId]
  //       let temp = waitingTime.waitingTimeSeconds

  //       // const waitingTimeSeconds = waitingTime.waitingTimeSeconds / 2
  //       //waitingTime.waitingTimeSeconds = waitingTimeSeconds

  //       console.log(stationId, serviceType, waitingTime.startTime, temp, temp/2)
  //       // console.log('waitingTime.waitingTimeSeconds: ', waitingTime.waitingTimeSeconds);
  //       // console.log(overlapCountMap[stationId])
  //       // console.log(waitingTime)
  //       // console.log(waitingTime.waitingTimeSeconds)
  //     })
  //   }
  // }
  // console.log(stationsWaitingTimeMap['G01']['平日'])
  // for (let )
  // console.log('stationsWaitingTimeMap: ', stationsWaitingTimeMap);
  // console.log(Object.values(stationsWaitingTimeMap))


  const stationsWaitingTimes = Object.values(stationsWaitingTimeMap)


  // console.log('stationsWaitingTimes: ', stationsWaitingTimes);
  await insertMany("metroStationWaitingTime", stationsWaitingTimes)
}

// makeMetroWaitingTimeMap()

// async function makeMetroStopIdMap() {
//   const metroStopMap = {}
//   const q = `SELECT id, ptx_stop_id, direction FROM stop 
//     JOIN station
//       ON stop.station_id = station.id
//     WHERE type = metro`
//   const [metroStops] = await db.query(q)
//   metroStops.forEach(({id ,ptx_stop_id}) => {
//     metroStopMap[ptx_stop_id] = id
//   })
// }

insertMetroWaitingTime()

// insertMetroTransferTime()
// insertMetroStationPosition()
// insertMetroFrequency()
// insertMetroRoute()