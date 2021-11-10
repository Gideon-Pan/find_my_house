const {
  getMongoData,
  get591MongoData
} = require('../../model/db/mongodb/mongo_helper')

async function checkMaxStringLength(property) {
  const data = await get591MongoData('houseData')
  let longest = 0
  let longesthouse
  data.forEach((house) => {
    // console.log(house[property])
    // console.log(house.title.length)
    // console.log(house)
    // console.log(longest)
    if (!house[property] || !house[property].length) return
    if (house[property].length > longest) {
      // console.log(house[property].length)
      // console.log(longest)
      // console.log('qq')
      longest = house[property].length
      longesthouse = house
      // console.log(longest)
    }
  })
  console.log(longest)
  console.log(longesthouse)

  // max title length: 21
  // max link length: 60
}

checkMaxStringLength('address')
