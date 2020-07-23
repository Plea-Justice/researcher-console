module.exports = function(req, res, next) {
    if (req.session.is_logged_in) next();
    else res.status(401).json({success: false, error: 'auth', message: 'Not logged in.', result: null});
};