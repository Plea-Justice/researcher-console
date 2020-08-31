/**
 * See index.js for routing to this point.
 */

module.exports = function (options) {
    const express = require('express');
    var router = express.Router();
    
    const fs = require('fs-extra');
    const path = require('path');
    const bcrypt = require('bcrypt');
    const util = require('../../common/util');

    // Limit authentication request rate.
    const rateLimit = require('express-rate-limit');
    // FIXME: remove this.
    const { fork } = require('child_process');

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
    const AssetModel = require('../../models/AssetModel');
    const assetTypes = util.assetTypes;

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
    router.get('/user', authenticatedRoute, async (req, res) => {
        // This route should only be accessible from an authenticated session.
        if (!('user_id' in req.session))
            res.status(500).json(util.failure('Session user_id not found.'));
        else if (!('username' in req.session))
            res.status(500).json(util.failure('Session username not found.'));
        else
            res.status(200).json(util.success('User info returned.',
                {user: {
                    name: req.session.username,
                    user_id: req.session.user_id,
                    ...await util.userPermissions(req.session.user_id),
                    n_sessions: await getUserSessionCount(req.session.user_id)
                }}
            ));
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
                req.session.user_id = verified._id;
                req.session.username = verified.username;
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
            profession: req.body.profession,
            affiliation: req.body.affiliation,
            email: req.body.email,
            password: bcrypt.hashSync(req.body.password, util.saltRounds)
        });

        try {
            // FIXME: This is not a good way to copy over assets. Resolve this when public assets are enabled.
            const obj = await user.save();
            const user_data_dir = util.userDir(options, obj._id.toString());
            assetTypes.forEach(type => fs.mkdirpSync(path.join(user_data_dir, type)));

            if (options.assets_template) {
                fs.copySync(path.join(options.assets_dir), user_data_dir);
                assetTypes.forEach(type => path.join(user_data_dir, type));
                for (const type of assetTypes) {
                    const dir = path.join(user_data_dir, type);
                    const list = fs.readdirSync(dir);
                    
                    list.forEach(async (file)=>{
                        const asset = new AssetModel({
                            user_id: user._id,
                            path: path.join(dir, file),
                            name: file.replace(/.*\/|\..*?$/, ''),
                            type: type,
                            description: 'Builtin asset.',
                            public: false,
                            readOnly: true
                        });
                        await asset.save().catch(err=>console.log(err));
                        // Generate a thumbnail for the asset in the background.
                        fork('common/thumbnail', [
                            path.resolve(path.join(dir, file)),
                            path.resolve(path.join(user_data_dir, 'thumbnails', `${asset._id}.jpg`))
                        ]);
                    });
                }
            }

            res.status(201).json(util.success('User account created. You may now login.'));
        } catch (err) {
            res.status(500).json(util.failure('There was an error registering the requested user.', err));
        }
    });

    return router;
};