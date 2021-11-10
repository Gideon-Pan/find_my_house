const pool = require('../../../server/models/db/mysql')

async function makeTypeToIdMap() {
  const typeMap = {}
  const q = 'SELECT id, name FROM life_function_type'
  const [result] = await pool.query(q)
  result.forEach(({id, name}) => {
    typeMap[name] = id
  })
  // console.log(typeMap)
  return typeMap
}

async function makeSubypeToIdMap() {
  const subtypeMap = {}
  const q = 'SELECT id, name FROM life_function_subtype'
  const [result] = await pool.query(q)
  result.forEach(({id, name}) => {
    subtypeMap[name] = id
  })
  // console.log(subtypeMap)
  return subtypeMap
}

async function makeCategoryToIdMap() {
  const map = {}
  const q = 'SELECT id, name FROM category'
  const [result] = await pool.query(q)
  result.forEach(({id, name}) => {
    map[name] = id
  })
  // console.log(subtypeMap)
  // console.log(map)
  return map
}

async function makeLifeFunctionMap() {
  const map = {}
  const q = 'SELECT id, name, latitude, longitude FROM life_function'
  const [result] = await pool.query(q)
  result.forEach(({id, name, latitude, longitude}) => {
    // console.log(typeof latitude)
    // if (name === '三重社區大學') console.log(`${name}-${latitude}-${longitude}`)
    
    map[`${name}-${latitude}-${longitude}`] = id
  })
  // console.log(subtypeMap)
  // console.log(map)
  return map
}

async function makeTagMap() {
  const map = {}
  const q = 'SELECT id, name FROM tag'
  const [result] = await pool.query(q)
  result.forEach(({id, name}) => {
    map[name] = id
  })
  // console.log(map)
  return map
}

async function makeFacilityMap() {
  const map = {}
  const q = 'SELECT id, name FROM facility'
  const [result] = await pool.query(q)
  result.forEach(({id, name}) => {
    map[name] = id
  })
  // console.log(map)
  return map
}

// makeCategoryToIdMap()
// makeTypeMap()
// makeSubypeToIdMap()
// makeLifeFunctionMap()
// makeTagMap()
// makeFacilityMap()

module.exports = {
  makeTypeToIdMap,
  makeSubypeToIdMap,
  makeSubypeToIdMap,
  makeCategoryToIdMap,
  makeLifeFunctionMap,
  makeTagMap,
  makeFacilityMap
}