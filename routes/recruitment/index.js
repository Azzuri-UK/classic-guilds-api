let express = require('express');
let router = express.Router();
let database = require('../../config/db');

router.get('/', function (req, res) {
    const query = {
        text: 'Select * from recruitment ORDER BY CASE recruitment_role WHEN \'Tank\' THEN 0 WHEN \'Healer\' THEN 1 ELSE 2 end, recruitment_class ASC'
    };
    database.query(query).then((results) => {
        res.json(results.rows)
    }).catch((error) => {
        res.json({})
    })
});

module.exports = router;