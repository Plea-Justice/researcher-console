const util = require('../common/util');

/**
 * Authentication required to access.
 */
function authenticatedRoute (req, res, next) {
    if (req.session.is_logged_in) next();
    else res.status(401).json(util.failure('Not logged in.'));
}

/**
 * Administrator priviledges required to access.
 */
async function administratorRoute (req, res, next) {
    if (await util.userIsAdmin(req.session.user_id)) next();
    else res.status(401).json(util.failure('Administrator priviledges required.'));
}

/**
 * Password required on every access.
 */
async function mandatoryRoute (req, res, next) {
    if (await util.verifyPassword(req.session.user_id, false, req.body.password)) next();
    else res.status(401).json(util.failure('Password incorrect or not sent.'));
}

module.exports = { authenticatedRoute, administratorRoute, mandatoryRoute };