let express = require('express');
let router = express.Router();
let database = require('../../config/db');

router.get('/', function (req, res) {
    const query = {
        text: 'SELECT *,\n' +
            '       (SELECT COUNT(*)\n' +
            '        FROM public.attendance\n' +
            '                 INNER JOIN roster r on attendance.character_id = r.character_id\n' +
            '        WHERE attendance.raid_id = raids.raid_id AND r.character_role=\'Tank\' ) as tank_count,\n' +
            '       (SELECT COUNT(*)\n' +
            '        FROM public.attendance\n' +
            '                 INNER JOIN roster r on attendance.character_id = r.character_id\n' +
            '        WHERE attendance.raid_id = raids.raid_id AND r.character_role=\'Healer\' ) as healer_count,\n' +
            '       (SELECT COUNT(*)\n' +
            '        FROM public.attendance\n' +
            '                 INNER JOIN roster r on attendance.character_id = r.character_id\n' +
            '        WHERE attendance.raid_id = raids.raid_id AND r.character_role=\'Damage\' ) as damage_count\n' +
            'FROM raids\n' +
            'ORDER BY raid_date DESC'
    };
    database.query(query).then((results) => {
        res.json(results.rows)
    }).catch((error) => {
        res.json({})
    })
});

router.get('/open/', function (req, res) {
    const query = {
        text: 'SELECT *,\n' +
            '       (SELECT COUNT(*)\n' +
            '        FROM public.attendance\n' +
            '                 INNER JOIN roster r on attendance.character_id = r.character_id\n' +
            '        WHERE attendance.raid_id = raids.raid_id AND r.character_role=\'Tank\' ) as tank_count,\n' +
            '       (SELECT COUNT(*)\n' +
            '        FROM public.attendance\n' +
            '                 INNER JOIN roster r on attendance.character_id = r.character_id\n' +
            '        WHERE attendance.raid_id = raids.raid_id AND r.character_role=\'Healer\' ) as healer_count,\n' +
            '       (SELECT COUNT(*)\n' +
            '        FROM public.attendance\n' +
            '                 INNER JOIN roster r on attendance.character_id = r.character_id\n' +
            '        WHERE attendance.raid_id = raids.raid_id AND r.character_role=\'Damage\' ) as damage_count\n' +
            'FROM raids\n' +
            'WHERE raid_status = 1\n' +
            'ORDER BY raid_date DESC'
    };
    database.query(query).then((results) => {
        res.json(results.rows)
    }).catch((error) => {
        res.json({})
    })
});

router.get('/upcoming/', function (req, res) {
    const query = {
        text: 'SELECT *,\n' +
            '       (SELECT COUNT(*)\n' +
            '        FROM public.attendance\n' +
            '                 INNER JOIN roster r on attendance.character_id = r.character_id\n' +
            '        WHERE attendance.raid_id = raids.raid_id AND r.character_role=\'Tank\' ) as tank_count,\n' +
            '       (SELECT COUNT(*)\n' +
            '        FROM public.attendance\n' +
            '                 INNER JOIN roster r on attendance.character_id = r.character_id\n' +
            '        WHERE attendance.raid_id = raids.raid_id AND r.character_role=\'Healer\' ) as healer_count,\n' +
            '       (SELECT COUNT(*)\n' +
            '        FROM public.attendance\n' +
            '                 INNER JOIN roster r on attendance.character_id = r.character_id\n' +
            '        WHERE attendance.raid_id = raids.raid_id AND r.character_role=\'Damage\' ) as damage_count\n' +
            'FROM raids\n' +
            'WHERE raid_status = 1\n' +
            'AND raid_date >= CURRENT_DATE\n' +
            'ORDER BY raid_date DESC'
    };
    database.query(query).then((results) => {
        res.json(results.rows)
    }).catch((error) => {
        res.json({})
    })
});

router.get('/closed/', function (req, res) {
    const query = {
        text: 'SELECT *,\n' +
            '       (SELECT COUNT(*)\n' +
            '        FROM public.attendance\n' +
            '                 INNER JOIN roster r on attendance.character_id = r.character_id\n' +
            '        WHERE attendance.raid_id = raids.raid_id AND r.character_role=\'Tank\' ) as tank_count,\n' +
            '       (SELECT COUNT(*)\n' +
            '        FROM public.attendance\n' +
            '                 INNER JOIN roster r on attendance.character_id = r.character_id\n' +
            '        WHERE attendance.raid_id = raids.raid_id AND r.character_role=\'Healer\' ) as healer_count,\n' +
            '       (SELECT COUNT(*)\n' +
            '        FROM public.attendance\n' +
            '                 INNER JOIN roster r on attendance.character_id = r.character_id\n' +
            '        WHERE attendance.raid_id = raids.raid_id AND r.character_role=\'Damage\' ) as damage_count\n' +
            'FROM raids\n' +
            'WHERE raid_status = 0\n' +
            'ORDER BY raid_date DESC'
    };
    database.query(query).then((results) => {
        res.json(results.rows)
    }).catch((error) => {
        res.json({})
    })
});


router.get('/:id', function (req, res) {
    const query = {
        text: 'SELECT * FROM raids WHERE raid_id = $1 ORDER BY raid_date ASC',
        values: [req.params.id],
    };

    database.query(query).then((results) => {
        res.json(results.rows)
    }).catch((error) => {
        res.json(error)
    })
});

router.post('/', function (req, res) {
    const query = {
        text: 'INSERT INTO raids (raid_date,raid_start,raid_end,raid_zone) VALUES ($1,$2,$3,$4)',
        values: [req.sanitize(req.body.data.startDate), req.sanitize(req.body.data.startTime), req.sanitize(req.body.data.endTime), req.sanitize(req.body.data.zoneId)],
    };
    database.query(query).then((results) => {
        res.json(results.rows)
    }).catch((error) => {
        res.json(error)
    });
});

router.put('/:id', function (req, res) {
    const query = {
        text: 'UPDATE raids SET raid_date=$1,raid_start=$2,raid_end=$3,raid_zone=$4 WHERE raid_id = $5',
        values: [req.sanitize(req.params.raid_date), req.sanitize(req.params.raid_start), req.sanitize(req.params.raid_end), req.sanitize(req.params.raid_zone), req.sanitize(req.params.id)],
    };
    database.query(query).then((results) => {
        res.json({success: true});
    }).catch((error) => {
        res.json(error)
    });
});

router.delete('/:id', function (req, res) {
    const query = {
        text: 'DELETE from RAIDS where raid_id = $1',
        values: [req.sanitize(req.params.id)],
    };
    database.query(query).then((results) => {
        res.json({success: true});
    }).catch((error) => {
        res.json(error)
    });
});

router.get('/:id/attendance/:role', function (req, res) {
    const query = {
        text: 'SELECT character_name,character_class FROM attendance INNER JOIN roster r on attendance.character_id = r.character_id where raid_id = $1 AND role = $2 ORDER BY character_name',
        values: [req.params.id, req.params.role.charAt(0).toUpperCase() + req.params.role.slice(1)],
    };
    database.query(query).then((results) => {
        res.json(results.rows)
    }).catch((error) => {
        res.json(error)
    })
});

router.get('/:id/attendance', function (req, res) {
    const query = {
        text: 'SELECT attendance.character_id,character_name,character_class,attendance.role FROM attendance INNER JOIN roster r on attendance.character_id = r.character_id where raid_id = $1 ORDER BY character_name',
        values: [req.params.id]
    };
    database.query(query).then((results) => {
        res.json(results.rows)
    }).catch((error) => {
        res.json(error)
    })
});

router.post('/:id/attendance/', function (req, res) {
    let promises = [];
    req.body.data.forEach(character => {
        const query = {
            text: 'INSERT INTO attendance (character_id,raid_id,start_time,end_time,role) VALUES ($1,$2,$3,$4,$5)',
            values: [req.sanitize(character.character_id), req.sanitize(req.params.id), null, null, req.sanitize(character.character_role)],
        };
        promises.push(database.query(query))
    });
    Promise.all(promises).then(results => {
        res.json({success: "true"})
    }).catch(error => {
        res.json({success: "false"})
    })
});

router.delete('/:id/attendance/:character', function (req, res) {
    const query = {
        text: 'DELETE FROM attendance WHERE raid_id = $1 AND character_id =$2',
        values: [req.sanitize(req.params.id), req.sanitize(req.params.character)],
    };
    database.query(query).then((results) => {
        res.json({success: "true"})
    }).catch((error) => {
        res.json({success: "false"})
    })

});

router.get('/:id/loot', function (req, res) {
    const query = {
        text: 'SELECT character_name,character_class,r.character_id,loot_type,item_id,item_name,item_quality,loot_subcategory FROM loot INNER JOIN roster r on loot.character_id = r.character_id INNER JOIN items i on loot.loot_id = i.item_id WHERE raid_id = $1 ORDER BY character_name',
        values: [req.sanitize(req.params.id)]
    };
    database.query(query).then((results) => {
        res.json(results.rows)
    }).catch((error) => {
        res.json(error)
    })
});

router.post('/:id/loot', function (req, res) {
    let charId;
    if (req.body.data.disenchant === true){
        charId = 3020
    } else {
        charId = req.sanitize(req.body.data.character_id)
    }
    const query = {
        text: 'INSERT INTO loot (character_id, raid_id, loot_id, loot_type,loot_subcategory) VALUES ($1,$2,$3,$4,$5)',
        values: [charId, req.sanitize(req.params.id), req.sanitize(req.body.data.item_id), req.sanitize(req.body.data.loot_type), req.sanitize(req.body.data.loot_subtype)]
    };

    database.query(query).then((results) => {
        res.json({success: true})
    }).catch((error) => {
        res.json(error.message);
    });
});



router.delete('/:id/loot', function (req, res) {
    const query = {
        text: 'DELETE FROM loot WHERE loot_id=$1 and character_id=$2 AND raid_id=$3',
        values: [req.sanitize(req.body.item_id), req.sanitize(req.body.character_id), req.sanitize(req.params.id)]
    };

    database.query(query).then((results) => {
        res.json({success: true})
    }).catch((error) => {
        res.json(error.message);
    });
});

router.post('/:id/attendance/import', function (req, res) {
    let characters = req.body.data.split(";");
    let success = true;
    if (characters.length > 0) {
        let promises = []
        characters.forEach((character) => {
            let char = character.split(" ");
            const query = {
                text: 'INSERT INTO attendance (character_id,role,raid_id) SELECT r.character_id,r.character_role,$1 FROM (SELECT character_id,character_role FROM roster WHERE character_name = $2) r ON CONFLICT DO NOTHING',
                values: [req.sanitize(req.params.id), char[0]]
            };

            promises.push(database.query(query))
        });
        Promise.all(promises).then(result => {
            res.json({success: true})
        }).catch(error => {
            res.json({success: false})
        });

    }
});

router.put('/:id/close', function (req, res) {
    const query = {
        text: 'UPDATE raids SET raid_status=0  WHERE raid_id=$1',
        values: [req.sanitize(req.params.id)]
    };

    database.query(query).then((results) => {
        res.json({success: true})
    }).catch((error) => {
        res.json(error.message);
    });
});
module.exports = router;