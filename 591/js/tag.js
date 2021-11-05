const { getMongo, getMongoOne } = require("../../server/models/db/mongo")
const pool = require('../../server/models/db/mysql')

async function main() {
  const tagMap = {}
  const houses = await getMongo('591_data', 'cleansedHouseDataNew')
  houses.forEach(house => {
    house.tags.forEach(tag => {
      tagMap[tag] = tag
    })
  })
  // console.log(tagMap)
  const q = 'INSERT INTO tag (name) VALUES ?'
  const values = Object.values(tagMap).map(tag => [tag])
  console.log(values)
  await pool.query(q, [values])
  console.log('finish inserting tags')
}

main()