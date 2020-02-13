let express = require('express');
let router = express.Router();
let database = require('../../config/db');


router.put('/', function (req, res) {
    const query = {
        text: 'SELECT recipe,\n' +
            '       profession,\n' +
            '       item_id,\n' +
            '       item_quality,\n' +
            '       (SELECT COUNT(*) FROM crafters WHERE crafters.recipe_id = recipes.item_id) as crafter_count,\n' +
            '       (SELECT STRING_AGG(character_name || \'_\' || character_class, \',\')\n' +
            '        FROM crafters\n' +
            '                 INNER JOIN roster r on crafters.character_id = r.character_id\n' +
            '        WHERE crafters.recipe_id = recipes.item_id)                               as crafter_names\n' +
            'FROM recipes'
    };
    database.query(query).then((results) => {
       res.json(results.rows)
    }).catch((error) => {
        res.json({})
    })
});


router.post('/recipe', function (req, res) {

    const query = {
        text: 'INSERT INTO recipes (recipe, profession, item_id, item_quality) VALUES ($1,$2,$3,$4)',
        values: [req.sanitize(req.body.data.name),req.sanitize(req.body.data.profession),req.sanitize(req.body.data.itemId),req.sanitize(req.body.data.quality)]
    };

    database.query(query).then((results) => {
        res.json({success:true})
    }).catch((error) => {
        res.json(error)
    })

});


router.post('/crafter', function (req, res) {
    const query = {
        text: 'INSERT INTO crafters (character_id, recipe_id) VALUES ($1,$2)',
        values: [req.sanitize(req.body.data.character),req.sanitize(req.body.data.recipe)]
    };
    database.query(query).then((results) => {
        res.json({success:true})
    }).catch((error) => {
        res.json({})
    })

});


module.exports = router;