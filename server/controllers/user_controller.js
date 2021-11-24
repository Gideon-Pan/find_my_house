require('dotenv').config()
const validator = require('validator')
// const User = require('../models/user_model')
const UserService = require('../service/user_service')
const UserModel = require('../models/user_model')

const signUpOld = async (req, res) => {
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

const nativeSignInOld = async (email, password) => {
  if (!email || !password) {
    return {
      error: 'Request Error: email and password are required.',
      status: 400
    }
  }

  try {
    return await UserModel.nativeSignIn(email, password)
  } catch (error) {
    return { error }
  }
}

const facebookSignInOld = async (accessToken) => {
  if (!accessToken) {
    return { error: 'Request Error: access token is required.', status: 400 }
  }

  try {
    const profile = await UserModel.getFacebookProfile(accessToken)
    const { id, name, email } = profile

    if (!id || !name || !email) {
      return {
        error:
          'Permissions Error: facebook access token can not get user user information'
      }
    }

    return await UserModel.facebookSignIn(id, UserModel.USER_ROLE.USER, name, email)
  } catch (error) {
    return { error: error }
  }
}

const signInOld = async (req, res) => {
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

async function signUp(req, res) {
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

  if (!email) {
    res.status(400).send('Email is required')
  }
  if (!password) {
    res.status(400).send('Password is required')
  }
  // if (!provider) {
  //   res.status(400).send('Provider i required')
  // }
  if (!name) {
    res.status(400).send('Name is required')
  }

  // validation

  const result = await UserService.signUp(email, password, name)
  if (result.error) {
    // console.log(error)
    return res.status(result.error.status).send({error: result.error.message})
  }
  res.send({data: {accessToken: result.accessToken}})
}

async function signIn(req, res) {
  const {email, password, provider, name, token} = req.body
  // validation...
  // ...
  if (!email || !password) {
    return {
      error: 'Request Error: email and password are required.',
      status: 400
    }
  }

  if (!provider) {
    res.status(400).send('Provider is required')
  }

  switch(provider) {
    case 'native':
      if (!password) {
        res.status(400).send('Password is required')
      }
      // if (!name) {
      //   res.status(400).send('Name is required')
      // }
      if (!email) {
        res.status(400).send('Email is required')
      }
      const result = await UserService.nativeSignIn(email, password, name)
      if (result.error) {
        const error = result.error
        // console.log(error)
        return res.status(error.status).send(error.message)
      }
      // console.log(result)

      res.send({data: {accessToken: result.accessToken}})
      break
    case 'facebook':
      if (!token) {
        res.status(400).send('token is required')
      }
      UserService.facebookSignIn(token)
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
	} catch(e) {
		console.log(e)
		res.status(500).send()
	}
}

async function getLikes(req, res) {
	try {
		const houseIds = await UserModel.getLikesById(req.user.id)
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

async function getFavorite(req, res) {
  try {
    const favoriteHouses = await UserModel.getFavoriteById(req.user.id)
    // console.log(houseIds)
		res.send({
      userId: req.user.id,
      favoriteHouses
    })
  } catch(e) {
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
  getFavorite
}
