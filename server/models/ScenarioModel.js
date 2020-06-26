// Mongoose database.
var mongoose = require('mongoose');

var SceneSchema = new mongoose.Schema({
    name: {type: String, required: true}
});

var FrameSchema = new mongoose.Schema({
    name: {type: String, required: true},
    conditions: [SceneSchema]
});

var ScenarioSchema = new mongoose.Schema({
    user_id: {type: mongoose.SchemaTypes.ObjectId, required: true},
    title: {type: String, required: true},
    description: {type: String},
    frames: {type: [FrameSchema]},
    vuex_state: {type: Object}
});

var ScenarioModel = mongoose.model('Scenario', ScenarioSchema);
module.exports = ScenarioModel;