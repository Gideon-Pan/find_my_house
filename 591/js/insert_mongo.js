const { insertMany591 } = require('../../model/db/mongodb/mongo_helper')
const db = require('../../model/db/mysql/mysql')
async function main() {
  const q = 'SELECT id, title, link, category, image, price, address, latitude, longitude FROM house'
  const [result] = await db.query(q)
  const data = result.map(({id, title, link, category, image, price, address, latitude, longitude}) => {
    return {
      mysqlId: id,
      title,
      link,
      category,
      image,
      price,
      address,
      latitude,
      longitude
    }
  })
  // console.log(data)
  await insertMany591("mysql_dump", data)
}

main()