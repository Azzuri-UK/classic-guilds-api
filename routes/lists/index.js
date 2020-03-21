let express = require('express');
let router = express.Router();
let database = require('../../config/db');

router.get('/', function (req, res) {
    database.query("SELECT * FROM priority_lists").then((results) => {
        res.json(results.rows)
    }).catch((error) => {
        res.json({})
    })

});

router.get('/:id', function (req, res) {
    let query = {
        text: "select character_name,count(a.raid_id) as count from roster inner join attendance a on roster.character_id = a.character_id where not exists(SELECT * FROM loot INNER JOIN priority_list_items on loot.loot_id = priority_list_items.item_id where loot.loot_id = priority_list_items.item_id AND public.priority_list_items.list_id =$1 AND loot.character_id= roster.character_id) group by character_name order by count desc",
        values: [ req.sanitize(req.params.id)]
    };
    database.query(query).then((results) => {
        res.json(results.rows)
    }).catch((error) => {
        res.json({})
    })

});

module.exports = router;