const {
  getMongo,
  getMongoOne,
  insertMongo
} = require('../../../server/models/db/mongo')

async function main() {
  const data = await getMongo("591_data", "houseDataRaw2021-11-10")
  console.log('fetch')
  await insertMongo("591_raw", "houseDataRaw2021-11-10", data)
  console.log('insert')
}

main()