/* Copyright (C) 2021 The Plea Justice Project
 *
 * Please see https://pleajustice.org for information about this project's
 * licensing and how you can make a contribution.
 */

/**
 * See index.js for routing to this point.
 */

module.exports = function (options) {
    const express = require('express');
    const router = express.Router();

    const fs = require('fs-extra');
    const path = require('path');
    const bcrypt = require('bcrypt');
    const util = require('../../common/util');

    // Limit authentication request rate.
    const rateLimit = require('express-rate-limit');

    const AuthReqLimit = rateLimit({
        windowMs: options.auth_minutes * 60 * 1000,
        max: options.auth_attempts,
        skipSuccessfulRequests: true,
        message: util.failure(`Too many authentication requests. Try again in ${options.auth_minutes} minutes.`)
    });

    const CreateAccountReqLimit = rateLimit({
        windowMs: options.reg_minutes * 60 * 1000,
        max: options.reg_attempts,
        message: util.failure(`Too many account creation requests. Try again in ${options.reg_minutes} minutes.`)
    });

    // Login, logout, and register should not require prior authentication.
    // Fetch user should require authentication.
    const { authenticatedRoute } = require('../../middleware/authenticateRoutes');
    const { getUserSessionCount } = require('../../middleware/userSessionCount');

    const UserModel = require('../../models/UserModel');
    const assetTypes = util.assetTypes;

    /**
     * Authentication route index. Displays help message referring to docs.
     * @param void
     */
    router.get('/', function (req, res) {
        res.render('index', { title: 'Authentication', name: module.filename });
    });

    /**
     * Get the user id of the current session if the user is logged in.
     * @return {user: {name: String, id: String}}
     */
    router.get('/user', authenticatedRoute, async (req, res) => {
        // This route should only be accessible from an authenticated session.
        if (!req.session.is_logged_in)
            res.status(500).json(util.failure('Session not logged in.'));
        else if (!('user' in req.session))
            res.status(500).json(util.failure('Session user is unset.'));
        else {
            try {
                const obj = await UserModel.findById(req.session.user.id);
                res.status(200).json(util.success('User info returned.', obj.meta));
            } catch (err) {
                res.status(500).json(util.failure('There was an error getting the user metadata.'));
            }
        }
    });

    /**
     * Log in with the specified credentials.
     * @param {username: String, password: String}
     */
    router.post('/login', AuthReqLimit, async (req, res) => {
        console.log('User login.');

        const user = req.body.username;
        const pass = req.body.password;

        try {
            const verified = await util.verifyPassword(user, true, pass);
            if (verified) {
                req.session.user = {
                    id: verified.id,
                    name: verified.username
                };
                req.session.is_logged_in = true;

                res.status(200).json(util.success('Logged in.'));
            } else {
                res.status(401).json(util.failure('Incorrect username or password.'));
            }
        } catch (err) {
            res.status(500).json(util.failure('There was an error logging in.', err));
        }
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
    router.post('/register', CreateAccountReqLimit, async (req, res) => {
        console.log('Registering new user.');

        const user = new UserModel({
            username: req.body.username,
            fullname: req.body.fullname,
            profession: req.body.profession,
            affiliation: req.body.affiliation,
            email: req.body.email,
            password: bcrypt.hashSync(req.body.password, util.saltRounds)
        });

        try {
            const obj = await user.save();
            const user_data_dir = util.userDir(options, obj._id.toString());
            Object.keys(assetTypes.spec).forEach(
                type => fs.mkdirpSync(path.join(user_data_dir, type))
            );

            res.status(200).json(util.success('User account created. You may now login.'));
        } catch (err) {
            res.status(500).json(util.failure('There was an error registering the requested user.', err));
        }
    });

    return router;
};
