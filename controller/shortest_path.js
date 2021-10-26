const { makeGraph } = require('./make_graph')
const { PQ } = require('./priority_queue')

function getShortestPath(g, fromId, timeLeft) {
  const ids = g.getAllIds()
  const pq = new PQ()
  const timeTo = {}
  for (let i = 0; i < ids.length; i++) {
    if (ids[i] === fromId) {
      pq.enqueue(ids[i], 0)
      // console.log(pq.peek())
      continue
    }
    timeTo[ids[i]] = Number.MAX_SAFE_INTEGER
    pq.enqueue(ids[i], Number.MAX_SAFE_INTEGER)
  }
  // pq.enqueue('-2', -1)

  const edgeTo = {}
  const marked = {}
  timeTo[fromId] = 0
  let counter = 0
  const reachableStationIds = []
  while (pq.size() > 0) {
    // console.log(pq.peek())
    const currentId = pq.dequeue().id()
    // if (currentId === '-2') console.log(g.adj('-2'))
    // if (pq.size() % 1000 === 0) {
    //   console.log("current:", timeTo[currentId])
    //   console.log("time left:", timeLeft)
    // }
    if (timeTo[currentId] > timeLeft) {
      // console.log("time to stop:",timeTo[currentId])
      // console.log("time left", timeLeft)
      break
    }
    // console.log(timeTo[currentId])
    reachableStationIds.push(currentId)
    // console.log(timeTo[currentId])
    // console.log(currentId)
    // if (currentId == 21022) {
    //   console.log('!!!')
    // }
    // console.log(currentId)
    counter++
    // if (console.log(timeTo[currentId]))
    marked[currentId] = true
    // console.log(g.adj)
    for (const edge of g.adj(currentId)) {
      // console.log(edge)
      const neighborId = edge.to()
      // console.log(neighborId)
      if (marked[neighborId]) continue

      const qElement = pq.getElementById(neighborId)
      if (!qElement) {
        continue
      }
      // console.log(qElement)
      // relax
      if (timeTo[currentId] + edge.time() < qElement.priority()) {
        // console.log('hee')
        edgeTo[neighborId] = currentId
        timeTo[neighborId] = timeTo[currentId] + edge.time()
        qElement.setPriority(timeTo[currentId] + edge.time())
        pq.sink(qElement)
        pq.swim(qElement)
      }
    }
  }
  // R08 G10

  // console.log(reachableStations)
  const reachableStations = []
  for (let reachableStationId of reachableStationIds) {
    // if (reachableStationId = 'Y15') console.log(timeTo[reachableStationId])
    // console.log(reachableStationId)
    // console.log(timeTo[reachableStationId])
    let currentId = reachableStationId
    let route = [reachableStationId]
    while (edgeTo[currentId]) {
      route.push(edgeTo[currentId])
      currentId = edgeTo[currentId]
    }
    reachableStations.push({
      id: reachableStationId,
      startStationId: route[route.length - 2],
      timeSpent: timeTo[reachableStationId]
    })
    if (reachableStationId === '16911') {
      console.log(route)
    }
    // route = route.reverse()
    // console.log(route[route.length - 2])
  }

  // const id = 'G15'
  // let currentId =  id
  // let route = [id]

  // console.log(edgeTo[currentId])
  // console.log(counter)
  // console.log(edgeTo[21022])
  // console.log(Object.keys(edgeTo).length)
  // while (edgeTo[currentId]) {
  //   route.push(edgeTo[currentId])
  //   currentId = edgeTo[currentId]
  // }

  // // route = route.reverse()
  // console.log(route[route.length - 2])
  // if (toId) {
  //   route.forEach(stationId => {
  //     console.log(`${stationId} ${g.getVertex(stationId).name()}`)
  //   })
  //   console.log(`總搭乘時間: ${timeTo[toId]}`)
  // }
  // console.log(timeTo)
  // console.log(reachableStations)
  return reachableStations
  // console.log(`行經站數: ${route.length}站`)
  // console.log(route)
}

// id 21022: 丹鳳國小
// id 142628: 市政府
async function spById() {
  const g = await makeGraph()
  // console.log(g)
  if (process.argv[3] && process.argv[4]) {
    return getShortestPathMetro(g, process.argv[3], process.argv[4])
  }
  // console.log(g.getIdsByName("板橋"))
  // getShortestPathMetro(g, "BL01", "BL12")
}

async function spByName() {
  const g = await makeGraph()
  if (process.argv[3] && process.argv[4]) {
    const fromId = g.getIdsByName(process.argv[3])[0]
    const toId = g.getIdsByName(process.argv[4])[0]
    return getShortestPathMetro(g, fromId, toId)
  }
}

if (process.argv[2] === 'id') {
  spById()
}
if (process.argv[2] === 'name') {
  spByName()
}

module.exports = { getShortestPath }
