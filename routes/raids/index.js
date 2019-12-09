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
            'ORDER BY raid_date ASC'
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
            'ORDER BY raid_date ASC'
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
            'ORDER BY raid_date ASC'
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
        values: [req.body.data.startDate, req.body.data.startTime, req.body.data.endTime, req.body.data.zoneId],
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
        values: [req.params.raid_date, req.params.raid_start, req.params.raid_end, req.params.raid_zone, req.params.id],
    };
    database.query(query).then((results) => {
        res.json({success:true});
    }).catch((error) => {
        res.json(error)
    });
});

router.delete('/:id', function (req, res) {
    const query = {
        text: 'DELETE from RAIDS where raid_id = $1',
        values: [req.params.id],
    };
    database.query(query).then((results) => {
        res.json({success:true});
    }).catch((error) => {
        res.json(error)
    });
});

router.get('/:id/attendance/:role', function (req, res) {
    const query = {
        text: 'SELECT character_name,character_class FROM attendance INNER JOIN roster r on attendance.character_id = r.character_id where raid_id = $1 AND role = $2 ORDER BY character_name',
        values: [req.params.id, req.params.role.charAt(0).toUpperCase() + req.params.role.slice(1)],
    };
    console.log(query)
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
    console.log(query)
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
            values: [character.character_id, req.params.id, null, null, character.character_role],
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
    console.log(req.params);
    const query = {
        text: 'DELETE FROM attendance WHERE raid_id = $1 AND character_id =$2',
        values: [req.params.id, req.params.character],
    };
    console.log(query)
    database.query(query).then((results) => {
        res.json({success: "true"})
    }).catch((error) => {
        res.json({success: "false"})
    })

});

router.get('/:id/loot', function (req, res) {
    const query = {
        text: 'SELECT character_name,character_class,r.character_id,loot_type,item_id,item_name,item_quality FROM loot INNER JOIN roster r on loot.character_id = r.character_id INNER JOIN items i on loot.loot_id = i.item_id WHERE raid_id = $1 ORDER BY character_name',
        values: [req.params.id]
    };
    database.query(query).then((results) => {
        res.json(results.rows)
    }).catch((error) => {
        res.json(error)
    })
});

router.post('/:id/loot', function (req, res) {
    const query = {
        text: 'INSERT INTO loot (character_id, raid_id, loot_id, loot_type) VALUES ($1,$2,$3,$4)',
        values: [req.body.data.character_id,req.params.id,req.body.data.item_id,req.body.data.loot_type]
    };

    database.query(query).then((results) => {
        res.json({success:true})
    }).catch((error) => {
        res.json(error.message);
    });
});

router.delete('/:id/loot', function (req, res) {
    const query = {
        text: 'DELETE FROM loot WHERE loot_id=$1 and character_id=$2 AND raid_id=$3',
        values: [req.body.item_id,req.body.character_id,req.params.id]
    };

    database.query(query).then((results) => {
        res.json({success:true})
    }).catch((error) => {
        res.json(error.message);
    });
});

router.post('/:id/attendance/import', function (req, res) {
        let characters = req.body.data.split(";");
        let success = true;
        if (characters.length > 0){
            let promises = []
            characters.forEach((character)=> {
                const query = {
                    text: 'INSERT INTO attendance (character_id,role,raid_id) SELECT r.character_id,r.character_role,$1 FROM (SELECT character_id,character_role FROM roster WHERE character_name = $2) r ON CONFLICT DO NOTHING',
                    values: [req.params.id,character]
                };

                promises.push(database.query(query))
            });
            Promise.all(promises).then(result => {
                res.json({success:true})
            }).catch(error=>{
                res.json({success:false})
            });

        }
});

router.put('/:id/close', function (req, res) {
    const query = {
        text: 'UPDATE raids SET raid_status=0  WHERE raid_id=$1',
        values: [req.params.id]
    };

    database.query(query).then((results) => {
        res.json({success:true})
    }).catch((error) => {
        res.json(error.message);
    });
});
module.exports = router;