const {today, yesterday} = require('../time')

async function main() {
  // console.log(today)
  deleteHouse(`${yesterday}houseDatacleansed`, `${today}houseDatacleansed`)
}
