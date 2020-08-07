// Mongoose database.
const mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({
    username: {type: String, required: true, unique: true},
    password: {type: String, required: true },
    email: {type: String, required: true},
    profession: {type: String, required: false},
    affiliation: {type: String, required: false},
    addresses: {type: Map, of: String, default: new Map()},
    created: {type: Date, default: Date.now}
}, {strict: 'throw', strictQuery: true, minimize: false });

var UserModel = mongoose.model('User', UserSchema);
module.exports = UserModel;

