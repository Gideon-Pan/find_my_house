const {today, yesterday} = require('../time')

async function main() {
  // console.log(today)
  deleteHouse(`${yesterday}houseDatacleansed`, `${today}houseDatacleansed`)
  const housesToInsert = await getHousesToInsert(`${yesterday}houseDatacleansed`, `${today}houseDatacleansed`)
  await insertHouse(housesToInsert)
  await insertHouseTag(`${yesterday}houseDatacleansed`, `${today}houseDatacleansed`)
  await insertNewLifeFunction(`${today}houseDatacleansed`)
  
}
