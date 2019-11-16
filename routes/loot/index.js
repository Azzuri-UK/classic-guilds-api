let express = require('express');
let router = express.Router();
let database = require('../../bin/db');


router.get('/', function (req, res) {
    database.query("SELECT * FROM LOOT").then((results) => {
        console.log(results)
    }).catch((error) => {
        res.json({})
    })

})

module.exports = router;