const express = require('express');
const router = express.Router();
const database = require('../../config/db');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const passport = require('passport');


const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const redirect = encodeURIComponent(process.env.CALLBACK_URL);

router.get('/', passport.authenticate('discord'));
router.get('/redirect',
    passport.authenticate('discord', {failureRedirect: '/error'}), function (req, res) {
        const body = req.user;
        //Sign the JWT token and populate the payload with the user email and id
        const token = jwt.sign({ user : body },process.env.JWT_SECRET);
        //Send back the token to the user
        res.cookie('keepers-jwt',token);
        res.redirect(process.env.UI_URL)
    } // auth success
);

module.exports = router;