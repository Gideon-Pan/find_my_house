const { PQ } = require('../dijkstra/priority_queue')
const pool = require('./db/mysql')


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

module.exports = {
  getLifeFunction
}
