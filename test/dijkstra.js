const assert = require('assert')
const { expect } = require('chai')
const { PQ } = require('../util/dijkstra/priority_queue')
const { Graph, Vertex, Edge } = require('../util/dijkstra/graph')
const { getReachableStops } = require('../util/dijkstra/shortest_path')
describe('Dijkstra algorithm for getting house in range', function () {
  describe('priority queue', function () {
    it('should get the right size for queue', function () {
      const pq = new PQ()
      // id and priority as argument
      pq.enqueue('id3', 9)
      pq.enqueue('id2', 6)
      pq.enqueue('id4', 5)
      assert.equal(pq.size(), 3)
      // assert.equal([1, 2, 3].indexOf(4), -1);
    })
    it('shold throw error for repeated id', function () {
      expect(() => {
        const pq = new PQ()
        pq.enqueue('id3', 5)
        pq.enqueue('id3', 1)
      }).to.throws('repeat id into pq')
    })
    it('should get the top priority id when peeked', function () {
      const pq = new PQ()
      pq.enqueue('id1', 9)
      pq.enqueue('id2', 3)
      pq.enqueue('id3', 6)
      assert.equal(pq.peek().id(), 'id2')
    })
    it('should success dequeue the top priority element by dequeue()', function () {
      const pq1 = new PQ()
      pq1.enqueue('id1', 9)
      pq1.enqueue('id2', 3)
      pq1.enqueue('id3', 6)
      assert.equal(pq1.size(), 3)
      assert.equal(pq1.dequeue().id(), 'id2')
      assert.equal(pq1.size(), 2)
      assert.equal(pq1.dequeue().id(), 'id3')
      assert.equal(pq1.size(), 1)
      assert.equal(pq1.dequeue().id(), 'id1')
      assert.equal(pq1.size(), 0)

      const pq2 = new PQ()
    })
    it('should return null when peeking an emtpy queue', function () {
      const pq = new PQ()
      pq.enqueue('id1', 9)
      pq.dequeue()
      assert.equal(pq.peek(), null)
    })
    it('should throw error when dequing from empty queue', function () {
      expect(() => {
        const pq = new PQ()
        pq.dequeue()
      }).to.throws('deque from empty queue')
    })
  })
  describe('getReachableStops should return ritht result based on Dijkstra algorithm', function () {
    const graph = new Graph()
    // init graph
    graph.addVertex(new Vertex('startPoint'))
    graph.addVertex(new Vertex('stop1'))
    graph.addVertex(new Vertex('stop2'))
    graph.addVertex(new Vertex('stop3'))
    graph.addVertex(new Vertex('stop4'))
    graph.addEdge(new Edge('startPoint', 'stop1', 'periodTest', 1, 70))
    graph.addEdge(new Edge('startPoint', 'stop2', 'periodTest', 1, 30))
    graph.addEdge(new Edge('startPoint', 'stop3', 'periodTest', 7, 50))
    // graph.addEdge(new Edge('stop1', 'startPoint', 'periodTest', 2))
    graph.addEdge(new Edge('stop1', 'stop4', 'periodTest', 4))
    graph.addEdge(new Edge('stop2', 'stop3', 'periodTest', 2))
    graph.addEdge(new Edge('stop2', 'stop4', 'periodTest', 5))
    graph.addEdge(new Edge('stop3', 'stop2', 'periodTest', 3))
    graph.addEdge(new Edge('stop3', 'stop4', 'periodTest', 7))
    graph.addEdge(new Edge('stop3', 'stop1', 'periodTest', 3))
    graph.addEdge(new Edge('stop4', 'stop2', 'periodTest', 1))

    const waitingTimeMap = {
      stop1: 0,
      stop2: 0,
      stop3: 0,
      stop4: 0,
      stop5: 0
    }
    it('should get the reachable stops given time limit, period and the whole graph', function () {
      const reacahbleStopsArray = getReachableStops(graph, 'startPoint', 10, 'periodTest', waitingTimeMap)
      // console.log(reacahbleStopsArray)
      const expectedArray = [
        {
          id: 'startPoint',
          startStationId: undefined,
          timeSpent: 0,
          walkDistance: undefined
        },
        {
          id: 'stop1',
          startStationId: 'stop1',
          timeSpent: 1,
          walkDistance: 70
        },
        {
          id: 'stop2',
          startStationId: 'stop2',
          timeSpent: 1,
          walkDistance: 30
        },
        {
          id: 'stop3',
          startStationId: 'stop2',
          timeSpent: 3,
          walkDistance: 30
        },
        {
          id: 'stop4',
          startStationId: 'stop1',
          timeSpent: 5,
          walkDistance: 70
        },
      ]
      expect(reacahbleStopsArray).to.have.deep.members(expectedArray)
    })
  })
})
