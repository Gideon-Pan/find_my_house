const Redis = require('../../util/redis')
const { makeTypeMap, makeTagMap, makeHouseMap } = require('../models/house_model')
const {getDistanceSquare} = require('../../util/distance')
const pool = require('../models/db/mysql')

async function getTagMap() {
  let tagMap
  if (Redis.client.connected && (await Redis.get('tagMap'))) {
    tagMap = JSON.parse(await Redis.get('tagMap'))
  } else {
    tagMap = await makeTagMap()
  }
  return tagMap
}

async function getTypeMap() {
  let typeMap
  // make type map
  if (Redis.client.connected && (await Redis.get('typeMap'))) {
    typeMap = JSON.parse(Redis.get('typeMap'))
  } else {
    typeMap = await makeTypeMap()
  }
  return typeMap
}

module.exports = {
  getTagMap,
  getTypeMap
}