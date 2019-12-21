let express = require('express');
let router = express.Router();
let database = require('../../config/db');


router.get('/', function (req, res) {
    const query = {
        text: 'SELECT character_name,item_id,loot_type,item_name,item_quality,character_class,loot_subcategory,character_status FROM LOOT INNER JOIN roster r on loot.character_id = r.character_id INNER JOIN items i on loot.loot_id = i.item_id INNER JOIN raids ra on loot.raid_id = ra.raid_id ORDER BY ra.raid_date DESC,ra.raid_start DESC,character_name'
    };
    database.query(query).then((results) => {
       res.json(results.rows)
    }).catch((error) => {
        res.json({})
    })

});

router.post('/', function (req, res) {

    const query = {
        text: 'INSERT INTO loot (character_id, raid_id, loot_id, loot_type) VALUES ($1,$2,$3,$4)',
        values: [req.sanitize(req.params.character_id),req.sanitize(req.params.raid_id),req.sanitize(req.params.loot_id),req.sanitize(req.params.loot_type)]
    };

    database.query(query).then((results) => {
        res.json({success:true})
    }).catch((error) => {
        res.json({})
    })

});

router.get('/recent', function (req, res) {
    database.query("SELECT character_name,loot_id,loot_type,item_name,character_class,item_quality FROM LOOT INNER JOIN roster r on loot.character_id = r.character_id INNER JOIN items i on loot.loot_id = i.item_id INNER JOIN raids ra on loot.raid_id = ra.raid_id ORDER BY ra.raid_date DESC,ra.raid_start DESC,character_name  LIMIT 20").then((results) => {
        res.json(results.rows)
    }).catch((error) => {
        res.json({})
    })

});



module.exports = router;