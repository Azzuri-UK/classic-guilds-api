const express = require('express');
const router = express.Router();
const database = require('../../config/db');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const passport = require('passport');
const base64 = require('js-base64').Base64;

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const redirect = encodeURIComponent(process.env.CALLBACK_URL);

router.get('/', passport.authenticate('discord'));
router.get('/redirect', function (req, res, next) {
        passport.authenticate('discord', function (err, user, info) {
            if (err) {
                res.redirect(process.env.UI_URL + '/error/' + base64.encode(err.message));
            } else {
                if (!user){
                    console.log(info);
                    res.redirect(process.env.UI_URL + '/error/'  + base64.encode(info.message))
                } else {
                    req.logIn(user, function (err) {
                        if (err) {
                            res.redirect(process.env.UI_URL + '/error/' + base64.encode(err.message))
                        } else {
                            const body = req.user;
                            //Sign the JWT token and populate the payload with the user email and id
                            const token = jwt.sign({user: body}, process.env.JWT_SECRET);
                            //Send back the token to the user
                            res.cookie('keepers-jwt', token, {domain: process.env.COOKIE_DOMAIN});
                            res.redirect(process.env.UI_URL)
                        }

                    });
                }
            }
        })(req, res, next)
    }
);

module.exports = router;