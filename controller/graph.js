class Vertex {
  constructor(id, name, lat, lng) {
    this._id = id;
    this._name = name;
    this._lat = lat;
    this._lng = lng;
    // this.line_id = line_id
  }
  id() {
    return this._id
  }
  name() {
    return this._name
  }
  addLat(lat) {
    this._lat = lat
  }
  addLng(lng) {
    this._lng = lng
  }
  lat() {
    return this._lat
  }
  lng() {
    return this._lng
  }
}

class Edge {
  constructor(fromId, toId, timePeriod, time) {
    this._fromId = fromId
    this._toId = toId
    this._timePeriod = timePeriod
    this._time = time
  }
  to() {
    return this._toId
  }
  timePeriod() {

  }
  time() {
    return this._time
  }
}

class Graph {
  constructor() {
    // this._vertice = []
    // this._edges = {}
    this._adjacent = {}
    this._vertexMap = {}
    // this._nameMap = {}
  }
  addVertex(vertex) {
    // this._vertice.push(vertex)
    this._adjacent[vertex._id] = []
    this._vertexMap[vertex._id] = vertex
    // this._edges[vertex._id] = []
    // if (!this._nameMap[vertex._name]) {
    //   return this._nameMap[vertex._name] = [vertex._id]
    // }
    // this._nameMap[vertex._name].push(vertex._id)
  }
  addEdge(edge) {
    // console.log(edge)
    // console.log(this.edges)
    // console.log(edge)
    // console.log(edge._fromId)
    try {
      if (this._adjacent[edge._fromId].includes(edge._toId)) {
        return
      }   
      // this._edges.push(edge)
      // console.log(edge._fromId)
      // console.log(this._adjacent[edge._fromId])
      
      this._adjacent[edge._fromId].push(edge)
      // console.log(edge._fromId)
    } catch(e) {
      console.log(e)
      console.log(edge._fromId)

      process.exit()
    }

  }
  adj(id) {
    return this._adjacent[id]
  }
  hello() {
    return console.log(this)
  }
  getVertex(id) {
    return this._vertexMap[id]
  }
  // getIdsByName(name) {
  //   return this._nameMap[name]
  // }
  getAllIds() {
    return Object.keys(this._vertexMap)
  }
  getvertexMap() {
    return this._vertexMap
  }
}

module.exports = {
  Vertex,
  Edge,
  Graph
}