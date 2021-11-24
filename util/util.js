require('dotenv').config()
const jwt = require('jsonwebtoken')
const Redis = require('./redis')
const User = require('../server/models/user_model')
const { TOKEN_SECRET } = process.env // 30 days by seconds

const N = Number(process.env.N)
const M = Number(process.env.M)

// reference: https://thecodebarbarian.com/80-20-guide-to-express-error-handling
const wrapAsync = (fn) => {
  return function (req, res, next) {
    // Make sure to `.catch()` any errors and pass them along to the `next()`
    // middleware in the chain, in this case the error handler.
    fn(req, res, next).catch(next)
  }
}

async function rateLimiter(req, res, next) {
  if (!Redis.client.connected) {
    return next()
  }

  // rate limiter
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || null
  //   console.log(ip)
  const counter = await Redis.get(`counter-${ip}`)

  if (counter >= N) {
    console.log('rate limit')
    return res.status(400).send()
  }

  await Redis.incr(`counter-${ip}`)
  setTimeout(() => {
    Redis.decr(`counter-${ip}`)
  }, M * 1000)

  next()
}

const authentication = (roleId) => {
  return async function (req, res, next) {
    let accessToken = req.get('Authorization')
    // console.log(accessToken)
    if (!accessToken) {
      console.log('what')
      res.status(401).send({ error: 'Unauthorized' })
      return
    }
    // console.log(accessToken)

    accessToken = accessToken.replace('Bearer ', '')
    // console.log(accessToken)
    if (accessToken == 'null') {
      res.status(401).send({ error: 'Unauthorized' })
      return
    }
    // console.log('hear')
    try {
      // console.log('*')
      // console.log(roleId)
      // console.log(accessToken)
      const user = jwt.verify(accessToken, TOKEN_SECRET)
      // console.log('#')
      // console.log(user)
      req.user = user

      let userDetail
      userDetail = await User.getUserDetail(user.email)
      // console.log(userDetail)
      if (!userDetail) {
        res.status(403).send({ error: 'Forbidden' })
      } else {
        req.user.id = userDetail.id
        next()
      }
      return
    } catch (err) {
      console.log(err)
      res.status(403).send({ error: 'Forbidden' })
      return
    }
  }
}

function isInBox(
  latitude,
  longitude,
  latitudeTopLeft,
  latitudeBottomRight,
  longitudeTopLeft,
  longitudeBottomRight
) {
  return (
    latitude < latitudeTopLeft &&
    latitude > latitudeBottomRight &&
    longitude > longitudeBottomRight &&
    longitude < longitudeTopLeft
  )
}

module.exports = {
  wrapAsync,
  authentication,
  rateLimiter,
  isInBox
}
