/**
 * See index.js for routing to this point.
 */

module.exports = function (options) {
    const express = require('express');
    var router = express.Router();

    const util = require('../../common/util');

    const UserModel = require('../../models/UserModel');

    router.get('/', function (req, res) {
        res.render('index', { title: 'Administration', name: module.filename });
    });

    router.get('/users', async (req, res) => {
        let list = await UserModel.find();
        list = list.map((u)=>({
            username: u.username,
            email: u.email,
            profession: u.profession,
            affiliation: u.affiliation,
            addresses: Array.from(u.addresses.keys()).map(ip => ip.replace(/-/g, '.')),
            administrator: u.administrator,
            lastActive: u.lastActive,
            created: u.created
        }));
        res.json(util.success('Returned user list.', list));
    });


    return router;
};