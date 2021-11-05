const axios = require('axios')
const { insertMany, insertMongo } = require('../server/models/db/mongo')


async function main() {
  const {data} = await axios.get('https://www.carrefour.com.tw/console/api/v1/stores?page_size=all')
  console.log(data.data.rows[0])
  const typeMap = {}
  // data.data.rows.forEach(store => {
  //   const {store_type_name, address} = store
    
  //   if (!typeMap[store_type_name]) {
  //     typeMap[store_type_name] = {
  //       type: store_type_name,
  //       count: 0,
  //       address: []
  //     }
  //   }
  //   typeMap[store_type_name].count++
  //   // typeMap[store_type_name].stores.push({
  //   //   address
  //   // })
  // })
  // console.log(typeMap)
  // console.log(data.data.rows[0])
  // await insertMongo('life_function', 'carrefour_raw', data.data.rows)
}

main()