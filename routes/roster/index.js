let express = require('express');
let router = express.Router();
let database = require('../../config/db');
let ucfirst = require('ucfirst');

router.get('/', function (req, res) {
    database.query("SELECT * FROM ROSTER WHERE character_status = 1 ORDER BY character_name").then((results) => {
        res.json(results.rows)
    }).catch((error) => {
        res.json({})
    })
});

router.get('/:role(tank|healer|damage)', function (req, res) {
    const query = {
        text: "SELECT * FROM roster WHERE character_role = $1 AND character_status = 1 ORDER BY character_name",
        values: [ucfirst(req.params.role)],
    };
    database.query(query).then((results) => {
        res.json(results.rows)
    }).catch((error) => {
        res.json({})
    })
});


router.get('/:userId(\\d+)', function (req, res) {
    const query = {
        text: 'SELECT * FROM roster WHERE character_id = $1',
        values: [req.params.userId],
    };

    database.query(query).then((results) => {
        res.json(results.rows)
    }).catch((error) => {
        res.json(error)
    })
});

router.post('/', function (req, res) {
    let role;
    if (req.body.data.role === 'DPS') {
        role = 'Damage'
    } else {
        role = req.body.data.role
    }
    const query = {
        text: 'INSERT INTO roster (character_name,character_class,character_role) VALUES ($1,$2,$3)',
        values: [req.sanitize(req.body.data.name), req.sanitize(req.body.data.class), req.sanitize(role)],
    };
    database.query(query).then((results) => {
        res.json({success: true})
    }).catch((error) => {
        res.json(error)
    });
});

router.put('/:id', function (req, res) {
    const query = {
        text: 'UPDATE roster SET character_name=$1,character_class=$2,character_role=$3 WHERE character_id = $5',
        values: [req.sanitize(req.params.character_name), req.sanitize(req.params.character_class), req.sanitize(req.params.character_role), req.sanitize(req.params.id)]
    };
    database.query(query).then((results) => {
        res.json({success: true})
    }).catch((error) => {
        res.json(error)
    });
});

router.delete('/:id', function (req, res) {
    const query = {
        text: 'DELETE from roster where character_id = $1',
        values: [req.sanitize(req.params.id)],
    };
    database.query(query).then((results) => {
        res.json({success: true})
    }).catch((error) => {
        res.json(error)
    });
});

router.get('/epgp', async function (req, res) {
    database.query("SELECT DISTINCT character_name,* FROM ROSTER WHERE character_status = 1 ORDER BY character_name").then(async (results) => {
        let raidScores = {
            'BWL': 78,
            'MC': 53,
            'ZG': 0,
            'ONY': 5
        }
        for (const result of results.rows) {
            let effortPoints = 0;
            let gearPoints = 0;
            let raidsQuery = {
                text: 'SELECT raid_zone,raids.raid_id FROM attendance INNER JOIN raids on attendance.raid_id = raids.raid_id WHERE character_id =$1 ORDER BY raid_date',
                values: [result.character_id],
            };
            let raids = await database.query(raidsQuery)
            for (const raid of raids.rows) {
                if (raid.raid_zone === 'BWL') {
                    if (effortPoints > 0) {
                        effortPoints = (effortPoints - (effortPoints * 0.10))
                    }
                    if (gearPoints > 30) {
                        gearPoints = (gearPoints - (gearPoints * 0.10))
                    }
                }
                effortPoints += raidScores[raid.raid_zone]
                let lootQuery = {
                    text: 'SELECT items.item_gp,loot_type,loot_subcategory FROM loot INNER JOIN items ON loot.loot_id = items.item_id WHERE character_id = $1 AND raid_id= $2',
                    values: [result.character_id, raid.raid_id]
                };

                let loot = await database.query(lootQuery)

                for (const lootItem of loot.rows) {
                    switch (lootItem.loot_type) {
                        case 1:
                            gearPoints += lootItem.item_gp;
                            break;
                        case 2:
                            break;
                        case 3:
                            switch (lootItem.loot_subcategory) {
                                case 1:
                                    gearPoints += lootItem.item_gp;
                                    break;
                                case 2:
                                    gearPoints += ((25 / 100) * lootItem.item_gp);
                                    break;
                                case 3:
                                case 4:
                                case 5:
                                    // do nothing;
                                    break;

                            }
                            break
                    }
                }
            }
            if (gearPoints < 30) {
                gearPoints = 30;
            }
            result.effort_points = effortPoints;
            result.gear_points = Math.round(gearPoints);
            result.priority = (effortPoints / gearPoints).toFixed(2)
        }
        console.log('done' )
        res.json(results.rows)
    }).catch((error) => {
        res.json(error)
    })
});


module.exports = router;