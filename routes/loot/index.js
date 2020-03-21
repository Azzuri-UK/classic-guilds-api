let express = require('express');
let router = express.Router();
let database = require('../../config/db');


router.get('/', function (req, res) {
    let query;
    if (req.query.search){
         query = {
            text: 'SELECT character_name,item_id,loot_type,item_name,item_quality,character_class,loot_subcategory,character_status FROM LOOT INNER JOIN roster r on loot.character_id = r.character_id INNER JOIN items i on loot.loot_id = i.item_id INNER JOIN raids ra on loot.raid_id = ra.raid_id WHERE character_name ILIKE $1 OR item_name ILIKE $2 ORDER BY ra.raid_date DESC,ra.raid_start DESC,character_name',
             values: ['%' + req.query.search + '%','%' + req.query.search + '%']
        };
    } else {
         query = {
            text: 'SELECT character_name,item_id,loot_type,item_name,item_quality,character_class,loot_subcategory,character_status FROM LOOT INNER JOIN roster r on loot.character_id = r.character_id INNER JOIN items i on loot.loot_id = i.item_id INNER JOIN raids ra on loot.raid_id = ra.raid_id ORDER BY ra.raid_date DESC,ra.raid_start DESC,character_name'
        };
    }

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
    database.query("SELECT character_name,loot_id,loot_type,item_name,character_class,item_quality,character_status FROM LOOT INNER JOIN roster r on loot.character_id = r.character_id INNER JOIN items i on loot.loot_id = i.item_id INNER JOIN raids ra on loot.raid_id = ra.raid_id ORDER BY ra.raid_date DESC,ra.raid_start DESC,character_name  LIMIT 20").then((results) => {
        res.json(results.rows)
    }).catch((error) => {
        res.json({})
    })

});

router.get('/distribution', function (req, res) {
    let query;
    if (req.query.search){
        query = {
            text:"select distinct roster.character_name,roster.character_class,(select count(*) FROM loot where loot.character_id = roster.character_id AND loot_subcategory=1) AS mainspec, (select count(*) FROM loot where loot.character_id = roster.character_id AND loot_subcategory=2) as minor, (select count(*) FROM loot where loot.character_id = roster.character_id AND loot_subcategory=3) as offspec, (select count(*) FROM loot where loot.character_id = roster.character_id AND loot_subcategory=4) as resist, (select count(*) FROM attendance where attendance.character_id = roster.character_id) as attendance from roster INNER JOIN attendance a on roster.character_id = a.character_id where character_status = 1 AND (character_name ILIKE $1 OR character_class ILIKE $2) order by character_name ASC",
            values: ['%' + req.query.search + '%','%' + req.query.search + '%']
        }
    } else {
        query = "select distinct roster.character_name,roster.character_class,(select count(*) FROM loot where loot.character_id = roster.character_id AND loot_subcategory=1) AS mainspec, (select count(*) FROM loot where loot.character_id = roster.character_id AND loot_subcategory=2) as minor, (select count(*) FROM loot where loot.character_id = roster.character_id AND loot_subcategory=3) as offspec, (select count(*) FROM loot where loot.character_id = roster.character_id AND loot_subcategory=4) as resist, (select count(*) FROM attendance where attendance.character_id = roster.character_id) as attendance from roster INNER JOIN attendance a on roster.character_id = a.character_id where character_status = 1 order by character_name ASC"
    }
    database.query(query).then((results) => {
        res.json(results.rows)
    }).catch((error) => {
        res.json({})
    })

});


module.exports = router;