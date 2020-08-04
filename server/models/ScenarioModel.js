// Mongoose database.
const mongoose = require('mongoose');

// Warning!
// Changes to this file may render data inaccessible.
// Removing properties is not recommended.

var ScenarioSchema = new mongoose.Schema({
    user_id: { type: mongoose.SchemaTypes.ObjectId, required: true },
    numScenes: { type: Number },
    name: { type: String, default: 'New Scenario' },
    description: { type: String, default: '' },
    survey: { type: String, default: '/no-url-set.html' },
    scenes: { type: Object, default: {} },
    frames: { type: Object, default: {} },
    frameList: { type: Array, default: [] },
    created: { type: Date, default: Date.now }
}, { strict: 'throw', strictQuery: true, minimize: false });

var ScenarioModel = mongoose.model('Scenario', ScenarioSchema);
module.exports = ScenarioModel;