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
        let raidUsers = [];
        for (const result of results.rows) {
            result.effortPoints = 0;
            result.gearPoints = 0;
            raidUsers[result.character_id] = result;
        }

        let raidsQuery = {
            text: 'SELECT raid_zone,raids.raid_id FROM raids ORDER BY raid_date'
        };
        let raids = await database.query(raidsQuery)
        for (const raid of raids.rows) {
            if (raid.raid_zone === 'BWL') {
                raidUsers.forEach((user, index) => {
                    raidUsers[user.character_id].effortPoints = (raidUsers[user.character_id].effortPoints - (raidUsers[user.character_id].effortPoints * 0.10))
                    raidUsers[user.character_id].gearPoints = (raidUsers[user.character_id].gearPoints - (raidUsers[user.character_id].gearPoints * 0.10))
                })
            }
            let attendanceQuery = {
                text: 'SELECT character_id FROM attendance WHERE raid_id = $1',
                values: [raid.raid_id],
            };
            let attendance = await database.query(attendanceQuery)
            attendance.rows.forEach(attendee => {
                if (attendee.character_id in raidUsers) {
                    raidUsers[attendee.character_id].effortPoints += raidScores[raid.raid_zone]
                }

            })

            let lootQuery = {
                text: 'SELECT items.item_gp,loot_type,loot_subcategory,character_id FROM loot INNER JOIN items ON loot.loot_id = items.item_id WHERE raid_id= $1',
                values: [raid.raid_id],
            };
            let loot = await database.query(lootQuery)
            loot.rows.forEach(item => {
                if (item.character_id in raidUsers) {
                    switch (item.loot_type) {
                        case 1:
                            raidUsers[item.character_id].gearPoints += item.item_gp;
                            break;
                        case 2:
                            break;
                        case 3:
                            switch (item.loot_subcategory) {
                                case 1:
                                    raidUsers[item.character_id].gearPoints += item.item_gp;
                                    break;
                                case 2:
                                    raidUsers[item.character_id].gearPoints += ((25 / 100) * item.item_gp);
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

            })
        }
        let data = [];
        raidUsers.forEach(user => {
            if (user){
                user.effort_points = Math.round(user.effortPoints)
                user.gear_points = Math.round(user.gearPoints)
                if (user.gear_points < 30) {
                    user.gear_points = 30;
                }
                user.priority = (user.effort_points / user.gear_points).toFixed(2)
                data.push(user)
            }
        })
        res.json(data)
    }).catch((error) => {
        res.json(error)
    })
});


module.exports = router;