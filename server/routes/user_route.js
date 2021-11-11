const router = require('express').Router()

const { authentication } = require('../../util/util')
// const {
//     wrapAsync,
//     authentication
// } = require('../../util/util');

const USER = require('../models/user_model')

const {
  signUp,
  signIn,
  getUserProfile,
  like,
  dislike,
  getLikes
} = require('../controllers/user_controller')

router.route('/user/signup').post(signUp)

router.route('/user/signin').post(signIn)

router.route('/user/checkAuth').get(authentication(), getUserProfile)

router.route('/user/like').post(authentication(USER.USER_ROLE.USER), like)

router.route('/user/like').delete(authentication(USER.USER_ROLE.USER), dislike)

router.route('/user/like').get(authentication(USER.USER_ROLE.USER), getLikes)
// router.route('/user/profile')
//     .get(authentication(), wrapAsync(getUserProfile));

module.exports = router
