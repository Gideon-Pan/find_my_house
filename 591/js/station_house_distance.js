const { getDistance } = require('geolib')
// const { Db } = require('mongodb')
const pool = require('../../server/models/db/mysql')

async function main() {
  const q1 = `SELECT id, latitude, longitude FROM station
    WHERE latitude IS NOT NULL`
  console.log('finish fetching stations info')
  const [stations] = await pool.query(q1)
  const q2 = 'SELECT id, latitude, longitude FROM house'
  const [houses] = await pool.query(q2)
  console.log('finish fetching houses info')
  const map = {}
  const time1 = Date.now()
  const q3 =
    'INSERT INTO station_house_distance (station_id, house_id, distance) VALUES ?'
  let values = []
  let counter = 0
  // console.log(stations.length)
  for (let i = 0; i < stations.length; i++) {
    // if (i <= 10900) {
    //   // console.log(i)
    //   continue
    // }
    const station = stations[i]
    map[station.id] = {}
    for (let j = 0; j < houses.length; j++) {
      const house = houses[j]
      // map[station.id][ house.id] = getDistance(
      //   { latitude: station.latitude, longitude: station.longitude },
      //   { latitude:  house.latitude, longitude:  house.longitude }
      // )
      const distance = getDistance(
        { latitude: station.latitude, longitude: station.longitude },
        { latitude: house.latitude, longitude: house.longitude }
      )
      // values.push([station.id, house.id, distance])
      if (distance < 1000) {
        // map[station.id][house.id] = getDistance(
        //   { latitude: station.latitude, longitude: station.longitude },
        //   { latitude: house.latitude, longitude: house.longitude }
        // )
        values.push([station.id, house.id, distance])
      }
    }
    if (i === stations.length - 1) {
      console.log(i)
      console.log(values)
      await pool.query(q3, [values])
      values = []
      console.log('finish inserting', i + 1, 'times')
    }
    // if (i % 5 === 0) {
    //   // console.log(values)
      // await pool.query(q3, [values])
      // values = []
      // console.log('finish inserting', i + 1, 'times')
    // }

    if (i % 100 === 0) {
      // console.log(i)
      // console.log(counter)
      // if (values.length === 0) continue
      await pool.query(q3, [values])
      values = []
      console.log('finish inserting', i + 1, 'stations')
    }

    // console.log(i)
    // await pool.query(q3, [values])
    // values = []
    // console.log('finish inserting', i + 1, 'times')
  }
  // console.log(map)
  const time2 = Date.now()
  console.log('Valid data:', counter)
  console.log((time2 - time1) / 1000, 'seconds')
  console.log('finish inserting house life distance')
}

main()