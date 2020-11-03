// Mongoose database.
const mongoose = require('mongoose');
const autopopulate = require('mongoose-autopopulate');
const ObjectId = mongoose.SchemaTypes.ObjectId;

// Warning!
// Changes to this file may render data inaccessible.
// Removing properties is not recommended.

const AssetSchema = new mongoose.Schema({
    // Required
    name:       { type: String, required: true },
    owner:      { type: ObjectId, ref: 'User', required: true, autopopulate: true },
    author:      { type: ObjectId, ref: 'User', autopopulate: true, immutable: true },

    path:       { type: String, required: true, immutable: true },
    type:       { type: String, required: true, immutable: true },

    // Default
    description: { type: String, default: '' },
    public:     { type: Boolean, default: false },
    readOnly:   { type: Boolean, default: false },
    created:    { type: Date, default: Date.now },
    modified:   { type: Date, default: Date.now },
    version:    { type: String, default: '1.0.0' },

}, { strict: 'throw', strictQuery: true, minimize: false });

AssetSchema.plugin(autopopulate);

AssetSchema.virtual('meta')
    .get(function () {
        return {
            id:         this._id,
            name:       this.name,
            owner:      this.owner?.username,
            author:     this.author?.username,

            description: this.description,
            public:     this.public,
            readOnly:   this.readOnly,
            created:    this.created,
            modified:   this.modified,
            version:    this.version,

            path:     this.path,
            type:       this.type
        };
    });


const AssetModel = mongoose.model('Asset', AssetSchema);
module.exports = AssetModel;
