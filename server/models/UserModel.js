// Mongoose database.
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({

    username:       { type: String, required: true, unique: true },
    password:       { type: String, required: true },
    email:          { type: String, required: true },
    profession:     { type: String, default: '' },
    affiliation:    { type: String, default: '' },
    addresses:      { type: Map, of: String, default: new Map() },
    permitAdmin:    { type: Boolean, default: false },
    permitHosting:  { type: Boolean, default: false },
    permitSharing:  { type: Boolean, default: false },
    permitUploads:  { type: Boolean, default: true },
    lastActive:     { type: Date, default: Date.now },

    created:    { type: Date, default: Date.now },
    modified:   { type: Date, default: Date.now },
    version:    { type: String, default: '1.0.0' },

}, { strict: 'throw', strictQuery: true, minimize: false });

const UserModel = mongoose.model('User', UserSchema);
module.exports = UserModel;
