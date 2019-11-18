let express = require('express');
let router = express.Router();
let database = require('../../bin/db');

router.get('/', function (req, res) {
    database.query("SELECT * FROM ROSTER").then((results) => {
        res.json(results.rows)
    }).catch((error) => {
        res.json({})
    })
});

router.get('/:userId', function (req, res) {
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
    const query = {
        text: 'INSERT INTO roster (character_name,character_class,character_role) VALUES ($1,$2,$3)',
        values: [req.params.character_name,req.params.character_class,req.params.character_role],
    };
    database.query(query).then((results) => {
        res.json(results.rows)
    }).catch((error) => {
        res.json(error)
    });
});

router.put('/:id', function (req, res) {
    const query = {
        text: 'UPDATE roster SET character_name=$1,character_class=$2,character_role=$3 WHERE character_id = $5',
        values: [req.params.character_name,req.params.character_class,req.params.character_role,req.params.id]
    };
    database.query(query).then((results) => {
        res.json(results.rows)
    }).catch((error) => {
        res.json(error)
    });
});

router.delete('/:id', function (req, res) {
    const query = {
        text: 'DELETE from roster where character_id = $1',
        values: [req.params.id],
    };
    database.query(query).then((results) => {
        res.json(results.rows)
    }).catch((error) => {
        res.json(error)
    });
});

module.exports = router;