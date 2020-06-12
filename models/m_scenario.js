// Mongoose database.
var mongoose = require('mongoose');

var ScenarioSchema = new mongoose.Schema({
    title: {type: String, required: true, unique: true},
    description: {type: String},
    conditions: {type: Array}
});

var Scenario = mongoose.model('Scenario', ScenarioSchema);
module.exports = Scenario;

