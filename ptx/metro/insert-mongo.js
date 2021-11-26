const { getMongoData, insertMany } = require('../../server/models/db/mongo')
const {getPtxData} = require('../ptx_helper')
const { makeLineStationsMap, makeOverlapMap } = require('./metro_map')

async function insertMetroStation() {
  const data = await getPtxData(
    'https://ptx.transportdata.tw/MOTC/v2/Rail/Metro/StationOfLine/TRTC?$top=1000&$format=JSON'
  )
  await insertMany('metroStations', data)
}

async function insertMetroIntervalTime() {
  const data = await getPtxData(
    'https://ptx.transportdata.tw/MOTC/v2/Rail/Metro/S2STravelTime/TRTC?$top=1000&$format=JSON'
  )
  await insertMany('metroIntervalTime', data)
}

async function insertMetroTransferTime() {
  const data = await getPtxData(
    'https://ptx.transportdata.tw/MOTC/v2/Rail/Metro/LineTransfer/TRTC?$top=1000&$format=JSON'
  )
  await insertMany('metroTransferTime', data)
}

async function insertMetroStationPosition() {
  const data = await getPtxData(
    'https://ptx.transportdata.tw/MOTC/v2/Rail/Metro/Station/TRTC?$top=3000&$format=JSON'
  )
  await insertMany('metroStationsPosition', data)
}

async function insertMetroFrequency() {
  const data = await getPtxData(
    'https://ptx.transportdata.tw/MOTC/v2/Rail/Metro/Frequency/TRTC?$top=1000&$format=JSON'
  )
  await insertMany('metroFrenquency', data)
}

async function insertMetroRoute() {
  const data = await getPtxData(
    'https://ptx.transportdata.tw/MOTC/v2/Rail/Metro/StationOfRoute/TRTC?$top=1000&$format=JSON'
  )
  await insertMany("metroRoutes", data)
}

async function insertMetroWaitingTime() {
  const routeFrequencyList = await getMongoData("metroFrenquency")
  const lineStationsMap = await makeLineStationsMap()
  const overlapCountMap = await makeOverlapMap()
  const stationsWaitingTimeMap = {}
  routeFrequencyList.forEach(({LineID, RouteID, ServiceDay, Headways}) => {
    if (RouteID.split('-')[1] !== '1') return
    let serviceType = ServiceDay.ServiceTag
    const stationIds = lineStationsMap[LineID]
    stationIds.forEach(stationId => {
      Headways.forEach((periodData, i) => {
        let period
        if (ServiceDay.ServiceTag === "假日" && periodData.StartTime === "06:00") {
          period = "weekend"
        } else if (periodData.StartTime === "06:00") {
          period = "weekdays"
        } else if (periodData.PeakFlag === "1") {
          period = "weekdaysPeak"
        } else {
          return
        }
        // 考慮路線重疊，等車時間減半
        waitingTimeSeconds = (periodData.MinHeadwayMins + periodData.MaxHeadwayMins) / 2 / 2 / overlapCountMap[stationId] * 60
        if (!stationsWaitingTimeMap[stationId]) {
          stationsWaitingTimeMap[stationId] = {stationId, waitingTimes: {}}
        }
        stationsWaitingTimeMap[stationId].waitingTimes[period] = waitingTimeSeconds
      })
    })
  })
  const stationsWaitingTimes = Object.values(stationsWaitingTimeMap)
  await insertMany("metroStationWaitingTime", stationsWaitingTimes)
}

async function makeMetroStopIdMap() {
  const metroStopMap = {}
  const q = `SELECT id, ptx_stop_id, direction FROM stop 
    JOIN station
      ON stop.station_id = station.id
    WHERE type = metro`
  const [metroStops] = await db.query(q)
  metroStops.forEach(({id ,ptx_stop_id}) => {
    metroStopMap[ptx_stop_id] = id
  })
}

insertMetroWaitingTime()