let express = require('express');
let router = express.Router();
let loot = require('./loot');
let raids = require('./raids');
let roster = require('./roster');


router.use('/loot',loot);
router.use('/raids',raids);
router.use('/roster',roster);

module.exports = router;
