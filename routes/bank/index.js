let express = require('express');
let router = express.Router();
let database = require('../../config/db');
const Base64 = require('js-base64').Base64;

router.get('/', function (req, res) {
    const query = {
        text: ''
    };
    database.query(query).then((results) => {
       res.json(results.rows)
    }).catch((error) => {
        res.json({})
    })
});

router.post('/', function (req, res) {
    console.log(Base64.decode(req.body.data))
});






module.exports = router;