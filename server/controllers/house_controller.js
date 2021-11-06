require('dotenv').config();
const House = require('../models/house_model')

const getLifeFunction = async (req, res) => {
  // const id = req.query.id
  // console.log(id)
  const {id} = req.query

  // console.log(result)
  const result = await House.getLifeFunction(id)
  res.send(result)
  // res.send(result.slice(0, 3))
  // res.send({hi: id})
}

module.exports = {
  getLifeFunction
}
