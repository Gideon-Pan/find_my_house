require('dotenv').config()
const validator = require('validator')
const UserModel = require('../models/user_model')
const {
  validateSignUpRequest,
  validateSignInRequest
} = require('../../util/validate')

async function signUp(req, res) {
  let { name } = req.body
  const { email, password } = req.body

  // validation
  const validateError = validateSignUpRequest(email, password, name)
  console.log(validateError)
  if (validateError) {
    return res
      .status(validateError.status)
      .send({ error: validateError.message })
  }
  name = validator.escape(name)

  const { error, accessToken } = await UserModel.signUp(email, password, name)
  if (error) {
    return res.status(error.status).send({ error: error.message })
  }
  res.send({ data: { accessToken } })
}

async function signIn(req, res) {
  const { email, password, provider, name, token } = req.body

  if (!provider) {
    res.status(400).send('Provider is required')
  }

  switch (provider) {
    case 'native':
      const validateError = validateSignInRequest(email, password)
      if (validateError) {
        return res
          .status(validateError.status)
          .send({ error: validateError.message })
      }
      const { error, accessToken } = await UserModel.nativeSignIn(
        email,
        password,
        name
      )
      if (error) {
        return res.status(error.status).send({error: error.message})
      }
      res.send({ data: { accessToken } })
      break
    case 'facebook':
      if (!token) {
        res.status(400).send('token is required')
      }
      UserModel.facebookSignIn(token)
      res.send()
      break
    default:
      res.status(400).send('provier must be facebook or native')
  }
}

async function like(req, res) {
  try {
    await UserModel.like(req.user.id, req.body.houseId)
    res.send('success')
  } catch (e) {
    console.log(e)
    res.status(500).send()
  }
}

async function dislike(req, res) {
  try {
    await UserModel.dislike(req.user.id, req.body.houseId)
    res.send('success')
  } catch (e) {
    console.log(e)
    res.status(500).send()
  }
}

async function getLikes(req, res) {
  try {
    const houseIds = await UserModel.getLikes(req.user.id)
    res.send({
      userId: req.user.id,
      favoriteHouseIds: houseIds
    })
  } catch (e) {
    console.log(e)
    res.status(500).send()
  }
}

async function getLikeDetails(req, res) {
  try {
    const favoriteHouses = await UserModel.getLikeDetails(req.user.id)
    res.send({
      userId: req.user.id,
      favoriteHouses
    })
  } catch (e) {
    console.log(e)
    res.status(500).send()
  }
}

module.exports = {
  signUp,
  signIn,
  like,
  dislike,
  getLikes,
  getLikeDetails
}