let express = require('express');
let router = express.Router();
let database = require('../../bin/db');

router.get('/', function (req, res) {
    database.query("SELECT * FROM raids ORDER BY raid_date ASC").then((results) => {
        res.json(results.rows)
    }).catch((error) => {
        res.json({})
    })
});

router.get('/:id', function (req, res) {
    const query = {
        text: 'SELECT * FROM raids WHERE raid_id = $1 ORDER BY raid_date ASC',
        values: [req.params.userId],
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
        values: [req.params.raid_date,req.params.raid_start,req.params.raid_end,req.params.raid_zone],
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
        values: [req.params.raid_date,req.params.raid_start,req.params.raid_end,req.params.raid_zone,req.params.id],
    };
    database.query(query).then((results) => {
        res.json(results.rows)
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
        res.json(results.rows)
    }).catch((error) => {
        res.json(error)
    });
});

router.get('/:id/attendance/:role', function (req, res) {
    const query = {
        text: 'SELECT character_name,character_class FROM attendance INNER JOIN roster r on attendance.character_id = r.character_id where raid_id = $1 AND role = $2 ORDER BY character_name',
        values: [req.params.id,req.params.role.charAt(0).toUpperCase() + req.params.role.slice(1)],
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
        text: 'SELECT character_name,character_class,attendance.role FROM attendance INNER JOIN roster r on attendance.character_id = r.character_id where raid_id = $1 ORDER BY character_name',
        values: [req.params.id]
    };
    console.log(query)
    database.query(query).then((results) => {
        res.json(results.rows)
    }).catch((error) => {
        res.json(error)
    })
});

module.exports = router;