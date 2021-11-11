const {
  getMongo,
  getMongoOne,
  insertMongo
} = require('../../../server/models/db/mongo')

async function main() {
  const data = await getMongo("591_raw", "houseDataRawAutomated")
  console.log('fetch')
  await insertMongo("591_raw", "houseDataRaw2021-11-11", data)
  console.log('insert')
}

main()

