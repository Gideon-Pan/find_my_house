require('dotenv').config()
const validator = require('validator')
const User = require('../models/user_model')

const signUp = async (req, res) => {
  // console.log(req.body)
  let { name } = req.body
  const { email, password } = req.body
  // console.log(req.body)

  if (!name || !email || !password) {
    res
      .status(400)
      .send({ error: 'Request Error: name, email and password are required.' })
    return
  }

  if (!validator.isEmail(email)) {
    res.status(400).send({ error: 'Request Error: Invalid email format' })
    return
  }

  name = validator.escape(name)

  const result = await User.signUp(name, email, password)
  if (result.error) {
    res.status(403).send({ error: result.error })
    return
  }

  const user = result.user
  if (!user) {
    res.status(500).send({ error: 'Database Query Error' })
    return
  }
  console.log('successfully sign up')
  res.status(200).send({
    data: {
      access_token: user.access_token,
      access_expired: user.access_expired,
      login_at: user.login_at,
      user: {
        id: user.id,
        provider: user.provider,
        name: user.name,
        email: user.email,
        picture: user.picture
      }
    }
  })
}

const nativeSignIn = async (email, password) => {
  if (!email || !password) {
    return {
      error: 'Request Error: email and password are required.',
      status: 400
    }
  }

  try {
    return await User.nativeSignIn(email, password)
  } catch (error) {
    return { error }
  }
}

const facebookSignIn = async (accessToken) => {
  if (!accessToken) {
    return { error: 'Request Error: access token is required.', status: 400 }
  }

  try {
    const profile = await User.getFacebookProfile(accessToken)
    const { id, name, email } = profile

    if (!id || !name || !email) {
      return {
        error:
          'Permissions Error: facebook access token can not get user id, name or email'
      }
    }

    return await User.facebookSignIn(id, User.USER_ROLE.USER, name, email)
  } catch (error) {
    return { error: error }
  }
}

const signIn = async (req, res) => {
  const data = req.body
  // console.log(data)

  let result
  switch (data.provider) {
    case 'native':
      result = await nativeSignIn(data.email, data.password)
      break
    case 'facebook':
      result = await facebookSignIn(data.access_token)
      break
    default:
      result = { error: 'Wrong Request' }
  }

  if (result.error) {
    const status_code = result.status ? result.status : 403
    res.status(status_code).send({ error: result.error })
    return
  }

  const user = result.user
  if (!user) {
    res.status(500).send({ error: 'Database Query Error' })
    return
  }

  res.status(200).send({
    data: {
      access_token: user.access_token,
      access_expired: user.access_expired,
      login_at: user.login_at,
      user: {
        id: user.id,
        provider: user.provider,
        name: user.name,
        email: user.email,
        picture: user.picture
      }
    }
  })
}

const getUserProfile = async (req, res) => {
  res.status(200).send({
    data: {
      provider: req.user.provider,
      name: req.user.name,
      email: req.user.email,
      picture: req.user.picture
    }
  })
  return
}

async function like(req, res) {
  // console.log('get it')
  console.log(req.user.id)
  console.log(req.body.houseId)
  // console.log(req)
  // res.send('hi')
  try {
    await User.like(req.user.id, req.body.houseId)
		res.send('success')
  } catch (e) {
    console.log(e)
    res.status(500).send()
  }
}

async function dislike(req, res) {
	try {
		await User.dislike(req.user.id, req.body.houseId)
		res.send('success')
	} catch(e) {
		console.log(e)
		res.status(500).send()
	}
}

async function getLikes(req, res) {
	try {
		const houseIds = await User.getLikesById(req.user.id)
    // console.log(houseIds)
		res.send({
      userId: req.user.id,
      favoriteHouseIds: houseIds
    })
	} catch(e) {
		console.log(e)
		res.status(500).send()
	}
}

module.exports = {
  signUp,
  signIn,
  getUserProfile,
  like,
	dislike,
	getLikes,
}
