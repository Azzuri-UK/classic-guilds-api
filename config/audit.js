let database = require('./db');

function writeAuditEvent(adminUser,lootId,action,oldValue,newValue,reason,timestamp,lootUser){
    const query = {
        text: 'INSERT INTO loot_audit (admin_user,loot_id,admin_action,old_value,new_value,reason,admin_timestamp,loot_user) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)',
        values: [adminUser,lootId,action,oldValue,newValue,reason,timestamp,lootUser]
    };

    database.query(query).then((results) => {

        return true;
    }).catch((error) => {
        console.log(error.message);
        return false;
    })
}

module.exports = {
    writeAuditEvent
};