let express = require('express');
let router = express.Router();
let database = require('../../bin/db');


router.get('/', function (req, res) {
    database.query("SELECT * FROM LOOT").then((results) => {
       res.json(results.rows)
    }).catch((error) => {
        res.json({})
    })

});

router.post('/', function (req, res) {

    const query = {
        text: 'INSERT INTO loot (character_id, raid_id, loot_id, loot_type) VALUES ($1,$2,$3,$4)',
        values: [req.params.character_id,req.params.raid_id,req.params.loot_id,req.params.loot_type]
    };

    database.query(query).then((results) => {
        console.log(results)
    }).catch((error) => {
        res.json({})
    })

});

router.get('/recent', function (req, res) {
    database.query("SELECT character_name,loot_id,loot_type,item_name,character_class FROM LOOT INNER JOIN roster r on loot.character_id = r.character_id INNER JOIN items i on loot.loot_id = i.item_id LIMIT 20").then((results) => {
        res.json(results.rows)
    }).catch((error) => {
        res.json({})
    })

});


module.exports = router;