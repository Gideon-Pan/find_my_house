const { PQ } = require('../dijkstra/priority_queue')
const pool = require('./db/mysql')
const { getDistance } = require('geolib')

async function getLifeFunction(id) {
  const q = `SELECT house.latitude AS house_lat, house.longitude AS house_lng, life_function.id, life_function.name, life_function.latitude, life_function.longitude, distance, life_function_type.name AS type_name, life_function_subtype.name AS subtype_name FROM life_function
  JOIN house_life_function
    ON house_life_function.life_function_id = life_function.id
  JOIN life_function_subtype
    ON life_function_subtype.id = life_function.subtype_id
  JOIN life_function_type
    ON life_function_type.id = life_function_subtype.type_id
  JOIN house
    ON house.id = house_life_function.house_id
  WHERE house_id = ${id}
  ORDER BY distance
`
  const [result] = await pool.query(q)

  const idMap = {}
  if (result.length === 0) return {}
  const lifeFunctionMap = {
    coordinate: {
      latitude: result[0].house_lat,
      longitude: result[1].house_lng
    }
  }
  result.forEach((lifeFunction) => {
    const {id, name, latitude, longitude, distance, type_name, subtype_name} = lifeFunction
    if (!lifeFunctionMap[type_name]) {
      lifeFunctionMap[type_name] = {}
    }
    if (!lifeFunctionMap[type_name][subtype_name]) {
      lifeFunctionMap[type_name][subtype_name] = []
      // lifeFunctionMap[type_name][subtype_name] = new PQ()
    }
    if (lifeFunctionMap[type_name][subtype_name].length >= 3) return
    lifeFunctionMap[type_name][subtype_name].push({
      id,
      name,
      latitude,
      longitude,
      distance,
      type: type_name,
      subtype: subtype_name
    })
    // idMap[id] = lifeFunction
    // lifeFunctionMap[type_name][subtype_name].enqueue(id, distance)
  })

  return lifeFunctionMap
}

async function makeStopHouseDistanceMap() {
  const q1 = `SELECT stop.id, latitude, longitude FROM station
    JOIN stop
      ON station.id = stop.station_id
    
  `
  console.log('finish fetching stations info')
  const [stations] = await pool.query(q1)
  const q2 = 'SELECT id, latitude, longitude FROM house'
  const [ houses] = await pool.query(q2)
  console.log('finish fetching houses info')
  const map = {}
  const time1 = Date.now()
  // const q3 = 'INSERT INTO station_house_distance (station_id, house_id, distance) VALUES ?'
  let values = []
  for (let i = 0; i < stations.length; i++) {
    const station = stations[i]
    map[station.id] = {}
    for (let j = 0; j < houses.length; j++) {
      const house = houses[j]
      map[station.id][ house.id] = getDistance(
        { latitude: station.latitude, longitude: station.longitude },
        { latitude:  house.latitude, longitude:  house.longitude }
      )
      // const distance = getDistance(
      //   { latitude: station.latitude, longitude: station.longitude },
      //   { latitude:  house.latitude, longitude:  house.longitude }
      // )
      // values.push([station.id, house.id, distance])

    }
    if (i % 100 === 0) {
      console.log(i)
    }
    
  }
  // console.log(map)
  // const time2 = Date.now()
  // console.log((time2 - time1) / 1000, 'seconds')
  // console.log('finish inserting house life distance')
  return map
}




module.exports = {
  getLifeFunction,
  makeStopHouseDistanceMap
}
