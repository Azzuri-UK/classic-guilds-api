let express = require('express');
let router = express.Router();
let database = require('../../config/db');
let audit = require('../../config/audit');

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
        text: 'SELECT character_name,character_class,r.character_id,loot_type,item_id,item_name,item_quality,loot_subcategory,loot.id FROM loot INNER JOIN roster r on loot.character_id = r.character_id INNER JOIN items i on loot.loot_id = i.item_id WHERE raid_id = $1 ORDER BY character_name',
        values: [req.sanitize(req.params.id)]
    };
    database.query(query).then((results) => {
        res.json(results.rows)
    }).catch((error) => {
        res.json(error)
    })
});

router.post('/:id/loot', function (req, res) {
    let notes;
    ;
    if (req.body.data.notes) {
        notes = req.sanitize(req.body.data.notes)
    } else {
        notes = ''
    }
    let charId;
    if (req.body.data.disenchant === true) {
        charId = 3020
    } else {
        charId = req.sanitize(req.body.data.character_id)
    }
    const query = {
        text: 'INSERT INTO loot (character_id, raid_id, loot_id, loot_type,loot_subcategory,notes) VALUES ($1,$2,$3,$4,$5,$6)',
        values: [charId, req.sanitize(req.params.id), req.sanitize(req.body.data.item_id), req.sanitize(req.body.data.loot_type), req.sanitize(req.body.data.loot_subcategory), notes]
    };

    database.query(query).then(async (results) => {
        await audit.writeAuditEvent(req.decoded.user.id, req.body.data.item_id, 'ADD', null, req.sanitize(req.body.data.loot_subcategory), null, new Date(), req.sanitize(req.body.data.character_id));
        res.json({success: true})
    }).catch((error) => {
        res.json(error.message);
    });
});

router.put('/:id/loot/:lootId', async function (req, res) {
    const query = {
        text: 'SELECT * from loot where loot.id = $1',
        values: [req.sanitize(req.params.lootId)]
    };
    let oldValues;
    await database.query(query).then((results) => {
        oldValues = results.rows[0];
    }).catch((error) => {
        res.json(error.message);
    });
    const editQuery = {
        text: 'UPDATE loot SET loot_subcategory=$1 WHERE loot.id=$2',
        values: [req.sanitize(req.body.data.loot_subcategory), req.sanitize(req.params.lootId)]
    };

    database.query(editQuery).then(async (results) => {
        await audit.writeAuditEvent(req.decoded.user.id, req.body.data.item_id, 'EDIT', oldValues.loot_subcategory, req.sanitize(req.body.data.loot_subcategory), req.sanitize(req.body.data.reason), new Date(), req.sanitize(req.body.data.character_id));
        res.json({success: true})
    }).catch((error) => {
        res.json(error.message);
    });
});


router.delete('/:id/loot', function (req, res) {
    const query = {
        text: 'DELETE FROM loot WHERE id=$1',
        values: [req.sanitize(req.body.id)]
    };

    database.query(query).then(async (results) => {
        await audit.writeAuditEvent(req.decoded.user.id, req.body.item_id, 'DELETE', null, null, req.sanitize(req.body.reason), new Date(), req.sanitize(req.body.character_id));
        res.json({success: true})
    }).catch((error) => {
        res.json(error.message);
    });
});

router.post('/:id/attendance/import', function (req, res) {
    let promises = [];
    let characters = [];
    let success = true;
    switch (req.body.mode) {
        case 'CSV':
            characters = req.body.import.split(",");
            if (characters.length > 0) {
                characters.forEach((character) => {
                    const query = {
                        text: 'INSERT INTO attendance (character_id,role,raid_id) SELECT r.character_id,r.character_role,$1 FROM (SELECT character_id,character_role FROM roster WHERE character_name = $2) r ON CONFLICT DO NOTHING',
                        values: [req.sanitize(req.params.id), character.trim()]
                    };

                    promises.push(database.query(query))
                });
            }
            break;
        case 'ATGC':
            characters = req.body.import.split(";");
            if (characters.length > 0) {
                characters.forEach((character) => {
                    let char = character.split(" ");
                    const query = {
                        text: 'INSERT INTO attendance (character_id,role,raid_id) SELECT r.character_id,r.character_role,$1 FROM (SELECT character_id,character_role FROM roster WHERE character_name = $2) r ON CONFLICT DO NOTHING',
                        values: [req.sanitize(req.params.id), char[0]]
                    };

                    promises.push(database.query(query))
                });
            }
            break;
        case 'MRT':
            let data = req.body.import.split('\n');
            characters = data[3].split(",");
            if (characters.length > 0) {
                characters.forEach((character) => {
                    const query = {
                        text: 'INSERT INTO attendance (character_id,role,raid_id) SELECT r.character_id,r.character_role,$1 FROM (SELECT character_id,character_role FROM roster WHERE character_name = $2) r ON CONFLICT DO NOTHING',
                        values: [req.sanitize(req.params.id), character.trim()]
                    };

                    promises.push(database.query(query))
                });
            }
            break;
    }
    Promise.all(promises).then(result => {
        res.json({success: true})
    }).catch(error => {
        res.json({success: false})
    });

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

router.post('/:id/loot/import', async function (req, res) {
    let data = req.body.data.split('\n');
    let promises = [];

    const raidQuery = {
        text: 'SELECT raid_zone FROM raids WHERE raid_id = $1',
        values: [req.sanitize(req.params.id)]
    };

    let raidResults = await database.query(raidQuery);
    if (raidResults.rows.length > 0) {
        let raidZone = getRaidZone(raidResults.rows[0].raid_zone);

        data.forEach((loot, index) => {
            if (index > 0) {
                let line = loot.split('\t');
               if (line[9] === raidZone) {
                   let name = line[0].split('-')[0];
                   const query = {
                       text: 'SELECT character_id FROM roster WHERE character_name = $1',
                       values: [name]
                   };
                   database.query(query).then((results) => {
                       if (results.rows.length > 0) {
                           let characterId = results.rows[0].character_id;
                           if (characterId) {
                               let itemId = line[4];
                               let lootType = 3;
                               let lootSubType = 0;
                               switch (line[6]) {
                                   case 'Mainspec/Need':
                                       lootSubType = 1;
                                       break;
                                   case 'Minor Upgrade':
                                       lootSubType = 2;
                                       break;
                                   case 'Resist':
                                       lootSubType = 4;
                                       break;
                                   case 'Offspec/Other':
                                       lootSubType = 3;
                                       break;
                                   case 'Disenchant':
                                       characterId = 3020;
                                       lootSubType = 5;
                                       break;
                                   default:
                               }
                               const importQuery = {
                                   text: 'INSERT into loot (character_id,raid_id,loot_id,loot_type,loot_subcategory) VALUES ($1,$2,$3,$4,$5)',
                                   values: [characterId, req.sanitize(req.params.id), itemId, lootType, lootSubType]
                               };
                               promises.push(database.query(importQuery));
                           }
                       }

                   }).catch((error) => {
                       console.log(error.message);
                   });
               }
            }
        });
        Promise.all(promises).then(result => {
            res.json({success: true})
        }).catch(error => {
            console.log(error);
            res.json({success: false})
        });
    } else {
        res.json({success: false})
    }

});

getRaidZone = (zone) => {
    switch (zone) {
        case "ZG":
            return 'Zul\'Gurub-20 Player';
        case 'MC':
            return 'Molten Core-40 Player';
        case 'ONY':
            return 'Onyxia\'s Lair-40 Player';
        case 'BWL':
            return 'Blackwing Lair-40 Player';
    }
};

router.put('/:id/open', function (req, res) {
    const query = {
        text: 'UPDATE raids SET raid_status=1  WHERE raid_id=$1',
        values: [req.sanitize(req.params.id)]
    };

    database.query(query).then((results) => {
        res.json({success: true})
    }).catch((error) => {
        res.json(error.message);
    });
});

module.exports = router;