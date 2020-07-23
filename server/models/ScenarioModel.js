// Mongoose database.
var mongoose = require('mongoose');

var ScenarioSchema = new mongoose.Schema({
    user_id: { type: mongoose.SchemaTypes.ObjectId, required: true },
    name: { type: String, default: 'New Scenario' },
    description: { type: String, default: '' },
    survey: { type: String, default: '/no-url-set.html' },
    vuex_state: { type: Object },
    created: { type: Date, default: Date.now }
}, { strict: 'throw', strictQuery: true });

var ScenarioModel = mongoose.model('Scenario', ScenarioSchema);
module.exports = ScenarioModel;