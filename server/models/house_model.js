const { PQ } = require('../dijkstra/priority_queue')
const pool = require('./db/mysql')
const { getDistance } = require('geolib')
// const { Db } = require('mongodb')
const Redis = require('../../util/redis')

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
  const stopIdToNumMap = {}
  // const numToStopIdMap = new Map()
  const houseIdToNumMap = {}
  // const numToHouseIdMap = new Map()
  const houseStopDistanceMap = []
  const housePositionMap = {}
  const time0 = Date.now()
  // const q0 = `SELECT stop.ptx_stop_id AS stop_id, station_house_distance.house_id, distance from station_house_distance
  //   JOIN station
  //     ON station.id = station_house_distance.station_id
  //   JOIN stop
  //     ON stop.station_id = station.id
  //   JOIN house
  //     ON house.id = station_house_distance.house_id
  //   JOIN category
  //     ON category.id = house.category_id
  //   ${process.argv[2] === 'metro' ? 'WHERE type = "metro"' : ''}
  // `
  // const [result] = await pool.query(q0)
  // console.log(result.length)
  const q1 = `SELECT station_id, house_id, distance from station_house_distance
    JOIN station
      ON station.id = station_house_distance.station_id
    ${process.argv[2] === 'metro' ? 'WHERE type = "metro"' : ''}
  `
  const [result1] = await pool.query(q1)
  const q2 = 'SELECT id, latitude, longitude FROM house'
  const [houses] = await pool.query(q2)
  
  console.log('finish fetching houses info')
  const map = {}
  
  // WHERE category.name IN ?
  // , [[['分租套房', '獨立套房', '雅房']]]
  // const [result1] = await pool.query(q1)
  const q3 = `SELECT station.id AS station_id, ptx_stop_id FROM station
    JOIN stop
      ON station.id = stop.station_id
      ${process.argv[2] === 'metro' ? 'WHERE type = "metro"' : ''}`
  const [result2] = await pool.query(q2)
  result2.forEach(data => {
    housePositionMap[data.id] = {
      latitude: data.latitude,
      longitude: data.longitude
    }
  })
  const [result3] = await pool.query(q3)
  const stationStops = {}
  result3.forEach(data => {
    if(!stationStops[data.station_id]) {
      stationStops[data.station_id] = []
    }
    stationStops[data.station_id].push(data.ptx_stop_id)
    // console.log(stationStops)
  })
  const time1 = Date.now()
  console.log('finish fetching stop house distance:', (time1 - time0) / 1000, 'seconds')
  let stopCounter = 0
  let houseCounter = 0
  // console.log(result1.length)
  // result.forEach((data, i) => {
  //   if (!stopIdToNumMap.get(data.stop_id)) {
  //     stopIdToNumMap.set(data.stop_id, stopCounter)
  //     // numToStopIdMap.set(stopCounter, data.stop_id)
  //     stopCounter++
  //   }
  //   if (!houseIdToNumMap.get(data.house_id)) {
  //     houseIdToNumMap.set(data.house_id, houseCounter)
  //     // numToHouseIdMap.set(houseCounter, data.house_id)
  //     houseCounter++
  //   }
  //   if (!houseStopDistanceMap[houseIdToNumMap.get(data.house_id)]) {
  //     houseStopDistanceMap[houseIdToNumMap.get(data.house_id)] = []
  //   }
  //   houseStopDistanceMap[houseIdToNumMap.get(data.house_id)][stopIdToNumMap.get(data.stop_id)] = data.distance
    
  //   // {stop_id, house_id, distance}
  //   // if (!map[house_id]){
  //   //   map[house_id] = {}
  //   // }
  //   // map[house_id][stop_id] = distance
  //   // if (i % 10000 === 0) console.log(i)
  // })
  let  counter = 0
  result1.forEach((data, i) => {
    stationStops[data.station_id].forEach(stop_id => {
      // console.log(data.station_id)
      // console.log(stop_id)
      if (!stopIdToNumMap[stop_id]) {
        stopIdToNumMap[stop_id] = stopCounter
        // numToStopIdMap.set(stopCounter, data.stop_id)
        stopCounter++
      }
      if (!houseIdToNumMap[data.house_id]) {
        houseIdToNumMap[data.house_id] = houseCounter
        // numToHouseIdMap.set(houseCounter, data.house_id)
        houseCounter++
      }
      if (!houseStopDistanceMap[houseIdToNumMap[data.house_id]]) {
        houseStopDistanceMap[houseIdToNumMap[data.house_id]] = []
      }
      // houseStopDistanceMap[houseIdToNumMap.get(data.house_id)][stopIdToNumMap.get(stop_id)] = data.distance
      houseStopDistanceMap[houseIdToNumMap[data.house_id]].push([stop_id, data.distance])
      counter++
    })
    // console.log()
    // if (i % 10000 === 0) console.log(i)
  })
  // console.log(stopCounter)
  // console.log(houseCounter)
  // console.log(counter)
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
  // console.log(housePositionMap)
  const time2 = Date.now()
  // console.log((time2 - time1) / 1000, 'seconds')
  // console.log(houseIdToNumMap)
  console.log('finish loading stop house distance:', (time2 - time1) / 1000, 'seconds')
  // const houseIdToNumMapJSON = JSON.stringify(houseIdToNumMap)
  // console.log(stopIdToNumMap)
  // Redis.set('houseIdToNumMap', houseIdToNumMapJSON) 
  // const houseStopDistanceMapJSON = JSON.stringify(houseStopDistanceMap)
  // Redis.set('houseStopDistanceMap', houseStopDistanceMapJSON)
  return {
    stopIdToNumMap,
    // numToStopIdMap,
    houseIdToNumMap,
    // numToHouseIdMap,
    houseStopDistanceMap,
    housePositionMap
  }
}

// async function makeHouseStationDistanceMap() {
//   const q = `SELECT station_id, house_id, distance from station_house_distance
//     JOIN station
//       ON station.id = station_house_distance.station_id
//     ${process.argv[2] === 'metro' ? 'WHERE type = "metro"' : ''}
//   `
//   const stationIdToNumMap = {}
//   const houseIdToNumMap = {}
//   const houseStationDistanceMap = []
//   let stationCounter = 0
//   let houseCounter = 0
//   const [result] = await pool.query(q)
//   result.forEach(data => {
//     if (!stationIdToNumMap[data.station_id]) {
//       stationIdToNumMap[data.station_id] = stationCounter
//       stationCounter++
//     }
//     if (!houseIdToNumMap[data.house_id]) {
//       houseIdToNumMap[data.house_id] = houseCounter
//       houseCounter++
//     }
//     if (!houseStationDistanceMap[houseIdToNumMap[data.house_id]]) {
//       houseStationDistanceMap[houseIdToNumMap[data.house_id]] = []
//     }
//     houseStationDistanceMap[houseIdToNumMap[data.house_id]].push([data.station_id, data.distance])
    
//   })
//   // console.log(houseStationDistanceMap)
//   return {
//     houseStationDistanceMap,
//     houseIdToNumMap
//   }
// }

// makeHouseStationDistanceMap()

async function makeHouseMap() {
  console.time('make house map')
  const q = `SELECT house.id, title, price, area, link, image, house.address, house.latitude, house.longitude, category.name AS category, category.id AS category_id, tag.name AS tag_name, tag.id AS tag_id FROM house 
    JOIN category
      ON house.category_id = category.id
    JOIN house_tag
      ON house.id = house_tag.house_id
    JOIN tag
      ON tag.id = house_tag.tag_id`
  const [result] = await pool.query(q)
  const houseMap = {}
  const tags = ['可開伙','可短租','屋主直租','可養寵物','新上架']
  const positionMap = {}
  let counter = 0
  result.forEach(data => {
    if (positionMap[`${data.latitude}-${data.longitude}`] && positionMap[`${data.latitude}-${data.longitude}`] !== data.id) {
      // console.log('~~~~~~~~~~~~~')
      counter++
      return
    }
    if (!houseMap[data.id]) {
      houseMap[data.id] = {
        id: data.id,
        title: data.title,
        price: data.price,
        area: data.area,
        link: data.link,
        image: data.image,
        address: data.address,
        latitude: data.latitude,
        longitude: data.longitude,
        category: data.category,
        categoryId: data.category_id,
        tagIds: []
      }
    }
    // console.log(data.tag_name)
    if (tags.includes(data.tag_name)) {
      // console.log(data.tag_name)
      houseMap[data.id].tagIds.push(data.tag_id)
    }
    positionMap[`${data.latitude}-${data.longitude}`] = data.id
  })
  Object.values(houseMap)[0]
  // console.log(Object.values(houseMap).length)
  // console.log('Object.values(houseMap)[0]: ', Object.values(houseMap)[0]);
  // console.log(Redis.client.connected)
  if (Redis.client.connected) {
    Redis.set('houseMap', JSON.stringify(houseMap))

  }
  
  console.timeEnd('make house map')
  // console.log(counter)
  return houseMap
}



async function makeStopStationMap() {
  const stopStationMap = {}
  const q = `SELECT ptx_stop_id, ptx_station_id FROM stop
    JOIN station
      ON station.id = stop.station_id`
  const [result] = await pool.query(q)
  result.forEach(data => {
    stopStationMap[data.ptx_stop_id] = data.ptx_station_id
  })
  // console.log(stopStationMap)
  return stopStationMap
}

async function makeStationStopMap() {
  const map = {}
  const q = `SELECT ptx_stop_id, ptx_station_id FROM stop
    JOIN station
      ON station.id = stop.station_id`
  const [result] = await pool.query(q)
  result.forEach(data => {
    map[data.ptx_station_id] = data.ptx_stop_id
  })
  // console.log(stopStationMap)
  return map
}

// async function makeHouseIdToNumMap


module.exports = {
  getLifeFunction,
  makeHouseStopDistanceMap,
  // makeHouseStationDistanceMap,
  makeHouseMap,
  makeStopStationMap
}
