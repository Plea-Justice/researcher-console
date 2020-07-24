module.exports = function(req, res, next) {
    const util = require('../common/util');
    if (req.session.is_logged_in) next();
    else res.status(401).json(util.failure('Not logged in.'));
};