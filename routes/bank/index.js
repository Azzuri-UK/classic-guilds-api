let express = require('express');
let router = express.Router();
let database = require('../../config/db');
const Base64 = require('js-base64').Base64;


const repItems = {
    11382: 200,
    11370: 5,
    17010: 200,
    17011: 200,
    17012: 75

}
router.get('/', function (req, res) {
    const query = {
        text: 'SELECT bi.item_id,bi.item_name,bi.item_quality,items.item_quality as raid_quality,quantity,bank_char,updated FROM guild_bank_items INNER JOIN bank_items bi on guild_bank_items.item_id = bi.item_id LEFT OUTER JOIN items ON guild_bank_items.item_id = items.item_id ORDER BY bi.item_name '
    };
    database.query(query).then((results) => {
        results.rows.forEach((item, index) => {
           if  (repItems.hasOwnProperty(item.item_id)){
               results.rows[index].rep_total = (repItems[item.item_id] * item.quantity)
           }
        });
        res.json(results.rows)
    }).catch((error) => {
        res.json({})
    })
});

router.post('/', function (req, res) {
    let rawData = Base64.decode(req.body.data);
    let data = rawData.split(";");
    let gold = 0;
    let copper = 0;
    let silver = 0;
    let bankItems = {};
    let characterName = null;
    let updateDate = Date.now();
    data.forEach((row, index) => {
        let rowData = row.replace('[', '').replace(']', '').split(',')

        switch (index){
            case 0:
                characterName = rowData[0];
                gold = rowData[1].substr(0, rowData[1].length - 4);
                silver = rowData[1].substr(-4, 2);
                copper = rowData[1].substr(-2, 2);
                break;
            case 1:
                break;
            default:
                if (rowData.length === 4 ) {
                    if (bankItems.hasOwnProperty(rowData[2])) {
                        bankItems[rowData[2]] += parseInt(rowData[3])
                    } else {
                        bankItems[rowData[2]] = parseInt(rowData[3])
                    }
                }
        }
    });
    let promises = [];

    const deleteQuery = {
        text: 'DELETE FROM guild_bank_items WHERE bank_char = $1',
        values: [characterName]
    };
    database.query(deleteQuery).then((deleteResults) => {
        Object.keys(bankItems).forEach(function(key) {
            let query = {
                text: 'INSERT INTO guild_bank_items (item_id,quantity,bank_char,updated) VALUES ($1,$2,$3,$4)',
                values: [req.sanitize(key), req.sanitize(bankItems[key]),characterName,updateDate],
            };
            promises.push(database.query(query))
        });
        Promise.all(promises).then(results => {
            res.json({success: "true"})
        }).catch(error => {
            console.log(error.message)
            res.json({success: "false"})
        })
    }).catch((error) => {
        res.json({success: "false"})
    })

});


module.exports = router;