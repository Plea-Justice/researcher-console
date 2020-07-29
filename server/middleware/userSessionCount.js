const UserModel = require('../models/UserModel');

module.exports = function(req, res, next) {
    if (req.session && req.session.user_id && req.ip) {
        UserModel.findById(req.session.user_id, (err, obj)=>{
            if (err || !obj) {
                return;
            } else {
                obj.addresses = obj.addresses || {};
                obj.addresses[req.ip] = Date.now();
                console.log(obj.addresses[req.ip]);
                obj.save();
            }
        });
    }
    next();
};