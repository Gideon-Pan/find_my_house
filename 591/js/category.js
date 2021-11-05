const { getMongo, getMongoOne } = require("../../server/models/db/mongo")
const pool = require('../../server/models/db/mysql')

async function main() {
  const categoryMap = {}
  const houses = await getMongo('591_data', 'cleansedHouseDataNew')
  houses.forEach(({category}) => {
    // house.facilities.forEach(category => {
      categoryMap[category] = category
    // })
  })
  // console.log(categoryMap)
  const q = 'INSERT INTO category (name) VALUES ?'
  const values = Object.values(categoryMap).map(category => [category])
  console.log(values)
  await pool.query(q, [values])
  console.log('finish inserting categories')
}

main()