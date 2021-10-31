const db = require('../model/db/mysql/mysql')
const Bus = require('./bus/insert_mysql')
const Metro = require('./metro/insert-mysql')
// const { makeTimePeriodMap } = require('./metro/metro_map')
const { makePeriodMap } = require('./map')
const { busMetroTransfer } = require('./metro_bus_transfer')

const periods = ['weekdays', 'weekdaysPeak', 'weekend']
const busVelocityMap = {
  weekdays: 25,
  weekdaysPeak: 15,
  weekend: 30
}
function convertUnit(velocityMph) {
  return velocityMph / 3.6
}

// version1: estimate bus by substract waiting time, ignore metro waiting time
// version2: test separate insert
// version3: optimize version1

async function insertTimeBetweenStop(version) {
  const periodToIdMap = await makePeriodMap()
  for (let period of periods) {
    const periodId = periodToIdMap[period]
    // console.log(periodId)
    console.log(period)
    // console.log(periodId)
    // return

    await Bus.insertTimeBetweenStop(
      periodId,
      convertUnit(busVelocityMap[period]),
      version
    )
    // TODO (waiting time for bus) should depends on period
    await Bus.insertBusTransfer(periodId, version)
    // TODO (waiting time for bus) should depends on period
    await Bus.insertFirstWaitingTime(periodId, version)
    // TODO
    await Metro.insertMetroIntervalTime(periodId, version)
    await Metro.insertMetroTransferTime(periodId, version)
    // last TODO 小碧潭&新北投
    await Metro.insertFirstWaitingTime(periodId, period, version)
    // TODO (waiting time for bus) should depends on period
    await busMetroTransfer(periodId, period, version)
    console.log('finish inserting period', period)
  }
  console.log('finish insert all for version', version)
}

insertTimeBetweenStop(2)


// follwing is for testing, keep it untill productionr

// Bus.insertTimeBetweenStop(579, convertUnit(busVelocityMap.weekdays), 2)

// Bus.insertTimeBetweenStop(
//   579,
//   convertUnit(busVelocityMap['weekdays']),
//   2
// )
// TODO (waiting time for bus) should depends on period
// Bus.insertBusTransfer(579, 2)
// TODO (waiting time for bus) should depends on period
// Bus.insertFirstWaitingTime(579, 2)
// // TODO
// Metro.insertMetroIntervalTime(579, 2)
// Metro.insertMetroTransferTime(579, 2)
// // last TODO 小碧潭&新北投
// Metro.insertFirstWaitingTime(579, 'weekdays', 2)
// // TODO (waiting time for bus) should depends on period
// busMetroTransfer(579, 'weekdays', 2)

// insertTimeBetweenStop()
