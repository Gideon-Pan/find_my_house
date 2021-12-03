const router = require('express').Router();

const { getLifeFunction } = require('../controllers/house_controller');

router.route('/house/details')
    .get(getLifeFunction);

module.exports = router;
