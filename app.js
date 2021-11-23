const express = require('express')
require('dotenv').config()
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
