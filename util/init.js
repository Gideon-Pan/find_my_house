require('dotenv').config()
const { makeHouseMap, makeTagMap, makeTypeMap } = require('../server/models/house_model')
const { makeGraphMap, makeWaitingTimeMap } = require('./dijkstra/make_graph')
const Redis = require('./redis')
const { GRAPH_VERSION } = process.env

const initData = {}
async function init() {
  console.time('make graph map')
  initData.graphMap = await makeGraphMap(GRAPH_VERSION)
  console.timeEnd('make graph map')
  initData.waitingTimeMaps = await makeWaitingTimeMap(GRAPH_VERSION)
  if (Redis.client.connected) {
    await makeTagMap()
    await makeTypeMap()
    await makeHouseMap()
  }
}

init()

module.exports = initData
