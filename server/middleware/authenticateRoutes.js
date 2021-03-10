/* Copyright (C) 2021 The Plea Justice Project
 *
 * Please see https://pleajustice.org for information about this project's
 * licensing and how you can make a contribution.
 */

const util = require('../common/util');
const reqlogin = new Error('Not logged in.');
const reqadmin = new Error('Administrator priviledges required.');
const reqpaswd = new Error('Incorrect password.');
reqlogin.status = reqadmin.status = reqpaswd.status = 401;
/**
 * Authentication required to access.
 */
function authenticatedRoute (req, res, next) {
    if (req.session.is_logged_in) next();
    else next(reqlogin);
}

/**
 * Administrator priviledges required to access.
 */
async function administratorRoute (req, res, next) {
    if (await util.userIsAdmin(req.session.user.id)) next();
    else next(reqadmin);
}

/**
 * Password required on every access.
 */
async function mandatoryRoute (req, res, next) {
    if (await util.verifyPassword(
        req.session.user.id,
        false,
        req.body.password
    )) next();
    else next(reqpaswd);
}

module.exports = { authenticatedRoute, administratorRoute, mandatoryRoute };
