const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;
const scopes = ['identify', 'guilds'];
const database = require('../config/db');
const Discord = require('discord.js');
const client = new Discord.Client();

const roles = [
    'Arch Keepers',
    'Keepers',
    'Keepers Council',
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

        console.log(profile);
        const keepersServer = profile.guilds.find(guild => guild.id === '616366281540763687');
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
                        let guild = client.guilds.get('616366281540763687');


                            guild.fetchMember(profile.id).then(async member => {
                                if (roles.includes(member.highestRole.name)) {
                                    let role = member.highestRole.name.replace(' ', '').toUpperCase()
                                    let query = {
                                        text: "INSERT INTO users (discordid,username,role) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING",
                                        values: [user.id, user.userName, role]
                                    };
                                    await database.query(query);
                                    query = {
                                        text: "SELECT id,username,role FROM users WHERE discordid = $1",
                                        values: [user.id]
                                    }
                                    database.query(query).then((results) => {
                                        return done(null, results.rows[0]);
                                    }).catch((error) => {
                                        console.log(error.message);

                                    })
                                } else {
                                    console.log(member.highestRole.name);

                                }
                            });
                    });
                }
            }).catch((error) => {
                console.log(error.message);

            })

        } else {
            return done(null, false, {message: 'You must be a Keeper to use this site'});
        }

    })
);
