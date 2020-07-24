/**
 * See index.js for routing to this point.
 */

module.exports = function (options) {
    const express = require('express');
    var router = express.Router();

    const util = require('../../common/util');

    // Limit authentication request rate.
    const rateLimit = require('express-rate-limit');

    const AuthReqLimit = rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 10,
        message: util.failure('Too many authentication requests. Try again in 15 minutes.')
    });

    const CreateAccountReqLimit = rateLimit({
        windowMs: 15 * 60 * 1000, // 30 minutes
        max: 3,
        message: util.success('Too many account creation requests. Try again in 30 minutes.')
    });

    // Login, logout, and register should not require prior authentication.
    // Fetch user should require authentication.
    const authenticateRoute = require('../../middleware/authenticateRoute');

    // Use bcrypt to hash passwords with cost factor 10.
    const bcrypt = require('bcrypt');
    var saltRounds = 10;

    const UserModel = require('../../models/UserModel');

    /**
     * Authentication route index. Displays help message referring to docs.
     * @param void
     */
    router.get('/', function (req, res) {
        res.render('index', { title: 'Authentication', name: module.filename });
    });

    /**
     * Get the user_id of the current session if the user is logged in.
     * @return {user: {name: String, user_id: String}}
     */
    router.get('/user', authenticateRoute, (req, res) => {
        // This route should only be accessible from an authenticated session.
        if (!('user_id' in req.session))
            res.status(500).json(util.failure('Session user_id not found.'));
        else if (!('username' in req.session))
            res.status(500).json(util.failure('Session username not found.'));
        else
            res.status(200).json(util.success('User info returned.',
                {user: {name: req.session.username, user_id: req.session.user_id}}
            ));
    });

    /**
     * Log in with the specified credentials.
     * @param {username: String, password: String}
     */
    router.post('/login', AuthReqLimit, (req, res) => {
        console.log('User login.');

        const user = req.body.username;
        const pass = req.body.password;

        UserModel.findOne({ username: user }, (err, obj)=>{

            if (err)
                res.status(500).json(util.failure('There was an error logging in.', err));
            else if (!obj)
                res.status(401).json(util.failure('Incorrect username or password.'));
            else
                bcrypt.compare(pass, obj.password, (err, same)=>{

                    if (err)
                        res.status(500).json(util.failure('There was an error logging in.', err));
                    else if (!same)
                        res.status(401).json(util.failure('Incorrect username or password.'));
                    else {
                        req.session.user_id = obj._id;
                        req.session.username = obj.username;
                        req.session.is_logged_in = true;
                        
                        res.status(200).json(util.success('Logged in.'));
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
            if (err)
                res.status(500).json(util.failure('There was an error logging out.'));
            else
                res.status(200).json(util.success('Logged out.'));
        });
    });
    
    /**
     * Register a new user with the specified credentials.
     * @param {username: String, password: String}
     */
    router.post('/register', CreateAccountReqLimit, (req, res) => {
        console.log('Registering new user.');

        let user = new UserModel({
            username: req.body.username,
            email: req.body.email,
            password: bcrypt.hashSync(req.body.password, saltRounds)
        });
        user.save((err) => {
            if (err)
                res.status(500).json(util.failure('There was an error registering the requested user.', err));
            else
                res.status(201).json(util.success('User account created. You may now login.'));
        });
    });

    return router;
};