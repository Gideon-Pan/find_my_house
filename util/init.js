const { makeHouseMap, makeTagMap, makeTypeMap } = require("../server/models/house_model")
const { makeGraphMap, makeWaitingTimeMap } = require("./dijkstra/make_graph")
const Redis = require('./redis')

const waitingTimeMaps = {}
const graphMap = {}
async function init() {
  console.time('make graph map')
  await makeGraphMap(graphMap, 2)
  console.timeEnd('make graph map')
  await makeWaitingTimeMap(waitingTimeMaps, 2)
  if (Redis.client.connected) {
    await makeTagMap()
    await makeTypeMap()
    await makeHouseMap()
  }
}

init()

module.exports = {
  graphMap,
  waitingTimeMaps
}