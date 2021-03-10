/* Copyright (C) 2021 The Plea Justice Project
 *
 * Please see https://pleajustice.org for information about this project's
 * licensing and how you can make a contribution.
 */

// Mongoose database.
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({

    username:       { type: String, required: true, unique: true },
    password:       { type: String, required: true },
    email:          { type: String, required: true },
    fullname:       { type: String, default: '' },
    profession:     { type: String, default: '' },
    affiliation:    { type: String, default: '' },
    addresses:      { type: Map, of: String, default: new Map() },
    permitAdmin:    { type: Boolean, default: false },
    permitHosting:  { type: Boolean, default: false },
    permitSharing:  { type: Boolean, default: false },
    permitUploads:  { type: Boolean, default: false },
    lastActive:     { type: Date, default: Date.now },

    created:    { type: Date, default: Date.now },
    modified:   { type: Date, default: Date.now },
    version:    { type: String, default: '1.0.0' },

}, { strict: 'throw', strictQuery: true, minimize: false });

// ALWAYS use this accessor to retrieve the user's metadata.
// This avoids accidental leakage of the password field from the database.
UserSchema.virtual('meta')
    .get(function () {
        return {
            id:             this._id,
            name:           this.username,

            email:          this.email,
            fullname:       this.fullname,
            profession:     this.profession,
            affiliation:    this.affiliation,
            addresses:      Array.from(this.addresses.keys()).map(ip => ip.replace(/-/g, '.')),
            sessions:       this.addresses.size,

            permitAdmin:    this.permitAdmin,
            permitHosting:  this.permitHosting,
            permitSharing:  this.permitSharing,
            permitUploads:  this.permitUploads,

            lastActive:     this.lastActive,

            created:        this.created,
            modified:       this.modified,
            version:        this.version
        };
    });

const UserModel = mongoose.model('User', UserSchema);
module.exports = UserModel;
