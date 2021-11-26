const { makeWaitingTimeMap, makeGraphs } = require("../../util/dijkstra/make_graph")
const { makeTagMap, makeTypeMap, makeHouseMap } = require("../models/house_model")
const version = process.env.GRAPH_VERSION

init()
async function init() {
  const time0_0 = Date.now()
  console.log('finish making graph step 0')
  const time0_1 = Date.now()
  console.log(
    'finish making graph:',
    Math.floor(time0_1 - time0_0) / 1000,
    'seconds'
  )

  waitingTimeMaps = await makeWaitingTimeMap(2)
  await makeTagMap()
  await makeTypeMap()
  await makeHouseMap()
  // console.log(graphs)
}

module.exports = async function(version){
  return await makeGraphs(version)
}