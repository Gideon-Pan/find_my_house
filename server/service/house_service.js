const Redis = require('../../util/redis')
const { makeTypeMap, makeTagMap, makeHouseMap } = require('../models/house_model')
const {getDistanceSquare} = require('../../util/distance')
const pool = require('../models/db/mysql')



// module.exports = {
//   getHouseData
// }