const { getMongo } = require('../../../server/models/db/mongo')
const { cleanseData } = require('../cleanse/cleanse')
const { today, yesterday } = require('../time')
const {
  deleteHouse,
  insertHouse,
  insertHouseTag,
  insertNewLifeFunction,
  insertHouseLifeFunction,
} = require('./update_helper')

//deleteHouse(`${yesterday}houseDatacleansed`, `${today}houseDatacleansed`)

async function updateAllTables(cleansedDataOld, cleansedDataNew) {
  console.log('start cleansing')
  await cleanseData(`houseDataRaw${today}`)
  console.log('finish cleansing today data')
  // console.log(today)
  const housesOld = await getMongo('591_cleansed', cleansedDataOld)
  console.log('finish fetch old houses')
  console.log(housesOld.length)
	const housesNew = await getMongo('591_cleansed', cleansedDataNew)
  console.log('finish fetch new houses')
	console.log(housesNew.length)
  if (housesNew.length / housesOld.length < 0.1) {
    return console.log('something wrong for new data')
  }
  
  console.log('start deleting houses')
  await deleteHouse(cleansedDataOld, cleansedDataNew)
  // const housesToInsert = await getMongo('591_cleansed', cleansedDataNew)
  console.log('start inserting houses')
  await insertHouse(housesNew)
  console.log('start inserting house tag')
  await insertHouseTag(cleansedDataNew)
  console.log('start insert new life function')
  await insertNewLifeFunction(cleansedDataNew)
  console.log('start inserting house life function')
  await insertHouseLifeFunction(cleansedDataNew)
  console.log('finish update all house tables')
}

updateAllTables(`${yesterday}houseDatacleansed`, `${today}houseDatacleansed`)
