// Mongoose database.
var mongoose = require('mongoose');

var ScenarioSchema = new mongoose.Schema({
    user_id: {type: mongoose.SchemaTypes.ObjectId, required: true},
    name: {type: String},
    description: {type: String},
    survey: {type: String},
    vuex_state: {type: Object}
});

var ScenarioModel = mongoose.model('Scenario', ScenarioSchema);
module.exports = ScenarioModel;