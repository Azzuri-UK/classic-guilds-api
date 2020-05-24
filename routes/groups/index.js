let express = require('express');
let router = express.Router();

const Discord = require('discord.js');
const client = new Discord.Client();
const util = require('util')

router.get('/', function (req, res) {
    client.login(process.env.DISCORD_TOKEN).then(() => {
        let guild = client.guilds.get('637801881137053716');
        guild.channels.forEach(channel => {
            if (channel.type === 'text'){
                let msg = channel.fetchMessage('711813922495397968')
                msg.then(result => {
                    let tanks = result.reactions.get('Tank');
                    console.log(tanks)
                    if (tanks) {
                        tanks.fetchUsers().then(users => {
                            console.log(users)
                            res.json({success: true})
                        }).catch(error => {
                            console.log(error)
                            res.json({success: false})
                        })
                    } else {
                        res.json({success: true})
                    }
                }).catch(error => {

                   // didn't find message.
                })
            }
        });
    });
});

module.exports = router;