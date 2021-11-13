const { PQ } = require('../dijkstra/priority_queue')
const pool = require('./db/mysql')
const { getDistance } = require('geolib')
// const { Db } = require('mongodb')

async function getLifeFunction(id) {
  const q = `SELECT house.latitude AS house_lat, house.longitude AS house_lng, life_function.id, life_function.name, life_function.latitude, life_function.longitude, distance, life_function_type.name AS type_name, life_function_subtype.name AS subtype_name, like_table.status AS like_status FROM life_function
  JOIN house_life_function
    ON house_life_function.life_function_id = life_function.id
  JOIN life_function_subtype
    ON life_function_subtype.id = life_function.subtype_id
  JOIN life_function_type
    ON life_function_type.id = life_function_subtype.type_id
  JOIN house
    ON house.id = house_life_function.house_id
  LEFT JOIN like_table
    ON like_table.house_id = house.id
  WHERE house.id = ${id}
  ORDER BY distance
`
  const [result] = await pool.query(q)
  // console.log(result)

  const idMap = {}
  if (result.length === 0) return {}
  
  const lifeFunctionMap = {}
  result.forEach((lifeFunction) => {
    const {id, name, latitude, longitude, distance, type_name, subtype_name} = lifeFunction
    if (!lifeFunctionMap[type_name]) {
      lifeFunctionMap[type_name] = {}
    }
    if (!lifeFunctionMap[type_name][subtype_name]) {
      lifeFunctionMap[type_name][subtype_name] = []
      // lifeFunctionMap[type_name][subtype_name] = new PQ()
    }
    // if (lifeFunctionMap[type_name][subtype_name].length >= 3) return
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
  const house = {
    id,
    coordinate: {
      latitude: result[0].house_lat,
      longitude: result[1].house_lng
    },
    like: result[0].like_status ? true : false,
    lifeFunction: lifeFunctionMap,
  }

  return house
}

async function makeHouseStopDistanceMap() {
  const stopIdToNumMap = new Map()
  const numToStopIdMap = new Map()
  const houseIdToNumMap = new Map()
  const numToHouseIdMap = new Map()
  const houseStopDistanceMap = []
  const q1 = `SELECT stop.ptx_stop_id AS stop_id, station_house_distance.house_id, distance from station_house_distance
    JOIN station
      ON station.id = station_house_distance.station_id
    JOIN stop
      ON stop.station_id = station.id
    JOIN house
      ON house.id = station_house_distance.house_id
    JOIN category
      ON category.id = house.category_id
    WHERE category.name IN ?
      ${process.argv[2] === 'metro' ? 'AND type = "metro"' : ''}
  `
  console.log('finish fetching stations stop info')
  // const [stations] = await pool.query(q1)
  // const q2 = 'SELECT id, latitude, longitude FROM house'
  // const [houses] = await pool.query(q2)
  // console.log('finish fetching houses info')
  const map = {}
  const time1 = Date.now()
  const [result] = await pool.query(q1, [[['分租套房', '獨立套房', '雅房']]])
  let stopCounter = 0
  let houseCounter = 0

  result.forEach(data => {
    if (!stopIdToNumMap.get(data.stop_id)) {
      stopIdToNumMap.set(data.stop_id, stopCounter)
      numToStopIdMap.set(stopCounter, data.stop_id)
      stopCounter++
    }
    if (!houseIdToNumMap.get(data.house_id)) {
      houseIdToNumMap.set(data.house_id, houseCounter)
      numToHouseIdMap.set(houseCounter, data.house_id)
      houseCounter++
    }
    if (!houseStopDistanceMap[houseIdToNumMap.get(data.house_id)]) {
      houseStopDistanceMap[houseIdToNumMap.get(data.house_id)] = []
    }
    houseStopDistanceMap[houseIdToNumMap.get(data.house_id)][stopIdToNumMap.get(data.stop_id)] = data.distance
    
    // {stop_id, house_id, distance}
    // if (!map[house_id]){
    //   map[house_id] = {}
    // }
    // map[house_id][stop_id] = distance
    // if (i % 10000 === 0) console.log(i)
  })
  console.log(stopCounter)
  console.log(houseCounter)
  
  // const q3 = 'INSERT INTO station_house_distance (station_id, house_id, distance) VALUES ?'
  // let values = []
  // for (let i = 0; i < stations.length; i++) {
  //   const station = stations[i]
  //   map[station.id] = {}
  //   for (let j = 0; j < houses.length; j++) {
  //     const house = houses[j]
  //     map[station.id][ house.id] = getDistance(
  //       { latitude: station.latitude, longitude: station.longitude },
  //       { latitude:  house.latitude, longitude:  house.longitude }
  //     )
  //     // const distance = getDistance(
  //     //   { latitude: station.latitude, longitude: station.longitude },
  //     //   { latitude:  house.latitude, longitude:  house.longitude }
  //     // )
  //     // values.push([station.id, house.id, distance])

  //   }
  //   if (i % 100 === 0) {
  //     console.log(i)
  //   }
    
  // }
  // console.log(map)
  const time2 = Date.now()
  console.log((time2 - time1) / 1000, 'seconds')
  console.log('finish loading stop house distance')
  return {
    stopIdToNumMap,
    numToStopIdMap,
    houseIdToNumMap,
    numToHouseIdMap,
    houseStopDistanceMap
  }
}




module.exports = {
  getLifeFunction,
  makeHouseStopDistanceMap
}
