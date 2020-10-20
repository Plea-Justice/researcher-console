const UserModel = require('../models/UserModel');

// Track recent IP addresses of the current user to provide a
// warning if more than one session is active.

function countUserSessions (req, res, next) {
    if (req.session.is_logged_in && req.session.user && req.ip) {
        UserModel.findById(req.session.user.id, (err, obj)=>{
            if (err || !obj) {
                return;
            } else {
                // Mongo keys cannot include the '.' character.
                const ip = req.ip.replace(/\./g, '-');

                // Delete any records older than 5 minutes.
                obj.addresses.forEach((val, key, map)=>{
                    if (Date.now() - val > 300000)
                        map.delete(key);
                });

                obj.addresses.set(ip, Date.now());
                obj.lastActive = Date.now();

                obj.save((err)=>{
                    if (err)
                        console.log(err);
                });
            }
        });
    }
    next();
}

// Get the number of active sessions from the database.

async function getUserSessionCount (id) {
    try {
        const obj = await UserModel.findById(id);
        return obj.addresses.size;

    } catch (err) {
        console.log(err);
        return 0;
    }
}

module.exports = { countUserSessions, getUserSessionCount };
