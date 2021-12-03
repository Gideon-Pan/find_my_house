const { insertBusWaitingTime } = require('./insert_mongo')

const sleep = (t) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve()
    }, t * 1000)
  })
}

async function insertSchedule(sleepSecond, collection) {
  while (1) {
    try {
      await insertBusWaitingTime(collection)
      const date = new Date()
      const hour = date.getHours()
      const minute = date.getMinutes()
      console.log(`timeStamp: ${hour}:${minute}`)
      await sleep(sleepSecond)
    } catch (e) {
      console.log(e)
    }
  }
}
