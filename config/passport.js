const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;
const scopes = ['identify', 'guilds'];
const database = require('../config/db');
const Discord = require('discord.js');
const client = new Discord.Client();

const roles = [
    '5 Gold - GM Team',
    '4 Gold - Raider',
    '3 Gold - Member',
    '4,50 Gold - Class Leader',
    '4,50 Gold - Raid Leader'
];
passport.serializeUser(function (user, done) {
    done(null, user);
});
passport.deserializeUser(function (obj, done) {
    done(null, obj);
});

passport.use(new DiscordStrategy({
        clientID: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        callbackURL: process.env.CALLBACK_URL,
        scope: scopes
    },
    (accessToken, refreshToken, profile, done) => {
    console.log ('ID: ' + profile.id + ' :: User ' + profile.username );
        const keepersServer = profile.guilds.find(guild => guild.id === '637801881137053716');
        if (keepersServer) {
            let user = {
                id: profile.id,
                userName: profile.username
            };
            let query = {
                text: "SELECT id,username,role FROM users WHERE discordid = $1",
                values: [user.id]
            }
            database.query(query).then((results) => {
                if (results.rows.length > 0) {
                    return done(null, results.rows[0]);
                } else {
                    client.login(process.env.DISCORD_TOKEN).then(() => {
                        let guild = client.guilds.get('637801881137053716');
                            guild.fetchMember(profile.id).then(async member => {
                                if (roles.includes(member.highestRole.name)) {
                                    let role = member.highestRole.name.replace(' ', '').toUpperCase();
                                    let query = {
                                        text: "INSERT INTO users (discordid,username,role) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING",
                                        values: [user.id, user.userName, role]
                                    };
                                    await database.query(query);
                                    query = {
                                        text: "SELECT id,username,role FROM users WHERE discordid = $1",
                                        values: [user.id]
                                    };
                                    database.query(query).then((results) => {
                                        return done(null, results.rows[0]);
                                    }).catch((error) => {
                                        console.log(profile);
                                        client.destroy();
                                        return done(null, false, {message: 'Failed to save user details'});

                                    })
                                } else {
                                    console.log(profile);
                                    await client.destroy();
                                    return done(null, false, {message: 'You do not have a valid discord role'});
                                }
                            }).catch((error)=>{
                                console.log(profile);
                                client.destroy();
                                return done(null, false, {message: 'Error fetching discord user'});
                            })
                    }).catch((error) => {
                        console.log(error.message);
                        client.destroy();
                        return done(null, false, {message: 'Error querying Five Gold Discord bot'});
                    })
                }
            }).catch((error) => {
                console.log(profile);

                return done(null, false, {message: 'Error querying database.  0001'});

            })

        } else {
            console.log(profile);

            return done(null, false, {message: 'Entry costs 5g'});
        }

    })
);
