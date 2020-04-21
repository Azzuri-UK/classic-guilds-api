let express = require('express');
let router = express.Router();
let database = require('../../config/db');


router.get('/', function (req, res) {
    database.query("SELECT * FROM LOOT").then((results) => {
       res.json(results.rows)
    }).catch((error) => {
        res.json({})
    })

});



router.get('/:zone', function (req, res) {
    const query = {
        text: 'SELECT * FROM items WHERE item_zone = $1 ORDER BY item_name ASC',
        values: [req.params.zone],
    };

    database.query(query).then((results) => {
        res.json(results.rows)
    }).catch((error) => {
        res.json(error)
    })

});



module.exports = router;