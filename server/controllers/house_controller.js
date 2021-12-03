require('dotenv').config()
const HouseModel = require('../models/house_model')

const getLifeFunction = async (req, res) => {
  const { id } = req.query
  const result = await HouseModel.getLifeFunction(id)
  res.send(result)
}

module.exports = {
  getLifeFunction
}
