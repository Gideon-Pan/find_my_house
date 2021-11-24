require('dotenv').config();
const House = require('../models/house_model')

const getLifeFunction = async (req, res) => {
  const {id} = req.query
  const result = await House.getLifeFunction(id)
  res.send(result)
}

module.exports = {
  getLifeFunction
}
