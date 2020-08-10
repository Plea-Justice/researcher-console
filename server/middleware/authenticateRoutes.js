const util = require('../common/util');

function authenticatedRoute (req, res, next) {
    if (req.session.is_logged_in) next();
    else res.status(401).json(util.failure('Not logged in.'));
}

async function administratorRoute (req, res, next) {
    if (await util.userIsAdmin(req.session.user_id)) next();
    else res.status(401).json(util.failure('Not logged in.'));
}

module.exports = { authenticatedRoute, administratorRoute };