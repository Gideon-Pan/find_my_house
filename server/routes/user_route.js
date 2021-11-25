const router = require('express').Router()

const { authentication } = require('../../util/util')
// const {
//     wrapAsync,
//     authentication
// } = require('../../util/util');

// const USER = require('../models/user_model')

const {
  signUp,
  signIn,
  like,
  dislike,
  getLikes,
  getLikeDetails
} = require('../controllers/user_controller')

router.route('/user/signup').post(signUp)

router.route('/user/signin').post(signIn)

router.route('/user/like').post(authentication(), like)

router.route('/user/like').delete(authentication(), dislike)

router.route('/user/like').get(authentication(), getLikes)

router.route('/user/like/details').get(authentication(), getLikeDetails)

module.exports = router