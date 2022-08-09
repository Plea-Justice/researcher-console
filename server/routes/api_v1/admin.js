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
    const bcrypt = require('bcrypt');

    const util = require('../../common/util');
    const { mandatoryRoute } = require('../../middleware/authenticateRoutes');

    const UserModel = require('../../models/UserModel');

    router.get('/', function (req, res) {
        res.render('index', { title: 'Administration', name: module.filename });
    });

    router.get('/users', async (req, res) => {
        let list = await UserModel.find();
        list = list.map(u=>u.meta);
        res.json(util.success('Returned user list.', list));
    });


    /******************************************************
    * All methods below this line will require a password.
    */ router.use(mandatoryRoute);

    router.put('/users/:user_id/permissions', async (req, res) => {
        const subject_id = req.params.user_id;

        if (
            req.body.permitAdmin !== undefined
            && req.session.user.id === subject_id
        ) {
            res.status(400).json(util.failure('You may not change the admin status of the current account.'));
            return;
        }

        try {
            const info = await UserModel.updateOne(
                { _id: subject_id }, { $set: {
                    permitAdmin: req.body.permitAdmin,
                    permitHosting: req.body.permitHosting,
                    permitSharing: req.body.permitSharing,
                    permitUploads: req.body.permitUploads
                } }, { omitUndefined: true }
            );

            res.status(200).json(util.success('User permissions updated.', info));
        } catch (err) {
            res.status(500).json(util.failure('There was an error updating the user permissions.', err));
        }
    });

    router.put('/users/:user_id/attributes', async (req, res) => {
        const subject_id = req.params.user_id;

        try {
            const info = await UserModel.updateOne(
                { _id: subject_id }, { $set: {
                    username: req.body.username,
                    profession: req.body.profession,
                    affiliation: req.body.affiliation
                } }, { omitUndefined: true }
            );

            res.status(200).json(util.success('User permissions updated.', info));
        } catch (err) {
            res.status(500).json(util.failure('There was an error updating the user attributes.', err));
        }
    });

    router.delete('/users/:user_id', async (req, res) => {
        const subject_id = req.params.user_id;

        if (req.session.user.id === subject_id) {
            res.status(400).json(util.failure('You may not delete the current account.'));
            return;
        }

        try {
            const info = await UserModel.deleteOne({ _id: subject_id });
            fs.removeSync(util.userDir(options, subject_id));

            res.status(200).json(util.success('User deleted.', info));
        } catch (err) {
            res.status(500).json(util.failure('There was an error deleting the user.', err));
        }
    });

    router.put('/users/:user_id/password', async (req, res) => {
        const subject_id = req.params.user_id;

        try {
            const info = await UserModel.updateOne(
                { _id: subject_id }, { $set: {
                    password: bcrypt.hashSync(
                        req.body.newPassword, util.saltRounds
                    )
                } }, { omitUndefined: true }
            );

            res.status(200).json(util.success('User permissions updated.', info));
        } catch (err) {
            res.status(500).json(util.failure('There was an error updating the user\'s password.', err));
        }
    });


    return router;
};
