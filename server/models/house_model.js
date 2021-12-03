const pool = require('./db/mysql')
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

  const idMap = {}
  if (result.length === 0) return {}

  const lifeFunctionMap = {}
  result.forEach((lifeFunction) => {
    const { id, name, latitude, longitude, distance, type_name, subtype_name } = lifeFunction
    if (!lifeFunctionMap[type_name]) {
      lifeFunctionMap[type_name] = {}
    }
    if (!lifeFunctionMap[type_name][subtype_name]) {
      lifeFunctionMap[type_name][subtype_name] = []
    }
    lifeFunctionMap[type_name][subtype_name].push({
      id,
      name,
      latitude,
      longitude,
      distance,
      type: type_name,
      subtype: subtype_name
    })
  })
  const house = {
    id,
    coordinate: {
      latitude: result[0].house_lat,
      longitude: result[1].house_lng
    },
    like: result[0].like_status ? true : false,
    lifeFunction: lifeFunctionMap
  }

  return house
}

async function makeHouseStopDistanceMap() {
  const stopIdToNumMap = {}
  const houseIdToNumMap = {}
  const houseStopDistanceMap = []
  const housePositionMap = {}
  const time0 = Date.now()

  const q1 = `SELECT station_id, house_id, distance from station_house_distance
    JOIN station
      ON station.id = station_house_distance.station_id
    ${process.argv[2] === 'metro' ? 'WHERE type = "metro"' : ''}
  `
  const [result1] = await pool.query(q1)
  const q2 = 'SELECT id, latitude, longitude FROM house'
  const [houses] = await pool.query(q2)

  console.log('finish fetching houses info')

  const q3 = `SELECT station.id AS station_id, ptx_stop_id FROM station
    JOIN stop
      ON station.id = stop.station_id
      ${process.argv[2] === 'metro' ? 'WHERE type = "metro"' : ''}`
  const [result2] = await pool.query(q2)
  result2.forEach((data) => {
    housePositionMap[data.id] = {
      latitude: data.latitude,
      longitude: data.longitude
    }
  })
  const [result3] = await pool.query(q3)
  const stationStops = {}
  result3.forEach((data) => {
    if (!stationStops[data.station_id]) {
      stationStops[data.station_id] = []
    }
    stationStops[data.station_id].push(data.ptx_stop_id)
  })
  const time1 = Date.now()
  console.log('finish fetching stop house distance:', (time1 - time0) / 1000, 'seconds')
  let stopCounter = 0
  let houseCounter = 0
  let counter = 0
  result1.forEach((data, i) => {
    stationStops[data.station_id].forEach((stop_id) => {
      if (!stopIdToNumMap[stop_id]) {
        stopIdToNumMap[stop_id] = stopCounter
        stopCounter++
      }
      if (!houseIdToNumMap[data.house_id]) {
        houseIdToNumMap[data.house_id] = houseCounter
        houseCounter++
      }
      if (!houseStopDistanceMap[houseIdToNumMap[data.house_id]]) {
        houseStopDistanceMap[houseIdToNumMap[data.house_id]] = []
      }
      houseStopDistanceMap[houseIdToNumMap[data.house_id]].push([stop_id, data.distance])
      counter++
    })
  })
  const time2 = Date.now()
  console.log('finish loading stop house distance:', (time2 - time1) / 1000, 'seconds')
  return {
    stopIdToNumMap,
    houseIdToNumMap,
    houseStopDistanceMap,
    housePositionMap
  }
}

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
  const tags = ['可開伙', '可短租', '屋主直租', '可養寵物', '新上架']
  let counter = 0
  result.forEach((data) => {
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
    if (tags.includes(data.tag_name)) {
      houseMap[data.id].tagIds.push(data.tag_id)
    }
  })
  if (Redis.client.connected) {
    Redis.set('houseMap', JSON.stringify(houseMap))
  }

  console.timeEnd('make house map')
  return houseMap
}

async function makeStopStationMap() {
  const stopStationMap = {}
  const q = `SELECT ptx_stop_id, ptx_station_id FROM stop
    JOIN station
      ON station.id = stop.station_id`
  const [result] = await pool.query(q)
  result.forEach((data) => {
    stopStationMap[data.ptx_stop_id] = data.ptx_station_id
  })
  return stopStationMap
}

async function makeTagMap() {
  const tagMap = {}
  const q = 'SELECT id, name FROM tag'
  const [result] = await pool.query(q)
  result.forEach((tag) => {
    switch (tag.name) {
      case '可開伙':
        tagMap.fire = tag.id
        break
      case '可短租':
        tagMap.shortRent = tag.id
        break
      case '可養寵物':
        tagMap.pet = tag.id
        break
      case '屋主直租':
        tagMap.directRent = tag.id
        break
      case '新上架':
        tagMap.newItem = tag.id
        break
    }
  })
  if (Redis.client.connected) {
    Redis.set('tagMap', JSON.stringify(tagMap))
  }
  return tagMap
}

async function makeTypeMap() {
  const typeMap = {}
  const q = 'SELECT id, name FROM category'
  const [result] = await pool.query(q)
  result.forEach((type) => {
    switch (type.name) {
      case '獨立套房':
        typeMap['independant-suite'] = type.id
        break
      case '分租套房':
        typeMap['shared-suite'] = type.id
        break
      case '雅房':
        typeMap['studio'] = type.id
        break
      default:
        break
    }
  })
  if (Redis.client.connected) {
    Redis.set('houseTypeMap', JSON.stringify(typeMap))
  }
  return typeMap
}

module.exports = {
  getLifeFunction,
  makeHouseStopDistanceMap,
  makeHouseMap,
  makeStopStationMap,
  makeTagMap,
  makeTypeMap
}
