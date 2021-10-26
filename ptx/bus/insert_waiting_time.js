const {
  insertBusWaitingTime,
  insertBusWaitingTimeTiny,
  insertbusRoutes,
  insertBusStations,
  insertBusStops
} = require('./insert-bus-data')
const { getMongoData } = require('../model/mongo/mongo-helper')

// insertbusRoutes()
const sleep = (t) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve()
    }, t * 1000)
  })
}

async function insertSchedule(sleepSecond) {
  while (1) {
    try {
      await insertBusWaitingTime()
      const date = new Date()
      const hour = date.getHours()
      const minute = date.getMinutes()
      console.log(`timeStamp: ${hour}:${minute}`)
      // const date = Date.now()
      // console.log(date.get)
      // const sleepMin = 1
      // const sleepSecond = sleepMin * 60
      // const sleepSecond = 5
      await sleep(sleepSecond)
    } catch (e) {
      console.log(e)
    }
  }
}

async function main() {
  // insertBusStations()
  await insertSchedule(45)
  // await insertBusWaitingTime()
  // const data = await getMongoData("busStations")
  // let maxLength = 0
  // let maxStation
  // // console.log(data.length)
  // data.forEach(station => {
  //   if (station.StationName.Zh_tw.length > maxLength) {
  //     maxLength = station.StationName.Zh_tw.length
  //     maxStation = station.StationName.Zh_tw
  //   }
  // })
  // console.log(maxLength)
  // console.log(maxStation)
  // console.log(data)
}

main()

// insertBusStations()
// insertBusStops()