const express = require('express')
require('dotenv').config()
// const { getDistance } = require('geolib')
// const {
//   makeGraphs,
//   makeWaitingTimeMap
// } = require('./server/dijkstra/make_graph')
// // const getShortestPathBus = require('./ptx_testing/bus/bus_sp')
// // const { PQ } = require('./controller/priority_queue')
// // const { metro } = require('./ptx_testing/metro_app')
// const { Vertex, Edge } = require('./server/dijkstra/graph')
// const { getShortestPath } = require('./server/dijkstra/shortest_path')
// // const { Edge } = require('./graph')
// // const { makeGraph } = require('./makeGraph')
// const db = require('./server/models/db/mysql')
// const Redis = require('./util/redis')
const { rateLimiter } = require('./util/util')
const { API_VERSION } = process.env

const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(__dirname + '/public'))

// API routes
app.use('/api/' + API_VERSION, rateLimiter, [
  require('./server/routes/user_route'),
  require('./server/routes/house_route'),
  require('./server/routes/search_route')
])

app.listen(3000, () => {
  console.log('Listening on port 3000')
})


app.use((req, res) => {
  console.log('404')
  res.redirect('/404.html')
})