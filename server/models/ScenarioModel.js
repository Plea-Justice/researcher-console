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

    // Default
    description: { type: String, default: '' },
    public:     { type: Boolean, default: false },
    readOnly:   { type: Boolean, default: false },
    created:    { type: Date, default: Date.now },
    modified:   { type: Date, default: Date.now },
    version:    { type: String, default: '1.0.0' },

    survey:     { type: String, default: 'no-url-set.html' },
    live:       { type: String, default: '' },

    numScenes:  { type: Number, default: 0 },
    scenes:     { type: Object, default: {} },
    frames:     { type: Object, default: {} },
    frameList:  { type: Array, default: [] },
    conditions: { type: Object, default: {} },
    conditionList: { type: Array, default: [] },
    status:     { type: Object },

}, { strict: 'throw', strictQuery: true, minimize: false });

ScenarioSchema.plugin(autopopulate);

ScenarioSchema.virtual('meta')
    .get(function () {
        return {
            id:         this._id,
            name:       this.name,
            owner:      this.owner.username,

            description: this.description,
            public:     this.public,
            readOnly:   this.readOnly,
            created:    this.created,
            modified:   this.modified,
            version:    this.version,

            survey:     this.survey,
            live:       this.live
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
            status:     this.status
        };
    });


const ScenarioModel = mongoose.model('Scenario', ScenarioSchema);
module.exports = ScenarioModel;
