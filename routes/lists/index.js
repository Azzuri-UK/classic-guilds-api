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

router.get('/:listId', async function (req, res) {
    let listParamQuery = {
        text: "SELECT raid_zone,type,modifier from priority_lists WHERE id = $1",
        values: [req.sanitize(req.params.listId)]
    };
    let listParams = await database.query(listParamQuery);

    if (listParams.rows.length > 0) {
        let query;
        switch(listParams.rows[0].type){
            case 0:
                if (listParams.rows[0].raid_zone === 'ALL'){
                    query = {
                        text: "select character_name,character_class,count(a.raid_id) as count from roster inner join attendance a on roster.character_id = a.character_id where not exists(SELECT * FROM loot INNER JOIN priority_list_items on loot.loot_id = priority_list_items.item_id where loot.loot_id = priority_list_items.item_id AND priority_list_items.list_id =$1 AND loot.character_id= roster.character_id) AND roster.character_status =1 group by character_name,character_class order by count desc",
                        values: [req.sanitize(req.params.listId)]
                    };
                } else {
                    query = {
                        text: "select character_name, character_class, count(a.raid_id) as count from roster inner join attendance a on roster.character_id = a.character_id inner join raids on a.raid_id = raids.raid_id where not exists(SELECT * FROM loot INNER JOIN priority_list_items on loot.loot_id = priority_list_items.item_id where loot.loot_id = priority_list_items.item_id AND priority_list_items.list_id = $1 AND loot.character_id = roster.character_id) AND roster.character_status = 1 AND raids.raid_zone = $2 group by character_name, character_class order by count desc",
                        values: [req.sanitize(req.params.listId),listParams.rows[0].raid_zone]
                    };
                }

                database.query(query).then((results) => {
                    res.json(results.rows)
                }).catch((error) => {
                    console.log(error.message)
                    res.json({})
                })
                break;
            case 1:
                query = {
                    text: "select character_name, character_class, count(a.raid_id) as count,(SELECT count(*) FROM loot INNER JOIN priority_list_items on loot.loot_id = priority_list_items.item_id where loot.loot_id = priority_list_items.item_id AND priority_list_items.list_id = $1 AND loot.character_id = roster.character_id) as num_items from roster inner join attendance a on roster.character_id = a.character_id AND roster.character_status = 1 group by character_name, character_class,roster.character_id order by count desc",
                    values: [req.sanitize(req.params.listId)]
                };
                database.query(query).then((results) => {
                    for (let result of results.rows){
                        let priority = result.count - (result.num_items * listParams.rows[0].modifier);
                        if (priority < 0){
                            priority = 0;
                        }
                        result.priority = priority
                    }
                    res.json(results.rows)
                }).catch((error) => {
                    console.log(error.message)
                    res.json({})
                })
                break;
        }


    } else {
        res.json({
            error: 'invalid id'
        })
    }

});

router.get('/:listId/items', async function (req, res) {
    let query = {
        text: "SELECT item_name,item_quality,items.item_id FROM priority_list_items INNER JOIN items ON priority_list_items.item_id = items.item_id where list_id = $1",
        values: [req.sanitize(req.params.listId)]
    };
    database.query(query).then((results) => {
        res.json(results.rows)
    }).catch((error) => {
        console.log(error.message)
        res.json({})
    })
});

router.get('/:listId/zones', async function (req, res) {

    let query = {
        text: "SELECT raid_zone FROM priority_lists WHERE id = $1",
        values: [req.sanitize(req.params.listId)]
    };
    database.query(query).then((results) => {
        res.json(results.rows)
    }).catch((error) => {
        console.log(error.message)
        res.json({})
    })
});
module.exports = router;