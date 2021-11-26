const { getMongoData, insertMany } = require("../../server/models/db/mongo")

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
      const {waitingTime} =
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
  await insertMany('busAvgWaitingTime_1030', avgTimeDataList)
}

async function createBusAvgIntervalTime() {
  const waitingTimeList = await getMongoData('busWaitingTime')
  const waitingTimeMap = makeWaitingTimeMap(waitingTimeList)
  const waitingTimeMapNew = makeWaitingTimeMapNew(waitingTimeList)
  const routes = await getMongoData('busRoutes')
  const busIntervalTimeMap = {}
  console.log('finsish fetching data')
  routes.forEach((route) => {
    for (let i = 0; i < route.Stops.length - 1; i++) {
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

          if (!interval) console.log('error')

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
  })
  const busIntervalTimeData = []
  for (let dataList of Object.values(busIntervalTimeMap)) {
    let totalIntervalTime = 0
    let validCounter = 0
    for (let data of dataList) {
      if (!data.intervalTime) continue
      totalIntervalTime += data.intervalTime
      validCounter++
    }
    if (validCounter < dataList.length / 2) continue
    const { fromStopId, toStopId } = dataList[0]
    busIntervalTimeData.push({
      fromStopId,
      toStopId,
      avgIntervalTime: totalIntervalTime / validCounter,
      dataAmount: validCounter
    })
  }
  await insertMany('busAvgIntervalTime', busIntervalTimeData)
  process.exit()
}
