/**
 * See index.js for routing to this point.
 */

module.exports = function (options) {
    const express = require('express');
    var router = express.Router();

    const fs = require('fs-extra');

    const util = require('../../common/util');
    const { mandatoryRoute } = require('../../middleware/authenticateRoutes');

    const UserModel = require('../../models/UserModel');

    router.get('/', function (req, res) {
        res.render('index', { title: 'Administration', name: module.filename });
    });

    router.get('/users', async (req, res) => {
        let list = await UserModel.find();
        list = list.map((u)=>({
            user_id: u._id,
            username: u.username,
            email: u.email,
            profession: u.profession,
            affiliation: u.affiliation,
            addresses: Array.from(u.addresses.keys()).map(ip => ip.replace(/-/g, '.')),
            permitAdmin: u.permitAdmin,
            permitHosting: u.permitHosting,
            lastActive: u.lastActive,
            created: u.created
        }));
        res.json(util.success('Returned user list.', list));
    });

    /******************************************************
    * All methods below this line will require a password.
    */ router.use(mandatoryRoute);

    router.put('/permissions/:user_id', async (req, res) => {
        let subject_id = req.params.user_id;
        
        if (req.body.permitAdmin !== undefined && req.session.user_id === subject_id) {
            res.status(400).json(util.failure('You may not change the admin status of the current account.'));
            return;
        }

        try {
            const info = await UserModel.updateOne({_id: subject_id}, {$set: {
                permitAdmin: req.body.permitAdmin,
                permitHosting: req.body.permitHosting
            }}, {omitUndefined: true});

            res.status(200).json(util.success('User permissions updated.', info));
        } catch (err) {
            res.status(500).json(util.failure('There was an error updating the user permissions.', err));
        }
    });

    router.post('/delete/:user_id', async (req, res) => {
        let subject_id = req.params.user_id;
        
        if (req.session.user_id === subject_id) {
            res.status(400).json(util.failure('You may not delete the current account.'));
            return;
        }

        try {
            const info = await UserModel.deleteOne({_id: subject_id});
            fs.removeSync(util.userDir(options, subject_id));

            res.status(200).json(util.success('User deleted.', info));
        } catch (err) {
            res.status(500).json(util.failure('There was an error deleting the user.', err));
        }
    });


    return router;
};