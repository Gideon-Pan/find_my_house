const Bus = require('./bus/insert_mysql')
const Metro = require('./metro/insert-mysql')
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

// version1: estimate bus interval time by substract waiting time, ignore metro waiting time
// version2: estimate bus interval time by displacement between two stops

// insert graph edges into sql
async function insertTimeBetweenStop(version) {
  const periodToIdMap = await makePeriodMap()
  for (let period of periods) {
    const periodId = periodToIdMap[period]
    await Bus.insertTimeBetweenStop(
      periodId,
      convertUnit(busVelocityMap[period]),
      version
    )
    await Bus.insertBusTransfer(periodId, version)
    await Bus.insertFirstWaitingTime(periodId, version)
    await Metro.insertMetroIntervalTime(periodId, version)
    await Metro.insertMetroTransferTime(periodId, version)
    await Metro.insertFirstWaitingTime(periodId, period, version)
    await busMetroTransfer(periodId, period, version)
    console.log('finish inserting period', period)
  }
  console.log('finish insert all for version', version)
}

// follwing is for testing
async function test() {
  Bus.insertTimeBetweenStop(579, convertUnit(busVelocityMap.weekdays), 2)

  Bus.insertTimeBetweenStop(
    579,
    convertUnit(busVelocityMap['weekdays']),
    2
  )
  Bus.insertBusTransfer(579, 2)
  Bus.insertFirstWaitingTime(579, 2)
  Metro.insertMetroIntervalTime(579, 2)
  Metro.insertMetroTransferTime(579, 2)
  Metro.insertFirstWaitingTime(579, 'weekdays', 2)
  busMetroTransfer(579, 'weekdays', 2)
  insertTimeBetweenStop()
}


