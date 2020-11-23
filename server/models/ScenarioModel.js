// Mongoose database.
const mongoose = require('mongoose');
const autopopulate = require('mongoose-autopopulate');
const ObjectId = mongoose.SchemaTypes.ObjectId;

// Warning!
// Changes to this file may render data inaccessible.
// Removing properties is not recommended.

const ScenarioSchema = new mongoose.Schema({
    // Required
    name:       { type: String, required: true },
    owner:      { type: ObjectId, ref: 'User', required: true, autopopulate: true },
    author:      { type: ObjectId, ref: 'User', autopopulate: true, immutable: true },

    // Default
    description: { type: String, default: '' },
    public:     { type: Boolean, default: false },
    readOnly:   { type: Boolean, default: false },
    created:    { type: Date, default: Date.now },
    modified:   { type: Date, default: Date.now },
    version:    { type: String, default: '1.0.0' },

    survey:     { type: String, default: '' },
    live:       { type: String, default: '' },

    numScenes:  { type: Number, default: 0 },
    scenes:     { type: Object, default: {} },
    frames:     { type: Object, default: {} },
    frameList:  { type: Array, default: [] },
    conditions: { type: Object, default: {} },
    conditionList: { type: Array, default: [] },
    tags:       { type: Object, default: {} },
    tagSets:    { type: Object, default: {} },
    tagSetList:    { type: Array, default: [] },
    assetList:  { type: Array, default: [] },
    status:     { type: Object },

}, { strict: 'throw', strictQuery: true, minimize: false });

ScenarioSchema.plugin(autopopulate);

ScenarioSchema.virtual('meta')
    .get(function () {
        return {
            id:         this._id,
            name:       this.name,
            // Do not return the full user object that includes its password.
            owner:      this.owner?.username,
            author:     this.author?.username,

            description: this.description,
            public:     this.public,
            readOnly:   this.readOnly,
            created:    this.created,
            modified:   this.modified,
            version:    this.version,

            survey:     this.survey,
            live:       this.live,
            assetList:  this.assetList
        };
    });


ScenarioSchema.virtual('data')
    .get(function () {
        return {
            id:         this._id,
            numScenes:  this.numScenes,
            scenes:     this.scenes,
            frames:     this.frames,
            frameList:  this.frameList,
            conditions: this.conditions,
            conditionList: this.conditionList,
            tags:       this.tags,
            tagSets:    this.tagSets,
            tagSetList: this.tagSetList,
            status:     this.status
        };
    });


const ScenarioModel = mongoose.model('Scenario', ScenarioSchema);
module.exports = ScenarioModel;
