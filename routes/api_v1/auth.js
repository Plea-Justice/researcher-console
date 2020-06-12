/**
 * See index.js for routing to this point.
 */

module.exports = function (options) {
    var express = require('express');
    var router = express.Router();

    // Limit authentication request rate.
    var rateLimit = require('express-rate-limit');
    router.use(rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100
    }));

    // Use bcrypt to hash passwords with 
    var bcrypt = require('bcrypt');
    var saltRounds = 10;

    var User = require('../../models/m_user');

    /* GET home page. */
    router.get('/', function (req, res) {
        res.render('index', { title: 'Authentication', name: module.filename });
    });

    router.post('/register', (req, res) => {
        console.log('Registering new user.');

        let user = new User({ username: req.body.username, password: bcrypt.hashSync(req.body.password, saltRounds) });
        user.save((error) => {
            if (error) throw Error('bcrypt error.');
            else res.status(201).end();
        });

        
    });

    router.post('/register', (req, res) => {
        console.log('registering new user.');
        console.log(req);
        let user = new User({ username: req.body.username, password: bcrypt.hashSync(req.body.password, saltRounds) });
        user.save((error) => {
            error ? res.status(500).send(error) : res.status(201).end();
        });
        console.log('registering new user.');
    });

    return router;
};