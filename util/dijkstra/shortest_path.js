const { PQ } = require('./priority_queue')

function getReachableIds(graph) {
  const ids = graph.getAllIds()
  const pq = new PQ()
  const timeTo = {}
  const walkDistance = {}

  // add stops into priority queue
  for (let i = 0; i < ids.length; i++) {
    if (ids[i] === fromId) {
      pq.enqueue(ids[i], 0)
      continue
    }
    timeTo[ids[i]] = Number.MAX_SAFE_INTEGER
    pq.enqueue(ids[i], Number.MAX_SAFE_INTEGER)
  }

  const edgeTo = {}
  const marked = {}
  timeTo[fromId] = 0
  let counter = 0
  const reachableStationIds = []

  // use Dijkstra's algorithm to get reachable stop id
  while (pq.size() > 0) {
    // console.log(pq.peek())
    const currentId = pq.dequeue().id()
    const waitingTime = waitingTimeMap[currentId] || 0
    // stop when time exceed time limit
    if (timeTo[currentId] > timeLeft) {
      break
    }
    reachableStationIds.push(currentId)
    counter++
    marked[currentId] = true

    // path relaxation
    for (const edge of graph.adj(currentId)) {
      const neighborId = edge.to()
      if (marked[neighborId]) continue

      const qElement = pq.getElementById(neighborId)
      if (!qElement) {
        continue
      }

      // update the priority of the stop
      if (timeTo[currentId] + edge.time() < qElement.priority()) {
        edgeTo[neighborId] = currentId
        timeTo[neighborId] = timeTo[currentId] + edge.time()
        qElement.setPriority(timeTo[currentId] + edge.time())
        pq.sink(qElement)
        pq.swim(qElement)
      }
    }
  }
}

function getReachableStops(graph, fromId, timeLeft, period, waitingTimeMap) {
  const ids = graph.getAllIds()
  const pq = new PQ()
  const timeTo = {}
  const walkDistance = {}

  // add stops into priority queue
  for (let i = 0; i < ids.length; i++) {
    if (ids[i] === fromId) {
      pq.enqueue(ids[i], 0)
      continue
    }
    timeTo[ids[i]] = Number.MAX_SAFE_INTEGER
    pq.enqueue(ids[i], Number.MAX_SAFE_INTEGER)
  }

  const edgeTo = {}
  const marked = {}
  timeTo[fromId] = 0
  let counter = 0
  let counter2 = 0
  const reachableStationIds = []

  // use Dijkstra's algorithm to get reachable stop id
  while (pq.size() > 0) {
    const currentId = pq.dequeue().id()
    const waitingTime = waitingTimeMap[currentId] || 0
    // stop when time exceed time limit
    if (timeTo[currentId] > timeLeft) {
      break
    }
    reachableStationIds.push(currentId)
    counter++
    marked[currentId] = true

    // path relaxation
    for (const edge of graph.adj(currentId)) {
      const neighborId = edge.to()
      if (marked[neighborId]) continue

      const qElement = pq.getElementById(neighborId)
      if (!qElement) {
        continue
      }

      // update the priority of the stop
      if (timeTo[currentId] + edge.time() < qElement.priority()) {
        counter2++
        edgeTo[neighborId] = currentId
        timeTo[neighborId] = timeTo[currentId] + edge.time()
        qElement.setPriority(timeTo[currentId] + edge.time())
        pq.sink(qElement)
        pq.swim(qElement)
      }
    }
  }

  // calculate the consuming time from start point to stops
  const reachableStations = []
  for (let reachableStationId of reachableStationIds) {
    let currentId = reachableStationId
    let path = [reachableStationId]
    // calculate consumingtime from start point to a stop
    while (edgeTo[currentId]) {
      // track the path
      path.push(edgeTo[currentId])
      const edge = graph.getEdge(edgeTo[currentId], currentId, period)
      currentId = edgeTo[currentId]
      if (!walkDistance[reachableStationId]) {
        walkDistance[reachableStationId] = 0
      }
      // skip the edge from start points, whose distance may be undefined
      if (!edge.distance()) {
        continue
      }
      // sum up the walk distance from start point to a stop
      walkDistance[reachableStationId] += edge.distance()
    }

    // set default waiting time => to be optimized
    const waitingTime = waitingTimeMap[reachableStationId] || 0

    // skip the stop which exceed time limit because of waiting
    if (timeTo[reachableStationId] + waitingTime > timeLeft) {
      continue
    }
    reachableStations.push({
      id: reachableStationId,
      startStationId: path[path.length - 2],
      timeSpent: timeTo[reachableStationId] + waitingTime,
      walkDistance: walkDistance[reachableStationId]
    })
  }
  console.log('counter1', counter)
  console.log('counter2', counter2)
  return reachableStations
}

// following is for manuel testing
// id 21022: ????????????
// id 142628: ?????????
async function spById() {
  const g = await makeGraph()
  // console.log(g)
  if (process.argv[3] && process.argv[4]) {
    return getShortestPathMetro(g, process.argv[3], process.argv[4])
  }
}

module.exports = { getReachableStops }
