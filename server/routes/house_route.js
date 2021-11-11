const router = require('express').Router();

const { getLifeFunction } = require('../controllers/house_controller');
// const {
//     wrapAsync,
//     authentication
// } = require('../../util/util');


router.route('/house/details')
    .get(getLifeFunction);


// router.route('/user/profile')
//     .get(authentication(), wrapAsync(getUserProfile));

module.exports = router;
