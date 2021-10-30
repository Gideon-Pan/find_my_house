// const getPtxData = require('../metro-ptx')
const { insertBusAvgWaitingTime } = require('./insert_mongo')
const { insertMany, getMongoData } = require('../../model/db/mongodb/mongo_helper')

// const timeStamp = Date.now()
// console.log(timeStamp)

function makeWaitingTimeMap(waitingTimeList) {
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


function makeWaitingTimeMapNew(waitingTimeList) {
  const map = {}
  for (let i = 0; i < waitingTimeList.length; i++) {
    const waitingTime = waitingTimeList[i]

    if (!map[`${waitingTime.StopID}-${waitingTime.Direction}`]) {
      map[`${waitingTime.StopID}-${waitingTime.Direction}`] = {}
    }
    map[`${waitingTime.StopID}-${waitingTime.Direction}`][
      waitingTime.UpdateTime
    ] = {
      stopId: waitingTime.StopID,
      direction: waitingTime.Direction,
      dataTime: waitingTime.UpdateTime,
      waitingTime: waitingTime.EstimateTime,
      stopStatus: waitingTime.StopStatus
    }
  }
  return map
}

async function createBusAvgWaitingTime() {
  const waitingTimeList = await getMongoData('busWaitingTime')
  console.log('finsish fetching data')
  const map = makeWaitingTimeMap(waitingTimeList)
  const avgTimeDataList = Object.values(map).map((stopData) => {
    const { stopId, direction } = stopData[0]
    const avgTimeData = {
      stopId,
      direction
    }
    let totalTime = 0
    let validCounter = 0
    for (let i = 0; i < stopData.length; i++) {
      const { stopId, direction, dataTime, waitingTime, stopStatus } =
        stopData[i]
      if (waitingTime) {
        totalTime += waitingTime
        validCounter++
      }
    }
    const avgWaitingTime = totalTime / validCounter
    avgTimeData.avgWaitingTime = avgWaitingTime
    avgTimeData.dataAmount = validCounter
    return avgTimeData
  })
  // await insertBusAvgWaitingTime(avgTimeDataList)
  await insertMany('busAvgWaitingTime_1030', avgTimeDataList)
  // console.log('done')
}

// createBusAvgWaitingTime()

async function createBusAvgIntervalTime() {
  const waitingTimeList = await getMongoData('busWaitingTime')
  const waitingTimeMap = makeWaitingTimeMap(waitingTimeList)
  const waitingTimeMapNew = makeWaitingTimeMapNew(waitingTimeList)
  // console.log('waitingTimeMapNew: ', waitingTimeMapNew);
  const routes = await getMongoData('busRoutes')
  // console.log(waitingTimeMapNew["170055-0"]);
  // console.log(waitingTimeMapNew["170056-0"])
  const busIntervalTimeMap = {}
  console.log('finsish fetching data')
  routes.forEach((route) => {
    // const stopTimeMap = {}
    for (let i = 0; i < route.Stops.length - 1; i++) {
      // console.log(`${route.Stops[i + 1].StopID}-${route.Direction}`)
      // console.log(route.RouteID)

      if (
        !waitingTimeMapNew[`${route.Stops[i + 1].StopID}-${route.Direction}`] ||
        !waitingTimeMapNew[`${route.Stops[i].StopID}-${route.Direction}`]
      ) {
        continue
      }

      // iterate waiting time history for single stop-direction
      for (
        let j = 0;
        j <
        waitingTimeMap[`${route.Stops[i].StopID}-${route.Direction}`].length;
        j++
      ) {
        const dataTime =
          waitingTimeMap[`${route.Stops[i].StopID}-${route.Direction}`][j]
            .dataTime
        // console.log(dataTime)
        if (!dataTime) continue
        const dataWaitingTimeFrom =
          waitingTimeMap[`${route.Stops[i].StopID}-${route.Direction}`][j]
        const dataWaitingTimeTo =
          waitingTimeMapNew[`${route.Stops[i + 1].StopID}-${route.Direction}`][
            dataTime
          ]
        if (!dataWaitingTimeFrom || !dataWaitingTimeTo) continue
        const waitingTimeFrom = dataWaitingTimeFrom.waitingTime
        const waitingTimeTo = dataWaitingTimeTo.waitingTime
        if (!waitingTimeFrom || !waitingTimeTo) continue
        if (waitingTimeTo > waitingTimeFrom) {
          const interval = waitingTimeTo - waitingTimeFrom
          if (!interval) console.log('waht')
          if (
            !busIntervalTimeMap[
              `${route.Stops[i].StopID}-${route.Stops[i + 1].StopID}`
            ]
          ) {
            busIntervalTimeMap[
              `${route.Stops[i].StopID}-${route.Stops[i + 1].StopID}`
            ] = [
              {
                fromStopId: route.Stops[i].StopID,
                toStopId: route.Stops[i + 1].StopID,
                intervalTime: waitingTimeTo - waitingTimeFrom,
                dataTime
              }
            ]
            continue
          }
          busIntervalTimeMap[
            `${route.Stops[i].StopID}-${route.Stops[i + 1].StopID}`
          ].push({
            fromStopId: route.Stops[i].StopID,
            toStopId: route.Stops[i + 1].StopID,
            intervalTime: waitingTimeTo - waitingTimeFrom,
            dataTime
          })
        }
      }
    }
    // console.log('route: ', route.RouteID);
  })
  const busIntervalTimeData = []
  console.log(Object.values(busIntervalTimeMap).length)
  for (let dataList of Object.values(busIntervalTimeMap)) {
    let totalIntervalTime = 0
    let validCounter = 0
    for (let data of dataList) {
      if (!data.intervalTime) continue
      totalIntervalTime += data.intervalTime
      validCounter++
    }
    // console.log((validCounter < Object.values(busIntervalTimeMap).length / 2))
    if (validCounter < dataList.length / 2) continue
    const { fromStopId, toStopId } = dataList[0]
    // console.log(validCounter)
    busIntervalTimeData.push({
      fromStopId,
      toStopId,
      avgIntervalTime: totalIntervalTime / validCounter,
      dataAmount: validCounter
    })
    // console.log('fromStopId: ', dataList[0].fromStopId);
    // console.log('toStopId: ', dataList[0].toStopId);
  }
  // console.log(busIntervalTimeData)
  await insertMany('busAvgIntervalTime', busIntervalTimeData)
  process.exit()
}

// createBusAvgIntervalTime()

// createBusAvgWaitingTime()

// const time = '2021-10-20T19:02:35+08:00'
// var date = new Date(time);
// var weekday = date.getDay();
// var min = date.getMinutes();
// var hour = date.getHours();
