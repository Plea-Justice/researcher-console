// Mongoose database.
const mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({
    username: {type: String, required: true, unique: true},
    password: {type: String, required: true },
    email: {type: String, required: true},
    addresses: {type: Object},
    created: {type: Date, default: Date.now}
}, {strict: 'throw', strictQuery: true });

var UserModel = mongoose.model('User', UserSchema);
module.exports = UserModel;

