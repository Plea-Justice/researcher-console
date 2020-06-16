/**
 * See index.js for routing to this point.
 */

module.exports = function (options) {
    var express = require('express');
    var router = express.Router();

    // Limit authentication request rate.
    var rateLimit = require('express-rate-limit');

    const AuthReqLimit = rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 10,
        message: {success: false, message: 'Too many authentication requests. Try again in 15 minutes.', return: null}
    });

    const CreateAccountReqLimit = rateLimit({
        windowMs: 15 * 60 * 1000, // 30 minutes
        max: 3,
        message: {success: false, message: 'Too many account creation requests. Try again in 30 minutes.', return: null}
    });

    // Login, logout, and register should not require prior authentication.
    // Fetch user should require authentication.
    const authenticateRoute = require('../../middleware/authenticateRoute');

    // Use bcrypt to hash passwords with cost factor 10.
    var bcrypt = require('bcrypt');
    var saltRounds = 10;

    var User = require('../../models/m_user');

    /* GET home page. */
    router.get('/', function (req, res) {
        res.render('index', { title: 'Authentication', name: module.filename });
    });

    /**
     * Get the user_id of the current session if the user is logged in.
     * @return session.user_id
     */
    router.get('/user', authenticateRoute, (req, res) => {
        // This route should only be accessible from an authenticated session.
        if (!req.session.hasOwnProperty('user_id')) res.status(500).json({success: false, message: 'Session user_id not found.', return: null});
        else res.status(200).json({success: true, message: 'User ID returned.', return: {user: {name: req.session.user_id}}});
    });

    /**
     * Log in with the specified credentials.
     * @param {username: String, password: String}
     */
    router.post('/login', AuthReqLimit, (req, res) => {
        console.log('User login.');

        const user = req.body.username;
        const pass = req.body.password;

        User.findOne({ username: user }, (err, obj)=>{

            if (err) res.status(500).json({success: false, message: 'There was an error logging in.', return: null});
            else if (!obj) res.status(401).json({success: false, message: 'The specified user does not exist.', return: null});
            else bcrypt.compare(pass, obj.password, (err, same)=>{

                if (err) res.status(500).json({success: false, message: 'There was an error logging in.', return: null});
                else if (!same) res.status(401).json({success: false, message: 'Incorrect username or password.', return: null});
                else {
                    req.session.user_id = user;
                    req.session.is_logged_in = true;
                    res.json({success: true, message: 'Logged in.', return: null});
                    
                }
            });
        });
    });

    /**
     * Log out of the current session.
     */
    router.post('/logout', AuthReqLimit, (req, res) => {
        console.log('User logout.');

        req.session.destroy((err)=>{
            if (err) res.status(500).json({success: false, message: 'There was an error logging out.', return: null});
            else res.status(200).json({success: true, message: 'Logged out.', return: null});
        });
    });
    
    /**
     * Register a new user with the specified credentials.
     * @param {username: String, password: String}
     */
    router.post('/register', CreateAccountReqLimit, (req, res) => {
        console.log('Registering new user.');

        let user = new User({ username: req.body.username, password: bcrypt.hashSync(req.body.password, saltRounds) });
        user.save((err) => {
            if (err) res.status(500).json({success: false, message: 'There was an error registering the requested user.', return: err});
            else res.status(201).json({success: true, message: 'User created', return: null});
        });
    });

    return router;
};