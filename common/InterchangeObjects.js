/**
 * Defines JSON objects for use in HTTP body between client and server.
 * A copy of this file also exists in the client.
 * 
 * See models/ScenarioModel.js for the equivalent database representation.
 */

module.exports = {
    Scenario: function (id, title, description, data) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.data = data || {
            frames: {},
            scenes: {},
            frameList: [],
            sceneList: [],
            conditionLengths: []
        };
    },
};

