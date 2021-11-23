const router = require('express').Router();

const { search } = require('../controllers/search_controller');
// const {
//     wrapAsync,
//     authentication
// } = require('../../util/util');


router.route('/search')
    .get(search);


// router.route('/user/profile')
//     .get(authentication(), wrapAsync(getUserProfile));

module.exports = router;
