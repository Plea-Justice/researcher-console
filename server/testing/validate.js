const Ajv = require('ajv');
const ajv = new Ajv();
const schema = require('./schema');

const responseValidator = ajv.compile(schema.Response);
const objectIdValidator = ajv.compile(schema.ObjectId);
const userValidator = ajv.compile(schema.User);
const scenarioValidator = ajv.addSchema(schema.ScenarioMeta).compile(schema.Scenario);
const scenarioMetaValidator = ajv.compile(schema.ScenarioMeta);
const scenarioListValidator = ajv.compile(schema.ScenarioList);

module.exports = {

    Response: function (res) {
        if (responseValidator(res.body))
            return;
        throw Error(responseValidator.errors[0].message);
    },

    ObjectId: function (res) {
        if (objectIdValidator(res.body.result.id)) // TODO: id can be flattened to just result.
            return;
        throw Error(objectIdValidator.errors[0].message);
    },

    User: function (res) {
        if (userValidator(res.body.result.user)) // TODO: user can be flattened to just result.
            return;
        console.log(res.body.result.user);
        throw Error(userValidator.errors[0].message);
    },

    Scenario:  function (res) {
        if (scenarioValidator(res.body.result))
            return;
        throw Error(scenarioValidator.errors[0].message);
    },

    ScenarioMeta:  function (res) {
        if (scenarioMetaValidator(res.body.result))
            return;
        throw Error(scenarioMetaValidator.errors[0].message);
    },

    ScenarioList: function (res) {
        if (scenarioListValidator(res.body.result))
            return;
        throw Error(scenarioListValidator.errors[0].message);
    }


};
