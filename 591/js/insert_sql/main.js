const { getMongo, getHouseIds, dropMongoCollection } = require('../../../server/models/db/mongo')
const { cleanseData } = require('../cleanse/cleanse')
const { today, yesterday, deleteDateComplete } = require('./time')
const { insertStationHouseDistance } = require('./station_house_distance')
const {
  deleteHouse,
  insertHouse,
  insertHouseTag,
  insertNewLifeFunction,
  insertHouseLifeFunction,
  deleteHouseMapCache,
  setHouseMapCache,
} = require('./update_helper')

async function updateAllTables(cleansedDataOld, cleansedDataNew, today) {
  const cleansedData = await getHouseIds('591_cleansed', `${today}houseDatacleansed`)
  if (cleansedData.length === 0) {
    console.log('start cleansing...')
    await cleanseData(`houseDataRaw${today}`, today)
    console.log('finish cleansing today data')
  }

  const oldIds = await getHouseIds('591_cleansed', cleansedDataOld)
  const newIds = await getHouseIds('591_cleansed', cleansedDataNew)
  if (newIds.length / oldIds.length < 0.5) {
    return console.log('something wrong for new data!!!')
  }
  const housesNew = await getMongo('591_cleansed', cleansedDataNew)
  console.log('finish fetch new cleansed data')

  console.log('start deleting houses...')
  await deleteHouse(cleansedDataOld, cleansedDataNew)

  console.log('start inserting houses...')
  await insertHouse(housesNew)

  console.log('start inserting house tags...')
  await insertHouseTag(cleansedDataNew)

  console.log('start insert new life function...')
  await insertNewLifeFunction(cleansedDataNew)

  console.log('start inserting house life function...')
  await insertHouseLifeFunction(cleansedDataNew)

  console.log('finish update all house tables~')
  await insertStationHouseDistance()

  // delete house map cache and build cache
  await deleteHouseMapCache()
  await setHouseMapCache()
  if (!process.argv[2]) {
    await dropMongoCollection('591_cleansed', `${deleteDateComplete}houseDatacleansed`)
  }
  process.exit()
}

if (process.argv[2]) {
  updateAllTables(`${process.argv[2]}houseDatacleansed`, `${process.argv[3]}houseDatacleansed`, process.argv[3])
} else {
  updateAllTables(`${yesterday}houseDatacleansed`, `${today}houseDatacleansed`, today)
}

