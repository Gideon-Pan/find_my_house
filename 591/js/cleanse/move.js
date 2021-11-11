const {
  getMongo,
  getMongoOne,
  insertMongo
} = require('../../../server/models/db/mongo')

async function main() {
  let data = await getMongo("591_data", "houseDataRawAutomated")
  console.log('fetch')
	data = data.slice(0, 20000)
  await insertMongo("591_raw", "houseDataRawAutomated", data)
  console.log('insert')
}

main()
