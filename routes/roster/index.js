let express = require('express');
let router = express.Router();

router.get('/', function (req, res) {
    res.send('roster')
});

module.exports = router;