let express = require('express');
let router = express.Router();
let database = require('../../bin/db');

router.get('/', function (req, res) {
    database.query("SELECT * FROM raids").then((results) => {
        res.json(results.rows)
    }).catch((error) => {
        res.json({})
    })
});

router.get('/:id', function (req, res) {
    const query = {
        text: 'SELECT * FROM raids WHERE raid_id = $1',
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


module.exports = router;