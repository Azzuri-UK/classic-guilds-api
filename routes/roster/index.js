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

module.exports = router;