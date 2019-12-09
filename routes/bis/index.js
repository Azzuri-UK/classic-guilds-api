let express = require('express');
let router = express.Router();
let database = require('../../config/db');


router.get('/', function (req, res) {
    const query = {
        text: 'SELECT recipe,profession,item_id,item_quality FROM recipes'
    };
    database.query(query).then((results) => {
       res.json(results.rows)
    }).catch((error) => {
        res.json({})
    })
});





module.exports = router;