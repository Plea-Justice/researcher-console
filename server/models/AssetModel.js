// Mongoose database.
const mongoose = require('mongoose');

// Warning!
// Changes to this file may render data inaccessible.
// Removing properties is not recommended.

var AssetSchema = new mongoose.Schema({
    user_id: { type: mongoose.SchemaTypes.ObjectId, required: true },
    owner: { type: String, required: true },
    path: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    type: { type: String, required: true },
    description: { type: String, default: '' },
    public: { type: Boolean, default: false },
    readOnly: { type: Boolean, default: false },
    created: { type: Date, default: Date.now },
    modified: { type: Date, default: Date.now },
    version: { type: String, default: '1.0.0' }
}, { strict: 'throw', strictQuery: true, minimize: false });

var AssetModel = mongoose.model('Asset', AssetSchema);
module.exports = AssetModel;