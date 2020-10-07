// Mongoose database.
const mongoose = require('mongoose');

// Warning!
// Changes to this file may render data inaccessible.
// Removing properties is not recommended.

var ScenarioSchema = new mongoose.Schema({
    user_id: { type: mongoose.SchemaTypes.ObjectId, required: true },
    numScenes: { type: Number, default: 0 },
    name: { type: String, default: 'New Scenario' },
    description: { type: String, default: '' },
    survey: { type: String, default: 'no-url-set.html' },
    live: { type: String, default: '' },
    scenes: { type: Object, default: {} },
    frames: { type: Object, default: {} },
    frameList: { type: Array, default: [] },
    conditions: { type: Object, default: {} },
    conditionList: { type: Array, default: [] },
    status: { type: Object },
    public: { type: Boolean, default: false },
    readOnly: { type: Boolean, default: false },
    created: { type: Date, default: Date.now },
    modified: { type: Date, default: Date.now },
    version: { type: String, default: '1.0.0' }
}, { strict: 'throw', strictQuery: true, minimize: false });

var ScenarioModel = mongoose.model('Scenario', ScenarioSchema);
module.exports = ScenarioModel;